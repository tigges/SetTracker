/**
 * Curated YouTube set URLs / video IDs.
 *
 * Prefer uploads that either:
 * - include a timed tracklist in the description, or
 * - have YouTube Music "songs in this video" credits (Content ID)
 *
 * Venue + artist channels are polled separately via `venues.ts` / `artists.ts`.
 */

import type { RawArtist } from "../types";
import { slugify } from "../types";

export type YoutubeSetSource = {
  /** 11-char id or full watch URL */
  video: string;
  primaryArtist: RawArtist;
  genre: string;
  type?: "radio" | "festival" | "soundcloud";
  /** Optional override title */
  title?: string;
  seriesName?: string;
  eventName?: string;
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

export const YOUTUBE_SETS: YoutubeSetSource[] = [
  {
    video: "https://www.youtube.com/watch?v=9AfzWCT7bac",
    primaryArtist: dj("Marten Hørger", {
      accent: "#ff7a45",
      homeCity: "Berlin, DE",
    }),
    genre: "Bass House",
    type: "festival",
  },
  {
    video: "https://www.youtube.com/watch?v=9MZz5YazOUo",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    seriesName: "Cafe Mambo",
    eventName: "Cafe Mambo Ibiza",
  },
  {
    video: "https://www.youtube.com/watch?v=EXKpyYAXtyw",
    primaryArtist: dj("Chris Lake", {
      accent: "#3d8bfd",
      homeCity: "London, UK",
    }),
    genre: "Tech House",
    type: "festival",
    eventName: "Los Angeles Historic Park",
  },
  {
    video: "https://www.youtube.com/watch?v=6v9ByGvQqbY",
    primaryArtist: dj("Oliver Heldens", {
      accent: "#7c5cff",
      homeCity: "Netherlands",
    }),
    genre: "Future House",
    type: "radio",
    seriesName: "Heldeep Radio",
  },
];
