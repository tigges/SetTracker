/**
 * Display policy for the DJs directory.
 * Hearthis-category hobbyists are not stored as catalog work (see djCatalog).
 * Browse also hides thin / dupe / unresolvable profiles.
 */

export type DjBrowseSignals = {
  isJunk: boolean;
  hasHandle: boolean;
  setCount: number;
  /** Total plays across the DJ's linked sets (any idStatus). */
  playCount: number;
  /** Plays with status identified or community_resolved. */
  identifiedPlayCount: number;
  imageUrl: string | null;
};

/**
 * Ready for the default directory grid.
 * Requires a social/web handle, at least one set with a non-empty tracklist,
 * and artwork (no monogram-only profiles).
 */
export function isBrowseReadyDj(d: DjBrowseSignals): boolean {
  if (d.isJunk) return false;
  if (!d.hasHandle) return false;
  if (d.setCount < 1) return false;
  // Empty shells: set row exists but nothing parsed onto the timeline yet.
  if (d.playCount < 1) return false;
  if (!d.imageUrl?.trim()) return false;
  return true;
}
