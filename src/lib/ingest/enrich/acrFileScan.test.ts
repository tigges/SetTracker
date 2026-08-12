import assert from "node:assert/strict";
import {
  fileScanConfig,
  parseScanHits,
  youtubeWatchUrl,
} from "./acrFileScan";

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

console.log("acrFileScan.test.ts ok");
