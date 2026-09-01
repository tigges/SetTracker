/**
 * /tracks browse chart — crossing DJs, not raw play count.
 *
 * A radio ident in 30 episodes of the same show is catalog coverage, not a
 * chart. Rank by how many primary DJs mixed the track; hide one-DJ rows.
 * Set intros and unresolved ID placeholders are not songs.
 */

import { isPlaceholderTitle } from "./playCollapse";

export const TRACK_CHART_MIN_DJS = 2;
/** `/tracks` index — top crossing tracks by DJ spread. */
export const TRACK_CHART_INDEX_LIMIT = 100;
/** Static `/tracks/[slug]` pages. Drop weakest 2-DJ rows first if over cap. */
export const TRACK_PAGE_EXPORT_CAP = 400;

export type TrackChartAgg = {
  trackId: string;
  playCount: number;
  setCount: number;
  djCount: number;
  eventCount: number;
  title?: string;
  artistName?: string;
};

/** Unresolved ID rows and set-open intros — not a crossing song. */
export function isChartJunkTrack(
  title: string | null | undefined,
  artistName?: string | null,
): boolean {
  const t = (title ?? "").replace(/\s+/g, " ").trim();
  const a = (artistName ?? "").replace(/\s+/g, " ").trim();
  if (isPlaceholderTitle(t) || isPlaceholderTitle(a)) return true;
  if (/^id(\s*[(\[]id(?:\s+remix)?[)\]])?$/i.test(t) && (!a || /^id$/i.test(a))) {
    return true;
  }
  if (/^id$/i.test(a) && /^id\b/i.test(t)) return true;
  if (/^(show\s+)?(intro|outro)(\s+id)?$/i.test(t)) return true;
  if (/[-–—]\s*(intro|outro)\s*$/i.test(t)) return true;
  return false;
}

export function isTrackChartRow(
  row: Pick<TrackChartAgg, "djCount" | "title" | "artistName">,
): boolean {
  if (row.djCount < TRACK_CHART_MIN_DJS) return false;
  if (row.title != null || row.artistName != null) {
    return !isChartJunkTrack(row.title, row.artistName);
  }
  return true;
}

/** Unique DJs, then venues, then sets, then raw plays. */
export function compareTrackChart(a: TrackChartAgg, b: TrackChartAgg): number {
  if (a.djCount !== b.djCount) return b.djCount - a.djCount;
  if (a.eventCount !== b.eventCount) return b.eventCount - a.eventCount;
  if (a.setCount !== b.setCount) return b.setCount - a.setCount;
  return b.playCount - a.playCount;
}

export function rankTrackChart(
  rows: TrackChartAgg[],
  limit: number,
): TrackChartAgg[] {
  return rows.filter(isTrackChartRow).sort(compareTrackChart).slice(0, limit);
}
