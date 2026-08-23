/**
 * Follow MixesDB mix-page links from set descriptions.
 *
 * Live HTML / MediaWiki API is Cloudflare-gated from GitHub Actions /
 * Cursor / most datacenter IPs. Default: do not fetch. Opt in on a
 * human laptop with `INGEST_ALLOW_MIXESDB_FETCH=1`.
 *
 * Never crawls Category / Special / search. Only GETs a concrete
 * `/w/YYYY-MM-DD_-_…` URL already in hand.
 */

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
