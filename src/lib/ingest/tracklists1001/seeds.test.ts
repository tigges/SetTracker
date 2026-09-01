import assert from "node:assert/strict";
import { extract1001Urls } from "./parse";
import {
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
  TL_MARTEN_HORGER_EDC_LV_2023,
  TL_MAX_STYLER_EDC_LV_2024,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  TL_MATTY_RALPH_EDC_LV_2026,
  TL_MISS_MONIQUE_TML_WE2_2026,
  TL_NICKY_ROMERO_TML_WE2_2026,
  TL_NICO_MORENO_EDC_LV_2026,
  TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026,
  TL_ODD_MOB_EDC_LV_2025,
  TL_ODD_MOB_TML_WE2_2026,
  TL_PEGASSI_EDC_LV_2026,
  TL_SARAH_DE_WARREN_EDC_LV_2026,
  TL_SOLOMUN_ALLY_PALLY_2026,
  TL_SOLOMUN_EDC_LV_2026,
  TL_SONNY_FODERA_TML_WE2_2026,
  TL_STEVE_ANGELLO_TML_WE2_2026,
  TL_WAX_MOTIF_EDC_LV_2021,
  TL_WESTEND_EDC_LV_2026,
  TL_BORIS_BREJCHA_TML_WE1_2026,
  TL_MIKE_WILLIAMS_TML_WE2_2026,
  TL_MISS_MONIQUE_BIORHYTHM,
  TL_PLASTIK_FUNK_NATURE_ONE_2025,
  TL_SEBASTIAN_INGROSSO_TML_WE2_2026,
  TL_ZAMNA_STREET_PARADE_2025,
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
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
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
  TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025,
  TL_GIUSEPPE_OTTAVIANI_DIGITAL_SOCIETY_LEEDS_WAREHOUSE_2026,
  TL_CUEBRICK_CONFERENCE_297_2026,
  TL_MEDUZA_STEREO_MONTREAL_CANADA_2026,
  TL_MEDUZA_CLUB_SPACE_MIAMI_2026,
  TL_AUSTIN_KRAMER_UNRELEASED_139_2026,
  TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020,
  TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026,
  TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024,
  TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
  TL_COLYN_INNELLEA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
  TL_ABOVE_AND_BEYOND_KINETICFIELD_EDC_LV_2026,
  TL_BEBE_REXHA_TML_WE2_2026,
  TL_DAVID_GUETTA_TML_WE1_2026,
  TL_DINO_LENNY_CORE_019_2022,
  TL_DYEN_MADDIX_TML_WE2_2026,
  TL_LAIDBACK_LUKE_OWR_SELECTS_017_2026,
  TL_MADDIX_TML_WE1_2026,
  TL_MARLON_HOFFSTADT_TML_WE1_2026,
  TL_ERIC_PRYDZ_EPIC_RADIO_026_2026,
  TL_ROBIN_SCHULZ_SUGAR_RADIO_555_2026,
  TL_SARA_LANDRY_TML_FRIENDSHIP_MIX_2026,
  TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026,
  TL_ROSE_RINGED_TML_WE1_FREEDOM_2026,
  TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026,
  TL_BULLET_TOOTH_TML_WE2_CORE_2026,
  TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026,
  TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026,
  TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026,
  TL_DVLM_SMASH_THE_HOUSE_RADIO_690_2026,
  TL_ERIC_PRYDZ_EPIC_RADIO_025_2026,
  TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025,
  TL_VINAI_S2O_SONGKRAN_THAILAND_2023,
  TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026,
  TL_BLACK_COFFEE_MAYAN_WARRIOR_BURNING_MAN_2025,
  TL_CLOONEE_NEONGARDEN_EDC_ORLANDO_2025,
  TL_ZEDD_ULTRA_MIAMI_MAINSTAGE_2025,
  TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025,
  TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026,
  TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026,
  TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026,
  TL_DEADMAU5_VELD_MAINSTAGE_2025,
  TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013,
  TL_MARNIK_TML_WE1_PLANAXIS_2026,
  TL_FIDELES_TML_WE2_FREEDOM_2026,
  TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026,
  TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022,
  TL_BART_SKILS_LOVELAND_FIRE_2026,
  TL_TOPIC_TML_FRIENDSHIP_MIX_2026,
  TL_HARDWELL_EUPHORIA_020_2026,
  TL_LAMMER_TML_WE2_CORE_2026,
  TL_NOSI_TML_WE1_CRYSTAL_2026,
  TL_GIUSEPPE_OTTAVIANI_ASOT_AREA_TWO_ROTTERDAM_2026,
  TL_GIUSEPPE_OTTAVIANI_ASOT_POLAND_LEGIA_2026,
  TL_KOROLOVA_MOTHERLAND_MONUMENT_KYIV_2026,
  TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026,
  TL_JACK_SHORE_TML_WE1_FREEDOM_2026,
  TL_NICKY_ROMERO_TML_WE1_LIBRARY_2026,
  TL_MIKE_WILLIAMS_TML_WE1_THROWBACK_2026,
  TL_MADDIX_ULTRA_EUROPE_2026,
  TL_GIUSEPPE_OTTAVIANI_ILAN_BLUESTONE_BEYOND_WONDERLAND_2026,
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_VANCOUVER_2026,
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_SYDNEY_2026,
  TL_GREG_99_HELLBENT_FM_006_2026,
  TL_VALENTINO_KHAN_REVEL_ALBUQUERQUE_2026,
  TL_ANTI_UP_COACHELLA_WE1_MOJAVE_2024,
  TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024,
  TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026,
  TL_MORTEN_MALAA_TML_WINTER_MAINSTAGE_2026,
  TL_TCHAMI_MALAA_EDC_LV_CIRCUITGROUNDS_2025,
  TL_JAUZ_GET_CRANKED_BILL_GRAHAM_SF_2025,
  TL_WENZDAY_ILLFEST_WICKED_OAKS_AUSTIN_2025,
  TL_BROHUG_BASS_HOUSE_MIXTAPE_2026,
  TL_GREG_99_DATA_TRANSMISSION_DT903_2025,
  TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026,
  TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026,
  TRACKLIST_1001_BY_SOURCE_SLUG,
  isWiredTracklistSlug,
  isSecondaryPlaybackSlug,
  tracklist1001RowsToPlays,
} from "./seeds";
import { assertSeedClocks } from "./festival2026";
import { parseClockToSec } from "../fingerprint/seeds";

const urls = extract1001Urls(
  `Tracklist: https://1001.tl/vfff7hk\nAlso https://www.1001tracklists.com/tracklist/vfff7hk/foo.html`,
);
assert.equal(urls.length, 2);
assert.match(urls[0]!, /1001\.tl\/vfff7hk/);

const bare = extract1001Urls("Tracklist: 1001.tl/qhdctfk (CID EDC)");
assert.equal(bare.length, 1);
assert.equal(bare[0], "https://1001.tl/qhdctfk");

const httpBare = extract1001Urls("TL http://1001.tl/24gpuclk");
assert.equal(httpBare.length, 1);
assert.match(httpBare[0]!, /1001\.tl\/24gpuclk/);

const plays = tracklist1001RowsToPlays(TL_MARTEN_HORGER_EDC_LV_2023);
assert.equal(plays.length, 23);
assert.equal(plays[0]!.provenance, "1001tl");
assert.equal(plays[0]!.timestamp, 35);
assert.equal(plays[0]!.artistName, "Marten Horger, BIJOU");
assert.equal(plays[0]!.trackTitle, "I Know");
assert.equal(plays[6]!.trackTitle, "The Calling");
assert.equal(plays[12]!.artistName, "David Guetta, Marten Horger");
assert.equal(plays[22]!.trackTitle, "Free My Mind");
assert.equal(plays[22]!.timestamp, 55 * 60 + 50);

assertSeedClocks(TL_MARTEN_HORGER_PAROOKAVILLE_2026);
assertSeedClocks(TL_CLOONEE_PROSPA_DESTINO_2026);
assertSeedClocks(TL_CHARLOTTE_DE_WITTE_TML_WE1_2026);
const paro = tracklist1001RowsToPlays(TL_MARTEN_HORGER_PAROOKAVILLE_2026);
assert.ok(paro.length >= 16);
assert.equal(paro[0]!.trackTitle, "Tom's Diner");
assert.equal(paro[paro.length - 1]!.trackTitle, "Rave (PAROOKAVILLE Anthem 2026)");
const cloonee = tracklist1001RowsToPlays(TL_CLOONEE_PROSPA_DESTINO_2026);
assert.ok(cloonee.length >= 20);
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-charlottedewittemusic-charlotte-de-witte-at"
  ]!.length >= 8,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-uMgz40hvySQ"],
  TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
);

assertSeedClocks(TL_WESTEND_EDC_LV_2026);
const westend = tracklist1001RowsToPlays(TL_WESTEND_EDC_LV_2026);
assert.equal(westend.length, 26);
assert.equal(westend[0]!.trackTitle, "We Stay Inside");
assert.equal(westend[0]!.artistName, "Glass Petals ft. Sophiegrophy");
assert.equal(westend[westend.length - 1]!.trackTitle, "Feels Better");
assert.ok(
  westend.some((p) => p.trackTitle === "Drum Death (DENNETT Remix)"),
);
const likeYou = westend.find((p) => p.trackTitle === "Like You A Lot");
assert.equal(likeYou?.timestamp, 20 * 60 + 59);
const proper = westend.find(
  (p) => p.trackTitle === "Proper Education (Westend Edit)",
);
assert.equal(proper?.timestamp, 29 * 60 + 48);
let westPrev = -1;
for (const p of westend) {
  assert.ok(
    p.timestamp > westPrev,
    `Westend clocks must increase @ ${p.timestamp}`,
  );
  westPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-itsthewestend-westend-live-edc-2026"]!
    .length >= 24,
);

assertSeedClocks(TL_AHEE_LIQUID_STRANGER_EDC_LV_2026);
const ahee = tracklist1001RowsToPlays(TL_AHEE_LIQUID_STRANGER_EDC_LV_2026);
assert.ok(ahee.length >= 55);
assert.equal(ahee[0]!.trackTitle, "Superstar");
assert.equal(ahee[ahee.length - 1]!.trackTitle, "Restless (ID Remix)");
assert.ok(
  ahee.some((p) => p.trackTitle === "Jungle Juice"),
  "expected Jungle Juice from 1001 screenshots",
);
assert.ok(
  ahee.some((p) => p.trackTitle === "Lose It"),
  "expected Lose It from later screenshots",
);
assert.ok(
  ahee.some((p) => p.trackTitle === "Crab Rave"),
  "expected Crab Rave from later screenshots",
);
const gunslinger = ahee.find(
  (p) => p.trackTitle === "Gunslinger (Bemah Flip)",
);
assert.equal(gunslinger?.timestamp, 45 * 60 + 30);
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yXHoHK_jQvc"]!.length >= 55,
);

assertSeedClocks(TL_DARUDE_EDC_LV_2026);
const darude = tracklist1001RowsToPlays(TL_DARUDE_EDC_LV_2026);
assert.equal(darude.length, 12);
assert.equal(
  darude[0]!.trackTitle,
  "Beautiful Alien (Boyan & Boyer Remix)",
);
assert.equal(darude[2]!.trackTitle, "iROK");
assert.equal(darude[darude.length - 1]!.trackTitle, "Tell Me Why (Darude Remix)");
const sandstorm = darude.find((p) => /Sandstorm/i.test(p.trackTitle || ""));
assert.equal(sandstorm?.timestamp, 40 * 60);
assert.ok(
  !darude.some((p) => /Nobody Listens/i.test(p.trackTitle || "")),
  "08:26 on 1001 is Darude ID, not Nobody Listens",
);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-dXBoIY65P8s"]!.length >= 12);

assertSeedClocks(TL_CID_EDC_LV_2017);
const cid = tracklist1001RowsToPlays(TL_CID_EDC_LV_2017);
assert.equal(cid.length, 26);
assert.equal(cid[0]!.trackTitle, "Sweet Memories");
assert.equal(cid[cid.length - 1]!.trackTitle, "Us");
let cidPrev = -1;
for (const p of cid) {
  assert.ok(p.timestamp > cidPrev, `CID clocks must increase @ ${p.timestamp}`);
  cidPrev = p.timestamp;
}
assert.equal(parseClockToSec("6:22"), cid[3]!.timestamp);
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-cidmusic-cid-edc-lv-2017"]!.length >= 20,
);

assertSeedClocks(TL_BLEU_CLAIR_EDC_LV_2023);
const bleu = tracklist1001RowsToPlays(TL_BLEU_CLAIR_EDC_LV_2023);
assert.equal(bleu.length, 20);
assert.equal(bleu[0]!.trackTitle, "Mean Sumthin");
assert.equal(bleu[bleu.length - 1]!.trackTitle, "Mistake");
let bleuPrev = -1;
for (const p of bleu) {
  assert.ok(
    p.timestamp > bleuPrev,
    `Bleu Clair clocks must increase @ ${p.timestamp}`,
  );
  bleuPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-c_sx3zum8Z0"]!.length >= 18);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["sc-bleuclair-edclv2023"]!.length >= 18);

assertSeedClocks(TL_WAX_MOTIF_EDC_LV_2021);
const wax = tracklist1001RowsToPlays(TL_WAX_MOTIF_EDC_LV_2021);
assert.equal(wax.length, 25);
assert.equal(wax[0]!.trackTitle, "Pink Soldiers (Squid Game OST)");
assert.equal(wax[wax.length - 1]!.trackTitle, "Need You");
let waxPrev = -1;
for (const p of wax) {
  assert.ok(p.timestamp > waxPrev, `Wax Motif clocks must increase @ ${p.timestamp}`);
  waxPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-waxmotif-wax-motif-live-edc-2021"]!
    .length >= 20,
);

assertSeedClocks(TL_CLOONEE_EDC_LV_2022);
const clooneeEdc = tracklist1001RowsToPlays(TL_CLOONEE_EDC_LV_2022);
assert.equal(clooneeEdc.length, 15);
assert.equal(clooneeEdc[0]!.trackTitle, "Fine Night");
assert.equal(clooneeEdc[clooneeEdc.length - 1]!.trackTitle, "Sun Goes Down");
let cloPrev = -1;
for (const p of clooneeEdc) {
  assert.ok(p.timestamp > cloPrev, `Cloonee EDC clocks must increase @ ${p.timestamp}`);
  cloPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-cloonee-cloonee-edc-2022"]!.length >= 14,
);

assertSeedClocks(TL_ODD_MOB_EDC_LV_2025);
const oddMob = tracklist1001RowsToPlays(TL_ODD_MOB_EDC_LV_2025);
assert.equal(oddMob.length, 29);
assert.equal(oddMob[0]!.trackTitle, "Vertigo");
assert.equal(oddMob[oddMob.length - 1]!.trackTitle, "Toxic");
let omPrev = -1;
for (const p of oddMob) {
  assert.ok(p.timestamp > omPrev, `Odd Mob clocks must increase @ ${p.timestamp}`);
  omPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-oceanologymusic-odd-mob-live-at-edc-las-vegas-2025-cosmic-meadow-day-2-3"
  ]!.length >= 25,
);

assertSeedClocks(TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING);
const layton = tracklist1001RowsToPlays(TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING);
assert.equal(layton.length, 21);
assert.match(layton[0]!.trackTitle!, /Scary Monsters/);
assert.match(layton[layton.length - 1]!.trackTitle!, /Room For Happiness/);
let layPrev = -1;
for (const p of layton) {
  assert.ok(p.timestamp >= layPrev, `Layton clocks must not go back @ ${p.timestamp}`);
  layPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-laytongiordani-layton-giordani-live-edc-las-vegas-circuit-grounds-closing-set-2025"
  ]!.length >= 20,
);

assertSeedClocks(TL_MAX_STYLER_EDC_LV_2024);
const maxStyler = tracklist1001RowsToPlays(TL_MAX_STYLER_EDC_LV_2024);
assert.equal(maxStyler.length, 20);
assert.equal(maxStyler[0]!.trackTitle, "Lights Out");
assert.equal(maxStyler[maxStyler.length - 1]!.trackTitle, "Work It");
let msPrev = -1;
for (const p of maxStyler) {
  assert.ok(p.timestamp > msPrev, `Max Styler clocks must increase @ ${p.timestamp}`);
  msPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-maxstyler-max-styler-live-edc-vegas-2024"]!
    .length >= 18,
);

assertSeedClocks(TL_DOM_DOLLA_EDC_LV_2023);
const dom23 = tracklist1001RowsToPlays(TL_DOM_DOLLA_EDC_LV_2023);
assert.equal(dom23.length, 32);
assert.equal(dom23[0]!.trackTitle, "Pacha On Acid");
assert.match(dom23[dom23.length - 1]!.trackTitle!, /Rhyme Dust/);
assert.equal(dom23[dom23.length - 1]!.timestamp, 69 * 60 + 42);
let dom23Prev = -1;
for (const p of dom23) {
  assert.ok(
    p.timestamp > dom23Prev,
    `Dom Dolla 2023 clocks must increase @ ${p.timestamp}`,
  );
  dom23Prev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-domdolla-dom-dolla-live-edc-las-vegas-2023"
  ]!.length >= 28,
);

assertSeedClocks(TL_DOM_DOLLA_EDC_LV_2024);
const dom = tracklist1001RowsToPlays(TL_DOM_DOLLA_EDC_LV_2024);
assert.equal(dom.length, 35);
assert.equal(dom[0]!.trackTitle, "girl$");
assert.equal(dom[dom.length - 1]!.trackTitle, "CAVE");
assert.equal(dom[dom.length - 1]!.timestamp, 64 * 60 + 17);
let domPrev = -1;
for (const p of dom) {
  assert.ok(p.timestamp > domPrev, `Dom Dolla clocks must increase @ ${p.timestamp}`);
  domPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-domdolla-dom-dolla-live-edc-circuitgrounds-las-vegas-2024"
  ]!.length >= 30,
);

assertSeedClocks(TL_DOM_DOLLA_ALLIANZ_SYDNEY);
const domSyd = tracklist1001RowsToPlays(TL_DOM_DOLLA_ALLIANZ_SYDNEY);
assert.equal(domSyd.length, 58);
assert.match(domSyd[0]!.trackTitle!, /Pyramids/);
assert.equal(
  domSyd[domSyd.length - 1]!.trackTitle,
  "Rhyme Dust (Dimension Remix)",
);
assert.equal(domSyd[domSyd.length - 1]!.timestamp, 118 * 60 + 11);
let domSydPrev = -1;
for (const p of domSyd) {
  assert.ok(
    p.timestamp > domSydPrev,
    `Dom Dolla Allianz Sydney clocks must increase @ ${p.timestamp}`,
  );
  domSydPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-4Lqyh7cWRxQ"],
  TL_DOM_DOLLA_ALLIANZ_SYDNEY,
);

