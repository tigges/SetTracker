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
});
