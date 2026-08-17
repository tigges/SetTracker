/**
 * Identify hosts we never fetch or scrape.
 *
 * AudioScout / MusicMate / TrackId results are operator-paste only
 * (same rule as fingerprint/seeds.ts). Official APIs (AudD, MusicBrainz,
 * TrackRadar, Beatport-via-MB) live in sibling modules.
 */

export const PASTE_ONLY_IDENTIFY_HOSTS = [
  "audioscout.io",
  "www.audioscout.io",
  "getmusicmate.com",
  "www.getmusicmate.com",
  "trackid.net",
  "www.trackid.net",
] as const;

export function isPasteOnlyIdentifyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return PASTE_ONLY_IDENTIFY_HOSTS.some(
      (h) => h.replace(/^www\./, "") === host,
    );
  } catch {
    return false;
  }
}

/** Drop AudioScout / MusicMate / TrackId links — paste-only, never fetched. */
export function dropPasteOnlyUrls<T extends Record<string, string | undefined>>(
  obj: T,
): T {
  const out = { ...obj };
  for (const key of Object.keys(out) as (keyof T)[]) {
    const v = out[key];
    if (typeof v === "string" && isPasteOnlyIdentifyUrl(v)) {
      delete out[key];
    }
  }
  return out;
}