assertSeedClocks(TL_SOLOMUN_EDC_LV_2026);
const solomun = tracklist1001RowsToPlays(TL_SOLOMUN_EDC_LV_2026);
assert.equal(solomun.length, 18);
assert.equal(solomun[0]!.trackTitle, "Rumpta");
assert.equal(solomun[solomun.length - 1]!.trackTitle, "Kinesphere");
assert.equal(solomun[solomun.length - 1]!.timestamp, 85 * 60 + 40);
let solPrev = -1;
for (const p of solomun) {
  assert.ok(p.timestamp > solPrev, `Solomun clocks must increase @ ${p.timestamp}`);
  solPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-g1vH9C_o-vo"]!.length >= 16);

assertSeedClocks(TL_SOLOMUN_ALLY_PALLY_2026);
const solomunAlly = tracklist1001RowsToPlays(TL_SOLOMUN_ALLY_PALLY_2026);
assert.equal(solomunAlly.length, 29);
assert.equal(solomunAlly[0]!.trackTitle, "Acid");
assert.equal(
  solomunAlly[solomunAlly.length - 1]!.trackTitle,
  "Tout Le Monde Est Fou",
);
assert.equal(solomunAlly[solomunAlly.length - 1]!.timestamp, 2 * 3600 + 37 * 60);
let solAllyPrev = -1;
for (const p of solomunAlly) {
  assert.ok(
    p.timestamp > solAllyPrev,
    `Solomun Ally Pally clocks must increase @ ${p.timestamp}`,
  );
  solAllyPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-S46Bs4pZ_I4"],
  TL_SOLOMUN_ALLY_PALLY_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-g1vH9C_o-vo"],
  TL_SOLOMUN_ALLY_PALLY_2026,
);

assertSeedClocks(TL_SARAH_DE_WARREN_EDC_LV_2026);
const sarah = tracklist1001RowsToPlays(TL_SARAH_DE_WARREN_EDC_LV_2026);
assert.equal(sarah.length, 15);
assert.equal(sarah[0]!.trackTitle, "Fight Machine");
assert.match(sarah[sarah.length - 1]!.trackTitle!, /All The Things She Said/);
let sarahPrev = -1;
for (const p of sarah) {
  assert.ok(
    p.timestamp >= sarahPrev,
    `Sarah de Warren clocks must not go back @ ${p.timestamp}`,
  );
  sarahPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-KIb3psOt9hI"]!.length >= 14);

assertSeedClocks(TL_PEGASSI_EDC_LV_2026);
const pegassi = tracklist1001RowsToPlays(TL_PEGASSI_EDC_LV_2026);
assert.equal(pegassi.length, 12);
assert.equal(pegassi[0]!.trackTitle, "Heartless");
assert.equal(pegassi[pegassi.length - 1]!.trackTitle, "Spectral Bells");
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-yUA0Ht2PdG0"]!.length >= 12);

assertSeedClocks(TL_NICO_MORENO_EDC_LV_2026);
const nico = tracklist1001RowsToPlays(TL_NICO_MORENO_EDC_LV_2026);
assert.equal(nico.length, 40);
assert.equal(nico[0]!.trackTitle, "See Me Coming");
assert.match(nico[nico.length - 1]!.trackTitle!, /Died In Your Arms/);
let nicoPrev = -1;
for (const p of nico) {
  assert.ok(p.timestamp > nicoPrev, `Nico clocks must increase @ ${p.timestamp}`);
  nicoPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-f_p6nfbrm0E"]!.length >= 40);

assertSeedClocks(TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026);
const nicoHp = tracklist1001RowsToPlays(TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026);
assert.equal(nicoHp.length, 47);
assert.equal(nicoHp[0]!.trackTitle, "Overdose");
assert.match(nicoHp[nicoHp.length - 1]!.trackTitle!, /Move Ma Body/);
// Fan YT still held. hearthis edmliveset is the tracklist host (never playback).
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-nZS9gvjlPIs"],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "ht-edmliveset-nico-moreno-holy-priestaa-live-at-edc-las-vegas-2026-las-vegas-usa-17-05-2026"
  ],
  TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026,
);
assert.equal(
  isWiredTracklistSlug(
    "ht-edmliveset-nico-moreno-holy-priestaa-live-at-edc-las-vegas-2026-las-vegas-usa-17-05-2026",
  ),
  true,
);

assertSeedClocks(TL_MATTY_RALPH_EDC_LV_2026);
const matty = tracklist1001RowsToPlays(TL_MATTY_RALPH_EDC_LV_2026);
assert.equal(matty.length, 12);
assert.equal(matty[0]!.trackTitle, "Move That Body");
assert.equal(matty[matty.length - 1]!.trackTitle, "Under The Lights");
assert.equal(matty[5]!.timestamp, 23 * 60 + 2);
let mattyPrev = -1;
for (const p of matty) {
  assert.ok(
    p.timestamp >= mattyPrev,
    `Matty Ralph clocks must not go back @ ${p.timestamp}`,
  );
  mattyPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-FZ7pwlNdwBk"]!.length >= 12);

assertSeedClocks(TL_FUNK_TRIBU_EDC_LV_2026);
const funk = tracklist1001RowsToPlays(TL_FUNK_TRIBU_EDC_LV_2026);
assert.equal(funk.length, 10);
assert.equal(funk[0]!.trackTitle, "What Trance Feels Like");
assert.equal(funk[0]!.timestamp, 7 * 60 + 20);
assert.equal(funk[funk.length - 1]!.trackTitle, "Wicked With You");
let funkPrev = -1;
for (const p of funk) {
  assert.ok(p.timestamp > funkPrev, `Funk Tribu clocks must increase @ ${p.timestamp}`);
  funkPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-APt5j9Abwo8"]!.length >= 10);

assertSeedClocks(TL_HOLY_PRIEST_EDC_LV_2026);
const holyEdc = tracklist1001RowsToPlays(TL_HOLY_PRIEST_EDC_LV_2026);
assert.equal(holyEdc.length, 39);
assert.match(holyEdc[0]!.trackTitle!, /My Name Is/);
assert.equal(holyEdc[holyEdc.length - 1]!.trackTitle, "IN ANOTHER LIFE");
let holyPrev = -1;
for (const p of holyEdc) {
  assert.ok(
    p.timestamp >= holyPrev,
    `Holy Priest EDC clocks must not go back @ ${p.timestamp}`,
  );
  holyPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-D8eLxmifH4o"]!.length >= 39);

assertSeedClocks(TL_HOLY_PRIEST_TML_WE1_2026);
const holyTml = tracklist1001RowsToPlays(TL_HOLY_PRIEST_TML_WE1_2026);
assert.equal(holyTml.length, 45);
assert.equal(holyTml[0]!.trackTitle, "Ameno");
assert.equal(holyTml[holyTml.length - 1]!.trackTitle, "Holy Atlantis");
// No official TML playback yet — seed held.
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-OlNdG4SCPdQ"], undefined);

assertSeedClocks(TL_ODD_MOB_TML_WE2_2026);
const oddMobTml = tracklist1001RowsToPlays(TL_ODD_MOB_TML_WE2_2026);
assert.equal(oddMobTml.length, 18);
assert.equal(oddMobTml[0]!.trackTitle, "Undeniable");
assert.match(oddMobTml[oddMobTml.length - 1]!.trackTitle!, /I Need A Miracle/);
let omTmlPrev = -1;
for (const p of oddMobTml) {
  assert.ok(
    p.timestamp >= omTmlPrev,
    `Odd Mob TML clocks must not go back @ ${p.timestamp}`,
  );
  omTmlPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-2idboK_vTT8"]!.length >= 18);

assertSeedClocks(TL_MISS_MONIQUE_TML_WE2_2026);
const missM = tracklist1001RowsToPlays(TL_MISS_MONIQUE_TML_WE2_2026);
assert.equal(missM.length, 20);
assert.equal(missM[0]!.trackTitle, "Rajada");
assert.equal(missM[missM.length - 1]!.trackTitle, "Beauty In Us");
let mmPrev = -1;
for (const p of missM) {
  assert.ok(
    p.timestamp >= mmPrev,
    `Miss Monique TML clocks must not go back @ ${p.timestamp}`,
  );
  mmPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-WhPtvotfYbc"]!.length >= 20);

assertSeedClocks(TL_ENRICO_SANGIULIANO_TML_WE2_2026);
const enrico = tracklist1001RowsToPlays(TL_ENRICO_SANGIULIANO_TML_WE2_2026);
assert.equal(enrico.length, 19);
assert.equal(enrico[0]!.trackTitle, "Escape Domo");
assert.match(enrico[enrico.length - 1]!.trackTitle!, /Techno Code/);
assert.equal(enrico[enrico.length - 1]!.timestamp, 78 * 60 + 35);
let enricoPrev = -1;
for (const p of enrico) {
  assert.ok(
    p.timestamp >= enricoPrev,
    `Enrico TML clocks must not go back @ ${p.timestamp}`,
  );
  enricoPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-ubFrkYGGqo8"]!.length >= 19);

assertSeedClocks(TL_NICKY_ROMERO_TML_WE2_2026);
const nicky = tracklist1001RowsToPlays(TL_NICKY_ROMERO_TML_WE2_2026);
assert.equal(nicky.length, 76);
assert.match(nicky[0]!.trackTitle!, /Live My Life vs\. How Deep/);
assert.equal(nicky[nicky.length - 1]!.trackTitle, "Language");
let nickyPrev = -1;
for (const p of nicky) {
  assert.ok(
    p.timestamp >= nickyPrev,
    `Nicky Romero TML clocks must not go back @ ${p.timestamp}`,
  );
  nickyPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-TsyGMhx8izw"]!.length >= 76);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-B05MAbsCOLA"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-TsyGMhx8izw"],
);

assertSeedClocks(TL_JAMES_HYPE_TML_WE2_2026);
const jhTml = tracklist1001RowsToPlays(TL_JAMES_HYPE_TML_WE2_2026);
assert.equal(jhTml.length, 35);
assert.match(jhTml[0]!.trackTitle!, /Power/);
assert.equal(jhTml[jhTml.length - 1]!.trackTitle, "Confession");
let jhPrev = -1;
for (const p of jhTml) {
  assert.ok(
    p.timestamp >= jhPrev,
    `James Hype TML clocks must not go back @ ${p.timestamp}`,
  );
  jhPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-dmhUJYEdkKo"]!.length >= 35);

assertSeedClocks(TL_JAMES_HYPE_MELKWEG_ADE_2025);
const jhMelkweg = tracklist1001RowsToPlays(TL_JAMES_HYPE_MELKWEG_ADE_2025);
assert.equal(jhMelkweg.length, 51);
assert.match(jhMelkweg[0]!.trackTitle!, /Smack My Bitch Up/);
assert.equal(jhMelkweg[jhMelkweg.length - 1]!.trackTitle, "Be Yourself");
assert.equal(jhMelkweg[jhMelkweg.length - 1]!.timestamp, 86 * 60 + 5);
let jhMkPrev = -1;
for (const p of jhMelkweg) {
  assert.ok(
    p.timestamp >= jhMkPrev,
    `James Hype Melkweg clocks must not go back @ ${p.timestamp}`,
  );
  jhMkPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-QThaqlzSqLw"]!.length >= 51);
// Distinct from TML WE2 playback.
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-QThaqlzSqLw"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-dmhUJYEdkKo"],
);

assertSeedClocks(TL_KOLSCH_TML_WE2_2026);
const kolsch = tracklist1001RowsToPlays(TL_KOLSCH_TML_WE2_2026);
assert.equal(kolsch.length, 19);
assert.equal(kolsch[0]!.trackTitle, "Waste My Time");
assert.match(kolsch[kolsch.length - 1]!.trackTitle!, /All that Matters/i);
let kolschPrev = -1;
for (const p of kolsch) {
  assert.ok(
    p.timestamp >= kolschPrev,
    `Kölsch TML clocks must not go back @ ${p.timestamp}`,
  );
  kolschPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-ra8NYbzPMnk"]!.length >= 19);

assertSeedClocks(TL_STEVE_ANGELLO_TML_WE2_2026);
const angello = tracklist1001RowsToPlays(TL_STEVE_ANGELLO_TML_WE2_2026);
assert.equal(angello.length, 41);
assert.equal(angello[0]!.trackTitle, "Hooligans");
assert.equal(angello[angello.length - 1]!.trackTitle, "Innerbloom");
let angelloPrev = -1;
for (const p of angello) {
  assert.ok(
    p.timestamp >= angelloPrev,
    `Steve Angello TML clocks must not go back @ ${p.timestamp}`,
  );
  angelloPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-5AdQy7lCbN0"]!.length >= 41);

assertSeedClocks(TL_FISHER_TML_WE1_2026);
const fisherWe1 = tracklist1001RowsToPlays(TL_FISHER_TML_WE1_2026);
assert.equal(fisherWe1.length, 25);
assert.match(fisherWe1[0]!.trackTitle!, /It's That Time/);
assert.equal(fisherWe1[fisherWe1.length - 1]!.trackTitle, "Levels");
assert.equal(fisherWe1[fisherWe1.length - 1]!.timestamp, 55 * 60 + 49);
let fisherWe1Prev = -1;
for (const p of fisherWe1) {
  assert.ok(
    p.timestamp > fisherWe1Prev,
    `FISHER TML WE1 clocks must increase @ ${p.timestamp}`,
  );
  fisherWe1Prev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-4985f9Rfxx0"],
  TL_FISHER_TML_WE1_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Uq1WP8v3U4o"],
  TL_FISHER_TML_WE1_2026,
);

assertSeedClocks(TL_FISHER_TML_WE2_2026);
const fisher = tracklist1001RowsToPlays(TL_FISHER_TML_WE2_2026);
assert.equal(fisher.length, 17);
assert.match(fisher[0]!.trackTitle!, /It's That Time/);
assert.match(fisher[fisher.length - 1]!.trackTitle!, /World, Hold On/);
assert.equal(fisher[fisher.length - 1]!.timestamp, 77 * 60 + 25);
let fisherPrev = -1;
for (const p of fisher) {
  assert.ok(
    p.timestamp >= fisherPrev,
    `FISHER TML clocks must not go back @ ${p.timestamp}`,
  );
  fisherPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-Uq1WP8v3U4o"]!.length >= 17);

assertSeedClocks(TL_MASSANO_TML_WE2_2026);
const massanoTml = tracklist1001RowsToPlays(TL_MASSANO_TML_WE2_2026);
assert.equal(massanoTml.length, 17);
assert.equal(massanoTml[0]!.trackTitle, "Underground");
assert.equal(massanoTml[massanoTml.length - 1]!.trackTitle, "Angel In The Dark");
assert.equal(massanoTml[massanoTml.length - 1]!.timestamp, 55 * 60 + 35);
let massanoTmlPrev = -1;
for (const p of massanoTml) {
  assert.ok(
    p.timestamp > massanoTmlPrev,
    `Massano TML WE2 clocks must increase @ ${p.timestamp}`,
  );
  massanoTmlPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eeNljOHahxY"],
  TL_MASSANO_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-fYM9DlFLwKw"],
  TL_MASSANO_TML_WE2_2026,
);

assertSeedClocks(TL_HARDWELL_TML_WE2_2026);
const hardwell = tracklist1001RowsToPlays(TL_HARDWELL_TML_WE2_2026);
assert.equal(hardwell.length, 31);
assert.equal(hardwell[0]!.trackTitle, "Believe");
assert.equal(hardwell[hardwell.length - 1]!.trackTitle, "IRIS");
let hwPrev = -1;
for (const p of hardwell) {
  assert.ok(
    p.timestamp >= hwPrev,
    `Hardwell TML clocks must not go back @ ${p.timestamp}`,
  );
  hwPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-yWZyIQtxoXU"]!.length >= 31);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Py-GG74lLU8"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yWZyIQtxoXU"],
);

assertSeedClocks(TL_CHRIS_LORENZO_TML_WE2_2026);
const chrisL = tracklist1001RowsToPlays(TL_CHRIS_LORENZO_TML_WE2_2026);
assert.equal(chrisL.length, 10);
assert.match(chrisL[0]!.trackTitle!, /Appetite/);
assert.equal(chrisL[chrisL.length - 1]!.trackTitle, "House Every Weekend");
// No official Tomorrowland playback yet — seed held, not slug-mapped.
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_CHRIS_LORENZO_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_DIMITRI_VEGAS_TML_WE2_2026);
const dvTml = tracklist1001RowsToPlays(TL_DIMITRI_VEGAS_TML_WE2_2026);
assert.equal(dvTml.length, 65);
assert.match(dvTml[0]!.trackTitle!, /Caramelle vs\. Diet Coke/);
assert.equal(dvTml[dvTml.length - 1]!.trackTitle, "Allein Allein");
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-3o0T4z6oT4Y"],
  TL_DIMITRI_VEGAS_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OTKgBZS8if0"],
  TL_DIMITRI_VEGAS_TML_WE2_2026,
);

assertSeedClocks(TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026);
const dvNm = tracklist1001RowsToPlays(TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026);
assert.equal(dvNm.length, 35);
assert.match(dvNm[0]!.trackTitle!, /Animals/);
assert.equal(dvNm[dvNm.length - 1]!.trackTitle, "HARDCORE SOUND");
assert.equal(dvNm[dvNm.length - 1]!.timestamp, 59 * 60 + 43);
let dvNmPrev = -1;
for (const p of dvNm) {
  assert.ok(
    p.timestamp >= dvNmPrev,
    `DV Nico Moreno TML clocks must not go back @ ${p.timestamp}`,
  );
  dvNmPrev = p.timestamp;
}
// B2B Great Library playback — distinct from held solo Mainstage seed.
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OTKgBZS8if0"],
  TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OTKgBZS8if0"],
  TL_DIMITRI_VEGAS_TML_WE2_2026,
);

assertSeedClocks(TL_CALVIN_HARRIS_TML_WE2_2026);
const calvin = tracklist1001RowsToPlays(TL_CALVIN_HARRIS_TML_WE2_2026);
assert.equal(calvin.length, 30);
assert.match(calvin[0]!.trackTitle!, /C\.U\.B\.A/);
assert.match(calvin[calvin.length - 1]!.trackTitle!, /Atom/);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_CALVIN_HARRIS_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_SONNY_FODERA_TML_WE2_2026);
const sonny = tracklist1001RowsToPlays(TL_SONNY_FODERA_TML_WE2_2026);
assert.equal(sonny.length, 16);
assert.equal(sonny[0]!.trackTitle, "Freed From Desire");
assert.match(sonny[sonny.length - 1]!.trackTitle!, /Celebration/);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_SONNY_FODERA_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_DARREN_STYLES_TML_WE2_2026);
const darrenStyles = tracklist1001RowsToPlays(TL_DARREN_STYLES_TML_WE2_2026);
assert.equal(darrenStyles.length, 33);
assert.equal(darrenStyles[0]!.trackTitle, "Be Somebody");
assert.match(darrenStyles[darrenStyles.length - 1]!.trackTitle!, /Save Me/);
// No official TML WE2 playback yet — seed held, not slug-mapped.
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_DARREN_STYLES_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_AYYBO_ODD_MOB_TML_WE2_2026);
const ayybo = tracklist1001RowsToPlays(TL_AYYBO_ODD_MOB_TML_WE2_2026);
assert.equal(ayybo.length, 30);
assert.match(ayybo[0]!.trackTitle!, /Party Time/);
assert.equal(ayybo[ayybo.length - 1]!.trackTitle, "Rock That Body");
assert.equal(ayybo[ayybo.length - 1]!.timestamp, 88 * 60 + 20);
let ayyboPrev = -1;
for (const p of ayybo) {
  assert.ok(
    p.timestamp >= ayyboPrev,
    `AYYBO Odd Mob TML clocks must not go back @ ${p.timestamp}`,
  );
  ayyboPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-gO03gfI_JF0"]!.length >= 30);

assertSeedClocks(TL_DYZEN_TML_WE2_2026);
const dyzen = tracklist1001RowsToPlays(TL_DYZEN_TML_WE2_2026);
assert.equal(dyzen.length, 4);
assert.equal(dyzen[0]!.trackTitle, "Mutant Quasars");
assert.equal(dyzen[dyzen.length - 1]!.trackTitle, "Try");
// Thin partial TL + no official Tomorrowland playback — held.
// yt-VABm0tIRn2U is DYEN B2B Maddix Atmosphere WE2, not this Dyzen seed.
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-VABm0tIRn2U"],
  TL_DYZEN_TML_WE2_2026,
);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(TL_DYZEN_TML_WE2_2026),
  false,
);

assertSeedClocks(TL_JOHN_SUMMIT_TML_WE2_2026);
const summit = tracklist1001RowsToPlays(TL_JOHN_SUMMIT_TML_WE2_2026);
assert.equal(summit.length, 38);
assert.equal(summit[0]!.trackTitle, "Utopia");
assert.match(summit[summit.length - 1]!.trackTitle!, /Go Back/);
assert.equal(summit[summit.length - 1]!.timestamp, 115 * 60 + 35);
let summitPrev = -1;
for (const p of summit) {
  assert.ok(
    p.timestamp >= summitPrev,
    `John Summit TML clocks must not go back @ ${p.timestamp}`,
  );
  summitPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-PlArfyuzuqo"]!.length >= 38);

assertSeedClocks(TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026);
const arminYt = tracklist1001RowsToPlays(TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026);
assert.equal(arminYt.length, 7);
assert.match(arminYt[0]!.trackTitle!, /Everlasting/);
assert.match(arminYt[arminYt.length - 1]!.trackTitle!, /Blah Blah Blah/);
assert.equal(arminYt[arminYt.length - 1]!.timestamp, 11 * 60);
// Distinct from Mainstage WE2 playback.
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-I6QA_T-BS6o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-tg_QLGpes0k"],
);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-I6QA_T-BS6o"]!.length >= 7);

assertSeedClocks(TL_KOROLOVA_TML_WE2_2026);
const korolova = tracklist1001RowsToPlays(TL_KOROLOVA_TML_WE2_2026);
assert.equal(korolova.length, 22);
assert.equal(korolova[0]!.trackTitle, "Buka");
assert.equal(korolova[0]!.timestamp, 2 * 60 + 29);
assert.equal(korolova[1]!.trackTitle, "Window Shake");
assert.equal(korolova[korolova.length - 1]!.trackTitle, "Paradise");
assert.equal(korolova[korolova.length - 1]!.timestamp, 85 * 60 + 14);
let korPrev = -1;
for (const p of korolova) {
  assert.ok(
    p.timestamp >= korPrev,
    `Korolova TML clocks must not go back @ ${p.timestamp}`,
  );
  korPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-RLOghpXjuJI"]!.length >= 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-korolova-live-tomorrowland-1"],
  TL_KOROLOVA_TML_WE2_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/korolovadj/korolova-live-tomorrowland-1"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-korolova-live-tomorrowland-1"],
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-korolova-captive-soul-98"],
);
assert.equal(isWiredTracklistSlug("yt-RLOghpXjuJI"), true);
assert.equal(
  isWiredTracklistSlug("sc-korolovadj-korolova-live-tomorrowland-1"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-korolovadj-korolova-live-tomorrowland-1"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-RLOghpXjuJI"), false);

assertSeedClocks(TL_LUCAS_STEVE_TML_WE2_2026);
const lucasSteve = tracklist1001RowsToPlays(TL_LUCAS_STEVE_TML_WE2_2026);
assert.equal(lucasSteve.length, 54);
assert.equal(lucasSteve[0]!.trackTitle, "Free Your Mind");
assert.equal(TL_LUCAS_STEVE_TML_WE2_2026[7]?.artist, "Lucas & Steve & Mike Bond");
assert.equal(TL_LUCAS_STEVE_TML_WE2_2026[7]?.title, "Be Like Bob");
assert.match(lucasSteve[lucasSteve.length - 1]!.trackTitle!, /Save The World/);
assert.equal(lucasSteve[lucasSteve.length - 1]!.timestamp, 59 * 60 + 30);
let lsPrev = -1;
for (const p of lucasSteve) {
  assert.ok(
    p.timestamp >= lsPrev,
    `Lucas & Steve TML clocks must not go back @ ${p.timestamp}`,
  );
  lsPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-LE-byccuovI"]!.length >= 54);

assertSeedClocks(TL_SARA_LANDRY_TML_WE2_2026);
const saraLandry = tracklist1001RowsToPlays(TL_SARA_LANDRY_TML_WE2_2026);
assert.equal(saraLandry.length, 17);
assert.equal(saraLandry[0]!.trackTitle, "Bring It Up");
assert.equal(saraLandry[saraLandry.length - 1]!.trackTitle, "Modulation Depth");
assert.equal(saraLandry[saraLandry.length - 1]!.timestamp, 51 * 60 + 17);
let slPrev = -1;
for (const p of saraLandry) {
  assert.ok(
    p.timestamp >= slPrev,
    `Sara Landry TML clocks must not go back @ ${p.timestamp}`,
  );
  slPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-aDAWctObTvI"]!.length >= 17);

assertSeedClocks(TL_AFROJACK_R3HAB_TML_WE2_2026);
const afroR3 = tracklist1001RowsToPlays(TL_AFROJACK_R3HAB_TML_WE2_2026);
assert.equal(afroR3.length, 54);
assert.equal(afroR3[0]!.provenance, "1001tl");
assert.equal(afroR3[0]!.timestamp, 12);
assert.equal(afroR3[0]!.trackTitle, "Ultimate");
assert.equal(afroR3[afroR3.length - 1]!.trackTitle, "Bangduck");
assert.equal(afroR3[afroR3.length - 1]!.timestamp, 59 * 60 + 30);
for (let i = 1; i < afroR3.length; i++) {
  assert.ok(
    (afroR3[i]!.timestamp ?? 0) >= (afroR3[i - 1]!.timestamp ?? 0),
    `AFROJACK R3HAB TML clocks must not go back at index ${i}`,
  );
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-AjQeohYmg3A"],
  TL_AFROJACK_R3HAB_TML_WE2_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-lEIGnx7qLl0"],
  TL_AFROJACK_R3HAB_TML_WE2_2026,
);
// R3HAB's SoundCloud upload of the same performance. All three slugs must hold
// the SAME array object: extraHostUrlsBySlug groups twins by seed identity, so
// a re-declared copy would silently split the group.
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-r3hab-r3hab-b2b-afrojack"],
  TL_AFROJACK_R3HAB_TML_WE2_2026,
);

assertSeedClocks(TL_STEVE_AOKI_TML_WE2_2026);
const aoki = tracklist1001RowsToPlays(TL_STEVE_AOKI_TML_WE2_2026);
assert.equal(aoki.length, 26);
assert.equal(aoki[0]!.trackTitle, "Pursuit Of Happiness");
assert.equal(aoki[0]!.timestamp, 20);
assert.equal(aoki[aoki.length - 1]!.trackTitle, "Miss You");
let aokiPrev = -1;
for (const p of aoki) {
  assert.ok(
    p.timestamp >= aokiPrev,
    `Steve Aoki TML clocks must not go back @ ${p.timestamp}`,
  );
  aokiPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-8-J01-hcHfA"]!.length >= 26);

assertSeedClocks(TL_CYRIL_TML_WE2_2026);
const cyril = tracklist1001RowsToPlays(TL_CYRIL_TML_WE2_2026);
assert.equal(cyril.length, 24);
assert.equal(cyril[0]!.trackTitle, "The Future");
assert.equal(cyril[0]!.timestamp, 20);
assert.match(cyril[cyril.length - 1]!.trackTitle!, /Power Of Love/);
let cyrilPrev = -1;
for (const p of cyril) {
  assert.ok(
    p.timestamp >= cyrilPrev,
    `CYRIL TML clocks must not go back @ ${p.timestamp}`,
  );
  cyrilPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-DAOlnMYA3nU"]!.length >= 24);

assertSeedClocks(TL_PUSH_TML_WE2_2026);
const pushTml = tracklist1001RowsToPlays(TL_PUSH_TML_WE2_2026);
assert.equal(pushTml.length, 16);
assert.match(pushTml[0]!.trackTitle!, /Strange World/);
assert.equal(pushTml[pushTml.length - 1]!.trackTitle, "Iguana Party");
assert.equal(pushTml[pushTml.length - 1]!.timestamp, 55 * 60 + 36);
let pushPrev = -1;
for (const p of pushTml) {
  assert.ok(
    p.timestamp >= pushPrev,
    `Push TML clocks must not go back @ ${p.timestamp}`,
  );
  pushPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-KVZlecHlVkg"]!.length >= 16);

assertSeedClocks(TL_BASSJACKERS_TML_WE2_2026);
assert.equal(TL_BASSJACKERS_TML_WE2_2026.length, 36);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-BG3Lr9EdWVY"],
  TL_BASSJACKERS_TML_WE2_2026,
);
const bassjackers = tracklist1001RowsToPlays(TL_BASSJACKERS_TML_WE2_2026);
assert.equal(bassjackers.length, 36);
assert.equal(bassjackers[0]!.provenance, "1001tl");
assert.equal(bassjackers[0]!.trackTitle, "Rave Baby");
assert.equal(bassjackers[0]!.timestamp, 11);
assert.equal(bassjackers[bassjackers.length - 1]!.trackTitle, "Forever");
assert.equal(bassjackers[bassjackers.length - 1]!.timestamp, 59 * 60 + 30);
let bjPrev = -1;
for (const p of bassjackers) {
  assert.ok(
    p.timestamp >= bjPrev,
    `Bassjackers TML clocks must not go back @ ${p.timestamp}`,
  );
  bjPrev = p.timestamp;
}

assertSeedClocks(TL_BHASKAR_TML_WE2_2026);
const bhaskar = tracklist1001RowsToPlays(TL_BHASKAR_TML_WE2_2026);
assert.equal(bhaskar.length, 17);
assert.match(bhaskar[0]!.trackTitle!, /Wonderful World/);
assert.equal(bhaskar[bhaskar.length - 1]!.trackTitle, "Celebrate Life");
assert.equal(bhaskar[bhaskar.length - 1]!.timestamp, 79 * 60);
let bhPrev = -1;
for (const p of bhaskar) {
  assert.ok(
    p.timestamp >= bhPrev,
    `Bhaskar TML clocks must not go back @ ${p.timestamp}`,
  );
  bhPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-HWIratXF1Bo"]!.length >= 17);

assertSeedClocks(TL_ERIC_PRYDZ_ULTRA_MIAMI_2026);
const prydzUltra = tracklist1001RowsToPlays(TL_ERIC_PRYDZ_ULTRA_MIAMI_2026);
assert.equal(prydzUltra.length, 31);
assert.equal(prydzUltra[0]!.trackTitle, "Heavy");
assert.match(prydzUltra[prydzUltra.length - 1]!.trackTitle!, /Midnight City/);
assert.equal(prydzUltra[prydzUltra.length - 1]!.timestamp, 112 * 60);
let prydzPrev = -1;
for (const p of prydzUltra) {
  assert.ok(
    p.timestamp > prydzPrev,
    `Eric Prydz Ultra clocks must increase @ ${p.timestamp}`,
  );
  prydzPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-hU-z3iV0LOg"],
  TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
);

assertSeedClocks(TL_DEBORAH_STREET_PARADE_2025);
const deborahSp = tracklist1001RowsToPlays(TL_DEBORAH_STREET_PARADE_2025);
assert.equal(deborahSp.length, 8);
assert.match(deborahSp[0]!.trackTitle!, /Baila/);
assert.match(deborahSp[deborahSp.length - 1]!.trackTitle!, /Bla Bla Bla/);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-7cK7rhYXbh8"]!.length >= 8);

assertSeedClocks(TL_KEVIN_DE_VRIES_STREET_PARADE_2025);
const kevinSp = tracklist1001RowsToPlays(TL_KEVIN_DE_VRIES_STREET_PARADE_2025);
assert.equal(kevinSp.length, 21);
assert.match(kevinSp[0]!.trackTitle!, /Before You Go/);
assert.match(kevinSp[kevinSp.length - 1]!.trackTitle!, /Sex On Fire/);
assert.equal(kevinSp[0]!.timestamp, 0);
assert.ok(kevinSp[kevinSp.length - 1]!.timestamp < 2 * 3600);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-S5qAspu0AbI"]!.length >= 21);

assertSeedClocks(TL_KOLSCH_STREET_PARADE_2025);
const kolschSp = tracklist1001RowsToPlays(TL_KOLSCH_STREET_PARADE_2025);
assert.equal(kolschSp.length, 24);
assert.equal(kolschSp[0]!.trackTitle, "Summersault");
assert.equal(kolschSp[kolschSp.length - 1]!.trackTitle, "3 Tage Wach");
assert.ok(kolschSp[kolschSp.length - 1]!.timestamp < 2 * 3600);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-pLldXE5OyCM"]!.length >= 24);

assertSeedClocks(TL_MASSANO_STREET_PARADE_2025);
const massanoSp = tracklist1001RowsToPlays(TL_MASSANO_STREET_PARADE_2025);
assert.equal(massanoSp.length, 23);
assert.equal(massanoSp[0]!.trackTitle, "Higher");
assert.equal(massanoSp[massanoSp.length - 1]!.trackTitle, "Afterglow");
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-fYM9DlFLwKw"]!.length >= 23);

assertSeedClocks(TL_ADIEL_STREET_PARADE_2025);
const adielSp = tracklist1001RowsToPlays(TL_ADIEL_STREET_PARADE_2025);
assert.equal(adielSp.length, 13);
assert.match(adielSp[0]!.trackTitle!, /010x/);
assert.equal(adielSp[adielSp.length - 1]!.trackTitle, "Nightride");
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-tuqAdrbkYZk"]!.length >= 13);

// --- Captured 2026-08-12 batch (Miss Monique BIORHYTHM, Ingrosso, Boris, Mike Williams, Plastik Funk, Zamna) ---
assertSeedClocks(TL_MISS_MONIQUE_BIORHYTHM);
const mmBio = tracklist1001RowsToPlays(TL_MISS_MONIQUE_BIORHYTHM);
assert.equal(mmBio.length, 22);
assert.match(mmBio[0]!.trackTitle!, /Concorde/);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1LpQZ5GTRDg"],
  TL_MISS_MONIQUE_BIORHYTHM,
);
// Distinct from Mainstage WE2.
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1LpQZ5GTRDg"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-WhPtvotfYbc"],
);

assertSeedClocks(TL_SEBASTIAN_INGROSSO_TML_WE2_2026);
const ingrosso = tracklist1001RowsToPlays(TL_SEBASTIAN_INGROSSO_TML_WE2_2026);
assert.ok(ingrosso.length >= 30);
assert.match(ingrosso[0]!.trackTitle!, /Miami 2 Ibiza/);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-g4vR2VlhNtk"],
  TL_SEBASTIAN_INGROSSO_TML_WE2_2026,
);

assertSeedClocks(TL_BORIS_BREJCHA_TML_WE1_2026);
const boris = tracklist1001RowsToPlays(TL_BORIS_BREJCHA_TML_WE1_2026);
assert.equal(boris.length, 13);
assert.match(boris[0]!.trackTitle!, /Cello Tears/);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-NpL_bT5vgmU"],
  TL_BORIS_BREJCHA_TML_WE1_2026,
);

assertSeedClocks(TL_MIKE_WILLIAMS_TML_WE2_2026);
const mikeW = tracklist1001RowsToPlays(TL_MIKE_WILLIAMS_TML_WE2_2026);
assert.ok(mikeW.length >= 30);
assert.match(mikeW[0]!.trackTitle!, /Greece 2000/);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-WnjXXOZ8Te8"],
  TL_MIKE_WILLIAMS_TML_WE2_2026,
);

assertSeedClocks(TL_PLASTIK_FUNK_NATURE_ONE_2025);
const plastik = tracklist1001RowsToPlays(TL_PLASTIK_FUNK_NATURE_ONE_2025);
assert.equal(plastik.length, 31);
assert.match(plastik[0]!.trackTitle!, /Dopamine/);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-dEX8Y8Mzkok"],
  TL_PLASTIK_FUNK_NATURE_ONE_2025,
);

assertSeedClocks(TL_ZAMNA_STREET_PARADE_2025);
const zamna = tracklist1001RowsToPlays(TL_ZAMNA_STREET_PARADE_2025);
assert.equal(zamna.length, 18);
assert.match(zamna[0]!.trackTitle!, /Use Somebody/);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1Mp9Pl6YgDM"],
  TL_ZAMNA_STREET_PARADE_2025,
);

// --- Captured 2026-08-13 batch ---
assertSeedClocks(TL_PAN_POT_STREET_PARADE_2025);
assert.equal(TL_PAN_POT_STREET_PARADE_2025.length, 33);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-LpFxQmtEeAA"],
  TL_PAN_POT_STREET_PARADE_2025,
);

assertSeedClocks(TL_HONEYLUV_STREET_PARADE_2025);
assert.equal(TL_HONEYLUV_STREET_PARADE_2025.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-WTN5ru2ceRE"],
  TL_HONEYLUV_STREET_PARADE_2025,
);

assertSeedClocks(TL_HONEYLUV_ANTS_USHUAIA_2026);
assert.equal(TL_HONEYLUV_ANTS_USHUAIA_2026.length, 9);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-sLtNC21myWM"],
  TL_HONEYLUV_ANTS_USHUAIA_2026,
);

assertSeedClocks(TL_PEGGY_GOU_EDC_LV_2026);
assert.equal(TL_PEGGY_GOU_EDC_LV_2026.length, 17);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-CMhFNEo0glw"],
  TL_PEGGY_GOU_EDC_LV_2026,
);

assertSeedClocks(TL_JOHN_SUMMIT_LOLLAPALOOZA);
assert.equal(TL_JOHN_SUMMIT_LOLLAPALOOZA.length, 41);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-9TKqqBCmDHA"],
  TL_JOHN_SUMMIT_LOLLAPALOOZA,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-johnsummit-john-summit-live-lollapalooza"],
  TL_JOHN_SUMMIT_LOLLAPALOOZA,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/johnsummit/john-summit-live-lollapalooza"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-9TKqqBCmDHA"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-PlArfyuzuqo"],
);
assert.equal(isWiredTracklistSlug("yt-9TKqqBCmDHA"), true);
assert.equal(
  isWiredTracklistSlug("sc-johnsummit-john-summit-live-lollapalooza"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-johnsummit-john-summit-live-lollapalooza"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-9TKqqBCmDHA"), false);
