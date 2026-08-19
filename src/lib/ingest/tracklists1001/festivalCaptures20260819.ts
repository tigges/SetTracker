import type { FingerprintSeedRow } from "../fingerprint/seeds";
import { captureRowsToSeedRows } from "./toSeed";

/**
 * Vintage Culture @ Resistance Megastructure, Ultra Music Festival Miami 2026-03-27
 * Official YouTube: https://youtu.be/xXRjglkAmq8
 * https://www.1001tracklists.com/tracklist/23nu9rq9/vintage-culture-resistance-megastructure-ultra-music-festival-miami-united-states-2026-03-27.html
 * Overlay name TL_Vintage-Culture_Resistance-Megastructure_Ultra-Miami_2026 is not a valid identifier.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-xXRjglkAmq8"] = TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026
 * Operator mobile screenshots 2026-08-19 — provenance 1001tl.
 * Partial: tracks 14–16 were not in the screenshots (do not invent).
 * Track 18 was bare ID–ID (dropped). "Max Styler On Stage" is a guest marker, not a play.
 * Opener had no on-page clock (1001 often omits 0:00). Untimed 03–04 and 10–12
 * lerp between neighboring 1001 clocks. Duration 5340s from the live Relive.
 */
export const TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026: FingerprintSeedRow[] =
  captureRowsToSeedRows(
    [
      {
        at: "0:00",
        artist: "Vintage Culture & Nariman & rhys from the sticks",
        title: "Think Too Much",
      },
      {
        at: "4:30",
        artist: "Oliver Huntemann & Stephan Bodzin",
        title: "Rubin (Victor Ruiz Remix)",
      },
      { artist: "Vintage Culture & Volkoder", title: "Hands Up" },
      { artist: "Vintage Culture & Volkoder", title: "Rave" },
      {
        at: "18:00",
        artist: "Green Velvet & Harvard Bass",
        title: "Lazer Beams (Adam Beyer & Massano Remix)",
      },
      { at: "21:45", artist: "Bolth", title: "Voilà" },
      { at: "26:00", artist: "Volkoder", title: "My House" },
      { at: "30:40", artist: "Vintage Culture", title: "Do You" },
      {
        at: "34:50",
        artist: "Max Styler",
        title: "You & Me (Vintage Culture Remix)",
      },
      { artist: "Max Styler & Greggio", title: "Oldskool Flavor" },
      {
        artist: "Max Styler & Vintage Culture & Ali Love",
        title: "Freaky 1",
      },
      { artist: "Adam Beyer", title: "Close Your Eyes" },
      {
        at: "52:40",
        artist: "ANNA & Vintage Culture",
        title: "Feel The Rhythm",
      },
      {
        at: "1:11:30",
        artist: "Vintage Culture & Bhaskar & Meca ft. The Vic",
        title: "Tina (Doriann Remix)",
      },
      {
        at: "1:18:40",
        artist: "Vintage Culture & Greggio",
        title: "Let Me Tell You",
      },
      {
        at: "1:22:20",
        artist: "Vintage Culture & Sevenn & Kevin Brauer",
        title: "Sally",
      },
      {
        at: "1:25:45",
        artist: "MGMT",
        title: "Time To Pretend (ANNA Edit)",
      },
    ],
    { evenlySpaceDurationSec: 5340 },
  );
