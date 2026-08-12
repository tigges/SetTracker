/**
 * Parse mix descriptions and timed comments into tracklist rows.
 * Used by SoundCloud + hearthis (and later YouTube) adapters.
 *
 * Honest mapping:
 * - "Artist - Title" → identified (best-effort; not Beatport-verified)
 * - "Artist - ID" / "ID - ID" / bare "ID" → unresolved_id
 * - timestamped lines we can't classify → unparsed
 * - non-tracklist noise (links, follow CTAs) is dropped
 */

import type { Provenance } from "../../status";
import type { RawPlay } from "../types";

const TS_PREFIX =
  /^(?:\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?|\(?(\d{1,2}):(\d{2})(?::(\d{2}))?\)?)\s*[-–—.:]?\s*/;

/** Strip matching wrapping quotes: "Title" / 'Title' / “Title” / ‘Title’. */
function stripWrappingQuotes(s: string): string {
  const t = s.trim();
  const pairs: [string, string][] = [
    ['"', '"'],
    ["'", "'"],
    ["\u201c", "\u201d"],
    ["\u2018", "\u2019"],
  ];
  for (const [open, close] of pairs) {
    if (t.length >= 2 && t.startsWith(open) && t.endsWith(close)) {
      return t.slice(1, -1).trim();
    }
  }
  return t;
}

/** Trailing cue: "1. Artist - Title 00:39" / "... (12:05)" */
const TS_SUFFIX =
  /\s*[-([]?(\d{1,2}):(\d{2})(?::(\d{2}))?[\])]?\s*$/;

const SKIP_LINE =
  /^(https?:\/\/|www\.|stream\b|download\b|follow\b|subscribe\b|merch\b|spotify\b|instagram\b|tiktok\b|facebook\b|booking\b|out now\b|free download\b|linktr\.ee|shout out\b|latest updates\b)/i;

const ID_LINE =
  /^(?:id\b.*|.*\bid\b)$/i;

function tsToSec(
  a: string,
  b: string,
  c: string | undefined,
): number {
  if (c != null) return Number(a) * 3600 + Number(b) * 60 + Number(c);
  return Number(a) * 60 + Number(b);
}

function parseTimestampPrefix(line: string): { sec: number | null; rest: string } {
  const m = line.match(TS_PREFIX);
  if (!m) return { sec: null, rest: line };
  const hh = m[3] != null || m[6] != null;
  if (hh) {
    return {
      sec: tsToSec(m[1] ?? m[4], m[2] ?? m[5], m[3] ?? m[6]),
      rest: line.slice(m[0].length).trim(),
    };
  }
  return {
    sec: tsToSec(m[1] ?? m[4], m[2] ?? m[5], undefined),
    rest: line.slice(m[0].length).trim(),
  };
}

function parseTimestampSuffix(line: string): { sec: number | null; rest: string } {
  const m = line.match(TS_SUFFIX);
  if (!m) return { sec: null, rest: line };
  // Avoid treating track numbers like "1. Title" as a trailing cue — require
  // the suffix to not be the whole numbered prefix we already stripped logic for.
  const rest = line.slice(0, m.index).trim();
  if (!rest || rest.length < 3) return { sec: null, rest: line };
  return { sec: tsToSec(m[1], m[2], m[3]), rest };
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
  // numbered list / artist - title / ID (also "01 | Artist - Title")
  if (/^\d{1,3}([.)]|\s*[.|]\s+)\S/.test(line)) return true;
  if (ID_LINE.test(line)) return true;
  if (/\s[-–—]\s/.test(line)) return true;
  return false;
}

