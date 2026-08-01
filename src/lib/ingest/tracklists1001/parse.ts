/**
 * Parse 1001Tracklists HTML (when not Cloudflare-gated) into RawPlay[].
 */

import { parseDescriptionTracklist } from "../soundcloud/parseTracklist";
import type { RawPlay } from "../types";

/** Strip [LABEL] / trailing label tags from cue text. */
function stripLabelTags(line: string): string {
  return line
    .replace(/\s*\[[^\]]+\](?:\s*\/\s*\[[^\]]+\])*\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCue(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

function parseCueToSec(cue: string): number | null {
  const tsMatch = cue.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!tsMatch) return null;
  if (tsMatch[3] != null) {
    return (
      Number(tsMatch[1]) * 3600 + Number(tsMatch[2]) * 60 + Number(tsMatch[3])
    );
  }
  return Number(tsMatch[1]) * 60 + Number(tsMatch[2]);
}

/**
 * Extract timed "Artist - Title" lines from classic 1001TL markup.
 * Falls back to feeding visible text through the shared description parser.
 */
export function parse1001TracklistHtml(
  html: string,
  durationSec: number,
): RawPlay[] {
  if (!html?.trim()) return [];

  const lines: string[] = [];

  // Classic rows: tracknumber + cue + track value
  const rowRe =
    /tracknumber_value[^>]*>\s*(\d+)\s*<[\s\S]{0,400}?cueValue[^>]*>\s*([^<]+)<[\s\S]{0,800}?trackValue[^>]*>\s*([\s\S]*?)<\/span>/gi;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html))) {
    const cue = m[2]!.trim();
    const rawTrack = m[3]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const track = stripLabelTags(rawTrack);
    if (!track) continue;
    const sec = parseCueToSec(cue);
    if (sec != null) lines.push(`${formatCue(sec)} ${track}`);
    else lines.push(track);
  }

  if (lines.length >= 3) {
    return parseDescriptionTracklist(lines.join("\n"), durationSec, "1001tl");
  }

  // Fallback: strip tags and look for cue-prefixed artist lines in text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|li|tr|p|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return parseDescriptionTracklist(text, durationSec, "1001tl");
}

/** Pull 1001.tl / 1001tracklists.com tracklist URLs from free text. */
export function extract1001Urls(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  // Scheme optional — SC descriptions often say `Tracklist: 1001.tl/qhdctfk`.
  const re =
    /(?:https?:\/\/)?(?:1001\.tl\/[\w-]+|(?:www\.)?1001tracklists\.com\/tracklist\/[\w./-]+)/gi;
  for (const m of text.matchAll(re)) {
    let url = m[0]!.replace(/[),.]+$/, "");
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}