const summitLolla = tracklist1001RowsToPlays(TL_JOHN_SUMMIT_LOLLAPALOOZA);
assert.equal(summitLolla.length, 41);
assert.equal(summitLolla[0]?.provenance, "1001tl");
assert.equal(summitLolla[0]?.trackTitle, "SHADOWS");
assert.equal(summitLolla[5]?.trackTitle, "Are You Feeling The Vibe");
assert.equal(summitLolla[5]?.timestamp, 7 * 60 + 55);
assert.equal(summitLolla[40]?.trackTitle, "Delilah (Pull Me Out Of This)");
assert.equal(summitLolla[40]?.timestamp, 1 * 3600 + 27 * 60 + 53);
for (let i = 1; i < summitLolla.length; i++) {
  assert.ok(
    (summitLolla[i]!.timestamp ?? 0) > (summitLolla[i - 1]!.timestamp ?? 0),
    `John Summit Lollapalooza clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_PEGGY_GOU_CERCLE_LILLE);
assert.equal(TL_PEGGY_GOU_CERCLE_LILLE.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt--UOMvxh4MYU"],
  TL_PEGGY_GOU_CERCLE_LILLE,
);

assertSeedClocks(TL_MARTIN_GARRIX_TML_WE2_2026);
assert.equal(TL_MARTIN_GARRIX_TML_WE2_2026.length, 40);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-BUsCIK_kh_A"],
  TL_MARTIN_GARRIX_TML_WE2_2026,
);

assertSeedClocks(TL_THE_CHAINSMOKERS_TML_WE1_2026);
assert.equal(TL_THE_CHAINSMOKERS_TML_WE1_2026.length, 58);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1lqmFLr-SkA"],
  TL_THE_CHAINSMOKERS_TML_WE1_2026,
);

assertSeedClocks(TL_ALESSO_TML_WE2_2026);
assert.equal(TL_ALESSO_TML_WE2_2026.length, 54);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-fhiZ1Rj9o-A"],
  TL_ALESSO_TML_WE2_2026,
);

assertSeedClocks(TL_ARMIN_VAN_BUUREN_TML_WE2_2026);
assert.equal(TL_ARMIN_VAN_BUUREN_TML_WE2_2026.length, 43);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-tg_QLGpes0k"],
  TL_ARMIN_VAN_BUUREN_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-I6QA_T-BS6o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-tg_QLGpes0k"],
);

assertSeedClocks(TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026);
assert.equal(TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026.length, 18);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-sidepiece-sidepiece-lollapalooza-perry"],
  TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/sidepiece/sidepiece-lollapalooza-perry"
  ],
  undefined,
);
const sidepiecePlays = tracklist1001RowsToPlays(
  TL_SIDEPIECE_Lollapalooza_Perry_Stage_2026,
);
assert.equal(sidepiecePlays.length, 18);
assert.equal(sidepiecePlays[0]?.provenance, "1001tl");
assert.equal(sidepiecePlays[0]?.artistName, "Bobby Shmurda");
assert.equal(sidepiecePlays[8]?.trackTitle, "Can I Ride");

assertSeedClocks(TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026);
assert.equal(TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026.length, 27);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-hgbAN8NFNu0"],
  TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-tomorrowland-friendship-mix-steve-aoki-august-2026"
  ],
  TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026,
);
const aokiMix = tracklist1001RowsToPlays(TL_STEVE_AOKI_TML_FRIENDSHIP_MIX_2026);
assert.equal(aokiMix.length, 27);
assert.equal(aokiMix[0]?.provenance, "1001tl");
assert.equal(aokiMix[0]?.timestamp, 10);
assert.equal(aokiMix[0]?.trackTitle, "Pursuit Of Happiness");
assert.equal(aokiMix[26]?.trackTitle, "Put It In Reverse");
assert.equal(aokiMix[26]?.timestamp, 59 * 60 + 30);

assertSeedClocks(TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023);
assert.equal(TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-marten-horger-tomorrowland-mainstage-2023"],
  TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "SC-https://soundcloud.com/marten-horger/tomorrowland-mainstage-2023"
  ],
  undefined,
);
const horgerLib = tracklist1001RowsToPlays(
  TL_MARTEN_HORGER_TML_LIBRARY_WE1_2023,
);
assert.equal(horgerLib.length, 20);
assert.equal(horgerLib[0]?.provenance, "1001tl");
assert.equal(horgerLib[0]?.trackTitle, "The Calling");
assert.equal(horgerLib[19]?.trackTitle, "You Don't");
assert.equal(horgerLib[19]?.timestamp, 60 * 60 + 48);

assertSeedClocks(TL_MEN_MACHINE_1001_EXCLUSIVE_2026);
assert.equal(TL_MEN_MACHINE_1001_EXCLUSIVE_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-NTLDGnoWIRg"],
  TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-1001tracklists-men-machine-exclusive-mix-2026"
  ],
  TL_MEN_MACHINE_1001_EXCLUSIVE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/1001tracklists/men-machine-exclusive-mix-2026"
  ],
  undefined,
);
const menMachine = tracklist1001RowsToPlays(TL_MEN_MACHINE_1001_EXCLUSIVE_2026);
assert.equal(menMachine.length, 15);
assert.equal(menMachine[0]?.provenance, "1001tl");
assert.equal(menMachine[0]?.timestamp, 0);
assert.equal(menMachine[0]?.trackTitle, "The Past, The Present, The Future");
assert.equal(menMachine[14]?.trackTitle, "Engage");
assert.equal(menMachine[14]?.timestamp, 48 * 60 + 53);

assertSeedClocks(TL_ARMIN_OTTAVIANI_ASOT_1290_2026);
assert.equal(TL_ARMIN_OTTAVIANI_ASOT_1290_2026.length, 41);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-bxb6Tglooc4"],
  TL_ARMIN_OTTAVIANI_ASOT_1290_2026,
);
const asot1290 = tracklist1001RowsToPlays(TL_ARMIN_OTTAVIANI_ASOT_1290_2026);
assert.equal(asot1290.length, 41);
assert.equal(asot1290[0]?.provenance, "1001tl");
assert.equal(asot1290[0]?.timestamp, 45);
assert.equal(asot1290[0]?.trackTitle, "Awake");
assert.equal(asot1290[15]?.artistName, "Giuseppe Ottaviani & Ilan Bluestone");
assert.equal(asot1290[40]?.trackTitle, "Lazer Beams (Adam Beyer & Massano Remix)");
assert.equal(asot1290[40]?.timestamp, 60 * 60 + 57 * 60 + 45);

assertSeedClocks(TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026);
assert.equal(TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026.length, 67);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-pwXGm4HEQdo"],
  TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
);
const arminFreedom = tracklist1001RowsToPlays(
  TL_ARMIN_VAN_BUUREN_TML_WE1_FREEDOM_2026,
);
assert.equal(arminFreedom.length, 67);
assert.equal(arminFreedom[0]?.provenance, "1001tl");
assert.equal(arminFreedom[0]?.timestamp, 12);
assert.equal(
  arminFreedom[0]?.trackTitle,
  "No Mercy vs. The Age Of Love (Armin van Buuren Mashup)",
);
assert.equal(arminFreedom[66]?.trackTitle, "Set Me Free (VIP Mix)");
assert.equal(arminFreedom[66]?.timestamp, 2 * 3600 + 25 * 60 + 22);
for (let i = 1; i < arminFreedom.length; i++) {
  assert.ok(
    (arminFreedom[i]!.timestamp ?? 0) > (arminFreedom[i - 1]!.timestamp ?? 0),
    `clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025);
assert.equal(TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025.length, 46);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-NblVVOwQRqw"],
  TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-domdolla-dom-dolla-live-creamfields-steel-yard-2025"
  ],
  TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/domdolla/dom-dolla-live-creamfields-steel-yard-2025"
  ],
  undefined,
);
const domCream = tracklist1001RowsToPlays(
  TL_DOM_DOLLA_CREAMFIELDS_STEEL_YARD_2025,
);
assert.equal(domCream.length, 46);
assert.equal(domCream[0]?.provenance, "1001tl");
assert.equal(domCream[0]?.timestamp, 0);
assert.equal(domCream[0]?.trackTitle, "It's About Time");
assert.equal(domCream[45]?.trackTitle, "Malfunktion");
assert.equal(domCream[45]?.timestamp, 60 * 60 + 27 * 60 + 4);
for (let i = 1; i < domCream.length; i++) {
  assert.ok(
    (domCream[i]!.timestamp ?? 0) > (domCream[i - 1]!.timestamp ?? 0),
    `clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026);
assert.equal(TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-vpf4LLy42Zc"],
  TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
);
const marlonCoachella = tracklist1001RowsToPlays(
  TL_MARLON_HOFFSTADT_COACHELLA_WE2_2026,
);
assert.equal(marlonCoachella.length, 15);
assert.equal(marlonCoachella[0]?.provenance, "1001tl");
assert.equal(marlonCoachella[0]?.timestamp, 0);
assert.equal(marlonCoachella[0]?.trackTitle, "Stomp Your Feet");
assert.equal(marlonCoachella[14]?.trackTitle, "Memories (Marlon Hoffstadt Edit)");
assert.equal(marlonCoachella[14]?.timestamp, 55 * 60 + 48);
for (let i = 1; i < marlonCoachella.length; i++) {
  assert.ok(
    (marlonCoachella[i]!.timestamp ?? 0) >
      (marlonCoachella[i - 1]!.timestamp ?? 0),
    `clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026);
assert.equal(
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026.length,
  31,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-WWnLYZrh6kw"],
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-markusschulz-gdjb-aug132026"],
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/markusschulz/gdjb-aug132026"
  ],
  undefined,
);
const gdjb = tracklist1001RowsToPlays(
  TL_MARKUS_SCHULZ_AND_JEROME_ISMA_AE_GDJB_2026,
);
assert.equal(gdjb.length, 31);
assert.equal(gdjb[0]?.provenance, "1001tl");
assert.equal(gdjb[0]?.timestamp, 33);
assert.equal(gdjb[0]?.trackTitle, "The Answer");
assert.equal(
  gdjb[30]?.trackTitle,
  "Sparks In The Night (Ciaran McAuley Remix)",
);
assert.equal(gdjb[30]?.timestamp, 1 * 3600 + 56 * 60 + 31);
for (let i = 1; i < gdjb.length; i++) {
  assert.ok(
    (gdjb[i]!.timestamp ?? 0) > (gdjb[i - 1]!.timestamp ?? 0),
    `clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ALOK_TML_WE2_2026);
assert.equal(TL_ALOK_TML_WE2_2026.length, 45);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-zHAUZ02aCwo"],
  TL_ALOK_TML_WE2_2026,
);
const alokTml = tracklist1001RowsToPlays(TL_ALOK_TML_WE2_2026);
assert.equal(alokTml.length, 44);
assert.equal(alokTml[0]?.provenance, "1001tl");
assert.equal(alokTml[0]?.timestamp, 12);
assert.equal(alokTml[0]?.trackTitle, "Around");
assert.equal(alokTml[43]?.trackTitle, "Around");
assert.equal(alokTml[43]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < alokTml.length; i++) {
  assert.ok(
    (alokTml[i]!.timestamp ?? 0) > (alokTml[i - 1]!.timestamp ?? 0),
    `Alok TML clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINTAGE_CULTURE_EDC_LV_NEON_2025);
assert.equal(TL_VINTAGE_CULTURE_EDC_LV_NEON_2025.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-knJyJPP45dg"],
  TL_VINTAGE_CULTURE_EDC_LV_NEON_2025,
);
const vcNeon = tracklist1001RowsToPlays(TL_VINTAGE_CULTURE_EDC_LV_NEON_2025);
assert.equal(vcNeon.length, 16);
assert.equal(vcNeon[0]?.provenance, "1001tl");
assert.equal(vcNeon[0]?.timestamp, 14);
assert.equal(vcNeon[0]?.trackTitle, "The Funk Phenomena (Viot Remix)");
assert.equal(vcNeon[6]?.trackTitle, "Bad Habit (Clüb De Combat Remix)");
assert.equal(vcNeon[7]?.trackTitle, "Smack My Bitch Up (Clüb De Combat Remix)");
assert.equal(vcNeon[14]?.trackTitle, "DJ Assault");
assert.equal(vcNeon[15]?.trackTitle, "Lost");
assert.equal(vcNeon[15]?.timestamp, 1 * 3600 + 8 * 60 + 35);
for (let i = 1; i < vcNeon.length; i++) {
  assert.ok(
    (vcNeon[i]!.timestamp ?? 0) > (vcNeon[i - 1]!.timestamp ?? 0),
    `Vintage Culture Neon clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026);
assert.equal(TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026.length, 14);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-kmMYCg-igjc"],
  TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026,
);
const vcBoa = tracklist1001RowsToPlays(TL_VINTAGE_CULTURE_SO_TRACK_BOA_2026);
assert.equal(vcBoa.length, 14);
assert.equal(vcBoa[0]?.provenance, "1001tl");
assert.equal(vcBoa[0]?.timestamp, 0);
assert.equal(vcBoa[0]?.trackTitle, "Off My Head");
assert.equal(vcBoa[13]?.trackTitle, "She The Last One (Acappella)");
assert.equal(vcBoa[13]?.timestamp, 1 * 3600 + 17 * 60 + 44);
for (let i = 1; i < vcBoa.length; i++) {
  assert.ok(
    (vcBoa[i]!.timestamp ?? 0) > (vcBoa[i - 1]!.timestamp ?? 0),
    `Vintage Culture Só Track Boa clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINTAGE_CULTURE_PACHA_IBIZA_2026);
assert.equal(TL_VINTAGE_CULTURE_PACHA_IBIZA_2026.length, 14);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OVex0rm7ZR4"],
  TL_VINTAGE_CULTURE_PACHA_IBIZA_2026,
);
const vcPacha = tracklist1001RowsToPlays(TL_VINTAGE_CULTURE_PACHA_IBIZA_2026);
assert.equal(vcPacha.length, 14);
assert.equal(vcPacha[0]?.provenance, "1001tl");
assert.equal(vcPacha[0]?.timestamp, 0);
assert.equal(vcPacha[0]?.trackTitle, "I Need It");
assert.equal(vcPacha[13]?.trackTitle, "It Is Simple But It Works Like Fcuk");
assert.equal(vcPacha[13]?.timestamp, 1 * 3600 + 7 * 60 + 5);
for (let i = 1; i < vcPacha.length; i++) {
  assert.ok(
    (vcPacha[i]!.timestamp ?? 0) > (vcPacha[i - 1]!.timestamp ?? 0),
    `Vintage Culture Pacha Ibiza clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINTAGE_CULTURE_NYC_YACHT_2023);
assert.equal(TL_VINTAGE_CULTURE_NYC_YACHT_2023.length, 28);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-6bJZPDKlq7o"],
  TL_VINTAGE_CULTURE_NYC_YACHT_2023,
);
const vcYacht = tracklist1001RowsToPlays(TL_VINTAGE_CULTURE_NYC_YACHT_2023);
assert.equal(vcYacht.length, 28);
assert.equal(vcYacht[0]?.provenance, "1001tl");
assert.equal(vcYacht[0]?.timestamp, 0);
assert.equal(vcYacht[0]?.artistName, "Vintage Culture & Fideles ft. Be");
assert.equal(vcYacht[0]?.trackTitle, "No Rain - Fallen Leaf (ID Remix)");
assert.equal(vcYacht[4]?.trackTitle, "Tina (ID Remix)");
assert.equal(vcYacht[23]?.trackTitle, "You Give Me A Feeling (Roddy Lima RMX)");
assert.equal(vcYacht[23]?.timestamp, 3600 + 45 * 60 + 3);
assert.equal(vcYacht[27]?.trackTitle, "Spring Girl");
assert.equal(vcYacht[27]?.timestamp, 2 * 3600 + 4 * 60);
assert.equal(
  vcYacht.some((p) => /^id$/i.test(p.trackTitle ?? "")),
  false,
  "bare ID–ID rows must stay dropped",
);
assert.equal(
  vcYacht.some((p) => /sun in her eyes|what you know/i.test(p.trackTitle ?? "")),
  false,
  "1001 lightbulb guesses are not accepted IDs",
);
for (let i = 1; i < vcYacht.length; i++) {
  assert.ok(
    (vcYacht[i]!.timestamp ?? 0) > (vcYacht[i - 1]!.timestamp ?? 0),
    `Vintage Culture NYC Yacht clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_HARDWELL_HOA_527_YEARMIX_2025);
assert.equal(TL_HARDWELL_HOA_527_YEARMIX_2025.length, 83);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OXwK0CSmXzY"],
  TL_HARDWELL_HOA_527_YEARMIX_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-hardwell-hardwell-on-air-527-yearmix"],
  TL_HARDWELL_HOA_527_YEARMIX_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/hardwell/hardwell-on-air-527-yearmix"
  ],
  undefined,
);
const hoa527 = tracklist1001RowsToPlays(TL_HARDWELL_HOA_527_YEARMIX_2025);
assert.equal(hoa527.length, 83);
assert.equal(hoa527[0]?.provenance, "1001tl");
assert.equal(hoa527[0]?.timestamp, 58);
assert.equal(hoa527[0]?.trackTitle, "Sanctuary");
assert.equal(hoa527[82]?.trackTitle, "Brace For Impact");
assert.equal(isWiredTracklistSlug("yt-zHAUZ02aCwo"), true);
assert.equal(isWiredTracklistSlug("yt-knJyJPP45dg"), true);
assert.equal(isWiredTracklistSlug("yt-kmMYCg-igjc"), true);
assert.equal(isWiredTracklistSlug("yt-OVex0rm7ZR4"), true);
assert.equal(isWiredTracklistSlug("yt-6bJZPDKlq7o"), true);
assert.equal(isWiredTracklistSlug("yt-OXwK0CSmXzY"), true);
assert.equal(isWiredTracklistSlug("sc-hardwell-hardwell-on-air-527-yearmix"), true);
assert.equal(isWiredTracklistSlug("yt-not-a-real-seed"), false);
assert.equal(isWiredTracklistSlug("yt-i-mFuxbGHzg"), true);
assert.equal(isWiredTracklistSlug("sc-jamie-jones-hot-robot-radio-225"), true);
assert.equal(isWiredTracklistSlug("sc-jamie-jones-hot-robot-radio-239"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024",
  ),
  true,
);
assert.equal(isWiredTracklistSlug("yt-SeKRNa26kug"), true);
assert.equal(isWiredTracklistSlug("yt-soEFl73peVA"), true);
assert.equal(isWiredTracklistSlug("sc-joelcorry-edgenyc"), true);
assert.equal(isWiredTracklistSlug("yt-Rgx-wT9FDaE"), true);
assert.equal(isWiredTracklistSlug("yt-0-s_qZRWElA"), true);
assert.equal(isWiredTracklistSlug("yt-blP5J6BUG0M"), true);
assert.equal(isWiredTracklistSlug("yt-yTRvLrtsM9I"), true);
assert.equal(isWiredTracklistSlug("yt-phWKhIwgiTo"), true);
assert.equal(isWiredTracklistSlug("yt-TsyGMhx8izw"), true);
assert.equal(isWiredTracklistSlug("yt-B05MAbsCOLA"), true);
assert.equal(
  isWiredTracklistSlug("sc-sashaofficial-sasha-eclipse-mix-12-8-26"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-k4Drn6AwAdk"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-maxstyler-max-styler-live-opulent-temple-burning-man-2024",
  ),
  true,
);
assert.equal(isWiredTracklistSlug("yt-arowbYnNFGY"), true);
assert.equal(
  isWiredTracklistSlug("sc-hannahlaingdj-hannah-laing-creamfields-2024-audio"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-8aDoUu4GDrc"), true);
assert.equal(isWiredTracklistSlug("sc-noraenpure-purified-520"), true);
assert.equal(isWiredTracklistSlug("yt-5JxfEjVdQFk"), true);
assert.equal(
  isWiredTracklistSlug("sc-korolovadj-korolova-captive-soul-98"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-rLTCLSsqrXY"), true);
assert.equal(
  isWiredTracklistSlug("sc-jameshypethedj-sync-london-full-set"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-JLIYTueL4TI"), true);
assert.equal(
  isWiredTracklistSlug("sc-eric-prydz-eric-prydz-presents-463760700"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-xv6hpdqKlxg"), true);
assert.equal(isWiredTracklistSlug("sc-eric-prydz-epic-radio-025"), true);
assert.equal(isWiredTracklistSlug("yt-t5KwF_VsM50"), true);
assert.equal(isWiredTracklistSlug("sc-honey-dijon-dekmantel"), false);
assert.equal(isWiredTracklistSlug("yt-193z2Yyb-4g"), true);
assert.equal(isWiredTracklistSlug("yt-/193z2Yyb-4g"), false);
assert.equal(isWiredTracklistSlug("sc-vinai-s2o"), false);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/eric-prydz/epic-radio-025",
  ),
  false,
);
assert.equal(
  isWiredTracklistSlug("sc-bradeazy-bradeazy-live-lollapalooza"),
  true,
);
assert.equal(
  isWiredTracklistSlug("sc-amelielens-amelie-lens-radio-show-022"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-wuMQeEJ3YnQ"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-oliverheldens-oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024",
  ),
  true,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/bradeazy/bradeazy-live-lollapalooza",
  ),
  false,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/amelielens/amelie-lens-radio-show-022",
  ),
  false,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/oliverheldens/oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024",
  ),
  false,
);
assert.equal(
  isWiredTracklistSlug(
    "mc-ericprydz-epicradio-epic-radio-036",
  ),
  false,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/sashaofficial/sasha-eclipse-mix-12-8-26",
  ),
  false,
);

assertSeedClocks(TL_JAMIE_JONES_HOT_ROBOT_RADIO_225);
assert.equal(TL_JAMIE_JONES_HOT_ROBOT_RADIO_225.length, 7);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-jamie-jones-hot-robot-radio-225"],
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_225,
);
const hrr225 = tracklist1001RowsToPlays(TL_JAMIE_JONES_HOT_ROBOT_RADIO_225);
assert.equal(hrr225.length, 7);
assert.equal(hrr225[0]?.provenance, "1001tl");
assert.equal(hrr225[0]?.timestamp, 47);
assert.equal(hrr225[0]?.trackTitle, "Bassline Soldiers");
assert.equal(hrr225[6]?.trackTitle, "Clurb");
assert.equal(hrr225[6]?.timestamp, 50 * 60 + 10);
for (let i = 1; i < hrr225.length; i++) {
  assert.ok(
    (hrr225[i]!.timestamp ?? 0) > (hrr225[i - 1]!.timestamp ?? 0),
    `HRR 225 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_JAMIE_JONES_HOT_ROBOT_RADIO_239);
assert.equal(TL_JAMIE_JONES_HOT_ROBOT_RADIO_239.length, 7);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-jamie-jones-hot-robot-radio-239"],
  TL_JAMIE_JONES_HOT_ROBOT_RADIO_239,
);
const hrr239 = tracklist1001RowsToPlays(TL_JAMIE_JONES_HOT_ROBOT_RADIO_239);
assert.equal(hrr239.length, 7);
assert.equal(hrr239[0]?.provenance, "1001tl");
assert.equal(hrr239[0]?.timestamp, 20);
assert.equal(hrr239[0]?.trackTitle, "Booty Perculator");
assert.equal(hrr239[6]?.trackTitle, "Feels So Good");
assert.equal(hrr239[6]?.timestamp, 51 * 60 + 2);
for (let i = 1; i < hrr239.length; i++) {
  assert.ok(
    (hrr239[i]!.timestamp ?? 0) > (hrr239[i - 1]!.timestamp ?? 0),
    `HRR 239 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024);
assert.equal(TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024.length, 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024"
  ],
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-SeKRNa26kug"],
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
);
const vcArodes = tracklist1001RowsToPlays(
  TL_VINTAGE_CULTURE_ARODES_BURNING_MAN_2024,
);
assert.equal(vcArodes.length, 22);
assert.equal(vcArodes[0]?.provenance, "1001tl");
assert.equal(vcArodes[0]?.timestamp, 0);
assert.equal(vcArodes[0]?.trackTitle, "The Church");
assert.equal(vcArodes[21]?.trackTitle, "Bad Habit (Alex Metric Remix)");
assert.equal(vcArodes[21]?.timestamp, 1 * 3600 + 46 * 60 + 10);
for (let i = 1; i < vcArodes.length; i++) {
  assert.ok(
    (vcArodes[i]!.timestamp ?? 0) > (vcArodes[i - 1]!.timestamp ?? 0),
    `Vintage Culture Arodes clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_JOEL_CORRY_EDGE_NYC_2026);
assert.equal(TL_JOEL_CORRY_EDGE_NYC_2026.length, 55);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-soEFl73peVA"],
  TL_JOEL_CORRY_EDGE_NYC_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-joelcorry-edgenyc"],
  TL_JOEL_CORRY_EDGE_NYC_2026,
);
const joelEdge = tracklist1001RowsToPlays(TL_JOEL_CORRY_EDGE_NYC_2026);
assert.equal(joelEdge.length, 55);
assert.equal(joelEdge[0]?.provenance, "1001tl");
assert.equal(joelEdge[0]?.timestamp, 60);
assert.equal(joelEdge[0]?.trackTitle, "Devotion (Sweetest Emotion)");
assert.equal(joelEdge[54]?.trackTitle, "Head & Heart");
assert.equal(joelEdge[54]?.timestamp, 2 * 3600 + 28 * 60 + 40);
for (let i = 1; i < joelEdge.length; i++) {
  assert.ok(
    (joelEdge[i]!.timestamp ?? 0) > (joelEdge[i - 1]!.timestamp ?? 0),
    `Joel Corry Edge NYC clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026);
assert.equal(TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026.length, 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eVjC42MNgkI"],
  TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687"
  ],
  TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-687"
  ],
  undefined,
);
const sth687 = tracklist1001RowsToPlays(TL_DVLM_SMASH_THE_HOUSE_RADIO_687_2026);
assert.equal(sth687.length, 22);
assert.equal(sth687[0]?.provenance, "1001tl");
assert.equal(sth687[0]?.timestamp, 60);
assert.equal(sth687[0]?.trackTitle, "Makina Time");
assert.equal(sth687[21]?.trackTitle, "Join The Club");
assert.equal(sth687[21]?.timestamp, 57 * 60 + 17);
for (let i = 1; i < sth687.length; i++) {
  assert.ok(
    (sth687[i]!.timestamp ?? 0) > (sth687[i - 1]!.timestamp ?? 0),
    `Smash The House Radio 687 clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-eVjC42MNgkI"), true);
assert.equal(
  isWiredTracklistSlug("sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687"),
  true,
);

assertSeedClocks(TL_DVLM_SMASH_THE_HOUSE_RADIO_690_2026);
assert.equal(TL_DVLM_SMASH_THE_HOUSE_RADIO_690_2026.length, 21);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OcUFACTYqL8"],
  TL_DVLM_SMASH_THE_HOUSE_RADIO_690_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690"
  ],
  TL_DVLM_SMASH_THE_HOUSE_RADIO_690_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690"
  ],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690"],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OcUFACTYqL8"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eVjC42MNgkI"],
);
const sth690 = tracklist1001RowsToPlays(TL_DVLM_SMASH_THE_HOUSE_RADIO_690_2026);
assert.equal(sth690.length, 21);
assert.equal(sth690[0]?.provenance, "1001tl");
assert.equal(sth690[0]?.timestamp, 0);
assert.equal(sth690[0]?.trackTitle, "Bless The Rain");
assert.equal(sth690[20]?.trackTitle, "Burn It Down");
assert.equal(sth690[20]?.timestamp, 57 * 60 + 28);
for (let i = 1; i < sth690.length; i++) {
  assert.ok(
    (sth690[i]!.timestamp ?? 0) > (sth690[i - 1]!.timestamp ?? 0),
    `Smash The House Radio 690 clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-OcUFACTYqL8"), true);
assert.equal(
  isWiredTracklistSlug("sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-OcUFACTYqL8"), false);
assert.equal(
  isSecondaryPlaybackSlug("sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690"),
  true,
);

assertSeedClocks(TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026);
assert.equal(TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026.length, 28);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-9vgSTomhCp8"],
  TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-notiondj-notion-live-at-lollapalooza"],
  TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "https://soundcloud.com/notiondj/notion-live-at-lollapalooza"
  ],
  undefined,
);
const notionPerry = tracklist1001RowsToPlays(
  TL_NOTION_PERRYS_LOLLAPALOOZA_CHICAGO_2026,
);
assert.equal(notionPerry.length, 28);
assert.equal(notionPerry[0]?.provenance, "1001tl");
assert.equal(notionPerry[0]?.timestamp, 5 * 60 + 40);
assert.equal(notionPerry[0]?.trackTitle, "Damager");
assert.equal(notionPerry[27]?.trackTitle, "DARWIN");
assert.equal(notionPerry[27]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < notionPerry.length; i++) {
  assert.ok(
    (notionPerry[i]!.timestamp ?? 0) > (notionPerry[i - 1]!.timestamp ?? 0),
    `NOTION Perry's Lollapalooza clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-9vgSTomhCp8"), true);
assert.equal(
  isWiredTracklistSlug("sc-notiondj-notion-live-at-lollapalooza"),
  true,
);

assertSeedClocks(TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026);
assert.equal(TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xXRjglkAmq8"],
  TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-edmfamilylivesets2025-vintage-culture-live-ultra"
  ],
  undefined,
);
const vcUltra = tracklist1001RowsToPlays(
  TL_VINTAGE_CULTURE_ULTRA_MIAMI_RESISTANCE_2026,
);
assert.equal(vcUltra.length, 20);
assert.equal(vcUltra[0]?.provenance, "1001tl");
assert.equal(vcUltra[0]?.timestamp, 0);
assert.equal(vcUltra[0]?.artistName, "Vintage Culture & Nariman & rhys from the sticks");
assert.equal(vcUltra[0]?.trackTitle, "Think Too Much");
assert.equal(vcUltra[2]?.trackTitle, "Hands Up");
assert.equal(vcUltra[2]?.timestamp, 9 * 60 + 20);
assert.equal(vcUltra[3]?.trackTitle, "Rave");
assert.equal(vcUltra[3]?.timestamp, 13 * 60 + 55);
assert.equal(vcUltra[9]?.trackTitle, "Oldskool Flavor");
assert.equal(vcUltra[9]?.timestamp, 39 * 60 + 40);
assert.equal(vcUltra[10]?.timestamp, 43 * 60 + 50);
assert.equal(vcUltra[11]?.timestamp, 48 * 60);
assert.equal(vcUltra[13]?.trackTitle, "Malabaris");
assert.equal(vcUltra[13]?.timestamp, 56 * 60 + 20);
assert.equal(vcUltra[14]?.trackTitle, "Deep Desire");
assert.equal(vcUltra[15]?.trackTitle, "Funky Bassline (Beltran Remix)");
assert.equal(vcUltra[16]?.trackTitle, "Tina (Doriann Remix)");
assert.equal(vcUltra[16]?.timestamp, 3600 + 11 * 60 + 30);
assert.equal(vcUltra[19]?.trackTitle, "Time To Pretend (ANNA Edit)");
assert.equal(vcUltra[19]?.timestamp, 3600 + 25 * 60 + 45);
assert.equal(
  vcUltra.some((p) => /^id$/i.test(p.trackTitle ?? "")),
  false,
  "bare ID–ID rows must stay dropped",
);
for (let i = 1; i < vcUltra.length; i++) {
  assert.ok(
    (vcUltra[i]!.timestamp ?? 0) > (vcUltra[i - 1]!.timestamp ?? 0),
    `Vintage Culture Ultra Miami clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-xXRjglkAmq8"), true);
assert.equal(
  isWiredTracklistSlug("sc-edmfamilylivesets2025-vintage-culture-live-ultra"),
  false,
);

assertSeedClocks(TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026);
assert.equal(TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026.length, 6);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-keinemusik-keinemusik-radio-show-by-lazarusman-03072026"
  ],
  TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/keinemusik/keinemusik-radio-show-by-lazarusman-03072026"
  ],
  undefined,
);
const kmLazarus = tracklist1001RowsToPlays(
  TL_LAZARUSMAN_KEINEMUSIK_RADIO_SHOW_2026,
);
assert.equal(kmLazarus.length, 6);
assert.equal(kmLazarus[0]?.provenance, "1001tl");
assert.equal(kmLazarus[0]?.timestamp, 0);
assert.equal(kmLazarus[0]?.trackTitle, "In You Go");
assert.equal(kmLazarus[5]?.trackTitle, "Breakdown");
assert.equal(kmLazarus[5]?.timestamp, 58 * 60 + 10);
for (let i = 1; i < kmLazarus.length; i++) {
  assert.ok(
    (kmLazarus[i]!.timestamp ?? 0) > (kmLazarus[i - 1]!.timestamp ?? 0),
    `Lazarusman Keinemusik Radio clocks must increase at index ${i}`,
  );
}
assert.equal(
  isWiredTracklistSlug(
    "sc-keinemusik-keinemusik-radio-show-by-lazarusman-03072026",
  ),
  true,
);

assertSeedClocks(TL_VINTAGE_CULTURE_PACHA_NYC_2026);
assert.equal(TL_VINTAGE_CULTURE_PACHA_NYC_2026.length, 40);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-TDuFnUAo4II"],
  TL_VINTAGE_CULTURE_PACHA_NYC_2026,
);
const vcPachaNyc = tracklist1001RowsToPlays(TL_VINTAGE_CULTURE_PACHA_NYC_2026);
assert.equal(vcPachaNyc.length, 40);
assert.equal(vcPachaNyc[0]?.provenance, "1001tl");
assert.equal(vcPachaNyc[0]?.timestamp, 0);
assert.equal(vcPachaNyc[0]?.trackTitle, "Hands Up");
assert.equal(vcPachaNyc[8]?.artistName, "JØRD");
assert.equal(vcPachaNyc[39]?.trackTitle, "Celebration (Antdot & Maz Edit)");
assert.equal(vcPachaNyc[39]?.timestamp, 3 * 3600 + 23 * 60 + 23);
for (let i = 1; i < vcPachaNyc.length; i++) {
  assert.ok(
    (vcPachaNyc[i]!.timestamp ?? 0) > (vcPachaNyc[i - 1]!.timestamp ?? 0),
    `Vintage Culture Pacha NYC clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-TDuFnUAo4II"), true);

assertSeedClocks(TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022);
assert.equal(TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022.length, 58);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-fQweMs-Q3rg"],
  TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-b-2YA4yC3UA"],
  TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022,
);
const clapBa = tracklist1001RowsToPlays(TL_CLAPTONE_MASQUERADE_BUENOS_AIRES_2022);
assert.equal(clapBa.length, 58);
assert.equal(clapBa[0]?.provenance, "1001tl");
assert.equal(clapBa[0]?.timestamp, 4 * 60);
assert.equal(clapBa[0]?.trackTitle, "Groove Cruise");
assert.equal(clapBa[13]?.timestamp, 42 * 60);
assert.equal(clapBa[32]?.timestamp, 42 * 60 + 19);
assert.equal(clapBa[57]?.trackTitle, "No Eyes (Acappella)");
assert.equal(clapBa[57]?.timestamp, 3600 + 40 * 60 + 32);
for (let i = 1; i < clapBa.length; i++) {
  assert.ok(
    (clapBa[i]!.timestamp ?? 0) > (clapBa[i - 1]!.timestamp ?? 0),
    `Claptone Masquerade BA clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-fQweMs-Q3rg"), true);
assert.equal(isWiredTracklistSlug("yt-b-2YA4yC3UA"), true);

assertSeedClocks(TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025);
assert.equal(TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025.length, 26);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xUdcEDryN8o"],
  TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-awakenings-indira-paganotto-awakenings-festival-2025"
  ],
  TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/awakenings/indira-paganotto-awakenings-festival-2025"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xUdcEDryN8o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yPCOu0-JKJo"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xUdcEDryN8o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-i-mFuxbGHzg"],
);
const indiraAwake = tracklist1001RowsToPlays(
  TL_INDIRA_PAGANOTTO_AREA_V_AWAKENINGS_2025,
);
assert.equal(indiraAwake.length, 26);
assert.equal(indiraAwake[0]?.provenance, "1001tl");
assert.equal(indiraAwake[0]?.timestamp, 70);
assert.equal(indiraAwake[0]?.artistName, "Vegas & Vermont");
assert.equal(indiraAwake[0]?.trackTitle, "Jahbulam");
assert.equal(indiraAwake[17]?.trackTitle, "Won't Be Possible");
assert.equal(indiraAwake[17]?.timestamp, 3600 + 60 + 21);
assert.equal(indiraAwake[24]?.artistName, "ID ft. Bilja Krstic");
assert.equal(indiraAwake[24]?.trackTitle, "Magla Padnala");
assert.equal(indiraAwake[24]?.timestamp, 3600 + 22 * 60 + 1);
assert.equal(indiraAwake[25]?.trackTitle, "Pressure (Indira Paganotto Remix)");
assert.equal(indiraAwake[25]?.timestamp, 3600 + 26 * 60 + 17);
assert.equal(
  indiraAwake.some((p) => /^id$/i.test(p.trackTitle ?? "")),
  false,
  "bare ID–ID rows must stay dropped; Magla Padnala is a named title",
);
for (let i = 1; i < indiraAwake.length; i++) {
  assert.ok(
    (indiraAwake[i]!.timestamp ?? 0) > (indiraAwake[i - 1]!.timestamp ?? 0),
    `Indira Paganotto Area V Awakenings clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-xUdcEDryN8o"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-awakenings-indira-paganotto-awakenings-festival-2025",
  ),
  true,
);

assertSeedClocks(TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026);
assert.equal(TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7UcyaKbvy2o"],
  TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-korolova-live-snowattack"],
  TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/korolovadj/korolova-live-snowattack"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7UcyaKbvy2o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5JxfEjVdQFk"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7UcyaKbvy2o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-RLOghpXjuJI"],
);
const korolovaSnow = tracklist1001RowsToPlays(
  TL_KOROLOVA_SNOWATTACK_FESTIVAL_2026,
);
assert.equal(korolovaSnow.length, 13);
assert.equal(korolovaSnow[0]?.provenance, "1001tl");
assert.equal(korolovaSnow[0]?.timestamp, 0);
assert.equal(korolovaSnow[0]?.artistName, "RÜFÜS DU SOL");
assert.equal(korolovaSnow[0]?.trackTitle, "In The Moment (Adriatique Remix)");
assert.equal(korolovaSnow[7]?.trackTitle, "My Mind");
assert.equal(korolovaSnow[7]?.timestamp, 26 * 60 + 7);
assert.equal(korolovaSnow[10]?.trackTitle, "Annihilation");
assert.equal(korolovaSnow[12]?.trackTitle, "The Man With The Red Face");
assert.equal(korolovaSnow[12]?.timestamp, 52 * 60 + 3);
for (let i = 1; i < korolovaSnow.length; i++) {
  assert.ok(
    (korolovaSnow[i]!.timestamp ?? 0) > (korolovaSnow[i - 1]!.timestamp ?? 0),
    `Korolova Snowattack clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-7UcyaKbvy2o"), true);
assert.equal(
  isWiredTracklistSlug("sc-korolovadj-korolova-live-snowattack"),
  true,
);

assertSeedClocks(TL_KOROLOVA_TULUM_MEXICO_2026);
assert.equal(TL_KOROLOVA_TULUM_MEXICO_2026.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-HvkAfj1QnK8"],
  TL_KOROLOVA_TULUM_MEXICO_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-korolovadj-korolova-tulum-mexico-melodic"
  ],
  TL_KOROLOVA_TULUM_MEXICO_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/korolovadj/korolova-tulum-mexico-melodic"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-HvkAfj1QnK8"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7UcyaKbvy2o"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-HvkAfj1QnK8"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5JxfEjVdQFk"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-HvkAfj1QnK8"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-RLOghpXjuJI"],
);
const korolovaTulum = tracklist1001RowsToPlays(
  TL_KOROLOVA_TULUM_MEXICO_2026,
);
assert.equal(korolovaTulum.length, 12);
assert.equal(korolovaTulum[0]?.provenance, "1001tl");
assert.equal(korolovaTulum[0]?.timestamp, 0);
assert.equal(korolovaTulum[0]?.artistName, "Omnya & Eli Huli");
assert.equal(korolovaTulum[0]?.trackTitle, "Lost In The Sound");
assert.equal(korolovaTulum[8]?.trackTitle, "Empty Skies");
assert.equal(korolovaTulum[8]?.timestamp, 33 * 60 + 58);
assert.equal(korolovaTulum[11]?.trackTitle, "Sunset In Colombo");
assert.equal(korolovaTulum[11]?.timestamp, 53 * 60 + 8);
for (let i = 1; i < korolovaTulum.length; i++) {
  assert.ok(
    (korolovaTulum[i]!.timestamp ?? 0) > (korolovaTulum[i - 1]!.timestamp ?? 0),
    `Korolova Tulum clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-HvkAfj1QnK8"), true);
assert.equal(
  isWiredTracklistSlug("sc-korolovadj-korolova-tulum-mexico-melodic"),
  true,
);

assertSeedClocks(TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025);
assert.equal(TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025.length, 35);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Nrl9yBX6Kpw"],
  TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/Nrl9yBX6Kpw"],
  undefined,
);
const natteAfas = tracklist1001RowsToPlays(
  TL_NATTE_VISSTICK_TELETECH_FYM_AFAS_LIVE_AMSTERDAM_2025,
);
assert.equal(natteAfas.length, 35);
assert.equal(natteAfas[0]?.provenance, "1001tl");
assert.equal(natteAfas[0]?.timestamp, 1);
assert.equal(natteAfas[0]?.artistName, "Natte Visstick");
assert.equal(natteAfas[0]?.trackTitle, "Show Intro");
assert.equal(natteAfas[4]?.trackTitle, "Deutsche Techno Bunker X Insomnia (Natte Visstick Mashup)");
assert.equal(natteAfas[4]?.timestamp, 7 * 60 + 35);
assert.equal(natteAfas[34]?.trackTitle, "Blood, Sweat And Hardcore (Natte Visstick Live Remix)");
assert.equal(natteAfas[34]?.timestamp, 56 * 60 + 3);
for (let i = 1; i < natteAfas.length; i++) {
  assert.ok(
    (natteAfas[i]!.timestamp ?? 0) > (natteAfas[i - 1]!.timestamp ?? 0),
    `Natte Visstick AFAS Live clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-Nrl9yBX6Kpw"), true);

assertSeedClocks(TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025);
assert.equal(TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-IfFnvi7O2Po"],
  TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-IfFnvi7O2Po"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7cK7rhYXbh8"],
);
const deborahAmnesia = tracklist1001RowsToPlays(
  TL_DEBORAH_DE_LUCA_PYRAMID_AMNESIA_IBIZA_2025,
);
assert.equal(deborahAmnesia.length, 13);
assert.equal(deborahAmnesia[0]?.provenance, "1001tl");
assert.equal(deborahAmnesia[0]?.timestamp, 20);
assert.equal(deborahAmnesia[0]?.artistName, "Maddix & Gabry Ponte");
assert.equal(deborahAmnesia[0]?.trackTitle, "Hellfire");
assert.equal(deborahAmnesia[5]?.trackTitle, "Baila Fuego");
assert.equal(deborahAmnesia[5]?.timestamp, 23 * 60 + 5);
assert.equal(deborahAmnesia[12]?.trackTitle, "DOMINATE");
assert.equal(deborahAmnesia[12]?.timestamp, 54 * 60 + 56);
for (let i = 1; i < deborahAmnesia.length; i++) {
  assert.ok(
    (deborahAmnesia[i]!.timestamp ?? 0) >
      (deborahAmnesia[i - 1]!.timestamp ?? 0),
    `Deborah De Luca Pyramid Amnesia clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-IfFnvi7O2Po"), true);

assertSeedClocks(TL_GIUSEPPE_OTTAVIANI_DIGITAL_SOCIETY_LEEDS_WAREHOUSE_2026);
assert.equal(
  TL_GIUSEPPE_OTTAVIANI_DIGITAL_SOCIETY_LEEDS_WAREHOUSE_2026.length,
  51,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-digitalsociety"
  ],
  TL_GIUSEPPE_OTTAVIANI_DIGITAL_SOCIETY_LEEDS_WAREHOUSE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/giuseppeottaviani/giuseppe-ottaviani-digitalsociety"
  ],
  undefined,
);
const goDigital = tracklist1001RowsToPlays(
  TL_GIUSEPPE_OTTAVIANI_DIGITAL_SOCIETY_LEEDS_WAREHOUSE_2026,
);
assert.equal(goDigital.length, 51);
assert.equal(goDigital[0]?.provenance, "1001tl");
assert.equal(goDigital[0]?.timestamp, 1);
assert.equal(goDigital[0]?.trackTitle, "Break The Loop");
assert.equal(goDigital[7]?.trackTitle, "What Is On Your Mind vs. Greece 2000 (Giuseppe Ottaviani Mashup)");
assert.equal(goDigital[50]?.trackTitle, "Adagio For Strings");
assert.equal(goDigital[50]?.timestamp, 2 * 3600 + 57 * 60 + 4);
for (let i = 1; i < goDigital.length; i++) {
  assert.ok(
    (goDigital[i]!.timestamp ?? 0) > (goDigital[i - 1]!.timestamp ?? 0),
    `Giuseppe Ottaviani Digital Society clocks must increase at index ${i}`,
  );
}
assert.equal(
  isWiredTracklistSlug("sc-giuseppeottaviani-giuseppe-ottaviani-digitalsociety"),
  true,
);

assertSeedClocks(TL_CUEBRICK_CONFERENCE_297_2026);
assert.equal(TL_CUEBRICK_CONFERENCE_297_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-cuebrick-cuebricks-conference-297"],
  TL_CUEBRICK_CONFERENCE_297_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/cuebrick/cuebricks-conference-297"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-cuebrick-cuebricks-conference-297"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-LLJn_gDMG_M"],
);
const cuebrick297 = tracklist1001RowsToPlays(TL_CUEBRICK_CONFERENCE_297_2026);
assert.equal(cuebrick297.length, 15);
assert.equal(cuebrick297[0]?.provenance, "1001tl");
assert.equal(cuebrick297[0]?.timestamp, 20);
assert.equal(cuebrick297[0]?.artistName, "Alexander Komarov");
assert.equal(cuebrick297[0]?.trackTitle, "My Soul");
assert.equal(cuebrick297[6]?.trackTitle, "Coming Home");
assert.equal(cuebrick297[6]?.timestamp, 24 * 60 + 2);
assert.equal(cuebrick297[14]?.trackTitle, "Ordinary");
assert.equal(cuebrick297[14]?.timestamp, 55 * 60 + 38);
for (let i = 1; i < cuebrick297.length; i++) {
  assert.ok(
    (cuebrick297[i]!.timestamp ?? 0) > (cuebrick297[i - 1]!.timestamp ?? 0),
    `Cuebrick Conference 297 clocks must increase at index ${i}`,
  );
}
assert.equal(
  isWiredTracklistSlug("sc-cuebrick-cuebricks-conference-297"),
  true,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/cuebrick/cuebricks-conference-297",
  ),
  false,
);

assertSeedClocks(TL_MEDUZA_STEREO_MONTREAL_CANADA_2026);
assert.equal(TL_MEDUZA_STEREO_MONTREAL_CANADA_2026.length, 91);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-meduzamusic-meduza-dj-set"],
  TL_MEDUZA_STEREO_MONTREAL_CANADA_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/meduzamusic/meduza_dj_set"
  ],
  undefined,
);
const meduzaStereo = tracklist1001RowsToPlays(
  TL_MEDUZA_STEREO_MONTREAL_CANADA_2026,
);
assert.equal(meduzaStereo.length, 91);
assert.equal(meduzaStereo[0]?.provenance, "1001tl");
assert.equal(meduzaStereo[0]?.timestamp, 0);
assert.equal(meduzaStereo[0]?.artistName, "The Organism");
assert.equal(meduzaStereo[0]?.trackTitle, "Gypsy");
assert.equal(meduzaStereo[8]?.trackTitle, "Tides");
assert.equal(meduzaStereo[8]?.timestamp, 50 * 60 + 57);
assert.equal(meduzaStereo[14]?.trackTitle, "Rave Love");
assert.equal(meduzaStereo[14]?.timestamp, 1 * 3600 + 41 * 60 + 53);
assert.equal(meduzaStereo[15]?.trackTitle, "A Gira (Emanuel Satie & Maga & Sean Doron & Tim Engelhardt pres. Scenarios Remix)");
assert.equal(meduzaStereo[15]?.timestamp, 1 * 3600 + 41 * 60 + 54);
assert.equal(meduzaStereo[90]?.trackTitle, "Black Water (Full Strings Vocal Mix)");
assert.equal(meduzaStereo[90]?.timestamp, 8 * 3600 + 53 * 60 + 10);
for (let i = 1; i < meduzaStereo.length; i++) {
  assert.ok(
    (meduzaStereo[i]!.timestamp ?? 0) > (meduzaStereo[i - 1]!.timestamp ?? 0),
    `MEDUZA Stereo Montréal clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("sc-meduzamusic-meduza-dj-set"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/meduzamusic/meduza_dj_set",
  ),
  false,
);

assertSeedClocks(TL_MEDUZA_CLUB_SPACE_MIAMI_2026);
assert.equal(TL_MEDUZA_CLUB_SPACE_MIAMI_2026.length, 62);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-meduzamusic-meduza-space-miami-march-13"],
  TL_MEDUZA_CLUB_SPACE_MIAMI_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/meduzamusic/meduza-space-miami-march-13"
  ],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-meduzamusic-meduza-club-space"],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-meduzamusic-meduza-space-miami-march-13"],
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-meduzamusic-meduza-dj-set"],
);
const meduzaSpace = tracklist1001RowsToPlays(TL_MEDUZA_CLUB_SPACE_MIAMI_2026);
assert.equal(meduzaSpace.length, 62);
assert.equal(meduzaSpace[0]?.provenance, "1001tl");
assert.equal(meduzaSpace[0]?.timestamp, 0);
assert.equal(meduzaSpace[0]?.artistName, "MEDUZA & Kevin de Vries");
assert.equal(meduzaSpace[0]?.trackTitle, "7 Days");
assert.equal(meduzaSpace[10]?.trackTitle, "Lose Control");
assert.equal(meduzaSpace[10]?.timestamp, 50 * 60 + 4);
assert.equal(meduzaSpace[61]?.trackTitle, "Careless Whisper");
assert.equal(meduzaSpace[61]?.timestamp, 4 * 3600 + 52 * 60 + 15);
for (let i = 1; i < meduzaSpace.length; i++) {
  assert.ok(
    (meduzaSpace[i]!.timestamp ?? 0) > (meduzaSpace[i - 1]!.timestamp ?? 0),
    `MEDUZA Club Space Miami clocks must increase at index ${i}`,
  );
}
assert.equal(
  isWiredTracklistSlug("sc-meduzamusic-meduza-space-miami-march-13"),
  true,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/meduzamusic/meduza-space-miami-march-13",
  ),
  false,
);
assert.equal(isWiredTracklistSlug("sc-meduzamusic-meduza-club-space"), false);
assert.equal(
  isWiredTracklistSlug(
    "sc-https://soundcloud.com/giuseppeottaviani/giuseppe-ottaviani-digitalsociety",
  ),
  false,
);

