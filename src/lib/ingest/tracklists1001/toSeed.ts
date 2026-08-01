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

/**
 * Fill missing cues by lerping between neighboring known clocks.
 * Never invents `i * 90` placeholders (those break set order on partial
 * 1001 cue lists).
 */
export function interpolateMissingClocks(
  rows: CaptureRow[],
  durationSec: number,
): FingerprintSeedRow[] {
  const n = rows.length;
  if (!n) return [];

  const secs: (number | null)[] = rows.map((r) =>
    r.at != null ? parseClockToSec(r.at) : null,
  );
  const known = secs.filter((s): s is number => s != null).length;

  if (known === 0) {
    const usable = Math.max(60, durationSec - 45);
    const step = Math.max(45, Math.floor(usable / n));
    return rows.map((r, i) => ({
      at: formatClock(20 + i * step),
      artist: r.artist,
      title: r.title,
    }));
  }

  if (secs[0] == null) secs[0] = 0;
  if (secs[n - 1] == null) {
    secs[n - 1] = Math.max(secs[0] ?? 0, durationSec - 30);
  }

  for (let i = 0; i < n; i++) {
    if (secs[i] != null) continue;
    let lo = i - 1;
    while (lo >= 0 && secs[lo] == null) lo--;
    let hi = i + 1;
    while (hi < n && secs[hi] == null) hi++;
    const loSec = lo >= 0 ? secs[lo]! : 0;
    const hiSec = hi < n ? secs[hi]! : Math.max(loSec + 60, durationSec - 30);
    const loI = lo >= 0 ? lo : -1;
    const hiI = hi < n ? hi : n;
    const t = (i - loI) / Math.max(1, hiI - loI);
    secs[i] = Math.round(loSec + t * (hiSec - loSec));
  }

  for (let i = 1; i < n; i++) {
    if (secs[i]! <= secs[i - 1]!) secs[i] = secs[i - 1]! + 1;
  }

  return rows.map((r, i) => ({
    at: formatClock(secs[i]!),
    artist: r.artist,
    title: r.title,
  }));
}

export function captureRowsToSeedRows(
  rows: CaptureRow[],
  opts: { evenlySpaceDurationSec?: number } = {},
): FingerprintSeedRow[] {
  return interpolateMissingClocks(rows, opts.evenlySpaceDurationSec ?? 3600);
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