/** Title-only cue after a timestamp (Cercle / some venue uploads). */
function looksLikeTimestampedTitle(line: string): boolean {
  if (!line || line.length < 2 || line.length > 200) return false;
  if (SKIP_LINE.test(line)) return false;
  if (/^[#@]/.test(line)) return false;
  if (/^(track\s*list|set\s*list|tracklist|setlist)\b[:\s]*$/i.test(line)) {
    return false;
  }
  // Drop obvious promo / section headers that sometimes sit near cues
  if (
    /^(join|follow|subscribe|about the artist|socials?|watch more|community)\b/i.test(
      line,
    )
  ) {
    return false;
  }
  return true;
}

function classifyLine(
  rawLine: string,
  position: number,
  timestamp: number,
  provenance: Provenance,
): RawPlay | null {
  let line = rawLine.trim();
  // "1. ", "01)", "01 | " prefixes from pasted tracklists (require separator)
  line = line.replace(/^\d{1,3}\s*[.)|]\s+/, "");
  const looseTitle =
    !looksLikeTracklistLine(line) &&
    !ID_LINE.test(line) &&
    looksLikeTimestampedTitle(line);

  if (!looksLikeTracklistLine(line) && !ID_LINE.test(line) && !looseTitle) {
    return null;
  }

  const base = {
    position,
    timestamp,
    provenance,
    rawText: rawLine.trim(),
  };

  // Venue-style "00:00:00 Song Title" with no artist credit
  if (looseTitle) {
    const trackTitle = stripWrappingQuotes(
      line.replace(/\s*[-–—]\s*$/, "").trim(),
    );
    if (!trackTitle) return null;
    return {
      ...base,
      idStatus: "identified",
      trackTitle,
    };
  }

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
    const artistName = stripWrappingQuotes(parts[0].trim());
    const trackTitle = stripWrappingQuotes(parts.slice(1).join(" - ").trim());
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

/**
 * Fill missing cue times. Known stamps stay; gaps interpolate between
 * neighboring anchors (0 at start, durationSec at end).
 */
export function fillSparseTimestamps(
  rows: { line: string; sec: number | null }[],
  durationSec: number,
): { line: string; sec: number }[] {
  const n = rows.length;
  if (n === 0) return [];
  const dur = Math.max(1, durationSec);
  const known = rows
    .map((r, i) =>
      r.sec != null && Number.isFinite(r.sec)
        ? { i, s: Math.min(dur, Math.max(0, r.sec)) }
        : null,
    )
    .filter((x): x is { i: number; s: number } => x != null);

  if (known.length === 0) {
    return rows.map((r, i) => ({
      line: r.line,
      sec: Math.round((dur * (i + 1)) / (n + 1)),
    }));
  }
  if (known.length === n) {
    return rows.map((r, i) => ({ line: r.line, sec: known.find((k) => k.i === i)!.s }));
  }

  const out = new Array<number>(n);
  const anchors = [{ i: -1, s: 0 }, ...known, { i: n, s: dur }];
  for (let a = 0; a < anchors.length - 1; a++) {
    const left = anchors[a]!;
    const right = anchors[a + 1]!;
    const span = right.i - left.i;
    if (span <= 0) continue;
    for (let i = left.i + 1; i < right.i; i++) {
      const t = (i - left.i) / span;
      out[i] = Math.round(left.s + t * (right.s - left.s));
    }
    if (right.i >= 0 && right.i < n) out[right.i] = right.s;
  }

  let prev = 0;
  for (let i = 0; i < n; i++) {
    let s = Math.min(dur, Math.max(0, out[i] ?? 0));
    if (s < prev) s = prev;
    out[i] = s;
    prev = s;
  }
  return rows.map((r, i) => ({ line: r.line, sec: out[i]! }));
}

export function parseDescriptionTracklist(
  description: string | null | undefined,
  durationSec: number,
  provenance: Provenance = "soundcloud",
): RawPlay[] {
  if (!description?.trim()) return [];
  const text = stripHtml(description);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Collect tracklist rows in document order. Some uploads (hearthis "Track
  // List:" blocks) are mostly untimed with a few trailing cue annotations —
  // keeping order matters more than dropping the untimed majority.
  const rows: { line: string; sec: number | null }[] = [];
  for (const line of lines) {
    let sec: number | null = null;
    let candidate = line;
    const prefix = parseTimestampPrefix(line);
    if (prefix.sec != null) {
      sec = prefix.sec;
      candidate = prefix.rest;
    } else {
      const suffix = parseTimestampSuffix(line);
      if (suffix.sec != null) {
        sec = suffix.sec;
        candidate = suffix.rest;
      }
    }
    candidate = candidate.trim();
    if (!candidate) continue;

    const trackish =
      looksLikeTracklistLine(candidate) ||
      ID_LINE.test(candidate) ||
      (sec != null && looksLikeTimestampedTitle(candidate));
    if (!trackish) continue;

    rows.push({
      line: candidate,
      sec: sec != null ? Math.min(durationSec, sec) : null,
    });
  }

  const timedCount = rows.filter((r) => r.sec != null).length;
  const untimedCount = rows.length - timedCount;

  // Dense untimed tracklist + sparse cue annotations → keep all rows and
  // interpolate. Otherwise prefer timed-only (avoids promo "Artist - Title"
  // crumbs next to a real timed list) or even-space a fully untimed list.
  const keepSparseUntimed =
    timedCount > 0 &&
    untimedCount >= Math.max(5, timedCount * 2);

  const chosen = keepSparseUntimed
    ? fillSparseTimestamps(rows, durationSec)
    : timedCount > 0
      ? rows
          .filter((r) => r.sec != null)
          .map((r) => ({ line: r.line, sec: r.sec as number }))
      : fillSparseTimestamps(rows, durationSec);

  const plays: RawPlay[] = [];
  for (let i = 0; i < chosen.length; i++) {
    const row = chosen[i]!;
    const play = classifyLine(row.line, i + 1, row.sec, provenance);
    if (play) plays.push(play);
  }
  return plays.map((p, i) => ({ ...p, position: i + 1 }));
}

export function parseTimedComments(
  comments: { body?: string; timestamp?: number | null }[],
  durationSec: number,
  startPosition = 1,
  provenance: Provenance = "soundcloud",
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
          provenance,
          idStatus: "unresolved_id",
          idLabel: "ID - ID",
          note: c.body.slice(0, 160),
          rawText: c.body,
        });
      }
      continue;
    }
    const play = classifyLine(c.body, pos, c.sec, provenance);
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
