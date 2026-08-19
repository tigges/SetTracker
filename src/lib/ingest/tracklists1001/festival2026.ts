/**
 * Browser-captured 1001Tracklists for July 2026 festival sets.
 * Provenance "1001tl". Only wire when an official YT/SC playback URL exists.
 */

import type { FingerprintSeedRow } from "../fingerprint/seeds";
import { parseClockToSec } from "../fingerprint/seeds";
import { interpolateMissingClocks } from "./toSeed";
import {
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
} from "./festivalCaptures20260813";
import { TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026 } from "./festivalCaptures20260814";
import {
  TL_ARMIN_OTTAVIANI_ASOT_1290_2026,
  TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
  TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
  TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
  TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023,
  TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
  TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
} from "./festivalCaptures20260815";
import {
  TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
  TL_ALOK_TML_WE2_2026,
  TL_AMELIE_LENS_RADIO_SHOW_022_2026,
  TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026,
  TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  TL_HARDWELL_HOA_527_YEARMIX_2025,
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_225,
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_239,
  TL_JOEL_CORRY_EDGE_NYC_2026,
  TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
  TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
  TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
  TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
  TL_SASHA_ECLIPSE_MIX_2026,
  TL_TIESTO_PRISMATIC_032_2026,
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
  TL_VINTAGE_CULTURE_NYC_YACHT_2023,
  TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
  TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
  TL_ROBIN_SCHULZ_PACHA_IBIZA_2026,
  TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
  TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
  TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
  TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_MANDY_MANDY_MONDAYS_028_2026,
  TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
} from "./festivalCaptures20260816";
import {
  TL_ALAN_WALKER_TML_WE1_2018,
  TL_ALESSO_TML_WE1_2026,
  TL_CHASE_STATUS_TML_WE2_2026,
  TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026,
  TL_GORDO_TML_WE2_2023,
  TL_I_HATE_MODELS_TML_WE1_2026,
  TL_ILLENIUM_TML_WE1_2026,
  TL_LUCAS_STEVE_TML_WE2_2024,
  TL_NETSKY_TML_WE1_2026,
  TL_OLIVER_HELDENS_TML_WE1_2026,
  TL_KNOCK2_ZEDD_HARD_SUMMER_2026,
  TL_COLE_TERRAZAS_HARD_SUMMER_2026,
  TL_TAPE_B_CARTUNES_VOL5_2026,
  TL_MAU_P_XXX_RADIO_201_2026,
  TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
  TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
  TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
} from "./festivalCaptures20260817";
import {
  TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
  TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
} from "./festivalCaptures20260818";
import {
  TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
  TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
  TL_KOROLOVA_TULUM_MEXICO_2026,
  TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
  TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026,
  TL_VINTAGE_CULTURE_PACHA_NYC_2026,
  TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
} from "./festivalCaptures20260819";

export {
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
  TL_AMELIE_LENS_RADIO_SHOW_022_2026,
  TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026,
  TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  TL_HARDWELL_HOA_527_YEARMIX_2025,
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_225,
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_239,
  TL_JOEL_CORRY_EDGE_NYC_2026,
  TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
  TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
  TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
  TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
  TL_SASHA_ECLIPSE_MIX_2026,
  TL_TIESTO_PRISMATIC_032_2026,
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
  TL_VINTAGE_CULTURE_NYC_YACHT_2023,
  TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
  TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
  TL_ROBIN_SCHULZ_PACHA_IBIZA_2026,
  TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
  TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
  TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
  TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_MANDY_MANDY_MONDAYS_028_2026,
  TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
  TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026,
  TL_ALESSO_TML_WE1_2026,
  TL_ILLENIUM_TML_WE1_2026,
  TL_CHASE_STATUS_TML_WE2_2026,
  TL_I_HATE_MODELS_TML_WE1_2026,
  TL_NETSKY_TML_WE1_2026,
  TL_OLIVER_HELDENS_TML_WE1_2026,
  TL_ALAN_WALKER_TML_WE1_2018,
  TL_GORDO_TML_WE2_2023,
  TL_LUCAS_STEVE_TML_WE2_2024,
  TL_KNOCK2_ZEDD_HARD_SUMMER_2026,
  TL_COLE_TERRAZAS_HARD_SUMMER_2026,
  TL_TAPE_B_CARTUNES_VOL5_2026,
  TL_MAU_P_XXX_RADIO_201_2026,
  TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
  TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
  TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
  TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
  TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
  TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
  TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026,
  TL_VINTAGE_CULTURE_PACHA_NYC_2026,
  TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
  TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
  TL_KOROLOVA_TULUM_MEXICO_2026,
  TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
};

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Assign evenly spaced clocks when 1001TL has no cues (≈ durationSec). */
export function evenlySpaceRows(
  rows: Omit<FingerprintSeedRow, "at">[],
  durationSec: number,
): FingerprintSeedRow[] {
  const n = rows.length;
  if (!n) return [];
  const usable = Math.max(60, durationSec - 45);
  const step = Math.max(45, Math.floor(usable / n));
  return rows.map((r, i) => ({
    ...r,
    at: formatClock(20 + i * step),
  }));
}

/**
 * MARTEN HØRGER @ Mainstage, Parookaville, Germany 2026-07-19
 * Official YT: https://www.youtube.com/watch?v=EbNRjEFZpDw (~59m)
 * Capture: operator paste from 1001TL (2026-07-27).
 */
export const TL_MARTEN_HORGER_PAROOKAVILLE_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "MARTEN HØRGER", title: "Tom's Diner" },
  { at: "3:25", artist: "bradeazy ft. TyriqueOrDie", title: "Up Down" },
  { at: "4:50", artist: "Lady GaGa", title: "Poker Face (CHALANT Remix)" },
  { at: "6:30", artist: "KENZ", title: "Rake It Up" },
  {
    at: "8:12",
    artist: "Kid Cudi ft. MGMT & Ratatat",
    title: "Pursuit Of Happiness (MEDUN Remix)",
  },
  {
    at: "14:25",
    artist: "Congorock ft. Mr. Lexx",
    title:
      "Babylon (David Guetta & MARTEN HØRGER pres. Men Machine & KENZ Rework)",
  },
  {
    at: "18:15",
    artist: "John Newman",
    title: "Love Me Again (Again) (MARTEN HØRGER Remix)",
  },
  {
    at: "24:00",
    artist: "Dr. Fresch & MARTEN HØRGER",
    title: "Take A Step Back (Dr. Fresch VIP)",
  },
  { at: "24:46", artist: "MARTEN HØRGER", title: "Ill Behavior" },
  {
    at: "28:45",
    artist: "Pharoahe Monch",
    title: "Simon Says (Bassjackers Bootleg)",
  },
  { at: "30:20", artist: "Dillon Francis & MARTEN HØRGER", title: "B2U" },
  { at: "33:25", artist: "Daft Punk", title: "One More Time (HILLS Remix)" },
  {
    at: "40:05",
    artist: "MGMT",
    title: "Kids (Men Machine Rework)",
  },
  {
    at: "42:54",
    artist: "David Guetta & MARTEN HØRGER pres. Men Machine",
    title: "The Past, The Present, The Future",
  },
  {
    at: "46:12",
    artist: "Zombie Nation",
    title: "Kernkraft 400 (ID Remix)",
  },
  { at: "49:25", artist: "MARTEN HØRGER", title: "Worth The Wait" },
  { at: "52:20", artist: "MARTEN HØRGER", title: "No Bite" },
  {
    at: "56:00",
    artist: "MARTEN HØRGER",
    title: "Rave (PAROOKAVILLE Anthem 2026)",
  },
];

/**
 * Cloonee & Prospa @ Music On, Destino Pacha Ibiza, 2026-07-09
 * Official SC: https://soundcloud.com/cloonee/clooneeb2bprospa
 * Official YT: https://www.youtube.com/watch?v=UE6wjxvMRz0
 */
export const TL_CLOONEE_PROSPA_DESTINO_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Joey London Style & Pheelo", title: "Never Stop" },
  { at: "0:00", artist: "Masters At Work", title: "Work (Acappella)" },
  { at: "8:30", artist: "Simes", title: "Funky Feeling" },
  { at: "11:37", artist: "Miro", title: "Watching Me" },
  { at: "14:37", artist: "Finky", title: "Move Ya Body" },
  { at: "18:00", artist: "Mau P", title: "Just A Little Bit" },
  { at: "22:30", artist: "Franky Rizardo", title: "Shinjuku" },
  { at: "26:45", artist: "Nate Irvin & Landen Gill", title: "Move To The Beat" },
  { at: "33:45", artist: "KETTAMA", title: "Raw Cuts (Michael Bibi Remix)" },
  {
    at: "37:50",
    artist: "Julian Fijma",
    title: "Get Stupid (Micah Baxter Edit)",
  },
  {
    at: "40:40",
    artist: "Prospa",
    title: "ID (Momma Used To Dance Like That)",
  },
  { at: "44:40", artist: "PAWSA", title: "TOO COOL TO BE CARELESS" },
  { at: "44:40", artist: "Cloonee", title: "Sippin' Yak" },
  { at: "48:35", artist: "Prospa & Murda Beatz", title: "Baby" },
  {
    at: "52:36",
    artist: "Cloonee & Prospa ft. Tristan Henry",
    title: "Good Girl",
  },
  { at: "56:16", artist: "Sapian", title: "Reason Why" },
  {
    at: "1:00:15",
    artist: "Danny Tenaglia ft. Celeda",
    title: "Music Is The Answer (Dancin' And Prancin') (ID Remix)",
  },
  {
    at: "1:02:30",
    artist: "Tre Reynolds & Ferra Black ft. Crazy Cousinz & Calista Kazuko",
    title: "Bongos (In The Morning)",
  },
  { at: "1:05:25", artist: "FIRZA", title: "Disco Whoops" },
  {
    at: "1:09:30",
    artist: "Alex Atenciano & Mr Martin",
    title: "Give Me The Rythm",
  },
  { at: "1:15:29", artist: "Cloonee & Prospa", title: "Free Your Mind" },
  {
    at: "1:20:00",
    artist: "Storm Queen",
    title: "Look Right Through (Franky Rizardo Remix)",
  },
  { at: "1:24:00", artist: "Sonny Kane", title: "Never Leave U" },
  { at: "1:26:35", artist: "2Seater", title: "Street Playaz" },
];

/**
 * Charlotte de Witte @ Mainstage, Tomorrowland Weekend 1, 2026-07-19
 * Official SC: https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-at (~59:01)
 * 1001TL cues untimed — clocks evenly spaced across ~59m. Skips bare ID–ID rows.
 */
export const TL_CHARLOTTE_DE_WITTE_TML_WE1_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      {
        artist: "Enrico Sangiuliano",
        title: "The Techno Code (Charlotte de Witte Acid Code)",
      },
      {
        artist: "Electric Universe & Greg Hilight",
        title: "Om Namah Shivaya",
      },
      {
        artist: "Charlotte de Witte ft. Conduit",
        title: "A Prayer For The Dancefloor (Avalon & GMS Remix)",
      },
      {
        artist: "Charlotte de Witte & Theo Nasa",
        title: "The Resistance",
      },
      { artist: "Lilly Palmer", title: "Living Fast" },
      {
        artist: "Bl4ck Hole & Invader Space",
        title: "Ragga Man (Burn In Noise & Becker Remix)",
      },
      { artist: "Pan-Pot", title: "Funke (Audio State Remix)" },
      {
        artist: "Vini Vici & Tristan & Avalon",
        title: "Music Is The Answer",
      },
      {
        artist: "Pupa Nas T & FOVOS ft. Denise Belfon",
        title: "Work Edit",
      },
      {
        artist: "Yenkov & Gaston Fiore",
        title: "Bring Back Emotions",
      },
    ],
    59 * 60 + 1,
  );

/**
 * Westend @ cosmicMEADOW, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=jQLWYc2UrFY (~59:12)
 * Official SC: https://soundcloud.com/itsthewestend/westend-live-edc-2026
 * 1001TL: https://1001.tl/xh6t5uk — operator console capture 2026-08-01
 * (1/26 DOM cues). Anchors: Like You A Lot @ 20:59 (1001), Proper Education
 * @ 29:48 (screenshot); rest interpolated across ~59:12.
 */
export const TL_WESTEND_EDC_LV_2026: FingerprintSeedRow[] =
  interpolateMissingClocks(
    [
      {
        at: "0:00",
        artist: "Glass Petals ft. Sophiegrophy",
        title: "We Stay Inside",
      },
      {
        artist: "Diplo & SIDEPIECE vs. Westend",
        title: "On My Mind vs. Freaky Time (Westend Mashup)",
      },
      { artist: "Diplo & SIDEPIECE", title: "On My Mind" },
      { artist: "Westend", title: "Freaky Time" },
      {
        artist: "Prospa",
        title: "Don't Stop (Twin Diplomacy Remix)",
      },
      { artist: "BYOR & Mentum", title: "I Can Dance" },
      {
        artist: "Fake Blood",
        title: "I Think I Like It (Westend Edit)",
      },
      { artist: "Westend ft. Hosanna", title: "Drum Death" },
      {
        artist: "Westend ft. Hosanna",
        title: "Drum Death (DENNETT Remix)",
      },
      {
        artist: "VNSSA & Sian & Sacha Robotti",
        title: "Smalltown Girl",
      },
      { artist: "Westend & Dave Summer", title: "Love Spell" },
      {
        at: "20:59",
        artist: "Vanrip & Truth x Lies ft. WEiRD GRRL",
        title: "Like You A Lot",
      },
      {
        artist: "Dansyn vs. Noizu & Westend & No/Me",
        title: "Bang That vs. Push To Start (Westend Edit)",
      },
      {
        artist: "Noizu & Westend ft. No/Me",
        title: "Push To Start",
      },
      { artist: "Dansyn", title: "Bang That" },
      { artist: "Westend & Twin Diplomacy", title: "Sensational" },
      {
        at: "29:48",
        artist: "Eric Prydz vs. Pink Floyd",
        title: "Proper Education (Westend Edit)",
      },
      {
        artist: "Daft Punk",
        title: "Around The World (Westend Edit)",
      },
      {
        artist: "deadmau5 & Wolfgang Gartner",
        title: "Animal Rights (Westend Remix)",
      },
      {
        artist: "Richard Vission & Static Revenger ft. Luciana",
        title: "I Like That (Acappella)",
      },
      { artist: "Westend ft. Lizzy Land", title: "Surrender" },
      { artist: "BRANDON", title: "My Body Talks" },
      {
        artist: "Congorock ft. Mr. Lexx",
        title:
          "Babylon (David Guetta & MARTEN HØRGER pres. Men Machine & KENZ Rework)",
      },
      {
        artist: "Westend & Olivia Sebastianelli",
        title: "The Ceiling",
      },
      {
        artist: "deadmau5 ft. Rob Swire",
        title: "Ghosts 'n' Stuff (Luke Alexander Remix)",
      },
      { at: "59:12", artist: "Westend", title: "Feels Better" },
    ],
    3552,
  );

/**
 * AHEE B2B Liquid Stranger @ bassPOD, EDC Las Vegas 2026
 * Official YT: https://www.youtube.com/watch?v=yXHoHK_jQvc (~59:45)
 * 1001TL operator screenshots 2026-08-01 (partial through ~track 56; more
 * cues expected). Skips bare ID / Artist–ID rows. w/ layers kept as rows.
 * Clocks: even space before/after Gunslinger @ 45:30 (1001 cue).
 */
export const TL_AHEE_LIQUID_STRANGER_EDC_LV_2026: FingerprintSeedRow[] =
  (() => {
    const before: Omit<FingerprintSeedRow, "at">[] = [
      { artist: "Liquid Stranger & AHEE", title: "Superstar" },
      {
        artist: "Skrillex & Damian Marley",
        title: "Make It Bun Dem (Acappella)",
      },
      { artist: "Liquid Stranger & Champagne Drip", title: "Melt" },
      { artist: "Flozone", title: "Break Up Song" },
      { artist: "AHEE & Stylust", title: "Oxygen" },
      {
        artist: "REZZ vs. Aliyah's Interlude",
        title: "Edge vs. IT GIRL (AHEE Edit)",
      },
      { artist: "Da Hool", title: "Meet Her At The Love Parade" },
      { artist: "AHEE", title: "Brain Rot (VIP)" },
      {
        artist: "GRiZ ft. Subtronics",
        title: "Griztronics (ID Remix)",
      },
      {
        artist: "Baha Men",
        title: "Who Let The Dogs Out (Acappella)",
      },
      {
        artist: "Lil Jon ft. Three 6 Mafia",
        title: "Act A Fool (Acappella)",
      },
      { artist: "Liquid Stranger & AHEE", title: "Hot Shot" },
      { artist: "AHEE & SubDocta", title: "Fiyah" },
      { artist: "AHEE", title: "Bug Eater (VIP)" },
      {
        artist: "Skrillex & The Doors",
        title: "Breakin' A Sweat (It's Alright) (Acappella)",
      },
      {
        artist: "Ganja White Night & Liquid Stranger",
        title: "Jungle Juice",
      },
      {
        artist: "Skrillex & Fred again.. & Flowdan",
        title: "Rumble (Acappella)",
      },
      {
        artist: "Benny Benassi pres. The Biz",
        title: "Satisfaction (Acappella)",
      },
      {
        artist: "The Pixies",
        title: "Where Is My Mind? (AHEE Edit)",
      },
      {
        artist: "Space Laces",
        title: "Dominate (TYNAN Flip)",
      },
      { artist: "The Prodigy", title: "Breathe" },
      {
        artist: "Queen",
        title: "We Will Rock You (Acappella)",
      },
      { artist: "AHEE", title: "Shock Rave" },
      { artist: "Phibes", title: "Bassdrop" },
      {
        artist: "Lil Wayne",
        title: "A Milli (Acappella)",
      },
      { artist: "Liquid Stranger & Flozone", title: "Lose It" },
      {
        artist: "AHEE & SØMETHING",
        title: "The Action (WonkyWilla Remix)",
      },
      {
        artist: "Flux Pavilion & Liquid Stranger & AHEE",
        title: "Move Your Body",
      },
      {
        artist: "Skrillex & Mr. Oizo ft. Missy Elliott",
        title: "RATATA (ID Remix)",
      },
      {
        artist: "Liquid Stranger ft. Crooked Bangs",
        title: "Revolution (ID Remix)",
      },
      {
        artist: "Megan Thee Stallion",
        title: "Thot Shit (ID Remix)",
      },
      { artist: "Liquid Stranger & AHEE", title: "Space Whip" },
      { artist: "AHEE", title: "Bass Hamster" },
      { artist: "WODD", title: "Magic Pill" },
      {
        artist: "Levity ft. Dem Jointz",
        title: "Flip It (ID Remix)",
      },
      {
        artist: "Run The Jewels ft. Greg Nice & DJ Premier",
        title: "Ooh La La (Acappella)",
      },
      {
        artist: "t.A.T.u.",
        title: "Not Gonna Get Us (Liquid Stranger Remix)",
      },
      {
        artist: "Liquid Stranger ft. GG Magree",
        title: "Faster And Faster (ID Remix)",
      },
      { artist: "Liquid Stranger & NEOTEK", title: "Microphone" },
    ];
    const after: Omit<FingerprintSeedRow, "at">[] = [
      { artist: "bbno$", title: "it Boy (Acappella)" },
      { artist: "Liquid Stranger & TVBOO", title: "Cracked" },
      { artist: "Big Gigantic & AHEE", title: "Funk Rocket" },
      { artist: "House Of Pain", title: "Jump Around" },
      { artist: "AHEE & ProbCause", title: "Rainbow Funk" },
      {
        artist: "Liquid Stranger & ProbCause",
        title: "Trailblazer (AHEE Remix)",
      },
      { artist: "Noisestorm", title: "Crab Rave" },
      { artist: "OddKidOut & AHEE", title: "WONKY" },
      {
        artist: "Liquid Stranger ft. Warrior Queen & HARD KNOCK",
        title: "Hydroplane (ID Remix)",
      },
      { artist: "Liquid Stranger", title: "Shake (ID Remix)" },
      {
        artist: "Dillon Francis & NGHTMRE",
        title: "Another Dimension",
      },
      { artist: "AHEE", title: "Alien Invader" },
      { artist: "TVBOO & AHEE", title: "Space Boat" },
      {
        artist: "Vengaboys",
        title: "We Like To Party! (The Vengabus)",
      },
      {
        artist: "Khia",
        title: "My Neck, My Back (Lick It) (Acappella)",
      },
      {
        artist: "NGHTMRE & Liquid Stranger ft. Mougleta",
        title: "Restless (ID Remix)",
      },
    ];
    const gunAt = 45 * 60 + 30;
    const beforeSpaced = evenlySpaceRows(before, gunAt);
    const afterSpaced = evenlySpaceRows(after, 3585 - gunAt).map((row) => {
      const sec = parseClockToSec(row.at);
      if (sec == null) return row;
      return { ...row, at: formatClock(gunAt + sec) };
    });
    return [
      ...beforeSpaced,
      {
        artist: "Liquid Stranger ft. Pistol Pete",
        title: "Gunslinger (Bemah Flip)",
        at: "45:30",
      },
      ...afterSpaced,
    ];
  })();

/**
 * Darude @ quantumVALLEY, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=dXBoIY65P8s (~56:22)
 * 1001TL: https://1001.tl/1v8whc0k (CF-blocked in CI)
 * Operator screenshots 2026-08-01. Skips bare ID / Darude–ID rows.
 */
export const TL_DARUDE_EDC_LV_2026: FingerprintSeedRow[] = [
  {
    at: "0:00",
    artist: "Darude ft. AI AM",
    title: "Beautiful Alien (Boyan & Boyer Remix)",
  },
  { at: "3:26", artist: "Robert Miles", title: "Children" },
  { at: "11:47", artist: "Tom Fall", title: "iROK" },
  { at: "13:30", artist: "Darude", title: "Rush" },
  { at: "18:59", artist: "Kx5 ft. HAYLA", title: "Escape" },
  { at: "28:47", artist: "Darude", title: "Feel The Beat" },
  { at: "30:00", artist: "Darude", title: "You" },
  { at: "32:05", artist: "Darude & Mashd N Kutcher", title: "Hype" },
  { at: "36:06", artist: "Darude", title: "Endless Wave" },
  {
    at: "40:00",
    artist: "Darude",
    title: "Sandstorm (Storm 25 Remix)",
  },
  { at: "46:20", artist: "Darude", title: "Bitter Sweet" },
  {
    at: "49:44",
    artist: "Supermode",
    title: "Tell Me Why (Darude Remix)",
  },
];

/**
 * CID @ circuitGROUNDS, EDC Las Vegas 2017-06-18
 * Official SC: https://soundcloud.com/cidmusic/cid-edc-lv-2017 (~59:02)
 * 1001TL: https://1001.tl/qhdctfk — operator console capture 2026-08-01.
 * Known 1001 cues kept; gaps interpolated (capture had broken i*90 fills).
 */
export const TL_CID_EDC_LV_2017: FingerprintSeedRow[] =
  interpolateMissingClocks(
    [
      { at: "0:00", artist: "CID & Kaskade", title: "Sweet Memories" },
      { artist: "Roulsen", title: "Rumble" },
      {
        artist: "Maroon 5 ft. Future",
        title: "Cold (Acappella)",
      },
      {
        at: "6:22",
        artist: "Bruno Mars",
        title: "Versace On The Floor (CID Remix)",
      },
      {
        at: "9:15",
        artist: "CID ft. Conrad Sewell",
        title: "Secrets (BROHUG Remix)",
      },
      { at: "12:10", artist: "Madison Mars", title: "Doppler" },
      {
        artist: "Kaskade & Project 46 ft. Stef Lang",
        title: "Last Chance",
      },
      {
        at: "15:45",
        artist: "Skrillex & Habstrakt",
        title: "Chicken Soup",
      },
      { at: "17:58", artist: "CID", title: "Werk" },
      {
        artist: "JOYRYDE vs. Eric Prydz",
        title: "Hot Drum vs. Pjanoo",
      },
      { artist: "Eric Prydz", title: "Pjanoo" },
      { artist: "JOYRYDE", title: "Hot Drum" },
      {
        artist: "The Magician ft. Brayton Bowman",
        title: "Shy (CID Remix)",
      },
      { at: "26:12", artist: "CID", title: "Creepin'" },
      { artist: "BROHUG", title: "If I'm Wrong" },
      {
        at: "30:35",
        artist: "Throttle",
        title: "Hit The Road Jack (CAZZTEK Remix)",
      },
      { at: "33:13", artist: "Sikdope", title: "Snakes" },
      {
        at: "36:05",
        artist: "CID ft. CeeLo Green",
        title: "Believer (CID VIP Mix)",
      },
      { artist: "Kideko & George Kwali", title: "Crank It" },
      {
        at: "41:22",
        artist: "Galantis & Hook N Sling",
        title: "Love On Me (CID Remix)",
      },
      { artist: "Chris Lake", title: "I Want You" },
      { artist: "Croatia Squad", title: "Hyper" },
      { artist: "Tiësto & Sevenn", title: "BOOM" },
      {
        artist: "The Chainsmokers & Coldplay",
        title: "Something Just Like This (Don Diablo Remix)",
      },
      {
        at: "54:18",
        artist: "Ummet Ozcan ft. Ambush",
        title: "Bombjack",
      },
      { at: "57:17", artist: "Kaskade & CID", title: "Us" },
    ],
    3542,
  );

/**
 * Bleu Clair @ stereoBLOOM, EDC Las Vegas 2023-05-19
 * Official YT: https://www.youtube.com/watch?v=c_sx3zum8Z0 (~60:50)
 * Official SC: https://soundcloud.com/bleuclair/edclv2023
 * 1001TL: https://1001.tl/283zdwmt — operator console capture 2026-08-01
 * (17/20 timed cues; gaps interpolated).
 */
export const TL_BLEU_CLAIR_EDC_LV_2023: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Bleu Clair", title: "Mean Sumthin" },
  {
    at: "6:45",
    artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
    title: "Right Now (Bleu Clair Remix)",
  },

  { at: "10:30", artist: "Bleu Clair & Dances", title: "Peanut Butter" },
  {
    at: "14:15",
    artist: "Pitbull ft. Trina & Young Bo$$",
    title: "Go Girl (Bleu Clair Edit)",
  },
  { at: "17:34", artist: "Bleu Clair", title: "Sand Dunes" },
  {
    at: "21:49",
    artist: "Groove Armada",
    title: "Superstylin' (Bleu Clair Edit)",
  },
  {
    at: "25:34",
    artist: "Bleu Clair & OOTORO ft. Chyra",
    title: "Killer Bee",
  },
  { at: "28:49", artist: "Bleu Clair", title: "m.A.A.d City" },
  { at: "32:04", artist: "Bleu Clair", title: "The Rhythm" },
  {
    at: "35:12",
    artist: "Bleu Clair & OOTORO",
    title: "Beat Like This (VIP)",
  },
  { at: "36:55", artist: "Bleu Clair ft. Jelita", title: "Have Me All" },
  {
    at: "38:42",
    artist: "MK ft. Carla Munroe",
    title: "17 (Bleu Clair Remix)",
  },
  { at: "42:12", artist: "Bleu Clair", title: "Samsara" },
  {
    at: "46:20",
    artist: "Matroda & Bleu Clair",
    title: "Disco Tool (VIP)",
  },
  {
    at: "47:35",
    artist: "Matroda & Bleu Clair",
    title: "Disco Tool (OOTORO Remix)",
  },
  { at: "48:35", artist: "Bleu Clair", title: "Step Into It" },
  { at: "51:57", artist: "Bleu Clair", title: "In My Mind" },
  {
    at: "57:17",
    artist: "Bleu Clair",
    title: "Mistake vs. Hyperspace (Bleu Clair Mashup)",
  },
  {
    at: "58:24",
    artist: "Bleu Clair ft. Teza Sumendra",
    title: "Hyperspace",
  },
  { at: "59:30", artist: "Bleu Clair", title: "Mistake" },
];

/**
 * Wax Motif @ cosmicMEADOW, EDC Las Vegas 2021-10-24
 * Official SC: https://soundcloud.com/waxmotif/wax-motif-live-edc-2021 (~57:33)
 * 1001TL: https://1001.tl/2pzx4mbk — operator console capture 2026-08-01
 * (25/25 timed cues).
 */
export const TL_WAX_MOTIF_EDC_LV_2021: FingerprintSeedRow[] = [
  { at: "0:01", artist: "23", title: "Pink Soldiers (Squid Game OST)" },
  {
    at: "3:19",
    artist: "Drake ft. Future & Young Thug",
    title: "Way 2 Sexy (Valentino Khan Remix)",
  },
  {
    at: "4:36",
    artist: "J Balvin & Skrillex",
    title: "In Da Getto (Chris Lorenzo Remix)",
  },
  { at: "7:48", artist: "Trikshaw", title: "Skylift" },
  { at: "8:53", artist: "Malaa", title: "Who I Am" },
  { at: "12:50", artist: "Nelly", title: "Hot In Herre" },
  {
    at: "16:50",
    artist: "Chris Lorenzo ft. High Jinx",
    title: "California Dreamin'",
  },
  {
    at: "19:49",
    artist: "Wax Motif & Shahay ft. Scrufizzer",
    title: "Come Again",
  },
  {
    at: "22:57",
    artist: "Wax Motif",
    title: "Keep Raving (Qlank Remix)",
  },
  { at: "26:00", artist: "Honey & Badger & Hooders", title: "Fuse" },
  { at: "28:10", artist: "MPH", title: "Barrington" },
  {
    at: "29:29",
    artist: "Wax Motif & ALRT & Nessly",
    title: "Hard Street",
  },
  {
    at: "31:21",
    artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
    title: "Something's About To Go Down",
  },
  {
    at: "33:35",
    artist: "Matroda & Sage Armstrong & Rhiannon Roze",
    title: "Ur Mind",
  },
  { at: "35:36", artist: "BassBoy", title: "Got A Groove" },
  {
    at: "37:44",
    artist: "AC Slater & Chris Lorenzo",
    title: "Fly With Us",
  },
  {
    at: "39:18",
    artist: "Taiki Nulight & Wax Motif ft. Scrufizzer",
    title: "Skank N Flex",
  },
  { at: "41:04", artist: "Busta Rhymes", title: "Touch It" },
  { at: "42:53", artist: "Wax Motif", title: "Wet" },
  { at: "44:33", artist: "KOHMI", title: "San Francisco" },
  {
    at: "45:36",
    artist: "AC Slater & Chris Lorenzo",
    title: "Fly Kicks (Wax Motif Remix)",
  },
  {
    at: "49:01",
    artist: "Wax Motif ft. Diddy",
    title: "Divided Souls",
  },
  {
    at: "53:49",
    artist: "RÜFÜS DU SOL",
    title: "Innerbloom (H.O.S.H. Remix)",
  },
  {
    at: "56:14",
    artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
    title: "Shake",
  },
  {
    at: "57:15",
    artist: "Wax Motif & Phlegmatic Dogs",
    title: "Need You",
  },
];

