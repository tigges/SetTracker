/**
 * Scan curated festival lineup pages / CDN JSON for artist names.
 * Falls back to committed seed lists when live endpoints block (403/empty).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { LINEUP_SOURCES, type LineupSource } from "./lineupSources";

export type LineupHit = {
  eventSlug: string;
  eventName: string;
  name: string;
  detail: string;
  weight: number;
  sourceUrl: string;
};

const TIMEOUT_MS = 15_000;
const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; lineup-scan)";

const NOISE =
  /^(line[- ]?up|timetable|stage|mainstage|home|welcome|tickets?|passes?|weekend|day\s*\d|discover|official|tomorrowland|edc|ultra|festival|belgium|las vegas|miami|more|see all|view|buy|shop|faq|practical)$/i;

function tidyName(raw: string): string | null {
  let n = raw
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/\s+/g, " ")
    .replace(/H[øöØÖ]rger/g, "Horger")
    .trim();
  n = n.replace(/\s+[–—|-]\s+(live|dj set|b2b).*$/i, "").trim();
  if (n.length < 2 || n.length > 60) return null;
  if (NOISE.test(n)) return null;
  if (!/[a-zA-Z]/.test(n)) return null;
  // Reject obvious non-names
  if (/https?:|www\.|@|^\d+$/.test(n)) return null;
  return n;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/json,*/*",
        Referer: "https://www.tomorrowland.com/",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function namesFromJsonBlob(text: string): string[] {
  const out: string[] = [];
  // Common keys in festival APIs
  for (const m of text.matchAll(
    /"(?:artistName|artist_name|performer|djName|name)"\s*:\s*"([^"]{2,80})"/g,
  )) {
    const n = tidyName(m[1]!);
    if (n) out.push(n);
  }
  return out;
}

function namesFromHtml(html: string): string[] {
  const out: string[] = [];
  out.push(...namesFromJsonBlob(html));
  // data-artist / aria-label patterns
  for (const m of html.matchAll(
    /(?:data-artist(?:-name)?|data-name|aria-label)=["']([^"']{2,80})["']/gi,
  )) {
    const n = tidyName(m[1]!);
    if (n) out.push(n);
  }
  // Heading-ish artist cards
  for (const m of html.matchAll(
    /<(?:h[2-4]|span|div)[^>]*class=["'][^"']*(?:artist|performer|act)[^"']*["'][^>]*>\s*([^<]{2,80})\s*</gi,
  )) {
    const n = tidyName(m[1]!);
    if (n) out.push(n);
  }
  return out;
}

async function scrapeCdn(src: LineupSource): Promise<string[]> {
  if (!src.cdnEventId) return [];
  const lang = src.cdnLang || "en";
  const id = src.cdnEventId;
  const configUrl = `https://artist-lineup-cdn.tomorrowland.com/config-${id}-${lang}.json`;
  const configText = await fetchText(configUrl);
  if (!configText || configText.includes("AccessDenied")) return [];
  const names = namesFromJsonBlob(configText);
  try {
    const config = JSON.parse(configText) as {
      config?: { weekends?: Array<{ name?: string }> };
    };
    const weekends = config.config?.weekends ?? [];
    for (const w of weekends.slice(0, 4)) {
      if (!w.name) continue;
      const stageUrl = `https://artist-lineup-cdn.tomorrowland.com/${id}-${w.name}-${lang}.json`;
      const body = await fetchText(stageUrl);
      if (body) names.push(...namesFromJsonBlob(body));
    }
  } catch {
    /* ignore parse errors — regex names already collected */
  }
  return names;
}

function loadSeed(src: LineupSource): string[] {
  if (!src.seedFile) return [];
  const path = join(process.cwd(), "data", "lineup-seeds", src.seedFile);
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as { artists?: string[] };
    return (raw.artists ?? []).map((a) => tidyName(a)).filter((x): x is string => !!x);
  } catch {
    return [];
  }
}

async function scrapeSource(src: LineupSource): Promise<LineupHit[]> {
  const weight = src.weight ?? 30;
  const collected: string[] = [];
  let detail = "seed";
  let sourceUrl = src.lineupUrl || src.website;

  const fromCdn = await scrapeCdn(src);
  if (fromCdn.length) {
    collected.push(...fromCdn);
    detail = `cdn:${src.cdnEventId}`;
    sourceUrl = `https://artist-lineup-cdn.tomorrowland.com/config-${src.cdnEventId}-${src.cdnLang || "en"}.json`;
  }

  if (src.lineupUrl) {
    const html = await fetchText(src.lineupUrl);
    if (html) {
      const fromHtml = namesFromHtml(html);
      if (fromHtml.length) {
        collected.push(...fromHtml);
        if (detail === "seed") {
          detail = "html";
          sourceUrl = src.lineupUrl;
        } else {
          detail = `${detail}+html`;
        }
      }
    }
  }

  if (collected.length < 5) {
    const seed = loadSeed(src);
    if (seed.length) {
      collected.push(...seed);
      if (detail === "seed") detail = "seed-fallback";
      else detail = `${detail}+seed`;
    }
  }

  const unique = [...new Set(collected.map((n) => tidyName(n)).filter((x): x is string => !!x))];
  return unique.map((name) => ({
    eventSlug: src.eventSlug,
    eventName: src.eventName,
    name,
    detail: `${src.eventName} lineup (${detail})`,
    weight,
    sourceUrl,
  }));
}

export async function scanFestivalLineups(): Promise<LineupHit[]> {
  const all: LineupHit[] = [];
  for (const src of LINEUP_SOURCES) {
    try {
      const hits = await scrapeSource(src);
      console.log(
        `[lineup] ${src.eventSlug}: ${hits.length} artists (${hits[0]?.detail ?? "empty"})`,
      );
      all.push(...hits);
    } catch (err) {
      console.warn(
        `[lineup] ${src.eventSlug} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return all;
}
