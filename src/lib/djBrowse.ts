/**
 * Display policy for the DJs directory.
 * Ingest still stores every discovered artist; browse hides thin / dupe /
 * unresolvable profiles until we have enough signal to show them.
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

/** Minimum catalog weight to show a DJ without artwork. */
export const NO_THUMB_MIN_SETS = 5;
export const NO_THUMB_MIN_IDENTIFIED = 20;

/**
 * Ready for the default directory grid.
 * Requires a social/web handle, at least one set with a non-empty tracklist,
 * and either artwork or a strong identified-play footprint.
 */
export function isBrowseReadyDj(d: DjBrowseSignals): boolean {
  if (d.isJunk) return false;
  if (!d.hasHandle) return false;
  if (d.setCount < 1) return false;
  // Empty shells: set row exists but nothing parsed onto the timeline yet.
  if (d.playCount < 1) return false;
  if (!d.imageUrl) {
    if (
      d.setCount < NO_THUMB_MIN_SETS ||
      d.identifiedPlayCount < NO_THUMB_MIN_IDENTIFIED
    ) {
      return false;
    }
  }
  return true;
}
