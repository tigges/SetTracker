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
  type?: "radio" | "festival" | "club" | "livestream" | "soundcloud" | "mix";
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
    type: "club",
    minDurationSec: 20 * 60,
  },
  {
    // Fan radio rehost — 1001 overlay only. Never playbackUrl.
    url: "https://hearthis.at/toccoscuro/robin-schulz-sugar-radio-555/",
    primaryArtist: {
      name: "Robin Schulz",
      slug: "robin-schulz",
      accent: "#5aa9e6",
      homeCity: "Germany",
    },
    genre: "House",
    seriesName: "Sugar Radio",
    performedOn: "2026-08-16",
    type: "radio",
    minDurationSec: 20 * 60,
  },
  {
    // Fan archive edmliveset — 1001 overlay only. Never playbackUrl.
    url: "https://hearthis.at/edmliveset/nico-moreno-holy-priestaa-live-at-edc-las-vegas-2026-las-vegas-usa-17-05-2026/",
    primaryArtist: {
      name: "Nico Moreno",
      slug: "nico-moreno",
      accent: "#ff006e",
      homeCity: "Berlin, DE",
    },
    genre: "Hard Techno",
    eventName: "EDC Las Vegas",
    eventKind: "festival",
    eventLocation: "Las Vegas, US",
    performedOn: "2026-05-17",
    type: "festival",
    minDurationSec: 20 * 60,
  },
];
