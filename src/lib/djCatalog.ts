/**
 * Who is worth operator time / a public DJ profile.
 * Hearthis category crawl leaked hobbyist radio DJs (Harlemoverdrive).
 * Those are not catalog acts — hide from Stats and delete on verify-urls.
 */

import { DJ_SOCIAL_PINS } from "./ingest/djSocialPins.data";
import { HEARTHIS_ARTISTS } from "./ingest/hearthis/artists";
import { HEARTHIS_TRACKS } from "./ingest/hearthis/tracks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import { wishlistDefaultSlugs } from "./wishlist";

export type SetCatalogSignal = {
  sourceName?: string | null;
  sourceUrl?: string | null;
  type?: string | null;
  eventKind?: string | null;
};

const CURATED_SLUGS = new Set<string>([
  ...DJ_SOCIAL_PINS.map((p) => p.slug),
  ...wishlistDefaultSlugs(),
  ...HEARTHIS_ARTISTS.map((a) => a.primaryArtist.slug).filter(
    (s): s is string => Boolean(s),
  ),
  ...HEARTHIS_TRACKS.map((t) => t.primaryArtist.slug).filter(
    (s): s is string => Boolean(s),
  ),
]);

export function isCuratedCatalogSlug(slug: string): boolean {
  return CURATED_SLUGS.has(slug.trim().toLowerCase());
}

export function isHearthisSource(s: SetCatalogSignal): boolean {
  if (/hearthis/i.test(s.sourceName ?? "")) return true;
  if (s.sourceName?.trim()) return false;
  return /hearthis\.at/i.test(s.sourceUrl ?? "");
}

export function isFestivalOrClubSet(s: SetCatalogSignal): boolean {
  if (s.type === "festival" || s.type === "club") return true;
  return s.eventKind === "festival" || s.eventKind === "club";
}

/** Every linked set is a hearthis mix with no festival/club host. */
export function isHearthisOnlyLeak(sets: SetCatalogSignal[]): boolean {
  if (sets.length === 0) return false;
  return sets.every((s) => isHearthisSource(s) && !isFestivalOrClubSet(s));
}

/**
 * True when Stats / LLM / /djs should spend time on this person.
 * Curated pins, hearthis artist seeds, and Top 100 stay even if hearthis-only.
 */
export function isCatalogWorkDj(d: {
  slug: string;
  isTop100?: boolean;
  sets: SetCatalogSignal[];
}): boolean {
  if (isCuratedCatalogSlug(d.slug)) return true;
  if (d.isTop100) return true;
  return !isHearthisOnlyLeak(d.sets);
}

export function isTop100DjSlug(slug: string): boolean {
  return loadDjMagTop100RankBySlug().has(slug);
}
