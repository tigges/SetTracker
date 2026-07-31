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
];
