/**
 * Follow-link only for setlist.fm.
 *
 * Extract a concrete `/setlist/{artist}/{year}/{venue}.html` URL already
 * present in a source description or operator paste. Never crawl
 * `setlist.fm/setlists/` (artist/index listings) and never invent URLs.
 *
 * Concert-first wiki, usually no clocks — not a primary ID source.
 * Official API needs a key + attribution and is free only for non-commercial
 * use; do not poll HTML or the API from ingest.
 */

/** Concrete setlist page — not the `/setlists/` listing. */
const SETLIST_PAGE_RE =
  /(?:https?:\/\/)?(?:www\.)?setlist\.fm\/setlist\/[A-Za-z0-9._~-]+\/\d{4}\/[A-Za-z0-9._~-]+\.html/gi;

export function extractSetlistFmUrls(
  text: string | null | undefined,
): string[] {
  if (!text?.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(SETLIST_PAGE_RE)) {
    let url = m[0]!.replace(/[),.]+$/, "");
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

export function isSetlistFmListingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/(^|\.)setlist\.fm$/i.test(u.hostname)) return false;
    return /^\/setlists\/?$/i.test(u.pathname) ||
      /^\/setlists\//i.test(u.pathname);
  } catch {
    return false;
  }
}
