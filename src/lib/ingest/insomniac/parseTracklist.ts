/**
 * Parse Insomniac Night Owl Radio accordion tracklists:
 *   <b>Artist</b> "Title"
 *   <b>Artist</b> "Title" (Remix Credit)
 *
 * Guest-section headers like <b>D.O.D Guest Mix</b> (no quoted title) are skipped.
 */

import type { RawPlay } from "../types";

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
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

function isSectionHeader(artistName: string, trackTitle: string): boolean {
  if (!trackTitle) return true;
  // "<b>Loofy - Up All Night</b>" style guest headers sometimes get empty titles
  if (/guest\s*mix$/i.test(artistName)) return true;
  if (/^up all night$/i.test(trackTitle) && /-/i.test(artistName)) return true;
  return false;
}

/** Extract Artist / "Title" rows from an Insomniac music page HTML. */
export function parseInsomniacTrackRows(html: string): InsomniacTrackRow[] {
  const blockMatch =
    html.match(/Track\s*List<\/div><\/dt><dd>([\s\S]*?)<\/dd>/i) ||
    html.match(/Track\s*List[\s\S]{0,200}?<dd>([\s\S]*?)<\/dd>/i);
  const block = blockMatch?.[1] ?? "";
  if (!block) return [];

  // Strip highlight <span class="il">…</span> so class="…" can't poison quote matching.
  const normalized = block
    .replace(/<\/?span\b[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ");

  const rows: InsomniacTrackRow[] = [];
  // Do not let artist capture cross </b> boundaries (guest headers + next row).
  const re =
    /<b>((?:(?!<\/b>)[\s\S])*?)<\/b>\s*[“"]([^”"]+)[”"](?:\s*(\([^)]+\)))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized))) {
    const artistName = decodeEntities(m[1] ?? "");
    let trackTitle = decodeEntities(m[2] ?? "");
    const remix = decodeEntities(m[3] ?? "");
    if (remix && !trackTitle.includes(remix)) {
      trackTitle = `${trackTitle} ${remix}`.trim();
    }
    if (artistName.length < 2 || trackTitle.length < 1) continue;
    if (artistName.length > 120 || trackTitle.length > 180) continue;
    if (isSectionHeader(artistName, trackTitle)) continue;
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