assertSeedClocks(TL_AUSTIN_KRAMER_UNRELEASED_139_2026);
assert.equal(TL_AUSTIN_KRAMER_UNRELEASED_139_2026.length, 19);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-QLpmLx5JUsg"],
  TL_AUSTIN_KRAMER_UNRELEASED_139_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/QLpmLx5JUsg"],
  undefined,
);
const austin139 = tracklist1001RowsToPlays(TL_AUSTIN_KRAMER_UNRELEASED_139_2026);
assert.equal(austin139.length, 19);
assert.equal(austin139[0]?.provenance, "1001tl");
assert.equal(austin139[0]?.timestamp, 0);
assert.equal(austin139[0]?.artistName, "B JONES & MIDI Kittyy");
assert.equal(austin139[0]?.trackTitle, "Universe");
assert.equal(austin139[5]?.trackTitle, "You Keep It Simple");
assert.equal(austin139[5]?.timestamp, 14 * 60 + 50);
assert.equal(austin139[18]?.trackTitle, "Begin Again");
assert.equal(austin139[18]?.timestamp, 57 * 60 + 15);
for (let i = 1; i < austin139.length; i++) {
  assert.ok(
    (austin139[i]!.timestamp ?? 0) > (austin139[i - 1]!.timestamp ?? 0),
    `Austin Kramer UNreleased 139 clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-QLpmLx5JUsg"), true);

assertSeedClocks(TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020);
assert.equal(TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-U2ZjW_8K3h4"],
  TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/U2ZjW_8K3h4"],
  undefined,
);
const jamieLostHorizon = tracklist1001RowsToPlays(
  TL_JAMIE_JONES_GAS_TOWER_LOST_HORIZON_FESTIVAL_2020,
);
assert.equal(jamieLostHorizon.length, 16);
assert.equal(jamieLostHorizon[0]?.provenance, "1001tl");
assert.equal(jamieLostHorizon[0]?.timestamp, 0);
assert.equal(jamieLostHorizon[0]?.artistName, "DJ Slugo");
assert.equal(jamieLostHorizon[0]?.trackTitle, "Cardboard Booty");
assert.equal(jamieLostHorizon[7]?.trackTitle, "Gotta Have It (Underground Mix)");
assert.equal(jamieLostHorizon[7]?.timestamp, 22 * 60 + 30);
assert.equal(jamieLostHorizon[15]?.trackTitle, "Halcyon On & On");
assert.equal(jamieLostHorizon[15]?.timestamp, 54 * 60 + 58);
for (let i = 1; i < jamieLostHorizon.length; i++) {
  assert.ok(
    (jamieLostHorizon[i]!.timestamp ?? 0) >
      (jamieLostHorizon[i - 1]!.timestamp ?? 0),
    `Jamie Jones Lost Horizon clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-U2ZjW_8K3h4"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-U2ZjW_8K3h4"],
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-jamie-jones-hot-robot-radio-225"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-U2ZjW_8K3h4"],
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-jamie-jones-hot-robot-radio-239"],
);

assertSeedClocks(TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026);
assert.equal(TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026.length, 73);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-loD-whuR5zc"],
  TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-oGS0A_R9tag"],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/loD-whuR5zc"],
  undefined,
);
const skrillexChile = tracklist1001RowsToPlays(
  TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026,
);
assert.equal(skrillexChile.length, 73);
assert.equal(skrillexChile[0]?.provenance, "1001tl");
assert.equal(skrillexChile[0]?.timestamp, 0);
assert.equal(skrillexChile[0]?.artistName, "Skrillex & Nitepunk");
assert.equal(skrillexChile[0]?.trackTitle, "Soma");
assert.equal(skrillexChile[24]?.trackTitle, "Listen Music Culture");
assert.equal(skrillexChile[24]?.timestamp, 36 * 60 + 30);
assert.equal(skrillexChile[71]?.trackTitle, "Kyoto (Skrillex & Virtual Riot VIP)");
assert.equal(skrillexChile[71]?.timestamp, 1 * 3600 + 25 * 60 + 20);
assert.equal(skrillexChile[72]?.trackTitle, "SAN DIEGO (VIP)");
assert.equal(skrillexChile[72]?.timestamp, 1 * 3600 + 25 * 60 + 21);
for (let i = 1; i < skrillexChile.length; i++) {
  assert.ok(
    (skrillexChile[i]!.timestamp ?? 0) > (skrillexChile[i - 1]!.timestamp ?? 0),
    `Skrillex Lollapalooza Chile clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-loD-whuR5zc"), true);
assert.equal(isWiredTracklistSlug("yt-oGS0A_R9tag"), false);

assertSeedClocks(TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024);
assert.equal(TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024.length, 10);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-42XFNGZrpaQ"],
  TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/42XFNGZrpaQ"],
  undefined,
);
const stussyEdinburgh = tracklist1001RowsToPlays(
  TL_CHRIS_STUSSY_BOILER_ROOM_EDINBURGH_2024,
);
assert.equal(stussyEdinburgh.length, 10);
assert.equal(stussyEdinburgh[0]?.provenance, "1001tl");
assert.equal(stussyEdinburgh[0]?.timestamp, 17);
assert.equal(stussyEdinburgh[0]?.artistName, "Moby");
assert.equal(stussyEdinburgh[0]?.trackTitle, "Go (Chris Stussy Edit)");
assert.equal(stussyEdinburgh[8]?.artistName, "Chris Stussy");
assert.equal(stussyEdinburgh[8]?.trackTitle, "Bounce To The Beat");
assert.equal(stussyEdinburgh[8]?.timestamp, 59 * 60 + 30);
assert.equal(stussyEdinburgh[9]?.trackTitle, "Something Going On (Acappella)");
assert.equal(stussyEdinburgh[9]?.timestamp, 1 * 3600 + 11 * 60 + 49);
for (let i = 1; i < stussyEdinburgh.length; i++) {
  assert.ok(
    (stussyEdinburgh[i]!.timestamp ?? 0) >
      (stussyEdinburgh[i - 1]!.timestamp ?? 0),
    `Chris Stussy Boiler Room Edinburgh clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-42XFNGZrpaQ"), true);

assertSeedClocks(TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026);
assert.equal(TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026.length, 33);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-FQj71mhobYw"],
  TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-joris-voorn-b2b-korolova-live"],
  TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/korolovadj/joris-voorn-b2b-korolova-live"
  ],
  undefined,
);
const voornKorolovaCove = tracklist1001RowsToPlays(
  TL_JORIS_VOORN_KOROLOVA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
);
assert.equal(voornKorolovaCove.length, 33);
assert.equal(voornKorolovaCove[0]?.provenance, "1001tl");
assert.equal(voornKorolovaCove[0]?.timestamp, 10);
assert.equal(voornKorolovaCove[0]?.artistName, "KREAM & Korolova");
assert.equal(voornKorolovaCove[0]?.trackTitle, "Annihilation");
assert.equal(voornKorolovaCove[19]?.trackTitle, "Utopia (Korolova Remix)");
assert.equal(voornKorolovaCove[19]?.timestamp, 1 * 3600 + 6 * 60 + 40);
assert.equal(voornKorolovaCove[32]?.trackTitle, "Kids (ANNA Edit)");
assert.equal(voornKorolovaCove[32]?.timestamp, 1 * 3600 + 54 * 60 + 20);
for (let i = 1; i < voornKorolovaCove.length; i++) {
  assert.ok(
    (voornKorolovaCove[i]!.timestamp ?? 0) >
      (voornKorolovaCove[i - 1]!.timestamp ?? 0),
    `Joris Voorn B2B Korolova Ultra Cove clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-FQj71mhobYw"), true);
assert.equal(
  isWiredTracklistSlug("sc-korolovadj-joris-voorn-b2b-korolova-live"),
  true,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-FQj71mhobYw"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yTRvLrtsM9I"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-FQj71mhobYw"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xXRjglkAmq8"],
);

assertSeedClocks(TL_COLYN_INNELLEA_ULTRA_MIAMI_RESISTANCE_COVE_2026);
assert.equal(TL_COLYN_INNELLEA_ULTRA_MIAMI_RESISTANCE_COVE_2026.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-2BPWWYAgUE4"],
  TL_COLYN_INNELLEA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-innellea-colyn-b2b-innella-at-ultra"],
  TL_COLYN_INNELLEA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/innellea/colyn-b2b-innella-at-ultra"
  ],
  undefined,
);
const colynInnelleaCove = tracklist1001RowsToPlays(
  TL_COLYN_INNELLEA_ULTRA_MIAMI_RESISTANCE_COVE_2026,
);
assert.equal(colynInnelleaCove.length, 16);
assert.equal(colynInnelleaCove[0]?.provenance, "1001tl");
assert.equal(colynInnelleaCove[0]?.timestamp, 0);
assert.equal(colynInnelleaCove[0]?.artistName, "Innellea");
assert.equal(colynInnelleaCove[0]?.trackTitle, "Slave To The Hype");
assert.equal(colynInnelleaCove[4]?.trackTitle, "Mercy (Innellea Remix)");
assert.equal(colynInnelleaCove[4]?.timestamp, 20 * 60 + 50);
assert.equal(colynInnelleaCove[15]?.trackTitle, "My Journey");
assert.equal(colynInnelleaCove[15]?.timestamp, 1 * 3600 + 25 * 60);
for (let i = 1; i < colynInnelleaCove.length; i++) {
  assert.ok(
    (colynInnelleaCove[i]!.timestamp ?? 0) >
      (colynInnelleaCove[i - 1]!.timestamp ?? 0),
    `Colyn B2B Innellea Ultra Cove clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-2BPWWYAgUE4"), true);
assert.equal(
  isWiredTracklistSlug("sc-innellea-colyn-b2b-innella-at-ultra"),
  true,
);

// Bizarrap & Skrillex Ultra Mainstage — official YT playback in, 1001 URL
// recorded, no cue paste. Do not invent 1001tl rows or sc-https://… slugs.
assert.equal(isWiredTracklistSlug("yt-0psLTNmJM38"), false);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-0psLTNmJM38"], undefined);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/0psLTNmJM38"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-loD-whuR5zc"), true);

assertSeedClocks(TL_ABOVE_AND_BEYOND_KINETICFIELD_EDC_LV_2026);
assert.equal(TL_ABOVE_AND_BEYOND_KINETICFIELD_EDC_LV_2026.length, 18);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OI02QgEA1Zw"],
  TL_ABOVE_AND_BEYOND_KINETICFIELD_EDC_LV_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OI02QgEA1Zw"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-phWKhIwgiTo"],
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/OI02QgEA1Zw"],
  undefined,
);
const abEdc = tracklist1001RowsToPlays(
  TL_ABOVE_AND_BEYOND_KINETICFIELD_EDC_LV_2026,
);
assert.equal(abEdc.length, 18);
assert.equal(abEdc[0]?.provenance, "1001tl");
assert.equal(abEdc[0]?.timestamp, 1);
assert.equal(abEdc[0]?.artistName, "Above & Beyond");
assert.equal(abEdc[0]?.trackTitle, "Stepping In");
assert.equal(abEdc[3]?.trackTitle, "ID");
assert.equal(abEdc[3]?.timestamp, 9 * 60 + 9);
assert.equal(abEdc[17]?.trackTitle, "Sun In Your Eyes");
assert.equal(abEdc[17]?.timestamp, 1 * 3600 + 11 * 60 + 11);
for (let i = 1; i < abEdc.length; i++) {
  assert.ok(
    (abEdc[i]!.timestamp ?? 0) > (abEdc[i - 1]!.timestamp ?? 0),
    `Above & Beyond EDC clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-OI02QgEA1Zw"), true);

assertSeedClocks(TL_DAVID_GUETTA_TML_WE1_2026);
assert.equal(TL_DAVID_GUETTA_TML_WE1_2026.length, 47);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-GSnPwle4FOE"],
  TL_DAVID_GUETTA_TML_WE1_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-GSnPwle4FOE"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-NTLDGnoWIRg"],
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/GSnPwle4FOE"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-GSnPwle4FOE"), true);
const guettaWe1 = tracklist1001RowsToPlays(TL_DAVID_GUETTA_TML_WE1_2026);
assert.equal(guettaWe1.length, 47);
assert.equal(guettaWe1[0]?.provenance, "1001tl");
assert.equal(guettaWe1[0]?.timestamp, 2 * 60 + 4);
assert.equal(guettaWe1[0]?.artistName, "David Guetta ft. Sia");
assert.equal(guettaWe1[0]?.trackTitle, "Titanium (Alesso Remix)");
assert.equal(guettaWe1[46]?.trackTitle, "Together");
assert.equal(guettaWe1[46]?.timestamp, 1 * 3600 + 13 * 60 + 15);
for (let i = 1; i < 47; i++) {
  assert.ok(
    (guettaWe1[i]!.timestamp ?? 0) > (guettaWe1[i - 1]!.timestamp ?? 0),
    `David Guetta TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MARLON_HOFFSTADT_TML_WE1_2026);
assert.equal(TL_MARLON_HOFFSTADT_TML_WE1_2026.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-rG1DvjvXCls"],
  TL_MARLON_HOFFSTADT_TML_WE1_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-rG1DvjvXCls"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-vpf4LLy42Zc"],
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://youtu.be/rG1DvjvXCls"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-rG1DvjvXCls"), true);

assertSeedClocks(TL_MADDIX_TML_WE1_2026);
assert.equal(TL_MADDIX_TML_WE1_2026.length, 21);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1Fu89dxrXI0"],
  TL_MADDIX_TML_WE1_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-maddixmusic-maddix-live-tomorrowland-2026"],
  TL_MADDIX_TML_WE1_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-maddixmusic-maddix-live-tomorrowland-2026"],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-https://soundcloud.com/maddixmusic/maddix-live-tomorrowland-2026"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-1Fu89dxrXI0"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-maddixmusic-maddix-live-tomorrowland-2026"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-1Fu89dxrXI0"), false);

assertSeedClocks(TL_DYEN_MADDIX_TML_WE2_2026);
assert.equal(TL_DYEN_MADDIX_TML_WE2_2026.length, 28);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-VABm0tIRn2U"],
  TL_DYEN_MADDIX_TML_WE2_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-maddixmusic-dyen-b2b-maddix-live"],
  TL_DYEN_MADDIX_TML_WE2_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-maddixmusic-dyen-b2b-maddix-live"],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-VABm0tIRn2U"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1Fu89dxrXI0"],
);
assert.equal(isWiredTracklistSlug("yt-VABm0tIRn2U"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-maddixmusic-dyen-b2b-maddix-live"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-VABm0tIRn2U"), false);
const dyenMaddix = tracklist1001RowsToPlays(TL_DYEN_MADDIX_TML_WE2_2026);
assert.equal(dyenMaddix.length, 28);
assert.equal(dyenMaddix[0]?.provenance, "1001tl");
assert.equal(dyenMaddix[0]?.timestamp, 12);
assert.equal(dyenMaddix[0]?.trackTitle, "We Rave");
assert.equal(dyenMaddix[27]?.trackTitle, "Machinegun");
assert.equal(dyenMaddix[27]?.timestamp, 55 * 60 + 26);
for (let i = 1; i < dyenMaddix.length; i++) {
  assert.ok(
    (dyenMaddix[i]!.timestamp ?? 0) > (dyenMaddix[i - 1]!.timestamp ?? 0),
    `DYEN Maddix TML WE2 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_SARA_LANDRY_TML_FRIENDSHIP_MIX_2026);
assert.equal(TL_SARA_LANDRY_TML_FRIENDSHIP_MIX_2026.length, 26);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-tomorrowland-friendship-mix-with-sara-landry-july-2026"
  ],
  TL_SARA_LANDRY_TML_FRIENDSHIP_MIX_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-tomorrowland-friendship-mix-with-sara-landry-july-2026"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-aDAWctObTvI"],
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-sara-landry-friendship-mix"],
  undefined,
);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-tomorrowland-tomorrowland-friendship-mix-with-sara-landry-july-2026",
  ),
  false,
);
const saraFriendship = tracklist1001RowsToPlays(
  TL_SARA_LANDRY_TML_FRIENDSHIP_MIX_2026,
);
assert.equal(saraFriendship.length, 26);
assert.equal(saraFriendship[0]?.trackTitle, "Comfort In Chaos");
assert.equal(saraFriendship[0]?.timestamp, 2 * 60 + 44);
assert.equal(saraFriendship[25]?.trackTitle, "Modulation Depth");
assert.equal(saraFriendship[25]?.timestamp, 59 * 60 + 12);
for (let i = 1; i < saraFriendship.length; i++) {
  assert.ok(
    (saraFriendship[i]!.timestamp ?? 0) >
      (saraFriendship[i - 1]!.timestamp ?? 0),
    `Sara Landry Friendship Mix 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_LAIDBACK_LUKE_OWR_SELECTS_017_2026);
assert.equal(TL_LAIDBACK_LUKE_OWR_SELECTS_017_2026.length, 60);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-laidback-luke-selects-august-2026"
  ],
  TL_LAIDBACK_LUKE_OWR_SELECTS_017_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-laidback-luke-selects"],
  undefined,
);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-tomorrowland-laidback-luke-selects-august-2026",
  ),
  false,
);
const lukeSelects = tracklist1001RowsToPlays(
  TL_LAIDBACK_LUKE_OWR_SELECTS_017_2026,
);
assert.equal(lukeSelects.length, 60);
assert.equal(lukeSelects[0]?.trackTitle, "Comes and Goes");
assert.equal(lukeSelects[0]?.timestamp, 20);
assert.equal(lukeSelects[59]?.trackTitle, "Sweet Lovin (Sunset Edition)");
assert.equal(lukeSelects[59]?.timestamp, 58 * 60 + 21);
for (let i = 1; i < lukeSelects.length; i++) {
  assert.ok(
    (lukeSelects[i]!.timestamp ?? 0) > (lukeSelects[i - 1]!.timestamp ?? 0),
    `Laidback Luke Selects 017 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_BEBE_REXHA_TML_WE2_2026);
assert.equal(TL_BEBE_REXHA_TML_WE2_2026.length, 24);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-KCeluZt3H9o"],
  TL_BEBE_REXHA_TML_WE2_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-bebe-rexha-freedom"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-KCeluZt3H9o"), true);
assert.equal(isSecondaryPlaybackSlug("yt-KCeluZt3H9o"), false);
assert.equal(TL_BEBE_REXHA_TML_WE2_2026[22]?.at, "24:10");
assert.equal(TL_BEBE_REXHA_TML_WE2_2026[23]?.at, "59:30");
assert.equal(TL_BEBE_REXHA_TML_WE2_2026[22]?.title, "In The Name Of Love");
assert.equal(TL_BEBE_REXHA_TML_WE2_2026[23]?.title, "In The Name Of Love");
const bebeWe2 = tracklist1001RowsToPlays(TL_BEBE_REXHA_TML_WE2_2026);
assert.equal(bebeWe2[0]?.trackTitle, "I'm Good (Blue) (Cedric Gervais Remix)");
assert.equal(bebeWe2[0]?.timestamp, 12);
assert.ok(bebeWe2.length >= 23);
for (let i = 1; i < bebeWe2.length; i++) {
  assert.ok(
    (bebeWe2[i]!.timestamp ?? 0) > (bebeWe2[i - 1]!.timestamp ?? 0),
    `Bebe Rexha TML WE2 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026);
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026.length, 119);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-QcvGuOhSVlc"],
  TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-timmy-trumpet-freedom"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-QcvGuOhSVlc"), true);
