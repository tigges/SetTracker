import assert from "node:assert/strict";
import {
  catalogRowNeedsSpotifyFill,
  evaluateIsrc,
  exportRowsToIdentifyQueue,
  exportRowsToSpotifyQueue,
  heldIdentifyJobs,
  identifyLookupPlan,
  mergeIdentifyQueue,
  splitEnrichPriorities,
  takeSpotifyFillRows,
  trackIdWriteFields,
  uniqueIdentifyRows,
} from "./trackIds";
import { isPasteOnlyIdentifyUrl } from "./pasteOnly";
import { acceptBeatportTrackUrl } from "./beatport";
import {
  TL_COLE_TERRAZAS_HARD_SUMMER_2026,
  TL_KNOCK2_ZEDD_HARD_SUMMER_2026,
} from "../tracklists1001/seeds";
import { isWiredTracklistSlug } from "../tracklists1001/seeds";

assert.equal(evaluateIsrc("USUM71502634").ok, true);
assert.equal(evaluateIsrc("usum71502634").isrc, "USUM71502634");
assert.equal(evaluateIsrc("US-UM7-15-02634").isrc, "USUM71502634");
assert.equal(evaluateIsrc("not-an-isrc").ok, false);
assert.equal(evaluateIsrc("").ok, false);

const unique = uniqueIdentifyRows(TL_KNOCK2_ZEDD_HARD_SUMMER_2026);
assert.ok(unique.length < TL_KNOCK2_ZEDD_HARD_SUMMER_2026.length);
assert.ok(unique.some((r) => r.title === "Niteharts 2025 Intro"));
assert.equal(
  unique.some((r) => /^id$/i.test(r.title)),
  false,
);

const jobs = heldIdentifyJobs();
assert.ok(jobs.some((j) => j.seed === "TL_KNOCK2_ZEDD_HARD_SUMMER_2026"));
assert.ok(jobs.some((j) => j.seed === "TL_COLE_TERRAZAS_HARD_SUMMER_2026"));
assert.equal(uniqueIdentifyRows(TL_COLE_TERRAZAS_HARD_SUMMER_2026).length, 6);
assert.equal(isWiredTracklistSlug("yt-6DC3xoQF4Zs"), false);
assert.equal(isPasteOnlyIdentifyUrl("https://audioscout.io/x"), true);

const queued = mergeIdentifyQueue(
  [
    { at: "0:00", artist: "Held", title: "One" },
    { at: "1:00", artist: "Held", title: "Two" },
    { at: "2:00", artist: "Held", title: "Three" },
  ],
  [
    { at: "0:00", artist: "Held", title: "One" },
    { at: "0:00", artist: "Catalog", title: "Hot" },
    { at: "0:00", artist: "Catalog", title: "Also" },
  ],
  { limit: 3, heldCap: 2 },
);
assert.equal(queued.length, 3);
assert.equal(queued[0]?.title, "One");
assert.equal(queued[1]?.title, "Two");
assert.equal(queued[2]?.artist, "Catalog");
assert.equal(queued[2]?.title, "Hot");

const withFp = mergeIdentifyQueue(
  [{ at: "0:00", artist: "Held", title: "One" }],
  [
    { at: "0:00", artist: "Catalog", title: "Hot" },
    { at: "0:00", artist: "Catalog", title: "Also" },
  ],
  {
    limit: 4,
    heldCap: 1,
    fingerprintCap: 2,
    fingerprint: [
      { at: "0:00", artist: "ACR", title: "Hit" },
      { at: "0:00", artist: "Held", title: "One" },
      { at: "0:00", artist: "ACR", title: "Second" },
    ],
  },
);
assert.deepEqual(
  withFp.map((r) => r.title),
  ["One", "Hit", "Second", "Hot"],
);
assert.equal(
  acceptBeatportTrackUrl("https://www.beatport.com/search?q=clarity"),
  undefined,
);

const fromExport = exportRowsToIdentifyQueue(
  [
    {
      slug: "zz-test-enrich-queue-hot",
      artist: "Catalog",
      title: "Hot Track",
      mix: null,
      remixer: null,
      genre: "House",
      plays: 12,
      isrc: "USUM70000000",
      beatportUrl: null,
      spotifyUrl: null,
    },
    {
      slug: "convex-id",
      artist: "Convex",
      title: "ID",
      mix: null,
      remixer: null,
      genre: "House",
      plays: 99,
      isrc: null,
      beatportUrl: null,
      spotifyUrl: null,
    },
    {
      slug: "zz-test-enrich-queue-done",
      artist: "Done",
      title: "Already",
      mix: null,
      remixer: null,
      genre: "House",
      plays: 20,
      isrc: "USUM70000001",
      beatportUrl: "https://www.beatport.com/track/already/1",
      spotifyUrl: null,
    },
  ],
  10,
);
assert.equal(
  fromExport.some((r) => r.slug === "zz-test-enrich-queue-hot"),
  true,
);
assert.equal(
  fromExport.some((r) => r.slug === "convex-id" || r.title === "ID"),
  false,
);
assert.equal(
  fromExport.some((r) => r.slug === "zz-test-enrich-queue-done"),
  false,
);

