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
assert.ok(
  scoreCaptureNeed({ ...recentEmpty, editionGap: true }, now) >
    scoreCaptureNeed(recentEmpty, now),
  "edition-gap rows get a capture boost",
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
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-zHAUZ02aCwo", title: "Alok WE2 | Tomorrowland 2026" }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-knJyJPP45dg",
      title: "Vintage Culture Live at EDC Las Vegas, Neon Garden (Club Space)",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-kmMYCg-igjc",
      title: "Vintage Culture live @ Só Track Boa Festival, Brasil 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-OVex0rm7ZR4",
      title: "Vintage Culture @ Pacha Ibiza, Affairs (2026)",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-6bJZPDKlq7o",
      title: "Vintage Culture @ Sunset Yacht Party - New York City 2023",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-OXwK0CSmXzY",
      title: "Hardwell On Air 527 YEARMIX 2025",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-hardwell-hardwell-on-air-527-yearmix",
      title: "Hardwell On Air 527 YEARMIX 2025",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-i-mFuxbGHzg",
      title: "Reinier Zonneveld | Awakenings Festival 2025",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-jamie-jones-hot-robot-radio-225",
      title: "Hot Robot Radio 225",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-jamie-jones-hot-robot-radio-239",
      title: "Hot Robot Radio 239",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024",
      title: "Vintage Culture b2b Arodes at Burning Man 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-SeKRNa26kug",
      title: "Vintage Culture b2b Arodes at Burning Man 2024, Black Rock City",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-soEFl73peVA",
      title: "Joel Corry Epic Rooftop Set From Edge NYC",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-joelcorry-edgenyc",
      title: "Joel Corry Live @ Edge NYC",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-Rgx-wT9FDaE",
      title: "Protocol Radio 731 by Nicky Romero (PRR731)",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-sashaofficial-sasha-eclipse-mix-12-8-26",
      title: "Sasha Eclipse Mix 12/8/26",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-0-s_qZRWElA",
      title: "Miss Monique @ Ibiza Yacht Sunset '26",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-blP5J6BUG0M",
      title: "PRISMATIC by Tiësto 032",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-yTRvLrtsM9I",
      title: "Spectrum Radio 485 Joris Voorn | Brno,Czech Republic",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-B05MAbsCOLA",
      title: "Nicky Romero LIVE at Tomorrowland 2026 - Mainstage",
      type: "festival",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-phWKhIwgiTo",
      title: "Group Therapy 690 with Above & Beyond and Estiva",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);

console.log("nextCaptures.queue.test.ts ok");