/**
 * Cloonee @ stereoBLOOM, EDC Las Vegas 2022-05-21
 * Official SC: https://soundcloud.com/cloonee/cloonee-edc-2022 (~61:52)
 * 1001TL: https://1001.tl/1r9qsbg1 — operator console capture 2026-08-01
 * (14/15 timed cues).
 */
export const TL_CLOONEE_EDC_LV_2022: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Cloonee", title: "Fine Night" },
  { at: "6:05", artist: "Piero Pirupa", title: "Bass Club" },
  { at: "10:18", artist: "Sante Sansone", title: "Looking For Something" },
  { at: "11:48", artist: "Cloonee", title: "Lose Control" },
  { at: "16:03", artist: "Jamie Coins", title: "Still Flexin'" },
  {
    at: "19:40",
    artist: "Chris Lake ft. Alexis Roberts",
    title: "Turn Off The Lights (Cloonee Remix)",
  },
  { at: "23:55", artist: "BeMore & Wøvex", title: "Ma Love" },
  { at: "27:51", artist: "Shokë", title: "Coast To Coast" },
  { at: "30:53", artist: "Chris Lake & Cloonee", title: "Nightmares" },
  { at: "35:24", artist: "Trace", title: "G.L.A.M" },
  { at: "38:53", artist: "Cloonee & Brisotti", title: "Tripasia" },
  { at: "43:23", artist: "Cloonee & Wade", title: "Mi Amor" },
  { at: "47:53", artist: "Yungness & Jaminn", title: "Backroom" },
  { at: "50:23", artist: "Cloonee", title: "Love You Like That" },
  { at: "58:53", artist: "Cloonee", title: "Sun Goes Down" },
];

/**
 * Odd Mob @ cosmicMEADOW, EDC Las Vegas 2025-05-17
 * Official SC: https://soundcloud.com/oceanologymusic/odd-mob-live-at-edc-las-vegas-2025-cosmic-meadow-day-2-3 (~59:10)
 * 1001TL: https://1001.tl/2cz5c0h1 — operator console capture 2026-08-01
 * (19/29 timed cues; gaps interpolated).
 */
export const TL_ODD_MOB_EDC_LV_2025: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Odd Mob ft. Ed Graves", title: "Vertigo" },
  {
    at: "3:10",
    artist: "Tiësto & Odd Mob & GOODBOYS",
    title: "Won't Be Possible",
  },
  {
    at: "6:00",
    artist: "Cloonee & InntRaw & Young M.A",
    title: "Stephanie (Odd Mob Remix)",
  },
  {
    at: "8:30",
    artist: "Odd Mob",
    title: "Dancing Boys, Dancing Girls",
  },
  { at: "11:40", artist: "TOYZZ", title: "SexyBack" },
  {
    at: "15:40",
    artist: "ROB49",
    title: "WTHELLY (Julian Jordan Remix)",
  },
  {
    at: "18:20",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "System",
  },
  { at: "19:55", artist: "Odd Mob", title: "LEFT TO RIGHT" },
  {
    at: "21:30",
    artist: "SIDEPIECE & Bobby Shmurda",
    title: "CASH OUT",
  },
  {
    at: "24:00",
    artist: "Adam Beyer & Green Velvet",
    title: "Simulator (Odd Mob Remix)",
  },
  {
    at: "25:15",
    artist: "Fred again.. & Swedish House Mafia ft. Future",
    title: "Turn On The Lights Again..",
  },
  {
    at: "26:30",
    artist: "Odd Mob ft. Lizzy Land",
    title: "Never Alone",
  },
  { at: "30:00", artist: "Dom Dolla ft. Daya", title: "Dreamin" },
  { at: "31:25", artist: "Space 92", title: "Orbit Motion" },
  {
    at: "32:50",
    artist: "Kerri Chandler & Spank Rock",
    title: "Planet Sonic vs. Bump (Odd Mob Edit)",
  },
  {
    at: "36:10",
    artist: "BYOR & Angel Janson",
    title: "Saving It All",
  },
  { at: "37:07", artist: "Dom Dolla", title: "Saving Up" },
  { at: "38:04", artist: "Lola Young", title: "Messy" },
  {
    at: "39:00",
    artist: "John Summit & venbee",
    title: "palm of my hands (Odd Mob Remix)",
  },
  { at: "41:05", artist: "33 Below", title: "Mash Up" },
  {
    at: "43:10",
    artist: "Sean Paul & Odd Mob",
    title: "Get Busy (Odd Mob Club Mix)",
  },
  {
    at: "46:00",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "Coming Up (It's Dare)",
  },
  {
    at: "49:00",
    artist: "Odd Mob",
    title: "Don't Stop Make That Body Rock",
  },
  {
    at: "51:40",
    artist: "Basement Jaxx",
    title: "Where's Your Head At? (OMNOM Flip)",
  },
  { at: "53:30", artist: "Odd Mob & OMNOM", title: "Losing Control" },
  { at: "54:30", artist: "Odd Mob", title: "LEFT TO RIGHT" },
  { at: "55:30", artist: "Odd Mob & OMNOM", title: "Losing Control" },
  { at: "56:30", artist: "Combine & MYTHM", title: "OLD SCHOOL" },
  { at: "59:30", artist: "Chris Lake & Ragie Ban", title: "Toxic" },
];

/**
 * Odd Mob @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=2idboK_vTT8 (~60:27)
 * 1001TL: https://1001.tl/qz04ypk — operator console capture 2026-08-01
 * (13/18 timed cues; missing clocks already lerped in capture).
 */
export const TL_ODD_MOB_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Odd Mob & GOODBOYS", title: "Undeniable" },
  {
    at: "3:55",
    artist: "Chris Lake & Abel Balder",
    title: "Ease My Mind (Odd Mob Remix)",
  },
  {
    at: "3:56",
    artist: "Etta James",
    title: "Something's Got A Hold On Me (Acappella)",
  },
  { at: "8:04", artist: "Odd Mob", title: "How To Do It" },
  {
    at: "11:25",
    artist: "Odd Mob ft. Luciana",
    title: "Rock The Rhythm (I Like That)",
  },
  { at: "14:22", artist: "Michael Jackson", title: "Thriller (Odd Mob Edit)" },
  { at: "21:07", artist: "Odd Mob ft. Lizzy Land", title: "Never Alone" },
  { at: "24:14", artist: "Odd Mob", title: "LEFT TO RIGHT" },
  {
    at: "27:20",
    artist: "Tiësto & Odd Mob & GOODBOYS",
    title: "Won't Be Possible",
  },
  {
    at: "33:35",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "Coming Up (It's Dare)",
  },
  {
    at: "36:45",
    artist: "John Summit & venbee",
    title: "palm of my hands (Odd Mob Remix)",
  },
  { at: "40:06", artist: "Mau P", title: "Like I Like It" },
  {
    at: "43:27",
    artist: "50 Cent ft. Olivia",
    title: "Candy Shop (Odd Mob Remix)",
  },
  {
    at: "49:22",
    artist: "Chris Lake",
    title: "Lose My Mind (Walker & Royce Remix)",
  },
  { at: "51:14", artist: "Riton & Kah-Lo", title: "Fake ID" },
  { at: "53:05", artist: "Odd Mob & OMNOM", title: "Losing Control" },
  { at: "56:18", artist: "Trudge & CAIVA", title: "Shades Of Hesitation" },
  { at: "59:30", artist: "Coco Star", title: "I Need A Miracle (Acappella)" },
];

/**
 * Miss Monique @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=WhPtvotfYbc (~58:45)
 * 1001TL: https://1001.tl/2u0sds71 — operator console capture 2026-08-01
 * (20/20 timed cues).
 */
export const TL_MISS_MONIQUE_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Agents Of Time & Miss Monique", title: "Rajada" },
  { at: "2:00", artist: "Miss Monique & Glowal", title: "Rollin'" },
  {
    at: "5:32",
    artist: "HUGEL & SOLTO",
    title: "Jamaican (Bam Bam) (Jast Remix)",
  },
  {
    at: "8:15",
    artist: "Miss Monique & Kapuchon & GLZ",
    title: "Hot Sauce",
  },
  { at: "12:17", artist: "KENZ", title: "Blade" },
  {
    at: "15:20",
    artist: "Bountyhunter",
    title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)",
  },
  { at: "18:05", artist: "Cafius & Oliver Marshak", title: "The Beat" },
  {
    at: "21:38",
    artist: "Miss Monique & P.O.U ft. Susie Ledge",
    title: "Million Miles Away (VIP Remix)",
  },
  { at: "24:56", artist: "Addie Manson", title: "Acid Love" },
  { at: "27:59", artist: "Kevin de Vries & Platero", title: "Man Like Me" },
  {
    at: "31:08",
    artist: "David Guetta & Joachim Garraud ft. JD Davis",
    title: "The World Is Mine (SLVR Remix)",
  },
  { at: "33:53", artist: "19:26 & Bittermind", title: "The Elevator" },
  {
    at: "36:19",
    artist: "Miss Monique & GENESI & Carl Bee",
    title: "Nomacita",
  },
  {
    at: "39:39",
    artist: "Miss Monique & Henri Bergmann & Mario Eighta",
    title: "17",
  },
  { at: "43:09", artist: "ARTBAT ft. John Martin", title: "Coming Home" },
  { at: "44:34", artist: "KASIA & Ayla", title: "Ayla" },
  {
    at: "47:01",
    artist: "The Prodigy",
    title: "No Good (Start The Dance) (Anyma & Stylo Remix)",
  },
  { at: "49:03", artist: "Argy & Omnya", title: "Aria (Omiki Remix)" },
  {
    at: "51:09",
    artist: "Miss Monique & Volkoder",
    title: "Girls On The Floor",
  },
  {
    at: "54:16",
    artist: "Miss Monique & Robbie Williams",
    title: "Beauty In Us",
  },
];

/**
 * Enrico Sangiuliano @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=ubFrkYGGqo8 (~88:18)
 * 1001TL: https://1001.tl/16tnb0pk — operator console capture 2026-08-01
 * (17/19 timed cues; missing clocks already lerped in capture).
 */
export const TL_ENRICO_SANGIULIANO_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Horacio Cruz", title: "Escape Domo" },
  { at: "2:00", artist: "Chlär", title: "No Ceiling" },
  { at: "4:00", artist: "Victor Ruiz", title: "Scorpio (HNGT Remix)" },
  { at: "8:35", artist: "Remco Beekwilder", title: "Rhythm Pressure" },
  { at: "11:00", artist: "Lewis Fautzi", title: "Nonlinear Form" },
  { at: "12:45", artist: "Julian Jeweil", title: "Firework" },
  { at: "15:20", artist: "Astral J", title: "Hhh! Shhh!" },
  { at: "18:40", artist: "Enrico Sangiuliano", title: "Interconnection" },
  { at: "27:30", artist: "LUSU", title: "Like This" },
  { at: "31:15", artist: "JackRock", title: "Limerence" },
  {
    at: "39:50",
    artist: "Enrico Sangiuliano",
    title: "Order In Chaos (Reactive Mix)",
  },
  { at: "44:23", artist: "Bedrock", title: "Heaven Scent" },
  { at: "48:55", artist: "Enrico Sangiuliano", title: "The Sound Of Space" },
  { at: "53:35", artist: "Demon Noise", title: "Signals" },
  {
    at: "57:35",
    artist: "Enrico Sangiuliano",
    title: "Blooming Era (Sam Kitt Remix)",
  },
  { at: "1:01:30", artist: "Underworld", title: "Born Slippy (Nuxx)" },
  {
    at: "1:03:20",
    artist: "Charlotte de Witte & Enrico Sangiuliano",
    title: "Reflection",
  },
  {
    at: "1:11:35",
    artist: "Enrico Sangiuliano & GMS",
    title: "Transcendence",
  },
  {
    at: "1:18:35",
    artist: "Enrico Sangiuliano",
    title: "The Techno Code (Demon Noise Remix)",
  },
];

/**
 * Nicky Romero @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=TsyGMhx8izw (~59:50)
 * Artist YT: https://www.youtube.com/watch?v=B05MAbsCOLA
 * 1001TL: https://1001.tl/wkty6z9 — operator console capture 2026-08-01
 * (28/76 timed cues; missing clocks already lerped in capture).
 */
export const TL_NICKY_ROMERO_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "DubVision & Nicky Romero & Oaks vs. Calvin Harris & Disciples & Ina Wroldsen", title: "Live My Life vs. How Deep Is Your Love (Nicky Romero Mashup)" },
  { at: "0:59", artist: "Calvin Harris & Disciples ft. Ina Wroldsen", title: "How Deep Is Your Love (Acappella)" },
  { at: "1:48", artist: "DubVision & Nicky Romero & Oaks", title: "Live My Life" },
  { at: "2:36", artist: "Martin Garrix & Matisse & Sadko & BARBZ vs. Sander van Doorn & DVBBS & Aleesia", title: "Butterflies vs. Gold Skies (Martin Garrix Mashup)" },
  { at: "3:09", artist: "Sander van Doorn & Martin Garrix & DVBBS ft. Aleesia", title: "Gold Skies (Acappella)" },
  { at: "3:43", artist: "Martin Garrix & Matisse & Sadko ft. BARBZ", title: "Butterflies" },
  { at: "4:16", artist: "VIVID", title: "Gas" },
  { at: "6:38", artist: "Calvin Harris ft. Florence Welch", title: "Sweet Nothing (Acappella)" },
  { at: "9:00", artist: "John Summit & HAYLA", title: "Shiver (Cassian Remix)" },
  { at: "9:55", artist: "Cirez D", title: "On Off (Kapuchon Edit)" },
  { at: "10:50", artist: "Nicky Romero & SICK INDIVIDUALS vs. Alesso & Tove Lo", title: "Hold On vs. Heroes (We Could Be) (SunJay & Tyo Edit)" },
  { at: "11:24", artist: "Alesso ft. Tove Lo", title: "Heroes (We Could Be) (Acappella)" },
  { at: "11:59", artist: "Nicky Romero & SICK INDIVIDUALS", title: "Hold On" },
  { at: "12:33", artist: "Nicky Romero & Deniz Koyu vs. Avicii & Sandro Cavazza", title: "Destiny vs. Without You (Nicky Romero Mashup)" },
  { at: "13:22", artist: "Avicii ft. Sandro Cavazza", title: "Without You (Acappella)" },
  { at: "14:11", artist: "Nicky Romero & Deniz Koyu ft. Alexander Tidebrink", title: "Destiny" },
  { at: "15:00", artist: "Nicky Romero & SMACK vs. Eric Prydz & Tom Cane", title: "Generate vs. Funky Bitz (Nicky Romero Mashup)" },
  { at: "15:36", artist: "Eric Prydz ft. Tom Cane", title: "Generate" },
  { at: "16:13", artist: "Nicky Romero & SMACK", title: "Funky Bitz" },
  { at: "16:49", artist: "The Temper Trap", title: "Sweet Disposition (John Summit & Silver Panda Remix)" },
  { at: "18:40", artist: "AFROJACK & Martin Garrix & David Guetta & Amél vs. Rihanna", title: "Our Time vs. Right Now (Nicky Romero Mashup)" },
  { at: "19:06", artist: "Rihanna ft. David Guetta", title: "Right Now (Acappella)" },
  { at: "19:32", artist: "AFROJACK & Martin Garrix & David Guetta & Amél ft. Zack Hall", title: "Our Time" },
  { at: "19:57", artist: "Mesto", title: "Listen To Me" },
  { at: "20:40", artist: "Nicky Romero & Third ≡ Party vs. David Guetta & Benny Benassi vs. MAKJ & M35 vs. MEDUZA & GOODBOYS vs. Faithless vs. FISHER", title: "For The People vs. Satisfaction vs. GO vs. Piece Of Your Heart vs. Insomnia vs. You Little Beauty (Nicky Romero Mashup)" },
  { at: "20:50", artist: "Faithless", title: "Insomnia" },
  { at: "21:00", artist: "MAKJ & M35", title: "GO (It's Time To Go If You Don't Dig Techno Acappella)" },
  { at: "21:10", artist: "FISHER", title: "You Little Beauty" },
  { at: "21:21", artist: "MEDUZA ft. GOODBOYS", title: "Piece Of Your Heart" },
  { at: "21:31", artist: "David Guetta vs. Benny Benassi", title: "Satisfaction" },
  { at: "21:42", artist: "Nicky Romero & Third ≡ Party", title: "For The People" },
  { at: "21:52", artist: "Matisse & Sadko & Vion Konger & Scrufizzer vs. Nicky Romero vs. Zedd & Foxes", title: "Pull Up vs. Toulouse vs. Clarity (Nicky Romero Mashup)" },
  { at: "22:12", artist: "Nicky Romero", title: "Toulouse" },
  { at: "22:32", artist: "Zedd ft. Foxes", title: "Clarity (Acappella)" },
  { at: "22:52", artist: "Matisse & Sadko & Vion Konger ft. Scrufizzer", title: "Pull Up" },
  { at: "23:12", artist: "Calvin Harris & Alesso ft. Hurts", title: "Under Control" },
  { at: "24:45", artist: "Nicky Romero & Almero ft. Grace Barton", title: "Run To You" },
  { at: "26:16", artist: "HUGEL & Imael Angel & Ultra Naté", title: "Movin' To The Sun" },
  { at: "27:55", artist: "ABBA & HÄWK vs. Loud 'N Bright & Nicky Romero vs. Gala", title: "Gimme Gimme Gimme vs. To The Floor vs. Freed From Desire (Nicky Romero Mashup)" },
  { at: "28:19", artist: "Gala", title: "Freed From Desire" },
  { at: "28:43", artist: "ABBA", title: "Gimme! Gimme! Gimme! (A Man After Midnight) (HÄWK VIP Edit)" },
  { at: "29:07", artist: "Loud 'N Bright", title: "To The Floor (Nicky Romero Edit)" },
  { at: "29:30", artist: "Swedish House Mafia ft. Pharrell Williams", title: "One (Your Name)" },
  { at: "30:28", artist: "Nicky Romero", title: "Freak" },
  { at: "31:26", artist: "Nicky Romero", title: "Chase The Sun" },
  { at: "33:23", artist: "Martin Garrix & Dua Lipa", title: "Scared To Be Lonely (Acappella)" },
  { at: "35:20", artist: "Martin Garrix & Third ≡ Party vs. Nicky Romero & NERVO", title: "Carry You vs. Like Home (Nicky Romero Mashup)" },
  { at: "35:45", artist: "Nicky Romero & NERVO", title: "Like Home (Acappella)" },
  { at: "36:10", artist: "Martin Garrix & Third ≡ Party ft. Oaks & Declan J Donovan", title: "Carry You" },
  { at: "36:35", artist: "Matisse & Sadko vs. Adele", title: "Himalaya vs. Rolling In The Deep (Matisse & Sadko Mashup)" },
  { at: "37:15", artist: "Adele", title: "Rolling In The Deep (Acappella)" },
  { at: "37:55", artist: "Matisse & Sadko", title: "Himalaya" },
  { at: "38:35", artist: "ANOTR ft. 54 Ultra", title: "Talk To You" },
  { at: "39:15", artist: "Nicky Romero ft. FORS", title: "Follow You" },
  { at: "41:20", artist: "Nicky Romero & SICK INDIVIDUALS", title: "Who We Are" },
  { at: "42:05", artist: "Axwell Λ Ingrosso ft. Trevor Guthrie", title: "Dreamer" },
  { at: "42:50", artist: "Sebastian Ingrosso & Tommy Trash & John Martin vs. Swedish House Mafia vs. Justin Bieber & Nicki Minaj vs. Green Velvet & Nicky Romero", title: "Reload vs. Save The World vs. Beauty And A Beat vs. Flash (SunJay & Fuerte Tomorrowland Mashup)" },
  { at: "43:15", artist: "Swedish House Mafia ft. John Martin", title: "Save The World" },
  { at: "43:40", artist: "Sebastian Ingrosso & Tommy Trash & John Martin vs. Green Velvet & Nicky Romero", title: "Reload vs. Flash (Axwell Λ Ingrosso Mashup)" },
  { at: "44:05", artist: "Justin Bieber ft. Nicki Minaj", title: "Beauty And A Beat" },
  { at: "44:30", artist: "Third ≡ Party & Mark Roma", title: "Shut Up (Nicky Romero Edit)" },
  { at: "44:55", artist: "Kid Cudi ft. MGMT & Ratatat & Steve Aoki vs. Dimitri Vegas & Like Mike & MOGUAI", title: "Pursuit Of Happiness vs. Mammoth (Dimitri Vegas & Like Mike Mashup)" },
  { at: "45:48", artist: "Kid Cudi ft. MGMT & Ratatat", title: "Pursuit Of Happiness (Steve Aoki Remix)" },
  { at: "46:42", artist: "Dimitri Vegas & MOGUAI & Like Mike", title: "Mammoth" },
  { at: "47:35", artist: "Hardwell & Nicky Romero ft. MERYLL", title: "I Wanna Dance" },
  { at: "48:48", artist: "Marlon Hoffstadt aka DJ Daddy Trance", title: "It's That Time" },
  { at: "50:00", artist: "Matisse & Sadko vs. Nicky Romero & Vicetone & When We Are Wild", title: "Endless Sunrise vs. Let Me Feel (SunJay & Fuerte Mashup)" },
  { at: "50:32", artist: "Nicky Romero & Vicetone ft. When We Are Wild", title: "Let Me Feel (Acappella)" },
  { at: "51:05", artist: "Matisse & Sadko", title: "Endless Sunrise" },
  { at: "51:37", artist: "Avicii ft. Simon Aldred", title: "Waiting For Love" },
  { at: "52:13", artist: "Martin Garrix vs. Dimitri Vegas & Like Mike vs. Avicii ft. Simon Aldred", title: "Tremor vs. Waiting For Love (Martin Garrix Mashup)" },
  { at: "52:49", artist: "Dimitri Vegas & Like Mike & Martin Garrix", title: "Tremor (Sensation 2014 Anthem)" },
  { at: "53:25", artist: "Avicii ft. Simon Aldred", title: "Waiting For Love (Acappella)" },
  { at: "54:00", artist: "Avicii & Nicky Romero ft. Noonie Bao", title: "I Could Be The One" },
  { at: "56:45", artist: "Justice", title: "D.A.N.C.E. (Acappella)" },
  { at: "59:30", artist: "Porter Robinson ft. Bright Lights", title: "Language" },
];

/**
 * James Hype @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=dmhUJYEdkKo (~58:27)
 * 1001TL: https://1001.tl/2b63zu8k — operator console capture 2026-08-01
 * (21/35 timed cues; missing clocks already lerped in capture).
 */
export const TL_JAMES_HYPE_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Kanye West", title: "Power (Acappella)" },
  { at: "2:06", artist: "Azari & III", title: "Hungry For The Power" },
  {
    at: "4:12",
    artist: "James Hype ft. Sam Harper & Bobby Harvey",
    title: "Waterfalls",
  },
  { at: "6:00", artist: "Alex Culross & EJECA", title: "Rhythm Of The House" },
  { at: "7:05", artist: "Prospa & Murda Beatz", title: "Baby" },
  {
    at: "8:10",
    artist: "Michael Jackson",
    title: "Billie Jean (James Hype Remix)",
  },
  { at: "11:00", artist: "James Hype & Volkoder", title: "One, Two, Three" },
  { at: "12:45", artist: "The Notorious B.I.G.", title: "Big Poppa" },
  { at: "14:30", artist: "James Hype ft. ANTICALM", title: "For The Music" },
  { at: "17:35", artist: "James Hype & Miggy Dela Rosa", title: "Ferrari" },
  {
    at: "20:40",
    artist: "Indeep",
    title: "Last Night A Dj Saved My Life (James Hype Remix)",
  },
  { at: "22:50", artist: "Alice Deejay", title: "Better Off Alone" },
  { at: "22:51", artist: "James Hype", title: "The Flow" },
  { at: "24:30", artist: "James Hype", title: "Start The Dance" },
  {
    at: "27:30",
    artist: "HAVEN. ft. Kaitlin Aragon",
    title: "I Run (James Hype Remix)",
  },
  {
    at: "29:20",
    artist: "Childish Gambino",
    title: "Redbone (James Hype Remix)",
  },
  {
    at: "31:30",
    artist: "The Prodigy",
    title: "Smack My Bitch Up (James Hype Edit)",
  },
  {
    at: "31:31",
    artist: "Criminal Element Orchestra",
    title: "Put The Needle To The Record",
  },
  {
    at: "33:15",
    artist: "Pupa Nas T & James Hype ft. Denise Belfon",
    title: "Work",
  },
  { at: "34:00", artist: "James Hype & Tita Lau", title: "The Record" },
  { at: "35:23", artist: "Run DMC", title: "It's Like That (Acappella)" },
  {
    at: "36:46",
    artist: "Patrick Topping & Rebūke ft. ×1-1+1",
    title: "People Dancing",
  },
  { at: "37:13", artist: "Da Hool", title: "Meet Her At The Love Parade" },
  { at: "39:20", artist: "Ayla", title: "Ayla (James Hype Edit)" },
  { at: "40:07", artist: "Age Of Love", title: "The Age Of Love" },
  { at: "40:54", artist: "Snap!", title: "Rhythm Is A Dancer (Acappella)" },
  { at: "41:40", artist: "James Hype & Tita Lau", title: "Action" },
  {
    at: "43:14",
    artist: "Delerium ft. Sarah McLachlan",
    title: "Silence (Acappella)",
  },
  {
    at: "44:48",
    artist: "ATB",
    title: "9PM (Till I Come) (James Hype Edit)",
  },
  {
    at: "46:22",
    artist: "Frankie Knuckles pres. Marshall Jefferson",
    title: "Move Your Body (Acappella)",
  },
  { at: "47:56", artist: "James Hype", title: "Reprise" },
  { at: "49:30", artist: "Volkoder", title: "My House" },
  {
    at: "51:06",
    artist: "Soulsearcher",
    title: "Can't Get Enough (Acappella)",
  },
  { at: "52:42", artist: "Cirez D", title: "On Off" },
  { at: "54:18", artist: "James Hype", title: "Confession" },
];

/**
 * James Hype @ Get Closer, Melkweg, Amsterdam Dance Event, Netherlands 2025-10-23
 * Official YT: https://www.youtube.com/watch?v=QThaqlzSqLw (artist channel)
 * 1001TL: https://1001.tl/1g6h49l1 — operator console capture 2026-08-01
 * (33/51 timed cues; missing clocks already lerped in capture).
 */
export const TL_JAMES_HYPE_MELKWEG_ADE_2025: FingerprintSeedRow[] = [
  { at: "0:00", artist: "The Prodigy", title: "Smack My Bitch Up (James Hype Remix)" },
  { at: "1:15", artist: "Tita Lau", title: "Bristol's In The House" },
  { at: "2:30", artist: "Mau P", title: "Drugs From Amsterdam" },
  { at: "3:30", artist: "C&C Music Factory", title: "Gonna Make You Sweat (Everybody Dance Now)" },
  { at: "4:30", artist: "James Hype", title: "Rock Right Now" },
  { at: "5:03", artist: "Mau P", title: "Drugs From Amsterdam" },
  { at: "5:35", artist: "James Hype & Tita Lau", title: "Sound Technician" },
  { at: "7:57", artist: "Fatboy Slim", title: "Star 69 (Acappella)" },
  { at: "9:04", artist: "ID ID", title: "Party Loop" },
  { at: "10:10", artist: "Klubbheads", title: "Superstar DJ" },
  { at: "11:57", artist: "Da Hool", title: "Meet Her At The Love Parade (James Hype Edit)" },
  { at: "13:44", artist: "James Hype ft. A.D.O.R.", title: "Behaviour" },
  { at: "15:30", artist: "James Hype", title: "Hit That Switch" },
  { at: "16:50", artist: "The Porn Kings", title: "Up To No Good" },
  { at: "18:10", artist: "James Hype", title: "For Your Mind" },
  { at: "20:15", artist: "Major Lazer & James Hype", title: "Number 1" },
  { at: "21:18", artist: "Camisra & James Hype", title: "Let Me Show You" },
  { at: "22:20", artist: "James Hype & Tita Lau", title: "More Of The Same" },
  { at: "25:30", artist: "Charlie Sloth & Mazza L20 & Giggs", title: "Sleep (James Hype Remix)" },
  { at: "28:45", artist: "Turbo Dubz", title: "Loozing Control" },
  { at: "30:50", artist: "James Hype ft. Sam Harper & Bobby Harvey", title: "Waterfalls" },
  { at: "33:30", artist: "The Good Men", title: "Give It Up (James Hype Edit)" },
  {
    at: "35:45",
    artist: "Fred again.. & Swedish House Mafia ft. Future",
    title: "Turn On The Lights Again..",
  },
  { at: "36:20", artist: "James Hype ft. Kelli-Leigh", title: "More Than Friends" },
  { at: "36:55", artist: "Massano", title: "The Blaze (James Hype Remix)" },
  { at: "37:30", artist: "James Hype", title: "Wild" },
  { at: "39:05", artist: "Signum", title: "What You Got for Me (James Hype Edit)" },
  { at: "40:40", artist: "Masters At Work", title: "Work (Acappella)" },
  { at: "41:50", artist: "Dario Nu\u00f1ez & Javi Colina", title: "Sinsahoi" },
  { at: "43:00", artist: "James Hype", title: "Dominator" },
  { at: "46:30", artist: "Chocolate Puma ft. Shermanology", title: "Dub Of Boom" },
  { at: "48:25", artist: "Corona", title: "The Rhythm Of The Night (Acappella)" },
  { at: "50:20", artist: "James Hype", title: "Don't Wake Me Up" },
  { at: "51:53", artist: "James Hype", title: "Don't Wake Me Up (VIP Mix)" },
  { at: "53:25", artist: "Ryan Resso", title: "I Like It" },
  { at: "55:10", artist: "MistaJam & EMEXL", title: "Boom Box" },
  { at: "56:09", artist: "Public Domain", title: "Operation Blade (Bass In The Place)" },
  { at: "57:07", artist: "Stretch & Vern pres. Maddog", title: "I'm Alive (Genix Remix)" },
  { at: "1:01:04", artist: "Julio Bashmore", title: "Battle For Middle You" },
  { at: "1:03:02", artist: "ATB", title: "9PM (Till I Come) (James Hype Edit)" },
  { at: "1:05:00", artist: "Bad Legs & Shade K", title: "Basszilla" },
  { at: "1:06:30", artist: "Volkoder", title: "Act Up (Bad Boy)" },
  { at: "1:08:50", artist: "The Weeknd & Playboi Carti", title: "Timeless" },
  { at: "1:10:10", artist: "James Hype", title: "East 2 West" },
  { at: "1:11:30", artist: "James Hype & Miggy Dela Rosa", title: "Ferrari" },
  { at: "1:14:55", artist: "James Hype", title: "Generator" },
  { at: "1:17:10", artist: "James Hype", title: "Wembley" },
  { at: "1:19:00", artist: "Drake & Central Cee", title: "Which One (James Hype Remix)" },
  { at: "1:20:40", artist: "Sid Koans", title: "Hypnotize" },
  { at: "1:22:35", artist: "Tita Lau", title: "Take Me Higher" },
  { at: "1:26:05", artist: "James Hype", title: "Be Yourself" },
];

