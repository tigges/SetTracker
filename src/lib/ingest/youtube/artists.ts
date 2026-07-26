/**
 * DJ YouTube channels derived from the artist roster.
 * Deep-scanned via fetchChannelVideoIdsDeep (videos + streams + continuation).
 */

import { ARTIST_ROSTER } from "../roster";

export type YoutubeArtistChannel = {
  channel: string;
  primaryName: string;
  genre: string;
  accent: string;
  limit?: number;
  minDurationSec?: number;
};

const DEFAULT_LIMIT = Number(process.env.YOUTUBE_ARTIST_VIDEO_LIMIT || 50);
const HIGH_LIMIT = Number(process.env.YOUTUBE_ARTIST_VIDEO_LIMIT_HIGH || 80);

export const YOUTUBE_ARTIST_CHANNELS: YoutubeArtistChannel[] = ARTIST_ROSTER
  .filter((a) => a.youtube?.handle && a.youtube.status !== "missing")
  .map((a) => ({
    channel: a.youtube!.handle,
    primaryName: a.name,
    genre: a.genre,
    accent: a.accent,
    limit: a.priority === "high" ? HIGH_LIMIT : DEFAULT_LIMIT,
    minDurationSec: 18 * 60,
  }));

const SKIP_TITLE =
  /\b(aftermovie|trailer|teaser|tickets?|announcement|#shorts|visualiser|lyric video|official video|conversation with|interview|podcast|vlog)\b/i;

export function isArtistChannelSetCandidate(
  title: string,
  durationSec: number,
  ch: YoutubeArtistChannel,
): boolean {
  if (SKIP_TITLE.test(title)) return false;
  const min = ch.minDurationSec ?? 18 * 60;
  if (durationSec >= min) return true;
  return (
    durationSec >= 12 * 60 &&
    /\b(live|mix|set|b2b|radio|heldeep|essentials|in\s+the\s+mix|open\s*to\s*close)\b/i.test(
      title,
    )
  );
}
