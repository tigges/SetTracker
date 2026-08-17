import assert from "node:assert/strict";
import {
  evaluateIsrc,
  heldIdentifyJobs,
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
assert.equal(
  acceptBeatportTrackUrl("https://www.beatport.com/search?q=clarity"),
  undefined,
);

console.log("identify/trackIds.test.ts ok");
