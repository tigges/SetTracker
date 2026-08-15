import assert from "node:assert/strict";
import {
  buildCaptureQueueFromNeeds,
  scoreCaptureNeed,
  skipCaptureNeed,
  type CaptureNeedRow,
} from "./nextCaptures";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";

const now = Date.parse("2026-08-15T01:00:00Z");

function row(partial: Partial<CaptureNeedRow> & Pick<CaptureNeedRow, "slug" | "title">): CaptureNeedRow {
  return {
    primaryDj: "Test DJ",
    type: "festival",
    publishedAt: "2026-08-01T00:00:00Z",
    durationSec: 60 * 60,
    playCount: 2,
    plays1001: 0,
    identifiedStrong: 0,
    top100Rank: null,
    isFestival: true,
    festivalSeason: true,
    density: "severe",
    ...partial,
  };
}

const mapped = new Set(Object.keys(TRACKLIST_1001_BY_SOURCE_SLUG));

assert.equal(
  skipCaptureNeed(row({ slug: "yt-hgbAN8NFNu0", title: "Aoki Friendship Mix" }), mapped, now),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-short1", title: "Freedom Stage Shorts", durationSec: 90 }),
    mapped,
    now,
  ),
  "short",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-oldradio",
      title: "Old radio 2017",
      type: "radio",
      isFestival: false,
      festivalSeason: false,
      publishedAt: "2017-03-01T00:00:00Z",
      density: "ok",
      playCount: 20,
    }),
    mapped,
    now,
  ),
  "stale",
);

const recentEmpty = row({
  slug: "yt-recent-empty",
  title: "Someone WE1 | Tomorrowland 2026",
  eventSlug: "tomorrowland",
  playCount: 0,
  density: "severe",
});
const oldGuetta = row({
  slug: "yt-old-guetta",
  title: "David Guetta Ultra 2017",
  primaryDj: "David Guetta",
  eventSlug: "ultra-miami",
  publishedAt: "2017-03-24T00:00:00Z",
  festivalSeason: false,
  top100Rank: 2,
  playCount: 3,
  density: "severe",
});
assert.ok(
  scoreCaptureNeed(recentEmpty, now) > scoreCaptureNeed(oldGuetta, now),
  "recent TML gap must outrank a 2017 Ultra leftover",
);

const queue = buildCaptureQueueFromNeeds([oldGuetta, recentEmpty], {
  limit: 10,
  nowMs: now,
});
assert.equal(queue[0]?.slug, "yt-recent-empty");
assert.ok(!queue.some((p) => p.slug === "yt-hgbAN8NFNu0"));
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-NTLDGnoWIRg", title: "Men Machine Exclusive Mix" }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-bxb6Tglooc4", title: "ASOT 1290" }),
    mapped,
    now,
  ),
  "mapped",
);

console.log("nextCaptures.queue.test.ts ok");
