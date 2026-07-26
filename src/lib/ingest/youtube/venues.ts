/**
 * Curated venue / media YouTube channels that publish long-form DJ sets.
 *
 * Channel is the series; DJ is inferred from the video title.
 * We only keep long uploads and skip trailers / aftermovies.
 */

export type YoutubeVenueChannel = {
  /** @handle or channel URL */
  channel: string;
  /** Series label on the set */
  seriesName: string;
  genre: string;
  accent: string;
  /** Max recent uploads to inspect */
  limit?: number;
  minDurationSec?: number;
  /** Optional title filter — when set, shorter videos can still qualify */
  titleMatch?: RegExp;
};

const VENUE_LIMIT = Number(process.env.YOUTUBE_VENUE_VIDEO_LIMIT || 40);

export const YOUTUBE_VENUES: YoutubeVenueChannel[] = [
  {
    channel: "@boilerroom",
    seriesName: "Boiler Room",
    genre: "Electronic",
    accent: "#e10600",
    limit: VENUE_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch: /\b(boiler room|b2b|live|set)\b/i,
  },
  {
    channel: "@Cercle",
    seriesName: "Cercle",
    genre: "Electronic",
    accent: "#1a1a1a",
    limit: VENUE_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch: /\b(cercle|live at|live from)\b/i,
  },
  {
    channel: "@Mixmag",
    seriesName: "Mixmag",
    genre: "Electronic",
    accent: "#111111",
    limit: VENUE_LIMIT,
    minDurationSec: 25 * 60,
    titleMatch: /\b(mixmag|lab|mix|live|set)\b/i,
  },
  {
    channel: "@DefectedRecords",
    seriesName: "Defected",
    genre: "House",
    accent: "#c1121f",
    limit: VENUE_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch: /\b(defected|in the house|glitterbox|live|mix|set)\b/i,
  },
  {
    channel: "@HotSince82",
    seriesName: "Hot Since 82",
    genre: "Tech House",
    accent: "#e9c46a",
    limit: Math.min(VENUE_LIMIT, 30),
    minDurationSec: 40 * 60,
    titleMatch: /\b(knee deep|hot since|live|mix|set|radio)\b/i,
  },
  {
    channel: "@Tomorrowland",
    seriesName: "Tomorrowland",
    genre: "Electronic",
    accent: "#7b2cbf",
    limit: VENUE_LIMIT,
    minDurationSec: 35 * 60,
    titleMatch: /\b(tomorrowland|live|set|mainstage|freedom)\b/i,
  },
  {
    channel: "@insomniac",
    seriesName: "Insomniac",
    genre: "Electronic",
    accent: "#ff006e",
    limit: VENUE_LIMIT,
    minDurationSec: 35 * 60,
    titleMatch: /\b(edc|beyond|countdown|live|set|insomniac)\b/i,
  },
  {
    channel: "@DJMag",
    seriesName: "DJ Mag",
    genre: "Electronic",
    accent: "#000000",
    limit: Math.min(VENUE_LIMIT, 30),
    minDurationSec: 25 * 60,
    titleMatch: /\b(dj mag|live|mix|set|studio|session)\b/i,
  },
];

const SKIP_TITLE =
  /\b(aftermovie|trailer|teaser|tickets?|announcement|#shorts|short film|documentary|vlog)\b/i;

export function isVenueSetCandidate(
  title: string,
  durationSec: number,
  venue: YoutubeVenueChannel,
): boolean {
  if (SKIP_TITLE.test(title)) return false;
  const min = venue.minDurationSec ?? 30 * 60;
  if (durationSec >= min) return true;
  if (venue.titleMatch?.test(title) && durationSec >= 15 * 60) return true;
  return false;
}

/**
 * Infer performing DJ from common venue title patterns:
 * - "Artist | Mixmag Lab London"
 * - "Artist live at Cercle Odyssey, Paris"
 * - "Artist @ Boiler Room"
 * - "Artist B2B Artist | Boiler Room …"
 */
export function artistFromVenueTitle(title: string): string {
  const cleaned = title.replace(/\s+/g, " ").trim();
  let m = cleaned.match(/^(.+?)\s+live\s+(?:at|from)\s+/i);
  if (m) return tidyArtist(m[1]);
  m = cleaned.match(/^(.+?)\s+@\s+/i);
  if (m) return tidyArtist(m[1]);
  m = cleaned.match(/^(.+?)\s+[|]\s+/);
  if (m) return tidyArtist(m[1]);
  m = cleaned.match(/^(.+?)\s+[–—]\s+/);
  if (m) return tidyArtist(m[1]);
  return tidyArtist(cleaned);
}

function tidyArtist(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s+b2b\s+/gi, " b2b ")
    .trim();
}
