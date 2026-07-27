/**
 * Operator-pasted / browser-captured 1001Tracklists rows for curated sets.
 *
 * Used when a YouTube/SC description only links 1001.tl and live HTML fetch is
 * Cloudflare-blocked in CI. Provenance: "1001tl".
 *
 * Source for TL_MARTEN_HORGER_EDC_LV_2023: browser capture of
 * https://1001.tl/vfff7hk (2026-07-27).
 */

import type { FingerprintSeedRow } from "../fingerprint/seeds";
import {
  fingerprintRowsToPlays,
  mergeFingerprintPlays,
} from "../fingerprint/seeds";
import type { RawPlay } from "../types";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./festival2026";

export {
  TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  TL_CLOONEE_PROSPA_DESTINO_2026,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  TRACKLIST_1001_BY_SOURCE_SLUG,
  evenlySpaceRows,
} from "./festival2026";

/** Same clock rows as fingerprint seeds; written with provenance 1001tl. */
export function tracklist1001RowsToPlays(rows: FingerprintSeedRow[]): RawPlay[] {
  return fingerprintRowsToPlays(rows).map((p) => ({
    ...p,
    provenance: "1001tl" as const,
  }));
}

/**
 * Merge curated / fetched 1001 plays into a source tracklist.
 * Dense lists (≥12) replace thin stubs; otherwise gap-fill.
 */
export function merge1001Plays(
  base: RawPlay[],
  from1001: RawPlay[],
): RawPlay[] {
  if (!from1001.length) return base;
  if (from1001.length >= 12) return from1001;
  return mergeFingerprintPlays(base, from1001, {
    replaceIfSourceBelow: 15,
  });
}

/** Apply curated seed keyed by sourceSlug (SoundCloud / force paths). */
export function applyTracklist1001Seed(
  sourceSlug: string,
  base: RawPlay[],
): RawPlay[] {
  const seed = TRACKLIST_1001_BY_SOURCE_SLUG[sourceSlug];
  if (!seed?.length) return base;
  return merge1001Plays(base, tracklist1001RowsToPlays(seed));
}

/**
 * MARTEN HØRGER @ kineticFIELD, EDC Las Vegas 2023-05-21
 * https://1001.tl/vfff7hk → 23 tracks / ~59m
 */
export const TL_MARTEN_HORGER_EDC_LV_2023: FingerprintSeedRow[] = [
  { at: "0:35", artist: "Marten Horger, BIJOU", title: "I Know" },
  { at: "4:08", artist: "Marten Horger, Shift K3Y", title: "Get Real High" },
  { at: "7:10", artist: "Return Of The Jaded", title: "Organ Banger" },
  {
    at: "7:15",
    artist: "Marky Mark & The Funky Bunch ft. Loleatta Holloway",
    title: "Good Vibrations (Acappella)",
  },
  {
    at: "10:47",
    artist: "Kaleena Zanders, Shift K3Y",
    title: "V I B R A T I O N",
  },
  { at: "12:50", artist: "D.O.D", title: "Two Caps" },
  { at: "14:35", artist: "Tchami, Marten Horger", title: "The Calling" },
  { at: "18:00", artist: "Aazar", title: "That Thing" },
  {
    at: "20:00",
    artist: "PARISI, Sebastian Ingrosso, Steve Angello",
    title: "U Ok?",
  },
  {
    at: "21:55",
    artist: "Marten Horger",
    title: "Another Dimension (Marten Horger & Sonny Fodera Remix)",
  },
  {
    at: "23:55",
    artist: "Darude",
    title: "Sandstorm (San Pacho Edit)",
  },
  {
    at: "25:55",
    artist: "Marten Horger, Sonny Fodera",
    title: "Levitate",
  },
  {
    at: "28:42",
    artist: "David Guetta, Marten Horger",
    title: "The Freaks",
  },
  { at: "31:48", artist: "Marten Horger", title: "Ill Behavior" },
  {
    at: "36:00",
    artist: "Dr. Fresch, Marten Horger",
    title: "Take A Step Back",
  },
  {
    at: "37:30",
    artist: "Habstrakt, IMANU",
    title: "Libre (Honey & Badger Remix)",
  },
  { at: "38:46", artist: "MAKJ", title: "Burning Rave" },
  {
    at: "39:50",
    artist: "Marten Horger, BIJOU",
    title: "The Power",
  },
  {
    at: "43:50",
    artist: "Nicky Romero",
    title: "Turn Off The Lights",
  },
  { at: "47:00", artist: "Marten Horger", title: "Out Of The World" },
  {
    at: "50:27",
    artist: "Dillon Francis, Marten Horger",
    title: "On A Trip",
  },
  { at: "54:13", artist: "NITTI", title: "White Claws" },
  {
    at: "55:50",
    artist: "Dr. Fresch, Marten Horger",
    title: "Free My Mind",
  },
];
