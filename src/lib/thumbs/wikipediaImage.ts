/**
 * Wikipedia / Commons artwork for venues and festivals.
 * Search + summary thumbnail only — never invent a page from the slug.
 */

const UA = "SetRadar/0.2.195 (+https://setradar.ai; venue-art)";

const STOP = new Set([
  "the",
  "and",
  "club",
  "nightclub",
  "festival",
  "official",
  "music",
  "project",
  "los",
  "angeles",
]);

export function wikiCore(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function wikiTokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOP.has(t));
}

/** Title must share the distinctive name tokens (Pacha, Amnesia, …). */
export function wikipediaTitleMatches(name: string, title: string): boolean {
  const tokens = wikiTokens(name);
  const hay = wikiCore(title);
  if (!hay) return false;
  if (tokens.length === 0) {
    const core = wikiCore(name);
    return core.length >= 4 && hay.includes(core);
  }
  const hits = tokens.filter((t) => hay.includes(t));
  return hits.length >= Math.ceil(tokens.length / 2);
}

export function cleanWikiImageUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    u.search = "";
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

type WikiSearch = {
  query?: { search?: Array<{ title?: string }> };
};

type WikiSummary = {
  title?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

async function wikiJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function resolveWikipediaImage(
  name: string,
  kind?: string | null,
): Promise<string | null> {
  const trimmed = name.trim();
  if (trimmed.length < 3) return null;
  const extra =
    kind === "club" ? " nightclub" : kind === "festival" ? " festival" : "";
  const searchUrl =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=5&format=json&srsearch=" +
    encodeURIComponent(`${trimmed}${extra}`);
  const found = await wikiJson<WikiSearch>(searchUrl);
  const titles = (found?.query?.search ?? [])
    .map((row) => row.title?.trim())
    .filter((t): t is string => Boolean(t));
  for (const title of titles) {
    if (!wikipediaTitleMatches(trimmed, title)) continue;
    const summary = await wikiJson<WikiSummary>(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(title.replace(/ /g, "_")),
    );
    const raw =
      summary?.originalimage?.source || summary?.thumbnail?.source || "";
    const url = cleanWikiImageUrl(raw);
    if (url) return url;
  }
  return null;
}
