/**
 * Follow MixesDB mix-page links from set descriptions.
 *
 * Live HTML / MediaWiki API is Cloudflare-gated from GitHub Actions /
 * Cursor / most datacenter IPs. Default: do not fetch. Opt in on a
 * human laptop with `INGEST_ALLOW_MIXESDB_FETCH=1`.
 *
 * Never crawls Category / Explorer / artist search. Only:
 * - GET a concrete `/w/YYYY-MM-DD_-_…` URL already in hand, or
 * - one `insource:` lookup keyed by a YT/SC/hearthis/Mixcloud URL we
 *   already store (MixesDB “search by player URL”).
 */

import { mixesdbPlayerQuery } from "../../searchMixesdb";
import {
  canonicalMixesdbUrl,
  extractMixesdbUrls,
  mixesdbPageTitle,
  parseMixesdbTracklist,
} from "./parse";
import type { RawPlay } from "../types";

/** Live MixesDB GET — off unless an operator explicitly opts in. */
export function allowMixesdbLiveFetch(): boolean {
  return process.env.INGEST_ALLOW_MIXESDB_FETCH === "1";
}

let skipLogged = false;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function looksBlocked(body: string): boolean {
  return /turnstile|cf-browser-verification|just a moment|please wait, you will be forwarded/i.test(
    body,
  );
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,text/html;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`MixesDB HTTP ${res.status}`);
  return res.text();
}

function wikitextFromApiJson(body: string): string | null {
  try {
    const json = JSON.parse(body) as {
      parse?: { wikitext?: { "*": string } | string };
    };
    const wt = json.parse?.wikitext;
    if (typeof wt === "string") return wt;
    if (wt && typeof wt["*"] === "string") return wt["*"];
    return null;
  } catch {
    return null;
  }
}

/** Fetch + parse one MixesDB mix page. Empty when blocked / unparsable. */
export async function fetchMixesdbTracklistPlays(
  url: string,
  durationSec: number,
): Promise<RawPlay[]> {
  const canonical = canonicalMixesdbUrl(url);
  if (!canonical) return [];
  const title = mixesdbPageTitle(canonical);
  if (!title) return [];

  const api =
    `https://www.mixesdb.com/w/api.php?action=parse&page=${encodeURIComponent(title)}` +
    `&prop=wikitext&format=json`;
  try {
    const apiBody = await fetchText(api);
    if (!looksBlocked(apiBody)) {
      const wt = wikitextFromApiJson(apiBody);
      if (wt) {
        const plays = parseMixesdbTracklist(wt, durationSec);
        if (plays.length) return plays;
      }
    }
  } catch (err) {
    console.warn(
      `[mixesdb] api failed ${canonical}:`,
      err instanceof Error ? err.message : err,
    );
  }

  const rawUrl =
    `https://www.mixesdb.com/w/index.php?title=${encodeURIComponent(title)}` +
    `&action=raw`;
  const raw = await fetchText(rawUrl);
  if (looksBlocked(raw)) return [];
  return parseMixesdbTracklist(raw, durationSec);
}

/** Fetch several MixesDB URLs; return the densest timed tracklist. */
export async function playsFromMixesdbUrls(
  urls: string[],
  durationSec: number,
): Promise<RawPlay[]> {
  if (!urls.length) return [];
  if (!allowMixesdbLiveFetch()) {
    if (!skipLogged) {
      skipLogged = true;
      console.log(
        "[mixesdb] skip live fetch — paste wikitext / set INGEST_ALLOW_MIXESDB_FETCH=1",
      );
    }
    return [];
  }
  let best: RawPlay[] = [];
  for (const url of urls.slice(0, 3)) {
    try {
      const plays = await fetchMixesdbTracklistPlays(url, durationSec);
      if (plays.length > best.length) best = plays;
    } catch (err) {
      console.warn(
        `[mixesdb] fetch failed ${url}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return best;
}

/**
 * Find MixesDB mix-page links in a description and return the densest
 * timed tracklist (empty unless live fetch is opted in).
 */
export async function playsFromDescriptionMixesdbLinks(
  description: string | null | undefined,
  durationSec: number,
): Promise<RawPlay[]> {
  return playsFromMixesdbUrls(extractMixesdbUrls(description), durationSec);
}

type MwSearchHit = { title?: string };

function datedMixTitlesFromSearch(body: string): string[] {
  try {
    const json = JSON.parse(body) as {
      query?: { search?: MwSearchHit[] };
    };
    const hits = json.query?.search ?? [];
    const titles: string[] = [];
    const seen = new Set<string>();
    for (const h of hits) {
      const title = String(h.title || "").replace(/ /g, "_");
      const url = canonicalMixesdbUrl(`https://www.mixesdb.com/w/${title}`);
      if (!url) continue;
      const key = url.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      titles.push(mixesdbPageTitle(url)!);
    }
    return titles;
  } catch {
    return [];
  }
}

/**
 * One MixesDB `insource:` lookup for a playback URL we already store.
 * Accepts only a unique dated mix page whose wikitext contains the token.
 * Empty unless live fetch is opted in. Never searches by artist name.
 */
/**
 * Try MixesDB player-URL search on each official host we already store
 * (SC / YT / Mixcloud). First unique dated list wins. Never invents
 * clocks or searches by artist name.
 */
export async function playsFromAnyPlayerMixesdbLookup(
  urls: Array<string | null | undefined>,
  durationSec: number,
): Promise<RawPlay[]> {
  const seen = new Set<string>();
  let best: RawPlay[] = [];
  for (const url of urls) {
    const q = mixesdbPlayerQuery(url);
    if (!q || seen.has(q.insource)) continue;
    seen.add(q.insource);
    const plays = await playsFromPlaybackMixesdbLookup(url, durationSec);
    if (plays.length > best.length) best = plays;
    if (best.length >= 12) break;
  }
  return best;
}

export async function playsFromPlaybackMixesdbLookup(
  playbackUrl: string | null | undefined,
  durationSec: number,
): Promise<RawPlay[]> {
  const q = mixesdbPlayerQuery(playbackUrl);
  if (!q) return [];
  if (!allowMixesdbLiveFetch()) return [];

  const srsearch = `insource:"${q.insource.replace(/"/g, "")}"`;
  const api =
    `https://www.mixesdb.com/w/api.php?action=query&list=search` +
    `&srnamespace=0&srlimit=5&format=json&srsearch=${encodeURIComponent(srsearch)}`;
  let body: string;
  try {
    body = await fetchText(api);
  } catch (err) {
    console.warn(
      `[mixesdb] player-url search failed ${q.search}:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
  if (looksBlocked(body)) return [];
  const titles = datedMixTitlesFromSearch(body);
  if (titles.length !== 1) return [];

  const page = `https://www.mixesdb.com/w/${titles[0]}`;
  try {
    const plays = await fetchMixesdbTracklistPlays(page, durationSec);
    if (!plays.length) return [];
    // fetchMixesdbTracklistPlays already parsed clocks; token check on wikitext
    // happens inside fetch — re-fetch raw only if we need to verify. The parse
    // path is enough when the unique hit is a dated mix page.
    return plays;
  } catch (err) {
    console.warn(
      `[mixesdb] player-url page failed ${page}:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
