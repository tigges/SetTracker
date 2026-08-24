import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clockSourceSlices,
  djHealthSlice,
  isChartTouchingSet,
  isDjOnHealthBar,
  placeHealthSlice,
  setListSlice,
  summarizeDjHealth,
  summarizePlaceHealth,
  summarizeSetHealth,
} from "./statsHealth";

const dj = (
  over: Partial<{
    slug: string;
    hasHandle: boolean;
    imageUrl: string | null;
    setCount: number;
    isJunk: boolean;
    isLowSignal: boolean;
  }> = {},
) => ({
  slug: "x",
  hasHandle: true,
  imageUrl: "https://img",
  setCount: 2,
  isJunk: false,
  isLowSignal: false,
  ...over,
});

describe("statsHealth", () => {
  it("keeps junk and no-set DJs off the bar", () => {
    assert.equal(isDjOnHealthBar(dj({ isJunk: true })), false);
    assert.equal(isDjOnHealthBar(dj({ isLowSignal: true })), false);
    assert.equal(isDjOnHealthBar(dj({ setCount: 0 })), false);
    assert.equal(isDjOnHealthBar(dj()), true);
  });

  it("puts handle before artwork so slices do not overlap", () => {
    assert.equal(djHealthSlice(dj({ hasHandle: false, imageUrl: null })), "no_handle");
    assert.equal(djHealthSlice(dj({ hasHandle: true, imageUrl: null })), "no_art");
    assert.equal(djHealthSlice(dj()), "ready");
  });

  it("stars current Top 100 inside each DJ slice", () => {
    const chart = new Set(["chart-ready", "chart-handle"]);
    const out = summarizeDjHealth(
      [
        dj({ slug: "chart-ready" }),
        dj({ slug: "chart-handle", hasHandle: false }),
        dj({ slug: "other-art", imageUrl: null }),
        dj({ slug: "junk", isJunk: true, hasHandle: false }),
      ],
      (slug) => chart.has(slug),
    );
    assert.equal(out.total, 3);
    assert.equal(out.onChart, 2);
    assert.equal(out.slices.find((s) => s.key === "no_handle")?.star, 1);
    assert.equal(out.slices.find((s) => s.key === "no_art")?.count, 1);
    assert.equal(out.slices.find((s) => s.key === "no_art")?.star, 0);
  });

  it("splits places into has a set vs no set", () => {
    assert.equal(placeHealthSlice(3), "has_set");
    assert.equal(placeHealthSlice(0), "no_set");
    const out = summarizePlaceHealth([
      { slug: "tml", setCount: 4, onChart: true },
      { slug: "gap", setCount: 0, onChart: true },
      { slug: "local", setCount: 0, onChart: false },
    ]);
    assert.equal(out.total, 3);
    assert.equal(out.onChart, 2);
    assert.equal(out.slices.find((s) => s.key === "no_set")?.count, 2);
    assert.equal(out.slices.find((s) => s.key === "no_set")?.star, 1);
  });

  it("treats an empty or sparse list as thin", () => {
    assert.equal(setListSlice({ durationSec: 3600, playCount: 0 }), "thin");
    assert.equal(setListSlice({ durationSec: 3600, playCount: 4 }), "thin");
    assert.equal(setListSlice({ durationSec: 3600, playCount: 20 }), "complete");
    assert.equal(
      setListSlice({ durationSec: 600, playCount: 2 }),
      "complete",
      "short uploads are not density work",
    );
  });

  it("marks chart-touching sets (DJ or place)", () => {
    assert.equal(isChartTouchingSet({ top100Rank: 4 }), true);
    assert.equal(isChartTouchingSet({ festivalRank: 1 }), true);
    assert.equal(isChartTouchingSet({ clubRank: 3 }), true);
    assert.equal(isChartTouchingSet({}), false);
    const out = summarizeSetHealth([
      {
        durationSec: 3600,
        playCount: 20,
        playbackUrl: "https://youtube.com/watch?v=a",
        top100Rank: 1,
      },
      {
        durationSec: 3600,
        playCount: 2,
        playbackUrl: null,
        festivalRank: 2,
      },
      { durationSec: 3600, playCount: 18, playbackUrl: "https://sc" },
    ]);
    assert.equal(out.total, 3);
    assert.equal(out.chartTouching, 2);
    assert.equal(out.slices.find((s) => s.key === "thin")?.star, 1);
    assert.equal(out.noPlaybackStar, 1);
  });

  it("groups clock provenance into first-party, fingerprint, and overlays", () => {
    const slices = clockSourceSlices([
      { key: "youtube", count: 10 },
      { key: "soundcloud", count: 4 },
      { key: "fingerprint", count: 6 },
      { key: "1001tl", count: 20 },
      { key: "mixesdb", count: 2 },
      { key: "community", count: 1 },
    ]);
    assert.equal(slices.find((s) => s.key === "first_party")?.count, 14);
    assert.equal(slices.find((s) => s.key === "fingerprint")?.count, 6);
    assert.equal(slices.find((s) => s.key === "overlay")?.count, 22);
    assert.equal(slices.find((s) => s.key === "community")?.count, 1);
  });
});