/**
 * Kölsch @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=ra8NYbzPMnk (~59:06)
 * 1001TL: https://1001.tl/2u0sgrq9 — operator console capture 2026-08-01
 * (16/19 timed cues; missing clocks already lerped in capture).
 * Note: last cue @ 59:30 slightly past Relive duration.
 */
export const TL_KOLSCH_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "4:31", artist: "CamelPhat & Kölsch", title: "Waste My Time" },
  { at: "8:27", artist: "M.A.N.D.Y. vs. Booka Shade", title: "Body Language" },
  {
    at: "10:20",
    artist: "Patrick Topping",
    title: "Be Sharp Say Nowt (Kölsch Remix)",
  },
  {
    at: "13:16",
    artist: "The Verve",
    title: "Bittersweet Symphony (Kölsch Remix)",
  },
  { at: "14:59", artist: "Kölsch", title: "Picasso" },
  {
    at: "19:33",
    artist: "The Temper Trap",
    title: "Sweet Disposition (Kölsch Remix)",
  },
  {
    at: "24:26",
    artist: "Benny Benassi pres. The Biz",
    title: "Satisfaction (Kölsch Remix)",
  },
  { at: "26:34", artist: "Butch", title: "Countach (Kölsch Remix)" },
  {
    at: "28:21",
    artist: "Danny Tenaglia ft. Celeda",
    title: "Music Is The Answer (Dancin' And Prancin')",
  },
  {
    at: "29:02",
    artist: "Kölsch ft. Gregor Schwellenbach",
    title: "Cassiopeia",
  },
  { at: "33:46", artist: "ROSALÍA & Björk & Yves Tumor", title: "Berghain" },
  { at: "35:11", artist: "Armin van Buuren & Camisra", title: "Let Me Show You" },
  { at: "36:36", artist: "Masters At Work", title: "Work" },
  { at: "39:13", artist: "Kölsch", title: "Grey" },
  { at: "41:47", artist: "Julian Jeweil", title: "Derbouka" },
  { at: "44:56", artist: "ENUR ft. Natasja", title: "Calabria" },
  { at: "48:04", artist: "Kölsch", title: "Loreley" },
  {
    at: "52:19",
    artist: "Kölsch ft. Troels Abrahamsen",
    title: "All That Matters (ARTBAT Remix)",
  },
  {
    at: "59:30",
    artist: "Kölsch ft. Troels Abrahamsen",
    title: "All that Matters (Symphony of Unity - strings reimagined)",
  },
];

/**
 * Steve Angello @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=5AdQy7lCbN0 (~60:22)
 * 1001TL: https://1001.tl/1tfpw4qk — operator console capture 2026-08-01
 * (20/41 timed cues; missing clocks already lerped in capture).
 */
export const TL_STEVE_ANGELLO_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Steve Angello", title: "Hooligans" },
  {
    at: "3:30",
    artist:
      "Chicane & Axwell vs. Swedish House Mafia vs. Opus III vs. Rui Da Silva & Cassandra Fox",
    title:
      "Offshore vs. Greyhound vs. Fine Day vs. Touch Me (Swedish House Mafia Mashup)",
  },
  {
    at: "4:00",
    artist: "Rui Da Silva ft. Cassandra Fox",
    title: "Touch Me (Acappella)",
  },
  { at: "4:30", artist: "Swedish House Mafia", title: "Greyhound" },
  { at: "5:01", artist: "Opus III", title: "It's A Fine Day (Acappella)" },
  { at: "5:31", artist: "Chicane", title: "Offshore '97" },
  { at: "6:02", artist: "Chicane", title: "Offshore (Axwell Intro Mix)" },
  {
    at: "6:32",
    artist: "Swedish House Mafia & Knife Party ft. ADL",
    title: "Antidote (MPH Remix)",
  },
  {
    at: "8:16",
    artist: "Basement Jaxx",
    title: "Where's Your Head At? (Steve Angello Remix)",
  },
  { at: "10:57", artist: "Faithless", title: "Insomnia" },
  {
    at: "12:58",
    artist: "Steve Angello & Laidback Luke & Rowetta",
    title: "Be vs. Show Me Love vs. Knas (Swedish House Mafia Mashup)",
  },
  {
    at: "13:40",
    artist: "Steve Angello & Laidback Luke ft. Rowetta",
    title: "Be",
  },
  {
    at: "14:21",
    artist: "Steve Angello & Laidback Luke ft. Robin S",
    title: "Show Me Love (Tool)",
  },
  { at: "15:03", artist: "Steve Angello", title: "Knas" },
  {
    at: "15:44",
    artist: "Swedish House Mafia ft. Tinie Tempah",
    title: "Miami 2 Ibiza",
  },
  {
    at: "18:38",
    artist: "Swedish House Mafia & Niki & The Dove",
    title: "Lioness",
  },
  {
    at: "21:49",
    artist: "Swedish House Mafia",
    title: "Wait So Long (Why Do I Have To)",
  },
  { at: "24:55", artist: "Avicii", title: "Levels" },
  { at: "28:29", artist: "Kryder", title: "Eivissa" },
  { at: "29:49", artist: "Swedish House Mafia", title: "Ray Of Solar" },
  {
    at: "31:08",
    artist:
      "Swedish House Mafia vs. Eurythmics & Steve Angello vs. Pharrell Williams",
    title:
      "One (Your Name) vs. Sweet Dreams (Swedish House Mafia Mashup)",
  },
  {
    at: "32:11",
    artist: "Eurythmics",
    title: "Sweet Dreams (Are Made of This) (Steve Angello Remix)",
  },
  { at: "33:14", artist: "Swedish House Mafia", title: "One" },
  {
    at: "34:18",
    artist: "Swedish House Mafia ft. Pharrell Williams",
    title: "One (Your Name)",
  },
  {
    at: "35:21",
    artist: "M83 & Eric Prydz vs. The Temper Trap",
    title: "Midnight City vs. Sweet Disposition (Steve Angello Mashup)",
  },
  {
    at: "36:39",
    artist: "The Temper Trap",
    title: "Sweet Disposition (Acappella)",
  },
  {
    at: "37:57",
    artist: "M83",
    title: "Midnight City (Eric Prydz Private Remix)",
  },
  {
    at: "39:15",
    artist: "Supermode & MEDUZA vs. Benwal",
    title: "Tell Me Why vs. Dive (Steve Angello Mashup)",
  },
  { at: "40:20", artist: "Supermode", title: "Tell Me Why (MEDUZA Remix)" },
  { at: "41:26", artist: "Benwal", title: "Dive" },
  {
    at: "42:31",
    artist: "Swedish House Mafia & Connie Constance",
    title: "Heaven Takes You Home (Swedish House Mafia Remake)",
  },
  {
    at: "45:40",
    artist: "Steve Angello ft. Dougy Mandagi from The Temper Trap",
    title: "Wasted Love (Grum Remix)",
  },
  {
    at: "47:53",
    artist: "Swedish House Mafia ft. John Martin",
    title: "Save The World (NC Edit)",
  },
  {
    at: "48:27",
    artist:
      "Sebastian Ingrosso & Tommy Trash & John Martin vs. Green Velvet & Nicky Romero",
    title: "Reload vs. Flash (Axwell Λ Ingrosso Mashup)",
  },
  {
    at: "49:01",
    artist: "Green Velvet",
    title: "Flash (Nicky Romero Remix)",
  },
  {
    at: "49:36",
    artist: "Sebastian Ingrosso & Tommy Trash ft. John Martin",
    title: "Reload (Vocal Mix)",
  },
  {
    at: "50:10",
    artist: "Swedish House Mafia ft. John Martin",
    title: "Don't You Worry Child",
  },
  {
    at: "52:50",
    artist: "Swedish House Mafia & Lykke Li",
    title: "Happiness Is So Sad",
  },
  {
    at: "56:45",
    artist: "RÜFÜS DU SOL vs. Steve Angello & Dimitri Vangelis & Wyman",
    title: "Innerbloom vs. Payback (Steve Angello Mashup)",
  },
  {
    at: "58:08",
    artist: "Dimitri Vangelis & Wyman X Steve Angello",
    title: "Payback",
  },
  { at: "59:30", artist: "RÜFÜS DU SOL", title: "Innerbloom" },
];

/**
 * FISHER @ Mainstage, Tomorrowland Weekend 1, Belgium 2026-07-18
 * Official YT: https://www.youtube.com/watch?v=4985f9Rfxx0
 * 1001TL: https://1001.tl/2jqqmqsk — operator bookmarklet capture 2026-08-11
 * (25/25 timed cues). Distinct from Freedom Stage WE2 (yt-Uq1WP8v3U4o).
 */
export const TL_FISHER_TML_WE1_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Marlon Hoffstadt aka DJ Daddy Trance", title: "It's That Time (FISHER Remix)" },
  { at: "4:10", artist: "OutKast", title: "Ms. Jackson (N2N & Avilo Edit)" },
  { at: "5:10", artist: "IAN VII & JAVIIER", title: "Sink" },
  { at: "6:53", artist: "Skylark", title: "That's More Like It" },
  { at: "8:00", artist: "FISHER ft. Florence Arman", title: "What A Life" },
  { at: "9:27", artist: "ESSED", title: "Let's Party" },
  { at: "10:43", artist: "Us Two & Franksy", title: "Simulation" },
  { at: "13:30", artist: "FISHER ft. Kita Alexander", title: "Atmosphere" },
  { at: "15:10", artist: "Chris Lake & Tony Romera", title: "House Every Weekend" },
  { at: "16:50", artist: "Zombie Nation", title: "Kernkraft 400 (Broken Hill & Oliver Marshak Remix)" },
  { at: "18:20", artist: "Drake", title: "Janice STFU (HILLS Remix)" },
  { at: "19:55", artist: "FISHER & Tones and I", title: "Favour" },
  { at: "21:25", artist: "Chris Lake & FISHER & Sante Sansone vs. Gotye ft. Kimbra", title: "Somebody (2024)" },
  { at: "24:28", artist: "Marlon Hoffstadt & Coach Harrison", title: "Daddy's In The Club (FISHER Remix)" },
  { at: "27:28", artist: "Dominica", title: "Gotta Let You Go (3Beat Remix)" },
  { at: "28:28", artist: "FISHER", title: "Stay" },
  { at: "30:22", artist: "ANOTR ft. 54 Ultra", title: "Talk To You" },
  { at: "33:49", artist: "FISHER", title: "Rain" },
  { at: "35:20", artist: "Bob Sinclar ft. Steve Edwards", title: "World, Hold On (Children Of The Sky) (FISHER 2022 Rework)" },
  { at: "39:16", artist: "FISHER", title: "Losing It" },
  { at: "43:00", artist: "Daft Punk", title: "One More Time (Valmer Edit)" },
  { at: "46:10", artist: "NIIKO X SWAE", title: "3D" },
  { at: "48:28", artist: "FISHER & Aatig", title: "Take It Off" },
  { at: "52:31", artist: "Cloonee & Prospa", title: "Free Your Mind" },
  { at: "55:49", artist: "Avicii", title: "Levels" },
];

/**
 * FISHER @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=Uq1WP8v3U4o (~81:44)
 * 1001TL: https://1001.tl/kd5wd49 — operator console capture 2026-08-01
 * (17/17 timed cues).
 */
export const TL_FISHER_TML_WE2_2026: FingerprintSeedRow[] = [
  {
    at: "0:12",
    artist: "Marlon Hoffstadt aka DJ Daddy Trance",
    title: "It's That Time (FISHER Remix)",
  },
  { at: "10:00", artist: "FISHER", title: "Stay" },
  {
    at: "13:40",
    artist: "Chris Lake & Tony Romera",
    title: "House Every Weekend",
  },
  { at: "17:52", artist: "IAN VII & JAVIIER", title: "Sink" },
  { at: "20:18", artist: "FISHER", title: "Rain" },
  { at: "28:12", artist: "GIORG", title: "Inside The Haus" },
  { at: "33:40", artist: "FISHER ft. Kita Alexander", title: "Atmosphere" },
  { at: "39:18", artist: "SIDEPIECE ft. 95 South", title: "Can I Ride" },
  { at: "42:12", artist: "Green Velvet & Detlef", title: "Bounce UR Body" },
  { at: "48:58", artist: "FISHER & Aatig", title: "Take It Off" },
  { at: "53:00", artist: "Cloonee & Prospa", title: "Free Your Mind" },
  { at: "1:01:50", artist: "Max Styler", title: "Body Shake" },
  { at: "1:04:25", artist: "FISHER ft. Florence Arman", title: "What A Life" },
  { at: "1:07:51", artist: "FISHER", title: "Losing It" },
  {
    at: "1:11:34",
    artist: "Chris Lake & FISHER & Sante Sansone vs. Gotye ft. Kimbra",
    title: "Somebody (2024)",
  },
  {
    at: "1:14:49",
    artist: "Marlon Hoffstadt & Coach Harrison",
    title: "Daddy's In The Club (FISHER Remix)",
  },
  {
    at: "1:17:25",
    artist: "Bob Sinclar ft. Steve Edwards",
    title: "World, Hold On (Children Of The Sky) (FISHER 2022 Rework)",
  },
];

/**
 * Massano @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * Official YT: https://www.youtube.com/watch?v=eeNljOHahxY
 * 1001TL: https://1001.tl/116uj1x1 — operator bookmarklet capture 2026-08-11
 * (17/17 timed cues). Distinct from Street Parade (yt-fYM9DlFLwKw).
 */
export const TL_MASSANO_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Massano & Humans Musik", title: "Underground" },
  { at: "2:30", artist: "The KLF", title: "What Time Is Love? (Massano & David Lindmer Remix)" },
  { at: "5:45", artist: "Massano & Ugo Banchi", title: "Wanna Dance" },
  { at: "9:00", artist: "Argy & Massano", title: "Wait" },
  { at: "12:01", artist: "Fatboy Slim", title: "Rockafeller Skank (Massano & Un:said Remix)" },
  { at: "15:25", artist: "Massano ft. Ekko", title: "Accelerate" },
  { at: "19:10", artist: "Massano & Silver Panda", title: "Pa Ca" },
  { at: "22:00", artist: "The Chemical Brothers", title: "Do It Again (Massano Remix)" },
  { at: "25:15", artist: "Massano & Glowal", title: "Future Generation" },
  { at: "31:20", artist: "Massano", title: "Back Home" },
  { at: "35:05", artist: "Green Velvet & Harvard Bass", title: "Lazer Beams (Adam Beyer & Massano Remix)" },
  { at: "38:10", artist: "Massano ft. Franksy", title: "Electrified" },
  { at: "41:10", artist: "Yeah Yeah Yeahs", title: "Heads Will Roll (Massano & Matt Guy Remix)" },
  { at: "44:20", artist: "Massano", title: "The Feeling (2025 Private Edit)" },
  { at: "47:55", artist: "Massano", title: "Numb" },
  { at: "51:45", artist: "Massano", title: "Beyond Today" },
  { at: "55:35", artist: "Anyma & Massano ft. Nathan Nicholson", title: "Angel In The Dark" },
];

/**
 * Hardwell @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-24
 * Official YT: https://www.youtube.com/watch?v=yWZyIQtxoXU (~59:10)
 * Artist YT: https://www.youtube.com/watch?v=Py-GG74lLU8
 * 1001TL: https://1001.tl/14y11rh1 — operator console capture 2026-08-01
 * (27/31 timed cues; missing clocks already lerped in capture).
 */
export const TL_HARDWELL_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "Hardwell & braev", title: "Believe" },
  { at: "3:54", artist: "Hardwell & W&W", title: "Bangkok" },
  {
    at: "5:08",
    artist: "Sebastian Ingrosso & Tommy Trash ft. John Martin",
    title: "Reload (Acappella)",
  },
  { at: "7:16", artist: "Hardwell", title: "Spaceman" },
  { at: "9:08", artist: "Michael Jackson", title: "Beat It (Acappella)" },
  { at: "11:13", artist: "Hardwell & MAKJ", title: "Countdown 2026" },
  {
    at: "13:09",
    artist: "Tim Berg ft. Amanda Wilson",
    title: "Seek Bromance (Acappella)",
  },
  {
    at: "14:08",
    artist: "David Guetta & GLOWINTHEDARK ft. Harrison",
    title: "Ain't A Party (Acappella)",
  },
  {
    at: "15:17",
    artist: "Mightyfools",
    title: "Footrocker (Get Your, Get Your Hands Up Acappella)",
  },
  {
    at: "15:29",
    artist: "Dimitri Vegas & Like Mike & Martin Garrix",
    title: "Tremor (Sensation 2014 Anthem) (3, 2, 1 Go Acappella)",
  },
  { at: "15:58", artist: "Rihanna", title: "Where Have You Been (Acappella)" },
  {
    at: "17:51",
    artist: "DJ Sammy & Yanou ft. Do",
    title: "Heaven (Hardwell Bootleg)",
  },
  { at: "21:58", artist: "Hardwell & W&W", title: "Turn Up The Bass" },
  {
    at: "23:21",
    artist: "Icona Pop ft. Charli xcx",
    title: "I Love It (Acappella)",
  },
  {
    at: "25:10",
    artist: "ANOTR ft. 54 Ultra",
    title: "Talk To You (Hardwell Bootleg)",
  },
  {
    at: "30:01",
    artist: "Sebastian Ingrosso & Alesso ft. Ryan Tedder",
    title: "Calling (Lose My Mind) (Hardwell & W&W Bootleg)",
  },
  { at: "33:07", artist: "Hardwell & Azteck & Dr Phunk", title: "LOW" },
  {
    at: "35:53",
    artist: "Alice Deejay & Hardwell vs. Justin Bieber & Nicki Minaj",
    title: "Beauty Off Alone (Hardwell Mashup)",
  },
  {
    at: "37:25",
    artist: "Justin Bieber ft. Nicki Minaj",
    title: "Beauty And A Beat",
  },
  {
    at: "38:58",
    artist: "Alice Deejay",
    title: "Better Off Alone (Hardwell Bootleg)",
  },
  { at: "40:30", artist: "Hardwell & Bassjackers", title: "Bang On The Drums" },
  { at: "40:45", artist: "Masters At Work", title: "Work (Acappella)" },
  {
    at: "43:32",
    artist: "Showtek & Justin Prime",
    title: "Cannonball (Hardwell & W&W Remix)",
  },
  {
    at: "43:34",
    artist: "Hardwell ft. Amba Shepherd",
    title: "Apollo (Acappella)",
  },
  {
    at: "45:10",
    artist: "DVBBS & BORGEOUS & Hardwell vs. KSHMR & Jarrad Kritzstein",
    title: "Tsunami vs. Power (Hardwell Mashup)",
  },
  {
    at: "45:40",
    artist: "Hardwell & KSHMR ft. Jarrad Kritzstein",
    title: "Power (Acappella)",
  },
  {
    at: "46:11",
    artist: "DVBBS & BORGEOUS",
    title: "Tsunami (Hardwell Bootleg)",
  },
  { at: "46:41", artist: "Hardwell & Maddix", title: "AI CARALHO" },
  { at: "49:40", artist: "4444 OF A KIND & Hardwell", title: "RE4SON" },
  {
    at: "53:14",
    artist: "Hardwell & Sub Zero Project ft. Lil Jon",
    title: "Brace For Impact",
  },
  { at: "55:06", artist: "Hardwell & Sound Rush", title: "IRIS" },
];

/**
 * Chris Lorenzo @ The Great Library Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * 1001TL: https://1001.tl/2llc7mh9 — operator console capture 2026-08-01
 * (0/10 timed cues — evenly spaced across ~60m).
 * No official Tomorrowland Relive / artist full-set playback yet — seed ready; do not wire clips.
 */
export const TL_CHRIS_LORENZO_TML_WE2_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      { artist: "Chris Lorenzo", title: "Appetite (VIP)" },
      {
        artist: "Fatboy Slim",
        title: "Right Here, Right Now (Acappella)",
      },
      { artist: "Chris Lorenzo ft. Chynna", title: "Bad Bitch" },
      {
        artist: "Cake",
        title: "Short Skirt/Long Jacket (Anti Up Remix)",
      },
      { artist: "Chris Lorenzo & Kah-Lo", title: "In This Bih'" },
      {
        artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
        title: "I Cannot",
      },
      {
        artist: "Bountyhunter",
        title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)",
      },
      {
        artist: "Chris Lorenzo & Paris Mitchell ft. Waxmaster",
        title: "Hell Yeah!",
      },
      {
        artist: "Chris Lorenzo & Max Styler & Audio Bullys",
        title: "London's On Fire",
      },
      {
        artist: "Chris Lake & Tony Romera",
        title: "House Every Weekend",
      },
    ],
    3600,
  );

/**
 * Dimitri Vegas @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * Official YT (artist): https://www.youtube.com/watch?v=3o0T4z6oT4Y
 * 1001TL: https://1001.tl/1j3n0l69 — operator bookmarklet capture 2026-08-11
 * (timed cues; prior hold used evenly spaced https://1001.tl/ctd034t).
 * Distinct from B2B Nico Moreno Great Library (yt-OTKgBZS8if0).
 */
export const TL_DIMITRI_VEGAS_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "2:32", artist: "Mesto vs. Fallon", title: "Caramelle vs. Diet Coke (Bassjackers TECH BOUNCE Edit)" },
  { at: "2:53", artist: "Fallon", title: "Diet Coke" },
  { at: "3:15", artist: "Mesto", title: "Caramelle" },
  { at: "3:36", artist: "John Summit", title: "LIGHTS GO OUT (Bassjackers TECH BOUNCE Edit)" },
  { at: "5:01", artist: "Dimitri Vegas & Like Mike & Wolfpack", title: "Ocarina (TomorrowWorld Anthem)" },
  { at: "6:03", artist: "Ummet Ozcan", title: "Raise Your Hands (1, 2, 3 Jump Acappella)" },
  { at: "7:04", artist: "Hammer House", title: "The Jumper" },
  { at: "8:08", artist: "Timmy Trumpet ft. Savage", title: "Freaks (Dimitri Vegas & Like Mike Remix)" },
  { at: "8:59", artist: "Ray Volpe", title: "SONG REQUEST" },
  { at: "9:50", artist: "Dimitri Vegas & Like Mike & Martin Garrix", title: "Tremor (Sensation 2014 Anthem)" },
  { at: "10:42", artist: "AFROJACK & Martin Garrix", title: "Turn Up The Speakers" },
  { at: "11:33", artist: "Dimitri Vegas & Like Mike vs. Darren Styles", title: "Better Off Alone" },
  { at: "13:14", artist: "Justin Bieber ft. Nicki Minaj", title: "Beauty And A Beat" },
  { at: "14:55", artist: "Dimitri Vegas & Pat B ft. Sylver", title: "Turn The Tide" },
  { at: "18:00", artist: "Dimitri Vegas & Like Mike & Bassjackers & Hi-Gate", title: "Pitchin' (In Every Direction)" },
  { at: "20:40", artist: "ANOTR ft. 54 Ultra", title: "Talk To You" },
  { at: "22:00", artist: "Katy Perry vs. Coldplay vs. MGMT", title: "Firework Viva La Kids (DJs From Mars Mashup)" },
  { at: "22:40", artist: "Coldplay", title: "Viva La Vida" },
  { at: "23:20", artist: "MGMT", title: "Kids" },
  { at: "24:00", artist: "Katy Perry", title: "Firework (Acappella)" },
  { at: "24:41", artist: "Dimitri Vegas & Like Mike vs. Ummet Ozcan", title: "The Hum (Timmy Trumpet Remix)" },
  { at: "25:21", artist: "Blasterjaxx & Kate Ryan", title: "Désenchantée 3000" },
  { at: "26:02", artist: "Dimitri Vegas & Like Mike vs. Ummet Ozcan", title: "The Hum (Nico Moreno Remix)" },
  { at: "26:42", artist: "Dimitri Vegas & Like Mike & Marlon Hoffstadt & DJ Konik", title: "Makina Time" },
  { at: "27:59", artist: "Dimitri Vegas & Like Mike & Marlon Hoffstadt & DJ Konik", title: "Makina Time (Darren Styles Remix)" },
  { at: "29:16", artist: "Swedish House Mafia & John Martin vs. Avicii & Aloe Blacc", title: "Don't You Worry Child vs. Wake Me Up (Axwell Λ Ingrosso Mashup)" },
  { at: "29:56", artist: "Swedish House Mafia ft. John Martin", title: "Don't You Worry Child" },
  { at: "30:36", artist: "Avicii ft. Aloe Blacc", title: "Wake Me Up (Acappella)" },
  { at: "31:16", artist: "Avicii", title: "Levels" },
  { at: "31:55", artist: "Mightyfools", title: "Footrocker (Get Your, Get Your Hands Up Acappella)" },
  { at: "32:35", artist: "Showtek", title: "We Like To Party (Dimitri Vegas & Like Mike & Bassjackers Remix)" },
  { at: "33:14", artist: "Lady GaGa ft. Colby O'Donis", title: "Just Dance (Dimitri Vegas & MATTN Remix)" },
  { at: "35:28", artist: "Dimitri Vegas & Marlon Hoffstadt", title: "Parada De Techno" },
  { at: "38:19", artist: "Dimitri Vegas & Like Mike & Maddix & Da Hool ft. Kiki Solvej", title: "Meet Her At The Love Parade (Luca Agnelli Remix)" },
  { at: "39:45", artist: "Empire Of The Sun", title: "Walking On A Dream" },
  { at: "40:38", artist: "Bassjackers", title: "KIDS" },
  { at: "41:30", artist: "Dimitri Vegas & Like Mike vs. Nicky Romero vs. Justin Prime & Sandro Silva vs. Europe & Icona Pop & Charli XCX", title: "Everybody Clap vs. Raver Dome vs. The Final Countdown vs. I Love It (Dimitri Vegas & Like Mike Mashup)" },
  { at: "41:52", artist: "Europe", title: "The Final Countdown" },
  { at: "42:14", artist: "Icona Pop ft. Charli xcx", title: "I Love It (Acappella)" },
  { at: "42:36", artist: "3 Are Legend & Justin Prime & Sandro Silva", title: "Raver Dome" },
  { at: "42:58", artist: "Dimitri Vegas & Like Mike vs. Nicky Romero", title: "Everybody Clap" },
  { at: "43:20", artist: "Dimitri Vegas & Like Mike vs. DVBBS & BORGEOUS", title: "Stampede" },
  { at: "43:42", artist: "Dimitri Vegas & Like Mike vs. Fantasm", title: "Pump This Party" },
  { at: "46:28", artist: "Dimitri Vegas & Mark With A K", title: "Funky" },
  { at: "48:32", artist: "Rotterdam Terror Corps", title: "Raveworld" },
  { at: "50:01", artist: "Dimitri Vegas & Like Mike & Marc Acardipane & Bassjackers", title: "Stereo Murder (Per Pleks Remix)" },
  { at: "51:30", artist: "Dimitri Vegas & WINSON", title: "Flute" },
  { at: "52:09", artist: "Dimitri Vegas & Like Mike vs. VINAI", title: "Louder (Acappella)" },
  { at: "52:48", artist: "Dimitri Vegas & Like Mike & Bassjackers", title: "Axel F (Luca Agnelli Remix)" },
  { at: "54:30", artist: "HUGEL & SOLTO", title: "Jamaican (Bam Bam)" },
  { at: "55:20", artist: "Luca Agnelli", title: "Tokyo Drift" },
  { at: "56:10", artist: "Dimitri Vegas & Timmy Trumpet", title: "Crazy On The Dancefloor" },
  { at: "58:14", artist: "M83", title: "Midnight City" },
  { at: "59:25", artist: "Alesso & OneRepublic", title: "If I Lose Myself" },
  { at: "1:00:35", artist: "Soft Cell", title: "Tainted Love" },
  { at: "1:02:15", artist: "Bountyhunter", title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)" },
  { at: "1:03:28", artist: "Bountyhunter", title: "Woops (Dimitri Vegas & Junkie Kid 2025 VIP Mix)" },
  { at: "1:04:40", artist: "Dimitri Vegas & Like Mike & Tiësto & W&W ft. Dido", title: "Thank You (Not So Bad) (Dimitri Vegas Edit)" },
  { at: "1:05:47", artist: "Dimitri Vegas & Like Mike & Tiësto & W&W ft. Dido", title: "Thank You (Not So Bad) (Darren Styles Remix)" },
  { at: "1:06:53", artist: "Dimitri Vegas & MOGUAI & Like Mike", title: "Mammoth (MANDY Remix)" },
  { at: "1:08:00", artist: "Rihanna", title: "Where Have You Been (Acappella)" },
  { at: "1:09:06", artist: "Dimitri Vegas & MOGUAI & Like Mike", title: "Mammoth (Ben Nicky & Dr Phunk Remix)" },
  { at: "1:10:13", artist: "Syndicate Of L.A.W.", title: "Right On Time (2000 Countdown The Holly Digit Acappella)" },
  { at: "1:11:19", artist: "Michael Sembello", title: "Maniac (Dimitri Vegas & Marlon Hoffstadt Remix)" },
  { at: "1:13:25", artist: "Dimitri Vegas & Like Mike", title: "Allein Allein" },
];

