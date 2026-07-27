/**
 * Map hearthis `/playlist/` entries → RawPlay[] via the shared description
 * parser (same Artist - Title / ID classification as SC / YT).
 */

import {
  parseDescriptionTracklist,
} from "../soundcloud/parseTracklist";
import type { RawPlay } from "../types";
import { asInt, type HtPlaylistEntry } from "./client";

/** Format seconds as `m:ss` or `h:mm:ss` for the shared timestamp prefix parser. */
export function formatHearthisCue(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Convert structured playlist rows to plays.
 * Drops empty gap rows; sorts by start so out-of-order `start=0` first-track
 * rows (common on hearthis) land at the top.
 */
export function playlistEntriesToPlays(
  entries: HtPlaylistEntry[],
  durationSec: number,
): RawPlay[] {
  if (!entries.length || durationSec <= 0) return [];

  const rows = entries
    .map((e) => ({
      start: asInt(e.start),
      text: (e.text ?? "").trim(),
    }))
    .filter((e) => e.text.length > 0)
    .sort((a, b) => a.start - b.start || a.text.localeCompare(b.text));

  if (!rows.length) return [];

  const description = rows
    .map((r) => `${formatHearthisCue(r.start)} ${r.text}`)
    .join("\n");
  return parseDescriptionTracklist(description, durationSec, "hearthis");
}
