/**
 * Display policy for set cards / home feed.
 * Ingest may store sets before artwork resolves; browse hides monogram-only tiles.
 */

export type SetBrowseSignals = {
  /** Set cover URL (preferred). */
  imageUrl: string | null | undefined;
  /** Primary DJ portrait — acceptable fallback for the card thumb. */
  primaryDjImageUrl?: string | null | undefined;
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
  return setDisplayThumb(s) != null;
}
