/**
 * Parse Insomniac Night Owl Radio accordion tracklists:
 *   <b>Artist</b> "Title"
 */

import type { RawPlay } from "../types";

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type InsomniacTrackRow = { artistName: string; trackTitle: string };

/** Extract Artist / "Title" rows from an Insomniac music page HTML. */
export function parseInsomniacTrackRows(html: string): InsomniacTrackRow[] {
  const blockMatch =
    html.match(/Track\s*List<\/div><\/dt><dd>([\s\S]*?)<\/dd>/i) ||
    html.match(/Track\s*List[\s\S]{0,200}?<dd>([\s\S]*?)<\/dd>/i);
  const block = blockMatch?.[1] ?? "";
  if (!block) return [];

  const rows: InsomniacTrackRow[] = [];
  const re = /<b>([\s\S]*?)<\/b>\s*[“"]([\s\S]*?)[”"]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    const artistName = decodeEntities(m[1] ?? "");
    const trackTitle = decodeEntities(m[2] ?? "");
    if (artistName.length < 2 || trackTitle.length < 1) continue;
    if (artistName.length > 120 || trackTitle.length > 160) continue;
    rows.push({ artistName, trackTitle });
  }
  return rows;
}

/**
 * Map Insomniac rows → plays. NOR lists are usually untimed, so cues are
 * evenly spaced across the set duration (best-effort, not cue-sheet accurate).
 */
export function rowsToPlays(
  rows: InsomniacTrackRow[],
  durationSec: number,
): RawPlay[] {
  const n = rows.length;
  if (!n) return [];
  const span = Math.max(durationSec, n * 30);
  return rows.map((row, i) => ({
    position: i + 1,
    timestamp: Math.round((span * (i + 1)) / (n + 1)),
    idStatus: "identified" as const,
    provenance: "insomniac" as const,
    trackTitle: row.trackTitle,
    artistName: row.artistName,
  }));
}