assert.equal(isSecondaryPlaybackSlug("yt-QcvGuOhSVlc"), false);
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[0]?.at, "0:12");
assert.equal(
  TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[0]?.title,
  "The Future (Timmy Trumpet Edit)",
);
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[77]?.at, "50:02");
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[77]?.title, "POLSKA JUMPSTYLE");
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[102]?.at, "1:07:45");
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[102]?.title, "POLSKA JUMPSTYLE");
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[118]?.at, "1:25:53");
assert.equal(TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026[118]?.title, "Nessun Dorma");
const timmyFreedom = tracklist1001RowsToPlays(
  TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026,
);
assert.equal(timmyFreedom[0]?.trackTitle, "The Future (Timmy Trumpet Edit)");
assert.equal(timmyFreedom[0]?.timestamp, 12);
assert.equal(timmyFreedom[0]?.provenance, "1001tl");
assert.ok(timmyFreedom.length >= 115);
for (let i = 1; i < timmyFreedom.length; i++) {
  assert.ok(
    (timmyFreedom[i]!.timestamp ?? 0) > (timmyFreedom[i - 1]!.timestamp ?? 0),
    `Timmy Trumpet TML WE2 Freedom 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ROSE_RINGED_TML_WE1_FREEDOM_2026);
assert.equal(TL_ROSE_RINGED_TML_WE1_FREEDOM_2026.length, 21);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-KAZd25mCHp8"],
  TL_ROSE_RINGED_TML_WE1_FREEDOM_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-rose-ringed-rose-ringed-freedomstage-we1"],
  TL_ROSE_RINGED_TML_WE1_FREEDOM_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/rose-ringed/rose-ringed-freedomstage-we1"
  ],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-KAZd25mCHp8"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-rose-ringed-rose-ringed-freedomstage-we1"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-KAZd25mCHp8"), false);
assert.equal(TL_ROSE_RINGED_TML_WE1_FREEDOM_2026[0]?.title, "Freedom Mountain");
assert.equal(TL_ROSE_RINGED_TML_WE1_FREEDOM_2026[20]?.title, "Don't Take It Away");
const roseFreedom = tracklist1001RowsToPlays(TL_ROSE_RINGED_TML_WE1_FREEDOM_2026);
assert.equal(roseFreedom.length, 21);
assert.equal(roseFreedom[0]?.timestamp, 11);
assert.equal(roseFreedom[0]?.provenance, "1001tl");
assert.equal(roseFreedom[20]?.timestamp, 1 * 3600 + 25 * 60 + 55);
for (let i = 1; i < roseFreedom.length; i++) {
  assert.ok(
    (roseFreedom[i]!.timestamp ?? 0) > (roseFreedom[i - 1]!.timestamp ?? 0),
    `Rose Ringed TML WE1 Freedom 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026);
assert.equal(TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026.length, 40);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-0Fq24R47sDY"],
  TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-ely-oaks-mainstage"], undefined);
assert.equal(isWiredTracklistSlug("yt-0Fq24R47sDY"), true);
assert.equal(isSecondaryPlaybackSlug("yt-0Fq24R47sDY"), false);
assert.equal(
  TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026[0]?.title,
  "Get The Party Started (Ely Oaks Remix)",
);
assert.equal(TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026[39]?.title, "Impossible");
const elyOaks = tracklist1001RowsToPlays(TL_ELY_OAKS_TML_WE2_MAINSTAGE_2026);
assert.equal(elyOaks.length, 40);
assert.equal(elyOaks[0]?.timestamp, 20);
assert.equal(elyOaks[39]?.timestamp, 57 * 60 + 32);
for (let i = 1; i < elyOaks.length; i++) {
  assert.ok(
    (elyOaks[i]!.timestamp ?? 0) > (elyOaks[i - 1]!.timestamp ?? 0),
    `Ely Oaks TML WE2 Mainstage 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_BULLET_TOOTH_TML_WE2_CORE_2026);
assert.equal(TL_BULLET_TOOTH_TML_WE2_CORE_2026.length, 9);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-G-DciaWb5KY"],
  TL_BULLET_TOOTH_TML_WE2_CORE_2026,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-bullet-tooth-core"], undefined);
assert.equal(isWiredTracklistSlug("yt-G-DciaWb5KY"), true);
assert.equal(isSecondaryPlaybackSlug("yt-G-DciaWb5KY"), false);
assert.equal(TL_BULLET_TOOTH_TML_WE2_CORE_2026[0]?.title, "Bumpin'");
assert.equal(
  TL_BULLET_TOOTH_TML_WE2_CORE_2026[8]?.title,
  "Pasion (Alex Kassian Mandarine Dance Mix)",
);
const bulletTooth = tracklist1001RowsToPlays(TL_BULLET_TOOTH_TML_WE2_CORE_2026);
assert.equal(bulletTooth.length, 9);
assert.equal(bulletTooth[0]?.timestamp, 12);
assert.equal(bulletTooth[8]?.timestamp, 1 * 3600 + 23 * 60 + 40);
for (let i = 1; i < bulletTooth.length; i++) {
  assert.ok(
    (bulletTooth[i]!.timestamp ?? 0) > (bulletTooth[i - 1]!.timestamp ?? 0),
    `bullet tooth TML WE2 CORE 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026);
assert.equal(TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5V5qDFSw8Hs"],
  TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-john-newman-freedom"], undefined);
assert.equal(isWiredTracklistSlug("yt-5V5qDFSw8Hs"), true);
assert.equal(isSecondaryPlaybackSlug("yt-5V5qDFSw8Hs"), false);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5V5qDFSw8Hs"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-QcvGuOhSVlc"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5V5qDFSw8Hs"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-KCeluZt3H9o"],
);
assert.equal(
  TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026[0]?.title,
  "Call Your Name (John Newman Tech Remix)",
);
assert.equal(
  TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026[11]?.title,
  "Love Me Again (John Newman 2026 VIP)",
);
const johnNewman = tracklist1001RowsToPlays(TL_JOHN_NEWMAN_TML_WE2_FREEDOM_2026);
assert.equal(johnNewman.length, 12);
assert.equal(johnNewman[0]?.timestamp, 4 * 60 + 10);
assert.equal(johnNewman[11]?.timestamp, 50 * 60 + 9);
for (let i = 1; i < johnNewman.length; i++) {
  assert.ok(
    (johnNewman[i]!.timestamp ?? 0) > (johnNewman[i - 1]!.timestamp ?? 0),
    `John Newman TML WE2 Freedom 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026);
assert.equal(TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026.length, 21);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-VuwLOFniScA"],
  TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-4444-of-a-kind-freedom"], undefined);
assert.equal(isWiredTracklistSlug("yt-VuwLOFniScA"), true);
assert.equal(isSecondaryPlaybackSlug("yt-VuwLOFniScA"), false);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-VuwLOFniScA"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-KAZd25mCHp8"],
);
assert.equal(TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026[0]?.title, "LAST 4 EVER");
assert.equal(TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026[20]?.title, "HERE AND NOW");
const kindFreedom = tracklist1001RowsToPlays(TL_4444_OF_A_KIND_TML_WE1_FREEDOM_2026);
assert.equal(kindFreedom.length, 21);
assert.equal(kindFreedom[0]?.timestamp, 14);
assert.equal(kindFreedom[20]?.timestamp, 56 * 60 + 32);
for (let i = 1; i < kindFreedom.length; i++) {
  assert.ok(
    (kindFreedom[i]!.timestamp ?? 0) > (kindFreedom[i - 1]!.timestamp ?? 0),
    `4444 OF A KIND TML WE1 Freedom 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026);
assert.equal(TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026.length, 17);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-czU0VhOB_Lg"],
  TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-john-newman-mainstage"], undefined);
assert.equal(isWiredTracklistSlug("yt-czU0VhOB_Lg"), true);
assert.equal(isSecondaryPlaybackSlug("yt-czU0VhOB_Lg"), false);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-czU0VhOB_Lg"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5V5qDFSw8Hs"],
);
assert.equal(TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026[0]?.title, "Blame");
assert.equal(TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026[16]?.title, "Only You");
const johnNewmanWe1 = tracklist1001RowsToPlays(
  TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026,
);
assert.equal(johnNewmanWe1.length, 17);
assert.equal(johnNewmanWe1[0]?.timestamp, 12);
assert.equal(johnNewmanWe1[16]?.timestamp, 53 * 60 + 27);
for (let i = 1; i < johnNewmanWe1.length; i++) {
  assert.ok(
    (johnNewmanWe1[i]!.timestamp ?? 0) > (johnNewmanWe1[i - 1]!.timestamp ?? 0),
    `John Newman TML WE1 Mainstage 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_DINO_LENNY_CORE_019_2022);
assert.equal(TL_DINO_LENNY_CORE_019_2022.length, 9);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-90ExlZnu_Xg"],
  TL_DINO_LENNY_CORE_019_2022,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-tomorrowland-core-i-dino-lenny-0190"],
  TL_DINO_LENNY_CORE_019_2022,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-tomorrowland-core-radio-show-july-2026"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-90ExlZnu_Xg"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-tomorrowland-core-i-dino-lenny-0190"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-90ExlZnu_Xg"), false);
const dinoCore = tracklist1001RowsToPlays(TL_DINO_LENNY_CORE_019_2022);
assert.equal(dinoCore.length, 9);
assert.equal(dinoCore[0]?.trackTitle, "Mind Dimension (Ben Sterling Remix)");
assert.equal(dinoCore[0]?.timestamp, 4 * 60 + 40);
assert.equal(dinoCore[8]?.trackTitle, "Learn To Fly (Maceo Plex 808 Dub)");
assert.equal(dinoCore[8]?.timestamp, 49 * 60 + 50);
for (let i = 1; i < dinoCore.length; i++) {
  assert.ok(
    (dinoCore[i]!.timestamp ?? 0) > (dinoCore[i - 1]!.timestamp ?? 0),
    `Dino Lenny CORE 019 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ROBIN_SCHULZ_SUGAR_RADIO_555_2026);
assert.equal(TL_ROBIN_SCHULZ_SUGAR_RADIO_555_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["ht-toccoscuro-robin-schulz-sugar-radio-555"],
  TL_ROBIN_SCHULZ_SUGAR_RADIO_555_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["ht_Robin-Schulz_Sugar-Radio-555_2026-08-16"],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["ht-https://hearthis.at/toccoscuro/robin-schulz-sugar-radio-555/"],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-robin-schulz-robin-schulz-dj-set-live-pacha-ibiza"
  ],
  TL_ROBIN_SCHULZ_PACHA_IBIZA_2026,
);
assert.equal(
  isSecondaryPlaybackSlug("ht-toccoscuro-robin-schulz-sugar-radio-555"),
  false,
);
const schulzSugar = tracklist1001RowsToPlays(
  TL_ROBIN_SCHULZ_SUGAR_RADIO_555_2026,
);
assert.equal(schulzSugar.length, 15);
assert.equal(schulzSugar[0]?.provenance, "1001tl");
assert.equal(schulzSugar[0]?.timestamp, 20);
assert.equal(
  schulzSugar[0]?.trackTitle,
  "A Gira (Emanuel Satie & Maga & Sean Doron & Tim Engelhardt pres. Scenarios Remix)",
);
assert.equal(schulzSugar[14]?.trackTitle, "Loca");
assert.equal(schulzSugar[14]?.timestamp, 55 * 60 + 38);
for (let i = 1; i < schulzSugar.length; i++) {
  assert.ok(
    (schulzSugar[i]!.timestamp ?? 0) > (schulzSugar[i - 1]!.timestamp ?? 0),
    `Robin Schulz Sugar Radio 555 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ERIC_PRYDZ_EPIC_RADIO_026_2026);
assert.equal(TL_ERIC_PRYDZ_EPIC_RADIO_026_2026.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-eric-prydz-presents-epic-1"],
  TL_ERIC_PRYDZ_EPIC_RADIO_026_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-eric-prydz-presents-epic-1"],
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-eric-prydz-presents-463760700"],
);
assert.equal(isSecondaryPlaybackSlug("sc-eric-prydz-eric-prydz-presents-epic-1"), false);
assert.equal(isSecondaryPlaybackSlug("yt-xv6hpdqKlxg"), false);
assert.equal(isSecondaryPlaybackSlug("sc-eric-prydz-epic-radio-025"), true);
const epic026 = tracklist1001RowsToPlays(TL_ERIC_PRYDZ_EPIC_RADIO_026_2026);
assert.equal(epic026.length, 12);
assert.equal(epic026[0]?.provenance, "1001tl");
assert.equal(epic026[0]?.timestamp, 30);
assert.equal(epic026[0]?.trackTitle, "Heavy");
assert.equal(
  epic026[9]?.trackTitle,
  "Turn Around (Âme Remix / Eric Prydz Private Edit)",
);
assert.equal(epic026[9]?.timestamp, 44 * 60 + 17);
assert.equal(epic026[10]?.trackTitle, "Tomorrowland 2019 ID (Working Title)");
assert.equal(epic026[10]?.timestamp, 51 * 60 + 30);
assert.equal(epic026[11]?.trackTitle, "Somebody's Watching Me");
assert.equal(epic026[11]?.timestamp, 59 * 60 + 22);
for (let i = 1; i < epic026.length; i++) {
  assert.ok(
    (epic026[i]!.timestamp ?? 0) > (epic026[i - 1]!.timestamp ?? 0),
    `Eric Prydz EPIC Radio 026 clocks must increase at index ${i}`,
  );
}

const maddixWe1 = tracklist1001RowsToPlays(TL_MADDIX_TML_WE1_2026);
assert.equal(maddixWe1.length, 21);
assert.equal(maddixWe1[0]?.provenance, "1001tl");
assert.equal(maddixWe1[0]?.timestamp, 12);
assert.equal(maddixWe1[0]?.trackTitle, "We Rave");
assert.equal(maddixWe1[20]?.trackTitle, "Heart Of Courage");
assert.equal(maddixWe1[20]?.timestamp, 55 * 60 + 22);
for (let i = 1; i < maddixWe1.length; i++) {
  assert.ok(
    (maddixWe1[i]!.timestamp ?? 0) > (maddixWe1[i - 1]!.timestamp ?? 0),
    `Maddix TML WE1 2026 clocks must increase at index ${i}`,
  );
}

const marlonWe1 = tracklist1001RowsToPlays(TL_MARLON_HOFFSTADT_TML_WE1_2026);
assert.equal(marlonWe1.length, 16);
assert.equal(marlonWe1[0]?.provenance, "1001tl");
assert.equal(marlonWe1[0]?.timestamp, 12);
assert.equal(marlonWe1[0]?.trackTitle, "One Time For The Dj");
assert.equal(marlonWe1[15]?.trackTitle, "You're Not Alone (Marlon Hoffstadt Edit)");
assert.equal(marlonWe1[15]?.timestamp, 56 * 60);
for (let i = 1; i < marlonWe1.length; i++) {
  assert.ok(
    (marlonWe1[i]!.timestamp ?? 0) > (marlonWe1[i - 1]!.timestamp ?? 0),
    `Marlon Hoffstadt TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-2BPWWYAgUE4"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-FQj71mhobYw"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-2BPWWYAgUE4"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xXRjglkAmq8"],
);
assert.equal(isSecondaryPlaybackSlug("yt-2BPWWYAgUE4"), false);
assert.equal(
  isSecondaryPlaybackSlug("sc-innellea-colyn-b2b-innella-at-ultra"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-korolovadj-joris-voorn-b2b-korolova-live"),
  true,
);

assertSeedClocks(TL_NICKY_ROMERO_PROTOCOL_RADIO_731);
assert.equal(TL_NICKY_ROMERO_PROTOCOL_RADIO_731.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Rgx-wT9FDaE"],
  TL_NICKY_ROMERO_PROTOCOL_RADIO_731,
);
const prr731 = tracklist1001RowsToPlays(TL_NICKY_ROMERO_PROTOCOL_RADIO_731);
assert.equal(prr731.length, 16);
assert.equal(prr731[0]?.provenance, "1001tl");
assert.equal(prr731[0]?.timestamp, 53);
assert.equal(prr731[0]?.trackTitle, "Play Me");
assert.equal(prr731[15]?.trackTitle, "What Are We Gonna Do");
assert.equal(prr731[15]?.timestamp, 53 * 60 + 53);
for (let i = 1; i < prr731.length; i++) {
  assert.ok(
    (prr731[i]!.timestamp ?? 0) > (prr731[i - 1]!.timestamp ?? 0),
    `Protocol Radio 731 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_SASHA_ECLIPSE_MIX_2026);
assert.equal(TL_SASHA_ECLIPSE_MIX_2026.length, 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-sashaofficial-sasha-eclipse-mix-12-8-26"],
  TL_SASHA_ECLIPSE_MIX_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/sashaofficial/sasha-eclipse-mix-12-8-26"
  ],
  undefined,
);
const sashaEclipse = tracklist1001RowsToPlays(TL_SASHA_ECLIPSE_MIX_2026);
assert.equal(sashaEclipse.length, 22);
assert.equal(sashaEclipse[0]?.provenance, "1001tl");
assert.equal(sashaEclipse[0]?.timestamp, 0);
assert.equal(sashaEclipse[0]?.trackTitle, "Together We Will Live Forever");
assert.equal(sashaEclipse[21]?.trackTitle, "Papua New Guinea");
assert.equal(sashaEclipse[21]?.timestamp, 1 * 3600 + 50 * 60 + 46);
for (let i = 1; i < sashaEclipse.length; i++) {
  assert.ok(
    (sashaEclipse[i]!.timestamp ?? 0) > (sashaEclipse[i - 1]!.timestamp ?? 0),
    `Sasha Eclipse Mix clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026);
assert.equal(TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026.length, 14);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-0-s_qZRWElA"],
  TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026,
);
const mmYacht = tracklist1001RowsToPlays(TL_MISS_MONIQUE_IBIZA_SUNSET_YACHT_2026);
assert.equal(mmYacht.length, 14);
assert.equal(mmYacht[0]?.provenance, "1001tl");
assert.equal(mmYacht[0]?.timestamp, 0);
assert.equal(mmYacht[0]?.trackTitle, "I See U");
assert.equal(mmYacht[13]?.trackTitle, "She's A Devil");
assert.equal(mmYacht[13]?.timestamp, 55 * 60 + 49);
for (let i = 1; i < mmYacht.length; i++) {
  assert.ok(
    (mmYacht[i]!.timestamp ?? 0) > (mmYacht[i - 1]!.timestamp ?? 0),
    `Miss Monique Ibiza Yacht clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_TIESTO_PRISMATIC_032_2026);
assert.equal(TL_TIESTO_PRISMATIC_032_2026.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-blP5J6BUG0M"],
  TL_TIESTO_PRISMATIC_032_2026,
);
const prismatic032 = tracklist1001RowsToPlays(TL_TIESTO_PRISMATIC_032_2026);
assert.equal(prismatic032.length, 20);
assert.equal(prismatic032[0]?.provenance, "1001tl");
assert.equal(prismatic032[0]?.timestamp, 32);
assert.equal(prismatic032[0]?.trackTitle, "TILL SUNRISE");
assert.equal(prismatic032[19]?.trackTitle, "High On The Beat");
assert.equal(prismatic032[19]?.timestamp, 57 * 60 + 52);
for (let i = 1; i < prismatic032.length; i++) {
  assert.ok(
    (prismatic032[i]!.timestamp ?? 0) > (prismatic032[i - 1]!.timestamp ?? 0),
    `Tiësto Prismatic 032 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026);
assert.equal(TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026.length, 15);
for (const slug of ["yt-yTRvLrtsM9I", "sc-joris-voorn-spectrum-radio-485"]) {
  assert.equal(
    TRACKLIST_1001_BY_SOURCE_SLUG[slug],
    TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
    `Spectrum 485 must share one seed object on ${slug}`,
  );
}
assert.equal(isSecondaryPlaybackSlug("sc-joris-voorn-spectrum-radio-485"), true);
assert.equal(isSecondaryPlaybackSlug("yt-yTRvLrtsM9I"), false);
const spectrum485 = tracklist1001RowsToPlays(
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
);
assert.equal(spectrum485.length, 15);
assert.equal(spectrum485[0]?.provenance, "1001tl");
assert.equal(spectrum485[0]?.timestamp, 30);
assert.equal(spectrum485[0]?.trackTitle, "Horizon (Eelke Kleijn Remix)");
assert.equal(spectrum485[14]?.trackTitle, "Darkness (Joris Voorn Remix)");
assert.equal(spectrum485[14]?.timestamp, 59 * 60 + 10);
for (let i = 1; i < spectrum485.length; i++) {
  assert.ok(
    (spectrum485[i]!.timestamp ?? 0) > (spectrum485[i - 1]!.timestamp ?? 0),
    `Joris Voorn Spectrum Radio 485 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026);
assert.equal(TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026.length, 27);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-phWKhIwgiTo"],
  TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
);
const abgt690 = tracklist1001RowsToPlays(
  TL_ABOVE_AND_BEYOND_ESTIVA_GROUP_THERAPY_RADIO_690_2026,
);
assert.equal(abgt690.length, 27);
assert.equal(abgt690[0]?.provenance, "1001tl");
assert.equal(abgt690[0]?.timestamp, 31);
assert.equal(abgt690[0]?.trackTitle, "Echo");
assert.equal(abgt690[26]?.trackTitle, "The Wave");
assert.equal(abgt690[26]?.timestamp, 1 * 3600 + 54 * 60 + 40);
for (let i = 1; i < abgt690.length; i++) {
  assert.ok(
    (abgt690[i]!.timestamp ?? 0) > (abgt690[i - 1]!.timestamp ?? 0),
    `Group Therapy 690 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_REINIER_ZONNEVELD_AWAKENINGS_2025);
assert.equal(TL_REINIER_ZONNEVELD_AWAKENINGS_2025.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-i-mFuxbGHzg"],
  TL_REINIER_ZONNEVELD_AWAKENINGS_2025,
);
const rzAwake = tracklist1001RowsToPlays(TL_REINIER_ZONNEVELD_AWAKENINGS_2025);
assert.equal(rzAwake.length, 20);
assert.equal(rzAwake[0]?.provenance, "1001tl");
assert.equal(rzAwake[0]?.timestamp, 0);
assert.equal(rzAwake[0]?.trackTitle, "Move Your Body To The Beat");
assert.equal(rzAwake[19]?.trackTitle, "Kernkraft 400");
assert.equal(rzAwake[19]?.timestamp, 1 * 3600 + 28 * 60 + 45);
for (let i = 1; i < rzAwake.length; i++) {
  assert.ok(
    (rzAwake[i]!.timestamp ?? 0) > (rzAwake[i - 1]!.timestamp ?? 0),
    `Reinier Awakenings clocks must increase at index ${i}`,
  );
}
assert.equal(hoa527[82]?.timestamp, 56 * 60 + 47);
for (let i = 1; i < hoa527.length; i++) {
  assert.ok(
    (hoa527[i]!.timestamp ?? 0) > (hoa527[i - 1]!.timestamp ?? 0),
    `Hardwell HOA 527 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024);
assert.equal(TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024.length, 28);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-k4Drn6AwAdk"],
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-maxstyler-max-styler-live-opulent-temple-burning-man-2024"
  ],
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
);
const maxStylerOt = tracklist1001RowsToPlays(
  TL_MAX_STYLER_OPULENT_TEMPLE_BURNING_MAN_2024,
);
assert.equal(maxStylerOt.length, 28);
assert.equal(maxStylerOt[0]?.provenance, "1001tl");
assert.equal(maxStylerOt[0]?.timestamp, 0);
assert.equal(maxStylerOt[0]?.trackTitle, "Freaky 1");
assert.equal(maxStylerOt[27]?.trackTitle, "Lights Out");
assert.equal(maxStylerOt[27]?.timestamp, 1 * 3600 + 25 * 60);
for (let i = 1; i < maxStylerOt.length; i++) {
  assert.ok(
    (maxStylerOt[i]!.timestamp ?? 0) > (maxStylerOt[i - 1]!.timestamp ?? 0),
    `Max Styler Opulent Temple clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024);
assert.equal(TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024.length, 24);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-arowbYnNFGY"],
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-hannahlaingdj-hannah-laing-creamfields-2024-audio"
  ],
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
);
const hannahCf = tracklist1001RowsToPlays(
  TL_HANNAH_LAING_ZENLESS_ZONE_ZERO_CREAMFIELDS_2024,
);
assert.equal(hannahCf.length, 24);
assert.equal(hannahCf[0]?.provenance, "1001tl");
assert.equal(hannahCf[0]?.timestamp, 0);
assert.equal(hannahCf[0]?.trackTitle, "Ibizacore");
assert.equal(hannahCf[23]?.trackTitle, "Good Love (Reinier Zonneveld Remix)");
assert.equal(hannahCf[23]?.timestamp, 1 * 3600 + 21 * 60 + 44);
for (let i = 1; i < hannahCf.length; i++) {
  assert.ok(
    (hannahCf[i]!.timestamp ?? 0) > (hannahCf[i - 1]!.timestamp ?? 0),
    `Hannah Laing Creamfields clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026);
assert.equal(TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-8aDoUu4GDrc"],
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-noraenpure-purified-520"],
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
);
const purified520 = tracklist1001RowsToPlays(
  TL_NORA_EN_PURE_PURIFIED_RADIO_520_2026,
);
assert.equal(purified520.length, 13);
assert.equal(purified520[0]?.provenance, "1001tl");
assert.equal(purified520[0]?.timestamp, 89);
assert.equal(purified520[0]?.trackTitle, "Shadows");
assert.equal(purified520[12]?.trackTitle, "Mirage");
assert.equal(purified520[12]?.timestamp, 57 * 60 + 54);
for (let i = 1; i < purified520.length; i++) {
  assert.ok(
    (purified520[i]!.timestamp ?? 0) > (purified520[i - 1]!.timestamp ?? 0),
    `Purified Radio 520 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_KOROLOVA_CAPTIVE_SOUL_098_2026);
assert.equal(TL_KOROLOVA_CAPTIVE_SOUL_098_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5JxfEjVdQFk"],
  TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-korolova-captive-soul-98"],
  TL_KOROLOVA_CAPTIVE_SOUL_098_2026,
);
const captive098 = tracklist1001RowsToPlays(TL_KOROLOVA_CAPTIVE_SOUL_098_2026);
assert.equal(captive098.length, 15);
assert.equal(captive098[0]?.provenance, "1001tl");
assert.equal(captive098[0]?.timestamp, 103);
assert.equal(captive098[0]?.trackTitle, "Buka");
assert.equal(captive098[14]?.trackTitle, "Don't Wake Us Up");
assert.equal(captive098[14]?.timestamp, 55 * 60 + 58);
for (let i = 1; i < captive098.length; i++) {
  assert.ok(
    (captive098[i]!.timestamp ?? 0) > (captive098[i - 1]!.timestamp ?? 0),
    `Captive Soul 098 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025);
assert.equal(TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025.length, 66);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-rLTCLSsqrXY"],
  TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-jameshypethedj-sync-london-full-set"],
  TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025,
);
const hypeSync = tracklist1001RowsToPlays(TL_JAMES_HYPE_SYNC_MAGAZINE_LONDON_2025);
assert.equal(hypeSync.length, 66);
assert.equal(hypeSync[0]?.provenance, "1001tl");
assert.equal(hypeSync[0]?.timestamp, 0);
assert.equal(hypeSync[0]?.trackTitle, "Ferrari");
assert.equal(hypeSync[65]?.trackTitle, "More Than Friends");
assert.equal(hypeSync[65]?.timestamp, 1 * 3600 + 55 * 60 + 7);
for (let i = 1; i < hypeSync.length; i++) {
  assert.ok(
    (hypeSync[i]!.timestamp ?? 0) > (hypeSync[i - 1]!.timestamp ?? 0),
    `James Hype SYNC London clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ERIC_PRYDZ_EPIC_RADIO_025_2026);
assert.equal(TL_ERIC_PRYDZ_EPIC_RADIO_025_2026.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xv6hpdqKlxg"],
  TL_ERIC_PRYDZ_EPIC_RADIO_025_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-epic-radio-025"],
  TL_ERIC_PRYDZ_EPIC_RADIO_025_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xv6hpdqKlxg"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-JLIYTueL4TI"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-epic-radio-025"],
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-eric-prydz-presents-epic-1"],
);
assert.equal(TL_ERIC_PRYDZ_EPIC_RADIO_025_2026[0]?.title, "EPIC Radio 025 Intro ID (Working Title)");
assert.equal(
  TL_ERIC_PRYDZ_EPIC_RADIO_025_2026[11]?.title,
  "Marquee Las Vegas 2025 ID (Working Title)",
);
const epic025 = tracklist1001RowsToPlays(TL_ERIC_PRYDZ_EPIC_RADIO_025_2026);
assert.equal(epic025.length, 12);
assert.equal(epic025[0]?.provenance, "1001tl");
assert.equal(epic025[0]?.timestamp, 30);
assert.equal(epic025[11]?.timestamp, 56 * 60 + 5);
for (let i = 1; i < epic025.length; i++) {
  assert.ok(
    (epic025[i]!.timestamp ?? 0) > (epic025[i - 1]!.timestamp ?? 0),
    `Epic Radio 025 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025);
assert.equal(TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025.length, 28);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-t5KwF_VsM50"],
  TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-honey-dijon-dekmantel"],
  undefined,
);
assert.equal(isSecondaryPlaybackSlug("yt-t5KwF_VsM50"), false);
assert.equal(
  TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025[0]?.title,
  "I Get Lifted (Go To Church Mix)",
);
assert.equal(
  TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025[27]?.title,
  "Strings Of Life (Stronger On My Own) (Supernova Remix)",
);
const honeyDekmantel = tracklist1001RowsToPlays(
  TL_HONEY_DIJON_THE_LOOP_DEKMANTEL_NETHERLANDS_2025,
);
assert.equal(honeyDekmantel.length, 28);
assert.equal(honeyDekmantel[0]?.provenance, "1001tl");
assert.equal(honeyDekmantel[0]?.timestamp, 0);
assert.equal(honeyDekmantel[27]?.timestamp, 1 * 3600 + 52 * 60);
for (let i = 1; i < honeyDekmantel.length; i++) {
  assert.ok(
    (honeyDekmantel[i]!.timestamp ?? 0) >
      (honeyDekmantel[i - 1]!.timestamp ?? 0),
    `Honey Dijon Dekmantel clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINAI_S2O_SONGKRAN_THAILAND_2023);
assert.equal(TL_VINAI_S2O_SONGKRAN_THAILAND_2023.length, 34);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-193z2Yyb-4g"],
  TL_VINAI_S2O_SONGKRAN_THAILAND_2023,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-/193z2Yyb-4g"], undefined);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-vinai-s2o"], undefined);
assert.equal(isSecondaryPlaybackSlug("yt-193z2Yyb-4g"), false);
assert.equal(TL_VINAI_S2O_SONGKRAN_THAILAND_2023[0]?.title, "I Was Made (RAAKMO Remix)");
assert.equal(TL_VINAI_S2O_SONGKRAN_THAILAND_2023[33]?.title, "Zombie");
const vinaiS2o = tracklist1001RowsToPlays(TL_VINAI_S2O_SONGKRAN_THAILAND_2023);
assert.equal(vinaiS2o.length, 34);
assert.equal(vinaiS2o[0]?.provenance, "1001tl");
assert.equal(vinaiS2o[0]?.timestamp, 0);
assert.equal(vinaiS2o[33]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < vinaiS2o.length; i++) {
  assert.ok(
    (vinaiS2o[i]!.timestamp ?? 0) > (vinaiS2o[i - 1]!.timestamp ?? 0),
    `VINAI S2O Songkran clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026);
assert.equal(TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026.length, 26);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-agents-of-time-agents-of-time-time-warp-full"],
  TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/agents-of-time/agents-of-time-time-warp-full"
  ],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-agents-of-time-time-warp-full"],
  undefined,
);
assert.equal(isWiredTracklistSlug("sc-agents-of-time-agents-of-time-time-warp-full"), true);
assert.equal(TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026[0]?.title, "Signal");
assert.equal(TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026[25]?.title, "You + Me");
const aotTimeWarp = tracklist1001RowsToPlays(
  TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026,
);
assert.equal(aotTimeWarp.length, 26);
assert.equal(aotTimeWarp[0]?.provenance, "1001tl");
assert.equal(aotTimeWarp[0]?.timestamp, 0);
assert.equal(aotTimeWarp[0]?.artistName, "John Monkman");
assert.equal(aotTimeWarp[25]?.timestamp, 1 * 3600 + 48 * 60 + 41);
assert.equal(aotTimeWarp[25]?.artistName, "Agents Of Time & JONOS & Son Of Son");
for (let i = 1; i < aotTimeWarp.length; i++) {
  assert.ok(
    (aotTimeWarp[i]!.timestamp ?? 0) > (aotTimeWarp[i - 1]!.timestamp ?? 0),
    `Agents Of Time Time Warp clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ERIC_PRYDZ_EPIC_RADIO_036_2026);
assert.equal(TL_ERIC_PRYDZ_EPIC_RADIO_036_2026.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-JLIYTueL4TI"],
  TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-eric-prydz-eric-prydz-presents-463760700"],
  TL_ERIC_PRYDZ_EPIC_RADIO_036_2026,
);
const epic036 = tracklist1001RowsToPlays(TL_ERIC_PRYDZ_EPIC_RADIO_036_2026);
assert.equal(epic036.length, 13);
assert.equal(epic036[0]?.provenance, "1001tl");
assert.equal(epic036[0]?.timestamp, 30);
assert.equal(epic036[0]?.trackTitle, "Tha Bass Line");
assert.equal(epic036[12]?.trackTitle, "Control Freak");
assert.equal(epic036[12]?.timestamp, 59 * 60 + 10);
for (let i = 1; i < epic036.length; i++) {
  assert.ok(
    (epic036[i]!.timestamp ?? 0) > (epic036[i - 1]!.timestamp ?? 0),
    `Epic Radio 036 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026);
assert.equal(TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-bradeazy-bradeazy-live-lollapalooza"],
  TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026,
);
const bradeazyLolla = tracklist1001RowsToPlays(
  TL_BRADEAZY_LIVE_LOLLAPALOOZA_CHICAGO_2026,
);
assert.equal(bradeazyLolla.length, 12);
assert.equal(bradeazyLolla[0]?.provenance, "1001tl");
assert.equal(bradeazyLolla[0]?.timestamp, 20);
assert.equal(bradeazyLolla[0]?.trackTitle, "System Failed");
assert.equal(bradeazyLolla[11]?.trackTitle, "Butterfly 2026");
assert.equal(bradeazyLolla[11]?.timestamp, 54 * 60 + 36);
for (let i = 1; i < bradeazyLolla.length; i++) {
  assert.ok(
    (bradeazyLolla[i]!.timestamp ?? 0) > (bradeazyLolla[i - 1]!.timestamp ?? 0),
    `bradeazy Lollapalooza clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_AMELIE_LENS_RADIO_SHOW_022_2026);
assert.equal(TL_AMELIE_LENS_RADIO_SHOW_022_2026.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-amelielens-amelie-lens-radio-show-022"],
  TL_AMELIE_LENS_RADIO_SHOW_022_2026,
);
const amelie022 = tracklist1001RowsToPlays(TL_AMELIE_LENS_RADIO_SHOW_022_2026);
assert.equal(amelie022.length, 16);
assert.equal(amelie022[0]?.provenance, "1001tl");
assert.equal(amelie022[0]?.timestamp, 20);
assert.equal(amelie022[0]?.trackTitle, "Zen Meteor");
assert.equal(amelie022[15]?.trackTitle, "Storkens Vej");
assert.equal(amelie022[15]?.timestamp, 55 * 60 + 50);
for (let i = 1; i < amelie022.length; i++) {
  assert.ok(
    (amelie022[i]!.timestamp ?? 0) > (amelie022[i - 1]!.timestamp ?? 0),
    `Amelie Lens Radio Show 022 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024);
assert.equal(TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024.length, 95);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-wuMQeEJ3YnQ"],
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-oliverheldens-oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024"
  ],
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
);
const heldensDaybreak = tracklist1001RowsToPlays(
  TL_OLIVER_HELDENS_DAYBREAK_SESSION_TOMORROWLAND_WE1_2024,
);
assert.equal(heldensDaybreak.length, 95);
assert.equal(heldensDaybreak[0]?.provenance, "1001tl");
assert.equal(heldensDaybreak[0]?.timestamp, 12);
assert.equal(
  heldensDaybreak[0]?.trackTitle,
  "You & Me (Flume Remix / Westend & Local Singles Edit)",
);
assert.equal(
  heldensDaybreak[94]?.trackTitle,
  "Everybody Loves The Sunshine",
);
assert.equal(heldensDaybreak[94]?.timestamp, 2 * 3600 + 25 * 60 + 8);
for (let i = 1; i < heldensDaybreak.length; i++) {
  assert.ok(
    (heldensDaybreak[i]!.timestamp ?? 0) >
      (heldensDaybreak[i - 1]!.timestamp ?? 0),
    `Oliver Heldens Daybreak clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ROBIN_SCHULZ_PACHA_IBIZA_2026);
assert.equal(TL_ROBIN_SCHULZ_PACHA_IBIZA_2026.length, 32);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "ht-toccoscuro-1live-dj-session-mit-robin-schulz-live-aus-dem-pacha-ibiza-vom-0"
  ],
  TL_ROBIN_SCHULZ_PACHA_IBIZA_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "ht-https://hearthis.at/toccoscuro/1live-dj-session-mit-robin-schulz-live-aus-dem-pacha-ibiza-vom-0/"
  ],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-robin-schulz-robin-schulz-dj-set-live-pacha-ibiza"
  ],
  TL_ROBIN_SCHULZ_PACHA_IBIZA_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-robin-schulz-robin-schulz-dj-set-live-pacha-ibiza"
  ],
  TL_ROBIN_SCHULZ_SUGAR_RADIO_555_2026,
);
const schulzPacha = tracklist1001RowsToPlays(TL_ROBIN_SCHULZ_PACHA_IBIZA_2026);
assert.equal(schulzPacha.length, 32);
assert.equal(schulzPacha[0]?.provenance, "1001tl");
assert.equal(schulzPacha[0]?.timestamp, 20);
assert.equal(schulzPacha[0]?.trackTitle, "La La Land");
assert.equal(schulzPacha[31]?.trackTitle, "Everybody");
assert.equal(schulzPacha[31]?.timestamp, 57 * 60 + 41);
for (let i = 1; i < schulzPacha.length; i++) {
  assert.ok(
    (schulzPacha[i]!.timestamp ?? 0) > (schulzPacha[i - 1]!.timestamp ?? 0),
    `Robin Schulz Pacha clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026);
assert.equal(TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026.length, 35);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-pnzSuCiAGdk"],
  TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
);
const chDanceValley = tracklist1001RowsToPlays(
  TL_CALVIN_HARRIS_MAINSTAGE_DANCE_VALLEY_NETHERLANDS_2026,
);
assert.equal(chDanceValley.length, 35);
assert.equal(chDanceValley[0]?.provenance, "1001tl");
assert.equal(chDanceValley[0]?.timestamp, 0);
assert.equal(
  chDanceValley[0]?.trackTitle,
  "Sweet Nothing (Calvin Harris 2025 Remix)",
);
assert.equal(chDanceValley[34]?.trackTitle, "Under Control");
assert.equal(chDanceValley[34]?.timestamp, 1 * 3600 + 12 * 60 + 29);
for (let i = 1; i < chDanceValley.length; i++) {
  assert.ok(
    (chDanceValley[i]!.timestamp ?? 0) >
      (chDanceValley[i - 1]!.timestamp ?? 0),
    `Calvin Harris Dance Valley clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026);
assert.equal(TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026.length, 74);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-JhpL-KKGoO8"],
  TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
const tujamoParookaville = tracklist1001RowsToPlays(
  TL_TUJAMO_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
assert.equal(tujamoParookaville.length, 74);
assert.equal(tujamoParookaville[0]?.provenance, "1001tl");
assert.equal(tujamoParookaville[0]?.timestamp, 11);
assert.equal(tujamoParookaville[0]?.trackTitle, "WHO (BRANDON Remix)");
assert.equal(
  tujamoParookaville[73]?.trackTitle,
  "We Are Your Friends (Acappella)",
);
assert.equal(tujamoParookaville[73]?.timestamp, 1 * 3600 + 11 * 60 + 41);
for (let i = 1; i < tujamoParookaville.length; i++) {
  assert.ok(
    (tujamoParookaville[i]!.timestamp ?? 0) >
      (tujamoParookaville[i - 1]!.timestamp ?? 0),
    `TUJAMO Parookaville clocks must increase at index ${i}`,
  );
}

assertSeedClocks(
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
);
assert.equal(
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025.length,
  32,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-IwNPc_4ux84"],
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
);
const dfMhParookaville = tracklist1001RowsToPlays(
  TL_DILLON_FRANCIS_AND_MARTEN_HORGER_MAINSTAGE_PAROOKAVILLE_GERMANY_2025,
);
assert.equal(dfMhParookaville.length, 32);
assert.equal(dfMhParookaville[0]?.provenance, "1001tl");
assert.equal(dfMhParookaville[0]?.timestamp, 15);
assert.equal(dfMhParookaville[0]?.trackTitle, "On A Trip");
assert.equal(dfMhParookaville[31]?.trackTitle, "Rave Is Life");
assert.equal(dfMhParookaville[31]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < dfMhParookaville.length; i++) {
  assert.ok(
    (dfMhParookaville[i]!.timestamp ?? 0) >
      (dfMhParookaville[i - 1]!.timestamp ?? 0),
    `Dillon Francis / Marten Horger Parookaville clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026);
assert.equal(TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026.length, 50);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-XisbmW1Smgc"],
  TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
);
const mwTimeLab = tracklist1001RowsToPlays(
  TL_MIKE_WILLIAMS_TIME_LAB_PAROOKAVILLE_GERMANY_2026,
);
assert.equal(mwTimeLab.length, 50);
assert.equal(mwTimeLab[0]?.provenance, "1001tl");
assert.equal(mwTimeLab[0]?.timestamp, 10);
assert.equal(mwTimeLab[0]?.trackTitle, "Drop The Pressure");
assert.equal(mwTimeLab[49]?.trackTitle, "I'll Do It");
assert.equal(mwTimeLab[49]?.timestamp, 56 * 60 + 9);
for (let i = 1; i < mwTimeLab.length; i++) {
  assert.ok(
    (mwTimeLab[i]!.timestamp ?? 0) > (mwTimeLab[i - 1]!.timestamp ?? 0),
    `Mike Williams Time Lab clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026);
assert.equal(TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026.length, 63);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eBeeWwsCVls"],
  TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
const hwParookaville = tracklist1001RowsToPlays(
  TL_HARDWELL_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
assert.equal(hwParookaville.length, 63);
assert.equal(hwParookaville[0]?.provenance, "1001tl");
assert.equal(hwParookaville[0]?.timestamp, 0);
assert.equal(hwParookaville[0]?.trackTitle, "Believe");
assert.equal(hwParookaville[62]?.trackTitle, "IRIS");
assert.equal(hwParookaville[62]?.timestamp, 1 * 3600 + 19 * 60 + 7);
for (let i = 1; i < hwParookaville.length; i++) {
  assert.ok(
    (hwParookaville[i]!.timestamp ?? 0) >
      (hwParookaville[i - 1]!.timestamp ?? 0),
    `Hardwell Parookaville clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026);
assert.equal(TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026.length, 62);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-UETk8HSB0Yw"],
  TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
const dvParookaville = tracklist1001RowsToPlays(
  TL_DUBVISION_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
assert.equal(dvParookaville.length, 62);
assert.equal(dvParookaville[0]?.provenance, "1001tl");
assert.equal(dvParookaville[0]?.timestamp, 11);
assert.equal(
  dvParookaville[0]?.trackTitle,
  "Rise Again vs. In The Name Of Love (DubVision Mashup)",
);
assert.equal(dvParookaville[61]?.trackTitle, "Starlight (Keep Me Afloat)");
assert.equal(dvParookaville[61]?.timestamp, 56 * 60 + 13);
for (let i = 1; i < dvParookaville.length; i++) {
  assert.ok(
    (dvParookaville[i]!.timestamp ?? 0) >
      (dvParookaville[i - 1]!.timestamp ?? 0),
    `DubVision Parookaville clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026);
assert.equal(TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026.length, 58);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-or_SDolEBfw"],
  TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
const wwParookaville = tracklist1001RowsToPlays(
  TL_W_AND_W_MAINSTAGE_PAROOKAVILLE_GERMANY_2026,
);
// 58 seed rows collapse to 56 plays: 1001 lists "Rave From Outer Space" and
// "OIIA OIIA (Spinning Cat)" on two adjacent rows each, and consecutive
// same-song cues fold into one play.
assert.equal(wwParookaville.length, 56);
assert.equal(wwParookaville[0]?.provenance, "1001tl");
assert.equal(wwParookaville[0]?.timestamp, 10);
assert.equal(wwParookaville[0]?.trackTitle, "Bangkok");
assert.equal(wwParookaville[55]?.trackTitle, "Moonlight Shadow");
assert.equal(wwParookaville[55]?.timestamp, 1 * 3600 + 11 * 60 + 25);
for (let i = 1; i < wwParookaville.length; i++) {
  assert.ok(
    (wwParookaville[i]!.timestamp ?? 0) >
      (wwParookaville[i - 1]!.timestamp ?? 0),
    `W&W Parookaville clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MANDY_MANDY_MONDAYS_028_2026);
assert.equal(TL_MANDY_MANDY_MONDAYS_028_2026.length, 47);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-tomorrowland-mandy-mondays-august-2026"],
  TL_MANDY_MANDY_MONDAYS_028_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-J7b0G4XX8pg"],
  TL_MANDY_MANDY_MONDAYS_028_2026,
);
const mandyMondays = tracklist1001RowsToPlays(TL_MANDY_MANDY_MONDAYS_028_2026);
assert.equal(mandyMondays.length, 47);
assert.equal(mandyMondays[0]?.provenance, "1001tl");
assert.equal(mandyMondays[0]?.timestamp, 20);
assert.equal(mandyMondays[0]?.trackTitle, "Miami 2 Ibiza (MANDY Edit)");
assert.equal(
  mandyMondays[46]?.trackTitle,
  "Sweet Dreams x Trepidation (Code Black DJ Tool)",
);
assert.equal(mandyMondays[46]?.timestamp, 57 * 60 + 50);
for (let i = 1; i < mandyMondays.length; i++) {
  assert.ok(
    (mandyMondays[i]!.timestamp ?? 0) > (mandyMondays[i - 1]!.timestamp ?? 0),
    `MANDY Mondays 028 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026);
assert.equal(
  TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026.length,
  55,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-J7b0G4XX8pg"],
  TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
);
const mandyNegativ = tracklist1001RowsToPlays(
  TL_MANDY_AND_NEGATIV_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2026,
);
assert.equal(mandyNegativ.length, 55);
assert.equal(mandyNegativ[0]?.provenance, "1001tl");
assert.equal(mandyNegativ[0]?.timestamp, 20);
assert.equal(mandyNegativ[0]?.trackTitle, "Miami 2 Ibiza (MANDY Edit)");
assert.equal(mandyNegativ[54]?.trackTitle, "Trepidation");
assert.equal(mandyNegativ[54]?.timestamp, 57 * 60 + 56);
for (let i = 1; i < mandyNegativ.length; i++) {
  assert.ok(
    (mandyNegativ[i]!.timestamp ?? 0) > (mandyNegativ[i - 1]!.timestamp ?? 0),
    `MANDY B2B Negativ TML WE1 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
);
assert.equal(
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026.length,
  51,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-B1EaMgsf84Q"],
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
);
const dldkZiggo = tracklist1001RowsToPlays(
  TL_LUCAS_AND_STEVE_AND_MIKE_WILLIAMS_DONT_LET_DADDY_KNOW_ZIGGO_DOME_AMSTERDAM_2026,
);
assert.equal(dldkZiggo.length, 51);
assert.equal(dldkZiggo[0]?.provenance, "1001tl");
assert.equal(dldkZiggo[0]?.timestamp, 21);
assert.equal(dldkZiggo[0]?.trackTitle, "Let's Go");
assert.equal(dldkZiggo[50]?.trackTitle, "Save The World (Acappella)");
assert.equal(dldkZiggo[50]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < dldkZiggo.length; i++) {
  assert.ok(
    (dldkZiggo[i]!.timestamp ?? 0) > (dldkZiggo[i - 1]!.timestamp ?? 0),
    `DLDK Ziggo clocks must increase at index ${i}`,
  );
}

assertSeedClocks(
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
);
assert.equal(
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023.length,
  29,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yPCOu0-JKJo"],
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
);
const indiraTml = tracklist1001RowsToPlays(
  TL_INDIRA_PAGANOTTO_ATMOSPHERE_STAGE_TOMORROWLAND_WE1_BELGIUM_2023,
);
assert.equal(indiraTml.length, 29);
assert.equal(indiraTml[0]?.provenance, "1001tl");
assert.equal(indiraTml[0]?.timestamp, 29);
assert.equal(indiraTml[0]?.trackTitle, "Acatao");
assert.equal(indiraTml[28]?.trackTitle, "Courtesy");
assert.equal(indiraTml[28]?.timestamp, 1 * 3600 + 55 * 60 + 24);
for (let i = 1; i < indiraTml.length; i++) {
  assert.ok(
    (indiraTml[i]!.timestamp ?? 0) > (indiraTml[i - 1]!.timestamp ?? 0),
    `Indira Paganotto TML WE1 2023 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026);
assert.equal(TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026.length, 30);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-mash-up-universe-djs-from-mars-august-2026"
  ],
  TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-tomorrowland-mash-up-universe-djs-from-mars-august-2026",
  ),
  true,
);
const dfm056 = tracklist1001RowsToPlays(
  TL_DJS_FROM_MARS_MASH_UP_UNIVERSE_056_2026,
);
assert.equal(dfm056.length, 30);
assert.equal(dfm056[0]?.provenance, "1001tl");
assert.equal(dfm056[0]?.timestamp, 20);
assert.equal(dfm056[0]?.artistName, "deadmau5");
assert.equal(dfm056[0]?.trackTitle, "Not Exactly (Rinzen Remix)");
assert.equal(dfm056[29]?.artistName, "Skrillex & Damian Marley");
assert.equal(dfm056[29]?.trackTitle, "Make It Bun Dem (HayaT & Vandija Remix)");
assert.equal(dfm056[29]?.timestamp, 58 * 60 + 20);
for (let i = 1; i < dfm056.length; i++) {
  assert.ok(
    (dfm056[i]!.timestamp ?? 0) > (dfm056[i - 1]!.timestamp ?? 0),
    `DJs From Mars Mash-Up Universe 056 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ALESSO_TML_WE1_2026);
assert.equal(TL_ALESSO_TML_WE1_2026.length, 42);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-TidwOi0NMI0"],
  TL_ALESSO_TML_WE1_2026,
);
assert.equal(isWiredTracklistSlug("yt-TidwOi0NMI0"), true);
const alessoWe1 = tracklist1001RowsToPlays(TL_ALESSO_TML_WE1_2026);
assert.equal(alessoWe1.length, 42);
assert.equal(alessoWe1[0]?.provenance, "1001tl");
assert.equal(alessoWe1[0]?.timestamp, 12);
assert.equal(alessoWe1[0]?.artistName, "Alesso");
assert.equal(alessoWe1[0]?.trackTitle, "Get Your Groove On");
assert.equal(alessoWe1[41]?.trackTitle, "Never Going Home Tonight");
assert.equal(alessoWe1[41]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < alessoWe1.length; i++) {
  assert.ok(
    (alessoWe1[i]!.timestamp ?? 0) > (alessoWe1[i - 1]!.timestamp ?? 0),
    `Alesso TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ILLENIUM_TML_WE1_2026);
assert.equal(TL_ILLENIUM_TML_WE1_2026.length, 97);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-E1WH0nvaxAw"],
  TL_ILLENIUM_TML_WE1_2026,
);
assert.equal(isWiredTracklistSlug("yt-E1WH0nvaxAw"), true);
const illeniumWe1 = tracklist1001RowsToPlays(TL_ILLENIUM_TML_WE1_2026);
assert.equal(illeniumWe1.length, 97);
assert.equal(illeniumWe1[0]?.provenance, "1001tl");
assert.equal(illeniumWe1[0]?.timestamp, 12);
assert.equal(illeniumWe1[0]?.artistName, "ILLENIUM");
assert.equal(illeniumWe1[0]?.trackTitle, "ODYSSEY Live Intro Edit");
assert.equal(illeniumWe1[96]?.trackTitle, "Good Things Fall Apart");
assert.equal(illeniumWe1[96]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < illeniumWe1.length; i++) {
  assert.ok(
    (illeniumWe1[i]!.timestamp ?? 0) > (illeniumWe1[i - 1]!.timestamp ?? 0),
    `ILLENIUM TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_CHASE_STATUS_TML_WE2_2026);
assert.equal(TL_CHASE_STATUS_TML_WE2_2026.length, 26);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-jSJEkiV3cCs"],
  TL_CHASE_STATUS_TML_WE2_2026,
);
assert.equal(isWiredTracklistSlug("yt-jSJEkiV3cCs"), true);
const chaseWe2 = tracklist1001RowsToPlays(TL_CHASE_STATUS_TML_WE2_2026);
assert.equal(chaseWe2.length, 26);
assert.equal(chaseWe2[0]?.provenance, "1001tl");
assert.equal(chaseWe2[0]?.timestamp, 27);
assert.equal(chaseWe2[0]?.artistName, "Chase & Status ft. Pozer");
assert.equal(chaseWe2[0]?.trackTitle, "Through The Pain");
assert.equal(chaseWe2[25]?.trackTitle, "Carnage");
assert.equal(chaseWe2[25]?.timestamp, 56 * 60 + 40);
for (let i = 1; i < chaseWe2.length; i++) {
  assert.ok(
    (chaseWe2[i]!.timestamp ?? 0) > (chaseWe2[i - 1]!.timestamp ?? 0),
    `Chase & Status TML WE2 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_I_HATE_MODELS_TML_WE1_2026);
assert.equal(TL_I_HATE_MODELS_TML_WE1_2026.length, 47);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-zMW5SQPS1cY"],
  TL_I_HATE_MODELS_TML_WE1_2026,
);
assert.equal(isWiredTracklistSlug("yt-zMW5SQPS1cY"), true);
const ihmWe1 = tracklist1001RowsToPlays(TL_I_HATE_MODELS_TML_WE1_2026);
assert.equal(ihmWe1.length, 47);
assert.equal(ihmWe1[0]?.provenance, "1001tl");
assert.equal(ihmWe1[0]?.timestamp, 20);
assert.equal(ihmWe1[0]?.artistName, "H! Dude & Angel Cannon");
assert.equal(ihmWe1[0]?.trackTitle, "Who Let The Dogs Out");
assert.equal(ihmWe1[46]?.trackTitle, "Love Is Gone");
assert.equal(ihmWe1[46]?.timestamp, 57 * 60 + 50);
for (let i = 1; i < ihmWe1.length; i++) {
  assert.ok(
    (ihmWe1[i]!.timestamp ?? 0) > (ihmWe1[i - 1]!.timestamp ?? 0),
    `I Hate Models TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_NETSKY_TML_WE1_2026);
assert.equal(TL_NETSKY_TML_WE1_2026.length, 29);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-_e1H9pkcjsQ"],
  TL_NETSKY_TML_WE1_2026,
);
assert.equal(isWiredTracklistSlug("yt-_e1H9pkcjsQ"), true);
const netskyWe1 = tracklist1001RowsToPlays(TL_NETSKY_TML_WE1_2026);
assert.equal(netskyWe1.length, 29);
assert.equal(netskyWe1[0]?.provenance, "1001tl");
assert.equal(netskyWe1[0]?.timestamp, 3 * 60 + 33);
assert.equal(netskyWe1[0]?.artistName, "Netsky & Andromedik");
assert.equal(netskyWe1[0]?.trackTitle, "Out Of Body");
assert.equal(netskyWe1[28]?.trackTitle, "Let Me Hold You (Grafix Remix)");
assert.equal(netskyWe1[28]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < netskyWe1.length; i++) {
  assert.ok(
    (netskyWe1[i]!.timestamp ?? 0) > (netskyWe1[i - 1]!.timestamp ?? 0),
    `Netsky TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_OLIVER_HELDENS_TML_WE1_2026);
assert.equal(TL_OLIVER_HELDENS_TML_WE1_2026.length, 51);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-2i3XOxbp54U"],
  TL_OLIVER_HELDENS_TML_WE1_2026,
);
assert.equal(isWiredTracklistSlug("yt-2i3XOxbp54U"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-2i3XOxbp54U"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-wuMQeEJ3YnQ"],
);
const heldensWe1 = tracklist1001RowsToPlays(TL_OLIVER_HELDENS_TML_WE1_2026);
assert.equal(heldensWe1.length, 51);
assert.equal(heldensWe1[0]?.provenance, "1001tl");
assert.equal(heldensWe1[0]?.timestamp, 12);
assert.equal(heldensWe1[0]?.artistName, "Empire Of The Sun");
assert.equal(heldensWe1[0]?.trackTitle, "We Are The People (ARTBAT Remix)");
assert.equal(
  heldensWe1[50]?.trackTitle,
  "Vielleicht Vielleicht x Makina Time (Rudeejay & Da Brozz Mashup)",
);
assert.equal(heldensWe1[50]?.timestamp, 1 * 3600 + 1 * 60 + 48);
for (let i = 1; i < heldensWe1.length; i++) {
  assert.ok(
    (heldensWe1[i]!.timestamp ?? 0) > (heldensWe1[i - 1]!.timestamp ?? 0),
    `Oliver Heldens TML WE1 2026 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_ALAN_WALKER_TML_WE1_2018);
assert.equal(TL_ALAN_WALKER_TML_WE1_2018.length, 48);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-xVWs0ti0J90"],
  TL_ALAN_WALKER_TML_WE1_2018,
);
assert.equal(isWiredTracklistSlug("yt-xVWs0ti0J90"), true);
const walkerWe1 = tracklist1001RowsToPlays(TL_ALAN_WALKER_TML_WE1_2018);
assert.equal(walkerWe1.length, 48);
assert.equal(walkerWe1[0]?.provenance, "1001tl");
assert.equal(walkerWe1[0]?.timestamp, 4);
assert.equal(walkerWe1[0]?.artistName, "Alan Walker ft. Jesper Borgen");
assert.equal(walkerWe1[0]?.trackTitle, "The Spectre");
assert.equal(walkerWe1[47]?.trackTitle, "Faded (Tiësto Northern Lights Remix)");
assert.equal(walkerWe1[47]?.timestamp, 55 * 60 + 30);
for (let i = 1; i < walkerWe1.length; i++) {
  assert.ok(
    (walkerWe1[i]!.timestamp ?? 0) > (walkerWe1[i - 1]!.timestamp ?? 0),
    `Alan Walker TML WE1 2018 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_GORDO_TML_WE2_2023);
assert.equal(TL_GORDO_TML_WE2_2023.length, 29);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-lopIWBJ0T5I"],
  TL_GORDO_TML_WE2_2023,
);
assert.equal(isWiredTracklistSlug("yt-lopIWBJ0T5I"), true);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-lopIWBJ0T5I?si=_3aa1f1yf9YPzV9g"], undefined);
const gordoWe2 = tracklist1001RowsToPlays(TL_GORDO_TML_WE2_2023);
assert.equal(gordoWe2.length, 29);
assert.equal(gordoWe2[0]?.provenance, "1001tl");
assert.equal(gordoWe2[0]?.timestamp, 2 * 60 + 20);
assert.equal(gordoWe2[0]?.artistName, "Anyma & Chris Avantgarde");
assert.equal(gordoWe2[0]?.trackTitle, "Consciousness");
assert.equal(gordoWe2[28]?.trackTitle, "Satisfaction (Justus Remix)");
assert.equal(gordoWe2[28]?.timestamp, 58 * 60 + 38);
for (let i = 1; i < gordoWe2.length; i++) {
  assert.ok(
    (gordoWe2[i]!.timestamp ?? 0) > (gordoWe2[i - 1]!.timestamp ?? 0),
    `GORDO TML WE2 2023 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_LUCAS_STEVE_TML_WE2_2024);
assert.equal(TL_LUCAS_STEVE_TML_WE2_2024.length, 61);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-GbG_OFmdPKk"],
  TL_LUCAS_STEVE_TML_WE2_2024,
);
assert.equal(isWiredTracklistSlug("yt-GbG_OFmdPKk"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-GbG_OFmdPKk"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-LE-byccuovI"],
);
const lucasSteveWe2_2024 = tracklist1001RowsToPlays(TL_LUCAS_STEVE_TML_WE2_2024);
assert.equal(lucasSteveWe2_2024.length, 61);
assert.equal(lucasSteveWe2_2024[0]?.provenance, "1001tl");
assert.equal(lucasSteveWe2_2024[0]?.timestamp, 12);
assert.equal(
  lucasSteveWe2_2024[0]?.artistName,
  "AFROJACK & Lucas & Steve & DubVision ft. Taranteeno",
);
assert.equal(lucasSteveWe2_2024[0]?.trackTitle, "Anywhere With You");
assert.equal(lucasSteveWe2_2024[60]?.trackTitle, "Can't Forget You (Club Mix)");
assert.equal(lucasSteveWe2_2024[60]?.timestamp, 1 * 3600 + 1 * 60 + 56);
for (let i = 1; i < lucasSteveWe2_2024.length; i++) {
  assert.ok(
    (lucasSteveWe2_2024[i]!.timestamp ?? 0) >
      (lucasSteveWe2_2024[i - 1]!.timestamp ?? 0),
    `Lucas & Steve TML WE2 2024 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_KNOCK2_ZEDD_HARD_SUMMER_2026);
assert.equal(TL_KNOCK2_ZEDD_HARD_SUMMER_2026.length, 65);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_KNOCK2_ZEDD_HARD_SUMMER_2026,
  ),
  false,
);
const knock2Zedd = tracklist1001RowsToPlays(TL_KNOCK2_ZEDD_HARD_SUMMER_2026);
assert.equal(knock2Zedd.length, 65);
assert.equal(knock2Zedd[0]?.provenance, "1001tl");
assert.equal(knock2Zedd[0]?.artistName, "Zedd & Knock2");
assert.equal(knock2Zedd[0]?.trackTitle, "Niteharts 2025 Intro");
assert.equal(knock2Zedd[0]?.timestamp, 0);
assert.equal(
  knock2Zedd[64]?.artistName,
  "Zedd ft. Matthew Koma & Miriam Bryant",
);
assert.equal(knock2Zedd[64]?.trackTitle, "Find You (Acappella)");
assert.equal(knock2Zedd[64]?.timestamp, 1 * 3600 + 15 * 60 + 37);
for (let i = 1; i < knock2Zedd.length; i++) {
  assert.ok(
    (knock2Zedd[i]!.timestamp ?? 0) > (knock2Zedd[i - 1]!.timestamp ?? 0),
    `Knock2 B2B Zedd HARD Summer 2026 clocks must increase at index ${i}`,
  );
}
// DerekD2 fan clip — do not wire.
assert.equal(isWiredTracklistSlug("yt-6DC3xoQF4Zs"), false);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-6DC3xoQF4Zs"], undefined);

assertSeedClocks(TL_COLE_TERRAZAS_HARD_SUMMER_2026);
assert.equal(TL_COLE_TERRAZAS_HARD_SUMMER_2026.length, 6);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_COLE_TERRAZAS_HARD_SUMMER_2026,
  ),
  false,
);
const coleHard = tracklist1001RowsToPlays(TL_COLE_TERRAZAS_HARD_SUMMER_2026);
assert.equal(coleHard.length, 6);
assert.equal(coleHard[0]?.provenance, "1001tl");
assert.equal(coleHard[0]?.artistName, "Led Zeppelin");
assert.equal(coleHard[0]?.trackTitle, "No Quarter");
assert.equal(coleHard[0]?.timestamp, 1);
assert.equal(coleHard[5]?.artistName, "Oshana");
assert.equal(coleHard[5]?.trackTitle, "Girls In The Front");
assert.equal(coleHard[5]?.timestamp, 56 * 60 + 8);
for (let i = 1; i < coleHard.length; i++) {
  assert.ok(
    (coleHard[i]!.timestamp ?? 0) > (coleHard[i - 1]!.timestamp ?? 0),
    `Cole Terrazas HARD Summer 2026 clocks must increase at index ${i}`,
  );
}

// Liu TML artist playback — no 1001 URL found; do not invent a wire.
assert.equal(isWiredTracklistSlug("yt-DWPSLZLKslg"), false);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-DWPSLZLKslg"], undefined);

assertSeedClocks(TL_TAPE_B_CARTUNES_VOL5_2026);
assert.equal(TL_TAPE_B_CARTUNES_VOL5_2026.length, 35);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7_O8N_EJg_c"],
  TL_TAPE_B_CARTUNES_VOL5_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-tape-b-official-tape-b-cartunes-vol-5"],
  TL_TAPE_B_CARTUNES_VOL5_2026,
);
assert.equal(isWiredTracklistSlug("yt-7_O8N_EJg_c"), true);
assert.equal(
  isWiredTracklistSlug("sc-tape-b-official-tape-b-cartunes-vol-5"),
  true,
);
const tapeBCt5 = tracklist1001RowsToPlays(TL_TAPE_B_CARTUNES_VOL5_2026);
assert.equal(tapeBCt5.length, 35);
assert.equal(tapeBCt5[0]?.provenance, "1001tl");
assert.equal(tapeBCt5[0]?.artistName, "Dubba Jonny");
assert.equal(
  tapeBCt5[0]?.trackTitle,
  "A Brief Introduction On Dubstep Production (Tape B Edit)",
);
assert.equal(tapeBCt5[0]?.timestamp, 20);
assert.equal(tapeBCt5[34]?.artistName, "Lana Del Rey");
assert.match(String(tapeBCt5[34]?.trackTitle), /Young & Beautiful/);
assert.equal(tapeBCt5[34]?.timestamp, 57 * 60 + 34);
for (let i = 1; i < tapeBCt5.length; i++) {
  assert.ok(
    (tapeBCt5[i]!.timestamp ?? 0) > (tapeBCt5[i - 1]!.timestamp ?? 0),
    `Tape B CarTunes Vol. 5 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_MAU_P_XXX_RADIO_201_2026);
assert.equal(TL_MAU_P_XXX_RADIO_201_2026.length, 8);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-realmaup-xxx-radio-201"],
  TL_MAU_P_XXX_RADIO_201_2026,
);
assert.equal(isWiredTracklistSlug("sc-realmaup-xxx-radio-201"), true);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/realmaup/xxx-radio-201"
  ],
  undefined,
);
const mauPXxx = tracklist1001RowsToPlays(TL_MAU_P_XXX_RADIO_201_2026);
assert.equal(mauPXxx.length, 8);
assert.equal(mauPXxx[0]?.provenance, "1001tl");
assert.equal(mauPXxx[0]?.artistName, "Chris Brooks & Resco (US)");
assert.equal(mauPXxx[0]?.trackTitle, "Dat Funk");
assert.equal(mauPXxx[0]?.timestamp, 20);
assert.equal(mauPXxx[7]?.artistName, "Bagheera (FR)");
assert.equal(mauPXxx[7]?.trackTitle, "7 Heures Du Matin");
assert.equal(mauPXxx[7]?.timestamp, 48 * 60 + 50);
for (let i = 1; i < mauPXxx.length; i++) {
  assert.ok(
    (mauPXxx[i]!.timestamp ?? 0) > (mauPXxx[i - 1]!.timestamp ?? 0),
    `Mau P XXX Radio 201 clocks must increase at index ${i}`,
  );
}

assertSeedClocks(TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024);
assert.equal(TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024.length, 26);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-KbGNocaJDjw"],
  TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-vintageculturemusic-vintage-culture-robot-heart-residency-2024-california"
  ],
  TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
);
assert.equal(isWiredTracklistSlug("yt-KbGNocaJDjw"), true);
const vcRobot = tracklist1001RowsToPlays(
  TL_VINTAGE_CULTURE_ROBOT_HEART_RESIDENCY_UNITED_STATES_2024,
);
assert.equal(vcRobot.length, 26);
assert.equal(vcRobot[0]?.provenance, "1001tl");
assert.equal(vcRobot[0]?.artistName, "Bedouin");
assert.equal(vcRobot[0]?.trackTitle, "Tijuana (Vintage Culture Remix)");
assert.equal(vcRobot[25]?.artistName, "Vintage Culture ft. Noah Kulaga");
assert.equal(vcRobot[25]?.trackTitle, "Upon Your Skin");
assert.equal(vcRobot[25]?.timestamp, 2 * 3600 + 14 * 60 + 45);

assertSeedClocks(TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025);
assert.equal(TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025.length, 6);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-PkWNuf7rtms"],
  TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
);
assert.equal(isWiredTracklistSlug("yt-PkWNuf7rtms"), true);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-johnsummit-john-summit-burning-man-playa-package-mix-experts-only-remix-album"
  ],
  TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
);
assert.equal(
  isWiredTracklistSlug(
    "sc-johnsummit-john-summit-burning-man-playa-package-mix-experts-only-remix-album",
  ),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-PkWNuf7rtms"), false);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-johnsummit-john-summit-burning-man-playa-package-mix-experts-only-remix-album",
  ),
  true,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-PkWNuf7rtms"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-PlArfyuzuqo"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-PkWNuf7rtms"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-9TKqqBCmDHA"],
  "Playa Package is not the Lollapalooza seed",
);
const playaPackage = tracklist1001RowsToPlays(
  TL_JOHN_SUMMIT_BURNING_MAN_PLAYA_PACKAGE_MIX_2025,
);
assert.equal(playaPackage.length, 6);
assert.equal(playaPackage[0]?.provenance, "1001tl");
assert.equal(playaPackage[0]?.artistName, "John Summit ft. Inéz");
assert.equal(playaPackage[0]?.trackTitle, "crystallized (Playa Dub Remix)");
assert.equal(playaPackage[5]?.artistName, "John Summit ft. CLOVES");
assert.equal(playaPackage[5]?.trackTitle, "Focus (EdiP Remix)");
assert.equal(playaPackage[5]?.timestamp, 21 * 60 + 50);

assertSeedClocks(TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024);
assert.equal(TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024.length, 37);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-AQ6wWT2HaSQ"],
  TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-brandonsounds-brandon-live-at-parookaville-2024-desert-valley"
  ],
  TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
);
assert.equal(isWiredTracklistSlug("yt-AQ6wWT2HaSQ"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-brandonsounds-brandon-live-at-parookaville-2024-desert-valley",
  ),
  true,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/brandonsounds/brandon-live-at-parookaville-2024-desert-valley"
  ],
  undefined,
);
const brandonPv = tracklist1001RowsToPlays(
  TL_BRANDON_DESERT_VALLEY_PAROOKAVILLE_GERMANY_2024,
);
assert.equal(brandonPv.length, 37);
assert.equal(brandonPv[0]?.provenance, "1001tl");
assert.equal(brandonPv[0]?.artistName, "Victor Lou & Visage Music");
assert.equal(brandonPv[0]?.trackTitle, "Pleya");
assert.equal(brandonPv[0]?.timestamp, 1);
assert.equal(brandonPv[36]?.artistName, "Andrewboy ft. Moby");
assert.equal(brandonPv[36]?.trackTitle, "Porcelain");
assert.equal(brandonPv[36]?.timestamp, 57 * 60 + 41);
for (let i = 1; i < brandonPv.length; i++) {
  assert.ok(
    (brandonPv[i]!.timestamp ?? 0) > (brandonPv[i - 1]!.timestamp ?? 0),
    `BRANDON Parookaville 2024 clocks must increase at index ${i}`,
  );
}

// Tini Gessler ANTS Ushuaïa — official SC playback in, 1001 URL recorded,
// screenshots had no clocks. Do not invent 1001tl rows or sc-https://… slugs.
assert.equal(
  isWiredTracklistSlug("sc-tini-gessler-tini-gessler-ants-x-ushuaia"),
  false,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tini-gessler-tini-gessler-ants-x-ushuaia"
  ],
  undefined,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/tini-gessler/tini-gessler-ants-x-ushuaia"
  ],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-sLtNC21myWM"), true);

// Claptone Clapcast 576 — official SC playback in, 1001 URL recorded,
// no cue paste. Do not invent 1001tl rows or sc-https://… slugs.
assert.equal(isWiredTracklistSlug("sc-claptone-clapcast-576"), false);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["sc-claptone-clapcast-576"], undefined);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/claptone/clapcast-576"
  ],
  undefined,
);

// Zedd @ Mainstage, Ultra Miami 2025 — his own channel, and the video was
// already curated without cues, so assert the seed reaches both the slug map
// and that entry.
assertSeedClocks(TL_ZEDD_ULTRA_MIAMI_MAINSTAGE_2025);
assert.equal(TL_ZEDD_ULTRA_MIAMI_MAINSTAGE_2025.length, 38);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-TT32mIg4oqg"],
  TL_ZEDD_ULTRA_MIAMI_MAINSTAGE_2025,
);
const zeddUltra = tracklist1001RowsToPlays(TL_ZEDD_ULTRA_MIAMI_MAINSTAGE_2025);
assert.equal(zeddUltra.length, 38);
assert.equal(zeddUltra[0]?.provenance, "1001tl");
assert.equal(zeddUltra[0]?.timestamp, 0);
assert.equal(
  zeddUltra[0]?.trackTitle,
  "Everything In Its Right Place (Zedd Remix)",
);
assert.equal(zeddUltra[37]?.trackTitle, "Clarity");
assert.equal(zeddUltra[37]?.timestamp, 52 * 60 + 5);
for (let i = 1; i < zeddUltra.length; i++) {
  assert.ok(
    (zeddUltra[i]!.timestamp ?? 0) > (zeddUltra[i - 1]!.timestamp ?? 0),
    `Zedd Ultra clocks must increase at index ${i}`,
  );
}
// Layered blends 1s apart must stay two cues, not fold into one.
assert.equal(zeddUltra[3]?.timestamp, 4 * 60 + 55);
assert.equal(zeddUltra[4]?.timestamp, 4 * 60 + 56);
assert.equal(zeddUltra[3]?.trackTitle, "All Night");
assert.equal(zeddUltra[4]?.trackTitle, "Tangerine Rays");
// "Stay" is played once and then again as a mashup component, non-adjacent, so
// both cues survive the consecutive-same-song collapse.
assert.equal(
  zeddUltra.filter((p) => p.trackTitle === "Stay").length,
  2,
  "both Stay cues must survive",
);
assert.notEqual(TL_ZEDD_ULTRA_MIAMI_MAINSTAGE_2025, TL_KNOCK2_ZEDD_HARD_SUMMER_2026);

// Black Coffee @ Mayan Warrior, Burning Man 2025 — the venue collective's own
// channel. The video was already curated in YOUTUBE_SETS with no cues, so this
// capture fills an existing set; assert the seed is attached there too, not
// just wired in the slug map.
assertSeedClocks(TL_BLACK_COFFEE_MAYAN_WARRIOR_BURNING_MAN_2025);
assert.equal(TL_BLACK_COFFEE_MAYAN_WARRIOR_BURNING_MAN_2025.length, 45);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-FH7lIOv1s3Q"],
  TL_BLACK_COFFEE_MAYAN_WARRIOR_BURNING_MAN_2025,
);
const blackCoffeeBm = tracklist1001RowsToPlays(
  TL_BLACK_COFFEE_MAYAN_WARRIOR_BURNING_MAN_2025,
);
assert.equal(blackCoffeeBm.length, 45);
assert.equal(blackCoffeeBm[0]?.provenance, "1001tl");
assert.equal(blackCoffeeBm[0]?.timestamp, 0);
assert.equal(blackCoffeeBm[0]?.trackTitle, "Baby Run");
assert.equal(blackCoffeeBm[44]?.trackTitle, "I Will Survive");
assert.equal(blackCoffeeBm[44]?.timestamp, 3 * 3600 + 28 * 60 + 22);
for (let i = 1; i < blackCoffeeBm.length; i++) {
  assert.ok(
    (blackCoffeeBm[i]!.timestamp ?? 0) > (blackCoffeeBm[i - 1]!.timestamp ?? 0),
    `Black Coffee Burning Man clocks must increase at index ${i}`,
  );
}
// Roland Clark appears twice under different titles — both cues must survive.
assert.equal(
  blackCoffeeBm.filter((p) => /Roland Clark/.test(p.rawText ?? "")).length,
  2,
);

// Joris Voorn & Cassian — Spectrum Radio 484. The YouTube slug carries the
// set; the SoundCloud slug must hold the same array so the twin group keeps all
// three hosts. joris-voorn is not a curated SC account, so wiring SC alone (as
// the operator paste's Wire line did) would leave the seed orphaned.
assertSeedClocks(TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026);
assert.equal(TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026.length, 18);
for (const slug of ["yt-d5JZLJSJc6w", "sc-joris-voorn-spectrum-radio-484"]) {
  assert.equal(
    TRACKLIST_1001_BY_SOURCE_SLUG[slug],
    TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026,
    `Spectrum 484 must share one seed object on ${slug}`,
  );
}
const spectrum484 = tracklist1001RowsToPlays(
  TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026,
);
assert.equal(spectrum484.length, 18);
assert.equal(spectrum484[0]?.provenance, "1001tl");
assert.equal(spectrum484[0]?.timestamp, 30);
assert.equal(spectrum484[0]?.trackTitle, "Horizon (Eelke Kleijn Remix)");
assert.equal(spectrum484[17]?.trackTitle, "Payback");
assert.equal(spectrum484[17]?.timestamp, 59 * 60 + 45);
for (let i = 1; i < spectrum484.length; i++) {
  assert.ok(
    (spectrum484[i]!.timestamp ?? 0) > (spectrum484[i - 1]!.timestamp ?? 0),
    `Spectrum 484 clocks must increase at index ${i}`,
  );
}
// Consecutive episodes share his own promos, so they must stay separate seeds.
assert.notEqual(
  TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026,
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
);

// Spectrum Radio 486 — Balance Croatia. Same three-host pattern as 484.
assertSeedClocks(TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026);
assert.equal(TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026.length, 18);
for (const slug of ["yt-wlePVzVaMOY", "sc-joris-voorn-spectrum-radio-486"]) {
  assert.equal(
    TRACKLIST_1001_BY_SOURCE_SLUG[slug],
    TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026,
    `Spectrum 486 must share one seed object on ${slug}`,
  );
}
const spectrum486 = tracklist1001RowsToPlays(
  TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026,
);
assert.equal(spectrum486.length, 18);
assert.equal(spectrum486[0]?.provenance, "1001tl");
assert.equal(spectrum486[0]?.timestamp, 48);
assert.equal(spectrum486[0]?.trackTitle, "Walk Thru Ruins (Melatonin Version)");
assert.equal(
  spectrum486[17]?.trackTitle,
  "So Get Up (The End Of The Earth Acappella)",
);
assert.equal(spectrum486[17]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < spectrum486.length; i++) {
  assert.ok(
    (spectrum486[i]!.timestamp ?? 0) > (spectrum486[i - 1]!.timestamp ?? 0),
    `Spectrum 486 clocks must increase at index ${i}`,
  );
}
assert.notEqual(
  TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026,
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
);
assert.notEqual(
  TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026,
  TL_JORIS_VOORN_CASSIAN_SPECTRUM_RADIO_484_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yTRvLrtsM9I"],
  TL_JORIS_VOORN_SPECTRUM_RADIO_485_CZECH_2026,
);

// Cloonee @ neonGARDEN, EDC Orlando 2025-11-08 — official artist-channel
// YouTube. "Stephanie" plays twice but the second is the Beyond Limits Edit,
// and the two cues are far apart, so nothing collapses.
assertSeedClocks(TL_CLOONEE_NEONGARDEN_EDC_ORLANDO_2025);
assert.equal(TL_CLOONEE_NEONGARDEN_EDC_ORLANDO_2025.length, 25);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-3mOMDdX6miw"],
  TL_CLOONEE_NEONGARDEN_EDC_ORLANDO_2025,
);
const clooneeOrlando = tracklist1001RowsToPlays(
  TL_CLOONEE_NEONGARDEN_EDC_ORLANDO_2025,
);
assert.equal(clooneeOrlando.length, 25);
assert.equal(clooneeOrlando[0]?.provenance, "1001tl");
assert.equal(clooneeOrlando[0]?.timestamp, 72);
assert.equal(clooneeOrlando[0]?.trackTitle, "I Rhyme Quick");
assert.equal(clooneeOrlando[24]?.trackTitle, "So In Love With You (Full Intention Remix)");
assert.equal(clooneeOrlando[24]?.timestamp, 1 * 3600 + 25 * 60 + 31);
for (let i = 1; i < clooneeOrlando.length; i++) {
  assert.ok(
    (clooneeOrlando[i]!.timestamp ?? 0) > (clooneeOrlando[i - 1]!.timestamp ?? 0),
    "Cloonee EDC Orlando clocks must increase",
  );
}
// Distinct from the other two Cloonee captures already on file.
assert.notEqual(
  TL_CLOONEE_NEONGARDEN_EDC_ORLANDO_2025,
  TL_CLOONEE_EDC_LV_2022,
);

// Anyma & Solomun @ Mainstage, Ultra Miami 2025-03-29 — official Anyma YT.
// Fan SC edmfamilylivesets2025 + hearthis razorator stay unwired.
assertSeedClocks(TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025);
assert.equal(TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025.length, 30);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1TN78OJjJT0"],
  TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-edmfamilylivesets2025-anyma-b2b-solomun-live-ultra-music-festival-2025-miami-day2"
  ],
  undefined,
);
const anymaSolomunUltra = tracklist1001RowsToPlays(
  TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025,
);
assert.equal(anymaSolomunUltra.length, 30);
assert.equal(anymaSolomunUltra[0]?.provenance, "1001tl");
assert.equal(anymaSolomunUltra[0]?.timestamp, 15);
assert.equal(
  anymaSolomunUltra[0]?.trackTitle,
  "At Night (Anyma & Layton Giordani Remix)",
);
assert.equal(anymaSolomunUltra[25]?.artistName, "ID ID");
assert.equal(anymaSolomunUltra[25]?.trackTitle, "Push That");
assert.equal(anymaSolomunUltra[25]?.timestamp, 3600 + 15 * 60 + 12);
assert.equal(anymaSolomunUltra[29]?.trackTitle, "Change It");
assert.equal(anymaSolomunUltra[29]?.timestamp, 3600 + 26 * 60 + 42);
assert.equal(
  anymaSolomunUltra.some((p) => /^id$/i.test(p.trackTitle ?? "")),
  false,
  "named ID ID / Push That stays; bare title ID must stay dropped",
);
for (let i = 1; i < anymaSolomunUltra.length; i++) {
  assert.ok(
    (anymaSolomunUltra[i]!.timestamp ?? 0) >
      (anymaSolomunUltra[i - 1]!.timestamp ?? 0),
    `Anyma & Solomun Ultra Miami clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-1TN78OJjJT0"), true);
assert.equal(
  isWiredTracklistSlug(
    "sc-edmfamilylivesets2025-anyma-b2b-solomun-live-ultra-music-festival-2025-miami-day2",
  ),
  false,
);

// Oscar And The Wolf @ Crystal Garden, Tomorrowland WE1 2026-07-19 —
// official Tomorrowland YT. Overlay TL_OSCAR is too generic.
assertSeedClocks(TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026);
assert.equal(TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026.length, 18);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Ty03QjFnL90"],
  TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026,
);
const oscarWolf = tracklist1001RowsToPlays(
  TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026,
);
assert.equal(oscarWolf.length, 18);
assert.equal(oscarWolf[0]?.provenance, "1001tl");
assert.equal(oscarWolf[0]?.timestamp, 2 * 60 + 11);
assert.equal(oscarWolf[0]?.trackTitle, "Universe");
assert.equal(oscarWolf[17]?.trackTitle, "Strange Entity");
assert.equal(oscarWolf[17]?.timestamp, 56 * 60 + 48);
for (let i = 1; i < oscarWolf.length; i++) {
  assert.ok(
    (oscarWolf[i]!.timestamp ?? 0) > (oscarWolf[i - 1]!.timestamp ?? 0),
    `Oscar And The Wolf TML WE1 clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-Ty03QjFnL90"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Ty03QjFnL90"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-n3TESnQqiQ4"],
  "Oscar And The Wolf is not the Blondish Crystal Garden WE1 seed",
);

// Agents Of Time @ Mainstage, Tomorrowland WE2 2026-07-25 — official
// Tomorrowland YT. Distinct from Time Warp Floor 1.
assertSeedClocks(TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026);
assert.equal(TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026.length, 17);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5GyoClE4Q8o"],
  TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5GyoClE4Q8o"],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-agents-of-time-agents-of-time-time-warp-full"
  ],
);
const aotTml = tracklist1001RowsToPlays(TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026);
assert.equal(aotTml.length, 17);
assert.equal(aotTml[0]?.provenance, "1001tl");
assert.equal(aotTml[0]?.timestamp, 13);
assert.equal(aotTml[0]?.trackTitle, "Forever");
assert.equal(aotTml[16]?.trackTitle, "I Can't Do Without You");
assert.equal(aotTml[16]?.timestamp, 56 * 60 + 19);
for (let i = 1; i < aotTml.length; i++) {
  assert.ok(
    (aotTml[i]!.timestamp ?? 0) > (aotTml[i - 1]!.timestamp ?? 0),
    `Agents Of Time TML WE2 clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-5GyoClE4Q8o"), true);
assert.notEqual(
  TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026,
  TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026,
);

// Steve Angello @ Crystal Garden, Tomorrowland WE1 2026-07-18 — official
// Tomorrowland YT. Distinct from Mainstage WE2.
assertSeedClocks(TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026);
assert.equal(TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026.length, 77);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eir5Sh_gHbo"],
  TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eir5Sh_gHbo"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5AdQy7lCbN0"],
);
assert.notEqual(
  TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026,
  TL_STEVE_ANGELLO_TML_WE2_2026,
);
const angelloCrystal = tracklist1001RowsToPlays(
  TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026,
);
assert.equal(angelloCrystal.length, 77);
assert.equal(angelloCrystal[0]?.provenance, "1001tl");
assert.equal(angelloCrystal[0]?.timestamp, 11);
assert.equal(angelloCrystal[0]?.trackTitle, "Darkness In Me");
assert.equal(angelloCrystal[76]?.trackTitle, "Happiness Is So Sad");
assert.equal(angelloCrystal[76]?.timestamp, 2 * 3600 + 55 * 60 + 10);
for (let i = 1; i < angelloCrystal.length; i++) {
  assert.ok(
    (angelloCrystal[i]!.timestamp ?? 0) >
      (angelloCrystal[i - 1]!.timestamp ?? 0),
    `Steve Angello TML WE1 Crystal clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-eir5Sh_gHbo"), true);
assert.equal(isWiredTracklistSlug("yt-5AdQy7lCbN0"), true);

// deadmau5 @ Mainstage, Veld 2025-08-03 — official @deadmau5 YT already
// curated. Overlay TL_DEADMAU5 is too generic. The Veldt + remix 1s pair
// stays as captured.
assertSeedClocks(TL_DEADMAU5_VELD_MAINSTAGE_2025);
assert.equal(TL_DEADMAU5_VELD_MAINSTAGE_2025.length, 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5LqJCIi6p7Y"],
  TL_DEADMAU5_VELD_MAINSTAGE_2025,
);
const mau5Veld = tracklist1001RowsToPlays(TL_DEADMAU5_VELD_MAINSTAGE_2025);
assert.equal(mau5Veld.length, 22);
assert.equal(mau5Veld[0]?.provenance, "1001tl");
assert.equal(mau5Veld[0]?.timestamp, 0);
assert.equal(mau5Veld[0]?.trackTitle, "Artefact");
assert.equal(mau5Veld[20]?.trackTitle, "The Veldt");
assert.equal(mau5Veld[20]?.timestamp, 66 * 60 + 30);
assert.equal(mau5Veld[21]?.trackTitle, "The Veldt (Tommy Trash Remix)");
assert.equal(mau5Veld[21]?.timestamp, 66 * 60 + 31);
for (let i = 1; i < mau5Veld.length; i++) {
  assert.ok(
    (mau5Veld[i]!.timestamp ?? 0) > (mau5Veld[i - 1]!.timestamp ?? 0),
    `deadmau5 Veld clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-5LqJCIi6p7Y"), true);

// Carl Cox @ Boiler Room Ibiza Villa Takeovers 2013-08-15 — official
// Boiler Room YT + SC host twin. Overlay TL_CARL_COX is too generic.
assertSeedClocks(TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013);
assert.equal(TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-vy-k0FopsmY"],
  TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-platform-carl-cox-45-min-boiler-room"],
  TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013,
);
const coxVilla = tracklist1001RowsToPlays(
  TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013,
);
assert.equal(coxVilla.length, 13);
assert.equal(coxVilla[0]?.provenance, "1001tl");
assert.equal(coxVilla[0]?.timestamp, 0);
assert.equal(coxVilla[0]?.trackTitle, "Muzik Xpress");
assert.equal(coxVilla[12]?.trackTitle, "Finally");
assert.equal(coxVilla[12]?.timestamp, 40 * 60 + 50);
for (let i = 1; i < coxVilla.length; i++) {
  assert.ok(
    (coxVilla[i]!.timestamp ?? 0) > (coxVilla[i - 1]!.timestamp ?? 0),
    `Carl Cox Boiler Room Ibiza clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-vy-k0FopsmY"), true);
assert.equal(
  isWiredTracklistSlug("sc-platform-carl-cox-45-min-boiler-room"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-vy-k0FopsmY"), false);
assert.equal(
  isSecondaryPlaybackSlug("sc-platform-carl-cox-45-min-boiler-room"),
  true,
);

// MARNIK @ Planaxis, Tomorrowland WE1 2026-07-18 — official SC.
// Overlay TL_MARNIK is too generic. No YT in the paste.
assertSeedClocks(TL_MARNIK_TML_WE1_PLANAXIS_2026);
assert.equal(TL_MARNIK_TML_WE1_PLANAXIS_2026.length, 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-marnikofficial-marnik-live-at-tomorrowland"],
  TL_MARNIK_TML_WE1_PLANAXIS_2026,
);
const marnikPlanaxis = tracklist1001RowsToPlays(
  TL_MARNIK_TML_WE1_PLANAXIS_2026,
);
assert.equal(marnikPlanaxis.length, 22);
assert.equal(marnikPlanaxis[0]?.provenance, "1001tl");
assert.equal(marnikPlanaxis[0]?.timestamp, 0);
assert.equal(marnikPlanaxis[0]?.trackTitle, "Stranger (To Stability)");
assert.equal(marnikPlanaxis[21]?.trackTitle, "Hard Techno");
assert.equal(marnikPlanaxis[21]?.timestamp, 51 * 60 + 44);
for (let i = 1; i < marnikPlanaxis.length; i++) {
  assert.ok(
    (marnikPlanaxis[i]!.timestamp ?? 0) >
      (marnikPlanaxis[i - 1]!.timestamp ?? 0),
    `MARNIK TML WE1 Planaxis clocks must increase at index ${i}`,
  );
}
assert.equal(
  isWiredTracklistSlug("sc-marnikofficial-marnik-live-at-tomorrowland"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-marnikofficial-marnik-live-at-tomorrowland"),
  false,
);
assert.equal(
  isWiredTracklistSlug("sc-marnikofficial-marnik-presents-unlegend-show"),
  false,
);

// Fideles @ Freedom Stage, Tomorrowland WE2 2026-07-26 — official
// Tomorrowland YT. Overlay TL_FIDELES is too generic. No SC in the paste.
assertSeedClocks(TL_FIDELES_TML_WE2_FREEDOM_2026);
assert.equal(TL_FIDELES_TML_WE2_FREEDOM_2026.length, 23);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-e0xXSwtVwe0"],
  TL_FIDELES_TML_WE2_FREEDOM_2026,
);
const fidelesFreedom = tracklist1001RowsToPlays(
  TL_FIDELES_TML_WE2_FREEDOM_2026,
);
assert.equal(fidelesFreedom.length, 23);
assert.equal(fidelesFreedom[0]?.provenance, "1001tl");
assert.equal(fidelesFreedom[0]?.timestamp, 12);
assert.equal(fidelesFreedom[0]?.trackTitle, "Breathe");
assert.equal(fidelesFreedom[0]?.artistName, "The Prodigy");
assert.equal(fidelesFreedom[22]?.trackTitle, "Let The Drums Speak");
assert.equal(fidelesFreedom[22]?.timestamp, 1 * 3600 + 28 * 60 + 1);
assert.equal(fidelesFreedom[13]?.trackTitle, "Victory Lap Five");
for (let i = 1; i < fidelesFreedom.length; i++) {
  assert.ok(
    (fidelesFreedom[i]!.timestamp ?? 0) >
      (fidelesFreedom[i - 1]!.timestamp ?? 0),
    `Fideles TML WE2 Freedom clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-e0xXSwtVwe0"), true);
assert.equal(isSecondaryPlaybackSlug("yt-e0xXSwtVwe0"), false);

// The Chainsmokers @ Mainstage, Ultra Melbourne 2026-04-11 — official
// artist YT already curated. Overlay TL_THE_CHAINSMOKERS is too generic
// and is not TML WE1. Mashup 1s closer cluster stays as captured.
assertSeedClocks(TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026);
assert.equal(TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026.length, 95);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-A5ERobJaS_0"],
  TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-A5ERobJaS_0"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1lqmFLr-SkA"],
  "Ultra Melbourne is not the Tomorrowland WE1 seed",
);
const tcsMelbourne = tracklist1001RowsToPlays(
  TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026,
);
assert.equal(tcsMelbourne.length, 95);
assert.equal(tcsMelbourne[0]?.provenance, "1001tl");
assert.equal(tcsMelbourne[0]?.timestamp, 0);
assert.equal(
  tcsMelbourne[0]?.trackTitle,
  "Something Just Like This (Acappella)",
);
assert.equal(tcsMelbourne[94]?.trackTitle, "Sailor Song");
assert.equal(tcsMelbourne[94]?.timestamp, 1 * 3600 + 11 * 60 + 7);
assert.equal(tcsMelbourne[93]?.timestamp, 1 * 3600 + 11 * 60 + 6);
for (let i = 1; i < tcsMelbourne.length; i++) {
  assert.ok(
    (tcsMelbourne[i]!.timestamp ?? 0) >
      (tcsMelbourne[i - 1]!.timestamp ?? 0),
    `Chainsmokers Ultra Melbourne clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-A5ERobJaS_0"), true);
assert.equal(isSecondaryPlaybackSlug("yt-A5ERobJaS_0"), false);
assert.equal(isWiredTracklistSlug("yt-1lqmFLr-SkA"), true);

// Bleu Clair @ BLEUPRINT VOL. 5, Jakarta livestream 2022-03-31 — official
// artist YT already curated + official SC host twin. Overlay TL_BLEU_CLAIR
// is too generic and is not EDC LV 2023.
assertSeedClocks(TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022);
assert.equal(TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-_hdM8uJV1LM"],
  TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-bleuclair-bleuprintvol5"],
  TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-_hdM8uJV1LM"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-c_sx3zum8Z0"],
  "BLEUPRINT VOL. 5 is not the EDC LV 2023 seed",
);
const bleuBlueprint = tracklist1001RowsToPlays(
  TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022,
);
assert.equal(bleuBlueprint.length, 12);
assert.equal(bleuBlueprint[0]?.provenance, "1001tl");
assert.equal(bleuBlueprint[0]?.timestamp, 2);
assert.equal(bleuBlueprint[0]?.trackTitle, "Funk Accelerator");
assert.equal(bleuBlueprint[11]?.trackTitle, "Mistake");
assert.equal(bleuBlueprint[11]?.timestamp, 30 * 60 + 59);
for (let i = 1; i < bleuBlueprint.length; i++) {
  assert.ok(
    (bleuBlueprint[i]!.timestamp ?? 0) >
      (bleuBlueprint[i - 1]!.timestamp ?? 0),
    `Bleu Clair BLEUPRINT VOL. 5 clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-_hdM8uJV1LM"), true);
assert.equal(isWiredTracklistSlug("sc-bleuclair-bleuprintvol5"), true);
assert.equal(isSecondaryPlaybackSlug("yt-_hdM8uJV1LM"), false);
assert.equal(isSecondaryPlaybackSlug("sc-bleuclair-bleuprintvol5"), true);

// Bart Skils @ Fire Stage, Loveland Festival 2026-08-08 — official Loveland
// YT + festival SC + artist SC (same 5466s edit). Overlay TL_BART_SKILS
// is too generic. Both SC slugs are secondary; YT is the survivor.
assertSeedClocks(TL_BART_SKILS_LOVELAND_FIRE_2026);
assert.equal(TL_BART_SKILS_LOVELAND_FIRE_2026.length, 18);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-d-EOE2u7HT4"],
  TL_BART_SKILS_LOVELAND_FIRE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-loveland-legacy-bart-skils-loveland-festival"
  ],
  TL_BART_SKILS_LOVELAND_FIRE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-bart-skils-bart-skils-loveland-festival"],
  TL_BART_SKILS_LOVELAND_FIRE_2026,
);
const bartLoveland = tracklist1001RowsToPlays(TL_BART_SKILS_LOVELAND_FIRE_2026);
assert.equal(bartLoveland.length, 18);
assert.equal(bartLoveland[0]?.provenance, "1001tl");
assert.equal(bartLoveland[0]?.timestamp, 0);
assert.equal(bartLoveland[0]?.trackTitle, "Intro");
assert.equal(bartLoveland[17]?.trackTitle, "Strings Of Life (Stronger On My Own) (Bart Skils & Weska Remix)");
assert.equal(bartLoveland[17]?.timestamp, 1 * 3600 + 26 * 60 + 40);
for (let i = 1; i < bartLoveland.length; i++) {
  assert.ok(
    (bartLoveland[i]!.timestamp ?? 0) >
      (bartLoveland[i - 1]!.timestamp ?? 0),
    `Bart Skils Loveland Fire clocks must increase at index ${i}`,
  );
}
assert.equal(isWiredTracklistSlug("yt-d-EOE2u7HT4"), true);
assert.equal(
  isWiredTracklistSlug("sc-loveland-legacy-bart-skils-loveland-festival"),
  true,
);
assert.equal(
  isWiredTracklistSlug("sc-bart-skils-bart-skils-loveland-festival"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-d-EOE2u7HT4"), false);
assert.equal(
  isSecondaryPlaybackSlug("sc-loveland-legacy-bart-skils-loveland-festival"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-bart-skils-bart-skils-loveland-festival"),
  true,
);

// Topic - Tomorrowland Friendship Mix 2026-08-20 — official Tomorrowland SC.
// Overlay TL_TOPIC is too generic. Distinct from Topic WE2 2024.
// No YT in the paste.
assertSeedClocks(TL_TOPIC_TML_FRIENDSHIP_MIX_2026);
assert.equal(TL_TOPIC_TML_FRIENDSHIP_MIX_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-tomorrowland-friendship-mix-with-topic-august-2026"
  ],
  TL_TOPIC_TML_FRIENDSHIP_MIX_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-tomorrowland-friendship-mix-with-topic-august-2026"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yrG_Ldr05SQ"],
);
assert.equal(isWiredTracklistSlug("yt-topic-friendship-mix"), false);
assert.equal(
  isWiredTracklistSlug(
    "sc-tomorrowland-tomorrowland-friendship-mix-with-topic-august-2026",
  ),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-tomorrowland-tomorrowland-friendship-mix-with-topic-august-2026",
  ),
  false,
);
const topicFriendship = tracklist1001RowsToPlays(
  TL_TOPIC_TML_FRIENDSHIP_MIX_2026,
);
assert.equal(topicFriendship.length, 15);
assert.equal(topicFriendship[0]?.provenance, "1001tl");
assert.equal(topicFriendship[0]?.trackTitle, "Sorry Papi (KIDDO Remix)");
assert.equal(topicFriendship[0]?.timestamp, 20);
assert.equal(topicFriendship[14]?.trackTitle, "Smalltown Boy");
assert.equal(topicFriendship[14]?.timestamp, 55 * 60 + 38);
for (let i = 1; i < topicFriendship.length; i++) {
  assert.ok(
    (topicFriendship[i]!.timestamp ?? 0) >
      (topicFriendship[i - 1]!.timestamp ?? 0),
    `Topic Friendship Mix 2026 clocks must increase at index ${i}`,
  );
}

// Hardwell Euphoria 020 — official Tomorrowland SC + OWR YouTube twin.
// Overlay TL_HARDWELL is too generic. Distinct from 018 / 019 / Mainstage WE2.
assertSeedClocks(TL_HARDWELL_EUPHORIA_020_2026);
assert.equal(TL_HARDWELL_EUPHORIA_020_2026.length, 24);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-hardwell-presents-euphoria-august-2026"
  ],
  TL_HARDWELL_EUPHORIA_020_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Itd5D4q1KuM"],
  TL_HARDWELL_EUPHORIA_020_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-hardwell-presents-euphoria-august-2026"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-tomorrowland-hardwell-presents-euphoria-july-2026"
  ],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Itd5D4q1KuM"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-39KkVIunYAk"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Itd5D4q1KuM"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-9aDj2qyAIBw"],
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Itd5D4q1KuM"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yWZyIQtxoXU"],
);
assert.equal(
  isWiredTracklistSlug(
    "sc-tomorrowland-hardwell-presents-euphoria-august-2026",
  ),
  true,
);
assert.equal(isWiredTracklistSlug("yt-Itd5D4q1KuM"), true);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-tomorrowland-hardwell-presents-euphoria-august-2026",
  ),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-Itd5D4q1KuM"), false);
