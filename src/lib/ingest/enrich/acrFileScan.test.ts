import assert from "node:assert/strict";
import {
  fileScanConfig,
  isHeldFileScanTarget,
  parseScanHits,
  youtubeFileScanQueue,
  youtubeWatchUrl,
} from "./acrFileScan";
import type { SparseSetCandidate } from "./acrcloud";

// --- youtubeWatchUrl ---
assert.equal(
  youtubeWatchUrl("yt-IP9v-2nEA2E"),
  "https://www.youtube.com/watch?v=IP9v-2nEA2E",
);
assert.equal(
  youtubeWatchUrl("https://www.youtube.com/watch?v=IP9v-2nEA2E"),
  "https://www.youtube.com/watch?v=IP9v-2nEA2E",
);
assert.equal(youtubeWatchUrl("sc-foo-bar"), null);
assert.equal(youtubeWatchUrl("https://soundcloud.com/x/y"), null);

// --- config gating ---
const savedToken = process.env.ACRCLOUD_FS_TOKEN;
const savedContainer = process.env.ACRCLOUD_FS_CONTAINER_ID;
const savedRegion = process.env.ACRCLOUD_FS_REGION;
delete process.env.ACRCLOUD_FS_TOKEN;
delete process.env.ACRCLOUD_FS_CONTAINER_ID;
assert.equal(fileScanConfig(), null, "unconfigured → null");

process.env.ACRCLOUD_FS_TOKEN = "tok";
process.env.ACRCLOUD_FS_CONTAINER_ID = "10005";
process.env.ACRCLOUD_FS_REGION = "us-west-2";
const cfg = fileScanConfig();
assert.ok(cfg);
assert.equal(cfg!.base, "https://api-us-west-2.acrcloud.com");
assert.equal(cfg!.containerId, "10005");
// restore
if (savedToken == null) delete process.env.ACRCLOUD_FS_TOKEN;
else process.env.ACRCLOUD_FS_TOKEN = savedToken;
if (savedContainer == null) delete process.env.ACRCLOUD_FS_CONTAINER_ID;
else process.env.ACRCLOUD_FS_CONTAINER_ID = savedContainer;
if (savedRegion == null) delete process.env.ACRCLOUD_FS_REGION;
else process.env.ACRCLOUD_FS_REGION = savedRegion;

// --- parseScanHits (shape mirrors File Scanning /files result) ---
const file = {
  state: 1,
  results: {
    music: [
      {
        offset: 30,
        result: {
          title: "Love Hurts",
          score: 100,
          artists: [{ name: "Incubus" }],
          external_ids: { isrc: "USSM10312757" },
        },
      },
      {
        offset: 14,
        result: {
          title: "my ex called",
          score: 40, // below min → dropped
          artists: [{ name: "Someone" }],
        },
      },
      {
        offset: 0,
        result: {
          title: "Millones",
          score: 100,
          artists: [{ name: "Camilo" }],
        },
      },
    ],
  },
};
const hits = parseScanHits(file, 55);
assert.equal(hits.length, 2, "score-40 hit filtered out");
// sorted by offset
assert.equal(hits[0]!.offsetSec, 0);
assert.equal(hits[0]!.hit.title, "Millones");
assert.equal(hits[1]!.offsetSec, 30);
assert.equal(hits[1]!.hit.artist, "Incubus");
assert.equal(hits[1]!.hit.isrc, "USSM10312757");

// omitted score (File Scanning docs: score is optional) still counts
const noScore = parseScanHits(
  {
    results: {
      music: [
        {
          offset: 0,
          result: {
            title: "Never Gonna Give You Up",
            artists: [{ name: "Rick Astley" }],
          },
        },
      ],
    },
  },
  55,
);
assert.equal(noScore.length, 1);
assert.equal(noScore[0]!.hit.score, 100);
assert.equal(noScore[0]!.hit.artist, "Rick Astley");

// string score + artists string
const stringy = parseScanHits(
  {
    results: {
      music: [
        {
          offset: 12,
          result: {
            title: "Hello",
            artists: "Adele",
            score: "92",
          },
        },
      ],
    },
  },
  55,
);
assert.equal(stringy.length, 1);
assert.equal(stringy[0]!.hit.score, 92);
assert.equal(stringy[0]!.hit.artist, "Adele");

