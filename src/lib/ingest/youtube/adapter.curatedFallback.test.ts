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
});
