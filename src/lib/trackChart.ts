/**
 * /tracks browse chart — crossing DJs, not raw play count.
 *
 * A radio ident in 30 episodes of the same show is catalog coverage, not a
 * chart. Rank by how many primary DJs mixed the track; hide one-DJ rows.
 */

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
};

export function isTrackChartRow(row: Pick<TrackChartAgg, "djCount">): boolean {
  return row.djCount >= TRACK_CHART_MIN_DJS;
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
