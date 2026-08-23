/**
 * Operator assist: open 1001Tracklists search with the set query.
 * Do not invent /tracklist/ URLs. CI never fetches 1001.
 *
 * 1001's search box POSTs to /search/result.php (main_search +
 * search_selection=9 for Tracklists). GET /search?q=… is their 404
 * page ("Sorry, that page does not exist"), even for a short token
 * like `alok`. Bookmark URLs therefore use a hash (#q=) so opening
 * them still lands on /search; the /stats button POSTs the form.
 */

const JUNK_PHRASE =
  /\b(?:official(?:\s+full)?\s+set|full\s+set|live\s+set|site:1001tracklists\.com)\b/gi;

/** Landing page (empty search welcome). */
export const SEARCH_1001_LANDING = "https://www.1001tracklists.com/search";

/** Their real search form action. */
export const SEARCH_1001_RESULT =
  "https://www.1001tracklists.com/search/result.php";

/** `<select name="search_selection">` value for Tracklists. */
export const SEARCH_1001_TRACKLISTS = "9";

/** YYYY + glued day (August, 202026 → 2020). Do not match a bare year. */
const GLUED_YEAR_DAY = /\b(20\d{2})(0[1-9]|[12]\d|3[01])\b/g;

function tidySearchText(s: string): string {
  return s
    .replace(/[|/]+/g, " ")
    .replace(JUNK_PHRASE, " ")
    .replace(/['\u2018\u2019]s\b/gi, "")
    .replace(/['\u2018\u2019]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, " ")
    .replace(/[\u200d\ufe0f]/g, "")
    .replace(GLUED_YEAR_DAY, "$1")
    .replace(/[(),;:]+/g, " ")
    .replace(/\s+-\s+/g, " ")
    .replace(/\(\s*\)/g, " ")
    .replace(/[(\[]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function search1001Query(...parts: string[]): string {
  const chunks = parts
    .map(tidySearchText)
    .filter((p) => p.length > 0)
    .filter((p) => !/^(youtube|relive)$/i.test(p));

  const kept: string[] = [];
  for (const chunk of chunks) {
    const lower = chunk.toLowerCase();
    if (kept.some((k) => k.toLowerCase() === lower)) continue;
    const joined = kept.join(" ").toLowerCase();
    if (joined && lower.includes(joined) && kept.length === 1) {
      kept[0] = chunk;
      continue;
    }
    if (joined && joined.includes(lower)) continue;
    kept.push(chunk);
  }
  return tidySearchText(kept.join(" ")).slice(0, 150).trim();
}

/** 1001 /search bookmark. Query lives in the hash — `?q=` 404s. */
export function search1001(...parts: string[]): string {
  const q = search1001Query(...parts);
  if (!q) return SEARCH_1001_LANDING;
  return `${SEARCH_1001_LANDING}#q=${encodeURIComponent(q)}`;
}

export function search1001QueryFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const fromQuery = u.searchParams.get("q")?.trim();
    if (fromQuery) return fromQuery;
    const hash = u.hash.startsWith("#") ? u.hash.slice(1) : u.hash;
    if (!hash) return "";
    return new URLSearchParams(hash).get("q")?.trim() ?? "";
  } catch {
    return "";
  }
}

/**
 * Prefer a native 1001 search page. Remap leftover Google site:1001 URLs
 * and GET /search?q= 404 bookmarks so /stats never opens those.
 */
export function nativeCaptureSearchUrl(
  searchUrl: string,
  ...fallbackParts: string[]
): string {
  const trimmed = searchUrl.trim();
  if (trimmed.includes("1001tracklists.com/search")) {
    const q = search1001QueryFromUrl(trimmed);
    return q ? search1001(q) : search1001(...fallbackParts);
  }
  const fromUrl = search1001QueryFromUrl(trimmed).replace(
    /\b(?:relive|youtube)\b/gi,
    " ",
  );
  return search1001(fromUrl, ...fallbackParts);
}
