/**
 * Curated venue / media YouTube channels that publish long-form DJ sets.
 *
 * Channel is the series; DJ is inferred from the video title.
 * We only keep long uploads and skip trailers / aftermovies.
 */

import type { RawArtist } from "../types";

export type YoutubeVenueChannel = {
  /** @handle or channel URL */
  channel: string;
  /** Series label on the set */
  seriesName: string;
  /**
   * Canonical Event slug from events.KNOWN_EVENTS when the channel brand
   * itself is the venue (not a guest festival inferred from the title).
   */
  eventSlug?: string;
  genre: string;
  accent: string;
  /**
   * Optional preferred primary (artist-owned playlists adapted as venues).
   * Venue channels leave this unset and infer the DJ from the title.
   */
  primaryArtist?: RawArtist;
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
    eventSlug: "boiler-room",
    genre: "House",
    accent: "#e10600",
    // Classic archive lives on YT; poll deeper than default venue cap.
    limit: Math.max(VENUE_LIMIT, Number(process.env.BOILERROOM_YT_LIMIT || 80)),
    minDurationSec: 30 * 60,
    titleMatch: /\b(boiler room|b2b|live|set)\b/i,
  },
  {
    channel: "@Cercle",
    seriesName: "Cercle",
    eventSlug: "cercle",
    genre: "House",
    accent: "#1a1a1a",
    limit: VENUE_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch: /\b(cercle|live at|live from)\b/i,
  },
  {
    // YouTube venue only — do NOT crawl mixmag.net editorial for industry context.
    channel: "@Mixmag",
    seriesName: "Mixmag",
    eventSlug: "mixmag",
    genre: "House",
    accent: "#111111",
    limit: VENUE_LIMIT,
    minDurationSec: 25 * 60,
    titleMatch: /\b(mixmag|lab|mix|live|set)\b/i,
  },
  {
    channel: "@DefectedRecords",
    seriesName: "Defected",
    eventSlug: "defected",
    genre: "House",
    accent: "#c1121f",
    limit: VENUE_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch: /\b(defected|in the house|glitterbox|live|mix|set)\b/i,
  },
  {
    channel: "@Hardfest",
    seriesName: "HARD",
    eventSlug: "hard-summer",
    genre: "Bass House",
    accent: "#ff0000",
    limit: Math.min(VENUE_LIMIT, 30),
    minDurationSec: 30 * 60,
    titleMatch:
      /\b(hard\s*(summer|fest)|holy\s*ship|day of the dead|live|set|mix)\b/i,
  },
  {
    channel: "@djoonclub",
    seriesName: "Djoon",
    eventSlug: "djoon",
    genre: "House",
    accent: "#c9a227",
    limit: Math.min(VENUE_LIMIT, 25),
    minDurationSec: 35 * 60,
    titleMatch: /\b(djoon|dj[øöo]{1,2}n|live|set|mix|session)\b/i,
  },
  {
    channel: "@Tomorrowland",
    seriesName: "Tomorrowland",
    eventSlug: "tomorrowland",
    genre: "House",
    accent: "#7b2cbf",
    // Deeper poll after festival weekend (Relive dumps) — see festivalDrops.
    limit: Math.max(
      VENUE_LIMIT,
      Number(process.env.TOMORROWLAND_YT_VENUE_LIMIT || 80),
    ),
    minDurationSec: 35 * 60,
    titleMatch: /\b(tomorrowland|live|set|mainstage|freedom|belgium|weekend)\b/i,
  },
  {
    channel: "@insomniac",
    seriesName: "Insomniac",
    eventSlug: "insomniac",
    genre: "House",
    accent: "#ff006e",
    limit: VENUE_LIMIT,
    minDurationSec: 35 * 60,
    titleMatch: /\b(edc|beyond|countdown|live|set|insomniac)\b/i,
  },
  {
    // YouTube channel catalog; denser discovery also via djmag.com/livesets
    // (`djmag-livesets` adapter) which shares sourceSlug `yt-{videoId}`.
    channel: "@DJMag",
    seriesName: "DJ Mag",
    eventSlug: "dj-mag",
    genre: "House",
    accent: "#000000",
    limit: Math.max(VENUE_LIMIT, Number(process.env.DJMAG_YT_LIMIT || 50)),
    minDurationSec: 20 * 60,
    titleMatch:
      /\b(dj\s*mag|live|mix|set|studio|session|hq|b2b|untold|ushua[iï]a)\b/i,
  },
  {
    channel: "@ushuaiaibiza",
    seriesName: "Ushuaïa Ibiza",
    eventSlug: "ushuaia-ibiza",
    genre: "House",
    accent: "#00b4d8",
    limit: VENUE_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch:
      /\b(ushua[iï]a|livestream|recorded live|audio mix|live|set|b2b|defected)\b/i,
  },
  {
    // James Hype’s label — livestreams + Bucharest lives (skip short releases).
    channel: "@STEREOHYPE",
    seriesName: "STEREOHYPE",
    eventSlug: "stereohype",
    genre: "Tech House",
    accent: "#ff3d6e",
    limit: Math.max(VENUE_LIMIT, 50),
    minDurationSec: 30 * 60,
    titleMatch:
      /\b(stereohype|live|livestream|guest mix|b2b|set|house\s*&\s*tech)\b/i,
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
  // DJ Mag: "Artist Techno Set From Pyramid at Amnesia Ibiza"
  m = cleaned.match(
    /^(.+?)\s+(?:full\s+)?(?:live\s+)?(?:show|set)\s+(?:live\s+)?(?:at|from)\s+/i,
  );
  if (m) return tidyArtist(m[1]);
  m = cleaned.match(/^(.+?)\s+@\s+/i);
  if (m) return tidyArtist(m[1]);
  m = cleaned.match(/^(.+?)\s+[|]\s+/);
  if (m) return tidyArtist(m[1]);
  m = cleaned.match(/^(.+?)\s+[–—]\s+/);
  if (m) return tidyArtist(m[1]);
  // "Boiler Room London: Tiffany Day" / "Cercle: Artist"
  m = cleaned.match(/^(?:Boiler Room\s+)?[A-Za-z][A-Za-z\s]+:\s*(.+)$/i);
  if (m) return tidyArtist(m[1]);
  return tidyArtist(cleaned);
}

function tidyArtist(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s+b2b\s+/gi, " b2b ")
    .replace(
      /\s+(?:hard\s+|energetic\s+|groovy\s+|latin\s+|pumping\s+|fast-paced\s+)*(?:tech(?:no|[\s-]?house)|bass(?:line|\s*house)?|house|trance|psytrance|ukg|dubstep|drum\s*&\s*bass|acid)?\s*(?:dj\s*)?sets?\b.*$/i,
      "",
    )
    // Leftover genre tail after "… Techno Set From …" split: "Deborah De Luca Techno"
    .replace(
      /\s+(?:hard\s+|energetic\s+|groovy\s+|latin\s+|pumping\s+|fast-paced\s+)*(?:tech(?:no|[\s-]?house)|bass(?:line|\s*house)?|house|trance|psytrance|ukg|dubstep|drum\s*&\s*bass|acid)$/i,
      "",
    )
    .replace(/\s+for\s+.+$/i, "")
    .replace(/,?\s*powered by\s+.+$/i, "")
    .trim();
}
