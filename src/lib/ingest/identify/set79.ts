/**
 * Set79 (https://set79.com) — published sitemap only.
 *
 * Do not run their paid SoundCloud analyzer or scrape login-walled
 * tracklist HTML. We only record public sitemap URLs that already exist.
 */

const SITEMAPS = [
  "https://set79.com/sitemap-tracklists-1.xml",
  "https://set79.com/sitemap-tracklists-2.xml",
  "https://set79.com/sitemap-tracklists-3.xml",
];

let cachedLocs: string[] | null = null;

export async function listPublishedSet79Urls(): Promise<string[]> {
  if (cachedLocs) return cachedLocs;
  const locs: string[] = [];
  for (const sm of SITEMAPS) {
    try {
      const res = await fetch(sm, {
        headers: { Accept: "application/xml" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        locs.push(m[1]!);
      }
    } catch {
      /* ignore */
    }
  }
  cachedLocs = locs;
  return locs;
}

/** Tokens must all appear in the published Set79 path (SoundCloud slugs). */
export function matchSet79Urls(locs: string[], tokens: string[]): string[] {
  const need = tokens.map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ""));
  return locs.filter((loc) => {
    const hay = loc.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return need.every((t) => t.length >= 3 && hay.includes(t));
  });
}

export async function findPublishedSet79(tokens: string[]): Promise<string[]> {
  const locs = await listPublishedSet79Urls();
  return matchSet79Urls(locs, tokens).slice(0, 8);
}

/** Held-set sitemap tokens — require venue so Niteharts ≠ HARD Summer. */
export const SET79_HINT_TOKENS: Record<string, string[]> = {
  TL_KNOCK2_ZEDD_HARD_SUMMER_2026: ["knock2", "zedd", "hard"],
  TL_COLE_TERRAZAS_HARD_SUMMER_2026: ["cole", "terrazas", "hard"],
};

export type Set79Hint = {
  seed: string;
  urls: string[];
  note: string;
};

const SET79_NOTE =
  "Published sitemap only — not Relive. Login-walled HTML and the paid SoundCloud analyzer are never fetched.";

export async function findHeldSet79Hints(
  seeds: string[] = Object.keys(SET79_HINT_TOKENS),
): Promise<Set79Hint[]> {
  if (process.env.SET79 === "0") return [];
  const locs = await listPublishedSet79Urls();
  return seeds
    .map((seed) => {
      const tokens = SET79_HINT_TOKENS[seed];
      if (!tokens) return null;
      const urls = matchSet79Urls(locs, tokens).slice(0, 8);
      return { seed, urls, note: SET79_NOTE };
    })
    .filter((h): h is Set79Hint => Boolean(h));
}
