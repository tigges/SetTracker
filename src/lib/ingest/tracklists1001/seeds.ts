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
  TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026,
  TL_AYYBO_ODD_MOB_TML_WE2_2026,
  TL_BLEU_CLAIR_EDC_LV_2023,
  TL_CALVIN_HARRIS_TML_WE2_2026,
  TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  TL_CHRIS_LORENZO_TML_WE2_2026,
  TL_CID_EDC_LV_2017,
  TL_CLOONEE_EDC_LV_2022,
  TL_CLOONEE_PROSPA_DESTINO_2026,
  TL_DARUDE_EDC_LV_2026,
  TL_DEBORAH_STREET_PARADE_2025,
  TL_KEVIN_DE_VRIES_STREET_PARADE_2025,
  TL_KOLSCH_STREET_PARADE_2025,
  TL_MASSANO_STREET_PARADE_2025,
  TL_MASSANO_TML_WE2_2026,
  TL_ADIEL_STREET_PARADE_2025,
  TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
  TL_DIMITRI_VEGAS_TML_WE2_2026,
  TL_DOM_DOLLA_ALLIANZ_SYDNEY,
  TL_DOM_DOLLA_EDC_LV_2023,
  TL_DOM_DOLLA_EDC_LV_2024,
  TL_DYZEN_TML_WE2_2026,
  TL_ENRICO_SANGIULIANO_TML_WE2_2026,
  TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
  TL_FISHER_TML_WE1_2026,
  TL_FISHER_TML_WE2_2026,
  TL_FUNK_TRIBU_EDC_LV_2026,
  TL_HARDWELL_TML_WE2_2026,
  TL_HOLY_PRIEST_EDC_LV_2026,
  TL_HOLY_PRIEST_TML_WE1_2026,
  TL_CYRIL_TML_WE2_2026,
  TL_DARREN_STYLES_TML_WE2_2026,
  TL_BASSJACKERS_TML_WE2_2026,
  TL_BHASKAR_TML_WE2_2026,
  TL_BORIS_BREJCHA_TML_WE1_2026,
  TL_MIKE_WILLIAMS_TML_WE2_2026,
  TL_MISS_MONIQUE_BIORHYTHM,
  TL_PLASTIK_FUNK_NATURE_ONE_2025,
  TL_SEBASTIAN_INGROSSO_TML_WE2_2026,
  TL_ZAMNA_STREET_PARADE_2025,
  TL_PUSH_TML_WE2_2026,
  TL_JAMES_HYPE_MELKWEG_ADE_2025,
  TL_JAMES_HYPE_TML_WE2_2026,
  TL_JOHN_SUMMIT_TML_WE2_2026,
  TL_KOLSCH_TML_WE2_2026,
  TL_KOROLOVA_TML_WE2_2026,
  TL_LUCAS_STEVE_TML_WE2_2026,
  TL_SARA_LANDRY_TML_WE2_2026,
  TL_AFROJACK_R3HAB_TML_WE2_2026,
  TL_STEVE_AOKI_TML_WE2_2026,
  TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  TL_MAX_STYLER_EDC_LV_2024,
  TL_ODD_MOB_EDC_LV_2025,
  TL_ODD_MOB_TML_WE2_2026,
  TL_MATTY_RALPH_EDC_LV_2026,
  TL_MISS_MONIQUE_TML_WE2_2026,
  TL_NICKY_ROMERO_TML_WE2_2026,
  TL_NICO_MORENO_EDC_LV_2026,
  TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026,
  TL_PEGASSI_EDC_LV_2026,
  TL_SARAH_DE_WARREN_EDC_LV_2026,
  TL_SOLOMUN_ALLY_PALLY_2026,
  TL_SOLOMUN_EDC_LV_2026,
  TL_SONNY_FODERA_TML_WE2_2026,
  TL_STEVE_ANGELLO_TML_WE2_2026,
  TL_WAX_MOTIF_EDC_LV_2021,
  TL_WESTEND_EDC_LV_2026,
  TL_ALESSO_TML_WE2_2026,
  TL_ARMIN_VAN_BUUREN_TML_WE2_2026,
  TL_HONEYLUV_ANTS_USHUAIA_2026,
  TL_HONEYLUV_STREET_PARADE_2025,
  TL_JOHN_SUMMIT_LOLLAPALOOZA,
  TL_MARTIN_GARRIX_TML_WE2_2026,
  TL_PAN_POT_STREET_PARADE_2025,
  TL_PEGGY_GOU_CERCLE_LILLE,
  TL_PEGGY_GOU_EDC_LV_2026,
  TL_THE_CHAINSMOKERS_TML_WE1_2026,
  TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026,
  TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023,
  TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
  TL_ARMIN_OTTAVIANI_ASOT_1290_2026,
  TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
  TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
  TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
  TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
  TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
  TL_ALOK_TML_WE2_2026,
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  TL_HARDWELL_HOA_527_YEARMIX_2025,
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_225,
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_239,
  TL_JOEL_CORRY_EDGE_NYC_2026,
  TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
  TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
  TL_SASHA_ECLIPSE_MIX_2026,
  TL_TIESTO_PRISMATIC_032_2026,
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
  TL_VINTAGE_CULTURE_NYC_YACHT_2023,
  TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
  TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
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

/** Already-captured 1001 seed — Stats / capture queue should not list these. */
export function isWiredTracklistSlug(slug: string): boolean {
  return (TRACKLIST_1001_BY_SOURCE_SLUG[slug]?.length ?? 0) > 0;
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
