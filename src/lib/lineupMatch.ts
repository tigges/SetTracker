import { canonicalDjSlug } from "@/lib/ingest/djSlugAliases";
import { slugify } from "@/lib/ingest/types";

export type CatalogArtist = {
  slug: string;
  name: string;
  imageUrl?: string | null;
  accent?: string | null;
};

export type LineupName = {
  name: string;
  slug: string | null;
  imageUrl?: string | null;
  accent?: string | null;
};

/** Brand / residency suffixes that hide the billed DJ. */
const TITLE_NOISE =
  /\s+(?:presents|pres\.?|live|open to close|residency|all night long)\b.*$/i;
const AT_OR_DASH = /\s+(?:@|[-–—])\s+.+$/;

/** Index catalog DJs by slug, slugified display name, and alias folds. */
export function catalogArtistIndex(
  rows: CatalogArtist[],
): Map<string, CatalogArtist> {
  const map = new Map<string, CatalogArtist>();
  for (const r of rows) {
    const put = (key: string) => {
      if (key && !map.has(key)) map.set(key, r);
    };
    put(r.slug);
    put(canonicalDjSlug(r.slug));
    put(slugify(r.name));
  }
  return map;
}

/** Keys to try when matching a calendar bill or night title. */
export function lineupLookupKeys(name: string): string[] {
  const raw = name.trim();
  if (!raw) return [];
  const keys: string[] = [];
  const add = (value: string) => {
    const key = slugify(value);
    if (key && !keys.includes(key)) keys.push(key);
    const folded = key ? canonicalDjSlug(key) : "";
    if (folded && !keys.includes(folded)) keys.push(folded);
  };
  add(raw);
  add(raw.replace(TITLE_NOISE, ""));
  add(raw.replace(AT_OR_DASH, ""));
  return keys;
}

function catalogHit(
  key: string,
  catalog: Map<string, CatalogArtist>,
): CatalogArtist | undefined {
  return catalog.get(key) ?? catalog.get(canonicalDjSlug(key));
}

function toLineupName(name: string, hit?: CatalogArtist): LineupName {
  if (!hit) return { name, slug: null, imageUrl: null, accent: null };
  return {
    name,
    slug: hit.slug,
    imageUrl: hit.imageUrl ?? null,
    accent: hit.accent ?? null,
  };
}

/** Link a calendar bill name when it matches a catalog DJ. */
export function matchLineupName(
  name: string,
  catalog: Map<string, CatalogArtist>,
): LineupName {
  for (const key of lineupLookupKeys(name)) {
    const hit = catalogHit(key, catalog);
    if (hit) return toLineupName(name, hit);
  }
  return toLineupName(name);
}

/** First catalog DJ for a night — title (headliner) wins, then the bill. */
export function nightHeadliner(
  title: string,
  artists: LineupName[],
  catalog?: Map<string, CatalogArtist>,
): LineupName | null {
  if (catalog) {
    const fromTitle = matchLineupName(title, catalog);
    if (fromTitle.slug) return fromTitle;
  }
  return artists.find((a) => a.slug) ?? null;
}

/** True when a venue-night artist list (or title) mentions this DJ. */
export function nightMentionsDj(
  artists: string[],
  dj: { slug: string; name: string },
  title?: string,
): boolean {
  const keys = new Set(
    [dj.slug, slugify(dj.name), canonicalDjSlug(dj.slug)].filter(
      (k): k is string => Boolean(k),
    ),
  );
  const names = title ? [title, ...artists] : artists;
  return names.some((a) =>
    lineupLookupKeys(a).some((k) => keys.has(k) || keys.has(canonicalDjSlug(k))),
  );
}
