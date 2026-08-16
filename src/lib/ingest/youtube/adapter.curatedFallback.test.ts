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

  it("builds Nicky Romero TML artist Relive meta from the curated 1001 capture", () => {
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
    assert.ok(sets[0]!.plays.length >= 27);
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

  it("lands Nicky Romero TML artist Relive from the 1001 seed when watch is 429", async () => {
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
});