export const TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Yves Deruyter", title: "... Animals (Dimitri Vegas Remix)" },
  { at: "1:38", artist: "The Maxx", title: "Cocaine (Acappella)" },
  { at: "3:15", artist: "Hi-Gate", title: "Pitchin' (In Every Direction)" },
  { at: "4:43", artist: "Revoxx", title: "Bassline Kick" },
  { at: "6:11", artist: "Gigi D'Agostino", title: "Bla Bla Bla (HOREM Remix)" },
  {
    at: "8:11",
    artist: "Dimitri Vegas & Like Mike & Maddix & Da Hool ft. Kiki Solvej",
    title: "Meet Her At The Love Parade (Luca Agnelli Remix)",
  },
  { at: "10:16", artist: "Dimitri Vegas & Like Mike vs. Fantasm", title: "Pump This Party" },
  {
    at: "12:53",
    artist: "Mr. Polska & Natte Visstick & Vieze Asbak",
    title: "POLSKA JUMPSTYLE (KAAI Remix)",
  },
  { at: "14:30", artist: "APH\u00d8TIC", title: "Thalassophobia" },
  {
    at: "16:08",
    artist: "Dimitri Vegas & Like Mike vs. Ummet Ozcan",
    title: "The Hum (Nico Moreno Remix)",
  },
  { at: "17:50", artist: "Dimitri Vegas & Pat B ft. Sylver", title: "Turn The Tide" },
  { at: "20:45", artist: "Revoxx", title: "Kickdrum Junkie" },
  { at: "22:54", artist: "DVBBS & BORGEOUS", title: "Tsunami (ROYAL Hard Techno Remix)" },
  { at: "24:18", artist: "UMEK", title: "Gatex (Dimitri Vegas Remix)" },
  { at: "27:22", artist: "Rotterdam Terror Corps", title: "Raveworld" },
  {
    at: "28:45",
    artist: "Dimitri Vegas & Like Mike & Marc Acardipane & Bassjackers",
    title: "Stereo Murder (Per Pleks Remix)",
  },
  { at: "30:20", artist: "Zombie Nation", title: "Kernkraft 400 (Lunaticz Remix)" },
  { at: "31:18", artist: "Massano", title: "The Feeling (ACOR HT Rework)" },
  { at: "32:15", artist: "Marc Acardipane a.k.a. Pilldriver", title: "Pitch-Hiker" },
  { at: "33:53", artist: "Fatboy Slim", title: "Right Here, Right Now" },
  {
    at: "35:30",
    artist: "Bountyhunter",
    title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)",
  },
  { at: "36:29", artist: "Bountyhunter", title: "Woops (Dimitri Vegas & Junkie Kid 2025 VIP Mix)" },
  { at: "37:28", artist: "Jones & Stephenson", title: "The First Rebirth" },
  { at: "38:27", artist: "Bountyhunter", title: "Woops (Anderex Edit)" },
  { at: "39:26", artist: "Bountyhunter", title: "Woops" },
  { at: "40:24", artist: "Linkin Park", title: "Numb (Trey Pearce Remix)" },
  {
    at: "42:29",
    artist: "Dimitri Vegas & Like Mike & Marlon Hoffstadt & DJ Konik",
    title: "Makina Time",
  },
  {
    at: "43:46",
    artist: "Dimitri Vegas & Like Mike & Marlon Hoffstadt & DJ Konik",
    title: "Makina Time (Darren Styles Remix)",
  },
  { at: "45:03", artist: "Dimitri Vegas & Outsiders & DJ Isaac", title: "Face Down Ass Up" },
  { at: "47:47", artist: "Nico Moreno ft. Laren", title: "You Make Me Horny" },
  { at: "50:31", artist: "Dimitri Vegas & Mark With A K", title: "Funky" },
  {
    at: "53:03",
    artist: "Michael Sembello",
    title: "Maniac (Dimitri Vegas & Marlon Hoffstadt Remix)",
  },
  { at: "55:28", artist: "GRAVEDGR & Junkie Kid", title: "El Sistema" },
  { at: "56:49", artist: "Sunbeam", title: "Outside World (Brennan Heart Remix)" },
  { at: "59:43", artist: "Shogun", title: "HARDCORE SOUND" },
];

/**
 * Calvin Harris @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * 1001TL: https://1001.tl/1z0j2zlk — operator console capture 2026-08-01
 * (0/30 timed cues — evenly spaced across ~60m).
 * No official Tomorrowland Relive yet — seed ready; do not wire fan uploads.
 */
export const TL_CALVIN_HARRIS_TML_WE2_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      { artist: "Calvin Harris", title: "C.U.B.A (Calvin Harris 2026 Remix)" },
      { artist: "Florence + The Machine", title: "You've Got The Love (Acappella)" },
      { artist: "Calvin Harris & Alesso & Hurts vs. Robert Miles", title: "Under Control vs. Children (Alesso Mashup)" },
      { artist: "Robert Miles", title: "Children" },
      { artist: "Calvin Harris & Alesso ft. Hurts", title: "Under Control" },
      { artist: "Thomas Schumacher & A.D.H.S.", title: "Panic" },
      { artist: "Calvin Harris ft. Ellie Goulding", title: "Outside (Calvin Harris 2025 Remix)" },
      { artist: "L.P. Rhythm", title: "Versatile" },
      { artist: "Calvin Harris ft. John Newman", title: "Blame" },
      { artist: "Calvin Harris ft. John Newman", title: "Blame (Calvin Harris 2026 Remix)" },
      { artist: "Calvin Harris ft. Ellie Goulding", title: "I Need Your Love (Calvin Harris Remix)" },
      { artist: "Calvin Harris ft. Ayah Marar", title: "Thinking About You (Calvin Harris 2026 Remix)" },
      { artist: "Calvin Harris", title: "Summer (Calvin Harris 2024 Remix)" },
      { artist: "UMEK", title: "Collision Wall" },
      { artist: "Calvin Harris ft. Ayah Marar", title: "Flashback" },
      { artist: "Sebastian Ingrosso & Tommy Trash ft. John Martin", title: "Reload" },
      { artist: "Basement Jaxx", title: "Where's Your Head At? (Acappella)" },
      { artist: "Firebeatz", title: "Here We F*cking Go" },
      { artist: "BrEaCh", title: "Jack (Acappella)" },
      { artist: "Calvin Harris", title: "Feel So Close" },
      { artist: "The Chemical Brothers", title: "Hey Boy, Hey Girl (Acappella)" },
      { artist: "Rihanna", title: "Where Have You Been (Calvin Harris 2026 Remix)" },
      { artist: "Florence + The Machine", title: "Spectrum (Say My Name) (Calvin Harris 2025 Remix)" },
      { artist: "Calvin Harris ft. Clementine Douglas", title: "Blessings (Cassian Remix)" },
      { artist: "Calvin Harris ft. Clementine Douglas", title: "Blessings" },
      { artist: "Calvin Harris ft. Kelis", title: "Bounce (Calvin Harris Remix)" },
      { artist: "Zombie Nation", title: "Kernkraft 400" },
      { artist: "Rihanna ft. Calvin Harris", title: "We Found Love" },
      { artist: "Calvin Harris", title: "I'm Not Alone (Calvin Harris 2019 Edit)" },
      { artist: "Nari & Milani", title: "Atom (Blast Beat GO Acappella)" }
    ],
    3600,
  );

/**
 * Sonny Fodera @ The Great Library Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * 1001TL: https://1001.tl/1muw1md9 — operator console capture 2026-08-01
 * (0/16 timed cues — evenly spaced across ~60m).
 * No official Tomorrowland Relive yet — seed ready; do not wire clips.
 */
export const TL_SONNY_FODERA_TML_WE2_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      { artist: "Gala", title: "Freed From Desire" },
      { artist: "ANOTR ft. 54 Ultra", title: "Talk To You" },
      { artist: "Dean Turnley", title: "Actin' Tough (Sonny Fodera Edit)" },
      { artist: "Peggy Gou", title: "(It Goes Like) Nanana (Sonny Fodera Remix)" },
      { artist: "Ethan Walsh", title: "Look Good" },
      { artist: "Crystal Waters", title: "Gypsy Woman (She's Homeless)" },
      { artist: "Odd Mob", title: "LEFT TO RIGHT" },
      { artist: "Sonny Fodera & Janai vs. Rebūke", title: "You & I vs. Along Came Polly (Sonny Fodera Edit)" },
      { artist: "Sonny Fodera ft. Janai", title: "You & I" },
      { artist: "Rebūke", title: "Along Came Polly" },
      { artist: "Gotye ft. Kimbra", title: "Somebody That I Used To Know" },
      { artist: "Jackie & AVIV SAB", title: "Sexy M.F." },
      { artist: "Sonny Fodera & Janai", title: "Use Somebody" },
      { artist: "Everything But The Girl", title: "Missing (Todd Terry Remix)" },
      { artist: "Chris Stussy & S.A.M.", title: "Breather" },
      { artist: "Supermini & Frankie Romano", title: "Celebration (Antdot & Maz Edit)" }
    ],
    3600,
  );

/**
 * Darren Styles @ The Great Library Stage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * 1001TL: https://1001.tl/2jqs739k — operator console capture 2026-08-01
 * (0/33 timed cues — evenly spaced across ~60m).
 * No official Tomorrowland Relive yet — seed ready; do not wire clips.
 */
export const TL_DARREN_STYLES_TML_WE2_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      { artist: "Darren Styles & TNT", title: "Be Somebody" },
      { artist: "Darren Styles", title: "Pump This Party" },
      { artist: "Icona Pop ft. Charli xcx", title: "I Love It (Acappella)" },
      { artist: "Toneshifterz & Darren Styles", title: "Clarity" },
      { artist: "Armin van Buuren ft. SACHA", title: "Set Me Free (Darren Styles Remix)" },
      { artist: "Soft Cell", title: "Tainted Love" },
      { artist: "Builder", title: "Her Voice (Headhunterz Remix / MISH Edit)" },
      { artist: "David Guetta ft. Sia", title: "Titanium (Rebelion Bootleg)" },
      { artist: "Scott Brown", title: "Technophobia (Darren Styles Remix)" },
      { artist: "Darren Styles & TNT", title: "DLMD" },
      { artist: "Tweekacore & Darren Styles", title: "Party Starter" },
      { artist: "Darren Styles ft. MERYLL", title: "Miss You" },
      {
        artist: "Dimitri Vegas & Like Mike & Marlon Hoffstadt & DJ Konik",
        title: "Makina Time (Darren Styles Remix)",
      },
      { artist: "Gammer", title: "The Drop" },
      { artist: "Dimitri Vegas & Like Mike vs. Darren Styles", title: "Better Off Alone" },
      { artist: "Darren Styles & TNT", title: "Wonder" },
      { artist: "Brennan Heart & Ben Nicky ft. Maikki", title: "Make Some Noise" },
      {
        artist: "Darren Styles & TNT vs. Gala",
        title: "Cornflakes vs. Freed From Desire (Darren Styles Mashup)",
      },
      { artist: "Darren Styles & TNT", title: "Cornflakes" },
      { artist: "Gala", title: "Freed From Desire" },
      { artist: "Mr. Polska & Natte Visstick & Vieze Asbak", title: "POLSKA JUMPSTYLE" },
      {
        artist: "MaRLo & Feenixpawl ft. Kamilla Bayrak",
        title: "Lighter Than Air (Darren Styles Remix)",
      },
      { artist: "Darren Styles", title: "Us Against The World (Darren Styles VIP)" },
      { artist: "Darren Styles & Gammer", title: "HOA" },
      { artist: "Atmozfears & Demi Kanon", title: "Move Ma Body (Kronos Remix)" },
      { artist: "M83", title: "Midnight City" },
      { artist: "Alesso & OneRepublic", title: "If I Lose Myself" },
      {
        artist: "Porter Robinson & Bright Lights & Darren Styles vs. John O'Callaghan & Sarah Howells",
        title: "Find Your Language (Darren Styles Mashup)",
      },
      { artist: "Porter Robinson ft. Bright Lights", title: "Language (Darren Styles Remix)" },
      { artist: "John O'Callaghan ft. Sarah Howells", title: "Find Yourself (Acappella)" },
      { artist: "Darren Styles & TNT", title: "Hard Beat" },
      { artist: "Scooter", title: "The Logical Song" },
      { artist: "Darren Styles", title: "Save Me (Rebelion Remix)" },
    ],
    3600,
  );

/**
 * AYYBO & Odd Mob @ Crystal Garden Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * Official YT: https://www.youtube.com/watch?v=gO03gfI_JF0 (~90:17)
 * 1001TL: https://1001.tl/1qn93jz1 — operator console capture 2026-08-01
 * (26/30 timed cues; missing clocks already lerped in capture).
 */
export const TL_AYYBO_ODD_MOB_TML_WE2_2026: FingerprintSeedRow[] = [
  {
    at: "0:00",
    artist: "Tiga & Chris Lake ft. Aatig",
    title: "Party Time (AYYBO Remix)",
  },
  { at: "8:25", artist: "AYYBO ft. Preme", title: "Drench" },
  { at: "10:25", artist: "Dodi & Toni B", title: "Vibe Check" },
  { at: "12:25", artist: "Nadin", title: "Mr. Logan" },
  { at: "15:13", artist: "Mau P", title: "Like I Like It" },
  { at: "18:00", artist: "ZINGA", title: "Paradise Place" },
  { at: "19:55", artist: "AYYBO", title: "Rizz" },
  {
    at: "21:20",
    artist: "Azari & III",
    title: "Hungry For The Power (Lucas Bahr Remix)",
  },
  { at: "25:00", artist: "Ohello", title: "The Potion" },
  { at: "26:05", artist: "Cajmere", title: "Percolator (Acappella)" },
  { at: "27:20", artist: "AYYBO", title: "Rizz" },
  {
    at: "28:45",
    artist: "ATC",
    title: "Around The World (La La La La La) (Odd Mob Remix)",
  },
  {
    at: "33:05",
    artist: "Michael Jackson",
    title: "Wanna be Startin' Somethin' (Franco Lippi Tribute Remix)",
  },
  { at: "37:35", artist: "Ohio Players", title: "Love Rollercoaster" },
  { at: "41:10", artist: "Bessey", title: "Cocaine" },
  {
    at: "44:25",
    artist: "Odd Mob & Walker & Royce ft. Benni Ola",
    title: "Can't Say Nah",
  },
  { at: "48:00", artist: "JACKSKI", title: "The Others" },
  {
    at: "52:00",
    artist: "Tiësto & Odd Mob & GOODBOYS",
    title: "Won't Be Possible",
  },
  { at: "54:25", artist: "Eminem", title: "Without Me (Gabss Edit)" },
  {
    at: "58:00",
    artist: "Cake",
    title: "Short Skirt/Long Jacket (Anti Up Remix)",
  },
  { at: "1:01:50", artist: "AYYBO & ero808", title: "HYPNOSIS (VIP)" },
  { at: "1:05:30", artist: "AYYBO", title: "Rizz" },
  {
    at: "1:09:25",
    artist: "Technotronic",
    title: "Pump Up The Jam (AYYBO Edit)",
  },
  {
    at: "1:11:18",
    artist: "Destiny's Child",
    title: "Lose My Breath (Acappella)",
  },
  {
    at: "1:13:10",
    artist: "Montell Jordan",
    title: "This Is How We Do It (Odd Mob Loves California Edit)",
  },
  {
    at: "1:15:55",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "Take You There",
  },
  { at: "1:19:20", artist: "Tiga", title: "Woke" },
  {
    at: "1:22:30",
    artist: "Wu-Tang Clan",
    title: "Da Mystery Of Chessboxin' (Chau Edit)",
  },
  {
    at: "1:25:15",
    artist: "SIDEPIECE & Bobby Shmurda",
    title: "CASH OUT (Odd Mob Remix)",
  },
  { at: "1:28:20", artist: "Black Eyed Peas", title: "Rock That Body" },
];

/**
 * Dyzen @ Planaxis Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * 1001TL: https://1001.tl/1muw64wk — operator console capture 2026-08-01
 * (0/4 timed cues — evenly spaced across ~60m; thin/partial TL).
 * No official Tomorrowland Relive yet — seed ready; do not wire clips.
 * Note: not "Dyen b2b Maddix" (different artist / set).
 */
export const TL_DYZEN_TML_WE2_2026: FingerprintSeedRow[] = evenlySpaceRows(
  [
    { artist: "Maceo Plex", title: "Mutant Quasars" },
    { artist: "sombr", title: "back to friends" },
    { artist: "The Mamas & The Papas", title: "California Dreamin'" },
    { artist: "Dyzen", title: "Try" },
  ],
  3600,
);

/**
 * John Summit @ Crystal Garden Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * Official YT: https://www.youtube.com/watch?v=PlArfyuzuqo (~2:00:29)
 * 1001TL: https://1001.tl/2hsylb61 — operator console capture 2026-08-01
 * (34/38 timed cues; missing clocks already lerped in capture).
 */
export const TL_JOHN_SUMMIT_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Walker & Royce & FENIK", title: "Utopia" },
  { at: "5:27", artist: "NO STATIC", title: "F.D.A.U" },
  { at: "8:08", artist: "John Summit & LAVINIA", title: "SHADOWS" },
  { at: "11:25", artist: "BYOR & Mentum", title: "I Can Dance" },
  { at: "13:27", artist: "Laherte", title: "Pump Up The Jam" },
  {
    at: "17:58",
    artist: "Zakes Bantwini & Kasango",
    title: "Osama (John Summit Remix)",
  },
  {
    at: "20:19",
    artist: "John Summit & Gorgon City ft. Rhys From The Sticks",
    title: "Is Everybody Having Fun?",
  },
  { at: "23:19", artist: "John Summit ft. Inéz", title: "crystallized" },
  {
    at: "26:30",
    artist: "John Summit & GUZ ft. Stevie Appleton",
    title: "What A Life",
  },
  { at: "30:10", artist: "G-POL", title: "Proper Education" },
  {
    at: "36:31",
    artist: "Delerium ft. Sarah McLachlan",
    title: "Silence (John Summit Remix)",
  },
  {
    at: "40:44",
    artist: "John Summit & Absolutely",
    title: "CYANIDE (John Summit Trance Remix)",
  },
  { at: "47:36", artist: "John Summit & HAYLA", title: "Shiver" },
  {
    at: "51:29",
    artist: "Westend & Olivia Sebastianelli",
    title: "The Ceiling",
  },
  { at: "54:00", artist: "Roddy Lima", title: "Shadows" },
  {
    at: "55:08",
    artist: "John Summit ft. Inéz",
    title: "light years (Matt Sassari Remix)",
  },
  {
    at: "1:02:06",
    artist: "Rihanna",
    title: "Where Have You Been (John Summit & Wooli Edit)",
  },
  {
    at: "1:05:01",
    artist: "Cirez D & ALOK vs. Empire Of The Sun",
    title: "On Off vs. We Are The People (ALOK Mashup)",
  },
  {
    at: "1:06:12",
    artist: "Empire Of The Sun",
    title: "We Are The People (Acappella)",
  },
  { at: "1:07:23", artist: "Cirez D", title: "On Off (ALOK Edit)" },
  { at: "1:08:34", artist: "LAWTON & Deckers", title: "Los Retratos" },
  { at: "1:11:57", artist: "John Summit", title: "LIGHTS GO OUT" },
  { at: "1:14:54", artist: "HILLS", title: "Lift Me Up" },
  {
    at: "1:17:08",
    artist: "ANOTR ft. 54 Ultra",
    title: "Talk To You (Eli Brown Bootleg)",
  },
  { at: "1:20:45", artist: "Mesto vs. Fallon", title: "Caramelle vs. Diet Coke" },
  { at: "1:21:25", artist: "Fallon", title: "Diet Coke" },
  { at: "1:22:06", artist: "Mesto", title: "Caramelle" },
  {
    at: "1:22:46",
    artist: "John Summit & Absolutely",
    title: "DON'T BELIEVE IT",
  },
  { at: "1:25:47", artist: "ACRAZE & Rello", title: "Pump That Body" },
  { at: "1:28:51", artist: "David Guetta ft. Kid Cudi", title: "Memories" },
  {
    at: "1:34:34",
    artist: "Green Velvet ft. Walter Philips",
    title: "Shake And Pop (John Summit Remix)",
  },
  {
    at: "1:38:15",
    artist: "Everything But The Girl",
    title: "Missing (John Summit Remix)",
  },
  { at: "1:41:53", artist: "John Summit & VLTRA (IT)", title: "Legacy" },
  { at: "1:45:01", artist: "John Summit ft. HAYLA", title: "Where You Are" },
  { at: "1:48:55", artist: "John Summit & GUZ", title: "Thin Line" },
  { at: "1:51:47", artist: "Daft Punk", title: "One More Time (Acappella)" },
  { at: "1:52:15", artist: "Modjo", title: "Lady (Hear Me Tonight)" },
  {
    at: "1:55:35",
    artist: "John Summit & Sub Focus ft. Julia Church",
    title: "Go Back (John Summit Remix)",
  },
];

/**
 * Armin van Buuren @ YouTube House, Tomorrowland, Belgium 2026-07-25
 * Official YT (artist): https://www.youtube.com/watch?v=I6QA_T-BS6o (~13:33)
 * 1001TL: https://1001.tl/2hsz5x4k — operator console capture 2026-08-01
 * (4/7 timed cues; missing clocks already lerped in capture).
 * Short YouTube House set — distinct from Mainstage WE2 (yt-tg_QLGpes0k).
 */
export const TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026: FingerprintSeedRow[] = [
  {
    at: "0:00",
    artist: "Armin van Buuren ft. SACHA",
    title: "Everlasting (Rising Star Remix)",
  },
  { at: "2:30", artist: "Armin van Buuren ft. SACHA", title: "Set Me Free" },
  {
    at: "4:25",
    artist: "Armin van Buuren & Alle Farben ft. ROSY",
    title: "Lost In Time",
  },
  {
    at: "8:15",
    artist: "Hi Profile vs. Armin van Buuren vs. Vini Vici ft. Hilight Tribe",
    title: "The Ghost vs. Great Spirit (Vini Vici Mashup)",
  },
  {
    at: "9:10",
    artist: "Armin van Buuren vs. Vini Vici ft. Hilight Tribe",
    title: "Great Spirit",
  },
  { at: "10:05", artist: "Hi Profile", title: "The Ghost" },
  {
    at: "11:00",
    artist: "Armin van Buuren",
    title: "Blah Blah Blah (Lilly Palmer Remix)",
  },
];

/**
 * Korolova @ Captive Soul, Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=RLOghpXjuJI (~89:53)
 * 1001TL: https://1001.tl/hjlt23k — operator console capture 2026-08-01
 * (19/21 timed cues; missing clocks already lerped in capture).
 */
export const TL_KOROLOVA_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "6:10", artist: "Argy & SOLANCE", title: "Window Shake" },
  { at: "9:34", artist: "Jast", title: "Rhythm" },
  { at: "12:52", artist: "Korolova & Switch Disco", title: "Empty Skies" },
  { at: "16:31", artist: "GENESI", title: "94" },
  {
    at: "21:19",
    artist: "Darude",
    title: "Sandstorm (Cherry & Kostyn & UNDERMOON Remix)",
  },
  { at: "24:14", artist: "Volkoder & Korolova", title: "Waiting For You" },
  { at: "28:26", artist: "Korolova & R3HAB", title: "Hi Hello" },
  { at: "31:48", artist: "Korolova & JOA", title: "My Mind" },
  {
    at: "35:26",
    artist: "Noir & Haze",
    title: "Around (Seth Hills & Victor Garde Remix)",
  },
  {
    at: "39:27",
    artist: "Michael Calfan & Axwell & Bigfett vs. Empire Of The Sun",
    title: "Resurrection vs. Walking On A Dream (Bigfett Mashup)",
  },
  {
    at: "40:49",
    artist: "Empire Of The Sun",
    title: "Walking On A Dream (Acappella)",
  },
  {
    at: "42:12",
    artist: "Michael Calfan",
    title: "Resurrection (Axwell Re-Cut Club Version / Bigfett Remix)",
  },
  { at: "43:34", artist: "KREAM & Korolova", title: "Annihilation" },
  { at: "46:53", artist: "Korolova", title: "Another Life" },
  { at: "51:05", artist: "Glowal & DREYA V", title: "Physique" },
  {
    at: "1:03:01",
    artist: "Tiësto ft. BT",
    title: "Love Comes Again (Zarka Remix)",
  },
  { at: "1:07:04", artist: "MORTEN & David Guetta", title: "La Révolution" },
  {
    at: "1:09:41",
    artist: "Korolova & Go_A & Rokston ft. Monokate",
    title: "Vorozhyla",
  },
  { at: "1:14:15", artist: "Carl Bee", title: "Suspicious" },
  {
    at: "1:20:20",
    artist: "Agents Of Time & Korolova ft. Conor Ross",
    title: "Made For Love",
  },
  { at: "1:25:14", artist: "Korolova ft. Clér Letiv", title: "Paradise" },
];

/**
 * Lucas & Steve @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * https://www.1001tracklists.com/tracklist/qz05s21/lucas-steve-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html
 * Official YT: https://youtu.be/LE-byccuovI
 * Capture overlay used TL_Lucas&Steve_Mainstage_Tomorrowland_WE2_Belgium_2026
 * (`&` illegal); constant stays TL_LUCAS_STEVE_TML_WE2_2026.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-LE-byccuovI"]
 * Recapture 2026-08-16 — same 54 cues as 2026-08-01; Be Like Bob joiner is `&`.
 */
export const TL_LUCAS_STEVE_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Tiësto & Lucas & Steve", title: "Free Your Mind" },
  { at: "2:56", artist: "Tove Lo", title: "Habits (Stay High) (Acappella)" },
  { at: "5:40", artist: "Tiësto & Lucas & Steve & Silent Child & Sān-Z", title: "ZENLESS" },
  { at: "6:38", artist: "Axwell Λ Ingrosso", title: "More Than You Know (Acappella)" },
  { at: "7:36", artist: "Sentinel", title: "Bring The House Down" },
  { at: "10:47", artist: "Steve Aoki & JJ Lin", title: "The Show (Steve Aoki & Lucas & Steve Remix)" },
  { at: "11:31", artist: "HUGEL & SOLTO", title: "Jamaican (Bam Bam)" },
  { at: "12:15", artist: "Lucas & Steve & Mike Bond", title: "Be Like Bob" },
  { at: "14:13", artist: "Zombie Nation", title: "Kernkraft 400" },
  { at: "14:59", artist: "Lucas & Steve", title: "Renegade Master" },
  { at: "15:46", artist: "The Chemical Brothers", title: "Galvanize (Lucas & Steve Bootleg)" },
  { at: "16:32", artist: "Swedish House Mafia & Knife Party ft. ADL", title: "Antidote (Belgium Edit)" },
  { at: "18:14", artist: "Michael Calfan", title: "Resurrection (Axwell Re-Cut Club Version)" },
  { at: "18:59", artist: "Lucas & Steve X Tungevaag ft. Philip Strand", title: "Paper Planes" },
  { at: "19:43", artist: "Lucas & Steve", title: "This Ain't Just Music" },
  { at: "22:11", artist: "Lucas & Steve", title: "Emergency" },
  { at: "23:20", artist: "Mike Posner", title: "Cooler Than Me" },
  { at: "24:29", artist: "RÜFÜS DU SOL", title: "Innerbloom" },
  { at: "25:38", artist: "Lucas & Steve vs. Ivan Gough & Feenixpawl & Georgi Kay", title: "Wasting Time vs. In My Mind (Lucas & Steve Mashup)" },
  { at: "26:32", artist: "Ivan Gough & Feenixpawl ft. Georgi Kay", title: "In My Mind (Acappella)" },
  { at: "27:26", artist: "Lucas & Steve", title: "Wasting Time" },
  { at: "28:21", artist: "Avicii ft. Sandro Cavazza", title: "Without You (Acappella)" },
  { at: "29:15", artist: "ALOK & Firebeatz", title: "Higher State Of Consciousness" },
  { at: "30:01", artist: "Mightyfools", title: "Footrocker (Get Your, Get Your Hands Up Acappella)" },
  { at: "30:46", artist: "Mau P vs. Tiësto", title: "Like I Like It (Kastra RVN (Raven) Edit)" },
  { at: "31:10", artist: "Mau P", title: "Like I Like It" },
  { at: "31:35", artist: "Tiësto", title: "RVN (Raven)" },
  { at: "31:59", artist: "Lucas & Steve", title: "LFG" },
  { at: "32:24", artist: "Gwen Stefani", title: "Hollaback Girl (Acappella)" },
  { at: "32:49", artist: "Da Hool", title: "Meet Her At The Love Parade" },
  { at: "33:15", artist: "Steve Angello", title: "Knas (Lucas & Steve Bootleg)" },
  { at: "33:40", artist: "Lucas & Steve vs. Avicii & RAS", title: "Source vs. The Nights (Lucas & Steve Mashup)" },
  { at: "34:24", artist: "Lucas & Steve", title: "Source" },
  { at: "35:08", artist: "Avicii ft. RAS", title: "The Nights (Acappella)" },
  { at: "35:51", artist: "Darude & Lucas & Steve vs. Gala", title: "Sandstorm vs. Freed From Desire (Lucas & Steve Mashup)" },
  { at: "36:33", artist: "Gala", title: "Freed From Desire" },
  { at: "37:16", artist: "Darude", title: "Sandstorm (Lucas & Steve 2025 Flip)" },
  { at: "37:58", artist: "AFROJACK & Lucas & Steve", title: "Control" },
  { at: "39:14", artist: "Yeah Yeah Yeahs", title: "Heads Will Roll (A-Trak Remix)" },
  { at: "40:30", artist: "AFROJACK & Lucas & Steve", title: "Control (VIP)" },
  { at: "41:21", artist: "Technotronic", title: "Pump Up The Jam" },
  { at: "42:12", artist: "AFROJACK & Lucas & Steve & DubVision ft. Taranteeno", title: "Anywhere With You (Festival Mix)" },
  { at: "45:38", artist: "Lucas & Steve & Maynamic & Edd Blaze", title: "Lift Me Up" },
  { at: "46:26", artist: "Lucas & Steve", title: "Good Times" },
  { at: "47:14", artist: "Lucas & Steve", title: "All I Know" },
  { at: "50:12", artist: "Nari & Milani", title: "Atom (SQU4RE 2024 Edit)" },
  { at: "51:04", artist: "Coldplay", title: "Clocks" },
  { at: "51:56", artist: "Nico & Vinz", title: "Am I Wrong (Acappella)" },
  { at: "52:47", artist: "Alice Deejay", title: "Better Off Alone" },
  { at: "53:34", artist: "Lucas & Steve", title: "What About Now" },
  { at: "54:20", artist: "Lucas & Steve x Oaks x Jaimes", title: "Love On Hold (Club Mix)" },
  { at: "55:10", artist: "Corona", title: "The Rhythm Of The Night (Acappella)" },
  { at: "55:59", artist: "Lucas & Steve ft. Jordan Shaw", title: "Heart First (Club Mix)" },
  { at: "59:30", artist: "Swedish House Mafia ft. John Martin", title: "Save The World (Acappella)" },
];

