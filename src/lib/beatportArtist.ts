/** Canonical Beatport /artist/{slug}/{id} — never a search or track page. */

export function canonicalBeatportArtistUrl(
  url?: string | null,
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "beatport.com") return null;
    const m = parsed.pathname.match(/^\/artist\/([^/]+)\/(\d+)\/?$/);
    if (!m) return null;
    return `https://www.beatport.com/artist/${m[1]}/${m[2]}`;
  } catch {
    return null;
  }
}

/** Pull a canonical artist URL from a pin bio or pasted path. */
export function extractBeatportArtistUrl(text?: string | null): string | null {
  if (!text) return null;
  const full = text.match(
    /https?:\/\/(?:www\.)?beatport\.com\/artist\/([^/\s]+)\/(\d+)/i,
  );
  if (full) {
    return canonicalBeatportArtistUrl(
      `https://www.beatport.com/artist/${full[1]}/${full[2]}`,
    );
  }
  const short = text.match(/beatport\s+artist\/([^/\s]+)\/(\d+)/i);
  if (short) {
    return canonicalBeatportArtistUrl(
      `https://www.beatport.com/artist/${short[1]}/${short[2]}`,
    );
  }
  return canonicalBeatportArtistUrl(text.trim());
}

/** Prefer an explicit pin, then website, then a bio `Beatport artist/slug/id`. */
export function resolveDjBeatport(input: {
  beatport?: string | null;
  website?: string | null;
  bio?: string | null;
}): string | null {
  return (
    canonicalBeatportArtistUrl(input.beatport) ||
    extractBeatportArtistUrl(input.beatport) ||
    canonicalBeatportArtistUrl(input.website) ||
    extractBeatportArtistUrl(input.website) ||
    extractBeatportArtistUrl(input.bio)
  );
}
