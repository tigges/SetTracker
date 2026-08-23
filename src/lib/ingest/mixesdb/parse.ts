/**
 * Follow-link only for MixesDB.
 *
 * Extract a concrete `/w/YYYY-MM-DD_-_…` mix page already present in a
 * source description or operator paste. Never crawl Category / Special /
 * search / listings and never invent `/w/…` titles.
 *
 * Timed `[mm:ss]` / `[hh:mm:ss]` / MixesDB-preferred `[mm]` marks overlay
 * clocks. Untimed numbered lists (no marks) stay out — we do not invent
 * offsets. Live HTML/API is Cloudflare-gated; fetch lives in `client.ts`.
 *
 * Tracklists are CC-BY-SA 3.0 US — provenance label is the attribution.
 * MixesDB is never a set / playback source.
 */

import { parseClockedTracklist } from "../soundcloud/parseTracklist";
import type { RawPlay } from "../types";

const MIXESDB_HOST = /(?:^|\.)mixesdb\.com$/i;

/** MediaWiki namespaces + talk — not mix pages. */
const MIXESDB_NS_RE =
  /^(Category|Special|User|Talk|File|Template|Help|MediaWiki|Module|MixesDB|User_talk|Category_talk|File_talk|Template_talk|Help_talk):/i;

/** Standard MixesDB mix title: `2026-08-07_-_Korolova_-_Captive_Soul_098`. */
const MIX_TITLE_RE = /^\d{4}-\d{2}-\d{2}(?:_|-)/;

const URL_RE =
  /(?:https?:\/\/)?(?:www\.)?mixesdb\.com\/(?:w\/(?:index\.php\?title=)?|db\/index\.php\?title=)[^\s<>"'|]+/gi;

export function mixesdbPageTitle(url: string): string | null {
  try {
    let href = url.trim().replace(/[),.]+$/, "");
    if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
    const u = new URL(href);
    if (!MIXESDB_HOST.test(u.hostname)) return null;
    let title = u.searchParams.get("title") || "";
    if (!title) {
      const m = u.pathname.match(/\/w\/(.+)$/);
      if (m) title = decodeURIComponent(m[1]!.replace(/\+/g, " "));
    } else {
      title = decodeURIComponent(title.replace(/\+/g, " "));
    }
    title = title.replace(/ /g, "_").replace(/\/+$/, "").replace(/#.*$/, "");
    if (!title || title === "Main_Page") return null;
    if (MIXESDB_NS_RE.test(title)) return null;
    if (!MIX_TITLE_RE.test(title)) return null;
    return title;
  } catch {
    return null;
  }
}

export function canonicalMixesdbUrl(url: string): string | null {
  const title = mixesdbPageTitle(url);
  if (!title) return null;
  return `https://www.mixesdb.com/w/${title}`;
}

export function isMixesdbListingUrl(url: string): boolean {
  try {
    let href = url.trim();
    if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
    const u = new URL(href);
    if (!MIXESDB_HOST.test(u.hostname)) return false;
    const path = u.pathname;
    if (/\/w\/?(Special:|Category:)/i.test(path)) return true;
    if (/\/w\/?$/i.test(path) && !u.searchParams.get("title")) return true;
    const title = u.searchParams.get("title") || "";
    return MIXESDB_NS_RE.test(title.replace(/ /g, "_"));
  } catch {
    return false;
  }
}

/** Pull concrete MixesDB mix-page URLs from free text. */
export function extractMixesdbUrls(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(URL_RE)) {
    const url = canonicalMixesdbUrl(m[0]!);
    if (!url) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

function decodeWikiEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** `[[Foo|Bar]]` → Bar, `[[Foo]]` → Foo. */
function unwrapWikiLinks(s: string): string {
  return s
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");
}

function minutesToCue(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:00`;
  return `${m}:00`;
}

/**
 * MixesDB time token → `m:ss` / `h:mm:ss` for the shared clock parser.
 * `[??]` and missing marks return null (never interpolate).
 */
export function mixesdbTimeToCue(token: string): string | null {
  const t = token.trim();
  if (!t || t === "??" || t === "?") return null;
  if (/^\d{1,3}$/.test(t)) return minutesToCue(Number(t));
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)) return t;
  return null;
}

function tracklistSection(wikitext: string): string {
  const named = wikitext.match(
    /==\s*Tracklist\s*==([\s\S]*?)(?=\n==\s|\n\[\[Category:|$)/i,
  );
  if (named) return named[1]!;
  const list = wikitext.match(/<list>([\s\S]*?)<\/list>/i);
  if (list) return list[1]!;
  return wikitext;
}

function stripToText(input: string): string {
  return decodeWikiEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style[\s\S]*?<\/style>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|li|tr|p|h\d|list)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

/**
 * Turn MixesDB wikitext or rendered HTML into clocked RawPlay[].
 * Empty when the page has no timed marks (Alok-style numbered-only lists).
 */
export function parseMixesdbTracklist(
  source: string,
  durationSec: number,
): RawPlay[] {
  if (!source?.trim()) return [];
  if (/turnstile|just a moment|cf-browser-verification/i.test(source)) {
    return [];
  }

  const section = tracklistSection(source);
  const text = unwrapWikiLinks(stripToText(section));
  const lines: string[] = [];

  for (const raw of text.split(/\n+/)) {
    let line = raw.trim().replace(/^#\s*/, "");
    line = line.replace(/^\{\{[^}]+\}\}\s*/, "");
    const m = line.match(/^\[(\?\?|\d{1,3}(?::\d{2}(?::\d{2})?)?)\]\s*(.*)$/);
    if (!m) continue;
    const cue = mixesdbTimeToCue(m[1]!);
    if (cue == null) continue;
    const rest = unwrapWikiLinks(m[2]!.trim())
      .replace(/\s*\[[^\]]+\](?:\s*\/\s*\[[^\]]+\])*\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!rest) continue;
    lines.push(`${cue} ${rest}`);
  }

  if (!lines.length) return [];
  return parseClockedTracklist(lines.join("\n"), durationSec, "mixesdb");
}
