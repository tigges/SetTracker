/**
 * Follow 1001.tl / 1001tracklists.com links from set descriptions.
 *
 * Live HTML is Cloudflare-gated from GitHub Actions / Cursor / most
 * datacenter IPs. Default: do not fetch. Apply committed browser-capture
 * seeds instead (`tracklists1001/`). Opt in on a human laptop with
 * `INGEST_ALLOW_1001_FETCH=1`.
 */

import { extract1001Urls, parse1001TracklistHtml } from "./parse";
import type { RawPlay } from "../types";

/** Live 1001 GET — off unless an operator explicitly opts in. */
export function allow1001LiveFetch(): boolean {
  return process.env.INGEST_ALLOW_1001_FETCH === "1";
}

let skipLogged = false;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.google.com/",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`1001TL HTTP ${res.status}`);
  return res.text();
}

function looksBlocked(html: string): boolean {
  if (/turnstile|cf-browser-verification|just a moment|please wait, you will be forwarded/i.test(html)) {
    return true;
  }
  // Shell page without track rows
  if (
    !/tracknumber_value|cueValue|trackValue|tlpItem/i.test(html) &&
    /1001tracklists/i.test(html)
  ) {
    return true;
  }
  return false;
}

/** Fetch + parse one 1001TL URL. Empty when blocked / unparsable. */
export async function fetch1001TracklistPlays(
  url: string,
  durationSec: number,
): Promise<RawPlay[]> {
  const html = await fetchHtml(url);
  if (looksBlocked(html)) return [];
  return parse1001TracklistHtml(html, durationSec);
}

/** Fetch several 1001 URLs; return the densest parsed tracklist. */
export async function playsFrom1001Urls(
  urls: string[],
  durationSec: number,
): Promise<RawPlay[]> {
  if (!urls.length) return [];
  if (!allow1001LiveFetch()) {
    if (!skipLogged) {
      skipLogged = true;
      console.log(
        "[1001tl] skip live fetch — use scripts/capture-1001tl.console.js; set INGEST_ALLOW_1001_FETCH=1 to enable",
      );
    }
    return [];
  }
  let best: RawPlay[] = [];
  for (const url of urls.slice(0, 3)) {
    try {
      const plays = await fetch1001TracklistPlays(url, durationSec);
      if (plays.length > best.length) best = plays;
    } catch (err) {
      console.warn(
        `[1001tl] fetch failed ${url}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return best;
}

/**
 * Find 1001TL links in a description and return the densest parsed tracklist.
 */
export async function playsFromDescription1001Links(
  description: string | null | undefined,
  durationSec: number,
): Promise<RawPlay[]> {
  return playsFrom1001Urls(extract1001Urls(description), durationSec);
}
