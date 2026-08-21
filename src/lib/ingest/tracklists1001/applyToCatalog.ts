/**
 * Apply curated 1001 clocks to sets already in the catalog.
 * Pages verify-urls runs this so a 1001-only ship does not poll YouTube/SC.
 */

import type { PrismaClient } from "@prisma/client";
import { collapseConsecutivePlays, playCollapseKey } from "../../playCollapse";
import { allocateTrackSlug, trackSlugBase } from "../../tracks/slug";
import type { RawPlay } from "../types";
import {
  applyTracklist1001Seed,
  TRACKLIST_1001_BY_SOURCE_SLUG,
} from "./seeds";

export function seedNeedsCatalogRefresh(
  stored1001: number,
  seedLength: number,
): boolean {
  return seedLength >= 5 && stored1001 < seedLength;
}

function normalizeArtistName(name: string): string {
  return name.replace(/H[øöØÖ]rger/g, "Horger").replace(/\s+/g, " ").trim();
}

function playedToRaw(row: {
  position: number;
  timestamp: number;
  provenance: string;
  idStatus: string;
  rawText: string | null;
  track: { title: string; artistName: string } | null;
}): RawPlay {
  return {
    position: row.position,
    timestamp: row.timestamp,
    provenance: row.provenance as RawPlay["provenance"],
    idStatus: row.idStatus as RawPlay["idStatus"],
    trackTitle: row.track?.title,
    artistName: row.track?.artistName,
    rawText: row.rawText ?? undefined,
  };
}

async function upsertTrack(
  prisma: PrismaClient,
  title: string,
  artistName: string,
): Promise<string> {
  const artist = normalizeArtistName(artistName);
  const existing = await prisma.track.findFirst({
    where: { title, artistName: artist },
    select: { id: true },
  });
  if (existing) return existing.id;
  const slug = await allocateTrackSlug(
    artist,
    title,
    async (candidate) => {
      const hit = await prisma.track.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return !!hit;
    },
    trackSlugBase(artist, title),
  );
  const created = await prisma.track.create({
    data: { slug, title, artistName: artist },
  });
  return created.id;
}

async function writePlays(
  prisma: PrismaClient,
  setId: string,
  plays: RawPlay[],
): Promise<void> {
  const collapsed = collapseConsecutivePlays(plays, (p) =>
    playCollapseKey({
      artistName: p.artistName,
      title: p.trackTitle,
    }),
  ).map((p, i) => ({ ...p, position: i + 1 }));

  await prisma.played.deleteMany({ where: { setId } });
  for (const p of collapsed) {
    const base = {
      setId,
      position: p.position,
      timestamp: p.timestamp,
      provenance: p.provenance,
      idStatus: p.idStatus,
    };
    if (
      (p.idStatus === "identified" || p.idStatus === "community_resolved") &&
      p.trackTitle &&
      p.artistName
    ) {
      const trackId = await upsertTrack(prisma, p.trackTitle, p.artistName);
      await prisma.played.create({
        data: {
          ...base,
          trackId,
          rawText: p.rawText ?? `${p.artistName} - ${p.trackTitle}`,
        },
      });
      continue;
    }
    await prisma.played.create({
      data: {
        ...base,
        idStatus: p.idStatus === "unresolved_id" ? "unresolved_id" : "unparsed",
        rawText: p.rawText ?? p.idLabel ?? null,
      },
    });
  }
}

export async function applyCatalog1001Seeds(prisma: PrismaClient): Promise<{
  scanned: number;
  refreshed: number;
  missing: number;
}> {
  const slugs = Object.keys(TRACKLIST_1001_BY_SOURCE_SLUG);
  const sets = await prisma.set.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(sets.map((s) => [s.slug, s]));

  let scanned = 0;
  let refreshed = 0;
  let missing = 0;

  for (const slug of slugs) {
    const seed = TRACKLIST_1001_BY_SOURCE_SLUG[slug];
    if (!seed?.length) continue;
    const set = bySlug.get(slug);
    if (!set) {
      missing += 1;
      continue;
    }
    scanned += 1;
    const stored1001 = await prisma.played.count({
      where: { setId: set.id, provenance: "1001tl" },
    });
    if (!seedNeedsCatalogRefresh(stored1001, seed.length)) continue;

    const existing = await prisma.played.findMany({
      where: { setId: set.id },
      include: { track: { select: { title: true, artistName: true } } },
      orderBy: { position: "asc" },
    });
    const merged = applyTracklist1001Seed(slug, existing.map(playedToRaw));
    const next1001 = merged.filter((p) => p.provenance === "1001tl").length;
    if (next1001 <= stored1001) continue;

    await writePlays(prisma, set.id, merged);
    refreshed += 1;
    console.log(
      `[verify-urls] 1001 overlay ${slug} ${stored1001} → ${next1001}`,
    );
  }

  return { scanned, refreshed, missing };
}