/**
 * Sara Landry @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=aDAWctObTvI
 * 1001TL: https://1001.tl/2pcscu9t — operator console capture 2026-08-01
 * (17/17 timed cues).
 */
export const TL_SARA_LANDRY_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "2:30", artist: "Akari", title: "Bring It Up" },
  { at: "4:15", artist: "Wynter Gordon", title: "Dirty Talk" },
  { at: "8:25", artist: "Sara Landry & Alt8", title: "Hands Up" },
  { at: "12:10", artist: "Annie", title: "2 The Floor" },
  { at: "13:30", artist: "Callush", title: "Delicious" },
  { at: "18:40", artist: "Sara Landry & Alex Farell", title: "Angel Dust" },
  {
    at: "20:15",
    artist: "Benny Benassi pres. The Biz",
    title: "Satisfaction (BEAUZ Hard Techno Remix)",
  },
  { at: "21:30", artist: "Sara Landry", title: "Shake That" },
  { at: "31:10", artist: "AREA ØNE", title: "Your Mind" },
  {
    at: "32:10",
    artist: "Sara Landry & Nico Moreno",
    title: "Because They Want Our Seat",
  },
  { at: "33:30", artist: "APHØTIC", title: "Thalassophobia" },
  { at: "34:40", artist: "Golpe", title: "Master At Work" },
  {
    at: "36:15",
    artist: "ISOxo",
    title: "FUCK THE SPEAKERZ UP (Tylow Remix)",
  },
  {
    at: "38:30",
    artist: "Mr. Polska & Natte Visstick & Vieze Asbak",
    title: "POLSKA JUMPSTYLE (KAAI Remix)",
  },
  { at: "39:58", artist: "Mosmoz", title: "Bassline Dealer" },
  {
    at: "44:16",
    artist: "Ace Ventura",
    title: "Rebirth (Blazy & Faders Remix)",
  },
  {
    at: "51:17",
    artist: "Spectra Sonics & Mirok",
    title: "Modulation Depth",
  },
];

/**
 * AFROJACK & R3HAB @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * https://www.1001tracklists.com/tracklist/2s55dyj1/afrojack-r3hab-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html
 * Official YT: https://youtu.be/lEIGnx7qLl0 (R3HAB) and
 * https://www.youtube.com/watch?v=AjQeohYmg3A (Tomorrowland).
 * Capture overlay used TL_AFROJACK&R3HAB_Mainstage_Tomorrowland_WE2_Belgium_2026
 * (`&` illegal); constant is TL_AFROJACK_R3HAB_TML_WE2_2026.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-lEIGnx7qLl0"]
 *       TRACKLIST_1001_BY_SOURCE_SLUG["yt-AjQeohYmg3A"]
 * Captured 2026-08-16 - provenance 1001tl.
 */
export const TL_AFROJACK_R3HAB_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "R3HAB & Vion Konger & Skytech", title: "Ultimate" },
  { at: "1:52", artist: "AFROJACK & Steve Aoki ft. Miss Palmer", title: "No Beef (Acappella)" },
  { at: "3:31", artist: "Zombie Nation", title: "Kernkraft 400" },
  { at: "3:46", artist: "Alesso", title: "Raise Your Head (Acappella)" },
  { at: "4:01", artist: "AFROJACK & R3HAB", title: "Shockwave" },
  { at: "4:16", artist: "David Guetta & GLOWINTHEDARK ft. Harrison", title: "Ain't A Party (Let Me See Your Fuckin Hands Acappella)" },
  { at: "4:30", artist: "Vion Konger", title: "Funky Shit" },
  { at: "5:10", artist: "Icona Pop ft. Charli xcx", title: "I Love It (Acappella)" },
  { at: "5:50", artist: "Martin Garrix & R3HAB & Skytech vs. Empire Of The Sun", title: "Voodoo vs. Walking On A Dream (Martin Garrix Mashup)" },
  { at: "6:47", artist: "Empire Of The Sun", title: "Walking On A Dream (Acappella)" },
  { at: "7:44", artist: "Martin Garrix & R3HAB & Skytech", title: "Voodoo" },
  { at: "8:40", artist: "R3HAB & Deorro", title: "Flashlight" },
  { at: "9:03", artist: "Mightyfools", title: "Footrocker (Get Your, Get Your Hands Up Acappella)" },
  { at: "9:26", artist: "R3HAB & KSHMR", title: "Karate" },
  { at: "10:11", artist: "Corona", title: "The Rhythm Of The Night (Acappella)" },
  { at: "10:55", artist: "AFROJACK & Bart B More", title: "Nothing But This" },
  { at: "13:24", artist: "Tavatli", title: "FE!N" },
  { at: "14:51", artist: "Tove Lo", title: "Habits (Stay High) (Acappella)" },
  { at: "16:18", artist: "Korolova & R3HAB", title: "Hi Hello" },
  { at: "19:07", artist: "ARTBAT & R3HAB", title: "The Sound" },
  { at: "22:48", artist: "HUGEL & SOLTO", title: "Jamaican (Bam Bam) (Vion Konger Remix)" },
  { at: "24:03", artist: "Sebastian Ingrosso & Tommy Trash ft. John Martin", title: "Reload (Afrojack Edit)" },
  { at: "25:18", artist: "Swedish House Mafia ft. John Martin", title: "Don't You Worry Child (Acappella)" },
  { at: "26:33", artist: "NLW & R3HAB ft. MC Ambush", title: "Let Me See Those Hands" },
  { at: "27:48", artist: "Afrojack ft. Wrabel", title: "Ten Feet Tall" },
  { at: "31:22", artist: "ANOTR ft. 54 Ultra", title: "Talk To You (AFROJACK Remix)" },
  { at: "33:13", artist: "Mightyfools", title: "Footrocker (Get Your, Get Your Hands Up Acappella)" },
  { at: "35:04", artist: "Pitbull ft. Ne-Yo & Afrojack & Nayer", title: "Give Me Everything (Acappella)" },
  { at: "36:55", artist: "AFROJACK & Arti Prjct & SOFI TUKKER", title: "Adrenaline" },
  { at: "39:50", artist: "David Guetta ft. Sia", title: "Titanium" },
  { at: "40:29", artist: "Lazy Rich & Hot Mouth", title: "Flash" },
  { at: "41:08", artist: "UMEK & Popof & Space 92 vs. Hardwell & Afrojack", title: "Control vs. Hands Up (Hardwell Mashup)" },
  { at: "41:47", artist: "Hardwell & AFROJACK ft. MC Ambush", title: "Hands Up" },
  { at: "42:27", artist: "UMEK & POPOF & Space 92", title: "Control" },
  { at: "43:06", artist: "AFROJACK & Gil Glaze", title: "Allein" },
  { at: "46:39", artist: "ARTBAT & R3HAB & Stylo & Eli & Dani ft. NAIIM", title: "Fight Machine" },
  { at: "47:20", artist: "Pitbull ft. Lil Jon & will.i.am & Jermaine Dupri", title: "Put Ya Fuckin Hands Up (Acappella)" },
  { at: "48:01", artist: "MAKJ & Lil Jon", title: "Let's Get F*cked Up (Acappella)" },
  { at: "48:43", artist: "The Bloody Beetroots ft. Steve Aoki", title: "Warp 1.9 (One, Two, Woop, Woop Acappella)" },
  { at: "49:24", artist: "AFROJACK & Martin Garrix", title: "Turn Up The Speakers (AFROJACK Edit)" },
  { at: "50:20", artist: "Avicii ft. Simon Aldred", title: "Waiting For Love (Acappella)" },
  { at: "51:16", artist: "AFROJACK & Martin Garrix", title: "Turn Up The Speakers" },
  { at: "52:12", artist: "R3HAB & Skytech & Pupa Nas T & Kevin McKay ft. Denise Belfon & Fideles", title: "Work" },
  { at: "53:08", artist: "AFROJACK & Martin Garrix", title: "Turn Up The Speakers (Julian Jordan Remix)" },
  { at: "54:03", artist: "Jack Ü ft. Bunji Garlin & MX Prime", title: "Jungle Bae" },
  { at: "54:29", artist: "R3HAB & VINAI", title: "How We Party" },
  { at: "54:55", artist: "Major Lazer ft. Vybz Kartel", title: "Pon De Floor (Acappella)" },
  { at: "55:21", artist: "Dimitri Vegas & Like Mike & W&W vs. The White Stripes", title: "Arcade vs. Seven Nation Army (W&W Edit)" },
  { at: "55:50", artist: "The White Stripes", title: "Seven Nation Army" },
  { at: "56:19", artist: "Dimitri Vegas & Like Mike vs. W&W", title: "Arcade" },
  { at: "56:48", artist: "Dimitri Vegas & Like Mike & Martin Garrix", title: "Tremor (Sensation 2014 Anthem) (3, 2, 1 Go Acappella)" },
  { at: "57:17", artist: "AFROJACK ft. Eva Simons", title: "Take Over Control" },
  { at: "58:24", artist: "Avicii", title: "Levels" },
  { at: "59:30", artist: "Afrojack", title: "Bangduck" },
];

/**
 * Steve Aoki @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=8-J01-hcHfA
 * 1001TL: https://1001.tl/rwtx921 — operator console capture 2026-08-01
 * (0/26 timed cues — evenly spaced across ~60m Mainstage slot).
 */
export const TL_STEVE_AOKI_TML_WE2_2026: FingerprintSeedRow[] = evenlySpaceRows(
  [
    { artist: "Kid Cudi ft. MGMT & Ratatat", title: "Pursuit Of Happiness" },
    { artist: "Steve Aoki & Ely Oaks & SACHA", title: "Gravity" },
    { artist: "Steve Aoki & Ely Oaks & SACHA", title: "Gravity (Hyro Remix)" },
    { artist: "KitschKrieg ft. Shirin David & Blumengarten", title: "Gut Genug" },
    { artist: "Steve Aoki & Reinier Zonneveld ft. Darla Jade", title: "On My Own" },
    { artist: "Tim Berg", title: "Bromance (Stephen Hurtley Bootleg)" },
    { artist: "Steve Aoki & Moxie", title: "I Love It When You Cry (Moxoki) (Acappella)" },
    {
      artist: "Laidback Luke & Steve Aoki ft. Lil Jon",
      title: "Turbulence (Hyro & Antoine Delvig 2026 Remix)",
    },
    {
      artist: "Steve Aoki & KAAZE ft. John Martin",
      title: "Whole Again (Steve Aoki & Stephen Hurtley 2026 Remix)",
    },
    {
      artist: "Justin Bieber ft. Nicki Minaj",
      title: "Beauty And A Beat (Steve Aoki & TWIIG & LYNDO Remix)",
    },
    { artist: "Steve Aoki & Cascada", title: "Everytime We Touch" },
    { artist: "Steve Aoki ft. ALNA", title: "Dare You To Love" },
    { artist: "Steve Aoki ft. Alna", title: "Dare You To Love (Hyro Remix)" },
    {
      artist: "Steve Aoki & AutoErotique vs. Dimitri Vegas & Like Mike",
      title: "Feedback (Steve Aoki & Stephen Hurtley 2026 Remix)",
    },
    { artist: "Linkin Park", title: "What I've Done (Acappella)" },
    { artist: "AFROJACK & Steve Aoki ft. Miss Palmer", title: "No Beef" },
    { artist: "Farruko ft. Victor Cardenas", title: "Pepas (Steve Aoki Remix)" },
    { artist: "Farruko", title: "Madrid" },
    { artist: "Farruko & Greeicy & Steve Aoki", title: "YAPAQUE" },
    { artist: "Farruko & Greeicy & Steve Aoki", title: "YAPAQUE (Hyro Remix)" },
    { artist: "3 Are Legend ft. Imogen Heap", title: "What You Say" },
    { artist: "Steve Aoki & Sub Zero Project", title: "Promises" },
    { artist: "Kid Cudi ft. MGMT & Ratatat", title: "Pursuit Of Happiness (Steve Aoki Remix)" },
    {
      artist: "Kid Cudi ft. MGMT & Ratatat",
      title: "Pursuit Of Happiness (Steve Aoki Remix / Lonely Club VIP Remix)",
    },
    {
      artist: "Lonely Club & Arash",
      title: "Broken Angel (This Is Lonely Club) (Da Tweekaz Remix)",
    },
    { artist: "Oliver Tree & Robin Schulz", title: "Miss You" },
  ],
  3600,
);

/**
 * CYRIL @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=DAOlnMYA3nU
 * 1001TL: https://1001.tl/l9zzj79 — operator console capture 2026-08-01
 * (0/24 timed cues — evenly spaced across ~60m Mainstage slot).
 */
export const TL_CYRIL_TML_WE2_2026: FingerprintSeedRow[] = evenlySpaceRows(
  [
    { artist: "Dansyn & J\u00d8RD", title: "The Future" },
    { artist: "Calvin Harris & Jazzy", title: "Satisfy" },
    { artist: "Jonas Blue & Malive", title: "Edge Of Desire" },
    { artist: "SIDEPIECE ft. 95 South", title: "Can I Ride" },
    { artist: "Bob Sinclar ft. Gary Pine", title: "Love Generation (CYRIL Remix)" },
    { artist: "Tony Dark Eyes", title: "Perfect" },
    { artist: "CYRIL & maryjo", title: "Still Into You" },
    { artist: "Alice Deejay", title: "Better Off Alone (CYRIL Remix)" },
    { artist: "Tove Lo", title: "Habits (CYRIL Remix)" },
    { artist: "Tita Lau & James Hurr", title: "Sweat" },
    { artist: "Benny Benassi & Dualit\u00e9", title: "California Dreamin'" },
    { artist: "KETTAMA", title: "Comes and Goes (Dom Dolla Remix)" },
    { artist: "CYRIL & Kelland ft. Nate Dogg", title: "I Got Love" },
    { artist: "CYRIL ft. Wudhouse", title: "Feel It (Oh My Days)" },
    { artist: "Kanye West ft. Rihanna", title: "All Of The Lights (CYRIL Remix)" },
    { artist: "CYRIL & BLR", title: "Good Morning Angels" },
    { artist: "Disturbed", title: "The Sound Of Silence (CYRIL Remix)" },
    { artist: "TOBEHONEST", title: "Pipe Down" },
    { artist: "Tim Berg ft. Amanda Wilson", title: "Seek Bromance (CYRIL Remix)" },
    { artist: "CYRIL & MOONLGHT & The La's", title: "There She Goes" },
    { artist: "CYRIL", title: "Stumblin' In" },
    { artist: "CYRIL & James Blunt", title: "Tears Dry Tonight" },
    { artist: "Robin Schulz & CYRIL ft. Sam Martin", title: "World Gone Wild" },
    { artist: "C\u00e9line Dion", title: "The Power Of Love (CYRIL Remix)" },
  ],
  3600,
);

/**
 * Push @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=KVZlecHlVkg
 * 1001TL: https://1001.tl/2c3yctl1 — operator console capture 2026-08-01
 * (16/16 timed cues).
 */
export const TL_PUSH_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "M.I.K.E. pres. Push", title: "Strange World (2000 Remake)" },
  { at: "4:17", artist: "Adam Beyer & Bart Skils", title: "Your Mind" },
  { at: "5:36", artist: "KASIA", title: "Universal Nation" },
  { at: "9:12", artist: "Transaphonic", title: "Milky Way" },
  { at: "14:55", artist: "Plastic Boy", title: "Silver Bath (Charles D (USA) Remix)" },
  { at: "18:16", artist: "Huvagen", title: "Don't Call Me" },
  { at: "22:34", artist: "Push", title: "Drive By" },
  { at: "26:03", artist: "Nemke", title: "Stampedo" },
  { at: "30:06", artist: "Moonman & Ferry Corsten & Joris Voorn", title: "Don't Be Afraid" },
  { at: "33:46", artist: "Adriatique & Elderbrook", title: "Lost In The Woods" },
  { at: "37:43", artist: "Thomas Gandey & Glusko", title: "Conversations (Wehbba Remix)" },
  { at: "41:52", artist: "Push", title: "Tronesque" },
  { at: "44:29", artist: "Cassian & YOTTO & Da Hool", title: "Love Parade" },
  { at: "47:44", artist: "M.I.K.E. Push & KAS:ST", title: "Strange World" },
  { at: "52:05", artist: "Push", title: "Universal Nation (Bart Skils Remix)" },
  { at: "55:36", artist: "Steve Brian & talkofthetown", title: "Iguana Party" },
];

/**
 * Bassjackers @ The Great Library Stage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://youtu.be/BG3Lr9EdWVY
 * 1001TL: https://www.1001tracklists.com/tracklist/1muwkg71/bassjackers-the-great-library-stage-tomorrowland-weekend-2-belgium-2026-07-26.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-BG3Lr9EdWVY"] = TL_BASSJACKERS_TML_WE2_2026
 * Capture overlay used TL_Bassjackers_Great-Library-Stage_Tomorrowland_WE2_Belgium_2026
 * (hyphens illegal). 2026-08-16 official recapture matches the 36 cues already
 * wired (2026-08-01 console capture; 26/36 timed, rest lerped — clocks agree).
 */
export const TL_BASSJACKERS_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "Bassjackers & WUKONG & Evil Twiin", title: "Rave Baby" },
  {
    at: "1:17",
    artist: "Mesto vs. Fallon",
    title: "Caramelle vs. Diet Coke (Bassjackers TECH BOUNCE Edit)",
  },
  { at: "1:38", artist: "Fallon", title: "Diet Coke" },
  { at: "2:00", artist: "Mesto", title: "Caramelle" },
  {
    at: "2:21",
    artist: "Teriyaki Boyz vs. Gwen Stefani",
    title: "Tokio Drift vs. Hollaback Girl (Macon 148 BPM Remix)",
  },
  { at: "3:29", artist: "Gwen Stefani", title: "Hollaback Girl" },
  {
    at: "4:38",
    artist: "Teriyaki Boyz",
    title: "Tokyo Drift (The Fast And The Furious: Tokyo Drift OST)",
  },
  { at: "5:46", artist: "Bassjackers & Charlie Sparks", title: "Jump Around" },
  { at: "10:23", artist: "Bassjackers", title: "Fuego" },
  { at: "12:38", artist: "Underworld", title: "Born Slippy" },
  { at: "13:37", artist: "Luciid", title: "Bye Bye (NOVAH Remix)" },
  {
    at: "14:36",
    artist: "Benny Benassi pres. The Biz",
    title: "Satisfaction (BEAUZ Hard Techno Remix)",
  },
  { at: "15:51", artist: "Bassjackers", title: "Party People" },
  { at: "18:43", artist: "Bassjackers", title: "GO MF GO" },
  {
    at: "21:30",
    artist: "Bassjackers ft. Bellini",
    title: "Samba De Janeiro (Dimitri Vegas & Like Mike Edit)",
  },
  {
    at: "22:57",
    artist: "Bassjackers & Stisema & Hula From The Outhere Brothers",
    title: "Wiggle Wiggle",
  },
  { at: "25:18", artist: "Darren Styles & TNT", title: "Hard Beat" },
  { at: "26:25", artist: "Bassjackers", title: "KIDS" },
  { at: "29:34", artist: "Kelis", title: "Milkshake (LYNSY Bounce Edit)" },
  { at: "30:50", artist: "Bassjackers & PRADA2000", title: "UZI" },
  { at: "33:28", artist: "Klofama & SLVL", title: "S6TP" },
  {
    at: "35:12",
    artist: "R\u00dcF\u00dcS DU SOL vs. Bassjackers",
    title: "Innerbloom vs. Wake The F Up (Bassjackers Edit)",
  },
  { at: "36:15", artist: "R\u00dcF\u00dcS DU SOL", title: "Innerbloom" },
  { at: "37:18", artist: "Bassjackers", title: "Wake The F Up" },
  { at: "38:21", artist: "Bassjackers & Hannah Laing", title: "New Bass, New Kick" },
  { at: "42:02", artist: "Bassjackers", title: "Bla Bla Bla" },
  { at: "44:08", artist: "Bassjackers & Maddix", title: "Rave Is My Therapy" },
  { at: "46:36", artist: "Diddy Dirty Money ft. Skylar Grey", title: "Coming Home" },
  { at: "49:06", artist: "Hardwell & Bassjackers", title: "Bang On The Drums" },
  { at: "51:51", artist: "Pharoahe Monch", title: "Simon Says (Bassjackers Bootleg)" },
  { at: "53:09", artist: "Pharoahe Monch", title: "Simon Says" },
  { at: "54:05", artist: "Justin Bieber", title: "Ghost" },
  { at: "55:38", artist: "Sebastian Ingrosso & Alesso", title: "Calling" },
  {
    at: "57:11",
    artist: "HARDSOK vs. Florence + The Machine",
    title: "Forever vs. Spectrum (Say My Name) (Restricted Edit)",
  },
  { at: "58:21", artist: "Florence + The Machine", title: "Spectrum (Say My Name) (Acappella)" },
  { at: "59:30", artist: "HARDSOK", title: "Forever" },
];

/**
 * Bhaskar @ Crystal Garden Stage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YT: https://www.youtube.com/watch?v=HWIratXF1Bo
 * 1001TL: https://1001.tl/15vvjgp1 — operator console capture 2026-08-01
 * (15/17 timed cues; missing clocks already lerped in capture).
 */
export const TL_BHASKAR_TML_WE2_2026: FingerprintSeedRow[] = [
  {
    at: "0:12",
    artist: "Axwell & Bob Sinclar ft. Ron Carrol",
    title: "What A Wonderful World (Acappella)",
  },
  { at: "5:16", artist: "Cristian Viviano", title: "Gamma Project" },
  { at: "10:20", artist: "Hardrive", title: "Deep Inside" },
  { at: "12:50", artist: "Bhaskar & Curol", title: "Soul Gazing" },
  { at: "17:10", artist: "Carolina Marquez", title: "The Killer's Song" },
  { at: "21:00", artist: "Fancy Inc & ZARO", title: "Shout" },
  { at: "25:15", artist: "Bhaskar & MOJJO", title: "Discoteka" },
  { at: "30:05", artist: "Adam Ten & Rafael", title: "Beat Goes On" },
  { at: "38:20", artist: "ALOK", title: "Around" },
  {
    at: "47:20",
    artist: "Chus & Ceballos & Supernova",
    title: "The Prophet (Andrew Meller Remix)",
  },
  { at: "49:00", artist: "Blu Cantrell", title: "Hit 'Em Up Style (Oops!)" },
  { at: "50:40", artist: "Dillon Rune", title: "New Day" },
  { at: "54:00", artist: "Lil' Louis", title: "French Kiss" },
  { at: "57:50", artist: "R\u00dcF\u00dcS DU SOL", title: "On My Knees" },
  { at: "1:07:00", artist: "Brunello", title: "The 11th Hour" },
  { at: "1:15:40", artist: "Angel Heredia", title: "Stuffy" },
  { at: "1:19:00", artist: "DJ Chus & Harry Romero", title: "Celebrate Life" },
];

/**
 * Layton Giordani @ circuitGROUNDS closing, EDC Las Vegas 2025-05-16
 * Official SC: https://soundcloud.com/laytongiordani/layton-giordani-live-edc-las-vegas-circuit-grounds-closing-set-2025 (~59:40)
 * 1001TL: https://1001.tl/bt007st — operator console capture 2026-08-01
 * (21/21 timed cues).
 */
export const TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING: FingerprintSeedRow[] = [
  {
    at: "3:10",
    artist: "Skrillex",
    title: "Scary Monsters And Nice Sprites (Layton Giordani Remix)",
  },
  { at: "3:54", artist: "Sikdope & Belle Sisoski", title: "RATS" },
  {
    at: "5:50",
    artist: "Sharam",
    title:
      "PATT (Party All The Time) (Adam Beyer & Layton Giordani & Green Velvet Remix)",
  },
  { at: "9:07", artist: "ZHU", title: "Faded (Seth Hills Remix)" },
  {
    at: "11:45",
    artist: "Layton Giordani & Green Velvet",
    title: "When It Kicks",
  },
  { at: "14:55", artist: "Cirez D", title: "On Off" },
  {
    at: "15:48",
    artist: "Chris Lake ft. Alexis Roberts",
    title: "Turn Off The Lights",
  },
  {
    at: "17:00",
    artist: "David Guetta & Steve Aoki ft. Swae Lee & PnB Rock",
    title: "My Life (Krupa Remix)",
  },
  {
    at: "20:30",
    artist: "Layton Giordani ft. Linney & Sarah de Warren",
    title: "Act Of God",
  },
  { at: "24:30", artist: "Chris Avantgarde", title: "Energy" },
  {
    at: "28:00",
    artist: "Dom Dolla",
    title: "girl$ (Layton Giordani Remix)",
  },
  { at: "31:40", artist: "Neumann & Bendtsen", title: "Phantom Express" },
  {
    at: "31:41",
    artist: "Tiga vs. Audion",
    title: "Let's Go Dancing (Acappella)",
  },
  {
    at: "34:10",
    artist: "Shakedown",
    title: "At Night (Anyma & Layton Giordani Remix)",
  },
  { at: "37:40", artist: "SCRIPT", title: "WTF" },
  {
    at: "40:50",
    artist: "Max Styler & Three Drives",
    title: "Greece 2000 (Max Styler Rework)",
  },
  {
    at: "41:36",
    artist: "Artemas",
    title: "i like the way you kiss me",
  },
  {
    at: "43:10",
    artist: "Layton Giordani ft. LINNEY & Sarah de Warren",
    title: "Act Of God (CamelPhat Remix)",
  },
  {
    at: "47:30",
    artist: "Loofy",
    title: "Last Night (Anyma & Layton Giordani Remix)",
  },
  {
    at: "51:30",
    artist: "Fatima Yamaha",
    title: "What's A Girl To Do (Layton Giordani Remix)",
  },
  {
    at: "55:35",
    artist: "Kaskade ft. Skylar Grey",
    title: "Room For Happiness (Layton Giordani Remix)",
  },
];

/**
 * Max Styler @ stereoBLOOM, EDC Las Vegas 2024-05-17
 * Official SC: https://soundcloud.com/maxstyler/max-styler-live-edc-vegas-2024 (~58:56)
 * 1001TL: https://1001.tl/2syc45z9 — operator console capture 2026-08-01
 * (16/20 timed cues; gaps interpolated).
 */
export const TL_MAX_STYLER_EDC_LV_2024: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Max Styler", title: "Lights Out" },
  { at: "4:00", artist: "Max Styler & Gorgon City", title: "Touch" },
  { at: "7:00", artist: "Max Styler", title: "Time To Go" },
  {
    at: "11:00",
    artist: "Max Styler vs. Tiga & Audion",
    title: "Hypnotic vs. Let's Go Dancing (Max Styler Edit)",
  },
  {
    at: "12:00",
    artist: "Tiga vs. Audion",
    title: "Let's Go Dancing (Acappella)",
  },
  { at: "13:00", artist: "Max Styler", title: "Hypnotic" },
  {
    at: "14:00",
    artist: "Adam Ten & Maori",
    title: "Spring Girl (Max Styler Remix)",
  },
  { at: "17:10", artist: "Arude", title: "Your Move" },
  {
    at: "20:25",
    artist: "Westend & Max Styler",
    title: "Rhythm Machine",
  },
  {
    at: "24:05",
    artist: "Max Styler & FRANCO BA",
    title: "Rock The House",
  },
  { at: "27:45", artist: "Loofy", title: "Last Night" },
  { at: "30:45", artist: "Max Styler", title: "Kiki" },
  { at: "34:00", artist: "Cloonee", title: "Sippin' Yak" },
  { at: "35:38", artist: "Clüb De Combat", title: "Exciter" },
  {
    at: "37:15",
    artist: "Max Styler & Vintage Culture & Ali Love",
    title: "Freaky 1",
  },
  {
    at: "40:40",
    artist: "Chris Lake & Green Velvet",
    title: "Deceiver (Max Styler Remix)",
  },
  { at: "43:40", artist: "Max Styler", title: "Follow Me" },
  {
    at: "47:20",
    artist: "Max Styler & GENESI",
    title: "See You Sweat",
  },
  {
    at: "52:10",
    artist: "Pleasurekraft",
    title: "Tarantula (Max Styler Remix)",
  },
  {
    at: "55:40",
    artist: "Dom Dolla & Max Styler",
    title: "Work It",
  },
];

/**
 * Dom Dolla @ circuitGROUNDS, EDC Las Vegas 2023-05-20
 * Official SC: https://soundcloud.com/domdolla/dom-dolla-live-edc-las-vegas-2023 (~71:26)
 * 1001TL: https://1001.tl/1w0hwttk — operator console capture 2026-08-01
 * (24/32 timed cues; gaps interpolated).
 */
export const TL_DOM_DOLLA_EDC_LV_2023: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Afrojack", title: "Pacha On Acid" },
  {
    at: "0:45",
    artist: "Who Da Funk ft. Jessica Eve",
    title: "Shiny Disco Balls",
  },
  {
    at: "1:30",
    artist: "Chris Lake ft. Aatig",
    title: "In The Yuma (Martin Ikin Remix)",
  },
  {
    at: "3:20",
    artist: "Da Hool",
    title: "Meet Her At The Love Parade (Dom Dolla & Torren Foot Remix)",
  },
  {
    at: "4:25",
    artist: "Faithless",
    title: "Insomnia (Acappella)",
  },
  {
    at: "5:30",
    artist: "CamelPhat & Dom Dolla",
    title: "Hood No Riff",
  },
  { at: "7:20", artist: "Dom Dolla", title: "Take It" },
  {
    at: "9:10",
    artist: "Walker & Royce & Nala",
    title: "Not About You",
  },
  { at: "11:10", artist: "Odd Mob", title: "XTC" },
  {
    at: "12:30",
    artist: "Nick Coleman",
    title: "Faces Of Meth (Holmes John Remix)",
  },
  {
    at: "14:10",
    artist: "Fergie DJ",
    title: "Here Comes That Sound",
  },
  { at: "16:10", artist: "Dom Dolla", title: "San Frandisco" },
  {
    at: "18:10",
    artist: "Airwolf Paradise ft. Paul Johnson",
    title: "Only Man",
  },
  { at: "21:37", artist: "Chris Lorenzo", title: "Every Morning" },
  {
    at: "23:55",
    artist: "John Summit ft. HAYLA",
    title: "Where You Are (Gorgon City Remix)",
  },
  { at: "27:30", artist: "Zonderling", title: "Variant" },
  {
    at: "29:30",
    artist: "RÜFÜS DU SOL",
    title: "Make It Happen (Dom Dolla Remix)",
  },
  { at: "33:08", artist: "Odd Mob", title: "Give You" },
  { at: "34:28", artist: "Dom Dolla", title: "Take It" },
  { at: "35:48", artist: "MK & Dom Dolla", title: "Rhyme Dust" },
  {
    at: "39:43",
    artist: "Øostil & Juan Hansen",
    title: "Drown (Massano Remix)",
  },
  {
    at: "44:15",
    artist: "Eric Prydz vs. Wankelmut & Emma Louise & MK",
    title: "Pjanoo vs. My Head Is A Jungle (Hayden James Edit)",
  },
  { at: "45:37", artist: "Eric Prydz", title: "Pjanoo" },
  {
    at: "46:59",
    artist: "Wankelmut & Emma Louise",
    title: "My Head Is A Jungle (MK Remix)",
  },
  { at: "48:20", artist: "MEDUZA", title: "Friends" },
  { at: "50:50", artist: "Mau P", title: "Your Mind Is Dirty" },
  {
    at: "54:20",
    artist: "Walker & Royce & Glass Petals & ELOHIM",
    title: "Stop Time",
  },
  { at: "56:35", artist: "Dom Dolla", title: "San Frandisco" },
  { at: "1:00:18", artist: "Eli Brown", title: "Diamonds On My Mind" },
  { at: "1:03:30", artist: "FOVOS", title: "Lollipop" },
  {
    at: "1:05:25",
    artist: "Dom Dolla ft. Clementine Douglas",
    title: "Miracle Maker",
  },
  {
    at: "1:09:42",
    artist: "MK & Dom Dolla",
    title: "Rhyme Dust (Dimension Remix)",
  },
];

