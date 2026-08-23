/**
 * Apple Music continuous DJ-mix albums list per-track *segment* durations
 * (rows titled “(Mixed)”). Accumulate those official lengths into start
 * clocks. That is first-party segment math, not even-space interpolation.
 *
 * iTunes Lookup returns the album shell only for many Apple Music–only
 * mixes — do not scrape music.apple.com from CI. Operator paste or
 * `scripts/capture-applemusic.console.js` on the album page they already
 * have open. Never a set / playback source (we embed SC / Mixcloud / YT).
 */

import type { RawPlay } from "../types";

const DUR_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const TRAILING_DUR =
  /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;
const MIXED_TAG = /\s*[(\[]\s*mixed\s*[)\]]\s*$/i;

export function parseAppleDuration(token: string): number | null {
  const m = token.trim().match(DUR_RE);
  if (!m) return null;
  if (m[3] != null) {
    return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

export function stripMixedTag(title: string): { title: string; mixName?: string } {
  const t = title.trim();
  if (!MIXED_TAG.test(t)) return { title: t };
  return { title: t.replace(MIXED_TAG, "").trim(), mixName: "Mixed" };
}

export type AppleMixRow = {
  artistName: string;
  trackTitle: string;
  durationSec: number;
};

/** Accumulate official segment lengths → start timestamps. */
export function appleMixRowsToPlays(
  rows: AppleMixRow[],
  mixDurationSec = 0,
): RawPlay[] {
  const plays: RawPlay[] = [];
  let cursor = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const { title, mixName } = stripMixedTag(row.trackTitle);
    if (!title || row.durationSec <= 0) continue;
    const cap = mixDurationSec > 0 ? mixDurationSec : cursor + row.durationSec;
    plays.push({
      position: plays.length + 1,
      timestamp: Math.min(cursor, cap),
      idStatus: "identified",
      provenance: "applemusic",
      artistName: row.artistName.trim(),
      trackTitle: title,
      mixName,
      durationSec: row.durationSec,
      rawText: `${row.artistName} - ${row.trackTitle} ${row.durationSec}`,
    });
    cursor += row.durationSec;
  }
  return plays;
}

function looksLikeDurationLine(line: string): boolean {
  return DUR_RE.test(line.trim());
}

function looksLikeIndex(line: string): boolean {
  return /^\d{1,3}\.?$/.test(line.trim());
}

/**
 * Parse a pasted Apple Music mix tracklist.
 * Accepts stacked rows (index / title / artists / mm:ss) or a trailing
 * duration on the title line.
 */
export function parseAppleMusicMixTracklist(
  text: string | null | undefined,
  mixDurationSec = 0,
): RawPlay[] {
  if (!text?.trim()) return [];
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((l) => !/^(preview|play|shuffle|explicit)$/i.test(l));

  const rows: AppleMixRow[] = [];
  let i = 0;
  while (i < lines.length) {
    if (looksLikeIndex(lines[i]!)) i += 1;
    if (i >= lines.length) break;

    const trailing = lines[i]!.match(TRAILING_DUR);
    if (trailing && trailing.index != null && trailing.index > 3) {
      const dur = parseAppleDuration(trailing[0]!);
      const rest = lines[i]!.slice(0, trailing.index).trim()
        .replace(/^\d{1,3}\.\s*/, "");
      i += 1;
      if (dur == null) continue;
      const split = rest.match(/^(.+?)\s+[-–—]\s+(.+)$/);
      if (split) {
        rows.push({
          artistName: split[1]!.trim(),
          trackTitle: split[2]!.trim(),
          durationSec: dur,
        });
      } else if (i < lines.length && !looksLikeDurationLine(lines[i]!) && !looksLikeIndex(lines[i]!)) {
        rows.push({
          artistName: lines[i]!.trim(),
          trackTitle: rest,
          durationSec: dur,
        });
        i += 1;
      }
      continue;
    }

    if (i + 2 < lines.length && looksLikeDurationLine(lines[i + 2]!)) {
      const title = lines[i]!.replace(/^\d{1,3}\.\s*/, "");
      const artist = lines[i + 1]!;
      const dur = parseAppleDuration(lines[i + 2]!);
      i += 3;
      if (dur == null || looksLikeDurationLine(title) || looksLikeIndex(artist)) {
        continue;
      }
      rows.push({
        artistName: artist,
        trackTitle: title,
        durationSec: dur,
      });
      continue;
    }

    i += 1;
  }

  return appleMixRowsToPlays(rows, mixDurationSec);
}
