/**
 * Apply committed community ID resolutions onto catalog plays.
 * Source of truth: data/resolutions.json (survives seed wipes when re-applied
 * after every ingest / verify-urls in CI).
 *
 * Existing Played rows are flipped in place. Synthetic expected/talk slots
 * have no Played row — those insert one at the issue timestamp.
 */
import { readFileSync } from "fs";
import path from "path";
import type { PrismaClient } from "@prisma/client";
import { labelSocials } from "../social";
import { curatedLabelSlugByName } from "./curatedLabels";
import { parseTrackTitle } from "../trackMeta";
import { slugify } from "./types";

export type ResolutionRow = {
  setSlug: string;
  position: number;
  trackTitle: string;
  artistName: string;
  suggestedBy?: string;
  label?: string;
  /**
   * Cue offset in seconds, as printed in the Suggest ID issue.
   *
   * Prefer it over `position`. Set pages renumber plays for display
   * (numberPublished: talk rows become 0, the rest re-index from 1), so the
   * number a suggester sees is not Played.position unless nothing was collapsed
   * and the set has no talk rows. Timestamps are not rewritten, so they match.
   */
  timestamp?: number;
};

export type ResolutionStats = {
  scanned: number;
  applied: number;
  /** Subset of `applied` that created a Played row (synthetic expected/talk slots). */
  inserted: number;
  skipped: number;
  missing: number;
};

export type ResolutionPlayRef = {
  position: number;
  timestamp: number;
};

export type ResolutionPlan =
  | { kind: "update"; by: "timestamp" | "position" }
  | { kind: "insert"; timestamp: number }
  | { kind: "missing" };

/**
 * How a Suggest ID row addresses the catalog.
 *
 * Timestamp first: set pages rewrite `position` for display, so a display
 * index can name a different real cue. When the clock is present and no
 * Played row exists there, insert — do **not** fall back to position. That
 * fallback is how a synthetic expected-slot suggestion mislabels a real
 * play that happens to share the display index.
 *
 * Position-only matching stays for legacy snippets that never printed a clock.
 */
export function planResolution(
  row: Pick<ResolutionRow, "position" | "timestamp">,
  plays: ResolutionPlayRef[],
): ResolutionPlan {
  if (Number.isInteger(row.timestamp) && (row.timestamp as number) >= 0) {
    if (plays.some((p) => p.timestamp === row.timestamp)) {
      return { kind: "update", by: "timestamp" };
    }
    return { kind: "insert", timestamp: row.timestamp as number };
  }
  if (plays.some((p) => p.position === row.position)) {
    return { kind: "update", by: "position" };
  }
  return { kind: "missing" };
}

