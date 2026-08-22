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

/** 12-char ISRC, uppercase, no dashes. */
export function normalizeIsrc(raw?: string | null): string | null {
  if (!raw) return null;
  const compact = raw.replace(/[\s-]+/g, "").toUpperCase();
  return /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(compact) ? compact : null;
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

/** Mashups / bootlegs / acapellas are usually not a single store SKU. */
export function isLikelyUnbuyable(
  title: string,
  artistName?: string | null,
): boolean {
  const blob = `${artistName ?? ""} ${title}`;
  return /\b(mash[\s-]?up|bootleg|acappella|acapella)\b/i.test(blob);
}

export type BeatportBuyability = "buy" | "search" | "unavailable";

export function beatportBuyability(opts: {
  idStatus: string;
  title: string;
  artistName?: string | null;
  beatportUrl?: string | null;
}): BeatportBuyability {
  if (canonicalBeatportUrl(opts.beatportUrl)) return "buy";
  if (
    opts.idStatus === "unresolved_id" ||
    opts.idStatus === "unparsed" ||
    isLikelyUnbuyable(opts.title, opts.artistName)
  ) {
    return "unavailable";
  }
  if (
    opts.idStatus === "identified" ||
    opts.idStatus === "community_resolved"
  ) {
    return "search";
  }
  return "unavailable";
}

export type BeatportCoverage = {
  identified: number;
  buyable: number;
};

/** Identified rows that have a real Beatport /track page. */
export function beatportCoverage(
  plays: {
    idStatus: string;
    title: string;
    artistName?: string | null;
    beatportUrl?: string | null;
  }[],
): BeatportCoverage {
  let identified = 0;
  let buyable = 0;
  for (const p of plays) {
    if (
      p.idStatus !== "identified" &&
      p.idStatus !== "community_resolved"
    ) {
      continue;
    }
    identified += 1;
    if (beatportBuyability(p) === "buy") buyable += 1;
  }
  return { identified, buyable };
}

/** Stable key for copying store IDs across identical catalog tracks. */
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

function listenQuery(title: string, artistName?: string | null): string {
  return [artistName, title].filter(Boolean).join(" ").trim();
}

/** Spotify search URL (not a track URI). Prefer a stored Spotify ID when we have one. */
export function spotifySearchUrl(
  title: string,
  artistName?: string | null,
): string {
  return `https://open.spotify.com/search/${encodeURIComponent(listenQuery(title, artistName))}`;
}

/** Spotify /track/{id} only — never a search, artist, or album page. */
export function canonicalSpotifyUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "open.spotify.com") return null;
    const m = parsed.pathname.match(/^\/track\/([A-Za-z0-9]{22})\/?$/);
    if (!m) return null;
    return `https://open.spotify.com/track/${m[1]}`;
  } catch {
    return null;
  }
}

/** Canonical /track URL when stored; otherwise the search page. */
export function spotifyTrackHref(
  title: string,
  artistName?: string | null,
  storedUrl?: string | null,
): string {
  return canonicalSpotifyUrl(storedUrl) ?? spotifySearchUrl(title, artistName);
}

/** Discogs release search (no key, never scraped). */
export function discogsSearchUrl(
  title: string,
  artistName?: string | null,
): string {
  const q = encodeURIComponent(listenQuery(title, artistName));
  return `https://www.discogs.com/search/?q=${q}&type=release`;
}

/** Bandcamp catalog search (no key, never scraped). */
export function bandcampSearchUrl(
  title: string,
  artistName?: string | null,
): string {
  const q = encodeURIComponent(listenQuery(title, artistName));
  return `https://bandcamp.com/search?q=${q}`;
}
