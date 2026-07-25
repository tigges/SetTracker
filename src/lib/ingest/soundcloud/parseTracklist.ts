/**
 * Parse SoundCloud episode descriptions and timed comments into tracklist rows.
 *
 * Honest mapping:
 * - "Artist - Title" → identified (best-effort; not Beatport-verified)
 * - "Artist - ID" / "ID - ID" / bare "ID" → unresolved_id
 * - timestamped lines we can't classify → unparsed
 * - non-tracklist noise (links, follow CTAs) is dropped
 */

import type { RawPlay } from "../types";

const TS_PREFIX =
  /^(?:\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?|\(?(\d{1,2}):(\d{2})(?::(\d{2}))?\)?)\s*[-–—.]?\s*/;

const SKIP_LINE =
  /^(https?:\/\/|www\.|stream\b|download\b|follow\b|subscribe\b|merch\b|spotify\b|instagram\b|tiktok\b|facebook\b|booking\b|out now\b|free download\b|linktr\.ee|shout out\b|latest updates\b)/i;

const ID_LINE =
  /^(?:id\b.*|.*\bid\b)$/i;

function parseTimestampPrefix(line: string): { sec: number | null; rest: string } {
  const m = line.match(TS_PREFIX);
  if (!m) return { sec: null, rest: line };
  const hh = m[3] != null || m[6] != null;
  if (hh) {
    const h = Number(m[1] ?? m[4]);
    const min = Number(m[2] ?? m[5]);
    const s = Number(m[3] ?? m[6]);
    return { sec: h * 3600 + min * 60 + s, rest: line.slice(m[0].length).trim() };
  }
  const min = Number(m[1] ?? m[4]);
  const s = Number(m[2] ?? m[5]);
  return { sec: min * 60 + s, rest: line.slice(m[0].length).trim() };
}

function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function looksLikeTracklistLine(line: string): boolean {
  if (!line || line.length < 3 || line.length > 200) return false;
  if (SKIP_LINE.test(line)) return false;
  if (/^[#@]/.test(line)) return false;
  // numbered list / artist - title / ID
  if (/^\d{1,3}[.)]\s+\S/.test(line)) return true;
  if (ID_LINE.test(line)) return true;
  if (/\s[-–—]\s/.test(line)) return true;
  return false;
}

function classifyLine(
  rawLine: string,
  position: number,
  timestamp: number,
): RawPlay | null {
  let line = rawLine.trim();
  line = line.replace(/^\d{1,3}[.)]\s+/, "");
  if (!looksLikeTracklistLine(line) && !ID_LINE.test(line)) return null;

  const base = {
    position,
    timestamp,
    provenance: "soundcloud" as const,
    rawText: rawLine.trim(),
  };

  // ID forms
  if (/^id\s*[-–—]\s*id$/i.test(line) || /^id$/i.test(line)) {
    return {
      ...base,
      idStatus: "unresolved_id",
      idLabel: "ID - ID",
    };
  }
  const idArtist = line.match(/^(.+?)\s*[-–—]\s*id\b(.*)$/i);
  if (idArtist) {
    const suspected = idArtist[1].trim();
    return {
      ...base,
      idStatus: "unresolved_id",
      idLabel: `${suspected} - ID`,
      suspectedArtist: suspected || undefined,
      note: idArtist[2]?.trim() || undefined,
    };
  }
  if (/^id\s*[-–—]\s*(.+)$/i.test(line)) {
    return {
      ...base,
      idStatus: "unresolved_id",
      idLabel: line,
    };
  }

  // Artist - Title
  const parts = line.split(/\s[-–—]\s/);
  if (parts.length >= 2) {
    const artistName = parts[0].trim();
    const trackTitle = parts.slice(1).join(" - ").trim();
    if (artistName && trackTitle && !/^https?:/i.test(trackTitle)) {
      // If title still screams ID, keep unresolved
      if (/^id\b/i.test(trackTitle)) {
        return {
          ...base,
          idStatus: "unresolved_id",
          idLabel: `${artistName} - ID`,
          suspectedArtist: artistName,
        };
      }
      return {
        ...base,
        idStatus: "identified",
        trackTitle,
        artistName,
      };
    }
  }

  // Fallback: keep as unparsed raw so the set still shows the signal
  return {
    ...base,
    idStatus: "unparsed",
    rawText: rawLine.trim(),
  };
}