const euphoria020 = tracklist1001RowsToPlays(TL_HARDWELL_EUPHORIA_020_2026);
assert.equal(euphoria020.length, 24);
assert.equal(euphoria020[0]?.provenance, "1001tl");
assert.equal(euphoria020[0]?.trackTitle, "Everybody Lookin' 4");
assert.equal(euphoria020[0]?.timestamp, 39);
assert.equal(euphoria020[23]?.trackTitle, "Discorecord (Galactixx Remix)");
assert.equal(euphoria020[23]?.timestamp, 58 * 60 + 36);
for (let i = 1; i < euphoria020.length; i++) {
  assert.ok(
    (euphoria020[i]!.timestamp ?? 0) > (euphoria020[i - 1]!.timestamp ?? 0),
    `Hardwell Euphoria 020 clocks must increase at index ${i}`,
  );
}

// LAMMER @ CORE Stage, Tomorrowland WE2 2026-07-26 — official Tomorrowland YT.
// Overlay TL_LAMMER is too generic. No SC in the paste.
assertSeedClocks(TL_LAMMER_TML_WE2_CORE_2026);
assert.equal(TL_LAMMER_TML_WE2_CORE_2026.length, 16);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-bi_8FdSaT30"],
  TL_LAMMER_TML_WE2_CORE_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-bi_8FdSaT30"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-G-DciaWb5KY"],
  "LAMMER CORE WE2 is not the Bullet Tooth CORE WE2 seed",
);
assert.equal(isWiredTracklistSlug("yt-bi_8FdSaT30"), true);
assert.equal(isSecondaryPlaybackSlug("yt-bi_8FdSaT30"), false);
assert.equal(isWiredTracklistSlug("sc-lammer-tomorrowland"), false);
const lammerCore = tracklist1001RowsToPlays(TL_LAMMER_TML_WE2_CORE_2026);
assert.equal(lammerCore.length, 16);
assert.equal(lammerCore[0]?.provenance, "1001tl");
assert.equal(lammerCore[0]?.trackTitle, "Faux Loop");
assert.equal(lammerCore[0]?.timestamp, 2 * 60 + 15);
assert.equal(lammerCore[15]?.trackTitle, "Time To Move");
assert.equal(lammerCore[15]?.timestamp, 3600 + 48 * 60 + 15);
for (let i = 1; i < lammerCore.length; i++) {
  assert.ok(
    (lammerCore[i]!.timestamp ?? 0) > (lammerCore[i - 1]!.timestamp ?? 0),
    `LAMMER TML WE2 CORE clocks must increase at index ${i}`,
  );
}

