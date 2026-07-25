/**
 * Apply committed community ID resolutions onto unresolved/unparsed plays.
 * Source of truth: data/resolutions.json (survives seed wipes when re-applied
 * after every ingest in CI).
 */
import { readFileSync } from "fs";
import path from "path";
import type { PrismaClient } from "@prisma/client";
import { labelSocials } from "../social";
import { parseTrackTitle } from "../trackMeta";
import { slugify } from "./types";

export type ResolutionRow = {
  setSlug: string;
  position: number;
  trackTitle: string;
  artistName: string;
  suggestedBy?: string;
  label?: string;
};

export type ResolutionStats = {
  scanned: number;
  applied: number;
  skipped: number;
  missing: number;
};

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
  const rows = loadResolutions();
  const stats: ResolutionStats = {
    scanned: rows.length,
    applied: 0,
    skipped: 0,
    missing: 0,
  };

  for (const row of rows) {
    const set = await prisma.set.findUnique({ where: { slug: row.setSlug } });
    if (!set) {
      stats.missing += 1;
      continue;
    }
    const play = await prisma.played.findFirst({
      where: { setId: set.id, position: row.position },
      include: { idTrack: true },
    });
    if (!play) {
      stats.missing += 1;
      continue;
    }
    if (play.idStatus === "community_resolved" || play.idStatus === "identified") {
      stats.skipped += 1;
      continue;
    }

    let track = await prisma.track.findFirst({
      where: { title: row.trackTitle, artistName: row.artistName },
    });
    if (!track) {
      let labelId: string | null = null;
      if (row.label) {
        const slug = slugify(row.label);
        const label =
          (await prisma.label.findUnique({ where: { slug } })) ??
          (await prisma.label.create({
            data: { slug, name: row.label, ...labelSocials(row.label) },
          }));
        labelId = label.id;
      }
      const parsed = parseTrackTitle(row.trackTitle);
      track = await prisma.track.create({
        data: {
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

    let idTrackId = play.idTrackId;
    if (idTrackId) {
      await prisma.idTrack.update({
        where: { id: idTrackId },
        data: {
          status: "community_resolved",
          resolvedTrackId: track.id,
          note: row.suggestedBy
            ? `Suggested by ${row.suggestedBy}`
            : play.idTrack?.note,
        },
      });
    } else {
      const idTrack = await prisma.idTrack.create({
        data: {
          label: play.rawText ?? `${row.artistName} - ID`,
          status: "community_resolved",
          resolvedTrackId: track.id,
          note: row.suggestedBy ? `Suggested by ${row.suggestedBy}` : null,
        },
      });
      idTrackId = idTrack.id;
    }

    await prisma.played.update({
      where: { id: play.id },
      data: {
        idStatus: "community_resolved",
        provenance: "community",
        trackId: track.id,
        idTrackId,
      },
    });
    stats.applied += 1;
    console.log(
      `[resolutions] ${row.setSlug}#${row.position} → ${row.artistName} – ${row.trackTitle}`,
    );
  }

  return stats;
}