/**
 * Dom Dolla @ circuitGROUNDS, EDC Las Vegas 2024-05-18
 * Official SC: https://soundcloud.com/domdolla/dom-dolla-live-edc-circuitgrounds-las-vegas-2024 (~61:21)
 * 1001TL: https://1001.tl/24gpuclk — operator console capture 2026-08-01
 * (27/35 timed cues; gaps interpolated).
 */
export const TL_DOM_DOLLA_EDC_LV_2024: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Dom Dolla", title: "girl$" },
  {
    at: "4:17",
    artist: "Solardo & Volaris ft. Camden Cox",
    title: "Eyes",
  },
  {
    at: "6:40",
    artist: "Walker & Royce & Barney Bones",
    title: "Cheap Thrills",
  },
  { at: "8:46", artist: "Dom Dolla", title: "You" },
  {
    at: "10:51",
    artist: "Walker & Royce & Reggie Watts",
    title: "Motivashun",
  },
  {
    at: "13:14",
    artist: "Phil Kieran vs. MK & Dom Dolla",
    title: "Skyhook 2 vs. Rhyme Dust (Dom Dolla Edit)",
  },
  { at: "13:39", artist: "Phil Kieran", title: "Skyhook 2" },
  { at: "14:04", artist: "MK & Dom Dolla", title: "Rhyme Dust" },
  {
    at: "14:28",
    artist: "The Prodigy",
    title: "Breathe (James Hype Edit)",
  },
  {
    at: "16:05",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "Okay Fine",
  },
  {
    at: "20:51",
    artist: "Zombie Nation",
    title: "Kernkraft 400 (James Hype Remix)",
  },
  {
    at: "21:50",
    artist: "Loofy",
    title: "Last Night (Anyma & Layton Giordani Remix)",
  },
  {
    at: "23:28",
    artist: "Dom Dolla & Nelly Furtado",
    title: "Eat Your Man",
  },
  { at: "26:05", artist: "Nari & Milani", title: "Atom" },
  { at: "26:52", artist: "Mia Mendi & TH;EN", title: "Collapsing Sky" },
  { at: "27:53", artist: "Dom Dolla", title: "Take It" },
  {
    at: "28:54",
    artist: "John Summit & HAYLA",
    title: "Shiver (Luca Morris Remix)",
  },
  {
    at: "30:52",
    artist: "Max Styler & GENESI",
    title: "See You Sweat",
  },
  { at: "32:24", artist: "Dom Dolla", title: "San Frandisco" },
  {
    at: "33:55",
    artist: "Rebūke ft. Linska",
    title: "Digital Dream",
  },
  {
    at: "35:46",
    artist: "Gotye ft. Kimbra",
    title: "Somebody That I Used To Know (SIDEPIECE Treat)",
  },
  {
    at: "38:42",
    artist: "Congorock ft. Mr. Lexx",
    title: "Babylon (Dom Dolla Edit)",
  },
  { at: "40:07", artist: "Faith Evans", title: "Love Like This" },
  {
    at: "41:36",
    artist: "The Chemical Brothers",
    title: "Hey Boy, Hey Girl (ARTBAT Remix)",
  },
  {
    at: "43:46",
    artist: "Aliyah's Interlude",
    title: "IT GIRL (Everything Always Remix)",
  },
  { at: "45:58", artist: "HI-LO & Eli Brown", title: "Pyramid Rave" },
  {
    at: "47:41",
    artist: "Technotronic",
    title: "Pump Up The Jam (Acappella)",
  },
  {
    at: "49:23",
    artist: "Kendrick Lamar",
    title: "Swimming Pools (Drank) (Danny Avila Remix)",
  },
  {
    at: "52:29",
    artist: "Dom Dolla",
    title: "Saving Up (Odd Mob Remix)",
  },
  { at: "55:48", artist: "BYOR", title: "Thunder" },
  {
    at: "56:44",
    artist: "Dom Dolla ft. Clementine Douglas",
    title: "Miracle Maker",
  },
  {
    at: "57:40",
    artist: "Benny Benassi pres. The Biz",
    title: "Satisfaction (MORRILL Edit)",
  },
  { at: "59:09", artist: "Tavatli", title: "FE!N" },
  {
    at: "1:02:05",
    artist: "Dom Dolla & Nelly Furtado",
    title: "Eat Your Man (Eli Brown Remix)",
  },
  {
    at: "1:04:17",
    artist: "Dom Dolla & Tove Lo",
    title: "CAVE",
  },
];

/**
 * Dom Dolla @ Allianz Stadium Sydney, Australia 2025-12-20
 * Official YT (artist): https://www.youtube.com/watch?v=4Lqyh7cWRxQ
 * 1001TL: https://1001.tl/jf3kd41 — operator bookmarklet capture 2026-08-11
 * (58/58 timed cues).
 */
export const TL_DOM_DOLLA_ALLIANZ_SYDNEY: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Frank Ocean", title: "Pyramids (Luke Alexander Remix)" },
  { at: "2:50", artist: "ESSE vs. Dom Dolla", title: "Work It vs. Take It (Dom Dolla Mashup)" },
  { at: "3:34", artist: "Dom Dolla", title: "Take It" },
  { at: "4:18", artist: "ESSE", title: "Work It" },
  { at: "5:02", artist: "Dom Dolla", title: "San Frandisco" },
  { at: "7:00", artist: "Marco Strous", title: "Monkey Swag" },
  { at: "8:42", artist: "Max Styler", title: "You & Me (Vintage Culture Remix)" },
  { at: "8:50", artist: "Dom Dolla ft. Clementine Douglas", title: "Miracle Maker" },
  { at: "10:35", artist: "Aliyah's Interlude", title: "IT GIRL (Everything Always Remix)" },
  { at: "12:46", artist: "Dom Dolla", title: "girl$ (Layton Giordani Remix)" },
  { at: "15:03", artist: "Laherte", title: "Pump Up The Jam" },
  { at: "16:35", artist: "Torren Foot ft. rhys from the sticks", title: "DANCE" },
  { at: "19:14", artist: "Sheck Wes", title: "Mo Bamba (HNTR Remix)" },
  { at: "21:39", artist: "Puretone", title: "Addicted To Bass (Dom Dolla Relapse)" },
  { at: "25:14", artist: "Michael Jackson vs. Disclosure", title: "Thriller vs. She's Gone, Dance On (JAMØ (USA) Edit)" },
  { at: "26:16", artist: "Disclosure", title: "She's Gone, Dance On" },
  { at: "27:18", artist: "Michael Jackson", title: "Thriller" },
  { at: "28:20", artist: "Walker & Royce & VNSSA", title: "Activate" },
  { at: "29:32", artist: "Tiga & Eli Brown", title: "Bugatti" },
  { at: "30:55", artist: "Da Hool", title: "Meet Her At The Love Parade (Dom Dolla & Torren Foot Remix)" },
  { at: "31:26", artist: "Faithless", title: "Insomnia (Acappella)" },
  { at: "32:54", artist: "Garbage", title: "Cherry Lips (Go Baby Go!) (Dom Dolla Remix)" },
  { at: "35:04", artist: "Dom Dolla ft. Daya", title: "Dreamin (Anyma Remix)" },
  { at: "37:01", artist: "KENZ", title: "Rake It Up" },
  { at: "39:40", artist: "TJR", title: "Funky Vodka" },
  { at: "41:57", artist: "Walker & Royce", title: "Magic Carpet" },
  { at: "43:53", artist: "SOSA", title: "Be Without You" },
  { at: "44:34", artist: "Sidney Samson", title: "Riverside (Acappella)" },
  { at: "45:12", artist: "Prospa", title: "Don't Stop (SCRIPT Remix)" },
  { at: "46:44", artist: "Dom Dolla & Fcukers", title: "Perfect For Me" },
  { at: "49:52", artist: "Yeah Yeah Yeahs", title: "Heads Will Roll (A-Trak Remix)" },
  { at: "52:20", artist: "Mesto", title: "Listen To Me" },
  { at: "54:15", artist: "Dom Dolla & Nelly Furtado", title: "Eat Your Man" },
  { at: "56:11", artist: "Linska ft. Riko Dan", title: "World & Back" },
  { at: "58:35", artist: "Dom Dolla & Nathan Nicholson", title: "No Room For A Saint (From F1® The Movie) (Walker & Royce Remix)" },
  { at: "1:02:29", artist: "Sonny Fodera & Dom Dolla", title: "Moving Blind (Gorgon City Remix)" },
  { at: "1:04:11", artist: "Cloonee & Funkdoobiest", title: "X-Rated (Devault Remix)" },
  { at: "1:06:49", artist: "ATB", title: "9PM (Till I Come) (James Hype Edit)" },
  { at: "1:08:02", artist: "RÜFÜS DU SOL", title: "Make It Happen (Dom Dolla Remix)" },
  { at: "1:10:01", artist: "Drake", title: "NOKIA (Kelland Remix)" },
  { at: "1:11:56", artist: "AFROJACK & Lucas & Steve", title: "Control" },
  { at: "1:14:13", artist: "Dom Dolla ft. Mansionair", title: "Strangers (Tinlicker Remix)" },
  { at: "1:18:33", artist: "MK & Dom Dolla", title: "Rhyme Dust" },
  { at: "1:22:21", artist: "Dom Dolla & Tiga", title: "Don't Worry Baby" },
  { at: "1:25:59", artist: "Dom Dolla & Go Freek", title: "Define" },
  { at: "1:30:28", artist: "Dom Dolla ft. Clementine Douglas", title: "Miracle Maker" },
  { at: "1:34:54", artist: "Dom Dolla", title: "Saving Up" },
  { at: "1:38:52", artist: "SpiderBait", title: "Black Betty (Dom Dolla Remix)" },
  { at: "1:41:11", artist: "Age Of Love", title: "The Age Of Love (Charlotte de Witte & Enrico Sangiuliano Remix)" },
  { at: "1:44:30", artist: "Calvin Harris", title: "I'm Not Alone (Oliver Heldens & Centre Court Remix)" },
  { at: "1:46:53", artist: "PEEKABOO", title: "Riddle" },
  { at: "1:48:02", artist: "Public Domain", title: "Operation Blade (Bass In The Place)" },
  { at: "1:50:09", artist: "D-Jastic", title: "Up To No Good" },
  { at: "1:53:30", artist: "Dom Dolla & Tove Lo", title: "CAVE" },
  { at: "1:54:57", artist: "Bou & Turno & Gino & Audit", title: "SHNB" },
  { at: "1:55:41", artist: "Beyoncé ft. JAY Z", title: "Crazy In Love (Pola & Bryson Bootleg)" },
  { at: "1:57:28", artist: "MK & Dom Dolla", title: "Rhyme Dust (Dimension Remix / Darren Styles & GRVITY 4/4 Edit)" },
  { at: "1:58:11", artist: "MK & Dom Dolla", title: "Rhyme Dust (Dimension Remix)" },
];

/**
 * Solomun @ circuitGROUNDS, EDC Las Vegas 2026-05-17
 * Official YT: https://www.youtube.com/watch?v=g1vH9C_o-vo (~90:37)
 * 1001TL: https://1001.tl/2lkyu9mk — operator console capture 2026-08-01
 * (18/18 timed cues).
 */
export const TL_SOLOMUN_EDC_LV_2026: FingerprintSeedRow[] = [
  { at: "1:30", artist: "Skrillex & Solomun", title: "Rumpta" },
  { at: "8:51", artist: "Johannes Brecht", title: "All We Got" },
  { at: "12:02", artist: "Blank Sense & FRANCO BA", title: "Goddamn" },
  { at: "15:25", artist: "Deomid", title: "Put Up Your Hands" },
  { at: "19:30", artist: "Catta", title: "La Isla" },
  { at: "23:41", artist: "Solomun ft. Inéz", title: "Raider On The Storm" },
  { at: "27:51", artist: "blaktone", title: "IDWIW" },
  { at: "30:56", artist: "Drax Nelson", title: "Now Do It" },
  { at: "35:00", artist: "Goom Gum", title: "Just Be Good To Me" },
  { at: "39:34", artist: "SHAGY", title: "Rush Hour" },
  { at: "43:26", artist: "Marco Strous", title: "Monkey Swag" },
  { at: "50:00", artist: "Pablo Say", title: "Recognize" },
  {
    at: "53:30",
    artist: "Public Domain",
    title: "Operation Blade (Bass In The Place)",
  },
  { at: "56:40", artist: "New Order", title: "Confusion" },
  { at: "59:30", artist: "DOUG!", title: "Master" },
  {
    at: "1:03:40",
    artist: "The Killers",
    title: "Somebody Told Me (Solomun Remix)",
  },
  { at: "1:22:30", artist: "Hudecek & Dave (US)", title: "Been That" },
  { at: "1:25:40", artist: "Solomun", title: "Kinesphere" },
];

/**
 * Solomun @ Alexandra Palace London, United Kingdom 2026-02-07
 * Official YT: https://www.youtube.com/watch?v=S46Bs4pZ_I4
 * 1001TL: https://1001.tl/fn4hckk — operator bookmarklet capture 2026-08-11
 * (29/29 timed cues). Distinct from EDC LV (yt-g1vH9C_o-vo).
 */
export const TL_SOLOMUN_ALLY_PALLY_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Bruno Furlan", title: "Acid" },
  { at: "4:30", artist: "Skrillex & Solomun", title: "Rumpta" },
  { at: "10:00", artist: "Solomun ft. ÄTNA", title: "Tuk Tuk" },
  { at: "15:04", artist: "Solomun ft. Inéz", title: "Raider On The Storm" },
  { at: "20:45", artist: "Indie Elephant", title: "Cusp Generation" },
  { at: "25:40", artist: "Osmosis Jones", title: "Hot In The Party" },
  { at: "31:00", artist: "Broken Hill", title: "Rock It Like" },
  { at: "36:00", artist: "Glowal", title: "Bass breaker" },
  { at: "41:30", artist: "Goom Gum", title: "Just Be Good To Me" },
  { at: "45:45", artist: "Pablo Say", title: "Dance Groove" },
  { at: "50:15", artist: "AKKI (DE)", title: "Take Me Away" },
  { at: "55:20", artist: "Solomun", title: "Don't Give Up" },
  { at: "1:00:25", artist: "Jamie xx ft. Romy & Oliver Sim", title: "Waited All Night (Solomun Remix v11)" },
  { at: "1:04:45", artist: "Dark Heart", title: "Go Go" },
  { at: "1:08:00", artist: "Addie Manson", title: "Afterhours" },
  { at: "1:12:00", artist: "Blank Sense & FRANCO BA", title: "Goddamn" },
  { at: "1:16:20", artist: "The Notorious B.I.G. ft. Bone Thugs-N-Harmony", title: "Notorious Thugs (Solomun Remix)" },
  { at: "1:21:50", artist: "Max Styler ft. Ad-Apt", title: "One More (Solomun Remix)" },
  { at: "1:26:14", artist: "Public Domain", title: "Operation Blade (Bass In The Place)" },
  { at: "1:35:40", artist: "Leblanc", title: "Strings Anthem" },
  { at: "1:40:00", artist: "K.I.Z", title: "Samstag Ist Krieg (Solomun Remix)" },
  { at: "1:47:40", artist: "Luca Luper & Karmon", title: "Frequency" },
  { at: "1:52:00", artist: "PUNX", title: "The Rock" },
  { at: "1:56:40", artist: "Fat Cosmoe & Luca Luper", title: "I Know My Name" },
  { at: "2:01:10", artist: "Mia Mendi & Skuro (IT)", title: "Angel Wings" },
  { at: "2:06:00", artist: "Sam Collins & ESSED", title: "Going Up" },
  { at: "2:09:30", artist: "Yost Koen", title: "Sympathy" },
  { at: "2:30:35", artist: "Solomun ft. Antony Szmierek", title: "Life Affirmer" },
  { at: "2:37:00", artist: "Solomun & Jain", title: "Tout Le Monde Est Fou" },
];

/**
 * Pegassi @ quantumVALLEY, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=yUA0Ht2PdG0 (~57:34)
 * 1001TL: https://1001.tl/108mxtc9 — operator console capture 2026-08-01
 * (0/12 timed cues — evenly spaced across ~57m).
 */
export const TL_PEGASSI_EDC_LV_2026: FingerprintSeedRow[] = evenlySpaceRows(
  [
    { artist: "Dave75", title: "Heartless" },
    { artist: "Gaston Fiore", title: "Sense Of Risk" },
    { artist: "Azzurro", title: "Let Me Bang" },
    { artist: "Pegassi", title: "Upclose" },
    { artist: "Charli xcx", title: "Constant Repeat" },
    { artist: "Pegassi", title: "Yoyoyo" },
    { artist: "Pegassi", title: "Like This" },
    { artist: "Pegassi", title: "227kg" },
    { artist: "Ueberrest", title: "Stay High" },
    { artist: "Leechy & BR.ICKO", title: "In The Club" },
    { artist: "GhÖsty", title: "Club Bound" },
    { artist: "Pegassi", title: "Spectral Bells" },
  ],
  3454,
);

/**
 * Nico Moreno @ circuitGROUNDS, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=f_p6nfbrm0E (~61:20)
 * 1001TL: https://1001.tl/2r6ym5qt — operator console capture 2026-08-01
 * (0/40 timed cues — evenly spaced across playback duration).
 */
export const TL_NICO_MORENO_EDC_LV_2026: FingerprintSeedRow[] = evenlySpaceRows(
  [
    { artist: "Nico Moreno & Samuel Moriero", title: "See Me Coming" },
    { artist: "AREA ØNE & Jaimy Lorenzo", title: "The Anthem" },
    {
      artist: "Garcia Sauvage",
      title: "La Vida Es Un Carnaval (Ephesis Remix)",
    },
    { artist: "Nik Sitz", title: "Bounce To The Sound" },
    { artist: "Nico Moreno ft. Laren", title: "You Make Me Horny" },
    { artist: "Malaa & Samuel Moriero", title: "F THE POLICE" },
    { artist: "John Summit", title: "LIGHTS GO OUT (Salvyan Remix)" },
    { artist: "Ali James", title: "Body To The Bass" },
    { artist: "DEØZ & HYDER", title: "Partykiller" },
    { artist: "Bruno Mars", title: "Locked Out Of Heaven (KAAI Remix)" },
    { artist: "Lethyx Nekuia", title: "C'mon" },
    { artist: "Bassjackers", title: "Brighter Days" },
    { artist: "TJ (UK)", title: "Funky Beat" },
    { artist: "Samuel Moriero", title: "INSIDE A SPIN" },
    {
      artist: "Mr. Polska & Natte Visstick & Vieze Asbak",
      title: "POLSKA JUMPSTYLE (KAAI Remix)",
    },
    { artist: "Vortek's", title: "Devil Inside" },
    { artist: "Ray Volpe", title: "SONG REQUEST (Creeds Remix)" },
    { artist: "Warface & Nico Moreno", title: "2 Be High" },
    { artist: "Zombie Nation", title: "Kernkraft 400 (Lunaticz Remix)" },
    { artist: "Massano", title: "The Feeling (ACOR HT Rework)" },
    {
      artist: "BEAUZ",
      title: "Ocho (BEAUZ & KEVU VIP / Laxter Hard Edit)",
    },
    { artist: "Nico Moreno ft. Laren", title: "You Make Me Horny" },
    {
      artist: "Bountyhunter",
      title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)",
    },
    { artist: "REBHELL", title: "GETTING BAD" },
    { artist: "DR. OBLITERANE", title: "DESTRUCTION" },
    { artist: "Mental Theo & RAMØN", title: "HYPER RAVE" },
    {
      artist: "Daft Punk vs. Justice & Simian",
      title: "Aerodynamic Friends (N4C & Gianni Di Bernardo Hard Remix)",
    },
    { artist: "Daft Punk", title: "Aerodynamic" },
    { artist: "Justice vs. Simian", title: "We Are Your Friends" },
    { artist: "Reyno", title: "Da Boy" },
    { artist: "Darren Styles & TNT", title: "Be Somebody (Wasback Remix)" },
    { artist: "GEWOONRAVES & MANEX & No-ID", title: "Vielleicht Vielleicht" },
    { artist: "NEØKHIN", title: "WARZONE" },
    { artist: "Anyma & Argy & Son Of Son", title: "Voices In My Head" },
    { artist: "BLURREDMOVEMENT", title: "ROCK THAT BODY" },
    { artist: "Ali James", title: "FKN BASS" },
    { artist: "Shogun", title: "HARDCORE SOUND" },
    {
      artist: "M83",
      title: "My Tears Are Becoming A Sea (Summit & RY X Emotional Schranz Edit)",
    },
    { artist: "Jaxxr", title: "Sugar Rush" },
    {
      artist: "Cutting Crew",
      title: "(I Just) Died In Your Arms (DNNS Edit)",
    },
  ],
  3680,
);

/**
 * Holy Priest @ circuitGROUNDS, EDC Las Vegas 2026-05-15
 * Official YT (artist): https://www.youtube.com/watch?v=D8eLxmifH4o (~54:09)
 * 1001TL: https://1001.tl/gld216t — operator console capture 2026-08-01
 * (39/39 timed cues).
 */
export const TL_HOLY_PRIEST_EDC_LV_2026: FingerprintSeedRow[] = [
  { at: "0:04", artist: "Eminem", title: "My Name Is (Holy Priest Intro Edit)" },
  { at: "0:33", artist: "Holy Priest & KISTENBRÜGGER", title: "Bad Boys" },
  { at: "1:01", artist: "Holy Priest & Krowdexx", title: "BASS POWAH" },
  { at: "3:17", artist: "Zatox", title: "Destroy" },
  { at: "4:16", artist: "Zatox & Holy Priest", title: "New Shit" },
  { at: "5:43", artist: "Holy Priest & CATALYST & Warface", title: "Hellfire" },
  { at: "7:42", artist: "Holy Priest & Coone", title: "Get High" },
  { at: "9:10", artist: "Holy Priest & Coone", title: "Get High (vANE Edit)" },
  {
    at: "9:38",
    artist: "David Guetta ft. Chris Willis",
    title: "Love Is Gone",
  },
  { at: "10:19", artist: "Revenja & Suttlek", title: "World Of Chaos" },
  { at: "11:15", artist: "Holy Priest & Rekkt", title: "DOMINATION" },
  { at: "15:21", artist: "Holy Priest & Netherworld", title: "Holy Atlantis" },
  {
    at: "16:42",
    artist: "Holy Priest & Netherworld",
    title: "Holy Atlantis (Krowdexx Edit)",
  },
  { at: "17:38", artist: "Holy Priest & Rebelion", title: "Ameno" },
  { at: "19:36", artist: "KAAI", title: "We Come To Break" },
  { at: "21:28", artist: "Holy Priest & Manji", title: "No Balance" },
  {
    at: "23:09",
    artist: "Holy Priest & Manji",
    title: "No Balance (UNVIZION Edit)",
  },
  { at: "23:32", artist: "Rooler", title: "KICK DAT BASS MF" },
  { at: "25:33", artist: "Bountyhunter", title: "Woops (Anderex Edit)" },
  { at: "27:02", artist: "Bloodlust & Holy Priest", title: "Hit The Floor" },
  {
    at: "28:09",
    artist: "Bloodlust & Holy Priest",
    title: "Hit The Floor (Kick Edit)",
  },
  { at: "28:56", artist: "Holy Priest & Krowdexx", title: "Freestyler" },
  { at: "32:01", artist: "Samuel Moriero & Regain", title: "ORIGINAL FLOW" },
  {
    at: "33:47",
    artist: "DJ Snake ft. Lil Jon",
    title: "Turn Down For What (Crankdat Remix)",
  },
  {
    at: "34:47",
    artist: "DJ Snake ft. Lil Jon",
    title: "Turn Down For What (Hammerhead Flip)",
  },
  { at: "35:14", artist: "Space Laces & Chee", title: "URBAN BEATS" },
  {
    at: "35:15",
    artist: "MAKJ & Lil Jon",
    title: "Let's Get F*cked Up (Acappella)",
  },
  {
    at: "35:41",
    artist: "Endymion & D-Fence",
    title: "PSSY MTHRFCKRZ (Chaos Project & Sakyra Remix)",
  },
  { at: "36:32", artist: "Coone & CATALYST", title: "FCK CRITICS" },
  { at: "38:15", artist: "DASSOG & vANE", title: "INSOMNIA" },
  {
    at: "39:44",
    artist: "Milleniumkid & JBS",
    title: "Vielleicht Vielleicht (elMefti & Holy Priest Remix)",
  },
  {
    at: "41:22",
    artist: "Milleniumkid & JBS",
    title: "Vielleicht Vielleicht (D-Sturb Bootleg)",
  },
  {
    at: "42:46",
    artist: "Swedish House Mafia ft. John Martin",
    title: "Save The World (Holy Priest Remix)",
  },
  {
    at: "45:30",
    artist: "Coolio & 1World & Holy Priest",
    title: "Gangsta's Paradise",
  },
  {
    at: "46:36",
    artist: "Coolio & 1World & Holy Priest",
    title: "Gangsta's Paradise (KENAI Edit)",
  },
  { at: "47:07", artist: "Cybergore & Mortis", title: "Torture" },
  {
    at: "47:58",
    artist: "P!nk",
    title: "Get The Party Started (Kronos Krypto Remix)",
  },
  {
    at: "48:57",
    artist: "Justin Bieber",
    title: "Ghost (Act of Rage Bootleg)",
  },
  { at: "51:26", artist: "Krowdexx & Dimitri K", title: "IN ANOTHER LIFE" },
];

/**
 * Holy Priest @ Freedom Stage, Tomorrowland Weekend 1, Belgium 2026-07-17
 * 1001TL: https://1001.tl/20w2107t — operator console capture 2026-08-01
 * (0/45 timed cues — evenly spaced across ~60m).
 * No official Tomorrowland full-set Relive yet — seed ready; do not wire clips.
 */
export const TL_HOLY_PRIEST_TML_WE1_2026: FingerprintSeedRow[] = evenlySpaceRows(
  [
    { artist: "Holy Priest & Rebelion", title: "Ameno" },
    { artist: "KAAI", title: "We Come To Break" },
    { artist: "Holy Priest & Coone", title: "Get High" },
    { artist: "Holy Priest & Coone", title: "Get High (vANE Edit)" },
    { artist: "David Guetta ft. Chris Willis", title: "Love Is Gone" },
    { artist: "Revenja & Suttlek", title: "World Of Chaos" },
    { artist: "Holy Priest & Rekkt", title: "DOMINATION" },
    {
      artist: "Samuel Moriero & Warface & CATALYST",
      title: "NOBODY LIKES",
    },
    { artist: "Teksa & Trypdø", title: "HARD RAVE" },
    { artist: "Luke Noize", title: "Where's Your Head At?" },
    { artist: "Dr. Rude", title: "Move Your Feet" },
    {
      artist: "Mr. Polska & Natte Visstick & Vieze Asbak",
      title: "POLSKA JUMPSTYLE (RAV3ART Edit)",
    },
    { artist: "Holy Priest & Manji", title: "No Balance" },
    { artist: "Holy Priest & CATALYST & Warface", title: "Hellfire" },
    { artist: "Zatox", title: "Destroy" },
    { artist: "Zatox & Holy Priest", title: "New Shit" },
    {
      artist: "Mr. Polska & Ski Aggu & Natte Visstick",
      title: "Spring (Araysen & Dropixx Edit)",
    },
    { artist: "Lekkerfaces", title: "Lekkerside MF" },
    { artist: "Jacidorex", title: "Riverside (NIJN Edit)" },
    { artist: "Ali James", title: "Body To The Bass" },
    { artist: "Samuel Moriero & Regain", title: "ORIGINAL FLOW" },
    { artist: "BLURREDMOVEMENT", title: "HEADS WILL ROLL" },
    { artist: "Bountyhunter", title: "Woops (Anderex Edit)" },
    { artist: "Bloodlust & Holy Priest", title: "Hit The Floor" },
    {
      artist: "Bloodlust & Holy Priest",
      title: "Hit The Floor (Kick Edit)",
    },
    { artist: "Restricted & Anderex", title: "Kick Drum Talk" },
    { artist: "Holy Priest & KISTENBRÜGGER", title: "Bad Boys" },
    { artist: "Holy Priest & Krowdexx", title: "BASS POWAH" },
    {
      artist: "Holy Priest & Krowdexx",
      title: "BASS POWAH (Slowtempo Edit)",
    },
    { artist: "David Guetta ft. Sia", title: "Titanium (Afinity Remix)" },
    {
      artist: "David Guetta ft. Sia",
      title: "Titanium (Rebelion Bootleg)",
    },
    { artist: "The Purge", title: "BACK TO BASICS" },
    { artist: "TNT", title: "OMG" },
    { artist: "TNT", title: "OMG (Unload Edit)" },
    { artist: "KENAI", title: "LOSE YOUR MIND" },
    { artist: "Groove Gangsters", title: "Funky Beats" },
    { artist: "Vieze Asbak", title: "Spijkerbom" },
    { artist: "Unresolved & Polish Punisher", title: "Funky Beats" },
    {
      artist: "Coolio & 1World & Holy Priest",
      title: "Gangsta's Paradise",
    },
    { artist: "HOLY PRIEST & Barbz", title: "End Of The World" },
    {
      artist: "Milleniumkid & JBS",
      title: "Vielleicht Vielleicht (elMefti & Holy Priest Remix)",
    },
    {
      artist: "Milleniumkid & JBS",
      title: "Vielleicht Vielleicht (D-Sturb Bootleg)",
    },
    { artist: "Darren Styles & TNT", title: "Hard Beat" },
    { artist: "Vasto", title: "Party Till We Die" },
    { artist: "Holy Priest & Netherworld", title: "Holy Atlantis" },
  ],
  3600,
);