function loadResolutions(): ResolutionRow[] {
  const file = path.join(process.cwd(), "data/resolutions.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as ResolutionRow[];
  return raw.filter(
    (r) =>
      r &&
      r.setSlug &&
      r.setSlug !== "example-do-not-apply" &&
      !String(r.setSlug).startsWith("example") &&
      r.trackTitle &&
      r.artistName &&
      Number.isFinite(r.position),
  );
}

export async function applyResolutions(
  prisma: PrismaClient,
): Promise<ResolutionStats> {
  return applyResolutionRows(prisma, loadResolutions());
}

export async function applyResolutionRows(
  prisma: PrismaClient,
  rows: ResolutionRow[],
): Promise<ResolutionStats> {
  const stats: ResolutionStats = {
    scanned: rows.length,
    applied: 0,
    inserted: 0,
    skipped: 0,
    missing: 0,
  };

  for (const row of rows) {
    const set = await prisma.set.findUnique({ where: { slug: row.setSlug } });
    if (!set) {
      stats.missing += 1;
      continue;
    }
    const catalog = await prisma.played.findMany({
      where: { setId: set.id },
      select: { id: true, position: true, timestamp: true, idStatus: true },
    });
    const plan = planResolution(row, catalog);
    if (plan.kind === "missing") {
      stats.missing += 1;
      continue;
    }

    const play =
      plan.kind === "update"
        ? await prisma.played.findFirst({
            where:
              plan.by === "timestamp"
                ? { setId: set.id, timestamp: row.timestamp }
                : { setId: set.id, position: row.position },
            include: { idTrack: true },
          })
        : null;
    if (plan.kind === "update" && !play) {
      stats.missing += 1;
      continue;
    }
    if (
      play &&
      (play.idStatus === "community_resolved" || play.idStatus === "identified")
    ) {
      stats.skipped += 1;
      continue;
    }

    let track = await prisma.track.findFirst({
      where: { title: row.trackTitle, artistName: row.artistName },
    });
    if (!track) {
      let labelId: string | null = null;
      if (row.label) {
        // Curated imprints pin a slug that slugify(name) does not reproduce
        // ("Black Book Records" -> blackbook), so a plain slugify here would
        // create a second row for the same label and split its releases.
        const slug = curatedLabelSlugByName(row.label) ?? slugify(row.label);
        const label =
          (await prisma.label.findUnique({ where: { slug } })) ??
          (await prisma.label.create({
            data: { slug, name: row.label, ...labelSocials(row.label) },
          }));
        labelId = label.id;
      }
      const parsed = parseTrackTitle(row.trackTitle);
      const { allocateTrackSlug } = await import("../tracks/slug");
      const trackSlug = await allocateTrackSlug(
        row.artistName,
        row.trackTitle,
        async (candidate) => {
          const hit = await prisma.track.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });
          return !!hit;
        },
      );
      track = await prisma.track.create({
        data: {
          slug: trackSlug,
          title: row.trackTitle,
          artistName: row.artistName,
          labelId,
          mixName: parsed.mixName,
          remixerName: parsed.remixerName,
        },
      });
    } else if (!track.mixName || !track.remixerName) {
      const parsed = parseTrackTitle(row.trackTitle);
      const data: { mixName?: string; remixerName?: string } = {};
      if (parsed.mixName && !track.mixName) data.mixName = parsed.mixName;
      if (parsed.remixerName && !track.remixerName) data.remixerName = parsed.remixerName;
      if (Object.keys(data).length > 0) {
        track = await prisma.track.update({ where: { id: track.id }, data });
      }
    }

    let idTrackId = play?.idTrackId ?? null;
    if (idTrackId) {
      await prisma.idTrack.update({
        where: { id: idTrackId },
        data: {
          status: "community_resolved",
          resolvedTrackId: track.id,
          note: row.suggestedBy
            ? `Suggested by ${row.suggestedBy}`
            : play?.idTrack?.note,
        },
      });
    } else {
      const idTrack = await prisma.idTrack.create({
        data: {
          label: play?.rawText ?? `${row.artistName} - ID`,
          status: "community_resolved",
          resolvedTrackId: track.id,
          note: row.suggestedBy ? `Suggested by ${row.suggestedBy}` : null,
        },
      });
      idTrackId = idTrack.id;
    }

    if (play) {
      await prisma.played.update({
        where: { id: play.id },
        data: {
          idStatus: "community_resolved",
          provenance: "community",
          trackId: track.id,
          idTrackId,
        },
      });
    } else if (plan.kind === "insert") {
      // Synthetic expected/talk slots have no Played row. The issue's clock is
      // the address — next free position avoids colliding with a real cue that
      // happens to share the display index.
      const nextPosition =
        catalog.reduce((max, p) => Math.max(max, p.position), 0) + 1;
      await prisma.played.create({
        data: {
          setId: set.id,
          position: nextPosition,
          timestamp: plan.timestamp,
          idStatus: "community_resolved",
          provenance: "community",
          rawText: `${row.artistName} - ID`,
          trackId: track.id,
          idTrackId,
        },
      });
      stats.inserted += 1;
    } else {
      stats.missing += 1;
      continue;
    }
    stats.applied += 1;
    console.log(
      `[resolutions] ${row.setSlug}@${row.timestamp ?? row.position}s → ${row.artistName} – ${row.trackTitle}${play ? "" : " (inserted)"}`,
    );
  }

  return stats;
}
