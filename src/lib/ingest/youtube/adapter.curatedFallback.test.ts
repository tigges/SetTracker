import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  createYoutubeAdapter,
  watchMetaFromCuratedSeed,
} from "./adapter";
import { YOUTUBE_SETS } from "./videos";

const ASOT = YOUTUBE_SETS.find((s) => s.video.includes("bxb6Tglooc4"));
const MEN_MACHINE = YOUTUBE_SETS.find((s) => s.video.includes("NTLDGnoWIRg"));
const AOKI = YOUTUBE_SETS.find((s) => s.video.includes("hgbAN8NFNu0"));
const ARMIN_FREEDOM = YOUTUBE_SETS.find((s) => s.video.includes("pwXGm4HEQdo"));
const DOM_CREAMFIELDS = YOUTUBE_SETS.find((s) => s.video.includes("NblVVOwQRqw"));
const MARLON_COACHELLA = YOUTUBE_SETS.find((s) =>
  s.video.includes("vpf4LLy42Zc"),
);
const GDJB = YOUTUBE_SETS.find((s) => s.video.includes("WWnLYZrh6kw"));
const ALOK_TML = YOUTUBE_SETS.find((s) => s.video.includes("zHAUZ02aCwo"));
const VC_NEON = YOUTUBE_SETS.find((s) => s.video.includes("knJyJPP45dg"));
const VC_BOA = YOUTUBE_SETS.find((s) => s.video.includes("kmMYCg-igjc"));
const VC_PACHA = YOUTUBE_SETS.find((s) => s.video.includes("OVex0rm7ZR4"));
const VC_YACHT = YOUTUBE_SETS.find((s) => s.video.includes("6bJZPDKlq7o"));
const HOA_527 = YOUTUBE_SETS.find((s) => s.video.includes("OXwK0CSmXzY"));
const RZ_AWAKE = YOUTUBE_SETS.find((s) => s.video.includes("i-mFuxbGHzg"));
const JOEL_EDGE = YOUTUBE_SETS.find((s) => s.video.includes("soEFl73peVA"));
const PRR_731 = YOUTUBE_SETS.find((s) => s.video.includes("Rgx-wT9FDaE"));
const STH_687 = YOUTUBE_SETS.find((s) => s.video.includes("eVjC42MNgkI"));
const NOTION_PERRY = YOUTUBE_SETS.find((s) => s.video.includes("9vgSTomhCp8"));
const VC_ULTRA = YOUTUBE_SETS.find((s) => s.video.includes("xXRjglkAmq8"));
const VC_PACHA_NYC = YOUTUBE_SETS.find((s) => s.video.includes("TDuFnUAo4II"));
const CLAPTONE_BA = YOUTUBE_SETS.find((s) => s.video.includes("fQweMs-Q3rg"));
const INDIRA_AWAKENINGS = YOUTUBE_SETS.find((s) =>
  s.video.includes("xUdcEDryN8o"),
);
const KOROLOVA_SNOWATTACK = YOUTUBE_SETS.find((s) =>
  s.video.includes("7UcyaKbvy2o"),
);
const KOROLOVA_TULUM = YOUTUBE_SETS.find((s) =>
  s.video.includes("HvkAfj1QnK8"),
);
const NATTE_AFAS = YOUTUBE_SETS.find((s) => s.video.includes("Nrl9yBX6Kpw"));
const DEBORAH_AMNESIA = YOUTUBE_SETS.find((s) =>
  s.video.includes("IfFnvi7O2Po"),
);
const MM_YACHT = YOUTUBE_SETS.find((s) => s.video.includes("0-s_qZRWElA"));
const PRISMATIC_032 = YOUTUBE_SETS.find((s) => s.video.includes("blP5J6BUG0M"));
const SPECTRUM_485 = YOUTUBE_SETS.find((s) => s.video.includes("yTRvLrtsM9I"));
const NICKY_TML_ARTIST = YOUTUBE_SETS.find((s) =>
  s.video.includes("B05MAbsCOLA"),
);
const ABGT_690 = YOUTUBE_SETS.find((s) => s.video.includes("phWKhIwgiTo"));
const VC_ARODES_YT = YOUTUBE_SETS.find((s) => s.video.includes("SeKRNa26kug"));
const MAX_STYLER_OT = YOUTUBE_SETS.find((s) => s.video.includes("k4Drn6AwAdk"));
const HANNAH_CF = YOUTUBE_SETS.find((s) => s.video.includes("arowbYnNFGY"));
const PURIFIED_520 = YOUTUBE_SETS.find((s) => s.video.includes("8aDoUu4GDrc"));
const CAPTIVE_098 = YOUTUBE_SETS.find((s) => s.video.includes("5JxfEjVdQFk"));
const HYPE_SYNC = YOUTUBE_SETS.find((s) => s.video.includes("rLTCLSsqrXY"));
const EPIC_036 = YOUTUBE_SETS.find((s) => s.video.includes("JLIYTueL4TI"));
const HELDENS_DAYBREAK = YOUTUBE_SETS.find((s) =>
  s.video.includes("wuMQeEJ3YnQ"),
);
const CH_DANCE_VALLEY = YOUTUBE_SETS.find((s) =>
  s.video.includes("pnzSuCiAGdk"),
);
const BASSJACKERS_TML = YOUTUBE_SETS.find((s) =>
  s.video.includes("BG3Lr9EdWVY"),
);
const TUJAMO_PAROOKAVILLE = YOUTUBE_SETS.find((s) =>
  s.video.includes("JhpL-KKGoO8"),
);
const DF_MH_PAROOKAVILLE = YOUTUBE_SETS.find((s) =>
  s.video.includes("IwNPc_4ux84"),
);
const MW_TIME_LAB = YOUTUBE_SETS.find((s) => s.video.includes("XisbmW1Smgc"));
const HW_PAROOKAVILLE = YOUTUBE_SETS.find((s) =>
  s.video.includes("eBeeWwsCVls"),
);
const DV_PAROOKAVILLE = YOUTUBE_SETS.find((s) =>
  s.video.includes("UETk8HSB0Yw"),
);
const WW_PAROOKAVILLE = YOUTUBE_SETS.find((s) =>
  s.video.includes("or_SDolEBfw"),
);
const MANDY_NEGATIV_TML = YOUTUBE_SETS.find((s) =>
  s.video.includes("J7b0G4XX8pg"),
);
const DLDK_ZIGGO = YOUTUBE_SETS.find((s) => s.video.includes("B1EaMgsf84Q"));
const AFROJACK_R3HAB_TML = YOUTUBE_SETS.find((s) =>
  s.video.includes("lEIGnx7qLl0"),
);
const INDIRA_TML_2023 = YOUTUBE_SETS.find((s) =>
  s.video.includes("yPCOu0-JKJo"),
);
const ALESSO_TML_WE1 = YOUTUBE_SETS.find((s) =>
  s.video.includes("TidwOi0NMI0"),
);
const ILLENIUM_TML_WE1 = YOUTUBE_SETS.find((s) =>
  s.video.includes("E1WH0nvaxAw"),
);
const CHASE_STATUS_TML_WE2 = YOUTUBE_SETS.find((s) =>
  s.video.includes("jSJEkiV3cCs"),
);
const I_HATE_MODELS_TML_WE1 = YOUTUBE_SETS.find((s) =>
  s.video.includes("zMW5SQPS1cY"),
);
const NETSKY_TML_WE1 = YOUTUBE_SETS.find((s) =>
  s.video.includes("_e1H9pkcjsQ"),
);
const OLIVER_HELDENS_TML_WE1 = YOUTUBE_SETS.find((s) =>
  s.video.includes("2i3XOxbp54U"),
);
const ALAN_WALKER_TML_WE1_2018 = YOUTUBE_SETS.find((s) =>
  s.video.includes("xVWs0ti0J90"),
);
const GORDO_TML_WE2_2023 = YOUTUBE_SETS.find((s) =>
  s.video.includes("lopIWBJ0T5I"),
);
const LUCAS_STEVE_TML_WE2_2024 = YOUTUBE_SETS.find((s) =>
  s.video.includes("GbG_OFmdPKk"),
);
const TAPE_B_CT5 = YOUTUBE_SETS.find((s) => s.video.includes("7_O8N_EJg_c"));
const VC_ROBOT_HEART = YOUTUBE_SETS.find((s) => s.video.includes("KbGNocaJDjw"));
const JOHN_SUMMIT_PLAYA = YOUTUBE_SETS.find((s) =>
  s.video.includes("PkWNuf7rtms"),
);
const JOHN_SUMMIT_TML_WE2 = YOUTUBE_SETS.find((s) =>
  s.video.includes("PlArfyuzuqo"),
);
const BRANDON_PAROOKAVILLE = YOUTUBE_SETS.find((s) =>
  s.video.includes("AQ6wWT2HaSQ"),
);
const CUEBRICK_SACRE = YOUTUBE_SETS.find((s) =>
  s.video.includes("LLJn_gDMG_M"),
);
const AUSTIN_UNRELEASED_139 = YOUTUBE_SETS.find((s) =>
  s.video.includes("QLpmLx5JUsg"),
);
const JAMIE_LOST_HORIZON = YOUTUBE_SETS.find((s) =>
  s.video.includes("U2ZjW_8K3h4"),
);
const SKRILLEX_LOLLA_CHILE = YOUTUBE_SETS.find((s) =>
  s.video.includes("loD-whuR5zc"),
);
const STUSSY_BOILER_EDINBURGH = YOUTUBE_SETS.find((s) =>
  s.video.includes("42XFNGZrpaQ"),
);
const VOORN_KOROLOVA_COVE = YOUTUBE_SETS.find((s) =>
  s.video.includes("FQj71mhobYw"),
);
const COLYN_INNELLEA_COVE = YOUTUBE_SETS.find((s) =>
  s.video.includes("2BPWWYAgUE4"),
);

