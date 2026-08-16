/**
 * Curated single SoundCloud track URLs (guestmixes / radio appearances).
 *
 * Use when an artist's own profile is release-only but long-form sets live
 * on radio/label accounts. Parallel to youtube/videos.ts curated seeds.
 */

import type { RawArtist } from "../types";
import { slugify } from "../types";

export type SoundCloudTrackSeed = {
  /** Full SoundCloud track URL */
  url: string;
  primaryArtist: RawArtist;
  genre: string;
  seriesName?: string;
  type?: "radio" | "festival" | "soundcloud" | "mix";
  /** Skip if shorter (default 15 minutes) */
  minDurationSec?: number;
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

export const SOUNDCLOUD_TRACK_SEEDS: SoundCloudTrackSeed[] = [
  {
    // Official profile is singles-only; guestmixes live on radio hosts.
    url: "https://soundcloud.com/edmidentity/this-is-home-021-chapter-verse-united-kingdom",
    primaryArtist: dj("Chapter & Verse", {
      accent: "#f77f00",
      homeCity: "UK",
    }),
    genre: "Tech House",
    seriesName: "This Is Home",
    type: "radio",
    minDurationSec: 15 * 60,
  },
  {
    url: "https://soundcloud.com/rogersanchez/release-yourself-radio-show-985-guestmix-chapter-verse",
    primaryArtist: dj("Chapter & Verse", {
      accent: "#f77f00",
      homeCity: "UK",
    }),
    genre: "Tech House",
    seriesName: "Release Yourself Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official SIDEPIECE upload; 1001TL wired via
    // sc-sidepiece-sidepiece-lollapalooza-perry.
    url: "https://soundcloud.com/sidepiece/sidepiece-lollapalooza-perry",
    primaryArtist: dj("SIDEPIECE", {
      accent: "#fee440",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // Official Horger upload; 1001TL wired via
    // sc-marten-horger-tomorrowland-mainstage-2023.
    url: "https://soundcloud.com/marten-horger/tomorrowland-mainstage-2023",
    primaryArtist: dj("Marten Horger", {
      accent: "#ff7a45",
      homeCity: "Berlin, DE",
    }),
    genre: "Bass House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // 1001Tracklists exclusive; 1001TL wired via
    // sc-1001tracklists-men-machine-exclusive-mix-2026 (same list as yt-NTLDGnoWIRg).
    url: "https://soundcloud.com/1001tracklists/men-machine-exclusive-mix-2026",
    primaryArtist: dj("Men Machine", {
      accent: "#ff4d6d",
      homeCity: "Paris / Berlin",
    }),
    genre: "Bass House",
    seriesName: "1001Tracklists Exclusive Mix",
    type: "mix",
    minDurationSec: 15 * 60,
  },
  {
    // Official Dom Dolla upload; 1001TL wired via
    // sc-domdolla-dom-dolla-live-creamfields-steel-yard-2025 (same list as yt-NblVVOwQRqw).
    url: "https://soundcloud.com/domdolla/dom-dolla-live-creamfields-steel-yard-2025",
    primaryArtist: dj("Dom Dolla", {
      accent: "#00bbf9",
      homeCity: "Melbourne, AU",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // Official GDJB upload; 1001TL wired via
    // sc-markusschulz-gdjb-aug132026 (same list as yt-WWnLYZrh6kw).
    url: "https://soundcloud.com/markusschulz/gdjb-aug132026",
    primaryArtist: dj("Markus Schulz", {
      accent: "#4895ef",
      homeCity: "Miami, US",
    }),
    genre: "Trance",
    seriesName: "Global DJ Broadcast", // pragma: allowlist secret
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Hardwell On Air 527 Yearmix; 1001TL wired via
    // sc-hardwell-hardwell-on-air-527-yearmix (same list as yt-OXwK0CSmXzY).
    url: "https://soundcloud.com/hardwell/hardwell-on-air-527-yearmix",
    primaryArtist: dj("Hardwell", {
      accent: "#023e8a",
      homeCity: "Breda, NL",
    }),
    genre: "Big Room",
    seriesName: "Hardwell On Air",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Jamie Jones upload; Mixcloud mirror also exists.
    // 1001TL wired via sc-jamie-jones-hot-robot-radio-225.
    url: "https://soundcloud.com/jamie-jones/hot-robot-radio-225",
    primaryArtist: dj("Jamie Jones", {
      accent: "#f72585",
    }),
    genre: "Tech House",
    seriesName: "Hot Robot Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Jamie Jones upload; Mixcloud mirror also exists.
    // 1001TL wired via sc-jamie-jones-hot-robot-radio-239.
    url: "https://soundcloud.com/jamie-jones/hot-robot-radio-239",
    primaryArtist: dj("Jamie Jones", {
      accent: "#f72585",
    }),
    genre: "Tech House",
    seriesName: "Hot Robot Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Vintage Culture upload; 1001TL wired via
    // sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024.
    url: "https://soundcloud.com/vintageculturemusic/vintage-culture-b2b-arodes-at-burning-man-2024",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 30 * 60,
  },
];
