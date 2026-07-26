/**
 * Curated YouTube set URLs / video IDs.
 *
 * Prefer uploads that either:
 * - include a timed tracklist in the description, or
 * - have YouTube Music "songs in this video" credits (Content ID), or
 * - carry a pasted fingerprint tracklist (`fingerprintPlays`)
 *
 * Venue + artist channels are polled separately via `venues.ts` / `artists.ts`.
 */

import {
  FP_JAMES_HYPE_GET_CLOSER_LONDON,
  type FingerprintSeedRow,
} from "../fingerprint/seeds";
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
  /**
   * Manual fingerprint IDs (ACRCloud / AudD / pasted aha-music analysis).
   * Written as provenance "fingerprint"; never overwrites sourceUrl.
   */
  fingerprintPlays?: FingerprintSeedRow[];
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

export const YOUTUBE_SETS: YoutubeSetSource[] = [
  {
    video: "https://www.youtube.com/watch?v=9AfzWCT7bac",
    primaryArtist: dj("Marten Horger", {
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
    video: "https://www.youtube.com/watch?v=rLTCLSsqrXY",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype SYNC London (Full Set)",
    seriesName: "SYNC",
    eventName: "SYNC London",
  },
  {
    video: "https://www.youtube.com/watch?v=oVOuXYtqi6I",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype - Get Closer, London - Full Set",
    seriesName: "Get Closer",
    eventName: "Get Closer London",
    fingerprintPlays: FP_JAMES_HYPE_GET_CLOSER_LONDON,
  },
  {
    video: "https://www.youtube.com/watch?v=i9cNYaOOdwA",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype live at STEREOHYPE Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=HTR2M4QdorM",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype B2B Tita Lau live at STEREOHYPE Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=mTGTcuaGhls",
    primaryArtist: dj("Tita Lau", { accent: "#ff8fab" }),
    genre: "Tech House",
    type: "festival",
    title: "Tita Lau live from STEREOHYPE | Laminor Arena - Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
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
  {
    video: "https://www.youtube.com/watch?v=am7YNM3md2I",
    primaryArtist: dj("ARTBAT", {
      accent: "#6c63ff",
      homeCity: "Kyiv, UA",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "ARTBAT live set",
  },
  {
    video: "https://www.youtube.com/watch?v=0psLTNmJM38",
    primaryArtist: dj("Bizarrap", {
      accent: "#f4a261",
      homeCity: "Ramos Mejía, AR",
    }),
    genre: "House",
    type: "festival",
    title:
      "BIZARRAP || LIVE @ ULTRA MIAMI MAIN STAGE 2026 (ft. Skrillex & Daddy Yankee)",
    seriesName: "Ultra Shows",
    eventName: "Ultra Music Festival",
  },
];