// result as JSON string
const asJson = parseScanHits(
  {
    results: {
      music: [
        {
          offset: 0,
          result: JSON.stringify({
            title: "Millones",
            score: 100,
            artists: [{ name: "Camilo" }],
          }),
        },
      ],
    },
  },
  55,
);
assert.equal(asJson.length, 1);
assert.equal(asJson[0]!.hit.title, "Millones");

// flattened row (title on the music item, no nested result)
const flat = parseScanHits(
  {
    results: {
      music: [
        {
          offset: 5,
          title: "Efecto",
          artists: [{ name: "Bad Bunny" }],
          score: 88,
        },
      ],
    },
  },
  55,
);
assert.equal(flat.length, 1);
assert.equal(flat[0]!.offsetSec, 5);
assert.equal(flat[0]!.hit.artist, "Bad Bunny");

function fsCand(
  partial: Partial<SparseSetCandidate> & Pick<SparseSetCandidate, "id">,
): SparseSetCandidate {
  return {
    slug: partial.id,
    playbackUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    durationSec: 3600,
    host: "youtube",
    identifiedStrong: 0,
    playCount: 0,
    unresolvedCount: 0,
    popularityRank: 999,
    homepageBoost: 0,
    eventBoost: 0,
    densitySeverity: "severe",
    publishedAtMs: 0,
    ...partial,
  };
}

assert.equal(
  isHeldFileScanTarget({ primaryDjSlug: "calvin-harris" }),
  true,
  "held DJ slug",
);
assert.equal(
  isHeldFileScanTarget({ title: "Chris Lorenzo | Tomorrowland Weekend 2" }),
  true,
  "held title",
);
assert.equal(
  isHeldFileScanTarget({ primaryDjSlug: "holy-priest" }),
  true,
);
assert.equal(
  isHeldFileScanTarget({ primaryDjSlug: "martin-garrix" }),
  false,
);
assert.equal(
  isHeldFileScanTarget({ title: "Alesso | Tomorrowland Relive" }),
  false,
);

// Identify ranking puts SC first; a mixed slice would drop YT. File Scanning
// must filter YouTube before slicing so Relives still enter the queue.
const mixedCrowd = [
  ...Array.from({ length: 80 }, (_, i) =>
    fsCand({
      id: `sc-radio-${i}`,
      host: "soundcloud",
      playbackUrl: "https://soundcloud.com/x/y",
    }),
  ),
  fsCand({ id: "yt-BUsCIK_kh_A", slug: "yt-BUsCIK_kh_A" }),
  fsCand({ id: "yt-1lqmFLr-SkA", slug: "yt-1lqmFLr-SkA" }),
  fsCand({
    id: "yt-held",
    slug: "yt-heldfanclip1",
    primaryDjSlug: "calvin-harris",
    title: "Calvin Harris Tomorrowland WE2",
  }),
  fsCand({ id: "yt-fhiZ1Rj9o-A", slug: "yt-fhiZ1Rj9o-A" }),
];
const queue = youtubeFileScanQueue(mixedCrowd, 15);
assert.deepEqual(
  queue.map((c) => c.slug),
  ["yt-BUsCIK_kh_A", "yt-1lqmFLr-SkA", "yt-fhiZ1Rj9o-A"],
);
assert.equal(
  queue.some((c) => c.host !== "youtube"),
  false,
);
assert.equal(
  queue.some((c) => c.primaryDjSlug === "calvin-harris"),
  false,
);

const capped = youtubeFileScanQueue(
  [
    fsCand({ id: "yt-aaaaaaa1111", slug: "yt-aaaaaaa1111" }),
    fsCand({ id: "yt-bbbbbbb2222", slug: "yt-bbbbbbb2222" }),
    fsCand({ id: "yt-ccccccc3333", slug: "yt-ccccccc3333" }),
  ],
  2,
);
assert.equal(capped.length, 2);
assert.equal(youtubeFileScanQueue(mixedCrowd, 0).length, 0);

console.log("acrFileScan.test.ts ok");
