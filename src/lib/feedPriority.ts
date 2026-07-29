/**
 * Transparent home-feed spotlight ordering.
 *
 * Within each age section (This week / Earlier) we float:
 *   1) Bass house selection — curated roster + SC shows tagged Bass House
 *   2) DJ Mag Top 100 primary artists (chart seed)
 * then leave everyone else in publishedAt order.
 *
 * Pagination stays chronological so old spotlight sets cannot starve fresh
 * non-spotlight uploads. Reasons are attached on FeedItem for card labels.
 */

import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import { normalizeGenre } from "./genre";
import { ARTIST_ROSTER_CURATED } from "./ingest/roster";
import { SOUNDCLOUD_SHOWS } from "./ingest/soundcloud/shows";
import { slugify } from "./ingest/types";

export type FeedSpotlight = "bass-house" | "top100";

export const FEED_SPOTLIGHT_META: Record<
  FeedSpotlight,
  { label: string; short: string; title: string }
> = {
  "bass-house": {
    short: "Bass house",
    label: "Bass house pick",
    title:
      "Bass house selection — curated roster/SC show artist, or set genre Bass House",
  },
  top100: {
    short: "Top 100",
    label: "DJ Mag Top 100",
    title: "Primary artist is on the DJ Mag Top 100 DJs 2025 chart",
  },
};

/** Lower rank sorts first. */
export function feedSpotlightRank(
  spotlight: FeedSpotlight | null | undefined,
): number {
  if (spotlight === "bass-house") return 0;
  if (spotlight === "top100") return 1;
  return 2;
}

let cachedBassHouse: Set<string> | null = null;
let cachedTop100: Map<string, number> | null = null;

/** Curated bass-house DJ slugs (explicit selection — not every Bass House genre row). */
export function bassHouseSelectionSlugs(): Set<string> {
  if (cachedBassHouse) return cachedBassHouse;
  const out = new Set<string>();
  for (const a of ARTIST_ROSTER_CURATED) {
    if (/^bass house$/i.test(a.genre.trim())) {
      out.add(slugify(a.name));
    }
  }
  for (const show of SOUNDCLOUD_SHOWS) {
    if (/^bass house$/i.test(show.genre.trim())) {
      out.add(show.primaryArtist.slug);
    }
  }
  cachedBassHouse = out;
  return out;
}

function top100Ranks(): Map<string, number> {
  if (!cachedTop100) cachedTop100 = loadDjMagTop100RankBySlug();
  return cachedTop100;
}

/**
 * Resolve a single transparent spotlight reason for a set.
 * Bass house selection wins when an artist is also on the Top 100.
 */
export function resolveFeedSpotlight(opts: {
  primaryDjSlug?: string | null;
  genre?: string | null;
}): { spotlight: FeedSpotlight | null; top100Rank: number | null } {
  const slug = opts.primaryDjSlug?.trim() || "";
  const rank = slug ? (top100Ranks().get(slug) ?? null) : null;
  const bassGenre = normalizeGenre(opts.genre) === "Bass House";
  const bassArtist = Boolean(slug && bassHouseSelectionSlugs().has(slug));

  if (bassArtist || bassGenre) {
    return { spotlight: "bass-house", top100Rank: rank };
  }
  if (rank != null) return { spotlight: "top100", top100Rank: rank };
  return { spotlight: null, top100Rank: null };
}

export type FeedPriorityFields = {
  spotlight?: FeedSpotlight | null;
  top100Rank?: number | null;
  publishedAt: Date | string;
};

/** Within an age section: spotlight tier → Top 100 chart rank → recency. */
export function compareFeedPriority(
  a: FeedPriorityFields,
  b: FeedPriorityFields,
): number {
  const tier = feedSpotlightRank(a.spotlight) - feedSpotlightRank(b.spotlight);
  if (tier !== 0) return tier;

  if (a.spotlight === "top100" || b.spotlight === "top100") {
    const ar = a.top100Rank ?? 999;
    const br = b.top100Rank ?? 999;
    if (ar !== br) return ar - br;
  }

  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}
