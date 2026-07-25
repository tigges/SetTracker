/**
 * Curated Bandcamp track / album URLs.
 *
 * Albums become sets with full tracklists. Single tracks are allowed when
 * explicitly curated (e.g. notable edits / rebasses linked by the team).
 */

import type { RawArtist } from "../types";
import { slugify } from "../types";

export type BandcampReleaseSource = {
  url: string;
  primaryArtist?: RawArtist;
  genre?: string;
  type?: "radio" | "festival" | "soundcloud";
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

export const BANDCAMP_RELEASES: BandcampReleaseSource[] = [
  {
    url: "https://aizoclutch.bandcamp.com/track/ezel-ft-mike-city-already-knew-aizo-clutch-rebass-2",
    primaryArtist: dj("Aizo Clutch", {
      accent: "#c4a35a",
      homeCity: "US",
    }),
    genre: "Bass House",
    type: "soundcloud",
  },
];
