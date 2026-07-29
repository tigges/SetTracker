/**
 * hearthis.at house-family categories to poll.
 * Category ids match https://api-v2.hearthis.at/categories/
 */

export type HearthisCategory = {
  id: string;
  /** Default genre label when the upload omits one */
  genre: string;
};

export const HEARTHIS_HOUSE_CATEGORIES: HearthisCategory[] = [
  { id: "house", genre: "House" },
  { id: "techhouse", genre: "Tech House" },
  { id: "deephouse", genre: "Deep House" },
  { id: "progressivehouse", genre: "Progressive House" },
  { id: "organichouse", genre: "Organic House" },
];

/** Minimum mix length to treat as a set. */
export const HEARTHIS_MIN_DURATION_SEC = 25 * 60;

/**
 * Cap hearthis sets per ingest run (Pages build budget).
 * Prefer uploads that already carry a tracklist signal.
 */
/** Niche supplement — keep low so SC/YT dominate discovery volume. */
export const HEARTHIS_MAX_SETS = Number(process.env.HEARTHIS_MAX_SETS ?? 12);
