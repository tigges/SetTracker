/**
 * Display policy for set cards / home feed.
 * Ingest may store sets before artwork resolves; browse hides monogram-only tiles
 * and sets whose primary credit is a mix-title / junk "DJ".
 * Brand hosts (Insomniac, Defected TV, …) are series/event content — not junk
 * blockers when series/event art (or set cover) is present.
 */

import { isJunkArtistName } from "./artistName";
import { isBrandHostSlug } from "./brandHosts";

export type SetBrowseSignals = {
  /** Set cover URL (preferred). */
  imageUrl: string | null | undefined;
  /** Primary DJ portrait — acceptable fallback for the card thumb. */
  primaryDjImageUrl?: string | null | undefined;
  /** Venue / event artwork fallback for brand-hosted sets. */
  eventImageUrl?: string | null | undefined;
  /** Primary DJ display name — reject mix-channel titles as artists. */
  primaryDjName?: string | null | undefined;
  /** Primary DJ slug — brand hosts are allowed when host art exists. */
  primaryDjSlug?: string | null | undefined;
};

/** Effective thumbnail used by SetCard (set cover, else DJ, else event). */
export function setDisplayThumb(s: SetBrowseSignals): string | null {
  const cover = s.imageUrl?.trim() || null;
  if (cover) return cover;
  const dj = s.primaryDjImageUrl?.trim() || null;
  if (dj) return dj;
  return s.eventImageUrl?.trim() || null;
}

/** Ready for the home feed / set grids — must have a real image URL. */
export function isBrowseReadySet(s: SetBrowseSignals): boolean {
  const brandHost = isBrandHostSlug(s.primaryDjSlug);
  if (
    !brandHost &&
    s.primaryDjName &&
    isJunkArtistName(s.primaryDjName)
  ) {
    return false;
  }
  return setDisplayThumb(s) != null;
}