assert.equal(identifyLookupPlan({ at: "0:00", artist: "A", title: "B" }).useDeezer, true);
assert.equal(identifyLookupPlan({ at: "0:00", artist: "A", title: "B" }).mbByIsrc, false);
assert.deepEqual(
  identifyLookupPlan({
    at: "0:00",
    artist: "A",
    title: "B",
    isrc: "NLZ542600064",
  }),
  {
    knownIsrc: "NLZ542600064",
    needIsrc: false,
    needBeatport: true,
    needSpotify: true,
    useDeezer: false,
    useAudd: false,
    mbByIsrc: true,
  },
);
assert.deepEqual(
  identifyLookupPlan({
    at: "0:00",
    artist: "A",
    title: "B",
    isrc: "NLZ542600064",
    beatportUrl: "https://www.beatport.com/track/already/1",
    spotifyUrl: "https://open.spotify.com/search/Already",
  }),
  {
    knownIsrc: "NLZ542600064",
    needIsrc: false,
    needBeatport: false,
    needSpotify: true,
    useDeezer: false,
    useAudd: false,
    mbByIsrc: true,
  },
);

const split = splitEnrichPriorities(
  [
    {
      slug: "no-isrc-hot",
      artist: "A",
      title: "Hot",
      mix: null,
      remixer: null,
      genre: null,
      plays: 9,
      isrc: null,
      beatportUrl: null,
      spotifyUrl: null,
    },
    {
      slug: "has-isrc-no-bp",
      artist: "B",
      title: "Also",
      mix: null,
      remixer: null,
      genre: null,
      plays: 8,
      isrc: "NLZ542600064",
      beatportUrl: null,
      spotifyUrl: null,
    },
  ],
  2,
);
assert.equal(split[0]?.slug, "no-isrc-hot");
assert.equal(split[1]?.slug, "has-isrc-no-bp");

assert.equal(
  catalogRowNeedsSpotifyFill({
    isrc: "USUM70000001",
    spotifyUrl: "https://open.spotify.com/search/Already",
  }),
  true,
);
assert.equal(
  catalogRowNeedsSpotifyFill({
    isrc: "USUM70000001",
    spotifyUrl: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
  }),
  false,
);
assert.equal(catalogRowNeedsSpotifyFill({ isrc: null, spotifyUrl: null }), false);

const spotifyQueue = exportRowsToSpotifyQueue(
  [
    {
      slug: "zz-test-enrich-queue-hot",
      artist: "Catalog",
      title: "Hot Track",
      mix: null,
      remixer: null,
      genre: "House",
      plays: 12,
      isrc: "USUM70000000",
      beatportUrl: null,
      spotifyUrl: null,
    },
    {
      slug: "zz-test-enrich-queue-done",
      artist: "Done",
      title: "Already",
      mix: null,
      remixer: null,
      genre: "House",
      plays: 20,
      isrc: "USUM70000001",
      beatportUrl: "https://www.beatport.com/track/already/1",
      spotifyUrl: "https://open.spotify.com/search/Already",
    },
    {
      slug: "convex-id",
      artist: "Convex",
      title: "ID",
      mix: null,
      remixer: null,
      genre: "House",
      plays: 99,
      isrc: null,
      beatportUrl: null,
      spotifyUrl: null,
    },
  ],
  10,
);
assert.equal(
  spotifyQueue.some((r) => r.slug === "zz-test-enrich-queue-done"),
  true,
);
assert.equal(
  spotifyQueue.some((r) => r.slug === "zz-test-enrich-queue-hot"),
  true,
);
assert.equal(
  spotifyQueue.some((r) => r.slug === "convex-id" || r.title === "ID"),
  false,
);
assert.equal(
  takeSpotifyFillRows(
    [
      {
        at: "0:00",
        artist: "Done",
        title: "Already",
        slug: "zz-test-enrich-queue-done",
        isrc: "USUM70000001",
        spotifyUrl: null,
      },
    ],
    10,
    new Set(["zz-test-enrich-queue-done"]),
  ).length,
  0,
);

assert.deepEqual(
  trackIdWriteFields(
    {
      isrc: "USUM70000001",
      beatportUrl: "https://www.beatport.com/search?q=already",
      spotifyUrl: "https://open.spotify.com/search/Already",
    },
    {
      beatportUrl: "https://www.beatport.com/track/already/1",
      spotifyUrl: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
    },
  ),
  {
    beatportUrl: "https://www.beatport.com/track/already/1",
    spotifyUrl: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
  },
);
assert.deepEqual(
  trackIdWriteFields(
    {
      isrc: "USUM70000001",
      beatportUrl: "https://www.beatport.com/track/already/1",
      spotifyUrl: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
    },
    {
      isrc: "USUM70000099",
      beatportUrl: "https://www.beatport.com/track/other/2",
      spotifyUrl: "https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P",
    },
  ),
  {},
);

console.log("identify/trackIds.test.ts ok");
