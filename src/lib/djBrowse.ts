/**
 * Display policy for the DJs directory.
 * Hearthis-category hobbyists are not stored as catalog work (see djCatalog).
 * Browse also hides thin / dupe / unresolvable profiles.
 */

import { usableImageUrl } from "./thumbs/usableImage";

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
  if (!usableImageUrl(d.imageUrl)) return false;
  return true;
}

/**
 * Search can surface a DJ that is not directory-ready: a pin/handle or at
 * least one set. Junk and hearthis-hobbyist rows stay hidden.
 */
export function isSearchableDj(
  d: DjBrowseSignals & { isLowSignal?: boolean },
): boolean {
  if (d.isJunk) return false;
  if (d.isLowSignal) return false;
  return d.hasHandle || d.setCount >= 1;
}