/**
 * Nico Moreno & Holy Priest @ cosmicMEADOW, EDC Las Vegas 2026-05-17
 * 1001TL: https://1001.tl/n56kgj1 — operator console capture 2026-08-01
 * (0/47 timed cues — evenly spaced across ~60m festival slot).
 * No official Insomniac playback yet — seed ready; do not wire fan uploads.
 */
export const TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      { artist: "Holy Priest & Nico Moreno", title: "Overdose" },
      { artist: "Samuel Moriero", title: "Never Say" },
      { artist: "DEØZ & HYDER", title: "Partykiller" },
      { artist: "Holy Priest & Coone", title: "Get High" },
      { artist: "Will Atkinson", title: "Marching Powder" },
      { artist: "Holy Priest & CATALYST & Warface", title: "Hellfire" },
      { artist: "Warface & Nico Moreno", title: "2 Be High" },
      {
        artist: "Warface & Nico Moreno",
        title: "2 Be High (Holy Priest Remix)",
      },
      {
        artist: "Skrillex & ISOxo",
        title: "fuze (Nyroz & LWØ & FNRZ Hard Techno Edit)",
      },
      { artist: "Showtek", title: "FTS (Fuck The System)" },
      { artist: "KAYZO & GRAVEDGR", title: "SQUARE 4" },
      { artist: "Holy Priest & Manji", title: "No Balance" },
      { artist: "Paulskye", title: "VIRUS" },
      { artist: "Dark Matter & REVIVAN & WAYDH", title: "Fucking Feral" },
      { artist: "KISTENBRÜGGER & KAAI", title: "Touch Me" },
      { artist: "KAAI", title: "Brain Damage" },
      { artist: "Ray Volpe", title: "SONG REQUEST (Creeds Remix)" },
      { artist: "Linkin Park", title: "Numb (Trey Pearce Remix)" },
      { artist: "Rekkt", title: "Coceen" },
      { artist: "Manji", title: "Rage Power" },
      { artist: "NMO", title: "ANOTHER LEVEL" },
      { artist: "W&W & Hardwell & Lil Jon", title: "Live The Night" },
      { artist: "Zatox", title: "Destroy" },
      { artist: "Zatox & Holy Priest", title: "New Shit" },
      {
        artist: "GTA & Valentino Khan",
        title: "Break Your Neck (Version 34 Remix)",
      },
      {
        artist: "DVBBS & BORGEOUS",
        title: "Tsunami (ROYAL Hard Techno Remix)",
      },
      { artist: "Klofama & SLVL", title: "S6TP" },
      { artist: "ANTONYM", title: "Bass Go" },
      {
        artist: "Endymion & D-Fence",
        title: "PSSY MTHRFCKRZ (Chaos Project & Sakyra Remix)",
      },
      { artist: "Coone & CATALYST", title: "FCK CRITICS" },
      { artist: "Bruno Mars", title: "Locked Out Of Heaven (KAAI Remix)" },
      { artist: "Warface", title: "Mashup 6.0 (Madmize Kick Edit)" },
      { artist: "Gala", title: "Freed From Desire" },
      { artist: "Linkin Park", title: "Numb" },
      { artist: "Southstylers", title: "Pounding Senses" },
      { artist: "Neophyte & Tha Playah", title: "Still Nr. 1" },
      { artist: "Twenty One Pilots", title: "Stressed Out" },
      { artist: "Holy Priest & Netherworld", title: "Holy Atlantis" },
      {
        artist: "Mr. Polska & Natte Visstick & Vieze Asbak",
        title: "POLSKA JUMPSTYLE (KAAI Remix)",
      },
      {
        artist:
          "Darude & Subtronics vs. Rihanna vs. Ludwig Göransson vs. HOL! vs. Excision & Kai Wachi vs. LOUIEJAYXX vs. MashBit",
        title:
          "Sandstorm vs. Where Have You Been vs. Can You Hear The Music vs. COUNTRY RIDDIM vs. Demisaur vs. Error (GARVIN Edit)",
      },
      { artist: "Darude", title: "Sandstorm (Subtronics Edit)" },
      { artist: "Rihanna", title: "Where Have You Been (Acappella)" },
      {
        artist: "Ludwig Göransson",
        title: "Can You Hear The Music (Opphenheimer OST)",
      },
      { artist: "HOL!", title: "COUNTRY RIDDIM" },
      { artist: "Excision & Kai Wachi", title: "Demisaur" },
      { artist: "LOUIEJAYXX", title: "Error" },
      {
        artist: "Atmozfears & Demi Kanon",
        title: "Move Ma Body (Kronos Remix)",
      },
    ],
    3600,
  );

/**
 * Matty Ralph @ quantumVALLEY, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=FZ7pwlNdwBk (~59:00)
 * 1001TL: https://1001.tl/2hsk794t — operator console capture 2026-08-01
 * (11/12 timed cues).
 */
export const TL_MATTY_RALPH_EDC_LV_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Matty Ralph", title: "Move That Body" },
  { at: "3:38", artist: "Matty Ralph", title: "NRG" },
  { at: "8:46", artist: "Edo & THÜR", title: "All I Need" },
  { at: "12:11", artist: "CTRL & Panteros666", title: "Fire II : Dragon Return" },
  { at: "15:05", artist: "Matty Ralph", title: "No Whistle, No Party" },
  { at: "23:02", artist: "Mauro Picotto", title: "Lizard (Matty Ralph Remix)" },
  { at: "25:11", artist: "Matty Ralph & JOKESONYOU", title: "Heaven" },
  { at: "34:09", artist: "LAWTON & Deckers", title: "Los Retratos" },
  { at: "35:39", artist: "Niels van Gogh", title: "Pulverturm" },
  { at: "40:06", artist: "Matty Ralph", title: "1999" },
  {
    at: "44:24",
    artist: "The Roc Project ft. Tina Arena",
    title: "Never (Filterheadz Luv Tina Remix / Matty Ralph Edit)",
  },
  { at: "55:55", artist: "Shugz", title: "Under The Lights" },
];

/**
 * Funk Tribu @ kineticFIELD, EDC Las Vegas 2026-05-17
 * Official YT: https://www.youtube.com/watch?v=APt5j9Abwo8 (~66:47)
 * 1001TL: https://1001.tl/1lwpqyz1 — operator console capture 2026-08-01
 * (10/10 timed cues).
 */
export const TL_FUNK_TRIBU_EDC_LV_2026: FingerprintSeedRow[] = [
  { at: "7:20", artist: "Funk Tribu", title: "What Trance Feels Like" },
  { at: "16:16", artist: "Funk Tribu", title: "reborn (alma)" },
  { at: "24:07", artist: "Funk Tribu", title: "Speakers Blowing" },
  { at: "27:45", artist: "Funk Tribu", title: "life (vida)" },
  { at: "32:35", artist: "Funk Tribu", title: "this is the moment (cuerpo)" },
  { at: "36:31", artist: "Funk Tribu", title: "Azul" },
  { at: "44:32", artist: "Paul Johnson & Funk Tribu", title: "Get Get Down" },
  { at: "51:51", artist: "Funk Tribu & Linds", title: "Shock" },
  {
    at: "55:42",
    artist: "Funk Tribu & Dillistone",
    title: "where are you taking me? (mente)",
  },
  { at: "59:54", artist: "Tom Carroll", title: "Wicked With You" },
];

/**
 * Sarah de Warren @ quantumVALLEY, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=KIb3psOt9hI (~40:43)
 * 1001TL: https://1001.tl/1z031tz1 — operator console capture 2026-08-01
 * (14/15 timed cues). Note: last cues run past the playback duration.
 */
export const TL_SARAH_DE_WARREN_EDC_LV_2026: FingerprintSeedRow[] = [
  {
    at: "0:00",
    artist: "ARTBAT & R3HAB & Stylo & Eli & Dani ft. NAIIM",
    title: "Fight Machine",
  },
  { at: "0:01", artist: "Kaskade & Sarah de Warren", title: "UV" },
  {
    at: "2:17",
    artist: "Layton Giordani ft. LINNEY & Sarah de Warren",
    title: "Act Of God (CamelPhat Remix)",
  },
  {
    at: "7:12",
    artist: "Danny Avila ft. Sarah de Warren",
    title: "Kiss Girls",
  },
  {
    at: "10:55",
    artist: "Anyma & LISA",
    title: "Bad Angel (DJ KUBA & NEITAN Remix)",
  },
  {
    at: "14:39",
    artist: "Dom Dolla ft. Daya",
    title: "Dreamin (Olly James Rework)",
  },
  {
    at: "18:13",
    artist: "Charlotte de Witte ft. CERES",
    title: "Amor",
  },
  {
    at: "20:10",
    artist: "Yves Deruyter",
    title: "Back To Earth (Daxson Rave Mix)",
  },
  { at: "26:40", artist: "Sarah de Warren", title: "What U Like" },
  {
    at: "29:20",
    artist: "Olly James & Sarah de Warren",
    title: "303 State",
  },
  {
    at: "32:38",
    artist: "Alice Deejay",
    title: "Better Off Alone (Marie Vaunt Remix)",
  },
  {
    at: "36:51",
    artist: "Milio Ruando & Sarah de Warren",
    title: "Never Look Back",
  },
  {
    at: "40:49",
    artist: "Nifra & Sarah De Warren",
    title: "On Repeat",
  },
  {
    at: "44:50",
    artist: "Tao Andra & Sarah de Warren",
    title: "God Gave Us Techno",
  },
  {
    at: "48:43",
    artist: "Culture Shock & Sarah de Warren",
    title: "All The Things She Said (Culture Shock Version)",
  },
];

/**
 * Kevin de Vries @ Opera Stage, Street Parade Zürich, Switzerland 2025-08-09
 * Official YT: https://www.youtube.com/watch?v=S5qAspu0AbI (~1h27m)
 * https://www.1001tracklists.com/tracklist/m5qj71t/kevin-de-vries-opera-stage-street-parade-zurich-switzerland-2025-08-09.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-S5qAspu0AbI"] = TL_KEVIN_DE_VRIES_STREET_PARADE_2025
 * Captured 2026-08-11 - provenance 1001tl.
 * 1001 cues were absolute stage clocks (from 3:33:44); rebased to set start.
 */
export const TL_KEVIN_DE_VRIES_STREET_PARADE_2025: FingerprintSeedRow[] = [
  {
    at: "0:00",
    artist: "Kevin de Vries & Dimitri Vangelis & Wyman ft. Luxtides",
    title: "Before You Go",
  },
  { at: "4:06", artist: "Kevin de Vries & Jast", title: "Born Like That" },
  { at: "12:44", artist: "Max Styler & Deomid", title: "Get Down" },
  { at: "17:34", artist: "JOA", title: "No Games" },
  { at: "20:06", artist: "Cassian & YOTTO & Da Hool", title: "Love Parade" },
  {
    at: "23:25",
    artist: "Anyma & Adam Sellouk ft. Carly Gibert",
    title: "Girls MIA",
  },
  {
    at: "26:58",
    artist: "Fred again.. & Skepta & PlaqueBoyMax",
    title: "Victory Lap (Adam Sellouk & YLM Remix)",
  },
  { at: "30:47", artist: "Mau P", title: "TESLA" },
  { at: "34:06", artist: "Alexander Delanois", title: "This One" },
  { at: "38:09", artist: "Glowal & SYNTHËTIX", title: "Killaz" },
  { at: "41:48", artist: "Jast", title: "Move" },
  { at: "46:31", artist: "Vintage Culture", title: "Do You" },
  {
    at: "49:50",
    artist: "Travis Scott ft. Rob49 & 21 Savage",
    title: "Topia Twins (Kevin de Vries & Belladonna Remix)",
  },
  { at: "53:45", artist: "Kevin de Vries & Mau P", title: "Metro" },
  {
    at: "59:59",
    artist: "Calvin Harris ft. Clementine Douglas",
    title: "Blessings (Cassian Remix)",
  },
  { at: "1:03:19", artist: "Kevin de Vries & Cassian", title: "Payback" },
  {
    at: "1:09:39",
    artist: "CamelPhat & Kölsch",
    title: "Waste My Time (Chris Avantgarde Remix)",
  },
  {
    at: "1:11:26",
    artist: "Swedish House Mafia ft. John Martin",
    title: "Don't You Worry Child (Acappella)",
  },
  {
    at: "1:13:12",
    artist: "The Prodigy",
    title: "No Good (Start The Dance) (Jast Remix)",
  },
  { at: "1:17:32", artist: "Goom Gum & RDNK", title: "It's Time To Get High" },
  {
    at: "1:21:37",
    artist: "Kings Of Leon",
    title: "Sex On Fire (Kevin de Vries & Dimitri Vangelis & Wyman Remix)",
  },
];

/**
 * Eric Prydz @ Resistance Megastructure, Ultra Music Festival Miami, United States 2026-03-27
 * Official YT: https://www.youtube.com/watch?v=hU-z3iV0LOg
 * 1001TL: https://1001.tl/qy9yyy9 — operator bookmarklet capture 2026-08-11
 * (31/31 timed cues).
 */
export const TL_ERIC_PRYDZ_ULTRA_MIAMI_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Eric Prydz", title: "Heavy" },
  { at: "4:40", artist: "Pryda", title: "History Toronto 2025 ID (Working Title)" },
  { at: "11:00", artist: "Cirez D", title: "Tech One (Working Title)" },
  { at: "17:00", artist: "The Drill", title: "The Drill (Eric Prydz Edit)" },
  { at: "19:45", artist: "Cevin Fisher", title: "The Way We Used To (Acappella)" },
  { at: "22:30", artist: "Pryda", title: "Sonar Barcelona 2025 ID (Working Title)" },
  { at: "29:30", artist: "Cirez D", title: "Voided" },
  { at: "33:00", artist: "Cirez D vs. Green Velvet & Harvard Bass", title: "On Off Lazer Beams (Eric Prydz Edit)" },
  { at: "33:50", artist: "Cirez D", title: "On Off" },
  { at: "34:40", artist: "Green Velvet & Harvard Bass", title: "Lazer Beams" },
  { at: "35:30", artist: "Josh Wink", title: "Higher State Of Consciousness (Eric Prydz Private Remix)" },
  { at: "39:00", artist: "Pryda", title: "INOX 2009 ID 01 (Working Title)" },
  { at: "43:00", artist: "New Order & Eric Prydz vs. Daft Punk", title: "Blue Monday vs. Harder, Better, Faster, Stronger (Eric Prydz Mashup)" },
  { at: "44:20", artist: "New Order", title: "Blue Monday (Eric Prydz Remix)" },
  { at: "45:40", artist: "Daft Punk", title: "Harder, Better, Faster, Stronger (Eric Prydz Remix)" },
  { at: "47:00", artist: "Thomas Gold & Francesco Diaz & Young Rebels", title: "Don't You Want Me (Dave Spoon Remix)" },
  { at: "52:40", artist: "Plasmic Honey", title: "Dance Slut" },
  { at: "54:17", artist: "The Chemical Brothers", title: "Hey Boy, Hey Girl (Acappella)" },
  { at: "55:54", artist: "Faze Action", title: "In The Trees (Carl Craig C2 Remix 1)" },
  { at: "57:30", artist: "Pryda", title: "Elements" },
  { at: "1:06:00", artist: "Pryda", title: "Linked" },
  { at: "1:11:00", artist: "Eric Prydz vs. Pink Floyd", title: "Proper Education" },
  { at: "1:18:00", artist: "Paolo Mojo & Eric Prydz vs. Yazoo", title: "1983 vs. Situation (Eric Prydz Mashup)" },
  { at: "1:20:10", artist: "Paolo Mojo", title: "1983 (Eric Prydz Remix)" },
  { at: "1:22:20", artist: "Yazoo", title: "Situation (Eric Prydz Bootleg)" },
  { at: "1:24:30", artist: "Eric Prydz", title: "Liberate" },
  { at: "1:29:00", artist: "Eric Prydz", title: "Collider" },
  { at: "1:34:00", artist: "Eric Prydz ft. Tom Cane", title: "Generate (EPIC Interlude Mix)" },
  { at: "1:38:30", artist: "Pryda", title: "Project Prayer" },
  { at: "1:43:00", artist: "Eric Prydz", title: "Opus" },
  { at: "1:52:00", artist: "M83", title: "Midnight City (Eric Prydz Private Remix)" },
];

/**
 * Deborah De Luca @ Opera Stage, Street Parade Zürich, Switzerland 2025-08-09
 * Official YT: https://www.youtube.com/watch?v=7cK7rhYXbh8 (~55m)
 * https://www.1001tracklists.com/tracklist/qwxcs1k/deborah-de-luca-opera-stage-street-parade-zurich-switzerland-2025-08-09.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-7cK7rhYXbh8"] = TL_DEBORAH_STREET_PARADE_2025
 * Captured 2026-08-11 - provenance 1001tl.
 * 8 identified tracks (bare ID rows skipped); clocks spaced when 1001 had no cues.
 */
export const TL_DEBORAH_STREET_PARADE_2025: FingerprintSeedRow[] = [
  {
    at: "0:20",
    artist: "Papatinho",
    title: "Baila, Vini (Deborah De Luca Remix)",
  },
  {
    at: "7:44",
    artist: "Frank 'O' Moiraghi & Deborah De Luca",
    title: "Feel My Body",
  },
  { at: "15:08", artist: "BIIA", title: "Angelo" },
  {
    at: "22:32",
    artist: "Bountyhunter",
    title: "Woops (Dimitri Vegas & Junkie Kid Remix)",
  },
  {
    at: "29:56",
    artist: "Mo-Do",
    title: "Eins Zwei Polizei (Deborah De Luca Remix)",
  },
  {
    at: "37:20",
    artist: "Giorgia Angiuli",
    title: "Peruvian Bounce (Deborah De Luca Remix)",
  },
  {
    at: "44:44",
    artist: "Evanescence",
    title: "Bring Me To Life (Deborah De Luca Remix)",
  },
  { at: "52:08", artist: "Gigi D'Agostino", title: "Bla Bla Bla" },
];

/**
 * Kölsch @ Opera Stage, Street Parade Zürich, Switzerland 2025-08-09
 * Official YT: https://www.youtube.com/watch?v=pLldXE5OyCM
 * https://www.1001tracklists.com/tracklist/1sftkmb9/kolsch-opera-stage-street-parade-zurich-switzerland-2025-08-09.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-pLldXE5OyCM"] = TL_KOLSCH_STREET_PARADE_2025
 * Captured 2026-08-11 - provenance 1001tl.
 * Capture clocks were corrupt after ~47m (jumped to 2:24:xx); titles kept,
 * clocks evenly re-spaced across ~87m (sibling ARTE set length).
 */
export const TL_KOLSCH_STREET_PARADE_2025: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      { artist: "TasteXperience", title: "Summersault" },
      { artist: "NU ft. Jo.Ke", title: "Who Loves The Sun" },
      { artist: "ACRAZE & Westend", title: "Apple Cider" },
      { artist: "Kölsch", title: "Kinema" },
      { artist: "Adriatique & Argy", title: "RACER" },
      { artist: "CamelPhat & Kölsch", title: "Waste My Time" },
      { artist: "Butch", title: "Countach (Kölsch Remix)" },
      {
        artist: "Danny Tenaglia ft. Celeda",
        title: "Music Is The Answer (Dancin' And Prancin') (Acappella)",
      },
      { artist: "Mory Kanté", title: "Yeke Yeke (Hardfloor Dub)" },
      { artist: "Krystal Klear", title: "Offenbach" },
      {
        artist: "Hilit Kolet ft. Juliet Mendoza",
        title: "Sunbed Tripper",
      },
      { artist: "Kölsch", title: "Opa" },
      { artist: "Age Of Love", title: "The Age Of Love (Kölsch Edit)" },
      { artist: "Kölsch", title: "All Week (Kölsch VIP Mix)" },
      {
        artist: "Skrillex & Boys Noize ft. Opus III",
        title: "Fine Day Anthem",
      },
      { artist: "Kölsch", title: "Loreley (deadmau5 Remix)" },
      { artist: "Kölsch & Kevin de Vries", title: "Gate" },
      { artist: "Kölsch", title: "Grey" },
      { artist: "Tiga", title: "Mind Dimension" },
      { artist: "Nirvana", title: "Smells Like Teen Spirit" },
      { artist: "Kölsch", title: "Der Alte" },
      {
        artist: "London Grammar",
        title: "Hell To The Liars (Kölsch Remix)",
      },
      {
        artist: "Kölsch ft. Troels Abrahamsen",
        title: "All That Matters (ARTBAT Remix)",
      },
      { artist: "Lutzenkirchen", title: "3 Tage Wach" },
    ],
    5220,
  );

/**
 * Massano @ Opera Stage, Street Parade Zürich, Switzerland 2025-08-09
 * Official YT: https://www.youtube.com/watch?v=fYM9DlFLwKw
 * https://www.1001tracklists.com/tracklist/19jyprbt/massano-opera-stage-street-parade-zurich-switzerland-2025-08-09.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-fYM9DlFLwKw"] = TL_MASSANO_STREET_PARADE_2025
 * Captured 2026-08-11 - provenance 1001tl.
 */
export const TL_MASSANO_STREET_PARADE_2025: FingerprintSeedRow[] = [
  { at: "0:57", artist: "Read The News", title: "Higher" },
  { at: "4:36", artist: "Notre Dame", title: "Everytime" },
  { at: "7:05", artist: "Millforlife X Ali Bakgor X RHYU", title: "AWEYAWA!" },
  { at: "13:45", artist: "Rafael", title: "U Make Me" },
  {
    at: "17:03",
    artist: "Matt Sassari & CHRSTPHR ft. Barbatuques",
    title: "Baiana",
  },
  { at: "20:20", artist: "Massano", title: "Funk" },
  {
    at: "23:23",
    artist: "Fatboy Slim",
    title: "Right Here, Right Now (Massano & David Lindmer Remix)",
  },
  { at: "25:57", artist: "Argy & Massano", title: "Wait" },
  {
    at: "30:01",
    artist: "Anyma & Adam Sellouk ft. Carly Gibert",
    title: "Girls MIA",
  },
  { at: "32:48", artist: "Cassian & YOTTO & Da Hool", title: "Love Parade" },
  {
    at: "34:37",
    artist: "The Chemical Brothers",
    title: "Do It Again (Massano Remix)",
  },
  { at: "41:58", artist: "SLVR", title: "Music 4 Ur Body" },
  {
    at: "44:45",
    artist: "Stylo & Eli & Dani ft. Flauwher",
    title: "Supersonic",
  },
  {
    at: "47:35",
    artist: "Yeah Yeah Yeahs",
    title: "Heads Will Roll (Massano & Matt Guy Remix)",
  },
  { at: "52:22", artist: "Adam Sellouk & Paradoks", title: "Cloud 9" },
  { at: "57:12", artist: "Goom Gum & RDNK", title: "It's Time To Get High" },
  { at: "59:00", artist: "Massano", title: "Do It To Me" },
  {
    at: "1:01:47",
    artist: "Øostil & Juan Hansen",
    title: "Drown (Massano 2026 Private Edit)",
  },
  {
    at: "1:08:53",
    artist: "Massano",
    title: "The Feeling (2025 Private Edit)",
  },
  {
    at: "1:12:26",
    artist: "Massano ft. Darla Jade",
    title: "Something In The Water",
  },
  {
    at: "1:17:32",
    artist: "ARTBAT & David Guetta ft. Gotye",
    title: "Somebody That I Used To Know",
  },
  {
    at: "1:21:21",
    artist: "Anyma & Massano ft. Nathan Nicholson",
    title: "Angel In The Dark",
  },
  { at: "1:24:41", artist: "Massano & Stephan Bodzin", title: "Afterglow" },
];

/**
 * Adiel @ Opera Stage, Street Parade Zürich, Switzerland 2025-08-09
 * Official YT: https://www.youtube.com/watch?v=tuqAdrbkYZk
 * https://www.1001tracklists.com/tracklist/2uwhr4bt/adiel-opera-stage-street-parade-zurich-switzerland-2025-08-09.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-tuqAdrbkYZk"] = TL_ADIEL_STREET_PARADE_2025
 * Captured 2026-08-11 - provenance 1001tl.
 */
export const TL_ADIEL_STREET_PARADE_2025: FingerprintSeedRow[] = [
  { at: "0:20", artist: "Benjamin Damage", title: "010x (Hardspace Remix)" },
  { at: "4:53", artist: "Marcal", title: "Glasshouse" },
  { at: "9:26", artist: "Stipp & Alec Dienaar", title: "H-Tool 4" },
  { at: "13:59", artist: "Ploy", title: "Admirer" },
  { at: "18:32", artist: "OUTER909", title: "Purga Murga" },
  { at: "23:05", artist: "Da Hool", title: "Meet Her At The Love Parade" },
  { at: "27:38", artist: "ENNIO", title: "Takashi Miike" },
  { at: "32:11", artist: "Sharpside", title: "Space Cruising" },
  { at: "36:44", artist: "Fank & Disguised", title: "Sanity Mask" },
  { at: "41:17", artist: "X-Filter ft. DJ H.S.", title: "Come On" },
  { at: "45:50", artist: "DJ Europarking & Dollkraut", title: "20inch Chrome" },
  { at: "50:23", artist: "Storm", title: "Storm" },
  { at: "54:56", artist: "Adiel", title: "Nightride" },
];

/**
 * Miss Monique @ BIORHYTHM, Freedom Stage, Tomorrowland Weekend 1, Belgium 2026-07-17
 * https://www.1001tracklists.com/tracklist/l9y8bm9/miss-monique-biorhythm-freedom-stage-tomorrowland-weekend-1-belgium-2026-07-17.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-1LpQZ5GTRDg"] = TL_MISS_MONIQUE_BIORHYTHM
 * Captured 2026-08-12 - provenance 1001tl. Distinct from Mainstage WE2
 * (TL_MISS_MONIQUE_TML_WE2_2026, yt-WhPtvotfYbc).
 */
export const TL_MISS_MONIQUE_BIORHYTHM: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Miss Monique", title: "Concorde (Alternative Version)" },
  { at: "3:51", artist: "BAUS & TimiR", title: "Miles Uphill" },
  { at: "7:19", artist: "Kevin de Vries & Cyantist", title: "Sempre Sei" },
  { at: "11:18", artist: "Miss Monique & Paradoks", title: "Undertone" },
  { at: "14:49", artist: "Miss Monique & Kapuchon & GLZ", title: "Hot Sauce" },
  { at: "18:53", artist: "Cafius & Oliver Marshak", title: "The Beat" },
  { at: "23:07", artist: "Noir & Haze", title: "Around (Seth Hills & Victor Garde Remix)" },
  { at: "27:12", artist: "Miss Monique & GENESI & Carl Bee", title: "Nomacita" },
  { at: "30:50", artist: "Miss Monique & Volkoder", title: "Girls On The Floor" },
  { at: "33:50", artist: "Jast", title: "Make You Say" },
  { at: "37:55", artist: "Anyma & 19:26 & Baset", title: "Prophecy" },
  { at: "41:17", artist: "Empire Of The Sun", title: "Alive (ALOK Remix)" },
  { at: "43:38", artist: "Miss Monique & Glowal", title: "Rollin'" },
  { at: "47:21", artist: "Jast & Enzo Gauthier", title: "Tikitah" },
  { at: "50:49", artist: "Argy & SOLANCE", title: "Window Shake" },
  { at: "56:46", artist: "Agents Of Time & Miss Monique", title: "Rajada" },
  { at: "1:01:06", artist: "Miss Monique & Henri Bergmann & Mario Eighta", title: "17" },
  { at: "1:04:54", artist: "Dominik Gehringer & Victor Garde ft. Anticalm", title: "On Lock" },
  { at: "1:07:58", artist: "Age Of Love", title: "The Age Of Love (Dave Summer Edit)" },
  { at: "1:11:11", artist: "Carl Bee", title: "Time To End" },
  { at: "1:15:49", artist: "JOA & James Carter", title: "Don't Wake Us Up" },
  { at: "1:19:24", artist: "8Kays & Enzo Gauthier & Julian James", title: "Aeternum" },
];
/**
 * Sebastian Ingrosso @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * https://www.1001tracklists.com/tracklist/1407jy99/sebastian-ingrosso-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-25.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-g4vR2VlhNtk"] = TL_SEBASTIAN_INGROSSO_TML_WE2_2026
 * Captured 2026-08-12 - provenance 1001tl.
 */