export function parseDescriptionTracklist(
  description: string | null | undefined,
  durationSec: number,
): RawPlay[] {
  if (!description?.trim()) return [];
  const text = stripHtml(description);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Prefer lines that carry a real cue timestamp. Track names without times are
  // still kept (they come from the upload description — not invented), but we
  // never synthesize filler tracks when the description has no tracklist.
  const stamped: { line: string; sec: number }[] = [];
  const unstamped: string[] = [];
  for (const line of lines) {
    const { sec, rest } = parseTimestampPrefix(line);
    const candidate = (rest || line).trim();
    if (!candidate) continue;
    if (sec != null) {
      if (looksLikeTracklistLine(candidate) || ID_LINE.test(candidate)) {
        stamped.push({ line: candidate, sec: Math.min(durationSec, sec) });
      }
      continue;
    }
    if (looksLikeTracklistLine(candidate) || ID_LINE.test(candidate)) {
      unstamped.push(candidate);
    }
  }

  // If the description has timed cues, trust those only — avoids mixing real
  // cue points with evenly-spaced guesses from leftover prose lines.
  const chosen =
    stamped.length > 0
      ? stamped.map((s, i) => ({ line: s.line, sec: s.sec, position: i + 1 }))
      : unstamped.map((line, i) => ({
          line,
          // Order-only placement when the source omitted timestamps.
          sec: Math.round((durationSec * (i + 1)) / (unstamped.length + 1)),
          position: i + 1,
        }));

  const plays: RawPlay[] = [];
  for (const row of chosen) {
    const play = classifyLine(row.line, row.position, row.sec);
    if (play) plays.push(play);
  }
  return plays.map((p, i) => ({ ...p, position: i + 1 }));
}

export function parseTimedComments(
  comments: { body?: string; timestamp?: number | null }[],
  durationSec: number,
  startPosition = 1,
): RawPlay[] {
  const timed = comments
    .filter((c) => c.body?.trim() && c.timestamp != null && c.timestamp >= 0)
    .map((c) => ({
      body: c.body!.trim(),
      sec: Math.min(durationSec, Math.round((c.timestamp as number) / 1000)),
    }))
    .sort((a, b) => a.sec - b.sec);

  const plays: RawPlay[] = [];
  let pos = startPosition;
  for (const c of timed) {
    // Only keep comments that look like track IDs / tracklist rows
    if (!looksLikeTracklistLine(c.body) && !ID_LINE.test(c.body) && !/\?/.test(c.body)) {
      // "what is this" style ID requests → unresolved at that timestamp
      if (/\b(id|track|song|tune)\b/i.test(c.body)) {
        plays.push({
          position: pos++,
          timestamp: c.sec,
          provenance: "soundcloud",
          idStatus: "unresolved_id",
          idLabel: "ID - ID",
          note: c.body.slice(0, 160),
          rawText: c.body,
        });
      }
      continue;
    }
    const play = classifyLine(c.body, pos, c.sec);
    if (play) {
      plays.push(play);
      pos += 1;
    }
  }
  return plays;
}

/**
 * Merge description plays with timed-comment plays.
 * Description wins for structure; comments fill gaps / add unresolved IDs.
 */
export function mergeTracklistSignals(
  fromDescription: RawPlay[],
  fromComments: RawPlay[],
): RawPlay[] {
  if (fromDescription.length === 0) {
    return fromComments.map((p, i) => ({ ...p, position: i + 1 }));
  }
  if (fromComments.length === 0) return fromDescription;

  // Keep description as primary; append comment unresolved IDs whose timestamps
  // don't collide (±15s) with an existing row.
  const merged = [...fromDescription];
  for (const c of fromComments) {
    if (c.idStatus !== "unresolved_id" && c.idStatus !== "unparsed") continue;
    const clash = merged.some((p) => Math.abs(p.timestamp - c.timestamp) < 15);
    if (clash) continue;
    merged.push(c);
  }
  merged.sort((a, b) => a.timestamp - b.timestamp || a.position - b.position);
  return merged.map((p, i) => ({ ...p, position: i + 1 }));
}
