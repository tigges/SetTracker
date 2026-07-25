import type { PrismaClient } from "@prisma/client";
import { slugify } from "../types";
import type { CandidateEvidence } from "./types";

export type CoplayHit = {
  name: string;
  slug: string;
  playCount: number;
  setCount: number;
  remixerCount: number;
  score: number;
  evidence: CandidateEvidence[];
};

const NOISE =
  /^(id|various artists?|unknown|va|edit|original mix|extended mix|radio edit)$/i;

/**
 * Rank track-level artists / remixers appearing on mapped sets.
 * Excludes names already present as SetArtist for every set they appear on
 * is too strict — instead callers pass an exclude slug set (known seeds).
 */
export async function rankCoplayArtists(
  prisma: PrismaClient,
  opts: {
    excludeSlugs?: Set<string>;
    minPlays?: number;
    limit?: number;
  } = {},
): Promise<CoplayHit[]> {
  const minPlays = opts.minPlays ?? 2;
  const limit = opts.limit ?? 40;
  const exclude = opts.excludeSlugs ?? new Set<string>();

  const plays = await prisma.played.findMany({
    where: {
      idStatus: { in: ["identified", "community_resolved"] },
      trackId: { not: null },
    },
    select: {
      setId: true,
      track: {
        select: { artistName: true, remixerName: true },
      },
    },
  });

  type Acc = {
    name: string;
    playSets: Set<string>;
    plays: number;
    remixerPlays: number;
  };
  const bySlug = new Map<string, Acc>();

  function touch(name: string, setId: string, asRemixer: boolean) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2 || NOISE.test(trimmed)) return;
    // Split "A, B" / "A & B" lightly for co-credits on tracks
    const parts = trimmed
      .split(/\s*(?:,|&| x | feat\.? | ft\.? )\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts.length ? parts : [trimmed]) {
      if (NOISE.test(part) || part.length < 2) continue;
      const slug = slugify(part);
      if (!slug || exclude.has(slug)) continue;
      let acc = bySlug.get(slug);
      if (!acc) {
        acc = { name: part, playSets: new Set(), plays: 0, remixerPlays: 0 };
        bySlug.set(slug, acc);
      }
      acc.plays += 1;
      acc.playSets.add(setId);
      if (asRemixer) acc.remixerPlays += 1;
    }
  }

  for (const p of plays) {
    if (!p.track) continue;
    touch(p.track.artistName, p.setId, false);
    if (p.track.remixerName) touch(p.track.remixerName, p.setId, true);
  }

  const hits: CoplayHit[] = [];
  for (const [slug, acc] of bySlug) {
    if (acc.plays < minPlays) continue;
    const setCount = acc.playSets.size;
    const score = acc.plays * 2 + setCount * 5 + acc.remixerPlays * 3;
    const evidence: CandidateEvidence[] = [
      {
        kind: "coplay",
        detail: `${acc.plays} plays across ${setCount} sets`,
        weight: score,
      },
    ];
    if (acc.remixerPlays > 0) {
      evidence.push({
        kind: "remixer",
        detail: `${acc.remixerPlays} remixer credits`,
        weight: acc.remixerPlays * 3,
      });
    }
    hits.push({
      name: acc.name,
      slug,
      playCount: acc.plays,
      setCount,
      remixerCount: acc.remixerPlays,
      score,
      evidence,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return hits.slice(0, limit);
}