export const TL_SEBASTIAN_INGROSSO_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "Swedish House Mafia ft. Tinie Tempah", title: "Miami 2 Ibiza" },
  { at: "3:54", artist: "Cloonee & Prospa", title: "Free Your Mind (James Poole Edit)" },
  { at: "5:38", artist: "deadmau5", title: "Strobe (DBL Flip)" },
  { at: "6:58", artist: "Coldplay", title: "Every Teardrop Is A Waterfall (Acappella)" },
  { at: "8:18", artist: "Swedish House Mafia", title: "Greyhound" },
  { at: "9:50", artist: "Rui Da Silva ft. Cassandra Fox", title: "Touch Me (Acappella)" },
  { at: "11:22", artist: "Roger Sanchez", title: "Another Chance (DubVision Remix)" },
  { at: "14:30", artist: "Swedish House Mafia", title: "Wait So Long (Why Do I Have To)" },
  { at: "17:53", artist: "Swedish House Mafia & Knife Party ft. ADL", title: "Antidote (MPH Remix)" },
  { at: "19:57", artist: "Swedish House Mafia", title: "Ray Of Solar" },
  { at: "21:18", artist: "Fred again.. & Swedish House Mafia ft. Future", title: "Turn On The Lights Again.." },
  { at: "22:38", artist: "Alfred Newman", title: "20th Century Fox Fanfare" },
  { at: "23:00", artist: "Travis Scott ft. Playboi Carti", title: "FE!N" },
  { at: "24:33", artist: "Steve Angello & Dimitri Vangelis & Wyman vs. Axwell Λ Ingrosso & Kristoffer Fogelmark", title: "Payback vs. More Than You Know (Swedish House Mafia Mashup)" },
  { at: "25:49", artist: "Dimitri Vangelis & Wyman X Steve Angello", title: "Payback" },
  { at: "27:05", artist: "Axwell Λ Ingrosso", title: "More Than You Know (Acappella)" },
  { at: "28:20", artist: "Booka Shade vs. Ivan Gough & Feenixpawl & Axwell ft. Georgi Kay", title: "Love Inc vs. In My Mind (Axwell Mashup)" },
  { at: "28:47", artist: "Ivan Gough & Feenixpawl ft. Georgi Kay", title: "In My Mind (Axwell Mix)" },
  { at: "29:14", artist: "Booka Shade", title: "Love Inc" },
  { at: "29:41", artist: "Axwell Λ Ingrosso ft. Trevor Guthrie", title: "Dreamer" },
  { at: "30:08", artist: "M83 & Eric Prydz vs. The Temper Trap", title: "Midnight City vs. Sweet Disposition (Steve Angello Mashup)" },
  { at: "31:16", artist: "The Temper Trap", title: "Sweet Disposition (Acappella)" },
  { at: "32:24", artist: "M83", title: "Midnight City (Eric Prydz Private Remix)" },
  { at: "33:31", artist: "Sebastian Ingrosso & Céline Dion vs. Coldplay", title: "A New Day vs. A Sky Full Of Stars (Alesso Mashup)" },
  { at: "34:06", artist: "Coldplay", title: "A Sky Full Of Stars (Acappella)" },
  { at: "34:41", artist: "Sebastian Ingrosso ft. Céline Dion", title: "A New Day" },
  { at: "35:15", artist: "Swedish House Mafia ft. John Martin", title: "Save The World (NC Edit)" },
  { at: "37:44", artist: "Sebastian Ingrosso & Tommy Trash ft. John Martin", title: "Reload (Vocal Mix)" },
  { at: "40:13", artist: "Swedish House Mafia ft. John Martin", title: "Don't You Worry Child" },
  { at: "42:45", artist: "Modjo", title: "Lady (Hear Me Tonight)" },
  { at: "45:16", artist: "Swedish House Mafia & Connie Constance", title: "Heaven Takes You Home (Swedish House Mafia Remake)" },
  { at: "47:04", artist: "Sebastian Ingrosso vs. Alesso & Ryan Tedder vs. Candi Staton vs. Whitney Houston", title: "Laktos is Calling vs. You Got The Love vs. I Wanna Dance With Somebody (Sebastian Ingrosso Re-Edit)" },
  { at: "48:10", artist: "Sebastian Ingrosso", title: "Laktos" },
  { at: "49:16", artist: "Sebastian Ingrosso & Alesso ft. Ryan Tedder", title: "Calling (Lose My Mind)" },
  { at: "50:22", artist: "Whitney Houston", title: "I Wanna Dance with Somebody (Who Loves Me)" },
  { at: "51:28", artist: "Candi Staton", title: "You Got The Love" },
  { at: "52:35", artist: "Swedish House Mafia ft. Pharrell Williams", title: "One (Your Name)" },
  { at: "53:41", artist: "Swedish House Mafia & Lykke Li", title: "Happiness Is So Sad" },
];
/**
 * Boris Brejcha @ Mainstage, Tomorrowland Weekend 1, Belgium 2026-07-18
 * https://www.1001tracklists.com/tracklist/yfd6329/boris-brejcha-mainstage-tomorrowland-weekend-1-belgium-2026-07-18.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-NpL_bT5vgmU"] = TL_BORIS_BREJCHA_TML_WE1_2026
 * Captured 2026-08-12 - provenance 1001tl.
 */
export const TL_BORIS_BREJCHA_TML_WE1_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Boris Brejcha", title: "Cello Tears" },
  { at: "4:10", artist: "Boris Brejcha", title: "Last Call" },
  { at: "9:30", artist: "Boris Brejcha", title: "Endor" },
  { at: "14:00", artist: "Boris Brejcha", title: "Midnight Bells" },
  { at: "19:30", artist: "Boris Brejcha", title: "Concussion" },
  { at: "24:40", artist: "Boris Brejcha", title: "Maya" },
  { at: "29:30", artist: "Moby", title: "In This World (Boris Brejcha Remix)" },
  { at: "33:30", artist: "Boris Brejcha", title: "Bad Girl" },
  { at: "38:50", artist: "Boris Brejcha & MC Flipside", title: "Dirty Beat" },
  { at: "43:00", artist: "Boris Brejcha", title: "Stay Close" },
  { at: "46:00", artist: "Boris Brejcha & Chemutai Sage", title: "Don't Stress Your Mind" },
  { at: "49:30", artist: "Boris Brejcha", title: "Into The Blue" },
  { at: "57:20", artist: "Boris Brejcha & Chemutai Sage", title: "Alicante" },
];
/**
 * Mike Williams @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * https://www.1001tracklists.com/tracklist/132ft5h9/mike-williams-mainstage-tomorrowland-weekend-2-belgium-2026-07-25.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-WnjXXOZ8Te8"] = TL_MIKE_WILLIAMS_TML_WE2_2026
 * Captured 2026-08-12 - provenance 1001tl.
 */
export const TL_MIKE_WILLIAMS_TML_WE2_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "Mike Williams & Three Drives & ANTICALM", title: "Greece 2000" },
  { at: "1:21", artist: "Mike Williams & Mesto ft. Sasha Rangas", title: "Wait Another Day" },
  { at: "2:30", artist: "Axwell & Sebastian Ingrosso & Steve Angello & Laidback Luke ft. Deborah Cox", title: "Leave The World Behind" },
  { at: "4:40", artist: "Nari & Milani", title: "Atom (SQU4RE 2024 Edit)" },
  { at: "5:10", artist: "Sebastien Benett", title: "Let Me See Those Hands (Acappella)" },
  { at: "5:40", artist: "Mike Williams & Brooks & WHAT EVA", title: "Illusion" },
  { at: "6:54", artist: "Spice Girls", title: "Wannabe" },
  { at: "7:59", artist: "Mike Williams ft. DTale", title: "Living On Video (VIP Mix)" },
  { at: "9:56", artist: "Lucas & Steve", title: "Renegade Master" },
  { at: "11:53", artist: "Mike Williams & Philip Strand", title: "All My Life (In My Heart)" },
  { at: "12:37", artist: "Avicii", title: "Levels (Acappella)" },
  { at: "13:20", artist: "Lady GaGa ft. Colby O'Donis", title: "Just Dance (ACRAZE Remix)" },
  { at: "14:50", artist: "TOYZZ", title: "Midnight Trip" },
  { at: "16:37", artist: "Mightyfools", title: "Footrocker (Get Your, Get Your Hands Up Acappella)" },
  { at: "18:24", artist: "Florence + The Machine", title: "You've Got The Love (Acappella)" },
  { at: "20:11", artist: "Steve Angello & Laidback Luke ft. Rowetta", title: "Be" },
  { at: "22:18", artist: "Tom Odell", title: "Another Love" },
  { at: "23:20", artist: "Corey James & IMAN", title: "Paranoia" },
  { at: "24:21", artist: "Mike Williams & Brooks", title: "Drop The Pressure" },
  { at: "26:02", artist: "Sebastien Benett", title: "Let Me See Those Hands (Acappella)" },
  { at: "27:44", artist: "Mike Williams & Oaks", title: "Better Now" },
  { at: "29:25", artist: "Mike Williams & NOME.", title: "Back To Life" },
  { at: "31:05", artist: "R3HAB & Mike Williams ft. Mary Jane Smith", title: "Lullaby" },
  { at: "32:45", artist: "Fatima Yamaha", title: "What's A Girl To Do" },
  { at: "33:50", artist: "Mike Williams", title: "The System" },
  { at: "35:45", artist: "Faithless", title: "Insomnia" },
  { at: "37:40", artist: "Cloonee & Prospa", title: "Free Your Mind (Mike Williams Remix)" },
  { at: "39:35", artist: "Florence + The Machine", title: "Spectrum (Say My Name) (Acappella)" },
  { at: "41:29", artist: "Mike Williams & Bruno Martini & Stephen Puth", title: "Multiply" },
  { at: "43:57", artist: "Swedish House Mafia ft. John Martin", title: "Save The World (Acappella)" },
  { at: "46:24", artist: "Swedish House Mafia & Knife Party ft. ADL", title: "Antidote (Duer Remix)" },
  { at: "48:21", artist: "John Summit & Sub Focus ft. Julia Church", title: "Go Back (Acappella)" },
  { at: "50:17", artist: "Mike Williams & Jaimes", title: "Lose It All" },
  { at: "54:26", artist: "Mike Williams", title: "The Beat (Mike Williams Techno Edit)" },
  { at: "55:21", artist: "Tiësto & Mike Williams", title: "I Want You" },
  { at: "56:16", artist: "Madonna", title: "Music (Acappella)" },
  { at: "57:10", artist: "ANOTR ft. 54 Ultra", title: "Talk To You (Hardwell Bootleg)" },
  { at: "59:12", artist: "Kate Ryan", title: "Désenchantée (Mike Williams Remix)" },
  { at: "1:00:25", artist: "Porter Robinson ft. Bright Lights", title: "Language" },
  { at: "1:01:34", artist: "Mike Williams ft. Moa Lisa", title: "Make You Mine" },
  { at: "1:02:42", artist: "Mike Williams & Oaks", title: "I'll Do It" },
];
/**
 * Plastik Funk @ Open Air Floor, Nature One, Germany 2025-08-01
 * https://www.1001tracklists.com/tracklist/1v75qbbt/plastik-funk-open-air-floor-nature-one-germany-2025-08-01.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-dEX8Y8Mzkok"] = TL_PLASTIK_FUNK_NATURE_ONE_2025
 * Captured 2026-08-12 - provenance 1001tl.
 */
export const TL_PLASTIK_FUNK_NATURE_ONE_2025: FingerprintSeedRow[] = [
  { at: "5:00", artist: "MistaJam & Katy Tiz", title: "Dopamine" },
  { at: "8:00", artist: "MORTEN & David Guetta ft. Fedde Le Grand", title: "Night In Detroit" },
  { at: "11:00", artist: "Chris Lorenzo & Max Styler & Audio Bullys", title: "London's On Fire" },
  { at: "13:00", artist: "Biscits", title: "Freak" },
  { at: "16:00", artist: "Max Styler & Clüb De Combat", title: "On Repeat" },
  { at: "18:00", artist: "Brett Allen ft. Pure Cold", title: "Da Dip" },
  { at: "19:00", artist: "The Temper Trap", title: "Sweet Disposition (ARTBAT Remix)" },
  { at: "22:00", artist: "Niko The Kid & Benson ft. Yo Majesty", title: "FTS" },
  { at: "27:00", artist: "CID", title: "Party Jumpin'" },
  { at: "29:00", artist: "Cloonee & InntRaw & Young M.A", title: "Stephanie (HNTR Remix)" },
  { at: "31:00", artist: "OKAYVAL", title: "Techno Sh" },
  { at: "35:00", artist: "Plastik Funk & Esox ft. Tara McDonald", title: "Looking At You" },
  { at: "37:00", artist: "Plastik Funk & 3NRGY & Esox", title: "Loco" },
  { at: "41:00", artist: "BROHUG", title: "Guerilla" },
  { at: "43:00", artist: "Plastik Funk & TUJAMO", title: "WHO" },
  { at: "45:00", artist: "Mike Candys", title: "Make Some Noise" },
  { at: "47:00", artist: "Alice Deejay", title: "Better Off Alone" },
  { at: "48:00", artist: "HÄWK & Riccardo Falconelli", title: "Happy" },
  { at: "49:00", artist: "Tiësto & Mesto", title: "Can't Get Enough" },
  { at: "53:00", artist: "Plastik Funk & Going Deeper", title: "So High (Plastik Funk & Esox Remix)" },
  { at: "54:00", artist: "John Newman", title: "Love Me Again" },
  { at: "55:00", artist: "Mike Candys", title: "Body Rock" },
  { at: "56:00", artist: "Plastik Funk & Liu & Toxic Joy & Bellini", title: "Samba De Janeiro (Carnaval Mix)" },
  { at: "59:00", artist: "AFROJACK ft. Ally Brooke", title: "All Night (DubVision Remix)" },
  { at: "1:06:00", artist: "OwnBuzz", title: "Booyah Bounce" },
  { at: "1:10:00", artist: "Dillon Francis & MARTEN HØRGER", title: "Cut The Midrange" },
  { at: "1:13:00", artist: "Mike Candys", title: "Crash The Party" },
  { at: "1:16:00", artist: "John Summit & Gorgon City ft. Rhys From The Sticks", title: "Is Everybody Having Fun?" },
  { at: "1:17:00", artist: "Danny Avila & Sam WOLFE & HNTR ft. Rome Fortune", title: "YES B!TCH" },
  { at: "1:19:00", artist: "Shakedown", title: "At Night (Anyma & Layton Giordani Remix)" },
  { at: "1:23:00", artist: "SIDEPIECE & Bobby Shmurda", title: "CASH OUT" },
];
/**
 * Zamna Soundsystem @ Center Stage, Street Parade Zürich, Switzerland 2025-08-09
 * https://www.1001tracklists.com/tracklist/122kgd91/zamna-soundsystem-center-stage-street-parade-zurich-switzerland-2025-08-09.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-1Mp9Pl6YgDM"] = TL_ZAMNA_STREET_PARADE_2025
 * Captured 2026-08-12 - provenance 1001tl.
 */
export const TL_ZAMNA_STREET_PARADE_2025: FingerprintSeedRow[] = [
  { at: "0:52", artist: "Kings Of Leon", title: "Use Somebody" },
  { at: "6:40", artist: "Adam Sellouk & Pedroz", title: "Fuel" },
  { at: "9:55", artist: "Kevin de Vries & Jast", title: "Born Like That" },
  { at: "14:02", artist: "WILL K", title: "F*CK FAME" },
  { at: "18:34", artist: "ARTBAT & KAS:ST & Losless", title: "Pull Out" },
  { at: "26:34", artist: "Shakedown", title: "At Night (Anyma & Layton Giordani Remix)" },
  { at: "30:01", artist: "R3HAB & Skytech & Pupa Nas T & Kevin McKay ft. Denise Belfon & Fideles", title: "Work" },
  { at: "33:37", artist: "Post Malone ft. 21 Savage", title: "Rockstar" },
  { at: "38:24", artist: "Rufus & Chaka Khan", title: "Ain't Nobody (Zamna Soundsystem Remix)" },
  { at: "43:37", artist: "WILL K", title: "Don't Worry" },
  { at: "47:16", artist: "SOEL", title: "ID (Losless Remix)" },
  { at: "51:57", artist: "Anyma & SCRIPT", title: "In My Mind (Adam Sellouk Remix)" },
  { at: "55:47", artist: "Felix Da Housecat ft. Miss Kittin", title: "Silver Screen Shower Scene (Alexander Delanois Private Mix)" },
  { at: "1:02:25", artist: "Joshlane", title: "System Overload" },
  { at: "1:06:38", artist: "Zombie Nation", title: "Kernkraft 400 (Ivory Remix)" },
  { at: "1:15:33", artist: "MoBlack & Benja & Franc Fala ft. Salif Keïta & Cesária Évora", title: "Yamore (Zamna Soundsystem Remix)" },
  { at: "1:19:51", artist: "Rockwell", title: "Somebody's Watching Me (Zamna Soundsystem Remix)" },
  { at: "1:24:32", artist: "Tom Odell", title: "Another Love" },
];
/** sourceSlug → curated 1001TL seed (SC / YT when live HTML is CF-blocked). */
export const TRACKLIST_1001_BY_SOURCE_SLUG: Record<
  string,
  FingerprintSeedRow[]
> = {
  "sc-charlottedewittemusic-charlotte-de-witte-at":
    TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  "yt-uMgz40hvySQ": TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  "sc-cloonee-clooneeb2bprospa": TL_CLOONEE_PROSPA_DESTINO_2026,
  "sc-cloonee-cloonee-edc-2022": TL_CLOONEE_EDC_LV_2022,
  "sc-itsthewestend-westend-live-edc-2026": TL_WESTEND_EDC_LV_2026,
  "sc-cidmusic-cid-edc-lv-2017": TL_CID_EDC_LV_2017,
  "sc-bleuclair-edclv2023": TL_BLEU_CLAIR_EDC_LV_2023,
  "sc-waxmotif-wax-motif-live-edc-2021": TL_WAX_MOTIF_EDC_LV_2021,
  "sc-oceanologymusic-odd-mob-live-at-edc-las-vegas-2025-cosmic-meadow-day-2-3":
    TL_ODD_MOB_EDC_LV_2025,
  "sc-laytongiordani-layton-giordani-live-edc-las-vegas-circuit-grounds-closing-set-2025":
    TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING,
  "sc-maxstyler-max-styler-live-edc-vegas-2024": TL_MAX_STYLER_EDC_LV_2024,
  "sc-domdolla-dom-dolla-live-edc-las-vegas-2023": TL_DOM_DOLLA_EDC_LV_2023,
  "sc-domdolla-dom-dolla-live-edc-circuitgrounds-las-vegas-2024":
    TL_DOM_DOLLA_EDC_LV_2024,
  "yt-4Lqyh7cWRxQ": TL_DOM_DOLLA_ALLIANZ_SYDNEY,
  "yt-yXHoHK_jQvc": TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  "yt-dXBoIY65P8s": TL_DARUDE_EDC_LV_2026,
  "yt-c_sx3zum8Z0": TL_BLEU_CLAIR_EDC_LV_2023,
  "yt-g1vH9C_o-vo": TL_SOLOMUN_EDC_LV_2026,
  "yt-S46Bs4pZ_I4": TL_SOLOMUN_ALLY_PALLY_2026,
  "yt-KIb3psOt9hI": TL_SARAH_DE_WARREN_EDC_LV_2026,
  "yt-yUA0Ht2PdG0": TL_PEGASSI_EDC_LV_2026,
  "yt-f_p6nfbrm0E": TL_NICO_MORENO_EDC_LV_2026,
  "yt-FZ7pwlNdwBk": TL_MATTY_RALPH_EDC_LV_2026,
  "yt-APt5j9Abwo8": TL_FUNK_TRIBU_EDC_LV_2026,
  "yt-D8eLxmifH4o": TL_HOLY_PRIEST_EDC_LV_2026,
  "yt-2idboK_vTT8": TL_ODD_MOB_TML_WE2_2026,
  "yt-WhPtvotfYbc": TL_MISS_MONIQUE_TML_WE2_2026,
  "yt-ubFrkYGGqo8": TL_ENRICO_SANGIULIANO_TML_WE2_2026,
  "yt-TsyGMhx8izw": TL_NICKY_ROMERO_TML_WE2_2026,
  "yt-B05MAbsCOLA": TL_NICKY_ROMERO_TML_WE2_2026,
  "yt-dmhUJYEdkKo": TL_JAMES_HYPE_TML_WE2_2026,
  "yt-QThaqlzSqLw": TL_JAMES_HYPE_MELKWEG_ADE_2025,
  "yt-ra8NYbzPMnk": TL_KOLSCH_TML_WE2_2026,
  "yt-5AdQy7lCbN0": TL_STEVE_ANGELLO_TML_WE2_2026,
  "yt-4985f9Rfxx0": TL_FISHER_TML_WE1_2026,
  "yt-Uq1WP8v3U4o": TL_FISHER_TML_WE2_2026,
  "yt-eeNljOHahxY": TL_MASSANO_TML_WE2_2026,
  "yt-yWZyIQtxoXU": TL_HARDWELL_TML_WE2_2026,
  "yt-Py-GG74lLU8": TL_HARDWELL_TML_WE2_2026,
  "yt-gO03gfI_JF0": TL_AYYBO_ODD_MOB_TML_WE2_2026,
  "yt-PlArfyuzuqo": TL_JOHN_SUMMIT_TML_WE2_2026,
  "yt-I6QA_T-BS6o": TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026,
  "yt-RLOghpXjuJI": TL_KOROLOVA_TML_WE2_2026,
  "yt-LE-byccuovI": TL_LUCAS_STEVE_TML_WE2_2026,
  "yt-aDAWctObTvI": TL_SARA_LANDRY_TML_WE2_2026,
  "yt-AjQeohYmg3A": TL_AFROJACK_R3HAB_TML_WE2_2026,
  "yt-lEIGnx7qLl0": TL_AFROJACK_R3HAB_TML_WE2_2026,
  "yt-8-J01-hcHfA": TL_STEVE_AOKI_TML_WE2_2026,
  "yt-DAOlnMYA3nU": TL_CYRIL_TML_WE2_2026,
  "yt-OTKgBZS8if0": TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
  "yt-3o0T4z6oT4Y": TL_DIMITRI_VEGAS_TML_WE2_2026,
  "yt-KVZlecHlVkg": TL_PUSH_TML_WE2_2026,
  "yt-BG3Lr9EdWVY": TL_BASSJACKERS_TML_WE2_2026,
  "yt-HWIratXF1Bo": TL_BHASKAR_TML_WE2_2026,
  "yt-hU-z3iV0LOg": TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
  "yt-7cK7rhYXbh8": TL_DEBORAH_STREET_PARADE_2025,
  "yt-S5qAspu0AbI": TL_KEVIN_DE_VRIES_STREET_PARADE_2025,
  "yt-pLldXE5OyCM": TL_KOLSCH_STREET_PARADE_2025,
  "yt-fYM9DlFLwKw": TL_MASSANO_STREET_PARADE_2025,
  "yt-tuqAdrbkYZk": TL_ADIEL_STREET_PARADE_2025,
  "yt-1Mp9Pl6YgDM": TL_ZAMNA_STREET_PARADE_2025,
  "yt-1LpQZ5GTRDg": TL_MISS_MONIQUE_BIORHYTHM,
  "yt-g4vR2VlhNtk": TL_SEBASTIAN_INGROSSO_TML_WE2_2026,
  "yt-NpL_bT5vgmU": TL_BORIS_BREJCHA_TML_WE1_2026,
  "yt-WnjXXOZ8Te8": TL_MIKE_WILLIAMS_TML_WE2_2026,
  "yt-dEX8Y8Mzkok": TL_PLASTIK_FUNK_NATURE_ONE_2025,
  "yt-LpFxQmtEeAA": TL_PAN_POT_STREET_PARADE_2025,
  "yt-WTN5ru2ceRE": TL_HONEYLUV_STREET_PARADE_2025,
  "yt-sLtNC21myWM": TL_HONEYLUV_ANTS_USHUAIA_2026,
  "yt-CMhFNEo0glw": TL_PEGGY_GOU_EDC_LV_2026,
  "yt-9TKqqBCmDHA": TL_JOHN_SUMMIT_LOLLAPALOOZA,
  "yt--UOMvxh4MYU": TL_PEGGY_GOU_CERCLE_LILLE,
  "yt-BUsCIK_kh_A": TL_MARTIN_GARRIX_TML_WE2_2026,
  "yt-1lqmFLr-SkA": TL_THE_CHAINSMOKERS_TML_WE1_2026,
  "yt-fhiZ1Rj9o-A": TL_ALESSO_TML_WE2_2026,
  "yt-tg_QLGpes0k": TL_ARMIN_VAN_BUUREN_TML_WE2_2026,
  "sc-sidepiece-sidepiece-lollapalooza-perry":
    TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026,
  "yt-hgbAN8NFNu0": TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
  "sc-tomorrowland-tomorrowland-friendship-mix-steve-aoki-august-2026":
    TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
  "sc-marten-horger-tomorrowland-mainstage-2023":
    TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023,
  "yt-NTLDGnoWIRg": TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
  "sc-1001tracklists-men-machine-exclusive-mix-2026":
    TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
  "yt-bxb6Tglooc4": TL_ARMIN_OTTAVIANI_ASOT_1290_2026,
  "yt-pwXGm4HEQdo": TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
  "yt-NblVVOwQRqw": TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
  "sc-domdolla-dom-dolla-live-creamfields-steel-yard-2025":
    TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
  "yt-vpf4LLy42Zc": TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
  "yt-WWnLYZrh6kw": TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
  "sc-markusschulz-gdjb-aug132026":
    TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
  "yt-zHAUZ02aCwo": TL_ALOK_TML_WE2_2026,
  "yt-knJyJPP45dg": TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
  "yt-kmMYCg-igjc": TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
  "yt-OVex0rm7ZR4": TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
  "yt-6bJZPDKlq7o": TL_VINTAGE_CULTURE_NYC_YACHT_2023,
  "yt-OXwK0CSmXzY": TL_HARDWELL_HOA_527_YEARMIX_2025,
  "sc-hardwell-hardwell-on-air-527-yearmix": TL_HARDWELL_HOA_527_YEARMIX_2025,
  "yt-i-mFuxbGHzg": TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
  "sc-jamie-jones-hot-robot-radio-225": TL_JAMIE_JONES_HOT_ROBOT_RADIO_225,
  "sc-jamie-jones-hot-robot-radio-239": TL_JAMIE_JONES_HOT_ROBOT_RADIO_239,
  "sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024":
    TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  "yt-SeKRNa26kug": TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  "yt-soEFl73peVA": TL_JOEL_CORRY_EDGE_NYC_2026,
  "sc-joelcorry-edgenyc": TL_JOEL_CORRY_EDGE_NYC_2026,
  "yt-Rgx-wT9FDaE": TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
  "sc-sashaofficial-sasha-eclipse-mix-12-8-26": TL_SASHA_ECLIPSE_MIX_2026,
  "yt-0-s_qZRWElA": TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
  "yt-blP5J6BUG0M": TL_TIESTO_PRISMATIC_032_2026,
  "yt-yTRvLrtsM9I": TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
  "yt-phWKhIwgiTo": TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
  "yt-k4Drn6AwAdk": TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  "sc-maxstyler-max-styler-live-opulent-temple-burning-man-2024":
    TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  "yt-arowbYnNFGY": TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  "sc-hannahlaingdj-hannah-laing-creamfields-2024-audio":
    TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  "yt-8aDoUu4GDrc": TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  "sc-noraenpure-purified-520": TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  "yt-5JxfEjVdQFk": TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  "sc-korolovadj-korolova-captive-soul-98": TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  "yt-rLTCLSsqrXY": TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
  "sc-jameshypethedj-sync-london-full-set":
    TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
  "yt-JLIYTueL4TI": TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
  "sc-eric-prydz-eric-prydz-presents-463760700":
    TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
  "sc-bradeazy-bradeazy-live-lollapalooza":
    TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026,
  "sc-amelielens-amelie-lens-radio-show-022":
    TL_AMELIE_LENS_RADIO_SHOW_022_2026,
  "yt-wuMQeEJ3YnQ": TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
  "sc-oliverheldens-oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024":
    TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
  "ht-toccoscuro-1live-dj-session-mit-robin-schulz-live-aus-dem-pacha-ibiza-vom-0":
    TL_ROBIN_SCHULZ_PACHA_IBIZA_2026,
  "yt-pnzSuCiAGdk": TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
  "yt-JhpL-KKGoO8": TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  "yt-IwNPc_4ux84":
    TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
  "yt-XisbmW1Smgc": TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
  "yt-eBeeWwsCVls": TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  "yt-UETk8HSB0Yw": TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  "yt-or_SDolEBfw": TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  "sc-tomorrowland-mandy-mondays-august-2026": TL_MANDY_MANDY_MONDAYS_028_2026,
  "yt-J7b0G4XX8pg":
    TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
  "yt-B1EaMgsf84Q":
    TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
  "yt-yPCOu0-JKJo":
    TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
  "sc-tomorrowland-mash-up-universe-djs-from-mars-august-2026":
    TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026,
  "yt-TidwOi0NMI0": TL_ALESSO_TML_WE1_2026,
  "yt-E1WH0nvaxAw": TL_ILLENIUM_TML_WE1_2026,
  "yt-jSJEkiV3cCs": TL_CHASE_STATUS_TML_WE2_2026,
  "yt-zMW5SQPS1cY": TL_I_HATE_MODELS_TML_WE1_2026,
  "yt-_e1H9pkcjsQ": TL_NETSKY_TML_WE1_2026,
  "yt-2i3XOxbp54U": TL_OLIVER_HELDENS_TML_WE1_2026,
  "yt-xVWs0ti0J90": TL_ALAN_WALKER_TML_WE1_2018,
  "yt-lopIWBJ0T5I": TL_GORDO_TML_WE2_2023,
  "yt-GbG_OFmdPKk": TL_LUCAS_STEVE_TML_WE2_2024,
  "yt-7_O8N_EJg_c": TL_TAPE_B_CARTUNES_VOL5_2026,
  "sc-tape-b-official-tape-b-cartunes-vol-5": TL_TAPE_B_CARTUNES_VOL5_2026,
  "sc-realmaup-xxx-radio-201": TL_MAU_P_XXX_RADIO_201_2026,
  "yt-KbGNocaJDjw": TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
  "sc-vintageculturemusic-vintage-culture-robot-heart-residency-2024-california":
    TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
  "yt-PkWNuf7rtms": TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
  "yt-AQ6wWT2HaSQ": TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
  "sc-brandonsounds-brandon-live-at-parookaville-2024-desert-valley":
    TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
  "yt-eVjC42MNgkI": TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
  "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687":
    TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
  "yt-9vgSTomhCp8": TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
  "sc-notiondj-notion-live-at-lollapalooza":
    TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
  "yt-xXRjglkAmq8": TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
  "sc-keinemusik-keinemusik-radio-show-by-lazarusman-03072026":
    TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026,
  "yt-TDuFnUAo4II": TL_VINTAGE_CULTURE_PACHA_NYC_2026,
  "yt-fQweMs-Q3rg": TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  "yt-b-2YA4yC3UA": TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  "yt-xUdcEDryN8o": TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
  "sc-awakenings-indira-paganotto-awakenings-festival-2025":
    TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
  "yt-7UcyaKbvy2o": TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
  "sc-korolovadj-korolova-live-snowattack":
    TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
  "yt-HvkAfj1QnK8": TL_KOROLOVA_TULUM_MEXICO_2026,
  "sc-korolovadj-korolova-tulum-mexico-melodic":
    TL_KOROLOVA_TULUM_MEXICO_2026,
  "yt-Nrl9yBX6Kpw": TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
};

/** Sanity: every seeded clock must parse. */
export function assertSeedClocks(rows: FingerprintSeedRow[]): void {
  for (const r of rows) {
    if (parseClockToSec(r.at) == null) {
      throw new Error(`bad 1001tl clock: ${r.at} (${r.artist} - ${r.title})`);
    }
  }
}
