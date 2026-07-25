/**
 * Curated DJ YouTube channels known to publish long sets with tracklists
 * (timed description cues and/or YouTube Music credits) — James Hype pattern.
 */

export type YoutubeArtistChannel = {
  channel: string;
  primaryName: string;
  genre: string;
  accent: string;
  limit?: number;
  minDurationSec?: number;
};

export const YOUTUBE_ARTIST_CHANNELS: YoutubeArtistChannel[] = [
  {
    channel: "@JamesHype",
    primaryName: "James Hype",
    genre: "Tech House",
    accent: "#ff3d6e",
    limit: 4,
    minDurationSec: 20 * 60,
  },
  {
    channel: "@TitaLau",
    primaryName: "Tita Lau",
    genre: "Tech House",
    accent: "#ff8fab",
    limit: 3,
    minDurationSec: 18 * 60,
  },
  {
    channel: "@ChrisLake",
    primaryName: "Chris Lake",
    genre: "Tech House",
    accent: "#3d8bfd",
    limit: 4,
    minDurationSec: 20 * 60,
  },
  {
    channel: "@fisher",
    primaryName: "FISHER",
    genre: "Tech House",
    accent: "#00c2ff",
    limit: 3,
    minDurationSec: 20 * 60,
  },
  {
    channel: "@OliverHeldens",
    primaryName: "Oliver Heldens",
    genre: "Future House",
    accent: "#7c5cff",
    limit: 4,
    minDurationSec: 25 * 60,
  },
  {
    channel: "@VintageCulture",
    primaryName: "Vintage Culture",
    genre: "Tech House",
    accent: "#e85d04",
    limit: 3,
    minDurationSec: 25 * 60,
  },
  {
    channel: "@meduzamusic",
    primaryName: "MEDUZA",
    genre: "House",
    accent: "#5cc7e8",
    limit: 3,
    minDurationSec: 30 * 60,
  },
  {
    channel: "@WaxMotif",
    primaryName: "Wax Motif",
    genre: "G-House",
    accent: "#c56cff",
    limit: 3,
    minDurationSec: 25 * 60,
  },
  {
    channel: "@johnsummit",
    primaryName: "John Summit",
    genre: "Tech House",
    accent: "#7cffb2",
    limit: 3,
    minDurationSec: 30 * 60,
  },
  {
    channel: "@cloonee",
    primaryName: "Cloonee",
    genre: "Tech House",
    accent: "#f08a3d",
    limit: 3,
    minDurationSec: 30 * 60,
  },
  {
    channel: "@GorgonCity",
    primaryName: "Gorgon City",
    genre: "House",
    accent: "#f15bb5",
    limit: 3,
    minDurationSec: 25 * 60,
  },
  {
    channel: "@WalkerAndRoyce",
    primaryName: "Walker & Royce",
    genre: "Tech House",
    accent: "#9ef01a",
    limit: 3,
    minDurationSec: 25 * 60,
  },
  {
    channel: "@MaxStyler",
    primaryName: "Max Styler",
    genre: "Tech House",
    accent: "#ff9f1c",
    limit: 3,
    minDurationSec: 25 * 60,
  },
];

const SKIP_TITLE =
  /\b(aftermovie|trailer|teaser|tickets?|announcement|#shorts|visualiser|lyric video|official video|conversation with|interview|podcast)\b/i;

export function isArtistChannelSetCandidate(
  title: string,
  durationSec: number,
  ch: YoutubeArtistChannel,
): boolean {
  if (SKIP_TITLE.test(title)) return false;
  const min = ch.minDurationSec ?? 20 * 60;
  if (durationSec >= min) return true;
  return (
    durationSec >= 12 * 60 &&
    /\b(live|mix|set|b2b|radio|heldeep|essentials|in\s+the\s+mix)\b/i.test(title)
  );
}
