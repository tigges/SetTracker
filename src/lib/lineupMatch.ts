import { slugify } from "@/lib/ingest/types";

export type LineupName = {
  name: string;
  slug: string | null;
};

/** Index catalog DJs by slug and slugified display name. */
export function catalogArtistIndex(
  rows: Array<{ slug: string; name: string }>,
): Map<string, { slug: string; name: string }> {
  const map = new Map<string, { slug: string; name: string }>();
  for (const r of rows) {
    map.set(r.slug, r);
    const nameKey = slugify(r.name);
    if (nameKey && !map.has(nameKey)) map.set(nameKey, r);
  }
  return map;
}

/** Link a calendar bill name when it matches a catalog DJ. */
export function matchLineupName(
  name: string,
  catalog: Map<string, { slug: string; name: string }>,
): LineupName {
  const key = slugify(name);
  const hit = key ? catalog.get(key) : undefined;
  return { name, slug: hit?.slug ?? null };
}

/** True when a venue-night artist list mentions this DJ. */
export function nightMentionsDj(
  artists: string[],
  dj: { slug: string; name: string },
): boolean {
  const keys = new Set(
    [dj.slug, slugify(dj.name)].filter((k): k is string => Boolean(k)),
  );
  return artists.some((a) => keys.has(slugify(a)));
}
