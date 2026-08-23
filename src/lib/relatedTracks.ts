/**
 * "More like this" for a track page — shared DJs, then same artist / label.
 *
 * Candidates should already be crossing (2+ primary DJs) so they have a page.
 */

import { compareTrackChart, type TrackChartAgg } from "./trackChart";

export const TRACK_RELATED_LIMIT = 8;
export const TRACK_RELATED_SHARED_DJS = 2;

export type RelatedTrackScore = TrackChartAgg & {
  sharedDjCount: number;
  sameArtist: boolean;
  sameLabel: boolean;
};

export function isRelatedTrack(row: RelatedTrackScore): boolean {
  return (
    row.sharedDjCount >= TRACK_RELATED_SHARED_DJS ||
    row.sameArtist ||
    row.sameLabel
  );
}

export function compareRelatedTracks(
  a: RelatedTrackScore,
  b: RelatedTrackScore,
): number {
  if (a.sharedDjCount !== b.sharedDjCount) {
    return b.sharedDjCount - a.sharedDjCount;
  }
  if (a.sameArtist !== b.sameArtist) {
    return Number(b.sameArtist) - Number(a.sameArtist);
  }
  if (a.sameLabel !== b.sameLabel) {
    return Number(b.sameLabel) - Number(a.sameLabel);
  }
  return compareTrackChart(a, b);
}

export function rankRelatedTracks(
  rows: RelatedTrackScore[],
  limit = TRACK_RELATED_LIMIT,
): RelatedTrackScore[] {
  return rows.filter(isRelatedTrack).sort(compareRelatedTracks).slice(0, limit);
}
