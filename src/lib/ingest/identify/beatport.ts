/**
 * Beatport catalog IDs (https://www.beatport.com).
 *
 * www.beatport.com and api.beatport.com are Cloudflare-walled (403 / 401).
 * Never scrape HTML or call the catalog API. Canonical /track/{slug}/{id}
 * comes from MusicBrainz url-rels or another official catalog (TrackRadar).
 */

import { canonicalBeatportUrl } from "../../trackMeta";

export { canonicalBeatportUrl };

/** Accept only a canonical Beatport track URL — never search / artist / label. */
export function acceptBeatportTrackUrl(
  url: string | null | undefined,
): string | undefined {
  return canonicalBeatportUrl(url) || undefined;
}

export function isBeatportHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "beatport.com" || host === "api.beatport.com";
  } catch {
    return false;
  }
}
