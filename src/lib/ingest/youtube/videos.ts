/**
 * Curated YouTube set URLs / video IDs.
 *
 * Prefer uploads that either:
 * - include a timed tracklist in the description, or
 * - have YouTube Music "songs in this video" credits (Content ID), or
 * - carry a pasted fingerprint tracklist (`fingerprintPlays`)
 *
 * Venue + artist channels are polled separately via `venues.ts` / `artists.ts`.
 */

import {
  FP_JAMES_HYPE_GET_CLOSER_LONDON,
  FP_JAMES_HYPE_GET_CLOSER_LONDON_2,
  type FingerprintSeedRow,
} from "../fingerprint/seeds";
import {
  TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026,
  TL_AYYBO_ODD_MOB_TML_WE2_2026,
  TL_BLEU_CLAIR_EDC_LV_2023,
  TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  TL_CLOONEE_PROSPA_DESTINO_2026,
  TL_DARUDE_EDC_LV_2026,
  TL_MARTEN_HORGER_EDC_LV_2023,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  TL_FUNK_TRIBU_EDC_LV_2026,
  TL_HOLY_PRIEST_EDC_LV_2026,
  TL_MATTY_RALPH_EDC_LV_2026,
  TL_ENRICO_SANGIULIANO_TML_WE2_2026,
  TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
  TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
  TL_FISHER_TML_WE1_2026,
  TL_FISHER_TML_WE2_2026,
  TL_MASSANO_TML_WE2_2026,
  TL_HARDWELL_TML_WE2_2026,
  TL_CYRIL_TML_WE2_2026,
  TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
  TL_DIMITRI_VEGAS_TML_WE2_2026,
  TL_DOM_DOLLA_ALLIANZ_SYDNEY,
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
  TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
  TL_JAMES_HYPE_TML_WE2_2026,
  TL_JOHN_SUMMIT_TML_WE2_2026,
  TL_KOLSCH_TML_WE2_2026,
  TL_KOROLOVA_TML_WE2_2026,
  TL_LUCAS_STEVE_TML_WE2_2026,
  TL_SARA_LANDRY_TML_WE2_2026,
  TL_AFROJACK_R3HAB_TML_WE2_2026,
  TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
  TL_STEVE_AOKI_TML_WE2_2026,
  TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
  TL_ARMIN_OTTAVIANI_ASOT_1290_2026,
  TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
  TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
  TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
  TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
  TL_ALOK_TML_WE2_2026,
  TL_HARDWELL_HOA_527_YEARMIX_2025,
  TL_JOEL_CORRY_EDGE_NYC_2026,
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
  TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
  TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
  TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
  TL_TIESTO_PRISMATIC_032_2026,
  TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
  TL_VINTAGE_CULTURE_NYC_YACHT_2023,
  TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
  TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
  TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
  TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
  TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
  TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
  TL_MISS_MONIQUE_TML_WE2_2026,
  TL_NICKY_ROMERO_TML_WE2_2026,
  TL_ODD_MOB_TML_WE2_2026,
  TL_STEVE_ANGELLO_TML_WE2_2026,
  TL_NICO_MORENO_EDC_LV_2026,
  TL_PEGASSI_EDC_LV_2026,
  TL_SARAH_DE_WARREN_EDC_LV_2026,
  TL_SOLOMUN_ALLY_PALLY_2026,
  TL_SOLOMUN_EDC_LV_2026,
  TL_WESTEND_EDC_LV_2026,
  TL_ALAN_WALKER_TML_WE1_2018,
  TL_GORDO_TML_WE2_2023,
  TL_LUCAS_STEVE_TML_WE2_2024,
  TL_ALESSO_TML_WE1_2026,
  TL_ALESSO_TML_WE2_2026,
  TL_CHASE_STATUS_TML_WE2_2026,
  TL_I_HATE_MODELS_TML_WE1_2026,
  TL_ILLENIUM_TML_WE1_2026,
  TL_NETSKY_TML_WE1_2026,
  TL_OLIVER_HELDENS_TML_WE1_2026,
  TL_ARMIN_VAN_BUUREN_TML_WE2_2026,
  TL_HONEYLUV_ANTS_USHUAIA_2026,
  TL_HONEYLUV_STREET_PARADE_2025,
  TL_JOHN_SUMMIT_LOLLAPALOOZA,
  TL_MARTIN_GARRIX_TML_WE2_2026,
  TL_PAN_POT_STREET_PARADE_2025,
  TL_PEGGY_GOU_CERCLE_LILLE,
  TL_PEGGY_GOU_EDC_LV_2026,
  TL_THE_CHAINSMOKERS_TML_WE1_2026,
  TL_TAPE_B_CARTUNES_VOL5_2026,
  TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
  TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
  TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
  TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
  TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
  TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
  TL_VINTAGE_CULTURE_PACHA_NYC_2026,
  TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
  TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
  TL_KOROLOVA_TULUM_MEXICO_2026,
  TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
  TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025,
  TL_AUSTIN_KRAMER_UNRELEASED_139_2026,
  TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020,
  TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026,
  TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024,
  TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
} from "../tracklists1001/seeds";
import type { RawArtist } from "../types";
import { slugify } from "../types";

