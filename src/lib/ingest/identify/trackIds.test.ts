import assert from "node:assert/strict";
import {
  evaluateIsrc,
  exportRowsToIdentifyQueue,
  heldIdentifyJobs,
  mergeIdentifyQueue,
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

console.log("identify/trackIds.test.ts ok");
