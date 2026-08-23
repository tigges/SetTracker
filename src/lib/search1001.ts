/**
 * Operator assist: open 1001Tracklists search with the set query.
 * Do not invent /tracklist/ URLs. CI never fetches 1001.
 */

const JUNK_PHRASE =
  /\b(?:official(?:\s+full)?\s+set|full\s+set|live\s+set|site:1001tracklists\.com)\b/gi;

export function search1001Query(...parts: string[]): string {
  const chunks = parts
    .map((p) =>
      p
        .replace(/[|/]+/g, " ")
        .replace(JUNK_PHRASE, " ")
        .replace(/\(\s*\)/g, " ")
        .replace(/[(\[]\s*$/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
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
  return kept.join(" ").replace(/\s+/g, " ").trim();
}

/** 1001 search page with `q` filled. Host may ignore `q`; the query is still copyable. */
export function search1001(...parts: string[]): string {
  const q = search1001Query(...parts);
  if (!q) return "https://www.1001tracklists.com/search";
  return `https://www.1001tracklists.com/search?q=${encodeURIComponent(q)}`;
}

export function search1001QueryFromUrl(url: string): string {
  try {
    return new URL(url).searchParams.get("q")?.trim() ?? "";
  } catch {
    return "";
  }
}
