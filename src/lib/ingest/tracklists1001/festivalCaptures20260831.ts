import type { FingerprintSeedRow } from "../fingerprint/seeds";

/**
 * Jack Shore @ Freedom Stage, Tomorrowland Weekend 1, Belgium 2026-07-19
 * Official YouTube: https://www.youtube.com/watch?v=wWgtmdI_adQ
 * https://www.1001tracklists.com/tracklist/1pqg9hh9/jack-shore-freedom-stage-tomorrowland-weekend-1-belgium-2026-07-19.html
 * Overlay name TL_JACK_SHORE is too generic; constant is the performance.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-wWgtmdI_adQ"] = TL_JACK_SHORE_TML_WE1_FREEDOM_2026
 * No SoundCloud in the paste — do not invent an SC slug.
 * Distinct from other Freedom WE1 captures (I Hate Models, Netsky, Armin).
 * Two timed IDs as captured — do not interpolate the rest.
 * Captured 2026-08-31 — provenance 1001tl.
 */
export const TL_JACK_SHORE_TML_WE1_FREEDOM_2026: FingerprintSeedRow[] = [
  {
    at: "0:20",
    artist: "The Temper Trap",
    title: "Sweet Disposition (Jack Shore Live Edit)",
  },
  { at: "29:57", artist: "Jack Shore & Lydia Lyon", title: "POINT OFVIEW" },
];