export type YoutubeSetSource = {
  /** 11-char id or full watch URL */
  video: string;
  primaryArtist: RawArtist;
  genre: string;
  type?: "radio" | "festival" | "soundcloud" | "mix";
  /** Optional override title */
  title?: string;
  seriesName?: string;
  eventName?: string;
  /**
   * Manual fingerprint IDs (ACRCloud / AudD / pasted aha-music analysis).
   * Written as provenance "fingerprint"; never overwrites sourceUrl.
   */
  fingerprintPlays?: FingerprintSeedRow[];
  /**
   * 1001Tracklists rows (browser capture / follow-link). Provenance "1001tl".
   * Used when the upload only links 1001.tl and live HTML is Cloudflare-gated.
   */
  tracklist1001?: FingerprintSeedRow[];
  /**
   * Known 1001.tl / 1001tracklists.com URL when the YT description omits it
   * (common on Insomniac playbacks). Tried before falling back to seed rows.
   */
  tracklist1001Url?: string;
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

function marten(extra: Partial<RawArtist> = {}): RawArtist {
  return dj("Marten Horger", {
    accent: "#ff7a45",
    homeCity: "Berlin, DE",
    ...extra,
  });
}

export const YOUTUBE_SETS: YoutubeSetSource[] = [
  {
    video: "https://www.youtube.com/watch?v=9AfzWCT7bac",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - Pop Up Rave in a Church (Ravensburg)",
    seriesName: "Pop Up Rave",
  },
  {
    video: "https://www.youtube.com/watch?v=ileReNaZW5A",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger Live at Academy Los Angeles",
    eventName: "Academy LA",
  },
  {
    video: "https://www.youtube.com/watch?v=4NBHtb4LCKM",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger Live from Bootshaus 2023",
    eventName: "Bootshaus",
  },
  {
    video: "https://www.youtube.com/watch?v=GIqtyI5o3qk",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - EDC Las Vegas 2023 Mainstage",
    eventName: "EDC Las Vegas",
    // Description only links https://1001.tl/vfff7hk — seed from browser scrape.
    tracklist1001: TL_MARTEN_HORGER_EDC_LV_2023,
  },
  {
    // Official Tomorrowland upload — B2B; title drives collaborator parse.
    video: "https://www.youtube.com/watch?v=gSNSE5u1M7U",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Dillon Francis B2B Marten Horger - Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    // Official Parookaville channel — 1001TL timed list (browser capture).
    video: "https://www.youtube.com/watch?v=EbNRjEFZpDw",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - Parookaville 2026 Mainstage",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001: TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  },
  {
    // Official Cloonee upload; same night as SC clooneeb2bprospa.
    video: "https://www.youtube.com/watch?v=UE6wjxvMRz0",
    primaryArtist: dj("Cloonee", {
      accent: "#ff8c42",
      homeCity: "Dublin, IE",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Cloonee B2B Prospa - Live at Destino, Ibiza",
    eventName: "Music On Destino",
    tracklist1001: TL_CLOONEE_PROSPA_DESTINO_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=9MZz5YazOUo",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    seriesName: "Cafe Mambo",
    eventName: "Cafe Mambo Ibiza",
  },
  {
    video: "https://www.youtube.com/watch?v=rLTCLSsqrXY",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype SYNC London (Full Set)",
    seriesName: "SYNC",
    eventName: "SYNC London",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/n48bp01/james-hype-sync-magazine-london-united-kingdom-2025-11-29.html",
    tracklist1001: TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
  },
  {
    video: "https://www.youtube.com/watch?v=oVOuXYtqi6I",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype - Get Closer, London - Full Set",
    seriesName: "Get Closer",
    eventName: "Get Closer London",
    fingerprintPlays: FP_JAMES_HYPE_GET_CLOSER_LONDON,
  },
  {
    video: "https://www.youtube.com/watch?v=tBvllfEXio4",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype - Get Closer, London #2 - Full Set",
    seriesName: "Get Closer",
    eventName: "Get Closer London",
    fingerprintPlays: FP_JAMES_HYPE_GET_CLOSER_LONDON_2,
  },
  {
    // Artist upload — Get Closer Melkweg ADE; 33/51 timed (rest lerped).
    video: "https://www.youtube.com/watch?v=QThaqlzSqLw",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype, live @ Melkweg, Amsterdam",
    seriesName: "Get Closer",
    eventName: "Get Closer Melkweg ADE",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1g6h49l1/james-hype-get-closer-melkweg-amsterdam-dance-event-netherlands-2025-10-23.html",
    tracklist1001: TL_JAMES_HYPE_MELKWEG_ADE_2025,
  },
  {
    // Artist-channel full set — Allianz Stadium Sydney; 1001.tl/jf3kd41 timed capture.
    video: "https://www.youtube.com/watch?v=4Lqyh7cWRxQ",
    primaryArtist: dj("Dom Dolla", {
      accent: "#00bbf9",
      homeCity: "Melbourne, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Dom Dolla @ Allianz Stadium Sydney",
    eventName: "Allianz Stadium Sydney",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/jf3kd41/dom-dolla-allianz-stadium-sydney-australia-2025-12-20.html",
    tracklist1001: TL_DOM_DOLLA_ALLIANZ_SYDNEY,
  },
  {
    // Official playback — Creamfields North Steel Yard 2025; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=NblVVOwQRqw",
    primaryArtist: dj("Dom Dolla", {
      accent: "#00bbf9",
      homeCity: "Melbourne, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Dom Dolla Steel Yard | Creamfields 2025",
    seriesName: "Creamfields",
    eventName: "Creamfields",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2uwn3mgk/dom-dolla-steel-yard-creamfields-north-united-kingdom-2025-08-23.html",
    tracklist1001: TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
  },
  {
    video: "https://www.youtube.com/watch?v=i9cNYaOOdwA",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype live at STEREOHYPE Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=HTR2M4QdorM",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype B2B Tita Lau live at STEREOHYPE Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=mTGTcuaGhls",
    primaryArtist: dj("Tita Lau", { accent: "#ff8fab" }),
    genre: "Tech House",
    type: "festival",
    title: "Tita Lau live from STEREOHYPE | Laminor Arena - Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=EXKpyYAXtyw",
    primaryArtist: dj("Chris Lake", {
      accent: "#3d8bfd",
      homeCity: "London, UK",
    }),
    genre: "Tech House",
    type: "festival",
    eventName: "Los Angeles Historic Park",
  },
  {
    video: "https://www.youtube.com/watch?v=6v9ByGvQqbY",
    primaryArtist: dj("Oliver Heldens", {
      accent: "#7c5cff",
      homeCity: "Netherlands",
    }),
    genre: "Future House",
    type: "radio",
    seriesName: "Heldeep Radio",
  },
  {
    video: "https://www.youtube.com/watch?v=am7YNM3md2I",
    primaryArtist: dj("ARTBAT", {
      accent: "#6c63ff",
      homeCity: "Kyiv, UA",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "ARTBAT live set",
  },
  {
    video: "https://www.youtube.com/watch?v=0psLTNmJM38",
    primaryArtist: dj("Bizarrap", {
      accent: "#f4a261",
      homeCity: "Ramos Mejía, AR",
    }),
    genre: "House",
    type: "festival",
    title:
      "BIZARRAP || LIVE @ ULTRA MIAMI MAIN STAGE 2026 (ft. Skrillex & Daddy Yankee)",
    seriesName: "Ultra Shows",
    eventName: "Ultra Music Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=g1vH9C_o-vo",
    primaryArtist: dj("Solomun", {
      accent: "#f0e6d8",
      homeCity: "Hamburg, DE",
    }),
    genre: "Melodic House",
    type: "festival",
    title: "Solomun Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2lkyu9mk/solomun-circuitgrounds-edc-las-vegas-united-states-2026-05-17.html",
    tracklist1001: TL_SOLOMUN_EDC_LV_2026,
  },
  {
    // Artist upload — Alexandra Palace London; 1001.tl/fn4hckk timed capture.
    video: "https://www.youtube.com/watch?v=S46Bs4pZ_I4",
    primaryArtist: dj("Solomun", {
      accent: "#f0e6d8",
      homeCity: "Hamburg, DE",
    }),
    genre: "Melodic House",
    type: "festival",
    title: "Solomun @ Alexandra Palace London 2026",
    eventName: "Alexandra Palace",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/fn4hckk/solomun-alexandra-palace-london-united-kingdom-2026-02-07.html",
    tracklist1001: TL_SOLOMUN_ALLY_PALLY_2026,
  },
  {
    // Insomniac playback — promo description only; 1001TL seed from screenshots.
    video: "https://www.youtube.com/watch?v=jQLWYc2UrFY",
    primaryArtist: dj("Westend", {
      accent: "#f72585",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Westend Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001: TL_WESTEND_EDC_LV_2026,
  },
  {
    // Insomniac playback — already in catalog via @insomniac; seed fills 0 plays.
    video: "https://www.youtube.com/watch?v=yXHoHK_jQvc",
    primaryArtist: dj("AHEE", {
      accent: "#7b2cbf",
      homeCity: "US",
    }),
    genre: "Bass",
    type: "festival",
    title: "AHEE B2B Liquid Stranger Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001: TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  },
  {
    // Insomniac playback — promo description; 1001 URL from operator (CF in CI).
    video: "https://www.youtube.com/watch?v=dXBoIY65P8s",
    primaryArtist: dj("Darude", {
      accent: "#00b4d8",
      homeCity: "Turku, FI",
    }),
    genre: "Trance",
    type: "festival",
    title: "Darude Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1v8whc0k/darude-quantumvalley-edc-las-vegas-united-states-2026-05-15.html",
    tracklist1001: TL_DARUDE_EDC_LV_2026,
  },
  {
    // Insomniac playback — already in catalog via @insomniac; seed fills 0 plays.
    video: "https://www.youtube.com/watch?v=KIb3psOt9hI",
    primaryArtist: dj("Sarah de Warren", {
      accent: "#c77dff",
      homeCity: "US",
    }),
    genre: "Trance",
    type: "festival",
    title: "Sarah De Warren Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1z031tz1/sarah-de-warren-quantumvalley-edc-las-vegas-united-states-2026-05-15.html",
    tracklist1001: TL_SARAH_DE_WARREN_EDC_LV_2026,
  },
  {
    // Insomniac playback — 1001 cues untimed; even-spaced from capture.
    video: "https://www.youtube.com/watch?v=yUA0Ht2PdG0",
    primaryArtist: dj("Pegassi", {
      accent: "#80ed99",
      homeCity: "EU",
    }),
    genre: "Techno",
    type: "festival",
    title: "Pegassi Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/108mxtc9/pegassi-quantumvalley-edc-las-vegas-united-states-2026-05-15.html",
    tracklist1001: TL_PEGASSI_EDC_LV_2026,
  },
  {
    // Insomniac playback — circuitGROUNDS solo; 1001 cues untimed.
    video: "https://www.youtube.com/watch?v=f_p6nfbrm0E",
    primaryArtist: dj("Nico Moreno", {
      accent: "#ff006e",
      homeCity: "Berlin, DE",
    }),
    genre: "Hard Techno",
    type: "festival",
    title: "Nico Moreno Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2r6ym5qt/nico-moreno-circuitgrounds-edc-las-vegas-united-states-2026-05-15.html",
    tracklist1001: TL_NICO_MORENO_EDC_LV_2026,
  },
  {
    // Insomniac playback — quantumVALLEY; 11/12 timed cues from 1001 capture.
    video: "https://www.youtube.com/watch?v=FZ7pwlNdwBk",
    primaryArtist: dj("Matty Ralph", {
      accent: "#4cc9f0",
      homeCity: "EU",
    }),
    genre: "Techno",
    type: "festival",
    title: "Matty Ralph Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2hsk794t/matty-ralph-quantumvalley-edc-las-vegas-united-states-2026-05-15.html",
    tracklist1001: TL_MATTY_RALPH_EDC_LV_2026,
  },
  {
    // Insomniac playback — kineticFIELD; 10/10 timed cues from 1001 capture.
    video: "https://www.youtube.com/watch?v=APt5j9Abwo8",
    primaryArtist: dj("Funk Tribu", {
      accent: "#ffbe0b",
      homeCity: "IT",
    }),
    genre: "Techno",
    type: "festival",
    title: "Funk Tribu Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1lwpqyz1/funk-tribu-kineticfield-edc-las-vegas-united-states-2026-05-17.html",
    tracklist1001: TL_FUNK_TRIBU_EDC_LV_2026,
  },
  {
    // Artist upload (not Insomniac playback) — full timed 1001 capture.
    video: "https://www.youtube.com/watch?v=D8eLxmifH4o",
    primaryArtist: dj("Holy Priest", {
      accent: "#e63946",
      homeCity: "DE",
    }),
    genre: "Hard Techno",
    type: "festival",
    title: "HOLY PRIEST | LIVE | EDC LAS VEGAS | CIRCUIT GROUNDS | 2026",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/gld216t/holy-priest-circuitgrounds-edc-las-vegas-united-states-2026-05-15.html",
    tracklist1001: TL_HOLY_PRIEST_EDC_LV_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 13/18 timed cues from 1001.
    video: "https://www.youtube.com/watch?v=2idboK_vTT8",
    primaryArtist: dj("Odd Mob", {
      accent: "#b8f200",
      homeCity: "Brisbane, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Odd Mob WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/qz04ypk/odd-mob-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_ODD_MOB_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 20/20 timed cues from 1001.
    video: "https://www.youtube.com/watch?v=WhPtvotfYbc",
    primaryArtist: dj("Miss Monique", {
      accent: "#2a9d8f",
      homeCity: "Kyiv, UA",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Miss Monique WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2u0sds71/miss-monique-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_MISS_MONIQUE_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Freedom Stage WE2; 17/19 timed cues from 1001.
    video: "https://www.youtube.com/watch?v=ubFrkYGGqo8",
    primaryArtist: dj("Enrico Sangiuliano", {
      accent: "#e9c46a",
      homeCity: "Rimini, IT",
    }),
    genre: "Techno",
    type: "festival",
    title: "Enrico Sangiuliano WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/16tnb0pk/enrico-sangiuliano-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_ENRICO_SANGIULIANO_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; dense mashup TL (28/76 timed).
    video: "https://www.youtube.com/watch?v=TsyGMhx8izw",
    primaryArtist: dj("Nicky Romero", {
      accent: "#00bbf9",
      homeCity: "Amerongen, NL",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Nicky Romero WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/wkty6z9/nicky-romero-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_NICKY_ROMERO_TML_WE2_2026,
  },
  {
    // Artist-channel playback of the same Mainstage WE2 set (1001.tl/wkty6z9).
    video: "https://www.youtube.com/watch?v=B05MAbsCOLA",
    primaryArtist: dj("Nicky Romero", {
      accent: "#00bbf9",
      homeCity: "Amerongen, NL",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Nicky Romero LIVE at Tomorrowland 2026 - Mainstage",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/wkty6z9/nicky-romero-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_NICKY_ROMERO_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Freedom Stage WE2; 21/35 timed cues from 1001.
    video: "https://www.youtube.com/watch?v=dmhUJYEdkKo",
    primaryArtist: dj("James Hype", {
      accent: "#ff006e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2b63zu8k/james-hype-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_JAMES_HYPE_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 16/19 timed cues from 1001.
    video: "https://www.youtube.com/watch?v=ra8NYbzPMnk",
    primaryArtist: dj("Kölsch", {
      accent: "#457b9d",
      homeCity: "Copenhagen, DK",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Kölsch WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2u0sgrq9/kolsch-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_KOLSCH_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 20/41 timed cues from 1001.
    video: "https://www.youtube.com/watch?v=5AdQy7lCbN0",
    primaryArtist: dj("Steve Angello", {
      accent: "#e63946",
      homeCity: "Stockholm, SE",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Steve Angello WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1tfpw4qk/steve-angello-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_STEVE_ANGELLO_TML_WE2_2026,
  },
  {
    // Artist / playback — Mainstage WE1; 1001.tl/2jqqmqsk timed capture.
    video: "https://www.youtube.com/watch?v=4985f9Rfxx0",
    primaryArtist: dj("FISHER", {
      accent: "#ffba08",
      homeCity: "Gold Coast, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Fisher Mainstage WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2jqqmqsk/fisher-mainstage-tomorrowland-weekend-1-belgium-2026-07-18.html",
    tracklist1001: TL_FISHER_TML_WE1_2026,
  },
  {
    // Official Tomorrowland Relive — Mainstage WE1. Same 1001 seed as the
    // SoundCloud upload (sc-charlottedewittemusic-charlotte-de-witte-at).
    video: "https://www.youtube.com/watch?v=uMgz40hvySQ",
    primaryArtist: dj("Charlotte de Witte", {
      accent: "#e0e0e0",
      homeCity: "Belgium",
    }),
    genre: "Techno",
    type: "festival",
    title: "Charlotte de Witte WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001: TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  },
  {
    // Tomorrowland official — Freedom Stage WE2; 17/17 timed cues from 1001.
    // Official full-set upload (prior id mVB-gqggrCQ replaced 2026-08-12).
    // SET_SOURCE_REMAPS folds the private slug so /sets/yt-mVB-gqggrCQ/ still resolves.
    video: "https://www.youtube.com/watch?v=Uq1WP8v3U4o",
    primaryArtist: dj("FISHER", {
      accent: "#ffba08",
      homeCity: "Gold Coast, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Fisher WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/kd5wd49/fisher-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_FISHER_TML_WE2_2026,
  },
  {
    // Official Tomorrowland Relive — Freedom Stage WE2; 1001.tl/116uj1x1 timed capture.
    video: "https://www.youtube.com/watch?v=eeNljOHahxY",
    primaryArtist: dj("Massano", { accent: "#8338ec" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Massano Freedom WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/116uj1x1/massano-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_MASSANO_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2 closing; also artist upload Py-GG74lLU8.
    video: "https://www.youtube.com/watch?v=yWZyIQtxoXU",
    primaryArtist: dj("Hardwell", {
      accent: "#023e8a",
      homeCity: "Breda, NL",
    }),
    genre: "Big Room",
    type: "festival",
    title: "Hardwell WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/14y11rh1/hardwell-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_HARDWELL_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Crystal Garden WE2 B2B; 26/30 timed cues.
    video: "https://www.youtube.com/watch?v=gO03gfI_JF0",
    primaryArtist: dj("AYYBO", {
      accent: "#ff006e",
      homeCity: "US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Ayybo b2b Odd Mob WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1qn93jz1/ayybo-odd-mob-crystal-garden-stage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_AYYBO_ODD_MOB_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Crystal Garden WE2; 34/38 timed cues from 1001.
    // Watch is private (iytimg 404). Meantime cover: KNOWN_SET_IMAGES.
    video: "https://www.youtube.com/watch?v=PlArfyuzuqo",
    primaryArtist: dj("John Summit", {
      accent: "#4cc9f0",
      homeCity: "Chicago, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "John Summit WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2hsylb61/john-summit-crystal-garden-stage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_JOHN_SUMMIT_TML_WE2_2026,
  },
  {
    // Artist upload — short YouTube House set (not Mainstage WE2 Tomorrowland Relive).
    video: "https://www.youtube.com/watch?v=I6QA_T-BS6o",
    primaryArtist: dj("Armin van Buuren", {
      accent: "#0077b6",
      homeCity: "Leiden, NL",
    }),
    genre: "Trance",
    type: "festival",
    title: "Armin van Buuren live from the YouTube House at Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2hsz5x4k/armin-van-buuren-youtube-house-tomorrowland-belgium-2026-07-25.html",
    tracklist1001: TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026,
  },
  {
    // Tomorrowland official Relive — Mainstage WE2.
    video: "https://www.youtube.com/watch?v=tg_QLGpes0k",
    primaryArtist: dj("Armin van Buuren", {
      accent: "#0077b6",
      homeCity: "Leiden, NL",
    }),
    genre: "Trance",
    type: "festival",
    title: "Armin van Buuren WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2s558yl9/armin-van-buuren-mainstage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_ARMIN_VAN_BUUREN_TML_WE2_2026,
  },
  {
    // Tomorrowland official Relive — Freedom Stage WE1.
    video: "https://www.youtube.com/watch?v=pwXGm4HEQdo",
    primaryArtist: dj("Armin van Buuren", {
      accent: "#0077b6",
      homeCity: "Leiden, NL",
    }),
    genre: "Trance",
    type: "festival",
    title: "Armin van Buuren Freedom WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/vmz5x4t/armin-van-buuren-freedom-stage-tomorrowland-weekend-1-belgium-2026-07-18.html",
    tracklist1001: TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
  },
  {
    // Tomorrowland official Relive — Mainstage WE2.
    video: "https://www.youtube.com/watch?v=zHAUZ02aCwo",
    primaryArtist: dj("Alok", {
      accent: "#ff6b35",
      homeCity: "Brazil",
    }),
    genre: "House",
    type: "festival",
    title: "Alok WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/fnz6fv9/alok-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_ALOK_TML_WE2_2026,
  },
  {
    // ASOT 1290 radio episode; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=bxb6Tglooc4",
    primaryArtist: dj("Armin van Buuren", {
      accent: "#0077b6",
      homeCity: "Leiden, NL",
    }),
    genre: "Trance",
    type: "radio",
    title:
      "Armin van Buuren & Giuseppe Ottaviani - A State Of Trance 1290 2026-08-13",
    seriesName: "A State of Trance",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/p3j7nb9/armin-van-buuren-giuseppe-ottaviani-a-state-of-trance-1290-2026-08-13.html",
    tracklist1001: TL_ARMIN_OTTAVIANI_ASOT_1290_2026,
  },
  {
    // Official GDJB radio episode; timed 1001 capture. SC twin:
    // sc-markusschulz-gdjb-aug132026.
    video: "https://www.youtube.com/watch?v=WWnLYZrh6kw",
    primaryArtist: dj("Markus Schulz", {
      accent: "#4895ef",
      homeCity: "Miami, US",
    }),
    genre: "Trance",
    type: "radio",
    title:
      "Markus Schulz & Jerome Isma-Ae - Global DJ Broadcast 2026-08-13", // pragma: allowlist secret
    seriesName: "Global DJ Broadcast", // pragma: allowlist secret
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2llgr4u1/markus-schulz-jerome-isma-ae-global-dj-broadcast-2026-08-13.html", // pragma: allowlist secret
    tracklist1001: TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
  },
  {
    // Official Hardwell On Air 527 Yearmix; timed 1001 capture. SC twin:
    // sc-hardwell-hardwell-on-air-527-yearmix.
    video: "https://www.youtube.com/watch?v=OXwK0CSmXzY",
    primaryArtist: dj("Hardwell", {
      accent: "#023e8a",
      homeCity: "Breda, NL",
    }),
    genre: "Big Room",
    type: "radio",
    title: "Hardwell On Air 527 YEARMIX 2025",
    seriesName: "Hardwell On Air",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1w5whv39/hardwell-hardwell-on-air-527-yearmix-2025-2026-01-02.html",
    tracklist1001: TL_HARDWELL_HOA_527_YEARMIX_2025,
  },
  {
    // Official Protocol Radio 731; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=Rgx-wT9FDaE",
    primaryArtist: dj("Nicky Romero", {
      accent: "#ffbe0b",
    }),
    genre: "Progressive House",
    type: "radio",
    title: "Protocol Radio 731 by Nicky Romero (PRR731)",
    seriesName: "Protocol Radio",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/zcblxf9/nicky-romero-protocol-radio-731-2026-08-13.html",
    tracklist1001: TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
  },
  {
    // Official Smash The House Radio 687; timed 1001 capture. SC twin:
    // sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687.
    // Mixcloud is a mirror only (do not ingest as a second set):
    // https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-687/
    video: "https://www.youtube.com/watch?v=eVjC42MNgkI",
    primaryArtist: dj("Dimitri Vegas & Like Mike", {
      accent: "#f7b801",
      homeCity: "Belgium",
    }),
    genre: "Big Room",
    type: "radio",
    title: "Dimitri Vegas & Like Mike - Smash The House Radio 687 2026-07-31",
    seriesName: "Smash The House Radio",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/124p2t0t/dimitri-vegas-like-mike-smash-the-house-radio-687-2026-07-31.html",
    tracklist1001: TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
  },
  {
    // Official Purified Radio 520; timed 1001 capture (same list as SC).
    video: "https://www.youtube.com/watch?v=8aDoUu4GDrc",
    primaryArtist: dj("Nora En Pure", { accent: "#48cae4" }),
    genre: "Deep House",
    type: "radio",
    title: "Nora En Pure - Purified Radio 520",
    seriesName: "Purified Radio",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/q195rv1/nora-en-pure-purified-radio-520-2026-08-10.html",
    tracklist1001: TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
  },
  {
    // Official Captive Soul 098 (show channel / same 1001 as SC).
    video: "https://www.youtube.com/watch?v=5JxfEjVdQFk",
    primaryArtist: dj("Korolova", {
      accent: "#f72585",
      homeCity: "Ukraine",
    }),
    genre: "Melodic Techno",
    type: "radio",
    title: "Korolova - Captive Soul 098",
    seriesName: "Captive Soul",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1cgr4nqk/korolova-captive-soul-098-2026-08-07.html",
    tracklist1001: TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
  },
  {
    // Official Korolova playback — Snowattack Festival 2026-01-21.
    // Distinct from Captive Soul 098 and TML WE2 Freedom Stage.
    video: "https://www.youtube.com/watch?v=7UcyaKbvy2o",
    primaryArtist: dj("Korolova", {
      accent: "#f72585",
      homeCity: "Ukraine",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Korolova | Snowattack Festival 2026",
    seriesName: "Snowattack",
    eventName: "Snowattack Festival",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/kcl35g1/korolova-snowattack-festival-les-deux-alpes-france-2026-01-21.html",
    tracklist1001: TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
  },
  {
    // Official Korolova playback — Tulum, Mexico 2026-02-27.
    // Distinct from Snowattack, Captive Soul 098, and TML WE2.
    video: "https://www.youtube.com/watch?v=HvkAfj1QnK8",
    primaryArtist: dj("Korolova", {
      accent: "#f72585",
      homeCity: "Ukraine",
    }),
    genre: "Melodic Techno",
    type: "mix",
    title: "Korolova | Tulum, Mexico 2026",
    eventName: "Tulum",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/20v73731/korolova-tulum-mexico-2026-02-27.html",
    tracklist1001: TL_KOROLOVA_TULUM_MEXICO_2026,
  },
  {
    // Official playback — Teletech x FYM, AFAS Live Amsterdam 2025-12-31.
    // No SoundCloud in the operator paste — do not invent an SC slug.
    video: "https://www.youtube.com/watch?v=Nrl9yBX6Kpw",
    primaryArtist: dj("Natte Visstick", {
      accent: "#ff4d00",
    }),
    genre: "Hard Dance",
    type: "festival",
    title: "Natte Visstick | Teletech x FYM, AFAS Live 2025",
    eventName: "Teletech x FYM",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/25jl14z9/natte-visstick-teletech-x-fym-afas-live-amsterdam-netherlands-2025-12-31.html",
    tracklist1001: TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
  },
  {
    // Official playback — Pyramid, Amnesia Ibiza 2025-09-21.
    // Distinct from Street Parade Opera (yt-7cK7rhYXbh8).
    // No SoundCloud in the operator paste — do not invent an SC slug.
    video: "https://www.youtube.com/watch?v=IfFnvi7O2Po",
    primaryArtist: dj("Deborah De Luca", { accent: "#c9184a" }),
    genre: "Techno",
    type: "festival",
    title: "Deborah De Luca | Pyramid, Amnesia Ibiza 2025",
    seriesName: "Pyramid",
    eventName: "Amnesia Ibiza",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/crntdz1/deborah-de-luca-pyramid-amnesia-ibiza-spain-2025-09-21.html",
    tracklist1001: TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025,
  },
  {
    // Official Epic Radio 036; timed 1001 capture (same list as SC).
    // Mixcloud is a mirror only — do not wire mixcloud slugs.
    video: "https://www.youtube.com/watch?v=JLIYTueL4TI",
    primaryArtist: dj("Eric Prydz", {
      accent: "#7209b7",
      homeCity: "Sweden",
    }),
    genre: "Progressive House",
    type: "radio",
    title: "Eric Prydz presents EPIC Radio 036",
    seriesName: "Epic Radio",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/9xurh1t/eric-prydz-epic-radio-036-2026-08-06.html",
    tracklist1001: TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
  },
  {
    // Official Miss Monique upload; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=0-s_qZRWElA",
    primaryArtist: dj("Miss Monique", {
      accent: "#9b5de5",
      homeCity: "Kyiv, UA",
    }),
    genre: "Melodic Techno",
    type: "mix",
    title: "Miss Monique @ Ibiza Yacht Sunset '26",
    eventName: "Ibiza Sunset Yacht",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2ng22gq9/miss-monique-ibiza-sunset-yacht-mix-2026-08-13.html",
    tracklist1001: TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
  },
  {
    // Official Prismatic 032; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=blP5J6BUG0M",
    primaryArtist: dj("Tiësto", {
      accent: "#00bbf9",
      homeCity: "Netherlands",
    }),
    genre: "Big Room",
    type: "radio",
    title: "PRISMATIC by Tiësto 032",
    seriesName: "Prismatic",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/m7vw17k/tiesto-prismatic-032-2026-08-08.html",
    tracklist1001: TL_TIESTO_PRISMATIC_032_2026,
  },
  {
    // Official Spectrum Radio 485; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=yTRvLrtsM9I",
    primaryArtist: dj("Joris Voorn", {
      accent: "#2ec4b6",
      homeCity: "Rotterdam, NL",
    }),
    genre: "Tech House",
    type: "radio",
    title: "Spectrum Radio 485 Joris Voorn | Brno,Czech Republic",
    seriesName: "Spectrum Radio",
    eventName: "Exit, Veveří Castle Brno",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2vwh8lq1/joris-voorn-spectrum-radio-485-exit-veveri-castle-brno-czech-republic-2026-08-12.html",
    tracklist1001: TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
  },
  {
    // Official Group Therapy 690; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=phWKhIwgiTo",
    primaryArtist: dj("Above & Beyond", { accent: "#7209b7" }),
    genre: "Trance",
    type: "radio",
    title: "Group Therapy 690 with Above & Beyond and Estiva",
    seriesName: "Group Therapy",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/19m58br9/above-beyond-estiva-group-therapy-radio-690-2026-08-14.html",
    tracklist1001: TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
  },
  {
    // Tomorrowland official Relive — Mainstage WE2.
    video: "https://www.youtube.com/watch?v=BUsCIK_kh_A",
    primaryArtist: dj("Martin Garrix", {
      accent: "#00d4ff",
      homeCity: "Amsterdam, NL",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Martin Garrix WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/25k3ynk9/martin-garrix-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_MARTIN_GARRIX_TML_WE2_2026,
  },
  {
    // Tomorrowland official Relive — Mainstage WE1.
    video: "https://www.youtube.com/watch?v=1lqmFLr-SkA",
    primaryArtist: dj("The Chainsmokers", { accent: "#4cc9f0" }),
    genre: "Future Bass",
    type: "festival",
    title: "The Chainsmokers WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1ucg9n01/the-chainsmokers-mainstage-tomorrowland-weekend-1-belgium-2026-07-17.html",
    tracklist1001: TL_THE_CHAINSMOKERS_TML_WE1_2026,
  },
  {
    // Tomorrowland official Relive — Mainstage WE1.
    video: "https://www.youtube.com/watch?v=TidwOi0NMI0",
    primaryArtist: dj("Alesso", {
      accent: "#4895ef",
      homeCity: "Stockholm, SE",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Alesso WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/dr4mczt/alesso-mainstage-tomorrowland-weekend-1-belgium-2026-07-19.html",
    tracklist1001: TL_ALESSO_TML_WE1_2026,
  },
  {
    // Tomorrowland official Relive — Great Library WE1.
    video: "https://www.youtube.com/watch?v=E1WH0nvaxAw",
    primaryArtist: dj("Illenium", {
      accent: "#7b2cbf",
      homeCity: "Denver, US",
    }),
    genre: "Melodic Bass",
    type: "festival",
    title: "ILLENIUM WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1kz7zvr9/illenium-the-great-library-stage-tomorrowland-weekend-1-belgium-2026-07-18.html",
    tracklist1001: TL_ILLENIUM_TML_WE1_2026,
  },
  {
    // Tomorrowland official Relive — Mainstage WE2.
    video: "https://www.youtube.com/watch?v=jSJEkiV3cCs",
    primaryArtist: dj("Chase & Status", {
      accent: "#f77f00",
      homeCity: "London, UK",
    }),
    genre: "Drum & Bass",
    type: "festival",
    title: "Chase & Status (DJ set) WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/p3duwuk/chase-status-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_CHASE_STATUS_TML_WE2_2026,
  },
  {
    // Tomorrowland official Relive — Freedom Stage WE1.
    video: "https://www.youtube.com/watch?v=zMW5SQPS1cY",
    primaryArtist: dj("I Hate Models", { accent: "#212529" }),
    genre: "Techno",
    type: "festival",
    title: "I Hate Models WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/ctbyvpk/i-hate-models-freedom-stage-tomorrowland-weekend-1-belgium-2026-07-19.html",
    tracklist1001: TL_I_HATE_MODELS_TML_WE1_2026,
  },
  {
    // Tomorrowland official Relive — Freedom Stage WE1.
    video: "https://www.youtube.com/watch?v=_e1H9pkcjsQ",
    primaryArtist: dj("Netsky", { accent: "#c8e600" }),
    genre: "Drum & Bass",
    type: "festival",
    title: "Netsky WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/rwsgynk/netsky-freedom-stage-tomorrowland-weekend-1-belgium-2026-07-18.html",
    tracklist1001: TL_NETSKY_TML_WE1_2026,
  },
  {
    // Tomorrowland official Relive — Great Library WE1 2026 (not Daybreak 2024).
    video: "https://www.youtube.com/watch?v=2i3XOxbp54U",
    primaryArtist: dj("Oliver Heldens", {
      accent: "#7c5cff",
      homeCity: "Netherlands",
    }),
    genre: "Future House",
    type: "festival",
    title: "Oliver Heldens WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1y2pm859/oliver-heldens-the-great-library-stage-tomorrowland-weekend-1-belgium-2026-07-18.html",
    tracklist1001: TL_OLIVER_HELDENS_TML_WE1_2026,
  },
  {
    // Tomorrowland official Relive — Freedom Stage WE2.
    video: "https://www.youtube.com/watch?v=fhiZ1Rj9o-A",
    primaryArtist: dj("Alesso", {
      accent: "#4895ef",
      homeCity: "Stockholm, SE",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Alesso WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1pqh5ymk/alesso-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-24.html",
    tracklist1001: TL_ALESSO_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Captive Soul / Freedom Stage WE2; 19/21 timed.
    video: "https://www.youtube.com/watch?v=RLOghpXjuJI",
    primaryArtist: dj("Korolova", {
      accent: "#9b5de5",
      homeCity: "Kyiv, UA",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Korolova WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/hjlt23k/korolova-captive-soul-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_KOROLOVA_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 1001 recapture 2026-08-16.
    video: "https://www.youtube.com/watch?v=LE-byccuovI",
    primaryArtist: dj("Lucas & Steve", {
      accent: "#ffb703",
      homeCity: "Maastricht, NL",
    }),
    genre: "Future House",
    type: "festival",
    title: "Lucas & Steve WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/qz05s21/lucas-steve-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_LUCAS_STEVE_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 17/17 timed.
    video: "https://www.youtube.com/watch?v=aDAWctObTvI",
    primaryArtist: dj("Sara Landry", {
      accent: "#e63946",
      homeCity: "Los Angeles, US",
    }),
    genre: "Hard Techno",
    type: "festival",
    title: "Sara Landry WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2pcscu9t/sara-landry-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_SARA_LANDRY_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2 B2B; title drives collaborator parse.
    video: "https://www.youtube.com/watch?v=AjQeohYmg3A",
    primaryArtist: dj("Afrojack", {
      accent: "#ff9f1c",
      homeCity: "Spijkenisse, NL",
    }),
    genre: "Big Room",
    type: "festival",
    title: "AFROJACK B2B R3HAB | Mainstage, Tomorrowland Weekend 2 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2s55dyj1/afrojack-r3hab-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_AFROJACK_R3HAB_TML_WE2_2026,
  },
  {
    // R3HAB official upload of the same TML WE2 B2B; same 1001 list.
    // oEmbed is "Tomorrowland Weekend 2 | Afrojack b2b R3HAB" — keep artist first
    // so Tomorrowland is not parsed as the performing credit.
    video: "https://www.youtube.com/watch?v=lEIGnx7qLl0",
    primaryArtist: dj("Afrojack", {
      accent: "#ff9f1c",
      homeCity: "Spijkenisse, NL",
    }),
    genre: "Big Room",
    type: "festival",
    title: "AFROJACK B2B R3HAB | Mainstage, Tomorrowland Weekend 2 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2s55dyj1/afrojack-r3hab-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_AFROJACK_R3HAB_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 0/26 timed → evenly spaced ~60m.
    video: "https://www.youtube.com/watch?v=8-J01-hcHfA",
    primaryArtist: dj("Steve Aoki", {
      accent: "#00b4d8",
      homeCity: "Miami, US",
    }),
    genre: "Electro House",
    type: "festival",
    title: "Steve Aoki WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/rwtx921/steve-aoki-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_STEVE_AOKI_TML_WE2_2026,
  },
  {
    // Tomorrowland official Friendship Mix; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=hgbAN8NFNu0",
    primaryArtist: dj("Steve Aoki", {
      accent: "#00b4d8",
      homeCity: "Miami, US",
    }),
    genre: "Electro House",
    type: "mix",
    title: "Steve Aoki - Tomorrowland Friendship Mix 2026-08-13",
    seriesName: "Tomorrowland Friendship Mix",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1x5044dt/steve-aoki-tomorrowland-friendship-mix-2026-08-13.html",
    tracklist1001: TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
  },
  {
    // 1001Tracklists Exclusive Mix; timed 1001 capture. SC mirror on
    // 1001tracklists/men-machine-exclusive-mix-2026 (same list).
    video: "https://www.youtube.com/watch?v=NTLDGnoWIRg",
    primaryArtist: dj("Men Machine", {
      accent: "#ff4d6d",
      homeCity: "Paris / Berlin",
    }),
    genre: "Bass House",
    type: "mix",
    title:
      "David Guetta & Marten Horger pres. Men Machine - 1001Tracklists Exclusive Mix 2026-06-22",
    seriesName: "1001Tracklists Exclusive Mix",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2r75jgsk/david-guetta-marten-horger-pres.-men-machine-1001tracklists-exclusive-mix-2026-06-22.html",
    tracklist1001: TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
  },
  {
    // Tomorrowland official — Mainstage WE2; 0/24 timed → evenly spaced ~60m.
    video: "https://www.youtube.com/watch?v=DAOlnMYA3nU",
    primaryArtist: dj("CYRIL", {
      accent: "#f4a261",
      homeCity: "Sydney, AU",
    }),
    genre: "Dance",
    type: "festival",
    title: "Cyril WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/l9zzj79/cyril-mainstage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_CYRIL_TML_WE2_2026,
  },
  {
    // Artist-channel full set — Mainstage WE2 solo; 1001.tl/1j3n0l69 timed capture.
    video: "https://www.youtube.com/watch?v=3o0T4z6oT4Y",
    primaryArtist: dj("Dimitri Vegas", {
      accent: "#e63946",
      homeCity: "Willebroek, BE",
    }),
    genre: "Hard Dance",
    type: "festival",
    title: "Dimitri Vegas Mainstage WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1j3n0l69/dimitri-vegas-mainstage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_DIMITRI_VEGAS_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Great Library WE2 B2B; 24/35 timed (rest lerped).
    video: "https://www.youtube.com/watch?v=OTKgBZS8if0",
    primaryArtist: dj("Dimitri Vegas", {
      accent: "#e63946",
      homeCity: "Willebroek, BE",
    }),
    genre: "Hard Dance",
    type: "festival",
    title: "Dimitri Vegas B2B Nico Moreno WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1091bm11/dimitri-vegas-nico-moreno-the-great-library-stage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Freedom Stage WE2; 16/16 timed.
    video: "https://www.youtube.com/watch?v=KVZlecHlVkg",
    primaryArtist: dj("Push", {
      accent: "#7209b7",
      homeCity: "Antwerp, BE",
    }),
    genre: "Trance",
    type: "festival",
    title: "Push only WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2c3yctl1/push-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_PUSH_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Great Library WE2.
    video: "https://www.youtube.com/watch?v=BG3Lr9EdWVY",
    primaryArtist: dj("Bassjackers", {
      accent: "#e63946",
      homeCity: "Netherlands",
    }),
    genre: "Big Room",
    type: "festival",
    title: "Bassjackers @ The Great Library Stage, Tomorrowland WE2 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1muwkg71/bassjackers-the-great-library-stage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_BASSJACKERS_TML_WE2_2026,
  },
  {
    // Tomorrowland official — Crystal Garden WE2; 15/17 timed (rest lerped).
    video: "https://www.youtube.com/watch?v=HWIratXF1Bo",
    primaryArtist: dj("Bhaskar", {
      accent: "#f77f00",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Bhaskar WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/15vvjgp1/bhaskar-crystal-garden-stage-tomorrowland-weekend-2-belgium-2026-07-26.html",
    tracklist1001: TL_BHASKAR_TML_WE2_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=ObiAocVMTyo",
    primaryArtist: dj("Odd Mob", {
      accent: "#b8f200",
      homeCity: "Brisbane, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Odd Mob at Seismic Dance Event 8.0 | Full Set (Volcano Stage)",
    eventName: "Seismic Dance Event",
  },
  {
    // Artist upload — also in @Biscits "Live Streams" playlist.
    video: "https://www.youtube.com/watch?v=l7Ytbzj7uGo",
    primaryArtist: dj("BISCITS", {
      accent: "#ef476f",
      homeCity: "UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Biscits DJ Set - EDC Vegas 2025",
    seriesName: "EDC Las Vegas",
    eventName: "EDC Las Vegas",
  },
  {
    video: "https://www.youtube.com/watch?v=FH7lIOv1s3Q",
    primaryArtist: dj("Black Coffee", {
      accent: "#222222",
      homeCity: "South Africa",
    }),
    genre: "Afro House",
    type: "festival",
    title: "BLACK COFFEE - Mayan Warrior - Burning Man 2025",
    eventName: "Burning Man",
  },
  {
    video: "https://www.youtube.com/watch?v=6VPNizjOyBQ",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce | Fresh Start SF 2026",
    eventName: "Fresh Start SF",
  },
  {
    video: "https://www.youtube.com/watch?v=AJbSD2qYmI4",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce @ Club Space | April 4 2025",
    eventName: "Club Space Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=8EocK-qw-g8",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce b2b VNSSA at Elrow",
    eventName: "Elrow",
  },
  {
    video: "https://www.youtube.com/watch?v=ubQZAmWDAxI",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce - Lollapalooza 2024 Full Set",
    eventName: "Lollapalooza",
  },
  {
    video: "https://www.youtube.com/watch?v=H8cUi1fg5rQ",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce - live from CRSSD 2024",
    eventName: "CRSSD",
  },
  {
    video: "https://www.youtube.com/watch?v=TDuFnUAo4II",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture @ Pacha New York City, Affairs (2026)",
    seriesName: "Affairs",
    eventName: "Pacha New York",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/fnw24vt/vintage-culture-pacha-nyc-united-states-2026-07-03.html",
    tracklist1001: TL_VINTAGE_CULTURE_PACHA_NYC_2026,
  },
  {
    // Artist-channel playback of the Burning Man Playground set (same 1001 as SC).
    video: "https://www.youtube.com/watch?v=SeKRNa26kug",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture b2b Arodes at Burning Man 2024, Black Rock City",
    eventName: "Burning Man Playground",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/20s910xk/vintage-culture-arodes-playground-burning-man-united-states-2024-08-31.html",
    tracklist1001: TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
  },
  {
    // Artist-channel playback of the Opulent Temple set (same 1001 as SC).
    video: "https://www.youtube.com/watch?v=k4Drn6AwAdk",
    primaryArtist: dj("Max Styler", {
      accent: "#ff9f1c",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Max Styler @ Opulent Temple, Burning Man 2024",
    eventName: "Opulent Temple, Burning Man",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2tx1742t/max-styler-opulent-temple-burning-man-united-states-2024-08-30.html",
    tracklist1001: TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
  },
  {
    // Artist-channel playback of the Creamfields North set (same 1001 as SC).
    video: "https://www.youtube.com/watch?v=arowbYnNFGY",
    primaryArtist: dj("Hannah Laing", {
      accent: "#ff006e",
    }),
    genre: "Techno",
    type: "festival",
    title: "Hannah Laing @ Zenless Zone Zero, Creamfields North 2024",
    eventName: "Creamfields North",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/18k472y9/hannah-laing-zenless-zone-zero-creamfields-north-united-kingdom-2024-08-25.html",
    tracklist1001: TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
  },
  {
    // Artist-channel playback of the Tomorrowland WE1 Daybreak Session (same 1001 as SC).
    video: "https://www.youtube.com/watch?v=wuMQeEJ3YnQ",
    primaryArtist: dj("Oliver Heldens", {
      accent: "#7c5cff",
      homeCity: "Netherlands",
    }),
    genre: "Future House",
    type: "festival",
    title:
      "Oliver Heldens - Daybreak Session @ Tomorrowland Weekend 1 2024",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/25du2utt/oliver-heldens-mainstage-daybreak-session-tomorrowland-weekend-1-belgium-2024-07-19.html",
    tracklist1001: TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
  },
  {
    video: "https://www.youtube.com/watch?v=OVex0rm7ZR4",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture @ Pacha Ibiza, Affairs (2026)",
    seriesName: "Affairs",
    eventName: "Pacha Ibiza",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2vw827m1/vintage-culture-affairs-pacha-ibiza-spain-2026-06-23.html",
    tracklist1001: TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=pnzSuCiAGdk",
    primaryArtist: dj("Calvin Harris", {
      accent: "#ff9f1c",
      homeCity: "Scotland, UK",
    }),
    genre: "House",
    type: "festival",
    title: "Calvin Harris @ Mainstage, Dance Valley 2026",
    eventName: "Dance Valley",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2pcuzd49/calvin-harris-mainstage-dance-valley-netherlands-2026-08-08.html",
    tracklist1001: TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
  },
  {
    // Official Parookaville channel — 1001TL timed list (2026-08-16 capture).
    video: "https://www.youtube.com/watch?v=JhpL-KKGoO8",
    primaryArtist: dj("TUJAMO", {
      accent: "#f4a261",
      homeCity: "Germany",
    }),
    genre: "Big Room",
    type: "festival",
    title: "TUJAMO @ Mainstage, Parookaville 2026",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2r7bnnpk/tujamo-mainstage-parookaville-germany-2026-07-19.html",
    tracklist1001: TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  },
  {
    // Official Parookaville channel — B2B; title drives collaborator parse.
    video: "https://www.youtube.com/watch?v=IwNPc_4ux84",
    primaryArtist: dj("Dillon Francis", {
      accent: "#ff4d6d",
      homeCity: "Los Angeles, CA",
    }),
    genre: "Bass House",
    type: "festival",
    title: "Dillon Francis B2B Marten Horger | Parookaville 2025 Mainstage",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2gsy0kp1/dillon-francis-marten-horger-mainstage-parookaville-germany-2025-07-20.html",
    tracklist1001:
      TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
  },
  {
    // Official Parookaville channel — Time Lab 2026-07-19.
    video: "https://www.youtube.com/watch?v=XisbmW1Smgc",
    primaryArtist: dj("Mike Williams", { accent: "#e9c46a" }),
    genre: "Future House",
    type: "festival",
    title: "Mike Williams | Time Lab, Parookaville 2026",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1muxp6s1/mike-williams-time-lab-parookaville-germany-2026-07-19.html",
    tracklist1001: TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
  },
  {
    // Hardwell official — Parookaville Mainstage 2026-07-19.
    video: "https://www.youtube.com/watch?v=eBeeWwsCVls",
    primaryArtist: dj("Hardwell", {
      accent: "#023e8a",
      homeCity: "Breda, NL",
    }),
    genre: "Big Room",
    type: "festival",
    title: "Hardwell | Mainstage, Parookaville 2026",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/kd4zp61/hardwell-mainstage-parookaville-germany-2026-07-19.html",
    tracklist1001: TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  },
  {
    // Official Parookaville channel — Mainstage 2026-07-19.
    video: "https://www.youtube.com/watch?v=UETk8HSB0Yw",
    primaryArtist: dj("DubVision", { accent: "#4361ee" }),
    genre: "Progressive House",
    type: "festival",
    title: "DubVision | Mainstage, Parookaville 2026",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/uq5pqjt/dubvision-mainstage-parookaville-germany-2026-07-19.html",
    tracklist1001: TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  },
  {
    // W&W official — Parookaville Mainstage 2026-07-18.
    video: "https://www.youtube.com/watch?v=or_SDolEBfw",
    primaryArtist: dj("W&W", {
      accent: "#00b4d8",
      homeCity: "Netherlands",
    }),
    genre: "Big Room",
    type: "festival",
    title: "W&W | Mainstage, Parookaville 2026",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1j3n03kk/wandw-mainstage-parookaville-germany-2026-07-18.html",
    tracklist1001: TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
  },
  {
    // Tomorrowland official — Atmosphere WE1 B2B; title drives collaborator parse.
    video: "https://www.youtube.com/watch?v=J7b0G4XX8pg",
    primaryArtist: dj("MANDY", {
      accent: "#ff006e",
      homeCity: "Belgium",
    }),
    genre: "Hard Dance",
    type: "festival",
    title: "MANDY B2B NEGITIV | Atmosphere Stage, Tomorrowland Weekend 1 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/23phk9t9/mandy-negativ-atmosphere-stage-tomorrowland-weekend-1-belgium-2026-07-17.html",
    tracklist1001:
      TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
  },
  {
    // Official Mike Williams upload — B2B; title drives collaborator parse.
    video: "https://www.youtube.com/watch?v=B1EaMgsf84Q",
    primaryArtist: dj("Lucas & Steve", {
      accent: "#ffb703",
      homeCity: "Maastricht, NL",
    }),
    genre: "Future House",
    type: "festival",
    title:
      "Lucas & Steve B2B Mike Williams | Don't Let Daddy Know, Ziggo Dome 2026",
    seriesName: "Don't Let Daddy Know",
    eventName: "Don't Let Daddy Know",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/trluwg9/lucas-steve-mike-williams-dont-let-daddy-know-ziggo-dome-amsterdam-netherlands-2026-03-07.html",
    tracklist1001:
      TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
  },
  {
    // Tomorrowland official — Atmosphere WE1 2023. Distinct from
    // yt-xUdcEDryN8o (Awakenings Festival 2025).
    video: "https://www.youtube.com/watch?v=yPCOu0-JKJo",
    primaryArtist: dj("Indira Paganotto", {
      accent: "#ff006e",
    }),
    genre: "Hard Techno",
    type: "festival",
    title: "Indira Paganotto | Atmosphere Stage, Tomorrowland Weekend 1 2023",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1gzmsd19/indira-paganotto-atmosphere-stage-tomorrowland-weekend-1-belgium-2023-07-22.html",
    tracklist1001:
      TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
  },
  {
    video: "https://www.youtube.com/watch?v=6bJZPDKlq7o",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture @ Sunset Yacht Party - New York City 2023",
    eventName: "Sunset Yacht Party",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1d6g4y99/vintage-culture-sunset-yacht-party-new-york-city-united-states-2023-08-12.html",
    tracklist1001: TL_VINTAGE_CULTURE_NYC_YACHT_2023,
  },
  {
    video: "https://www.youtube.com/watch?v=xXRjglkAmq8",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title:
      "Vintage Culture @ Ultra Music Festival Miami 2026 - Resistance Megastructure",
    seriesName: "Ultra Shows",
    eventName: "Ultra Music Festival",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/23nu9rq9/vintage-culture-resistance-megastructure-ultra-music-festival-miami-united-states-2026-03-27.html",
    tracklist1001: TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
  },
  {
    // Official Joris Voorn B2B Korolova Resistance The Cove. Same list as
    // sc-korolovadj-joris-voorn-b2b-korolova-live. Mixcloud UMF Radio 883
    // is a mirror only. Distinct from Vintage Culture Resistance Megastructure.
    video: "https://youtu.be/FQj71mhobYw",
    primaryArtist: dj("Joris Voorn", {
      accent: "#2ec4b6",
      homeCity: "Rotterdam, NL",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title:
      "Joris Voorn B2B Korolova LIVE @ ULTRA MUSIC FESTIVAL MIAMI 2026 | RESISTANCE THE COVE",
    seriesName: "Resistance",
    eventName: "Ultra Music Festival",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/16sym4c1/joris-voorn-korolova-resistance-the-cove-ultra-music-festival-miami-united-states-2026-03-28.html",
    tracklist1001: TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=knJyJPP45dg",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture Live at EDC Las Vegas, Neon Garden (Club Space)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/295sbvjt/vintage-culture-neongarden-edc-las-vegas-united-states-2025-05-17.html",
    tracklist1001: TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
  },
  {
    video: "https://www.youtube.com/watch?v=kmMYCg-igjc",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture live @ Só Track Boa Festival, Brasil 2026",
    eventName: "Só Track Boa",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1j3fbbr9/vintage-culture-nsd-mainstage-so-track-boa-festival-brazil-2026-06-06.html",
    tracklist1001: TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=jnSFLztjm80",
    primaryArtist: dj("Bleu Clair", {
      accent: "#4cc9f0",
      homeCity: "Indonesia",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Bleu Clair at Tomorrowland, Belgium 2023",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=c_sx3zum8Z0",
    primaryArtist: dj("Bleu Clair", {
      accent: "#4cc9f0",
      homeCity: "Indonesia",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Bleu Clair live from EDC Las Vegas 2023",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/283zdwmt/bleu-clair-stereobloom-edc-las-vegas-united-states-2023-05-19.html",
    tracklist1001: TL_BLEU_CLAIR_EDC_LV_2023,
  },
  {
    video: "https://www.youtube.com/watch?v=_hdM8uJV1LM",
    primaryArtist: dj("Bleu Clair", {
      accent: "#4cc9f0",
      homeCity: "Indonesia",
    }),
    genre: "Tech House",
    type: "radio",
    title: "Bleu Clair presents BLEUPRINT VOL. 5 (Live from Jakarta)",
    seriesName: "BLEUPRINT",
  },
  // ---- DJ Mag Top 100: at least one set for chart DJs still at 0 ----
  {
    video: "https://www.youtube.com/watch?v=1TN78OJjJT0",
    primaryArtist: dj("Anyma", {
      accent: "#7b2cbf"
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Anyma b2b Solomun — Ultra Music Festival Miami 2025",
    eventName: "Ultra Music Festival Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=nKHpbiYCtDQ",
    primaryArtist: dj("Peggy Gou", {
      accent: "#e63946"
    }),
    genre: "House",
    type: "festival",
    title: "Peggy Gou | Boiler Room x Dekmantel Festival: Amsterdam",
    seriesName: "Boiler Room",
    eventName: "Dekmantel Festival",
  },
  {
    // Official Cercle (2018) — 1001 seed captured 2026-08-13.
    video: "https://www.youtube.com/watch?v=-UOMvxh4MYU",
    primaryArtist: dj("Peggy Gou", { accent: "#e63946" }),
    genre: "House",
    type: "festival",
    title: "Peggy Gou at Palais des Beaux-Arts, Lille for Cercle",
    seriesName: "Cercle",
    eventName: "Palais des Beaux-Arts Lille",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/260tzmnk/peggy-gou-palais-des-beaux-arts-lille-france-cercle-2018-12-03.html",
    tracklist1001: TL_PEGGY_GOU_CERCLE_LILLE,
  },
  {
    // Official Coachella upload — timed tracklist in the description (17 tracks,
    // provenance youtube). Stylized as ¥ØU$UK€ ¥UK1MAT$U.
    video: "https://www.youtube.com/watch?v=IP9v-2nEA2E",
    primaryArtist: dj("Yousuke Yukimatsu", { accent: "#e76f51" }),
    genre: "Electronic",
    type: "festival",
    title: "Yousuke Yukimatsu - Coachella 2026 (Full Set - Weekend 2)",
    seriesName: "Coachella",
    eventName: "Coachella",
  },
  {
    // Official Coachella playback — Sahara WE2; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=vpf4LLy42Zc",
    primaryArtist: dj("Marlon Hoffstadt", {
      accent: "#c77dff",
      homeCity: "Berlin, DE",
    }),
    genre: "Hard Dance",
    type: "festival",
    title: "Marlon Hoffstadt Sahara WE2 | Coachella 2026",
    seriesName: "Coachella",
    eventName: "Coachella",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1lwj1r59/marlon-hoffstadt-sahara-coachella-festival-weekend-2-united-states-2026-04-17.html",
    tracklist1001: TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
  },
  {
    // Circuit Grounds 2026 — third-party YT (Joseph Montano); 1001 captured.
    video: "https://www.youtube.com/watch?v=CMhFNEo0glw",
    primaryArtist: dj("Peggy Gou", { accent: "#e63946" }),
    genre: "House",
    type: "festival",
    title: "Peggy Gou Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/yf1fdtk/peggy-gou-kislashki-circuitgrounds-edc-las-vegas-united-states-2026-05-16.html",
    tracklist1001: TL_PEGGY_GOU_EDC_LV_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=uqf0mOngpIk",
    primaryArtist: dj("FISHER", {
      accent: "#00c2ff",
      homeCity: "Australia"
    }),
    genre: "Tech House",
    type: "festival",
    title: "FISHER — EDC Orlando 2024",
    eventName: "EDC Orlando",
  },
  {
    video: "https://www.youtube.com/watch?v=kttWNVHJKDo",
    primaryArtist: dj("Alok", {
      accent: "#ff6b35",
      homeCity: "Brazil"
    }),
    genre: "House",
    type: "festival",
    title: "Alok presents Something Else | Tomorrowland Winter 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Winter",
  },
  {
    // Official Timmy Trumpet upload (Ultra Miami 2023 Mainstage).
    video: "https://www.youtube.com/watch?v=FxEJhxdRi4Q",
    primaryArtist: dj("Timmy Trumpet", {
      accent: "#ffba08",
      homeCity: "Australia"
    }),
    genre: "Big Room",
    type: "festival",
    title: "Timmy Trumpet LIVE @ Ultra Music Festival Miami 2023",
    eventName: "Ultra Music Festival Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=c0-hvjV2A5Y",
    primaryArtist: dj("Fred again..", {
      accent: "#9ef01a",
      homeCity: "London, UK",
    }),
    genre: "UK Garage",
    type: "festival",
    title: "Fred again.. | Boiler Room: London",
    seriesName: "Boiler Room",
    eventName: "Boiler Room London",
  },
  {
    video: "https://www.youtube.com/watch?v=vy-k0FopsmY",
    primaryArtist: dj("Carl Cox", {
      accent: "#e63946",
      homeCity: "Barbados / UK"
    }),
    genre: "Techno",
    type: "festival",
    title: "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set",
    seriesName: "Boiler Room",
    eventName: "Ibiza Villa Takeovers",
  },
  {
    // Operator-supplied official channel upload (Rave Culture Live 002).
    video: "https://www.youtube.com/watch?v=qjoM5D4cwNs",
    primaryArtist: dj("W&W", {
      accent: "#00b4d8",
      homeCity: "Netherlands"
    }),
    genre: "Big Room",
    type: "radio",
    title: "W&W - Rave Culture Live 002 (DJ Set)",
    seriesName: "Rave Culture Live",
  },
  // Operator-supplied Top 100 gap fills (oEmbed-validated full sets only).
  {
    video: "https://www.youtube.com/watch?v=OD5LawM8ONk",
    primaryArtist: dj("Tiësto", {
      accent: "#00bbf9",
      homeCity: "Netherlands"
    }),
    genre: "Big Room",
    type: "festival",
    title: "Tiësto - Dreamstate 2025 (Full Set)",
    eventName: "Dreamstate",
  },
  {
    video: "https://www.youtube.com/watch?v=i-mFuxbGHzg",
    primaryArtist: dj("Reinier Zonneveld", {
      accent: "#ff006e"
    }),
    genre: "Techno",
    type: "festival",
    title: "Reinier Zonneveld | Awakenings Festival 2025",
    seriesName: "Awakenings",
    eventName: "Awakenings Festival",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/hgdfs3t/reinier-zonneveld-area-v-awakenings-festival-netherlands-2025-07-11.html",
    tracklist1001: TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
  },
  {
    // Official DJ Mag playback; 1001 captured 2026-08-16.
    video: "https://www.youtube.com/watch?v=soEFl73peVA",
    primaryArtist: dj("Joel Corry", {
      accent: "#4cc9f0",
    }),
    genre: "House",
    type: "festival",
    title: "Joel Corry Epic Rooftop Set From Edge NYC",
    eventName: "Edge New York City",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1nsmcmx9/joel-corry-edge-new-york-city-united-states-2026-05-30.html",
    tracklist1001: TL_JOEL_CORRY_EDGE_NYC_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=b-2YA4yC3UA",
    primaryArtist: dj("Claptone", {
      accent: "#ffd60a"
    }),
    genre: "Deep House",
    type: "festival",
    title: "Claptone ‘The Masquerade’ Full Set at Movistar Arena, Buenos Aires",
    eventName: "Movistar Arena Buenos Aires",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2cu77g71/claptone-the-masquerade-buenos-aires-argentina-2022-11-05.html",
    tracklist1001: TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  },
  {
    video: "https://www.youtube.com/watch?v=fQweMs-Q3rg",
    primaryArtist: dj("Claptone", {
      accent: "#ffd60a",
    }),
    genre: "Deep House",
    type: "festival",
    title: "Claptone @ The Masquerade, Buenos Aires 2022",
    seriesName: "The Masquerade",
    eventName: "The Masquerade Buenos Aires",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2cu77g71/claptone-the-masquerade-buenos-aires-argentina-2022-11-05.html",
    tracklist1001: TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
  },
  {
    video: "https://www.youtube.com/watch?v=OzGpEPZ3BZs",
    primaryArtist: dj("Vini Vici", {
      accent: "#9b5de5"
    }),
    genre: "Psytrance",
    type: "festival",
    title: "Vini Vici — Transmission Poland 2022: Behind The Mask",
    seriesName: "Transmission",
    eventName: "Transmission Poland",
  },
  {
    // Official Awakenings playback — Area V 2025-07-11. Distinct from
    // yt-yPCOu0-JKJo (Atmosphere TML WE1 2023) and yt-i-mFuxbGHzg
    // (Reinier Zonneveld, same stage/day).
    video: "https://www.youtube.com/watch?v=xUdcEDryN8o",
    primaryArtist: dj("Indira Paganotto", {
      accent: "#ff006e"
    }),
    genre: "Hard Techno",
    type: "festival",
    title: "Indira Paganotto | Awakenings Festival 2025",
    seriesName: "Awakenings",
    eventName: "Awakenings Festival",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/27bmn1uk/indira-paganotto-area-v-awakenings-festival-netherlands-2025-07-11.html",
    tracklist1001: TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
  },
  {
    // Official Tomorrowland upload — oEmbed-validated festival set.
    video: "https://www.youtube.com/watch?v=IG19Jo7NxnQ",
    primaryArtist: dj("Quintino", {
      accent: "#ff9f1c",
      homeCity: "Netherlands"
    }),
    genre: "Big Room",
    type: "festival",
    title: "Quintino | Tomorrowland 2022 - WE1",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  // Operator Top 100 gap fills — oEmbed-validated full sets (#16/#24/#27/#28/#31).
  {
    video: "https://www.youtube.com/watch?v=kHJw97ZojrY",
    primaryArtist: dj("Calvin Harris", {
      accent: "#ff9f1c",
      homeCity: "Scotland, UK"
    }),
    genre: "House",
    type: "festival",
    title: "Calvin Harris - Full Set (Live at Capital's Summertime Ball 2023)",
    eventName: "Capital's Summertime Ball",
  },
  {
    video: "https://www.youtube.com/watch?v=xVWs0ti0J90",
    primaryArtist: dj("Alan Walker", {
      accent: "#56cfe1"
    }),
    genre: "Future Bass",
    type: "festival",
    title: "Alan Walker | Tomorrowland Belgium 2018",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1uurlz51/alan-walker-main-stage-tomorrowland-weekend-1-belgium-2018-07-20.html",
    tracklist1001: TL_ALAN_WALKER_TML_WE1_2018,
  },
  {
    video: "https://www.youtube.com/watch?v=U2ZjW_8K3h4",
    primaryArtist: dj("Jamie Jones", {
      accent: "#f72585"
    }),
    genre: "Tech House",
    type: "festival",
    title: "Jamie Jones DJ set - Lost Horizon Festival | Beatport Live",
    seriesName: "Beatport Live",
    eventName: "Lost Horizon Festival",
    // Official Beatport Live upload already curated. Operator 1001 paste
    // 2026-08-19. No SoundCloud in the paste — do not invent an SC slug.
    // Distinct from Hot Robot Radio 225 / 239.
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/29ty8h89/jamie-jones-gas-tower-lost-horizon-festival-beatport-live-2020-07-04.html",
    tracklist1001: TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020,
  },
  {
    video: "https://www.youtube.com/watch?v=y3I-vaIIo9Y",
    primaryArtist: dj("R3hab", {
      accent: "#ffbe0b"
    }),
    genre: "Big Room",
    type: "festival",
    title: "R3HAB LIVE @ TOMORROWLAND 2025 (WE2)",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=oGS0A_R9tag",
    primaryArtist: dj("Skrillex", {
      accent: "#80ffdb"
    }),
    genre: "Dubstep",
    type: "festival",
    title: "SKRILLEX LIVE @ LOLLAPALOOZA CHILE 2026 (Full Set HD)",
    eventName: "Lollapalooza Chile",
    // Different upload from the operator 1001 paste (yt-loD-whuR5zc).
    // Do not attach that list or merge sourceSlugs.
  },
  {
    // Official operator paste 2026-08-19. No SoundCloud in the paste —
    // do not invent an SC slug. Never yt-oGS0A_R9tag (different Chile upload).
    video: "https://youtu.be/loD-whuR5zc",
    primaryArtist: dj("Skrillex", { accent: "#80ffdb" }),
    genre: "Dubstep",
    type: "festival",
    title: "Skrillex @ Banco de Chile Stage, Lollapalooza Chile 2026-03-15",
    eventName: "Lollapalooza Chile",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-banco-de-chile-stage-lollapalooza-chile-2026-03-15.html",
    tracklist1001: TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026,
  },
  // Top 100 gap fills — oEmbed + YouTube Data API duration-validated (≥~30m).
  // Prefer official Tomorrowland / artist / Boiler Room / Cercle / ASOT uploads.
  {
    video: "https://www.youtube.com/watch?v=deDFAmOPYkQ",
    primaryArtist: dj("Marshmello", { accent: "#e9ecef" }),
    genre: "Future Bass",
    type: "festival",
    title: "MARSHMELLO LIVE @ ULTRA MUSIC FESTIVAL MIAMI 2023",
    eventName: "Ultra Music Festival Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=1N1Drg_ViE4",
    primaryArtist: dj("The Martinez Brothers", { accent: "#f4a261" }),
    genre: "House",
    type: "festival",
    title: "The Martinez Brothers Boiler Room NYC DJ Set",
    seriesName: "Boiler Room",
    eventName: "Boiler Room NYC",
  },
  {
    video: "https://www.youtube.com/watch?v=TT32mIg4oqg",
    primaryArtist: dj("Zedd", { accent: "#4cc9f0" }),
    genre: "Electro House",
    type: "festival",
    title: "ZEDD LIVE @ ULTRA MUSIC FESTIVAL MIAMI (2025)",
    eventName: "Ultra Music Festival Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=N8i1hf1S6ow",
    primaryArtist: dj("Bassjackers", { accent: "#e63946" }),
    genre: "Big Room",
    type: "festival",
    title: "Bassjackers WE2 | Tomorrowland 2024",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=g7iwugdhkzw",
    primaryArtist: dj("Michael Bibi", { accent: "#ff006e" }),
    genre: "Tech House",
    type: "festival",
    title: "Michael Bibi - Live @ Solid Grooves DC10 Closing 2023",
    eventName: "Solid Grooves DC10 Closing",
  },
  {
    video: "https://www.youtube.com/watch?v=DCGKemPaScw",
    primaryArtist: dj("Boris Brejcha", { accent: "#ff006e" }),
    genre: "Techno",
    type: "festival",
    title: "Boris Brejcha WE2 | Tomorrowland 2024",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    // Official Tomorrowland Relive — Mainstage WE1; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=NpL_bT5vgmU",
    primaryArtist: dj("Boris Brejcha", { accent: "#ff006e" }),
    genre: "Techno",
    type: "festival",
    title: "Boris Brejcha Mainstage WE1 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/yfd6329/boris-brejcha-mainstage-tomorrowland-weekend-1-belgium-2026-07-18.html",
    tracklist1001: TL_BORIS_BREJCHA_TML_WE1_2026,
  },
  {
    // Official Tomorrowland Relive — Freedom WE2; timed 1001 capture.
    video: "https://www.youtube.com/watch?v=g4vR2VlhNtk",
    primaryArtist: dj("Sebastian Ingrosso", { accent: "#4361ee" }),
    genre: "Progressive House",
    type: "festival",
    title: "Sebastian Ingrosso WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1407jy99/sebastian-ingrosso-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_SEBASTIAN_INGROSSO_TML_WE2_2026,
  },
  {
    // BIORHYTHM @ Freedom Stage TML WE1; timed 1001 capture.
    // Distinct from Miss Monique Mainstage WE2 (yt + TL_MISS_MONIQUE_TML_WE2_2026).
    video: "https://www.youtube.com/watch?v=1LpQZ5GTRDg",
    primaryArtist: dj("Miss Monique", { accent: "#9b5de5" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Miss Monique · BIORHYTHM Freedom WE1 | Tomorrowland 2026",
    seriesName: "BIORHYTHM",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/l9y8bm9/miss-monique-biorhythm-freedom-stage-tomorrowland-weekend-1-belgium-2026-07-17.html",
    tracklist1001: TL_MISS_MONIQUE_BIORHYTHM,
  },
  {
    // Bud Light Stage Chicago; 1001 captured 2026-08-13.
    video: "https://www.youtube.com/watch?v=9TKqqBCmDHA",
    primaryArtist: dj("John Summit", { accent: "#4cc9f0" }),
    genre: "Tech House",
    type: "festival",
    title: "John Summit · Lollapalooza Chicago 2026",
    eventName: "Lollapalooza",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/dr6kbf9/john-summit-bud-light-stage-lollapalooza-united-states-chicago-2026-07-30.html",
    tracklist1001: TL_JOHN_SUMMIT_LOLLAPALOOZA,
  },
  {
    // Official NOTION Perry's Lollapalooza; timed 1001 capture. SC twin:
    // sc-notiondj-notion-live-at-lollapalooza.
    video: "https://www.youtube.com/watch?v=9vgSTomhCp8",
    primaryArtist: dj("NOTION", {
      accent: "#ff006e",
      homeCity: "London, UK",
    }),
    genre: "UK Garage",
    type: "festival",
    title: "NOTION @ Perry's, Lollapalooza Chicago 2026",
    eventName: "Lollapalooza",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/27dsqm49/notion-perrys-lollapalooza-united-states-chicago-2026-07-31.html",
    tracklist1001: TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=NqX1Fn6MBf0",
    primaryArtist: dj("HUGEL", { accent: "#06d6a0" }),
    genre: "Melodic House",
    type: "festival",
    title: "Hugel WE2 | Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    // Artist upload — Resistance Megastructure Ultra Miami 2026; 1001.tl/qy9yyy9 timed.
    video: "https://www.youtube.com/watch?v=hU-z3iV0LOg",
    primaryArtist: dj("Eric Prydz", {
      accent: "#7209b7",
      homeCity: "Sweden",
    }),
    genre: "Progressive House",
    type: "festival",
    title: "Eric Prydz Live @ Ultra Music Festival Miami 2026",
    eventName: "Ultra Music Festival",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/qy9yyy9/eric-prydz-resistance-megastructure-ultra-music-festival-miami-united-states-2026-03-27.html",
    tracklist1001: TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=zmLIxKpgEPw",
    primaryArtist: dj("Nora En Pure", { accent: "#48cae4" }),
    genre: "Deep House",
    type: "festival",
    title: "Nora En Pure @ Ultra Miami Mainstage 2024",
    eventName: "Ultra Music Festival Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=2epkmP-_tOg",
    primaryArtist: dj("ATB", { accent: "#0077b6" }),
    genre: "Trance",
    type: "festival",
    title: "ATB | UNTOLD 2022 (Main Stage)",
    eventName: "UNTOLD Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=yEbrvMljMCg",
    primaryArtist: dj("Deborah De Luca", { accent: "#c9184a" }),
    genre: "Techno",
    type: "festival",
    title: "Deborah de Luca @ Château de Chambord in France for Cercle",
    seriesName: "Cercle",
    eventName: "Château de Chambord",
  },
  {
    video: "https://www.youtube.com/watch?v=OI02QgEA1Zw",
    primaryArtist: dj("Above & Beyond", { accent: "#7209b7" }),
    genre: "Trance",
    type: "festival",
    title: "Above & Beyond: Live from EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
  },
  {
    video: "https://www.youtube.com/watch?v=HWwmfWovTeI",
    primaryArtist: dj("Nervo", { accent: "#f72585" }),
    genre: "Progressive House",
    type: "festival",
    title: "Nervo WE1 | Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=3qdh31UZXtc",
    primaryArtist: dj("Sub Zero Project", { accent: "#3a0ca3" }),
    genre: "Hardstyle",
    type: "festival",
    title: "Sub Zero Project LIVE WE2 | Tomorrowland 2024",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=GbG_OFmdPKk",
    primaryArtist: dj("Lucas & Steve", { accent: "#ffb703" }),
    genre: "Future House",
    type: "festival",
    title: "Lucas & Steve WE2 | Tomorrowland 2024",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1t9g49st/lucas-steve-the-library-stage-tomorrowland-weekend-2-belgium-2024-07-26.html",
    tracklist1001: TL_LUCAS_STEVE_TML_WE2_2024,
  },
  {
    video: "https://www.youtube.com/watch?v=lopIWBJ0T5I",
    primaryArtist: dj("GORDO", { accent: "#fb8500" }),
    genre: "Tech House",
    type: "festival",
    title: "GORDO | Tomorrowland 2023",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1hxfpsk9/gordo-freedom-stage-tomorrowland-weekend-2-belgium-2023-07-30.html",
    tracklist1001: TL_GORDO_TML_WE2_2023,
  },
  {
    video: "https://www.youtube.com/watch?v=A5ERobJaS_0",
    primaryArtist: dj("The Chainsmokers", { accent: "#4cc9f0" }),
    genre: "Future Bass",
    type: "festival",
    title: "The Chainsmokers - Live @ Ultra Melbourne 2026",
    eventName: "Ultra Melbourne",
  },
  {
    // Artist-channel playback (@Liumusic). No 1001Tracklists URL in the
    // description — do not invent one. Capture if a 1001 page appears.
    video: "https://www.youtube.com/watch?v=DWPSLZLKslg",
    primaryArtist: dj("Liu", { accent: "#2a9d8f", homeCity: "Brazil" }),
    genre: "Brazilian Bass",
    type: "festival",
    title: "Liu @ Tomorrowland Belgium",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=WnjXXOZ8Te8",
    primaryArtist: dj("Mike Williams", { accent: "#e9c46a" }),
    genre: "Future House",
    type: "festival",
    title: "Mike Williams WE2 | Tomorrowland 2026",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/132ft5h9/mike-williams-mainstage-tomorrowland-weekend-2-belgium-2026-07-25.html",
    tracklist1001: TL_MIKE_WILLIAMS_TML_WE2_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=4G2QlSLG0tI",
    primaryArtist: dj("KAAZE", { accent: "#9b5de5" }),
    genre: "Progressive House",
    type: "festival",
    title: "KAAZE LIVE @ BEATS FOR LOVE 2025",
    eventName: "Beats for Love",
  },
  {
    video: "https://www.youtube.com/watch?v=QQOl66Wta4o",
    primaryArtist: dj("Burak Yeter", { accent: "#e76f51" }),
    genre: "Deep House",
    type: "festival",
    title: "EXIT 2023 | Burak Yeter live @ Gorki List Main Stage FULL SHOW",
    eventName: "EXIT Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=TqPks3DH7yM",
    primaryArtist: dj("Le Twins", { accent: "#8338ec" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Le Twins | Live DJ Set at Porqué No Festival | Tulum DJ Academy",
    eventName: "Porqué No Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=8CT6HxYA0cg",
    primaryArtist: dj("I Hate Models", { accent: "#212529" }),
    genre: "Techno",
    type: "festival",
    title: "I Hate Models | Boiler Room x Teletech Festival 2024",
    seriesName: "Boiler Room",
    eventName: "Teletech Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=krGRH4LNuYU",
    primaryArtist: dj("Marnik", { accent: "#ff006e" }),
    genre: "Big Room",
    type: "festival",
    title: "MARNIK live at SIAM Songkran Music Festival 2023 | Full Set",
    eventName: "SIAM Songkran Music Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=42XFNGZrpaQ",
    primaryArtist: dj("Chris Stussy", { accent: "#118ab2" }),
    genre: "Tech House",
    type: "festival",
    title: "Chris Stussy | Boiler Room: Edinburgh",
    seriesName: "Boiler Room",
    eventName: "Boiler Room Edinburgh",
    // Official Boiler Room upload already curated. Operator 1001 paste
    // 2026-08-19. 1001 title spells Stassy; catalog DJ is Chris Stussy.
    // No SoundCloud in the paste — do not invent an SC slug.
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2787514k/chris-stassy-boiler-room-edinburgh-united-kingdom-2024-05-19.html",
    tracklist1001: TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024,
  },
  {
    video: "https://www.youtube.com/watch?v=5LqJCIi6p7Y",
    primaryArtist: dj("deadmau5", { accent: "#00f5d4" }),
    genre: "Progressive House",
    type: "festival",
    title: "deadmau5 Live @ VELD Music Festival 2025 Toronto, Canada",
    eventName: "VELD Music Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=PT_IBAfbPo8",
    primaryArtist: dj("WUKONG", { accent: "#ffd60a" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "WUKONG LIVE @ EDC THAILAND, 2026 (circuitGROUNDS)",
    eventName: "EDC Thailand",
  },
  {
    video: "https://www.youtube.com/watch?v=c0At1i27AHQ",
    primaryArtist: dj("Fedde Le Grand", { accent: "#ef476f" }),
    genre: "Electro House",
    type: "festival",
    title: "Fedde Le Grand WE1 | Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    // Official Nature One channel — prior id apu-wnvlrqs is dead/unavailable.
    video: "https://www.youtube.com/watch?v=dEX8Y8Mzkok",
    primaryArtist: dj("Plastik Funk", { accent: "#06d6a0" }),
    genre: "House",
    type: "festival",
    title: "Plastik Funk at NATURE ONE 2025",
    seriesName: "Nature One",
    eventName: "Nature One",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1v75qbbt/plastik-funk-open-air-floor-nature-one-germany-2025-08-01.html",
    tracklist1001: TL_PLASTIK_FUNK_NATURE_ONE_2025,
  },
  // --- Zürich Street Parade (ARTE Concert official full sets) ---
  {
    video: "https://www.youtube.com/watch?v=S5qAspu0AbI",
    primaryArtist: dj("Kevin de Vries", { accent: "#4cc9f0" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Kevin de Vries - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
  },
  {
    video: "https://www.youtube.com/watch?v=pLldXE5OyCM",
    primaryArtist: dj("Kölsch", { accent: "#00b4d8" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Kölsch - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
  },
  {
    video: "https://www.youtube.com/watch?v=7cK7rhYXbh8",
    primaryArtist: dj("Deborah de Luca", { accent: "#c9184a" }),
    genre: "Techno",
    type: "festival",
    title: "Deborah de Luca - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
  },
  {
    video: "https://www.youtube.com/watch?v=fYM9DlFLwKw",
    primaryArtist: dj("Massano", { accent: "#8338ec" }),
    genre: "Melodic Techno",
    type: "festival",
    title: "Massano - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
  },
  {
    video: "https://www.youtube.com/watch?v=LpFxQmtEeAA",
    primaryArtist: dj("Pan-Pot", { accent: "#212529" }),
    genre: "Techno",
    type: "festival",
    title: "PAN-POT - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1sftnn01/pan-pot-opera-stage-street-parade-zurich-switzerland-2025-08-09.html",
    tracklist1001: TL_PAN_POT_STREET_PARADE_2025,
  },
  {
    video: "https://www.youtube.com/watch?v=WTN5ru2ceRE",
    primaryArtist: dj("HoneyLuv", { accent: "#ff006e" }),
    genre: "Tech House",
    type: "festival",
    title: "HoneyLuv - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/2ncvv7l1/honeyluv-center-stage-street-parade-zurich-switzerland-2025-08-09.html",
    tracklist1001: TL_HONEYLUV_STREET_PARADE_2025,
  },
  {
    // Official ANTS / Ushuaïa upload; 1001 captured 2026-08-13.
    video: "https://www.youtube.com/watch?v=sLtNC21myWM",
    primaryArtist: dj("HoneyLuv", { accent: "#ff006e" }),
    genre: "Tech House",
    type: "festival",
    title: "HoneyLuv @ ANTS Ushuaïa Ibiza 2026-06-17",
    seriesName: "ANTS",
    eventName: "Ushuaïa Ibiza",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/9xkrf91/honeyluv-ants-ushuaia-ibiza-spain-2026-06-17.html",
    tracklist1001: TL_HONEYLUV_ANTS_USHUAIA_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=tuqAdrbkYZk",
    primaryArtist: dj("Adiel", { accent: "#fb8500" }),
    genre: "Techno",
    type: "festival",
    title: "Adiel - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
  },
  {
    video: "https://www.youtube.com/watch?v=1Mp9Pl6YgDM",
    primaryArtist: dj("Zamna Soundsystem", { accent: "#2a9d8f" }),
    genre: "Techno",
    type: "festival",
    title: "Zamna Soundsystem - Zurich Street Parade 2025 - ARTE Concert",
    seriesName: "ARTE Concert",
    eventName: "Street Parade",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/122kgd91/zamna-soundsystem-center-stage-street-parade-zurich-switzerland-2025-08-09.html",
    tracklist1001: TL_ZAMNA_STREET_PARADE_2025,
  },

  {
    // Solo full-set upload not found; official Tomorrowland B2B still covers the rank.
    video: "https://www.youtube.com/watch?v=aWOm_wGei7Q",
    primaryArtist: dj("DubVision", { accent: "#4361ee" }),
    genre: "Progressive House",
    type: "festival",
    title: "Dubvision B2B Third Party WE1 | Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=n7h4TTFqr9k",
    primaryArtist: dj("B Jones", { accent: "#f77f00" }),
    genre: "Tech House",
    type: "festival",
    title: "B Jones WE1 | Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=YvPI-unGanA",
    primaryArtist: dj("Giuseppe Ottaviani", { accent: "#7b2cbf" }),
    genre: "Trance",
    type: "festival",
    title: "Giuseppe Ottaviani live at A State of Trance 2026 (Friday | Area 2)",
    seriesName: "A State of Trance",
    eventName: "A State of Trance",
  },
  {
    video: "https://www.youtube.com/watch?v=eNa3hh-3ZF0",
    primaryArtist: dj("Mariana Bo", { accent: "#e63946" }),
    genre: "Hardstyle",
    type: "festival",
    title: "MARIANA BO LIVE ACT EDC MÉXICO 2023 KINETIC FIELD",
    eventName: "EDC México",
  },
  {
    video: "https://www.youtube.com/watch?v=FfRLvaB_lws",
    primaryArtist: dj("Fantasm", { accent: "#d00000" }),
    genre: "Hard Techno",
    type: "festival",
    title: "Fantasm @ Verknipt Festival 2024 Day 2",
    seriesName: "Verknipt",
    eventName: "Verknipt Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=VEA6D7c758s",
    primaryArtist: dj("VINAI", { accent: "#ff006e" }),
    genre: "Big Room",
    type: "festival",
    title: "VINAI LIVE @ S2O BANGKOK 2023",
    eventName: "S2O Bangkok",
  },
  {
    video: "https://www.youtube.com/watch?v=UZwZ4iyvWDo",
    primaryArtist: dj("Faustix", { accent: "#ffba08" }),
    genre: "Future House",
    type: "festival",
    title: "Faustix Live @Nibe Festival 2025",
    eventName: "Nibe Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=t5KwF_VsM50",
    primaryArtist: dj("Honey Dijon", { accent: "#f72585" }),
    genre: "House",
    type: "festival",
    title: "Honey Dijon at The Loop - Dekmantel Festival 2025",
    seriesName: "Dekmantel",
    eventName: "Dekmantel Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=knbEv8vj-2c",
    primaryArtist: dj("Nils van Zandt", { accent: "#00b4d8" }),
    genre: "Big Room",
    type: "radio",
    title: "Happy Music Session #004 by Nils Van Zandt",
    seriesName: "Happy Music Session",
  },
  {
    video: "https://www.youtube.com/watch?v=yrG_Ldr05SQ",
    primaryArtist: dj("Topic", { accent: "#4361ee" }),
    genre: "Dance",
    type: "festival",
    title: "Topic WE2 | Tomorrowland 2024",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    // Official @Cuebrick club set. No 1001 URL in the operator paste —
    // do not invent Sacré cues.
    video: "https://www.youtube.com/watch?v=LLJn_gDMG_M",
    primaryArtist: dj("Cuebrick", { accent: "#8338ec" }),
    genre: "Techno",
    type: "mix",
    title: "Cuebrick – Live from Sacré Paris | Mainstage Techno | Club Set",
    eventName: "Sacré Paris",
  },
  {
    // Official Austin Kramer UNreleased 139. No SoundCloud in the paste —
    // do not invent an SC slug. "unreleased" is a show leftover, not a DJ.
    video: "https://youtu.be/QLpmLx5JUsg",
    primaryArtist: dj("Austin Kramer", { accent: "#ff9f1c" }),
    genre: "House",
    type: "radio",
    title: "Austin Kramer - UNreleased With Austin Kramer 139",
    seriesName: "UNreleased",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/17r26gu1/austin-kramer-unreleased-with-austin-kramer-139-2026-05-19.html",
    tracklist1001: TL_AUSTIN_KRAMER_UNRELEASED_139_2026,
  },
  {
    // Official Tape B upload; 1001TL wired via yt-7_O8N_EJg_c
    // (same list as sc-tape-b-official-tape-b-cartunes-vol-5).
    video: "https://www.youtube.com/watch?v=7_O8N_EJg_c",
    primaryArtist: dj("Tape B", { accent: "#ffbe0b" }),
    genre: "Bass House",
    type: "mix",
    title: "Tape B - CarTunes Vol. 5",
    seriesName: "CarTunes",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1g84vp31/tape-b-cartunes-vol.-5-2026-08-10.html",
    tracklist1001: TL_TAPE_B_CARTUNES_VOL5_2026,
  },
  {
    // Official Vintage Culture upload; 1001TL wired via yt-KbGNocaJDjw
    // (same list as sc-vintageculturemusic-vintage-culture-robot-heart-residency-2024-california).
    video: "https://www.youtube.com/watch?v=KbGNocaJDjw",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture @ Robot Heart Residency, California 2024",
    seriesName: "Robot Heart",
    eventName: "Robot Heart Residency",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/12xtt1u1/vintage-culture-robot-heart-residency-united-states-2024-05-16.html",
    tracklist1001: TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
  },
  {
    // Official John Summit upload — Experts Only remix album mix.
    // Distinct from TML WE2 (yt-PlArfyuzuqo) and Lollapalooza (yt-9TKqqBCmDHA).
    video: "https://www.youtube.com/watch?v=PkWNuf7rtms",
    primaryArtist: dj("John Summit", {
      accent: "#4cc9f0",
      homeCity: "Chicago, US",
    }),
    genre: "Tech House",
    type: "mix",
    title: "John Summit - Burning Man Playa Package Mix 2025",
    seriesName: "Experts Only",
    eventName: "Burning Man",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/btv3mn9/john-summit-burning-man-playa-package-mix-2025-10-09.html",
    tracklist1001: TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
  },
  {
    // Official @BRANDONSOUNDS upload; 1001TL wired via yt-AQ6wWT2HaSQ
    // (same list as sc-brandonsounds-brandon-live-at-parookaville-2024-desert-valley).
    video: "https://www.youtube.com/watch?v=AQ6wWT2HaSQ",
    primaryArtist: dj("BRANDON", {
      accent: "#ff5e5e",
      homeCity: "Germany",
    }),
    genre: "Tech House",
    type: "festival",
    title: "BRANDON @ Desert Valley, Parookaville 2024",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001Url:
      "https://www.1001tracklists.com/tracklist/1w51jd7t/brandon-desert-valley-parookaville-germany-2024-07-28.html",
    tracklist1001: TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
  },
];

/** Known 1001 pages on curated YT seeds — for the operator capture queue. */
export function curated1001UrlBySourceSlug(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const src of YOUTUBE_SETS) {
    if (!src.tracklist1001Url) continue;
    let id: string | null = null;
    try {
      id = new URL(src.video).searchParams.get("v");
    } catch {
      id = null;
    }
    if (id) out[`yt-${id}`.slice(0, 120)] = src.tracklist1001Url;
  }
  return out;
}