// Nosi @ Crystal Garden, Tomorrowland WE1 2026-07-18 — official Tomorrowland YT.
// Overlay TL_NOSI is too generic. No SC in the paste.
assertSeedClocks(TL_NOSI_TML_WE1_CRYSTAL_2026);
assert.equal(TL_NOSI_TML_WE1_CRYSTAL_2026.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-O9xAX_vrDJI"],
  TL_NOSI_TML_WE1_CRYSTAL_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-O9xAX_vrDJI"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Ty03QjFnL90"],
  "Nosi is not the Oscar And The Wolf Crystal Garden WE1 seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-O9xAX_vrDJI"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-n3TESnQqiQ4"],
  "Nosi is not the Blondish Crystal Garden WE1 seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-O9xAX_vrDJI"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-8Oq0TMeaY4I"],
  "Nosi is not the Camila Jun Crystal Garden WE1 seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-O9xAX_vrDJI"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eir5Sh_gHbo"],
  "Nosi is not the Steve Angello Crystal Garden WE1 seed",
);
assert.equal(isWiredTracklistSlug("yt-O9xAX_vrDJI"), true);
assert.equal(isSecondaryPlaybackSlug("yt-O9xAX_vrDJI"), false);
assert.equal(isWiredTracklistSlug("sc-nosi-tomorrowland"), false);
const nosiCrystal = tracklist1001RowsToPlays(TL_NOSI_TML_WE1_CRYSTAL_2026);
assert.equal(nosiCrystal.length, 20);
assert.equal(nosiCrystal[0]?.provenance, "1001tl");
assert.equal(nosiCrystal[0]?.trackTitle, "Dancing (Again!)");
assert.equal(nosiCrystal[0]?.timestamp, 0);
assert.equal(nosiCrystal[19]?.trackTitle, "Neon Hearts");
assert.equal(nosiCrystal[19]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < nosiCrystal.length; i++) {
  assert.ok(
    (nosiCrystal[i]!.timestamp ?? 0) > (nosiCrystal[i - 1]!.timestamp ?? 0),
    `Nosi TML WE1 Crystal clocks must increase at index ${i}`,
  );
}

// Giuseppe Ottaviani @ Area Two, ASOT Ahoy Rotterdam 2026-02-27.
// Official @astateoftrance YT + official artist SC. Overlay
// TL_GIUSEPPE_OTTAVIANI is too generic. hearthis/razorator is a fan
// reupload — not wired. Distinct from Digital Society Leeds, ASOT 1290,
// and ASOT Poland Legia.
assertSeedClocks(TL_GIUSEPPE_OTTAVIANI_ASOT_AREA_TWO_ROTTERDAM_2026);
assert.equal(TL_GIUSEPPE_OTTAVIANI_ASOT_AREA_TWO_ROTTERDAM_2026.length, 18);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-YvPI-unGanA"],
  TL_GIUSEPPE_OTTAVIANI_ASOT_AREA_TWO_ROTTERDAM_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-a-state-of"
  ],
  TL_GIUSEPPE_OTTAVIANI_ASOT_AREA_TWO_ROTTERDAM_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-YvPI-unGanA"],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-digitalsociety"
  ],
  "ASOT Area Two Rotterdam is not the Digital Society Leeds seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-YvPI-unGanA"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-bxb6Tglooc4"],
  "ASOT Area Two Rotterdam is not the ASOT 1290 radio seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-YvPI-unGanA"],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"
  ],
  "ASOT Area Two Rotterdam is not the ASOT Poland Legia seed",
);
assert.equal(isWiredTracklistSlug("yt-YvPI-unGanA"), true);
assert.equal(
  isWiredTracklistSlug("sc-giuseppeottaviani-giuseppe-ottaviani-a-state-of"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-YvPI-unGanA"), false);
assert.equal(
  isSecondaryPlaybackSlug("sc-giuseppeottaviani-giuseppe-ottaviani-a-state-of"),
  true,
);
const goAsotRotterdam = tracklist1001RowsToPlays(
  TL_GIUSEPPE_OTTAVIANI_ASOT_AREA_TWO_ROTTERDAM_2026,
);
assert.equal(goAsotRotterdam.length, 18);
assert.equal(goAsotRotterdam[0]?.provenance, "1001tl");
assert.equal(goAsotRotterdam[0]?.trackTitle, "Space Unicorn");
assert.equal(goAsotRotterdam[0]?.timestamp, 10);
assert.equal(goAsotRotterdam[17]?.trackTitle, "Hold On");
assert.equal(goAsotRotterdam[17]?.timestamp, 55 * 60 + 38);
for (let i = 1; i < goAsotRotterdam.length; i++) {
  assert.ok(
    (goAsotRotterdam[i]!.timestamp ?? 0) >
      (goAsotRotterdam[i - 1]!.timestamp ?? 0),
    `Giuseppe Ottaviani ASOT Area Two clocks must increase at index ${i}`,
  );
}

// Giuseppe Ottaviani @ ASOT, Legia Stadium, Poland 2026-06-20.
// Official YT + official artist SC host twin. Overlay TL_GIUSEPPE_OTTAVIANI
// is too generic. Paste Wire named …-at-legia is not on file. Distinct
// from Area Two Rotterdam, Digital Society Leeds, and ASOT 1290.
assertSeedClocks(TL_GIUSEPPE_OTTAVIANI_ASOT_POLAND_LEGIA_2026);
assert.equal(TL_GIUSEPPE_OTTAVIANI_ASOT_POLAND_LEGIA_2026.length, 22);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-jpsXS2mpO-M"],
  TL_GIUSEPPE_OTTAVIANI_ASOT_POLAND_LEGIA_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"
  ],
  TL_GIUSEPPE_OTTAVIANI_ASOT_POLAND_LEGIA_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-at-legia"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-a-state-of"
  ],
  "ASOT Poland Legia is not the Area Two Rotterdam seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-digitalsociety"
  ],
  "ASOT Poland Legia is not the Digital Society Leeds seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-bxb6Tglooc4"],
  "ASOT Poland Legia is not the ASOT 1290 radio seed",
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/giuseppeottaviani/giuseppe-ottaviani-live-at-a"
  ],
  undefined,
);
assert.equal(
  isWiredTracklistSlug("sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"),
  true,
);
assert.equal(isWiredTracklistSlug("yt-jpsXS2mpO-M"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-giuseppeottaviani-giuseppe-ottaviani-live-at-a"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-jpsXS2mpO-M"), false);
const goAsotPoland = tracklist1001RowsToPlays(
  TL_GIUSEPPE_OTTAVIANI_ASOT_POLAND_LEGIA_2026,
);
assert.equal(goAsotPoland.length, 22);
assert.equal(goAsotPoland[0]?.provenance, "1001tl");
assert.equal(goAsotPoland[0]?.trackTitle, "Unstoppable");
assert.equal(goAsotPoland[0]?.timestamp, 40);
assert.equal(goAsotPoland[21]?.trackTitle, "Hold On");
assert.equal(goAsotPoland[21]?.timestamp, 3600 + 9 * 60 + 6);
for (let i = 1; i < goAsotPoland.length; i++) {
  assert.ok(
    (goAsotPoland[i]!.timestamp ?? 0) > (goAsotPoland[i - 1]!.timestamp ?? 0),
    `Giuseppe Ottaviani ASOT Poland clocks must increase at index ${i}`,
  );
}

