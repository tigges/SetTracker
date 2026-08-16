/**
 * Curated hearthis.at single-track seeds.
 * Artist-account poll only covers brand mixes (Gentlemen's Groove). Radio
 * rehosts of catalog DJs need an explicit URL so the 1001 overlay can land.
 */

import type { RawArtist } from "../types";

export type HearthisTrackSource = {
  /** https://hearthis.at/{user}/{track}/ */
  url: string;
  primaryArtist: RawArtist;
  genre: string;
  eventName?: string;
  eventKind?: string;
  eventLocation?: string;
  seriesName?: string;
  /** YYYY-MM-DD when the set was performed (not the rehost upload date). */
  performedOn?: string;
  minDurationSec?: number;
  type?: "radio" | "festival" | "soundcloud" | "mix";
};

export const HEARTHIS_TRACKS: HearthisTrackSource[] = [
  {
    url: "https://hearthis.at/toccoscuro/1live-dj-session-mit-robin-schulz-live-aus-dem-pacha-ibiza-vom-0/",
    primaryArtist: {
      name: "Robin Schulz",
      slug: "robin-schulz",
      accent: "#5aa9e6",
      homeCity: "Germany",
    },
    genre: "House",
    eventName: "Pacha Ibiza",
    eventKind: "club",
    eventLocation: "Ibiza, Spain",
    performedOn: "2026-06-06",
    type: "festival",
    minDurationSec: 20 * 60,
  },
];
