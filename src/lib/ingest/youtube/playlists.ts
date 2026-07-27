/**
 * Curated YouTube playlists that hold long-form DJ sets / guest mixes.
 *
 * Prefer set-oriented playlists — not label “sounds” / singles samplers
 * (those are track catalogs, not mixes).
 */

import type { RawArtist } from "../types";
import {
  isVenueSetCandidate,
  type YoutubeVenueChannel,
} from "./venues";

export type YoutubePlaylistSource = {
  /** Playlist URL or bare list id (PL…) */
  playlist: string;
  seriesName: string;
  eventSlug?: string;
  genre: string;
  accent: string;
  /**
   * When set (artist-owned set playlists), force this DJ as primary —
   * titles like "Biscits DJ Set - …" otherwise invent slug biscits-dj-set.
   */
  primaryArtist?: RawArtist;
  limit?: number;
  minDurationSec?: number;
  titleMatch?: RegExp;
};

const PL_LIMIT = Number(process.env.YOUTUBE_PLAYLIST_VIDEO_LIMIT || 30);

export const YOUTUBE_PLAYLISTS: YoutubePlaylistSource[] = [
  {
    // STEREOHYPE Guest Mixes | 2023 — long guest DJ mixes
    playlist: "PLuoMUHhgebplgzLYgaOkrdV5mEB6t2ub6",
    seriesName: "STEREOHYPE",
    eventSlug: "stereohype",
    genre: "Tech House",
    accent: "#ff3d6e",
    limit: PL_LIMIT,
    minDurationSec: 30 * 60,
    titleMatch: /\b(guest mix|live|set|stereohype|b2b|mix)\b/i,
  },
  {
    // STEREOHYPE Live from Bucharest 2023
    playlist: "PLuoMUHhgebplLi9MGKDj9Wu23osYsEo1T",
    seriesName: "STEREOHYPE",
    eventSlug: "stereohype",
    genre: "Tech House",
    accent: "#ff3d6e",
    limit: 12,
    minDurationSec: 30 * 60,
    titleMatch: /\b(stereohype|live|b2b|bucharest|set)\b/i,
  },
  {
    // David Guetta — Ultra Music Festival Miami long-form sets
    playlist: "PLz1iM8YfFbTc1Tm-FJT15kj3g_RVIZbVW",
    seriesName: "Ultra Miami",
    eventSlug: "ultra-miami",
    genre: "House",
    accent: "#1e90ff",
    limit: 20,
    minDurationSec: 30 * 60,
    titleMatch: /\b(ultra|miami|live|set|guetta|main\s*stage)\b/i,
  },
  {
    // Official Ultra Shows — Main Stage / stage livestreams with timed lists
    playlist: "PLBg1SJiXSxfJ6lee3le9qRtIFLkdFwd8E",
    seriesName: "Ultra Shows",
    eventSlug: "ultra-miami",
    genre: "House",
    accent: "#7b2cbf",
    limit: PL_LIMIT,
    minDurationSec: 25 * 60,
    titleMatch:
      /\b(ultra|miami|live|set|main\s*stage|worldwide|resistance|bizarrap|bzrp)\b/i,
  },
  {
    // @Biscits — Live Streams (long DJ sets; skip Releases / Remixes / Live Tracks)
    playlist: "PLSAUtc6DBR34M6_c_4RlpMSG81OY5lu9p",
    seriesName: "BISCITS",
    genre: "Tech House",
    accent: "#ef476f",
    primaryArtist: {
      name: "BISCITS",
      slug: "biscits",
      accent: "#ef476f",
      homeCity: "UK",
    },
    limit: PL_LIMIT,
    minDurationSec: 18 * 60,
    titleMatch:
      /\b(biscits|dj\s*set|live|set|stream|inflight|nocturnal|academy|space|defected|insomniac|mad\s*decent|exchange|kings?\s*hall|daytrip|in\s+the\s+loop|ready\s*2\s*dance)\b/i,
  },
];

/** Adapt a playlist source to the venue candidate helpers. */
export function playlistAsVenue(
  pl: YoutubePlaylistSource,
): YoutubeVenueChannel {
  return {
    channel: pl.seriesName,
    seriesName: pl.seriesName,
    eventSlug: pl.eventSlug,
    genre: pl.genre,
    accent: pl.accent,
    primaryArtist: pl.primaryArtist,
    limit: pl.limit,
    minDurationSec: pl.minDurationSec,
    titleMatch: pl.titleMatch,
  };
}

export function isPlaylistSetCandidate(
  title: string,
  durationSec: number,
  pl: YoutubePlaylistSource,
): boolean {
  return isVenueSetCandidate(title, durationSec, playlistAsVenue(pl));
}
