/**
 * Retired source slugs → current host IDs.
 *
 * Official YouTube playbacks get replaced (private / taken down). Ingest keys sets as
 * `yt-{videoId}`, so a new upload would otherwise fork a duplicate row and
 * leave the old URL 404 / "Video unavailable".
 */

import type { PrismaClient } from "@prisma/client";

export type SetSourceRemap = {
  fromSlug: string;
  toSlug: string;
  sourceUrl: string;
  playbackUrl?: string;
  note?: string;
};

export const SET_SOURCE_REMAPS: SetSourceRemap[] = [
  {
    fromSlug: "yt-mVB-gqggrCQ",
    toSlug: "yt-Uq1WP8v3U4o",
    sourceUrl: "https://www.youtube.com/watch?v=Uq1WP8v3U4o",
    playbackUrl: "https://www.youtube.com/watch?v=Uq1WP8v3U4o",
    note: "Tomorrowland replaced the private Fisher Freedom WE2 Relive (2026-08-12).",
  },
  {
    fromSlug: "sc-innellea-colyn-b2b-innella-at-ultra",
    toSlug: "yt-2BPWWYAgUE4",
    sourceUrl: "https://youtu.be/2BPWWYAgUE4",
    playbackUrl: "https://youtu.be/2BPWWYAgUE4",
    note: "Same Resistance Cove night as official YT. SC permalink spells innella — fold so /stats and /capture-1001 list one set.",
  },
]

export const SET_SLUG_ALIASES: Record<string, string> = Object.fromEntries(
  SET_SOURCE_REMAPS.map((r) => [r.fromSlug, r.toSlug]),
);

export function resolveSetSlug(slug: string): string {
  return SET_SLUG_ALIASES[slug] ?? slug;
}

export function previousSlugsFor(toSlug: string): string[] {
  return SET_SOURCE_REMAPS.filter((r) => r.toSlug === toSlug).map(
    (r) => r.fromSlug,
  );
}

/** Include retired slugs so /sets/{oldId}/ still statically exports. */
export function aliasSlugsFor(slugs: string[]): string[] {
  const have = new Set(slugs);
  const extra: string[] = [];
  for (const r of SET_SOURCE_REMAPS) {
    if (have.has(r.toSlug) || have.has(r.fromSlug)) extra.push(r.fromSlug);
  }
  return [...new Set([...slugs, ...extra])];
}

export async function applySetSourceRemaps(
  prisma: PrismaClient,
  extra: SetSourceRemap[] = [],
): Promise<number> {
  let n = 0;
  const seen = new Set<string>();
  const list = [...SET_SOURCE_REMAPS, ...extra].filter((r) => {
    const k = `${r.fromSlug}→${r.toSlug}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  for (const r of list) {
    const from = await prisma.set.findUnique({ where: { slug: r.fromSlug } });
    const to = await prisma.set.findUnique({ where: { slug: r.toSlug } });
    const urls = {
      sourceUrl: r.sourceUrl,
      playbackUrl: r.playbackUrl ?? r.sourceUrl,
    };
    if (from && !to) {
      await prisma.set.update({
        where: { id: from.id },
        data: { slug: r.toSlug, ...urls },
      });
      n += 1;
      continue;
    }
    if (from && to && from.id !== to.id) {
      await prisma.set.update({
        where: { id: to.id },
        data: urls,
      });
      await prisma.played.deleteMany({ where: { setId: from.id } });
      await prisma.setArtist.deleteMany({ where: { setId: from.id } });
      await prisma.set.delete({ where: { id: from.id } });
      n += 1;
      continue;
    }
    if (to) {
      const patch: { sourceUrl?: string; playbackUrl?: string } = {};
      if (to.sourceUrl !== urls.sourceUrl) patch.sourceUrl = urls.sourceUrl;
      if (to.playbackUrl !== urls.playbackUrl) {
        patch.playbackUrl = urls.playbackUrl;
      }
      if (Object.keys(patch).length) {
        await prisma.set.update({ where: { id: to.id }, data: patch });
        n += 1;
      }
    }
  }
  return n;
}
