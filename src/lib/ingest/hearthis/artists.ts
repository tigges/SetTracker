/**
 * Curated hearthis.at artist / brand accounts to deep-poll for long mixes.
 * Category house-browse is off — it leaked hobbyist radio DJs.
 */

import type { RawArtist } from "../types";

export type HearthisArtistSource = {
  /** hearthis user permalink, e.g. gentlemensgroove-oz */
  permalink: string;
  primaryArtist: RawArtist;
  genre: string;
  seriesName?: string;
  /** Max recent uploads to inspect */
  limit?: number;
  minDurationSec?: number;
};

export const HEARTHIS_ARTISTS: HearthisArtistSource[] = [
  {
    permalink: "gentlemensgroove-oz",
    // Explicit slug — slugify("Gentlemen's Groove") would yield gentlemen-s-groove.
    primaryArtist: {
      name: "Gentlemen's Groove",
      slug: "gentlemens-groove",
      accent: "#00e5ff",
      homeCity: "South Africa",
    },
    genre: "Deep House",
    seriesName: "Gentlemen's Groove",
    limit: 25,
    minDurationSec: 25 * 60,
  },
];
