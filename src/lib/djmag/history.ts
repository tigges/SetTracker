/**
 * DJ Mag Top 100 year archives (storage / lookup only — no UI).
 * DJs 2016–2025, clubs 2018–2026, festivals 2026 + inferred 2025.
 */

import djsRaw from "../../../data/chart-history/djmag-djs.json";
import clubsRaw from "../../../data/chart-history/djmag-clubs.json";
import festivalsRaw from "../../../data/chart-history/djmag-festivals.json";
import {
  normalizeChartSlug,
  type DjMagChartEntry,
  type DjMagChartKind,
} from "./parseList";

type HistoryFile = {
  kind?: DjMagChartKind;
  years?: number[];
  entries?: DjMagChartEntry[];
};

const FILES: Record<DjMagChartKind, HistoryFile> = {
  dj: djsRaw as HistoryFile,
  club: clubsRaw as HistoryFile,
  festival: festivalsRaw as HistoryFile,
};

export function loadDjMagHistory(kind: DjMagChartKind): DjMagChartEntry[] {
  return FILES[kind].entries ?? [];
}

export function djMagHistoryYears(kind: DjMagChartKind): number[] {
  return FILES[kind].years ?? [];
}

/** Ranks for one chart slug, oldest year first. */
export function djMagRanksBySlug(
  kind: DjMagChartKind,
  slug: string,
): Array<{ year: number; rank: number; change: string | null }> {
  const key = normalizeChartSlug(slug);
  return loadDjMagHistory(kind)
    .filter((e) => e.slug === key)
    .sort((a, b) => a.year - b.year)
    .map((e) => ({ year: e.year, rank: e.rank, change: e.change }));
}