describe("watchMetaFromCuratedSeed", () => {
  it("builds ASOT 1290 meta from the curated 1001 capture", () => {
    assert.ok(ASOT);
    const meta = watchMetaFromCuratedSeed(ASOT);
    assert.ok(meta);
    assert.equal(meta.videoId, "bxb6Tglooc4");
    assert.match(meta.title, /A State Of Trance 1290/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=bxb6Tglooc4");
    assert.match(meta.imageUrl, /bxb6Tglooc4/);
    // Last cue 1:57:45 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 57 * 60 + 45 + 180);
  });

  it("builds Armin Freedom WE1 meta from the curated 1001 capture", () => {
    assert.ok(ARMIN_FREEDOM);
    const meta = watchMetaFromCuratedSeed(ARMIN_FREEDOM);
    assert.ok(meta);
    assert.equal(meta.videoId, "pwXGm4HEQdo");
    assert.match(meta.title, /Freedom WE1/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=pwXGm4HEQdo");
    // Last cue 2:25:22 + 180s pad.
    assert.equal(meta.durationSec, 2 * 3600 + 25 * 60 + 22 + 180);
  });

  it("builds Dom Dolla Creamfields meta from the curated 1001 capture", () => {
    assert.ok(DOM_CREAMFIELDS);
    const meta = watchMetaFromCuratedSeed(DOM_CREAMFIELDS);
    assert.ok(meta);
    assert.equal(meta.videoId, "NblVVOwQRqw");
    assert.match(meta.title, /Creamfields 2025/i);
    // Last cue 1:27:04 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 27 * 60 + 4 + 180);
  });

  it("builds Marlon Hoffstadt Coachella WE2 meta from the curated 1001 capture", () => {
    assert.ok(MARLON_COACHELLA);
    const meta = watchMetaFromCuratedSeed(MARLON_COACHELLA);
    assert.ok(meta);
    assert.equal(meta.videoId, "vpf4LLy42Zc");
    assert.match(meta.title, /Coachella 2026/i);
    // Last cue 55:48 + 180s pad.
    assert.equal(meta.durationSec, 55 * 60 + 48 + 180);
  });

  it("builds Markus Schulz GDJB meta from the curated 1001 capture", () => {
    assert.ok(GDJB);
    const meta = watchMetaFromCuratedSeed(GDJB);
    assert.ok(meta);
    assert.equal(meta.videoId, "WWnLYZrh6kw");
    assert.match(meta.title, /Global DJ Broadcast/i); // pragma: allowlist secret
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=WWnLYZrh6kw");
    // Last cue 1:56:31 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 56 * 60 + 31 + 180);
  });

  it("builds Chase & Status TML WE2 Mainstage meta from the curated 1001 capture", () => {
    assert.ok(CHASE_STATUS_TML_WE2);
    const meta = watchMetaFromCuratedSeed(CHASE_STATUS_TML_WE2);
    assert.ok(meta);
    assert.equal(meta.videoId, "jSJEkiV3cCs");
    assert.match(meta.title, /Chase & Status/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=jSJEkiV3cCs");
    // Last cue 56:40 + 180s pad.
    assert.equal(meta.durationSec, 56 * 60 + 40 + 180);
  });

  it("builds I Hate Models TML WE1 Freedom Stage meta from the curated 1001 capture", () => {
    assert.ok(I_HATE_MODELS_TML_WE1);
    const meta = watchMetaFromCuratedSeed(I_HATE_MODELS_TML_WE1);
    assert.ok(meta);
    assert.equal(meta.videoId, "zMW5SQPS1cY");
    assert.match(meta.title, /I Hate Models/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=zMW5SQPS1cY");
    // Last cue 57:50 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 50 + 180);
  });

  it("builds Netsky TML WE1 Freedom Stage meta from the curated 1001 capture", () => {
    assert.ok(NETSKY_TML_WE1);
    const meta = watchMetaFromCuratedSeed(NETSKY_TML_WE1);
    assert.ok(meta);
    assert.equal(meta.videoId, "_e1H9pkcjsQ");
    assert.match(meta.title, /Netsky/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=_e1H9pkcjsQ");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Oliver Heldens TML WE1 Great Library meta from the curated 1001 capture", () => {
    assert.ok(OLIVER_HELDENS_TML_WE1);
    const meta = watchMetaFromCuratedSeed(OLIVER_HELDENS_TML_WE1);
    assert.ok(meta);
    assert.equal(meta.videoId, "2i3XOxbp54U");
    assert.match(meta.title, /Oliver Heldens WE1/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=2i3XOxbp54U");
    // Last cue 1:01:48 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 1 * 60 + 48 + 180);
  });

  it("builds Alan Walker TML WE1 2018 meta from the curated 1001 capture", () => {
    assert.ok(ALAN_WALKER_TML_WE1_2018);
    const meta = watchMetaFromCuratedSeed(ALAN_WALKER_TML_WE1_2018);
    assert.ok(meta);
    assert.equal(meta.videoId, "xVWs0ti0J90");
    assert.match(meta.title, /Alan Walker/i);
    assert.match(meta.title, /2018/);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=xVWs0ti0J90");
    // Last cue 55:30 + 180s pad.
    assert.equal(meta.durationSec, 55 * 60 + 30 + 180);
  });

  it("builds GORDO TML WE2 2023 meta from the curated 1001 capture", () => {
    assert.ok(GORDO_TML_WE2_2023);
    const meta = watchMetaFromCuratedSeed(GORDO_TML_WE2_2023);
    assert.ok(meta);
    assert.equal(meta.videoId, "lopIWBJ0T5I");
    assert.match(meta.title, /GORDO/i);
    assert.match(meta.title, /2023/);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=lopIWBJ0T5I");
    // Last cue 58:38 + 180s pad.
    assert.equal(meta.durationSec, 58 * 60 + 38 + 180);
  });

  it("builds Lucas & Steve TML WE2 2024 meta from the curated 1001 capture", () => {
    assert.ok(LUCAS_STEVE_TML_WE2_2024);
    const meta = watchMetaFromCuratedSeed(LUCAS_STEVE_TML_WE2_2024);
    assert.ok(meta);
    assert.equal(meta.videoId, "GbG_OFmdPKk");
    assert.match(meta.title, /Lucas & Steve/i);
    assert.match(meta.title, /2024/);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=GbG_OFmdPKk");
    // Last cue 1:01:56 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 1 * 60 + 56 + 180);
  });

  it("builds Tape B CarTunes Vol. 5 meta from the curated 1001 capture", () => {
    assert.ok(TAPE_B_CT5);
    const meta = watchMetaFromCuratedSeed(TAPE_B_CT5);
    assert.ok(meta);
    assert.equal(meta.videoId, "7_O8N_EJg_c");
    assert.match(meta.title, /CarTunes/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=7_O8N_EJg_c");
    // Last cue 57:34 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 34 + 180);
  });

  it("builds Vintage Culture Robot Heart 2024 meta from the curated 1001 capture", () => {
    assert.ok(VC_ROBOT_HEART);
    const meta = watchMetaFromCuratedSeed(VC_ROBOT_HEART);
    assert.ok(meta);
    assert.equal(meta.videoId, "KbGNocaJDjw");
    assert.match(meta.title, /Robot Heart/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=KbGNocaJDjw");
    // Last cue 2:14:45 + 180s pad.
    assert.equal(meta.durationSec, 2 * 3600 + 14 * 60 + 45 + 180);
  });

  it("builds John Summit Playa Package Mix meta from the curated 1001 capture", () => {
    assert.ok(JOHN_SUMMIT_PLAYA);
    const meta = watchMetaFromCuratedSeed(JOHN_SUMMIT_PLAYA);
    assert.ok(meta);
    assert.equal(meta.videoId, "PkWNuf7rtms");
    assert.match(meta.title, /Playa Package Mix/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=PkWNuf7rtms");
    // Last cue 21:50 + 180s pad.
    assert.equal(meta.durationSec, 21 * 60 + 50 + 180);
  });

  it("pins a Meantime TML 2026 cover on John Summit WE2 while the watch is private", () => {
    assert.ok(JOHN_SUMMIT_TML_WE2);
    const meta = watchMetaFromCuratedSeed(JOHN_SUMMIT_TML_WE2);
    assert.ok(meta);
    assert.equal(meta.videoId, "PlArfyuzuqo");
    assert.match(meta.title, /WE2/i);
    assert.equal(meta.imageUrl, "/sets/john-summit-tml-we2-2026.jpg");
  });

  it("builds BRANDON Parookaville Desert Valley meta from the curated 1001 capture", () => {
    assert.ok(BRANDON_PAROOKAVILLE);
    const meta = watchMetaFromCuratedSeed(BRANDON_PAROOKAVILLE);
    assert.ok(meta);
    assert.equal(meta.videoId, "AQ6wWT2HaSQ");
    assert.match(meta.title, /Parookaville/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=AQ6wWT2HaSQ");
    // Last cue 57:41 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 41 + 180);
  });

  it("builds ILLENIUM TML WE1 Great Library meta from the curated 1001 capture", () => {
    assert.ok(ILLENIUM_TML_WE1);
    const meta = watchMetaFromCuratedSeed(ILLENIUM_TML_WE1);
    assert.ok(meta);
    assert.equal(meta.videoId, "E1WH0nvaxAw");
    assert.match(meta.title, /ILLENIUM WE1/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=E1WH0nvaxAw");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Alesso TML WE1 Mainstage meta from the curated 1001 capture", () => {
    assert.ok(ALESSO_TML_WE1);
    const meta = watchMetaFromCuratedSeed(ALESSO_TML_WE1);
    assert.ok(meta);
    assert.equal(meta.videoId, "TidwOi0NMI0");
    assert.match(meta.title, /Alesso WE1/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=TidwOi0NMI0");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Alok TML WE2 meta from the curated 1001 capture", () => {
    assert.ok(ALOK_TML);
    const meta = watchMetaFromCuratedSeed(ALOK_TML);
    assert.ok(meta);
    assert.equal(meta.videoId, "zHAUZ02aCwo");
    assert.match(meta.title, /Alok WE2/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=zHAUZ02aCwo");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Vintage Culture Neon Garden meta from the curated 1001 capture", () => {
    assert.ok(VC_NEON);
    const meta = watchMetaFromCuratedSeed(VC_NEON);
    assert.ok(meta);
    assert.equal(meta.videoId, "knJyJPP45dg");
    assert.match(meta.title, /Neon Garden/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=knJyJPP45dg");
    // Last cue 1:08:35 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 8 * 60 + 35 + 180);
  });

  it("builds Vintage Culture Só Track Boa meta from the curated 1001 capture", () => {
    assert.ok(VC_BOA);
    const meta = watchMetaFromCuratedSeed(VC_BOA);
    assert.ok(meta);
    assert.equal(meta.videoId, "kmMYCg-igjc");
    assert.match(meta.title, /S[oó] Track Boa/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=kmMYCg-igjc");
    // Last cue 1:17:44 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 17 * 60 + 44 + 180);
  });

  it("builds Vintage Culture Pacha Ibiza meta from the curated 1001 capture", () => {
    assert.ok(VC_PACHA);
    const meta = watchMetaFromCuratedSeed(VC_PACHA);
    assert.ok(meta);
    assert.equal(meta.videoId, "OVex0rm7ZR4");
    assert.match(meta.title, /Pacha Ibiza/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=OVex0rm7ZR4");
    // Last cue 1:07:05 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 7 * 60 + 5 + 180);
  });

  it("builds Calvin Harris Dance Valley meta from the curated 1001 capture", () => {
    assert.ok(CH_DANCE_VALLEY);
    const meta = watchMetaFromCuratedSeed(CH_DANCE_VALLEY);
    assert.ok(meta);
    assert.equal(meta.videoId, "pnzSuCiAGdk");
    assert.match(meta.title, /Dance Valley/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=pnzSuCiAGdk");
    // Last cue 1:12:29 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 12 * 60 + 29 + 180);
  });

  it("builds Bassjackers Great Library TML WE2 meta from the curated 1001 capture", () => {
    assert.ok(BASSJACKERS_TML);
    const meta = watchMetaFromCuratedSeed(BASSJACKERS_TML);
    assert.ok(meta);
    assert.equal(meta.videoId, "BG3Lr9EdWVY");
    assert.match(meta.title, /Great Library|Tomorrowland/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=BG3Lr9EdWVY");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds TUJAMO Parookaville meta from the curated 1001 capture", () => {
    assert.ok(TUJAMO_PAROOKAVILLE);
    const meta = watchMetaFromCuratedSeed(TUJAMO_PAROOKAVILLE);
    assert.ok(meta);
    assert.equal(meta.videoId, "JhpL-KKGoO8");
    assert.match(meta.title, /Parookaville/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=JhpL-KKGoO8");
    // Last cue 1:11:41 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 11 * 60 + 41 + 180);
  });

  it("builds Dillon Francis B2B Marten Horger Parookaville 2025 meta", () => {
    assert.ok(DF_MH_PAROOKAVILLE);
    const meta = watchMetaFromCuratedSeed(DF_MH_PAROOKAVILLE);
    assert.ok(meta);
    assert.equal(meta.videoId, "IwNPc_4ux84");
    assert.match(meta.title, /Parookaville 2025/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=IwNPc_4ux84");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Mike Williams Time Lab Parookaville meta from the curated 1001 capture", () => {
    assert.ok(MW_TIME_LAB);
    const meta = watchMetaFromCuratedSeed(MW_TIME_LAB);
    assert.ok(meta);
    assert.equal(meta.videoId, "XisbmW1Smgc");
    assert.match(meta.title, /Time Lab|Parookaville/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=XisbmW1Smgc");
    // Last cue 56:09 + 180s pad.
    assert.equal(meta.durationSec, 56 * 60 + 9 + 180);
  });

  it("builds Hardwell Parookaville meta from the curated 1001 capture", () => {
    assert.ok(HW_PAROOKAVILLE);
    const meta = watchMetaFromCuratedSeed(HW_PAROOKAVILLE);
    assert.ok(meta);
    assert.equal(meta.videoId, "eBeeWwsCVls");
    assert.match(meta.title, /Parookaville/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=eBeeWwsCVls");
    // Last cue 1:19:07 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 19 * 60 + 7 + 180);
  });

  it("builds DubVision Parookaville meta from the curated 1001 capture", () => {
    assert.ok(DV_PAROOKAVILLE);
    const meta = watchMetaFromCuratedSeed(DV_PAROOKAVILLE);
    assert.ok(meta);
    assert.equal(meta.videoId, "UETk8HSB0Yw");
    assert.match(meta.title, /Parookaville/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=UETk8HSB0Yw");
    // Last cue 56:13 + 180s pad.
    assert.equal(meta.durationSec, 56 * 60 + 13 + 180);
  });

  it("builds W&W Parookaville meta from the curated 1001 capture", () => {
    assert.ok(WW_PAROOKAVILLE);
    const meta = watchMetaFromCuratedSeed(WW_PAROOKAVILLE);
    assert.ok(meta);
    assert.equal(meta.videoId, "or_SDolEBfw");
    assert.match(meta.title, /Parookaville/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=or_SDolEBfw");
    // Last cue 1:11:25 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 11 * 60 + 25 + 180);
  });

  it("builds MANDY B2B Negativ Atmosphere TML WE1 meta from the curated 1001 capture", () => {
    assert.ok(MANDY_NEGATIV_TML);
    const meta = watchMetaFromCuratedSeed(MANDY_NEGATIV_TML);
    assert.ok(meta);
    assert.equal(meta.videoId, "J7b0G4XX8pg");
    assert.match(meta.title, /Atmosphere|Tomorrowland/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=J7b0G4XX8pg");
    // Last cue 57:56 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 56 + 180);
  });

  it("builds Indira Paganotto Atmosphere TML WE1 2023 meta from the curated 1001 capture", () => {
    assert.ok(INDIRA_TML_2023);
    const meta = watchMetaFromCuratedSeed(INDIRA_TML_2023);
    assert.ok(meta);
    assert.equal(meta.videoId, "yPCOu0-JKJo");
    assert.match(meta.title, /Atmosphere|Tomorrowland/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=yPCOu0-JKJo");
    // Last cue 1:55:24 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 55 * 60 + 24 + 180);
  });

  it("builds AFROJACK B2B R3HAB TML WE2 meta from the curated 1001 capture", () => {
    assert.ok(AFROJACK_R3HAB_TML);
    const meta = watchMetaFromCuratedSeed(AFROJACK_R3HAB_TML);
    assert.ok(meta);
    assert.equal(meta.videoId, "lEIGnx7qLl0");
    assert.match(meta.title, /Tomorrowland/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=lEIGnx7qLl0");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Lucas & Steve B2B Mike Williams DLDK Ziggo meta from the curated 1001 capture", () => {
    assert.ok(DLDK_ZIGGO);
    const meta = watchMetaFromCuratedSeed(DLDK_ZIGGO);
    assert.ok(meta);
    assert.equal(meta.videoId, "B1EaMgsf84Q");
    assert.match(meta.title, /Don't Let Daddy Know|Ziggo/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=B1EaMgsf84Q");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Vintage Culture NYC Yacht meta from the curated 1001 capture", () => {
    assert.ok(VC_YACHT);
    const meta = watchMetaFromCuratedSeed(VC_YACHT);
    assert.ok(meta);
    assert.equal(meta.videoId, "6bJZPDKlq7o");
    assert.match(meta.title, /Sunset Yacht Party/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=6bJZPDKlq7o");
    // Last cue 2:04:00 + 180s pad.
    assert.equal(meta.durationSec, 2 * 3600 + 4 * 60 + 180);
  });

  it("builds Hardwell On Air 527 Yearmix meta from the curated 1001 capture", () => {
    assert.ok(HOA_527);
    const meta = watchMetaFromCuratedSeed(HOA_527);
    assert.ok(meta);
    assert.equal(meta.videoId, "OXwK0CSmXzY");
    assert.match(meta.title, /Hardwell On Air 527/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=OXwK0CSmXzY");
    // Last cue 56:47 + 180s pad.
    assert.equal(meta.durationSec, 56 * 60 + 47 + 180);
  });

  it("builds Reinier Zonneveld Awakenings meta from the curated 1001 capture", () => {
    assert.ok(RZ_AWAKE);
    const meta = watchMetaFromCuratedSeed(RZ_AWAKE);
    assert.ok(meta);
    assert.equal(meta.videoId, "i-mFuxbGHzg");
    assert.match(meta.title, /Awakenings Festival 2025/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=i-mFuxbGHzg");
    // Last cue 1:28:45 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 28 * 60 + 45 + 180);
  });

  it("builds Joel Corry Edge NYC meta from the curated 1001 capture", () => {
    assert.ok(JOEL_EDGE);
    const meta = watchMetaFromCuratedSeed(JOEL_EDGE);
    assert.ok(meta);
    assert.equal(meta.videoId, "soEFl73peVA");
    assert.match(meta.title, /Edge NYC/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=soEFl73peVA");
    // Last cue 2:28:40 + 180s pad.
    assert.equal(meta.durationSec, 2 * 3600 + 28 * 60 + 40 + 180);
  });

  it("builds Protocol Radio 731 meta from the curated 1001 capture", () => {
    assert.ok(PRR_731);
    const meta = watchMetaFromCuratedSeed(PRR_731);
    assert.ok(meta);
    assert.equal(meta.videoId, "Rgx-wT9FDaE");
    assert.match(meta.title, /Protocol Radio 731/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=Rgx-wT9FDaE");
    // Last cue 53:53 + 180s pad.
    assert.equal(meta.durationSec, 53 * 60 + 53 + 180);
  });

  it("builds Smash The House Radio 687 meta from the curated 1001 capture", () => {
    assert.ok(STH_687);
    const meta = watchMetaFromCuratedSeed(STH_687);
    assert.ok(meta);
    assert.equal(meta.videoId, "eVjC42MNgkI");
    assert.match(meta.title, /Smash The House Radio 687/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=eVjC42MNgkI");
    // Last cue 57:17 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 17 + 180);
  });

  it("builds NOTION Perry's Lollapalooza meta from the curated 1001 capture", () => {
    assert.ok(NOTION_PERRY);
    const meta = watchMetaFromCuratedSeed(NOTION_PERRY);
    assert.ok(meta);
    assert.equal(meta.videoId, "9vgSTomhCp8");
    assert.match(meta.title, /NOTION/i);
    assert.match(meta.title, /Lollapalooza/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=9vgSTomhCp8");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Vintage Culture Ultra Miami Resistance meta from the curated 1001 capture", () => {
    assert.ok(VC_ULTRA);
    const meta = watchMetaFromCuratedSeed(VC_ULTRA);
    assert.ok(meta);
    assert.equal(meta.videoId, "xXRjglkAmq8");
    assert.match(meta.title, /Ultra Music Festival Miami 2026/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=xXRjglkAmq8");
    // Last cue 1:25:45 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 25 * 60 + 45 + 180);
  });

  it("builds Vintage Culture Pacha NYC meta from the curated 1001 capture", () => {
    assert.ok(VC_PACHA_NYC);
    const meta = watchMetaFromCuratedSeed(VC_PACHA_NYC);
    assert.ok(meta);
    assert.equal(meta.videoId, "TDuFnUAo4II");
    assert.match(meta.title, /Pacha New York/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=TDuFnUAo4II");
    // Last cue 3:23:23 + 180s pad.
    assert.equal(meta.durationSec, 3 * 3600 + 23 * 60 + 23 + 180);
  });

  it("builds Claptone Masquerade Buenos Aires meta from the curated 1001 capture", () => {
    assert.ok(CLAPTONE_BA);
    const meta = watchMetaFromCuratedSeed(CLAPTONE_BA);
    assert.ok(meta);
    assert.equal(meta.videoId, "fQweMs-Q3rg");
    assert.match(meta.title, /Masquerade/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=fQweMs-Q3rg");
    // Last cue 1:40:32 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 40 * 60 + 32 + 180);
  });

  it("builds Indira Paganotto Area V Awakenings 2025 meta from the curated 1001 capture", () => {
    assert.ok(INDIRA_AWAKENINGS);
    const meta = watchMetaFromCuratedSeed(INDIRA_AWAKENINGS);
    assert.ok(meta);
    assert.equal(meta.videoId, "xUdcEDryN8o");
    assert.match(meta.title, /Awakenings Festival 2025/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=xUdcEDryN8o");
    // Last cue 1:26:17 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 26 * 60 + 17 + 180);
  });

  it("builds Korolova Snowattack Festival 2026 meta from the curated 1001 capture", () => {
    assert.ok(KOROLOVA_SNOWATTACK);
    const meta = watchMetaFromCuratedSeed(KOROLOVA_SNOWATTACK);
    assert.ok(meta);
    assert.equal(meta.videoId, "7UcyaKbvy2o");
    assert.match(meta.title, /Snowattack Festival 2026/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=7UcyaKbvy2o");
    // Last cue 52:03 + 180s pad.
    assert.equal(meta.durationSec, 52 * 60 + 3 + 180);
  });

  it("builds Korolova Tulum Mexico 2026 meta from the curated 1001 capture", () => {
    assert.ok(KOROLOVA_TULUM);
    const meta = watchMetaFromCuratedSeed(KOROLOVA_TULUM);
    assert.ok(meta);
    assert.equal(meta.videoId, "HvkAfj1QnK8");
    assert.match(meta.title, /Tulum, Mexico 2026/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=HvkAfj1QnK8");
    // Last cue 53:08 + 180s pad.
    assert.equal(meta.durationSec, 53 * 60 + 8 + 180);
  });

  it("builds Natte Visstick Teletech x FYM AFAS Live 2025 meta from the curated 1001 capture", () => {
    assert.ok(NATTE_AFAS);
    const meta = watchMetaFromCuratedSeed(NATTE_AFAS);
    assert.ok(meta);
    assert.equal(meta.videoId, "Nrl9yBX6Kpw");
    assert.match(meta.title, /Teletech x FYM, AFAS Live 2025/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=Nrl9yBX6Kpw");
    // Last cue 56:03 + 180s pad.
    assert.equal(meta.durationSec, 56 * 60 + 3 + 180);
  });

  it("builds Deborah De Luca Pyramid Amnesia Ibiza 2025 meta from the curated 1001 capture", () => {
    assert.ok(DEBORAH_AMNESIA);
    const meta = watchMetaFromCuratedSeed(DEBORAH_AMNESIA);
    assert.ok(meta);
    assert.equal(meta.videoId, "IfFnvi7O2Po");
    assert.match(meta.title, /Pyramid, Amnesia Ibiza 2025/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=IfFnvi7O2Po");
    // Last cue 54:56 + 180s pad.
    assert.equal(meta.durationSec, 54 * 60 + 56 + 180);
  });

  it("builds Miss Monique Ibiza Yacht meta from the curated 1001 capture", () => {
    assert.ok(MM_YACHT);
    const meta = watchMetaFromCuratedSeed(MM_YACHT);
    assert.ok(meta);
    assert.equal(meta.videoId, "0-s_qZRWElA");
    assert.match(meta.title, /Ibiza Yacht Sunset/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=0-s_qZRWElA");
    // Last cue 55:49 + 180s pad.
    assert.equal(meta.durationSec, 55 * 60 + 49 + 180);
  });

  it("builds Tiësto Prismatic 032 meta from the curated 1001 capture", () => {
    assert.ok(PRISMATIC_032);
    const meta = watchMetaFromCuratedSeed(PRISMATIC_032);
    assert.ok(meta);
    assert.equal(meta.videoId, "blP5J6BUG0M");
    assert.match(meta.title, /PRISMATIC/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=blP5J6BUG0M");
    // Last cue 57:52 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 52 + 180);
  });

  it("builds Joris Voorn Spectrum Radio 485 meta from the curated 1001 capture", () => {
    assert.ok(SPECTRUM_485);
    const meta = watchMetaFromCuratedSeed(SPECTRUM_485);
    assert.ok(meta);
    assert.equal(meta.videoId, "yTRvLrtsM9I");
    assert.match(meta.title, /Spectrum Radio 485/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=yTRvLrtsM9I");
    // Last cue 59:10 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 10 + 180);
  });

  it("builds Nicky Romero TML artist playback meta from the curated 1001 capture", () => {
    assert.ok(NICKY_TML_ARTIST);
    const meta = watchMetaFromCuratedSeed(NICKY_TML_ARTIST);
    assert.ok(meta);
    assert.equal(meta.videoId, "B05MAbsCOLA");
    assert.match(meta.title, /LIVE at Tomorrowland 2026/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=B05MAbsCOLA");
    // Last cue 59:30 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 30 + 180);
  });

  it("builds Group Therapy 690 meta from the curated 1001 capture", () => {
    assert.ok(ABGT_690);
    const meta = watchMetaFromCuratedSeed(ABGT_690);
    assert.ok(meta);
    assert.equal(meta.videoId, "phWKhIwgiTo");
    assert.match(meta.title, /Group Therapy 690/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=phWKhIwgiTo");
    // Last cue 1:54:40 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 54 * 60 + 40 + 180);
  });

  it("builds Vintage Culture Arodes Burning Man YT meta from the curated 1001 capture", () => {
    assert.ok(VC_ARODES_YT);
    const meta = watchMetaFromCuratedSeed(VC_ARODES_YT);
    assert.ok(meta);
    assert.equal(meta.videoId, "SeKRNa26kug");
    assert.match(meta.title, /Burning Man 2024/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=SeKRNa26kug");
    // Last cue 1:46:10 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 46 * 60 + 10 + 180);
  });

  it("builds Max Styler Opulent Temple meta from the curated 1001 capture", () => {
    assert.ok(MAX_STYLER_OT);
    const meta = watchMetaFromCuratedSeed(MAX_STYLER_OT);
    assert.ok(meta);
    assert.equal(meta.videoId, "k4Drn6AwAdk");
    assert.match(meta.title, /Opulent Temple/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=k4Drn6AwAdk");
    // Last cue 1:25:00 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 25 * 60 + 180);
  });

  it("builds Hannah Laing Creamfields North meta from the curated 1001 capture", () => {
    assert.ok(HANNAH_CF);
    const meta = watchMetaFromCuratedSeed(HANNAH_CF);
    assert.ok(meta);
    assert.equal(meta.videoId, "arowbYnNFGY");
    assert.match(meta.title, /Creamfields/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=arowbYnNFGY");
    // Last cue 1:21:44 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 21 * 60 + 44 + 180);
  });

  it("builds Purified Radio 520 meta from the curated 1001 capture", () => {
    assert.ok(PURIFIED_520);
    const meta = watchMetaFromCuratedSeed(PURIFIED_520);
    assert.ok(meta);
    assert.equal(meta.videoId, "8aDoUu4GDrc");
    assert.match(meta.title, /Purified Radio 520/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=8aDoUu4GDrc");
    // Last cue 57:54 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 54 + 180);
  });

  it("builds Captive Soul 098 meta from the curated 1001 capture", () => {
    assert.ok(CAPTIVE_098);
    const meta = watchMetaFromCuratedSeed(CAPTIVE_098);
    assert.ok(meta);
    assert.equal(meta.videoId, "5JxfEjVdQFk");
    assert.match(meta.title, /Captive Soul 098/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=5JxfEjVdQFk");
    // Last cue 55:58 + 180s pad.
    assert.equal(meta.durationSec, 55 * 60 + 58 + 180);
  });

  it("builds James Hype SYNC London meta from the curated 1001 capture", () => {
    assert.ok(HYPE_SYNC);
    const meta = watchMetaFromCuratedSeed(HYPE_SYNC);
    assert.ok(meta);
    assert.equal(meta.videoId, "rLTCLSsqrXY");
    assert.match(meta.title, /SYNC London/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=rLTCLSsqrXY");
    // Last cue 1:55:07 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 55 * 60 + 7 + 180);
  });

  it("builds Epic Radio 036 meta from the curated 1001 capture", () => {
    assert.ok(EPIC_036);
    const meta = watchMetaFromCuratedSeed(EPIC_036);
    assert.ok(meta);
    assert.equal(meta.videoId, "JLIYTueL4TI");
    assert.match(meta.title, /EPIC Radio 036/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=JLIYTueL4TI");
    // Last cue 59:10 + 180s pad.
    assert.equal(meta.durationSec, 59 * 60 + 10 + 180);
  });

  it("builds Cuebrick Sacré Paris meta from the official @Cuebrick seed", () => {
    assert.ok(CUEBRICK_SACRE);
    const meta = watchMetaFromCuratedSeed(CUEBRICK_SACRE);
    assert.ok(meta);
    assert.equal(meta.videoId, "LLJn_gDMG_M");
    assert.match(meta.title, /Sacré Paris/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=LLJn_gDMG_M");
    // No 1001 cues in the operator paste — default hour pad.
    assert.equal(meta.durationSec, 60 * 60);
  });

  it("builds Austin Kramer UNreleased 139 meta from the curated 1001 capture", () => {
    assert.ok(AUSTIN_UNRELEASED_139);
    const meta = watchMetaFromCuratedSeed(AUSTIN_UNRELEASED_139);
    assert.ok(meta);
    assert.equal(meta.videoId, "QLpmLx5JUsg");
    assert.match(meta.title, /UNreleased/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=QLpmLx5JUsg");
    // Last cue 57:15 + 180s pad.
    assert.equal(meta.durationSec, 57 * 60 + 15 + 180);
  });

  it("builds Jamie Jones Lost Horizon Festival meta from the curated 1001 capture", () => {
    assert.ok(JAMIE_LOST_HORIZON);
    const meta = watchMetaFromCuratedSeed(JAMIE_LOST_HORIZON);
    assert.ok(meta);
    assert.equal(meta.videoId, "U2ZjW_8K3h4");
    assert.match(meta.title, /Lost Horizon Festival/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=U2ZjW_8K3h4");
    // Last cue 54:58 + 180s pad.
    assert.equal(meta.durationSec, 54 * 60 + 58 + 180);
  });

  it("builds Skrillex Lollapalooza Chile meta from the curated 1001 capture", () => {
    assert.ok(SKRILLEX_LOLLA_CHILE);
    const meta = watchMetaFromCuratedSeed(SKRILLEX_LOLLA_CHILE);
    assert.ok(meta);
    assert.equal(meta.videoId, "loD-whuR5zc");
    assert.match(meta.title, /Lollapalooza Chile/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=loD-whuR5zc");
    // Last cue 1:25:21 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 25 * 60 + 21 + 180);
  });

  it("builds Chris Stussy Boiler Room Edinburgh meta from the curated 1001 capture", () => {
    assert.ok(STUSSY_BOILER_EDINBURGH);
    const meta = watchMetaFromCuratedSeed(STUSSY_BOILER_EDINBURGH);
    assert.ok(meta);
    assert.equal(meta.videoId, "42XFNGZrpaQ");
    assert.match(meta.title, /Boiler Room: Edinburgh/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=42XFNGZrpaQ");
    // Last cue 1:11:49 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 11 * 60 + 49 + 180);
  });

  it("builds Joris Voorn B2B Korolova Ultra Cove meta from the curated 1001 capture", () => {
    assert.ok(VOORN_KOROLOVA_COVE);
    const meta = watchMetaFromCuratedSeed(VOORN_KOROLOVA_COVE);
    assert.ok(meta);
    assert.equal(meta.videoId, "FQj71mhobYw");
    assert.match(meta.title, /Resistance The Cove/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=FQj71mhobYw");
    // Last cue 1:54:20 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 54 * 60 + 20 + 180);
  });

  it("builds Colyn B2B Innellea Ultra Cove meta from the curated 1001 capture", () => {
    assert.ok(COLYN_INNELLEA_COVE);
    const meta = watchMetaFromCuratedSeed(COLYN_INNELLEA_COVE);
    assert.ok(meta);
    assert.equal(meta.videoId, "2BPWWYAgUE4");
    assert.match(meta.title, /ULTRA MIAMI 2026/i);
    assert.equal(meta.watchUrl, "https://www.youtube.com/watch?v=2BPWWYAgUE4");
    // Last cue 1:25:00 + 180s pad.
    assert.equal(meta.durationSec, 1 * 3600 + 25 * 60 + 180);
  });

  it("returns null without a title or video id", () => {
    assert.equal(
      watchMetaFromCuratedSeed({
        video: "https://example.com/not-youtube",
        primaryArtist: { name: "x", slug: "x" },
        genre: "Trance",
        title: "Has title",
      }),
      null,
    );
    assert.ok(ASOT);
    assert.equal(
      watchMetaFromCuratedSeed({ ...ASOT, title: undefined }),
      null,
    );
  });
});

describe("curated YouTube 429 fallback", () => {
  const prevCurated = process.env.YOUTUBE_CURATED_ONLY;
  const prevKey = process.env.YOUTUBE_API_KEY;
  let origFetch: typeof fetch;

  before(() => {
    origFetch = globalThis.fetch;
    process.env.YOUTUBE_CURATED_ONLY = "1";
    delete process.env.YOUTUBE_API_KEY;
    globalThis.fetch = (async () =>
      new Response("rate limited", { status: 429 })) as typeof fetch;
  });

  after(() => {
    globalThis.fetch = origFetch;
    if (prevCurated === undefined) delete process.env.YOUTUBE_CURATED_ONLY;
    else process.env.YOUTUBE_CURATED_ONLY = prevCurated;
    if (prevKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = prevKey;
  });

  it("lands ASOT 1290 from the 1001 seed when watch is 429", async () => {
    assert.ok(ASOT);
    const adapter = createYoutubeAdapter([ASOT], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-bxb6Tglooc4");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 40);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "armin-van-buuren");
    assert.ok(
      sets[0]?.collaborators?.some((c) => c.slug === "giuseppe-ottaviani"),
    );
  });

  it("lands Men Machine and Aoki Friendship Mix YT twins from seeds", async () => {
    assert.ok(MEN_MACHINE && AOKI);
    const adapter = createYoutubeAdapter([MEN_MACHINE, AOKI], [], [], []);
    const sets = await adapter.fetchRecent();
    const slugs = sets.map((s) => s.sourceSlug).sort();
    assert.deepEqual(slugs, ["yt-NTLDGnoWIRg", "yt-hgbAN8NFNu0"].sort());
    const men = sets.find((s) => s.sourceSlug === "yt-NTLDGnoWIRg");
    const aoki = sets.find((s) => s.sourceSlug === "yt-hgbAN8NFNu0");
    assert.ok(men && aoki);
    assert.ok(men.plays.length >= 14);
    assert.ok(aoki.plays.length >= 20);
    assert.equal(men.primaryArtist?.slug, "men-machine");
    assert.equal(aoki.primaryArtist?.slug, "steve-aoki");
  });

  it("lands Armin Freedom WE1 from the 1001 seed when watch is 429", async () => {
    assert.ok(ARMIN_FREEDOM);
    const adapter = createYoutubeAdapter([ARMIN_FREEDOM], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-pwXGm4HEQdo");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 67);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 2 * 3600 + 25 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "armin-van-buuren");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Dom Dolla Creamfields Steel Yard from the 1001 seed when watch is 429", async () => {
    assert.ok(DOM_CREAMFIELDS);
    const adapter = createYoutubeAdapter([DOM_CREAMFIELDS], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-NblVVOwQRqw");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 46);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 60 * 60 + 27 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "dom-dolla");
    assert.match(String(sets[0]?.eventName ?? ""), /Creamfields/i);
  });

  it("lands Marlon Hoffstadt Coachella WE2 from the 1001 seed when watch is 429", async () => {
    assert.ok(MARLON_COACHELLA);
    const adapter = createYoutubeAdapter([MARLON_COACHELLA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-vpf4LLy42Zc");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 15);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 55 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "marlon-hoffstadt");
    assert.match(String(sets[0]?.eventName ?? ""), /Coachella/i);
  });

  it("lands Markus Schulz GDJB from the 1001 seed when watch is 429", async () => {
    assert.ok(GDJB);
    const adapter = createYoutubeAdapter([GDJB], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-WWnLYZrh6kw");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 31);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 56 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "markus-schulz");
    assert.ok(
      sets[0]?.collaborators?.some((c) => c.slug === "jerome-isma-ae"),
    );
  });

  it("lands Alok TML WE2 from the 1001 seed when watch is 429", async () => {
    assert.ok(ALOK_TML);
    const adapter = createYoutubeAdapter([ALOK_TML], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-zHAUZ02aCwo");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 44);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "alok");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Vintage Culture Neon Garden from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_NEON);
    const adapter = createYoutubeAdapter([VC_NEON], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-knJyJPP45dg");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 16);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 8 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /EDC Las Vegas/i);
  });

  it("lands Vintage Culture Só Track Boa from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_BOA);
    const adapter = createYoutubeAdapter([VC_BOA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-kmMYCg-igjc");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 14);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 17 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /S[oó] Track Boa/i);
  });

  it("lands Vintage Culture Pacha Ibiza from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_PACHA);
    const adapter = createYoutubeAdapter([VC_PACHA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-OVex0rm7ZR4");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 14);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 7 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /Pacha Ibiza/i);
  });

  it("lands Vintage Culture NYC Yacht from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_YACHT);
    const adapter = createYoutubeAdapter([VC_YACHT], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-6bJZPDKlq7o");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 28);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 2 * 3600 + 4 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /Sunset Yacht Party/i);
  });

  it("lands Hardwell On Air 527 Yearmix from the 1001 seed when watch is 429", async () => {
    assert.ok(HOA_527);
    const adapter = createYoutubeAdapter([HOA_527], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-OXwK0CSmXzY");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 83);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 56 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "hardwell");
    assert.equal(sets[0]?.seriesName, "Hardwell On Air");
  });

  it("lands Reinier Zonneveld Awakenings from the 1001 seed when watch is 429", async () => {
    assert.ok(RZ_AWAKE);
    const adapter = createYoutubeAdapter([RZ_AWAKE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-i-mFuxbGHzg");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 20);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 28 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "reinier-zonneveld");
    assert.match(String(sets[0]?.eventName ?? ""), /Awakenings/i);
  });

  it("lands Joel Corry Edge NYC from the 1001 seed when watch is 429", async () => {
    assert.ok(JOEL_EDGE);
    const adapter = createYoutubeAdapter([JOEL_EDGE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-soEFl73peVA");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 55);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 2 * 3600 + 28 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "joel-corry");
    assert.match(String(sets[0]?.eventName ?? ""), /Edge/i);
  });

  it("lands Protocol Radio 731 from the 1001 seed when watch is 429", async () => {
    assert.ok(PRR_731);
    const adapter = createYoutubeAdapter([PRR_731], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-Rgx-wT9FDaE");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 16);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 53 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "nicky-romero");
    assert.equal(sets[0]?.seriesName, "Protocol Radio");
  });

  it("lands Smash The House Radio 687 from the 1001 seed when watch is 429", async () => {
    assert.ok(STH_687);
    const adapter = createYoutubeAdapter([STH_687], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-eVjC42MNgkI");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 22);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "dimitri-vegas-like-mike");
    assert.equal(sets[0]?.seriesName, "Smash The House Radio");
  });

  it("lands NOTION Perry's Lollapalooza from the 1001 seed when watch is 429", async () => {
    assert.ok(NOTION_PERRY);
    const adapter = createYoutubeAdapter([NOTION_PERRY], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-9vgSTomhCp8");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 28);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "notion");
    assert.match(String(sets[0]?.eventName ?? ""), /Lollapalooza/i);
  });

  it("lands Vintage Culture Ultra Miami Resistance from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_ULTRA);
    const adapter = createYoutubeAdapter([VC_ULTRA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-xXRjglkAmq8");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 20);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 25 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /Ultra Music Festival/i);
  });

  it("lands Vintage Culture Pacha NYC from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_PACHA_NYC);
    const adapter = createYoutubeAdapter([VC_PACHA_NYC], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-TDuFnUAo4II");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 40);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 3 * 3600 + 23 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /Pacha New York/i);
  });

  it("lands Claptone Masquerade Buenos Aires from the 1001 seed when watch is 429", async () => {
    assert.ok(CLAPTONE_BA);
    const adapter = createYoutubeAdapter([CLAPTONE_BA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-fQweMs-Q3rg");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 58);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 40 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "claptone");
    assert.match(String(sets[0]?.eventName ?? ""), /Masquerade/i);
  });

  it("lands Indira Paganotto Area V Awakenings 2025 from the 1001 seed when watch is 429", async () => {
    assert.ok(INDIRA_AWAKENINGS);
    const adapter = createYoutubeAdapter([INDIRA_AWAKENINGS], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-xUdcEDryN8o");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 26);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 26 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "indira-paganotto");
    assert.match(String(sets[0]?.eventName ?? ""), /Awakenings/i);
    assert.notEqual(sets[0]!.sourceSlug, "yt-yPCOu0-JKJo");
    assert.notEqual(sets[0]!.sourceSlug, "yt-i-mFuxbGHzg");
  });

  it("lands Korolova Snowattack Festival 2026 from the 1001 seed when watch is 429", async () => {
    assert.ok(KOROLOVA_SNOWATTACK);
    const adapter = createYoutubeAdapter([KOROLOVA_SNOWATTACK], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-7UcyaKbvy2o");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 13);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 52 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "korolova");
    assert.match(String(sets[0]?.eventName ?? ""), /Snowattack/i);
    assert.notEqual(sets[0]!.sourceSlug, "yt-5JxfEjVdQFk");
    assert.notEqual(sets[0]!.sourceSlug, "yt-RLOghpXjuJI");
  });

  it("lands Korolova Tulum Mexico 2026 from the 1001 seed when watch is 429", async () => {
    assert.ok(KOROLOVA_TULUM);
    const adapter = createYoutubeAdapter([KOROLOVA_TULUM], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-HvkAfj1QnK8");
    assert.equal(sets[0]!.type, "mix");
    assert.ok(sets[0]!.plays.length >= 12);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 53 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "korolova");
    assert.match(String(sets[0]?.eventName ?? ""), /Tulum/i);
    assert.notEqual(sets[0]!.sourceSlug, "yt-7UcyaKbvy2o");
    assert.notEqual(sets[0]!.sourceSlug, "yt-5JxfEjVdQFk");
    assert.notEqual(sets[0]!.sourceSlug, "yt-RLOghpXjuJI");
  });

  it("lands Natte Visstick Teletech x FYM AFAS Live 2025 from the 1001 seed when watch is 429", async () => {
    assert.ok(NATTE_AFAS);
    const adapter = createYoutubeAdapter([NATTE_AFAS], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-Nrl9yBX6Kpw");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 35);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 56 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "natte-visstick");
    assert.match(String(sets[0]?.eventName ?? ""), /Teletech x FYM/i);
  });

  it("lands Deborah De Luca Pyramid Amnesia Ibiza 2025 from the 1001 seed when watch is 429", async () => {
    assert.ok(DEBORAH_AMNESIA);
    const adapter = createYoutubeAdapter([DEBORAH_AMNESIA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-IfFnvi7O2Po");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 13);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 54 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "deborah-de-luca");
    assert.match(String(sets[0]?.eventName ?? ""), /Amnesia Ibiza/i);
    assert.notEqual(sets[0]!.sourceSlug, "yt-7cK7rhYXbh8");
  });

  it("lands Miss Monique Ibiza Yacht from the 1001 seed when watch is 429", async () => {
    assert.ok(MM_YACHT);
    const adapter = createYoutubeAdapter([MM_YACHT], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-0-s_qZRWElA");
    assert.equal(sets[0]!.type, "mix");
    assert.ok(sets[0]!.plays.length >= 14);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 55 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "miss-monique");
    assert.match(String(sets[0]?.eventName ?? ""), /Ibiza Sunset Yacht/i);
  });

  it("lands Tiësto Prismatic 032 from the 1001 seed when watch is 429", async () => {
    assert.ok(PRISMATIC_032);
    const adapter = createYoutubeAdapter([PRISMATIC_032], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-blP5J6BUG0M");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 20);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "tiesto");
    assert.equal(sets[0]?.seriesName, "Prismatic");
  });

  it("lands Joris Voorn Spectrum Radio 485 from the 1001 seed when watch is 429", async () => {
    assert.ok(SPECTRUM_485);
    const adapter = createYoutubeAdapter([SPECTRUM_485], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-yTRvLrtsM9I");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 15);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "joris-voorn");
    assert.equal(sets[0]?.seriesName, "Spectrum Radio");
  });

  it("lands Nicky Romero TML artist playback from the 1001 seed when watch is 429", async () => {
    assert.ok(NICKY_TML_ARTIST);
    const adapter = createYoutubeAdapter([NICKY_TML_ARTIST], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-B05MAbsCOLA");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 76);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "nicky-romero");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Group Therapy 690 from the 1001 seed when watch is 429", async () => {
    assert.ok(ABGT_690);
    const adapter = createYoutubeAdapter([ABGT_690], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-phWKhIwgiTo");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 27);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 54 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "above-beyond");
    assert.equal(sets[0]?.seriesName, "Group Therapy");
    assert.ok(sets[0]?.collaborators?.some((c) => c.slug === "estiva"));
  });

  it("lands Vintage Culture Arodes Burning Man YT from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_ARODES_YT);
    const adapter = createYoutubeAdapter([VC_ARODES_YT], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-SeKRNa26kug");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 22);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 46 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /Burning Man/i);
  });

  it("lands Max Styler Opulent Temple from the 1001 seed when watch is 429", async () => {
    assert.ok(MAX_STYLER_OT);
    const adapter = createYoutubeAdapter([MAX_STYLER_OT], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-k4Drn6AwAdk");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 28);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 25 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "max-styler");
    assert.match(String(sets[0]?.title ?? ""), /Opulent Temple/i);
    assert.match(String(sets[0]?.eventName ?? ""), /Burning Man/i);
  });

  it("lands Hannah Laing Creamfields North from the 1001 seed when watch is 429", async () => {
    assert.ok(HANNAH_CF);
    const adapter = createYoutubeAdapter([HANNAH_CF], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-arowbYnNFGY");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 24);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 21 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "hannah-laing");
    assert.match(String(sets[0]?.title ?? ""), /Creamfields/i);
    assert.match(String(sets[0]?.eventName ?? ""), /Creamfields/i);
  });

  it("lands Purified Radio 520 from the 1001 seed when watch is 429", async () => {
    assert.ok(PURIFIED_520);
    const adapter = createYoutubeAdapter([PURIFIED_520], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-8aDoUu4GDrc");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 13);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "nora-en-pure");
    assert.equal(sets[0]?.seriesName, "Purified Radio");
  });

  it("lands Captive Soul 098 from the 1001 seed when watch is 429", async () => {
    assert.ok(CAPTIVE_098);
    const adapter = createYoutubeAdapter([CAPTIVE_098], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-5JxfEjVdQFk");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 15);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 55 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "korolova");
    assert.equal(sets[0]?.seriesName, "Captive Soul");
  });

  it("lands James Hype SYNC London from the 1001 seed when watch is 429", async () => {
    assert.ok(HYPE_SYNC);
    const adapter = createYoutubeAdapter([HYPE_SYNC], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-rLTCLSsqrXY");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 66);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 55 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "james-hype");
    assert.match(String(sets[0]?.title ?? ""), /SYNC/i);
  });

  it("lands Epic Radio 036 from the 1001 seed when watch is 429", async () => {
    assert.ok(EPIC_036);
    const adapter = createYoutubeAdapter([EPIC_036], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-JLIYTueL4TI");
    assert.equal(sets[0]!.type, "radio");
    assert.ok(sets[0]!.plays.length >= 13);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "eric-prydz");
    assert.equal(sets[0]?.seriesName, "Epic Radio");
  });

  it("lands Oliver Heldens Daybreak TML WE1 from the 1001 seed when watch is 429", async () => {
    assert.ok(HELDENS_DAYBREAK);
    const adapter = createYoutubeAdapter([HELDENS_DAYBREAK], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-wuMQeEJ3YnQ");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 95);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 2 * 3600 + 25 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "oliver-heldens");
    assert.match(String(sets[0]?.title ?? ""), /Daybreak/i);
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Calvin Harris Dance Valley from the 1001 seed when watch is 429", async () => {
    assert.ok(CH_DANCE_VALLEY);
    const adapter = createYoutubeAdapter([CH_DANCE_VALLEY], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-pnzSuCiAGdk");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 35);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 12 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "calvin-harris");
    assert.match(String(sets[0]?.eventName ?? ""), /Dance Valley/i);
  });

  it("lands Bassjackers Great Library TML WE2 from the 1001 seed when watch is 429", async () => {
    assert.ok(BASSJACKERS_TML);
    const adapter = createYoutubeAdapter([BASSJACKERS_TML], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-BG3Lr9EdWVY");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 36);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "bassjackers");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands TUJAMO Parookaville from the 1001 seed when watch is 429", async () => {
    assert.ok(TUJAMO_PAROOKAVILLE);
    const adapter = createYoutubeAdapter([TUJAMO_PAROOKAVILLE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-JhpL-KKGoO8");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 74);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 11 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "tujamo");
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
  });

  it("lands Dillon Francis B2B Marten Horger Parookaville 2025 when watch is 429", async () => {
    assert.ok(DF_MH_PAROOKAVILLE);
    const adapter = createYoutubeAdapter([DF_MH_PAROOKAVILLE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-IwNPc_4ux84");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 32);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "dillon-francis");
    assert.ok(
      sets[0]?.collaborators?.some((c) => c.slug === "marten-horger"),
    );
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
  });

  it("lands Mike Williams Time Lab Parookaville from the 1001 seed when watch is 429", async () => {
    assert.ok(MW_TIME_LAB);
    const adapter = createYoutubeAdapter([MW_TIME_LAB], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-XisbmW1Smgc");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 50);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 56 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "mike-williams");
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
    assert.match(String(sets[0]?.title ?? ""), /Time Lab/i);
  });

  it("lands Hardwell Parookaville from the 1001 seed when watch is 429", async () => {
    assert.ok(HW_PAROOKAVILLE);
    const adapter = createYoutubeAdapter([HW_PAROOKAVILLE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-eBeeWwsCVls");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 63);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 19 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "hardwell");
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
  });

  it("lands DubVision Parookaville from the 1001 seed when watch is 429", async () => {
    assert.ok(DV_PAROOKAVILLE);
    const adapter = createYoutubeAdapter([DV_PAROOKAVILLE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-UETk8HSB0Yw");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 62);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 56 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "dubvision");
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
  });

  it("lands W&W Parookaville from the 1001 seed when watch is 429", async () => {
    assert.ok(WW_PAROOKAVILLE);
    const adapter = createYoutubeAdapter([WW_PAROOKAVILLE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-or_SDolEBfw");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 58);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 11 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "w-w");
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
  });

  it("lands MANDY B2B Negativ Atmosphere TML WE1 from the 1001 seed when watch is 429", async () => {
    assert.ok(MANDY_NEGATIV_TML);
    const adapter = createYoutubeAdapter([MANDY_NEGATIV_TML], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-J7b0G4XX8pg");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 55);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "mandy");
    assert.ok(sets[0]?.collaborators?.some((c) => c.slug === "negitiv"));
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Indira Paganotto Atmosphere TML WE1 2023 from the 1001 seed when watch is 429", async () => {
    assert.ok(INDIRA_TML_2023);
    const adapter = createYoutubeAdapter([INDIRA_TML_2023], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-yPCOu0-JKJo");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 29);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 1 * 3600 + 55 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "indira-paganotto");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands AFROJACK B2B R3HAB TML WE2 from the 1001 seed when watch is 429", async () => {
    assert.ok(AFROJACK_R3HAB_TML);
    const adapter = createYoutubeAdapter([AFROJACK_R3HAB_TML], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-lEIGnx7qLl0");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 54);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "afrojack");
    assert.ok(sets[0]?.collaborators?.some((c) => c.slug === "r3hab"));
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Lucas & Steve B2B Mike Williams DLDK Ziggo from the 1001 seed when watch is 429", async () => {
    assert.ok(DLDK_ZIGGO);
    const adapter = createYoutubeAdapter([DLDK_ZIGGO], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-B1EaMgsf84Q");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 51);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "lucas-steve");
    assert.ok(sets[0]?.collaborators?.some((c) => c.slug === "mike-williams"));
    assert.equal(
      sets[0]?.collaborators?.some((c) => c.slug === "steve"),
      false,
    );
    assert.match(String(sets[0]?.eventName ?? ""), /Don't Let Daddy Know/i);
  });

  it("lands Alesso TML WE1 Mainstage from the 1001 seed when watch is 429", async () => {
    assert.ok(ALESSO_TML_WE1);
    const adapter = createYoutubeAdapter([ALESSO_TML_WE1], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-TidwOi0NMI0");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 42);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "alesso");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands ILLENIUM TML WE1 Great Library from the 1001 seed when watch is 429", async () => {
    assert.ok(ILLENIUM_TML_WE1);
    const adapter = createYoutubeAdapter([ILLENIUM_TML_WE1], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-E1WH0nvaxAw");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 97);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "illenium");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Chase & Status TML WE2 Mainstage from the 1001 seed when watch is 429", async () => {
    assert.ok(CHASE_STATUS_TML_WE2);
    const adapter = createYoutubeAdapter([CHASE_STATUS_TML_WE2], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-jSJEkiV3cCs");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 26);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 56 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "chase-status");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands I Hate Models TML WE1 Freedom Stage from the 1001 seed when watch is 429", async () => {
    assert.ok(I_HATE_MODELS_TML_WE1);
    const adapter = createYoutubeAdapter([I_HATE_MODELS_TML_WE1], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-zMW5SQPS1cY");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 47);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "i-hate-models");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Netsky TML WE1 Freedom Stage from the 1001 seed when watch is 429", async () => {
    assert.ok(NETSKY_TML_WE1);
    const adapter = createYoutubeAdapter([NETSKY_TML_WE1], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-_e1H9pkcjsQ");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 29);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 59 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "netsky");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
  });

  it("lands Oliver Heldens TML WE1 Great Library from the 1001 seed when watch is 429", async () => {
    assert.ok(OLIVER_HELDENS_TML_WE1);
    const adapter = createYoutubeAdapter([OLIVER_HELDENS_TML_WE1], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-2i3XOxbp54U");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 51);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 61 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "oliver-heldens");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
    assert.match(String(sets[0]?.title ?? ""), /2026/);
    assert.doesNotMatch(String(sets[0]?.title ?? ""), /Daybreak/i);
  });

  it("lands Alan Walker TML WE1 2018 from the 1001 seed when watch is 429", async () => {
    assert.ok(ALAN_WALKER_TML_WE1_2018);
    const adapter = createYoutubeAdapter([ALAN_WALKER_TML_WE1_2018], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-xVWs0ti0J90");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 48);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 55 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "alan-walker");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
    assert.match(String(sets[0]?.title ?? ""), /2018/);
  });

  it("lands GORDO TML WE2 2023 from the 1001 seed when watch is 429", async () => {
    assert.ok(GORDO_TML_WE2_2023);
    const adapter = createYoutubeAdapter([GORDO_TML_WE2_2023], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-lopIWBJ0T5I");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 29);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 58 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "gordo");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
    assert.match(String(sets[0]?.title ?? ""), /2023/);
  });

  it("lands Lucas & Steve TML WE2 2024 from the 1001 seed when watch is 429", async () => {
    assert.ok(LUCAS_STEVE_TML_WE2_2024);
    const adapter = createYoutubeAdapter([LUCAS_STEVE_TML_WE2_2024], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-GbG_OFmdPKk");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 61);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 61 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "lucas-steve");
    assert.match(String(sets[0]?.eventName ?? ""), /Tomorrowland/i);
    assert.match(String(sets[0]?.title ?? ""), /2024/);
  });

  it("lands Tape B CarTunes Vol. 5 from the 1001 seed when watch is 429", async () => {
    assert.ok(TAPE_B_CT5);
    const adapter = createYoutubeAdapter([TAPE_B_CT5], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-7_O8N_EJg_c");
    assert.equal(sets[0]!.type, "mix");
    assert.ok(sets[0]!.plays.length >= 35);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "tape-b");
    assert.match(String(sets[0]?.title ?? ""), /CarTunes/i);
  });

  it("lands Vintage Culture Robot Heart 2024 from the 1001 seed when watch is 429", async () => {
    assert.ok(VC_ROBOT_HEART);
    const adapter = createYoutubeAdapter([VC_ROBOT_HEART], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-KbGNocaJDjw");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 26);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 2 * 3600 + 14 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "vintage-culture");
    assert.match(String(sets[0]?.eventName ?? ""), /Robot Heart/i);
  });

  it("lands John Summit Playa Package Mix from the 1001 seed when watch is 429", async () => {
    assert.ok(JOHN_SUMMIT_PLAYA);
    const adapter = createYoutubeAdapter([JOHN_SUMMIT_PLAYA], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-PkWNuf7rtms");
    assert.equal(sets[0]!.type, "mix");
    assert.ok(sets[0]!.plays.length >= 6);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 21 * 60 + 50);
    assert.equal(sets[0]?.primaryArtist?.slug, "john-summit");
    assert.equal(sets[0]?.seriesName, "Experts Only");
    assert.match(String(sets[0]?.eventName ?? ""), /Burning Man/i);
  });

  it("lands BRANDON Parookaville Desert Valley from the 1001 seed when watch is 429", async () => {
    assert.ok(BRANDON_PAROOKAVILLE);
    const adapter = createYoutubeAdapter([BRANDON_PAROOKAVILLE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-AQ6wWT2HaSQ");
    assert.equal(sets[0]!.type, "festival");
    assert.ok(sets[0]!.plays.length >= 37);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.ok(sets[0]!.durationSec >= 57 * 60);
    assert.equal(sets[0]?.primaryArtist?.slug, "brandon");
    assert.match(String(sets[0]?.eventName ?? ""), /Parookaville/i);
    assert.match(String(sets[0]?.title ?? ""), /2024/);
  });

  it("lands Cuebrick Sacré Paris from the official seed when watch is 429", async () => {
    assert.ok(CUEBRICK_SACRE);
    const adapter = createYoutubeAdapter([CUEBRICK_SACRE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-LLJn_gDMG_M");
    assert.equal(sets[0]!.type, "mix");
    assert.equal(sets[0]!.genre, "Techno");
    assert.equal(sets[0]!.plays.length, 0);
    assert.equal(sets[0]?.primaryArtist?.slug, "cuebrick");
    assert.match(String(sets[0]?.eventName ?? ""), /Sacr[eé] Paris/i);
    assert.match(String(sets[0]?.title ?? ""), /Mainstage Techno/i);
  });

  it("lands Austin Kramer UNreleased 139 from the 1001 seed when watch is 429", async () => {
    assert.ok(AUSTIN_UNRELEASED_139);
    const adapter = createYoutubeAdapter([AUSTIN_UNRELEASED_139], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-QLpmLx5JUsg");
    assert.equal(sets[0]!.type, "radio");
    assert.equal(sets[0]!.genre, "House");
    assert.ok(sets[0]!.plays.length >= 19);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.equal(sets[0]?.primaryArtist?.slug, "austin-kramer");
    assert.equal(sets[0]?.seriesName, "UNreleased");
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "unreleased"),
      false,
    );
    assert.match(String(sets[0]?.title ?? ""), /UNreleased/i);
  });

  it("lands Jamie Jones Lost Horizon Festival from the 1001 seed when watch is 429", async () => {
    assert.ok(JAMIE_LOST_HORIZON);
    const adapter = createYoutubeAdapter([JAMIE_LOST_HORIZON], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-U2ZjW_8K3h4");
    assert.equal(sets[0]!.type, "festival");
    assert.equal(sets[0]!.genre, "Tech House");
    assert.ok(sets[0]!.plays.length >= 16);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.equal(sets[0]?.primaryArtist?.slug, "jamie-jones");
    assert.equal(sets[0]?.seriesName, "Beatport Live");
    assert.match(String(sets[0]?.eventName ?? ""), /Lost Horizon Festival/i);
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "beatport-live"),
      false,
    );
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "gas-tower"),
      false,
    );
    assert.match(String(sets[0]?.title ?? ""), /Lost Horizon Festival/i);
  });

  it("lands Skrillex Lollapalooza Chile from the 1001 seed when watch is 429", async () => {
    assert.ok(SKRILLEX_LOLLA_CHILE);
    const adapter = createYoutubeAdapter([SKRILLEX_LOLLA_CHILE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-loD-whuR5zc");
    assert.equal(sets[0]!.type, "festival");
    assert.equal(sets[0]!.genre, "Dubstep");
    assert.ok(sets[0]!.plays.length >= 73);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.equal(sets[0]?.primaryArtist?.slug, "skrillex");
    assert.match(String(sets[0]?.eventName ?? ""), /Lollapalooza Chile/i);
    assert.notEqual(sets[0]?.eventName, "Lollapalooza");
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "banco-de-chile"),
      false,
    );
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "lollapalooza-chile"),
      false,
    );
    assert.match(String(sets[0]?.title ?? ""), /Banco de Chile/i);
  });

  it("lands Chris Stussy Boiler Room Edinburgh from the 1001 seed when watch is 429", async () => {
    assert.ok(STUSSY_BOILER_EDINBURGH);
    const adapter = createYoutubeAdapter([STUSSY_BOILER_EDINBURGH], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-42XFNGZrpaQ");
    assert.equal(sets[0]!.type, "festival");
    assert.equal(sets[0]!.genre, "Tech House");
    assert.ok(sets[0]!.plays.length >= 10);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.equal(sets[0]?.primaryArtist?.slug, "chris-stussy");
    assert.equal(sets[0]?.seriesName, "Boiler Room");
    assert.match(String(sets[0]?.eventName ?? ""), /Boiler Room/i);
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "chris-stassy"),
      false,
    );
    assert.equal(
      (sets[0]?.collaborators ?? []).some((c) => c.slug === "edinburgh"),
      false,
    );
    assert.match(String(sets[0]?.title ?? ""), /Chris Stussy/i);
  });

  it("lands Joris Voorn B2B Korolova Ultra Cove from the 1001 seed when watch is 429", async () => {
    assert.ok(VOORN_KOROLOVA_COVE);
    const adapter = createYoutubeAdapter([VOORN_KOROLOVA_COVE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-FQj71mhobYw");
    assert.equal(sets[0]!.type, "festival");
    assert.equal(sets[0]!.genre, "Melodic Techno");
    assert.ok(sets[0]!.plays.length >= 33);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.equal(sets[0]?.primaryArtist?.slug, "joris-voorn");
    assert.ok(sets[0]?.collaborators?.some((c) => c.slug === "korolova"));
    assert.equal(sets[0]?.seriesName, "Resistance");
    assert.match(String(sets[0]?.eventName ?? ""), /Ultra Music Festival/i);
    assert.match(String(sets[0]?.title ?? ""), /B2B Korolova/i);
  });

  it("lands Colyn B2B Innellea Ultra Cove from the 1001 seed when watch is 429", async () => {
    assert.ok(COLYN_INNELLEA_COVE);
    const adapter = createYoutubeAdapter([COLYN_INNELLEA_COVE], [], [], []);
    const sets = await adapter.fetchRecent();
    assert.equal(sets.length, 1);
    assert.equal(sets[0]!.sourceSlug, "yt-2BPWWYAgUE4");
    assert.equal(sets[0]!.type, "festival");
    assert.equal(sets[0]!.genre, "Melodic Techno");
    assert.ok(sets[0]!.plays.length >= 16);
    assert.ok(sets[0]!.plays.every((p) => p.provenance === "1001tl"));
    assert.equal(sets[0]?.primaryArtist?.slug, "colyn");
    assert.ok(sets[0]?.collaborators?.some((c) => c.slug === "innellea"));
    assert.equal(sets[0]?.seriesName, "Resistance");
    assert.match(String(sets[0]?.eventName ?? ""), /Ultra Music Festival/i);
    assert.match(String(sets[0]?.title ?? ""), /INNELLEA/i);
  });
});
