/**
 * Curated SoundCloud playlists of long-form DJ / festival sets.
 *
 * Parallel to youtube/playlists.ts. Prefer set-oriented playlists —
 * not EP/remix album tabs on artist profiles.
 */

export type SoundCloudPlaylistSource = {
  /** Playlist permalink URL or numeric id */
  playlist: string;
  seriesName: string;
  genre: string;
  accent: string;
  limit?: number;
  minDurationSec?: number;
  titleMatch?: RegExp;
};

const PL_LIMIT = Number(process.env.SOUNDCLOUD_PLAYLIST_TRACK_LIMIT || 80);

export const SOUNDCLOUD_PLAYLISTS: SoundCloudPlaylistSource[] = [
  {
    // Fan-curated festival / club lives matching Dom Dolla Drumsheds-adjacent
    // set lists (Chris Lake, Mau P, Odd Mob, SIDEPIECE, Westend, Layton, …).
    // Official Dom Dolla lives also appear here and dedupe via sourceSlug.
    playlist: "https://soundcloud.com/thomasm12_21/sets/lift-sets",
    seriesName: "Lift Sets",
    genre: "Tech House",
    accent: "#ff4d6d",
    limit: PL_LIMIT,
    minDurationSec: 35 * 60,
    titleMatch:
      /\b(live|b2b|set|festival|edc|ultra|space|tomorrowland|drumsheds|creamfields|closing|sunrise)\b/i,
  },
  {
    // Official Dom Dolla // Live Sets (redundant with show poll, but keeps
    // series naming + catches lives that fall outside show titleMatch).
    playlist: "https://soundcloud.com/domdolla/sets/sets-n-thangs",
    seriesName: "Dom Dolla Live",
    genre: "Tech House",
    accent: "#ff4d6d",
    limit: 25,
    minDurationSec: 40 * 60,
    titleMatch: /\b(live|b2b|set|creamfields|stadium|drumsheds|edc)\b/i,
  },
];

export function isScPlaylistSetCandidate(
  title: string,
  durationSec: number,
  pl: SoundCloudPlaylistSource,
): boolean {
  const min = pl.minDurationSec ?? 35 * 60;
  if (durationSec >= min) return true;
  if (pl.titleMatch?.test(title) && durationSec >= 15 * 60) return true;
  return false;
}
