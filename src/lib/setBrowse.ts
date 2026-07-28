/**
 * Display policy for set cards / home feed.
 * Ingest may store sets before artwork resolves; browse hides monogram-only tiles
 * and sets whose primary credit is a mix-title / junk "DJ".
 */

import { isJunkArtistName } from "./artistName";

export type SetBrowseSignals = {
  /** Set cover URL (preferred). */
  imageUrl: string | null | undefined;
  /** Primary DJ portrait — acceptable fallback for the card thumb. */
  primaryDjImageUrl?: string | null | undefined;
  /** Primary DJ display name — reject mix-channel titles as artists. */
  primaryDjName?: string | null | undefined;
};

/** Effective thumbnail used by SetCard (set cover, else primary DJ art). */
export function setDisplayThumb(s: SetBrowseSignals): string | null {
  const cover = s.imageUrl?.trim() || null;
  if (cover) return cover;
  const dj = s.primaryDjImageUrl?.trim() || null;
  return dj;
}

/** Ready for the home feed / set grids — must have a real image URL. */
export function isBrowseReadySet(s: SetBrowseSignals): boolean {
  if (s.primaryDjName && isJunkArtistName(s.primaryDjName)) return false;
  return setDisplayThumb(s) != null;
}
