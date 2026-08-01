/**
 * Format parsed 1001 plays / capture rows as FingerprintSeedRow TS for
 * festival2026.ts / TRACKLIST_1001_BY_SOURCE_SLUG.
 */

import type { FingerprintSeedRow } from "../fingerprint/seeds";
import { parseClockToSec } from "../fingerprint/seeds";
import type { RawPlay } from "../types";

export type CaptureRow = {
  at?: string;
  artist: string;
  title: string;
  /** true when 1001 marked this as a w/ overlay */
  withPrev?: boolean;
};

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Drop bare ID / Artist–ID placeholders (keep "… (ID Remix)"). */
export function isBareIdRow(artist: string, title: string): boolean {
  const a = artist.trim();
  const t = title.trim();
  if (!a && !t) return true;
  if (/^id$/i.test(a) && /^id$/i.test(t)) return true;
  if (/^id$/i.test(t)) return true;
  return false;
}

/** Split "Artist - Title" (first dash). */
export function splitArtistTitle(raw: string): { artist: string; title: string } {
  const cleaned = raw
    .replace(/\s*\[[^\]]+\](?:\s*\/\s*\[[^\]]+\])*\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const m = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (!m) return { artist: cleaned, title: "ID" };
  return { artist: m[1]!.trim(), title: m[2]!.trim() };
}

export function playsToCaptureRows(plays: RawPlay[]): CaptureRow[] {
  const out: CaptureRow[] = [];
  for (const p of plays) {
    const artist = (p.artistName || "").trim();
    const title = (p.trackTitle || "").trim();
    if (!title || isBareIdRow(artist || "ID", title)) continue;
    const row: CaptureRow = {
      artist: artist || "Unknown",
      title,
    };
    if (typeof p.timestamp === "number" && p.timestamp >= 0) {
      row.at = formatClock(p.timestamp);
    }
    out.push(row);
  }
  return out;
}

export function captureRowsToSeedRows(
  rows: CaptureRow[],
  opts: { evenlySpaceDurationSec?: number } = {},
): FingerprintSeedRow[] {
  const timed = rows.filter((r) => r.at && parseClockToSec(r.at) != null);
  if (
    opts.evenlySpaceDurationSec != null &&
    timed.length < Math.max(3, Math.floor(rows.length * 0.4))
  ) {
    const n = rows.length;
    if (!n) return [];
    const usable = Math.max(60, opts.evenlySpaceDurationSec - 45);
    const step = Math.max(45, Math.floor(usable / n));
    return rows.map((r, i) => ({
      at: r.at && parseClockToSec(r.at) != null ? r.at : formatClock(20 + i * step),
      artist: r.artist,
      title: r.title,
    }));
  }
  return rows.map((r, i) => ({
    at: r.at && parseClockToSec(r.at) != null ? r.at! : formatClock(i * 90),
    artist: r.artist,
    title: r.title,
  }));
}

/** Pretty-print a TS array literal for pasting into festival2026.ts. */
export function formatSeedTs(
  rows: FingerprintSeedRow[],
  opts: {
    constName?: string;
    sourceUrl?: string;
    pageTitle?: string;
    sourceSlug?: string;
  } = {},
): string {
  const name = opts.constName || "TL_CAPTURED";
  const header = [
    `/**`,
    opts.pageTitle ? ` * ${opts.pageTitle}` : null,
    opts.sourceUrl ? ` * ${opts.sourceUrl}` : null,
    opts.sourceSlug
      ? ` * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["${opts.sourceSlug}"] = ${name}`
      : null,
    ` * Captured ${new Date().toISOString().slice(0, 10)} — provenance 1001tl.`,
    ` */`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = rows
    .map(
      (r) =>
        `  { at: "${esc(r.at)}", artist: "${esc(r.artist)}", title: "${esc(r.title)}" },`,
    )
    .join("\n");

  return `${header}\nexport const ${name}: FingerprintSeedRow[] = [\n${body}\n];\n`;
}
