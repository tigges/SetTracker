/**
 * Display policy for the Venues directory.
 * Ingest / DJ Mag still store curated clubs & festivals with a website even
 * before sets are linked; browse puts those below venues that already have sets.
 */

export type VenueBrowseSignals = {
  setCount: number;
  website: string | null | undefined;
};

/** Primary grid: at least one linked set. */
export function isBrowseReadyVenue(v: VenueBrowseSignals): boolean {
  return v.setCount >= 1;
}

/**
 * Keep in the catalog (and on a deferred “Directory” section) when curated
 * with an official site but no sets attached yet — e.g. EDC Las Vegas.
 */
export function isDirectoryVenue(v: VenueBrowseSignals): boolean {
  return v.setCount < 1 && Boolean(v.website?.trim());
}

/** Listed anywhere on /venues (primary or directory). */
export function isVenueListed(v: VenueBrowseSignals): boolean {
  return isBrowseReadyVenue(v) || isDirectoryVenue(v);
}
