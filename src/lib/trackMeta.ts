/**
 * Parse mix / remixer credits out of free-text track titles.
 * Keeps the original title intact for matching; fills optional Track fields.
 */

export type ParsedTrackTitle = {
  /** Original title unchanged (source of truth for matching). */
  title: string;
  mixName: string | null;
  remixerName: string | null;
};

const MIX_IN_PARENS =
  /\(([^)]*?\b(?:extended\s+mix|original\s+mix|radio\s+edit|radio\s+mix|club\s+mix|vip\s*mix|bootleg|edit|remix|version)[^)]*)\)/i;

const TRAILING_MIX =
  /\s[-–—]\s*((?:extended|original|radio|club|vip)\s+mix)\s*$/i;

const REMIX_IN_PARENS = /\(([^)]+?)\s+remix\)/i;

export function parseTrackTitle(title: string): ParsedTrackTitle {
  const trimmed = title.trim();
  let mixName: string | null = null;
  let remixerName: string | null = null;

  const remix = trimmed.match(REMIX_IN_PARENS);
  if (remix) {
    remixerName = cleanCredit(remix[1]);
    // "Artist Remix" often doubles as the mix label
    mixName = `${remixerName} Remix`;
  }

  const parenMix = trimmed.match(MIX_IN_PARENS);
  if (parenMix) {
    const inner = cleanCredit(parenMix[1]);
    if (!/remix/i.test(inner) || !mixName) mixName = inner;
  } else {
    const trail = trimmed.match(TRAILING_MIX);
    if (trail) mixName = cleanCredit(trail[1]);
  }

  return { title: trimmed, mixName, remixerName };
}

function cleanCredit(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Beatport /track/{slug}/{id} only — never a search or artist/label page. */
export function canonicalBeatportUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "beatport.com") return null;
    const m = parsed.pathname.match(/^\/track\/([^/]+)\/(\d+)\/?$/);
    if (!m) return null;
    return `https://www.beatport.com/track/${m[1]}/${m[2]}`;
  } catch {
    return null;
  }
}

/** Beatport track-tab search (not canonical). Prefer Track.beatportUrl when set. */
export function beatportSearchUrl(title: string, artistName?: string | null): string {
  const q = encodeURIComponent([artistName, title].filter(Boolean).join(" ").trim());
  return `https://www.beatport.com/search/tracks?q=${q}`;
}

/** Canonical /track URL when stored; otherwise the track-tab search. */
export function beatportTrackHref(
  title: string,
  artistName?: string | null,
  storedUrl?: string | null,
): string {
  return canonicalBeatportUrl(storedUrl) ?? beatportSearchUrl(title, artistName);
}

/** Apply a stored URL, else a same-title+artist catalog hit. */
export function resolveBeatportUrl(
  stored: string | null | undefined,
  title: string,
  artistName: string | null | undefined,
  catalog: Map<string, string>,
): string | null {
  return (
    canonicalBeatportUrl(stored) ??
    catalog.get(trackIdentityKey(title, artistName)) ??
    null
  );
}

/** Stable key for copying Beatport URLs across identical catalog tracks. */
export function trackIdentityKey(
  title: string,
  artistName?: string | null,
): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  return `${norm(title)}::${norm(artistName ?? "")}`;
}

/** Spotify search URL (not a track URI). Prefer a stored Spotify ID when we have one. */
export function spotifySearchUrl(
  title: string,
  artistName?: string | null,
): string {
  const q = encodeURIComponent(
    [artistName, title].filter(Boolean).join(" ").trim(),
  );
  return `https://open.spotify.com/search/${q}`;
}
