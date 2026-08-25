/**
 * Client-safe helpers for prioritizing unidentified (pink) track IDs.
 * Used by fingerprint enrich queue scoring and /stats.
 */

/** DJ Mag ranks 1–20 get unresolved-ID detection priority. */
export const TOP_DJ_UNRESOLVED_PRIORITY = 20;

/** True when a set should be prioritized for pink-ID detection. */
export function isUnresolvedDetectPriority(opts: {
  unresolvedCount: number;
  top100Rank?: number | null;
  isFestival?: boolean;
  /** Club night or official livestream — same detect budget as a festival. */
  isLiveFocus?: boolean;
  festivalSeason?: boolean;
  /**
   * Festival (or season) sets with no/thin tracklists — still priority for
   * YouTube festival playback fingerprinting even when unresolvedCount is 0.
   */
  sparseFestival?: boolean;
}): boolean {
  const live = Boolean(opts.isFestival || opts.isLiveFocus || opts.festivalSeason);
  if (opts.sparseFestival && live) {
    return true;
  }
  if (opts.unresolvedCount < 1) return false;
  const top20 =
    opts.top100Rank != null &&
    opts.top100Rank <= TOP_DJ_UNRESOLVED_PRIORITY;
  return top20 || live;
}
