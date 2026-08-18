/**
 * Catalog track dump for operator / Claude ID work.
 * Never invent ISRCs or 1001 URLs — this module only reads catalog rows.
 */

export type ExportTrackRow = {
  slug: string;
  artist: string;
  title: string;
  mix: string | null;
  remixer: string | null;
  genre: string | null;
  plays: number;
  isrc: string | null;
  beatportUrl: string | null;
};

export const TRACK_CSV_HEADER =
  "slug,artist,title,mix,remixer,genre,plays,isrc,beatportUrl";

export const CLAUDE_TRACK_ID_PROMPT = `You are identifying recordings in the setradar catalog.

For each JSONL row, propose an ISRC and/or a canonical Beatport track URL.
Return one JSON object per input row, same slug.

Rules:
- Never invent an ISRC. Use null when unsure.
- Beatport URL must be https://www.beatport.com/track/{slug}/{numericId} — never a search page.
- Do not invent 1001Tracklists URLs or tracklist cues.
- Do not guess from the setradar slug. Confirm the artist + title match.
- confidence is high | medium | low. Use low or null IDs when the name is generic.

Output JSONL only:
{"slug":"…","isrc":null,"beatportUrl":null,"confidence":"low"}
`;

export function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function trackToCsvRow(row: ExportTrackRow): string {
  return [
    csvEscape(row.slug),
    csvEscape(row.artist),
    csvEscape(row.title),
    csvEscape(row.mix),
    csvEscape(row.remixer),
    csvEscape(row.genre),
    csvEscape(row.plays),
    csvEscape(row.isrc),
    csvEscape(row.beatportUrl),
  ].join(",");
}

export function tracksToCsv(rows: ExportTrackRow[]): string {
  return [TRACK_CSV_HEADER, ...rows.map(trackToCsvRow)].join("\n") + "\n";
}

export function needsTrackId(row: ExportTrackRow): boolean {
  return !row.isrc?.trim();
}

export function tracksNeedId(rows: ExportTrackRow[]): ExportTrackRow[] {
  return rows
    .filter(needsTrackId)
    .sort((a, b) => b.plays - a.plays || a.artist.localeCompare(b.artist));
}

export function trackToClaudeJsonl(row: ExportTrackRow): string {
  return JSON.stringify({
    slug: row.slug,
    artist: row.artist,
    title: row.title,
    mix: row.mix,
    remixer: row.remixer,
    plays: row.plays,
  });
}

export function tracksToClaudeJsonl(rows: ExportTrackRow[]): string {
  return tracksNeedId(rows).map(trackToClaudeJsonl).join("\n") + (rows.length ? "\n" : "");
}