// Korolova @ Motherland Monument Kyiv 2026-06-18 — official @KOROLOVADJ YT
// + official korolovadj SC. Overlay TL_KOROLOVA is too generic. Distinct
// from Captive Soul 098 / TML WE2 / Snowattack / Tulum.
assertSeedClocks(TL_KOROLOVA_MOTHERLAND_MONUMENT_KYIV_2026);
assert.equal(TL_KOROLOVA_MOTHERLAND_MONUMENT_KYIV_2026.length, 12);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-ruri2xxu7wU"],
  TL_KOROLOVA_MOTHERLAND_MONUMENT_KYIV_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-korolovadj-korolova-live-kyiv-ukraine"],
  TL_KOROLOVA_MOTHERLAND_MONUMENT_KYIV_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-https://soundcloud.com/korolovadj/korolova-live-kyiv-ukraine"
  ],
  undefined,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-ruri2xxu7wU"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-5JxfEjVdQFk"],
  "Kyiv is not the Captive Soul 098 seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-ruri2xxu7wU"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-RLOghpXjuJI"],
  "Kyiv is not the TML WE2 Captive Soul seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-ruri2xxu7wU"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-7UcyaKbvy2o"],
  "Kyiv is not the Snowattack seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-ruri2xxu7wU"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-HvkAfj1QnK8"],
  "Kyiv is not the Tulum seed",
);
assert.equal(isWiredTracklistSlug("yt-ruri2xxu7wU"), true);
assert.equal(
  isWiredTracklistSlug("sc-korolovadj-korolova-live-kyiv-ukraine"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-ruri2xxu7wU"), false);
assert.equal(
  isSecondaryPlaybackSlug("sc-korolovadj-korolova-live-kyiv-ukraine"),
  true,
);
const korolovaKyiv = tracklist1001RowsToPlays(
  TL_KOROLOVA_MOTHERLAND_MONUMENT_KYIV_2026,
);
assert.equal(korolovaKyiv.length, 12);
assert.equal(korolovaKyiv[0]?.provenance, "1001tl");
assert.equal(korolovaKyiv[0]?.trackTitle, "Buka");
assert.equal(korolovaKyiv[0]?.timestamp, 0);
assert.equal(korolovaKyiv[11]?.trackTitle, "The Present");
assert.equal(korolovaKyiv[11]?.timestamp, 43 * 60 + 15);
for (let i = 1; i < korolovaKyiv.length; i++) {
  assert.ok(
    (korolovaKyiv[i]!.timestamp ?? 0) > (korolovaKyiv[i - 1]!.timestamp ?? 0),
    `Korolova Motherland Monument Kyiv clocks must increase at index ${i}`,
  );
}

// Chris Lorenzo @ stereoBLOOM, EDC Mexico 2026-02-21.
// Overlay TL_CHRIS_LORENZO is too generic. Fan YT (@tonitodigital) and
// backup SC (chris-stanley93) stay unwired. Distinct from TML WE2.
assertSeedClocks(TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026);
assert.equal(TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026.length, 23);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026,
  ),
  false,
  "EDC Mexico seed is held — no official playback slug",
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-b8o4lj_sEpQ"], undefined); // pragma: allowlist secret
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-chris-stanley93-back-up-acc-2-listen-1-1-mp3-1"
  ],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-b8o4lj_sEpQ"), false); // pragma: allowlist secret
assert.equal(
  isWiredTracklistSlug("sc-chris-stanley93-back-up-acc-2-listen-1-1-mp3-1"),
  false,
);
assert.notEqual(
  TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026,
  TL_CHRIS_LORENZO_TML_WE2_2026,
  "EDC Mexico is not the TML WE2 Great Library seed",
);
const chrisLorenzoEdcMx = tracklist1001RowsToPlays(
  TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026,
);
assert.equal(chrisLorenzoEdcMx.length, 23);
assert.equal(chrisLorenzoEdcMx[0]?.provenance, "1001tl");
assert.equal(chrisLorenzoEdcMx[0]?.trackTitle, "Appetite (VIP)");
assert.equal(chrisLorenzoEdcMx[0]?.timestamp, 0);
assert.equal(chrisLorenzoEdcMx[18]?.trackTitle, "MAMI");
assert.equal(chrisLorenzoEdcMx[18]?.timestamp, 56 * 60 + 50);
assert.equal(
  chrisLorenzoEdcMx[22]?.trackTitle,
  "Acceptable In The 80's (Chris Lorenzo Edit)",
);
assert.equal(chrisLorenzoEdcMx[22]?.timestamp, 3600 + 12 * 60 + 40);
for (let i = 1; i < chrisLorenzoEdcMx.length; i++) {
  assert.ok(
    (chrisLorenzoEdcMx[i]!.timestamp ?? 0) >
      (chrisLorenzoEdcMx[i - 1]!.timestamp ?? 0),
    `Chris Lorenzo stereoBLOOM EDC Mexico clocks must increase at index ${i}`,
  );
}

// Jack Shore @ Freedom Stage, Tomorrowland WE1 2026-07-19 — official
// Tomorrowland YT. Overlay TL_JACK_SHORE is too generic. Two timed IDs
// as captured.
assertSeedClocks(TL_JACK_SHORE_TML_WE1_FREEDOM_2026);
assert.equal(TL_JACK_SHORE_TML_WE1_FREEDOM_2026.length, 2);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-wWgtmdI_adQ"],
  TL_JACK_SHORE_TML_WE1_FREEDOM_2026,
);
const jackShore = tracklist1001RowsToPlays(TL_JACK_SHORE_TML_WE1_FREEDOM_2026);
assert.equal(jackShore.length, 2);
assert.equal(jackShore[0]?.provenance, "1001tl");
assert.equal(jackShore[0]?.timestamp, 20);
assert.match(jackShore[0]?.trackTitle ?? "", /Sweet Disposition/);
assert.equal(jackShore[1]?.trackTitle, "POINT OFVIEW");
assert.equal(jackShore[1]?.timestamp, 29 * 60 + 57);
assert.equal(isWiredTracklistSlug("yt-wWgtmdI_adQ"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-wWgtmdI_adQ"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-zMW5SQPS1cY"],
  "Jack Shore is not the I Hate Models Freedom WE1 seed",
);

// Nicky Romero @ The Great Library Stage, Tomorrowland WE1 2026-07-17 —
// official Tomorrowland YT. Overlay TL_NICKY_ROMERO is too generic.
// Distinct from Mainstage WE2.
assertSeedClocks(TL_NICKY_ROMERO_TML_WE1_LIBRARY_2026);
assert.equal(TL_NICKY_ROMERO_TML_WE1_LIBRARY_2026.length, 81);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-imKMwwGAaDk"],
  TL_NICKY_ROMERO_TML_WE1_LIBRARY_2026,
);
const nickyLib = tracklist1001RowsToPlays(TL_NICKY_ROMERO_TML_WE1_LIBRARY_2026);
assert.equal(nickyLib.length, 81);
assert.equal(nickyLib[0]?.provenance, "1001tl");
assert.equal(nickyLib[0]?.timestamp, 11);
assert.equal(nickyLib[0]?.trackTitle, "Afterglow");
assert.equal(nickyLib[nickyLib.length - 1]?.trackTitle, "I Could Be The One");
assert.equal(nickyLib[nickyLib.length - 1]?.timestamp, 56 * 60 + 2);
assert.equal(isWiredTracklistSlug("yt-imKMwwGAaDk"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-imKMwwGAaDk"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-TsyGMhx8izw"],
  "Library WE1 is not the Nicky Romero Mainstage WE2 seed",
);
let nickyLibPrev = -1;
for (const p of nickyLib) {
  assert.ok(
    (p.timestamp ?? 0) >= nickyLibPrev,
    `Nicky Romero Library WE1 clocks must not go back @ ${p.timestamp}`,
  );
  nickyLibPrev = p.timestamp ?? 0;
}

// Mike Williams Throwback @ House of Fortune, Tomorrowland WE1 2026-07-17 —
// official YT. Overlay TL_MIKE_WILLIAMS is too generic. Distinct from
// Mainstage WE2. Paste Wire named yt-1SW3F3LcGCk — not on file.
assertSeedClocks(TL_MIKE_WILLIAMS_TML_WE1_THROWBACK_2026);
assert.equal(TL_MIKE_WILLIAMS_TML_WE1_THROWBACK_2026.length, 51);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-mGSV0ELvoEQ"],
  TL_MIKE_WILLIAMS_TML_WE1_THROWBACK_2026,
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-1SW3F3LcGCk"], undefined);
const mikeThrowback = tracklist1001RowsToPlays(
  TL_MIKE_WILLIAMS_TML_WE1_THROWBACK_2026,
);
assert.equal(mikeThrowback.length, 51);
assert.equal(mikeThrowback[0]?.provenance, "1001tl");
assert.equal(mikeThrowback[0]?.timestamp, 0);
assert.match(mikeThrowback[0]?.trackTitle ?? "", /Melody/);
assert.equal(mikeThrowback[mikeThrowback.length - 1]?.trackTitle, "Bambini");
assert.equal(
  mikeThrowback[mikeThrowback.length - 1]?.timestamp,
  59 * 60 + 30,
);
assert.equal(isWiredTracklistSlug("yt-mGSV0ELvoEQ"), true);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-mGSV0ELvoEQ"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-WnjXXOZ8Te8"],
  "Throwback WE1 is not the Mike Williams Mainstage WE2 seed",
);
let mikeTbPrev = -1;
for (const p of mikeThrowback) {
  assert.ok(
    (p.timestamp ?? 0) >= mikeTbPrev,
    `Mike Williams Throwback WE1 clocks must not go back @ ${p.timestamp}`,
  );
  mikeTbPrev = p.timestamp ?? 0;
}

// Maddix @ Mainstage, Ultra Europe 2026-07-11 — official YT + official
// Maddix SC host twin. Overlay TL_MADDIX is too generic. hearthis
// razorator stays unwired. Distinct from TML WE1.
assertSeedClocks(TL_MADDIX_ULTRA_EUROPE_2026);
assert.equal(TL_MADDIX_ULTRA_EUROPE_2026.length, 26);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-0DFmXisYFZI"],
  TL_MADDIX_ULTRA_EUROPE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-maddixmusic-maddix-live-ultra-europe-2026"
  ],
  TL_MADDIX_ULTRA_EUROPE_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-maddixmusic-maddix-live-ultra-europe-2026"],
  undefined,
);
assert.equal(isWiredTracklistSlug("yt-0DFmXisYFZI"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-maddixmusic-maddix-live-ultra-europe-2026"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-0DFmXisYFZI"), false);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-0DFmXisYFZI"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-1Fu89dxrXI0"],
  "Ultra Europe is not the Maddix TML WE1 seed",
);
const maddixUltra = tracklist1001RowsToPlays(TL_MADDIX_ULTRA_EUROPE_2026);
assert.equal(maddixUltra.length, 26);
assert.equal(maddixUltra[0]?.provenance, "1001tl");
assert.equal(maddixUltra[0]?.timestamp, 11);
assert.equal(maddixUltra[0]?.trackTitle, "We Rave");
assert.equal(maddixUltra[maddixUltra.length - 1]?.trackTitle, "Pump This Party");
assert.equal(
  maddixUltra[maddixUltra.length - 1]?.timestamp,
  1 * 3600 + 14,
);

// Giuseppe Ottaviani B2B Ilan Bluestone @ Beyond Wonderland SoCal
// 2026-03-28 — official YT + official artist SC host twin. Overlay
// TL_GIUSEPPE_OTTAVIANI is too generic. Distinct from ASOT Poland.
assertSeedClocks(TL_GIUSEPPE_OTTAVIANI_ILAN_BLUESTONE_BEYOND_WONDERLAND_2026);
assert.equal(
  TL_GIUSEPPE_OTTAVIANI_ILAN_BLUESTONE_BEYOND_WONDERLAND_2026.length,
  15,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-aezdL54IRZ0"],
  TL_GIUSEPPE_OTTAVIANI_ILAN_BLUESTONE_BEYOND_WONDERLAND_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-b2b-ilan"
  ],
  TL_GIUSEPPE_OTTAVIANI_ILAN_BLUESTONE_BEYOND_WONDERLAND_2026,
);
assert.equal(isWiredTracklistSlug("yt-aezdL54IRZ0"), true);
assert.equal(
  isSecondaryPlaybackSlug("sc-giuseppeottaviani-giuseppe-ottaviani-b2b-ilan"),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-aezdL54IRZ0"), false);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-aezdL54IRZ0"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-jpsXS2mpO-M"],
  "Beyond Wonderland b2b is not the ASOT Poland seed",
);
const goIlanBeyond = tracklist1001RowsToPlays(
  TL_GIUSEPPE_OTTAVIANI_ILAN_BLUESTONE_BEYOND_WONDERLAND_2026,
);
assert.equal(goIlanBeyond.length, 15);
assert.equal(goIlanBeyond[0]?.provenance, "1001tl");
assert.equal(goIlanBeyond[0]?.timestamp, 0);
assert.equal(goIlanBeyond[0]?.trackTitle, "Futuro");
assert.equal(goIlanBeyond[14]?.trackTitle, "Together Again");
assert.equal(goIlanBeyond[14]?.timestamp, 53 * 60 + 15);

// Giuseppe Ottaviani @ Dreamstate Vancouver 2026-03-14, aired on
// Insomniac Radio The Residency 2026-03-20. Official artist SC only.
// Overlay TL_GIUSEPPE_OTTAVIANI is too generic. No YT — not a host twin.
assertSeedClocks(TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_VANCOUVER_2026);
assert.equal(TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_VANCOUVER_2026.length, 18);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-1"
  ],
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_VANCOUVER_2026,
);
assert.equal(
  isWiredTracklistSlug("sc-giuseppeottaviani-giuseppe-ottaviani-1"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-giuseppeottaviani-giuseppe-ottaviani-1"),
  false,
  "SC-only Dreamstate Vancouver is not a host-twin secondary",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-1"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-aezdL54IRZ0"],
  "Dreamstate Vancouver is not the Beyond Wonderland b2b seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-1"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-jpsXS2mpO-M"],
  "Dreamstate Vancouver is not the ASOT Poland seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-1"
  ],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-YvPI-unGanA"],
  "Dreamstate Vancouver is not the Area Two Rotterdam seed",
);
const goDreamstateVan = tracklist1001RowsToPlays(
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_VANCOUVER_2026,
);
assert.equal(goDreamstateVan.length, 18);
assert.equal(goDreamstateVan[0]?.provenance, "1001tl");
assert.equal(goDreamstateVan[0]?.timestamp, 0);
assert.equal(goDreamstateVan[0]?.trackTitle, "Break The Loop");
assert.equal(goDreamstateVan[17]?.trackTitle, "Hold On");
assert.equal(goDreamstateVan[17]?.timestamp, 54 * 60 + 32);
for (let i = 1; i < goDreamstateVan.length; i++) {
  assert.ok(
    (goDreamstateVan[i]?.timestamp ?? 0) >
      (goDreamstateVan[i - 1]?.timestamp ?? 0),
    `Giuseppe Ottaviani Dreamstate Vancouver clocks must increase at index ${i}`,
  );
}

// Giuseppe Ottaviani @ Dreamstate Sydney Showground 2026-02-07 —
// official YT + official artist SC host twin. Overlay
// TL_GIUSEPPE_OTTAVIANI is too generic. Distinct from Vancouver.
assertSeedClocks(TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_SYDNEY_2026);
assert.equal(TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_SYDNEY_2026.length, 20);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Diu60Wd0kfo"],
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_SYDNEY_2026,
);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-dreamstate"
  ],
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_SYDNEY_2026,
);
assert.equal(isWiredTracklistSlug("yt-Diu60Wd0kfo"), true);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-giuseppeottaviani-giuseppe-ottaviani-dreamstate",
  ),
  true,
);
assert.equal(isSecondaryPlaybackSlug("yt-Diu60Wd0kfo"), false);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Diu60Wd0kfo"],
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-giuseppeottaviani-giuseppe-ottaviani-1"
  ],
  "Dreamstate Sydney is not the Vancouver seed",
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Diu60Wd0kfo"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-aezdL54IRZ0"],
  "Dreamstate Sydney is not the Beyond Wonderland b2b seed",
);
const goDreamstateSyd = tracklist1001RowsToPlays(
  TL_GIUSEPPE_OTTAVIANI_DREAMSTATE_SYDNEY_2026,
);
assert.equal(goDreamstateSyd.length, 20);
assert.equal(goDreamstateSyd[0]?.provenance, "1001tl");
assert.equal(goDreamstateSyd[0]?.timestamp, 0);
assert.equal(goDreamstateSyd[0]?.trackTitle, "Break The Loop");
assert.equal(
  goDreamstateSyd[15]?.trackTitle,
  "Knightfall Brightside (Sandro Vanniel Mashup)",
);
assert.equal(goDreamstateSyd[16]?.trackTitle, "Mr. Brightside");
assert.equal(goDreamstateSyd[17]?.trackTitle, "Knightfall");
assert.equal(
  goDreamstateSyd[19]?.trackTitle,
  "Echo (Giuseppe Ottaviani Remix)",
);
assert.equal(goDreamstateSyd[19]?.timestamp, 53 * 60 + 50);
for (let i = 1; i < goDreamstateSyd.length; i++) {
  assert.ok(
    (goDreamstateSyd[i]?.timestamp ?? 0) >
      (goDreamstateSyd[i - 1]?.timestamp ?? 0),
    `Giuseppe Ottaviani Dreamstate Sydney clocks must increase at index ${i}`,
  );
}

// GREG 99 - Hellbent FM 006 2026-05-21 — official Hellbent Records SC.
// Overlay TL_GREG_99 is too generic. No YouTube in the paste.
assertSeedClocks(TL_GREG_99_HELLBENT_FM_006_2026);
assert.equal(TL_GREG_99_HELLBENT_FM_006_2026.length, 15);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-hellbentrecords-hellbent-fm-episode-006-greg99"
  ],
  TL_GREG_99_HELLBENT_FM_006_2026,
);
assert.equal(
  isWiredTracklistSlug("sc-hellbentrecords-hellbent-fm-episode-006-greg99"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug("sc-hellbentrecords-hellbent-fm-episode-006-greg99"),
  false,
);
assert.equal(
  isWiredTracklistSlug("sc-greg99music-hellbent-fm-episode-006-greg99"),
  false,
  "do not invent a greg99music twin",
);
const gregHellbent = tracklist1001RowsToPlays(TL_GREG_99_HELLBENT_FM_006_2026);
assert.equal(gregHellbent.length, 15);
assert.equal(gregHellbent[0]?.provenance, "1001tl");
assert.equal(gregHellbent[0]?.timestamp, 0);
assert.equal(gregHellbent[0]?.artistName, "GREG 99");
assert.equal(gregHellbent[0]?.trackTitle, "Waist Move");
assert.equal(gregHellbent[14]?.trackTitle, "HOTS 4 U");
assert.equal(gregHellbent[14]?.artistName, "Chris Lorenzo & aMo");
assert.equal(gregHellbent[14]?.timestamp, 58 * 60 + 38);
for (let i = 1; i < gregHellbent.length; i++) {
  assert.ok(
    (gregHellbent[i]?.timestamp ?? 0) >
      (gregHellbent[i - 1]?.timestamp ?? 0),
    `GREG 99 Hellbent FM 006 clocks must increase at index ${i}`,
  );
}

// Valentino Khan @ Revel Albuquerque 2026-05-29.
// Overlay TL_Valentino-Khan is not a valid identifier. Fan YT
// (@WineHouseMusicTV) stays unwired. Held until official artist playback.
assertSeedClocks(TL_VALENTINO_KHAN_REVEL_ALBUQUERQUE_2026);
assert.equal(TL_VALENTINO_KHAN_REVEL_ALBUQUERQUE_2026.length, 34);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_VALENTINO_KHAN_REVEL_ALBUQUERQUE_2026,
  ),
  false,
  "Revel Albuquerque seed is held — Wine House Music TV is not official",
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-6ZN3aI2o2OY"], undefined);
assert.equal(isWiredTracklistSlug("yt-6ZN3aI2o2OY"), false);
const vkRevel = tracklist1001RowsToPlays(TL_VALENTINO_KHAN_REVEL_ALBUQUERQUE_2026);
assert.equal(vkRevel.length, 34);
assert.equal(vkRevel[0]?.provenance, "1001tl");
assert.equal(vkRevel[0]?.timestamp, 6);
assert.equal(
  vkRevel[0]?.trackTitle,
  "Stress vs. Nasty (Valentino Khan Edit)",
);
assert.equal(vkRevel[33]?.trackTitle, "Worth The Wait");
assert.equal(vkRevel[33]?.timestamp, 20 * 60 + 39);
for (let i = 1; i < vkRevel.length; i++) {
  assert.ok(
    (vkRevel[i]?.timestamp ?? 0) > (vkRevel[i - 1]?.timestamp ?? 0),
    `Valentino Khan Revel Albuquerque clocks must increase at index ${i}`,
  );
}

// Anti Up @ Mojave, Coachella WE1 2024-04-12.
// Official @antiup yt-cZhNpGcYq_A is the full Mojave set (album-titled).
assertSeedClocks(TL_ANTI_UP_COACHELLA_WE1_MOJAVE_2024);
assert.equal(TL_ANTI_UP_COACHELLA_WE1_MOJAVE_2024.length, 21);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-cZhNpGcYq_A"],
  TL_ANTI_UP_COACHELLA_WE1_MOJAVE_2024,
);
assert.equal(isWiredTracklistSlug("yt-cZhNpGcYq_A"), true);
assert.notEqual(
  TL_ANTI_UP_COACHELLA_WE1_MOJAVE_2024,
  TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024,
  "WE1 and WE2 Mojave clocks are distinct performances",
);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024,
  ),
  false,
  "Anti Up Coachella WE2 seed is held — no official playback",
);
assertSeedClocks(TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024);
assert.equal(TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024.length, 21);
const antiUpCoachella = tracklist1001RowsToPlays(
  TL_ANTI_UP_COACHELLA_WE1_MOJAVE_2024,
);
assert.equal(antiUpCoachella.length, 21);
assert.equal(antiUpCoachella[0]?.provenance, "1001tl");
assert.equal(antiUpCoachella[0]?.timestamp, 0);
assert.equal(antiUpCoachella[0]?.trackTitle, "What Is Life");
assert.equal(antiUpCoachella[1]?.timestamp, 6 * 60 + 5);
assert.equal(antiUpCoachella[15]?.trackTitle, "Turn The Page");
assert.equal(antiUpCoachella[20]?.trackTitle, "Holding On");
assert.equal(antiUpCoachella[20]?.timestamp, 63 * 60 + 30);
for (let i = 1; i < antiUpCoachella.length; i++) {
  assert.ok(
    (antiUpCoachella[i]?.timestamp ?? 0) >
      (antiUpCoachella[i - 1]?.timestamp ?? 0),
    `Anti Up Coachella Mojave WE1 2024 clocks must increase at index ${i}`,
  );
}

// MORTEN & Malaa @ Crystal Garden, Tomorrowland WE1 2026-07-18.
// yt-unavailable_atm is a placeholder — seed held, never invent playback.
assertSeedClocks(TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026);
assert.equal(TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026.length, 35);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026,
  ),
  false,
  "MORTEN & Malaa Crystal Garden seed is held — no official playback",
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-unavailable_atm"], undefined);
assert.equal(isWiredTracklistSlug("yt-unavailable_atm"), false);
assert.notEqual(
  TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026,
  TL_NOSI_TML_WE1_CRYSTAL_2026,
  "MORTEN & Malaa is not the Nosi Crystal Garden WE1 seed",
);
const mortenMalaa = tracklist1001RowsToPlays(
  TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026,
);
assert.equal(mortenMalaa.length, 35);
assert.equal(mortenMalaa[0]?.provenance, "1001tl");
assert.equal(mortenMalaa[0]?.timestamp, 12);
assert.equal(mortenMalaa[0]?.trackTitle, "LMU");
assert.equal(mortenMalaa[34]?.trackTitle, "Shock The System");
assert.equal(mortenMalaa[34]?.timestamp, 86 * 60 + 45);
for (let i = 1; i < mortenMalaa.length; i++) {
  assert.ok(
    (mortenMalaa[i]?.timestamp ?? 0) > (mortenMalaa[i - 1]?.timestamp ?? 0),
    `MORTEN & Malaa TML WE1 Crystal clocks must increase at index ${i}`,
  );
}

// MORTEN & Malaa @ Mainstage, Tomorrowland Winter France 2026-03-25 — wired,
// official Tomorrowland YT. Distinct from the held Crystal Garden WE1 seed.
assertSeedClocks(TL_MORTEN_MALAA_TML_WINTER_MAINSTAGE_2026);
assert.equal(TL_MORTEN_MALAA_TML_WINTER_MAINSTAGE_2026.length, 28);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-vjI-Oc_pgag"],
  TL_MORTEN_MALAA_TML_WINTER_MAINSTAGE_2026,
);
assert.equal(isWiredTracklistSlug("yt-vjI-Oc_pgag"), true);
assert.notEqual(
  TL_MORTEN_MALAA_TML_WINTER_MAINSTAGE_2026,
  TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026,
  "TML Winter Mainstage is not the held Crystal Garden WE1 seed",
);
const mortenMalaaWinter = tracklist1001RowsToPlays(
  TL_MORTEN_MALAA_TML_WINTER_MAINSTAGE_2026,
);
assert.equal(mortenMalaaWinter.length, 28);
assert.equal(mortenMalaaWinter[0]?.provenance, "1001tl");
assert.equal(mortenMalaaWinter[0]?.timestamp, 0);
assert.equal(mortenMalaaWinter[0]?.trackTitle, "Shock The System");
assert.equal(mortenMalaaWinter[27]?.trackTitle, "Locked In");
assert.equal(mortenMalaaWinter[27]?.timestamp, 57 * 60);
for (let i = 1; i < mortenMalaaWinter.length; i++) {
  assert.ok(
    (mortenMalaaWinter[i]?.timestamp ?? 0) >
      (mortenMalaaWinter[i - 1]?.timestamp ?? 0),
    `MORTEN & Malaa TML Winter Mainstage clocks must increase at index ${i}`,
  );
}

// Tchami & Malaa @ circuitGROUNDS, EDC Las Vegas 2025-05-17 — wired, official
// Tchami YT. The 35 paste rows repeat "When The Beat Bang" back-to-back
// (14:15 / 15:55); fingerprintRowsToPlays collapses adjacent same-artist
// same-title cues, so the wired play count is 34, not 35.
assertSeedClocks(TL_TCHAMI_MALAA_EDC_LV_CIRCUITGROUNDS_2025);
assert.equal(TL_TCHAMI_MALAA_EDC_LV_CIRCUITGROUNDS_2025.length, 35);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-k9pYsuLTL2o"],
  TL_TCHAMI_MALAA_EDC_LV_CIRCUITGROUNDS_2025,
);
assert.equal(isWiredTracklistSlug("yt-k9pYsuLTL2o"), true);
const tchamiMalaa = tracklist1001RowsToPlays(
  TL_TCHAMI_MALAA_EDC_LV_CIRCUITGROUNDS_2025,
);
assert.equal(tchamiMalaa.length, 34);
assert.equal(tchamiMalaa[0]?.provenance, "1001tl");
assert.equal(tchamiMalaa[0]?.timestamp, 0);
assert.equal(tchamiMalaa[0]?.trackTitle, "RUSH");
assert.equal(tchamiMalaa[7]?.timestamp, 14 * 60 + 15);
assert.equal(tchamiMalaa[7]?.trackTitle, "When The Beat Bang");
assert.equal(tchamiMalaa[8]?.trackTitle, "Reset");
assert.equal(tchamiMalaa[33]?.trackTitle, "A Prayer (Drinks On Me Remix)");
assert.equal(tchamiMalaa[33]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < tchamiMalaa.length; i++) {
  assert.ok(
    (tchamiMalaa[i]?.timestamp ?? 0) > (tchamiMalaa[i - 1]?.timestamp ?? 0),
    `Tchami & Malaa EDC LV circuitGROUNDS clocks must increase at index ${i}`,
  );
}

// JAUZ @ GET CRANKED! 2.0, Bill Graham Civic Auditorium SF 2025-10-11.
// yt-HeEW36GRsPQ is a fan recap (@crawfordrecap, first 20 mins only) —
// seed held, never wired, Identify-only via FINGERPRINT_ONLY_WATCH.
assertSeedClocks(TL_JAUZ_GET_CRANKED_BILL_GRAHAM_SF_2025);
assert.equal(TL_JAUZ_GET_CRANKED_BILL_GRAHAM_SF_2025.length, 26);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_JAUZ_GET_CRANKED_BILL_GRAHAM_SF_2025,
  ),
  false,
  "JAUZ Bill Graham seed is held — the YT is a fan recap, not official",
);
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-HeEW36GRsPQ"], undefined);
assert.equal(isWiredTracklistSlug("yt-HeEW36GRsPQ"), false);
const jauzBillGraham = tracklist1001RowsToPlays(
  TL_JAUZ_GET_CRANKED_BILL_GRAHAM_SF_2025,
);
assert.equal(jauzBillGraham.length, 26);
assert.equal(jauzBillGraham[0]?.provenance, "1001tl");
assert.equal(jauzBillGraham[0]?.timestamp, 76);
assert.equal(jauzBillGraham[0]?.trackTitle, "Keep The Rave Alive");
assert.equal(jauzBillGraham[25]?.trackTitle, "Vortexblade");
assert.equal(jauzBillGraham[25]?.timestamp, 59 * 60 + 30);
for (let i = 1; i < jauzBillGraham.length; i++) {
  assert.ok(
    (jauzBillGraham[i]?.timestamp ?? 0) >
      (jauzBillGraham[i - 1]?.timestamp ?? 0),
    `JAUZ Bill Graham clocks must increase at index ${i}`,
  );
}

// Wenzday @ Illfest, Wicked Oaks Festival, Austin 2025-10-25 — wired,
// official @WenzdayMusic YT. Evenly spaced ~2:02 apart per 1001 (not
// independently observed) — kept as pasted.
assertSeedClocks(TL_WENZDAY_ILLFEST_WICKED_OAKS_AUSTIN_2025);
assert.equal(TL_WENZDAY_ILLFEST_WICKED_OAKS_AUSTIN_2025.length, 29);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-2tz9HFofnFQ"],
  TL_WENZDAY_ILLFEST_WICKED_OAKS_AUSTIN_2025,
);
assert.equal(isWiredTracklistSlug("yt-2tz9HFofnFQ"), true);
const wenzdayIllfest = tracklist1001RowsToPlays(
  TL_WENZDAY_ILLFEST_WICKED_OAKS_AUSTIN_2025,
);
assert.equal(wenzdayIllfest.length, 29);
assert.equal(wenzdayIllfest[0]?.provenance, "1001tl");
assert.equal(wenzdayIllfest[0]?.timestamp, 20);
assert.equal(wenzdayIllfest[0]?.trackTitle, "Keep On Dancin'");
assert.equal(
  wenzdayIllfest[28]?.trackTitle,
  "Like A Prayer (Autograf Remix)",
);
assert.equal(wenzdayIllfest[28]?.timestamp, 57 * 60 + 16);
for (let i = 1; i < wenzdayIllfest.length; i++) {
  assert.ok(
    (wenzdayIllfest[i]?.timestamp ?? 0) >
      (wenzdayIllfest[i - 1]?.timestamp ?? 0),
    `Wenzday Illfest Wicked Oaks clocks must increase at index ${i}`,
  );
}

// BROHUG - Bass House Mixtape 2026 — wired, artist-owned BROHOUSE label YT.
assertSeedClocks(TL_BROHUG_BASS_HOUSE_MIXTAPE_2026);
assert.equal(TL_BROHUG_BASS_HOUSE_MIXTAPE_2026.length, 8);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-3nd9yXIty2w"],
  TL_BROHUG_BASS_HOUSE_MIXTAPE_2026,
);
assert.equal(isWiredTracklistSlug("yt-3nd9yXIty2w"), true);
const brohugMixtape = tracklist1001RowsToPlays(TL_BROHUG_BASS_HOUSE_MIXTAPE_2026);
assert.equal(brohugMixtape.length, 8);
assert.equal(brohugMixtape[0]?.provenance, "1001tl");
assert.equal(brohugMixtape[0]?.timestamp, 0);
assert.equal(brohugMixtape[0]?.trackTitle, "Face Melt");
assert.equal(brohugMixtape[7]?.trackTitle, "Rats");
assert.equal(brohugMixtape[7]?.timestamp, 18 * 60 + 30);
for (let i = 1; i < brohugMixtape.length; i++) {
  assert.ok(
    (brohugMixtape[i]?.timestamp ?? 0) > (brohugMixtape[i - 1]?.timestamp ?? 0),
    `BROHUG Bass House Mixtape clocks must increase at index ${i}`,
  );
}

// GREG 99 - Data Transmission 903 — wired, official Data Transmission SC.
assertSeedClocks(TL_GREG_99_DATA_TRANSMISSION_DT903_2025);
assert.equal(TL_GREG_99_DATA_TRANSMISSION_DT903_2025.length, 13);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-data-transmission-dt903-gregbr"],
  TL_GREG_99_DATA_TRANSMISSION_DT903_2025,
);
assert.equal(
  isWiredTracklistSlug("sc-data-transmission-dt903-gregbr"),
  true,
);
const gregDataTransmission = tracklist1001RowsToPlays(
  TL_GREG_99_DATA_TRANSMISSION_DT903_2025,
);
assert.equal(gregDataTransmission.length, 13);
assert.equal(gregDataTransmission[0]?.provenance, "1001tl");
assert.equal(gregDataTransmission[0]?.timestamp, 0);
assert.equal(gregDataTransmission[0]?.trackTitle, "Rockstar");
assert.equal(gregDataTransmission[12]?.trackTitle, "This Rhythm");
assert.equal(gregDataTransmission[12]?.timestamp, 54 * 60 + 55);
for (let i = 1; i < gregDataTransmission.length; i++) {
  assert.ok(
    (gregDataTransmission[i]?.timestamp ?? 0) >
      (gregDataTransmission[i - 1]?.timestamp ?? 0),
    `GREG 99 Data Transmission 903 clocks must increase at index ${i}`,
  );
}

console.log("tracklists1001/seeds.test.ts ok");
