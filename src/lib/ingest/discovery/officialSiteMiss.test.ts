import assert from "node:assert/strict";
import {
  isFreshOfficialSiteMissRow,
  officialSiteMissClear,
  officialSiteMissForced,
  officialSiteMissIsFresh,
  officialSiteMissKey,
  officialSiteMissRecord,
  officialSiteMissTtlDays,
  resetOfficialSiteMissCacheForTests,
} from "./officialSiteMiss";

assert.equal(officialSiteMissKey("dj", "kaaze"), "dj:kaaze");
assert.equal(officialSiteMissTtlDays({}), 21);
assert.equal(officialSiteMissTtlDays({ OFFICIAL_SITE_MISS_TTL_DAYS: "14" }), 14);
assert.equal(officialSiteMissForced({}), false);
assert.equal(officialSiteMissForced({ DJMAG_ENRICH_FORCE: "1" }), true);

const now = new Date("2026-08-25T12:00:00.000Z");
assert.equal(
  isFreshOfficialSiteMissRow(
    { checkedAt: "2026-08-20T12:00:00.000Z", source: "wikidata", kind: "dj" },
    now,
    21,
  ),
  true,
);
assert.equal(
  isFreshOfficialSiteMissRow(
    { checkedAt: "2026-07-01T12:00:00.000Z", source: "wikidata", kind: "dj" },
    now,
    21,
  ),
  false,
);

resetOfficialSiteMissCacheForTests();
assert.equal(officialSiteMissIsFresh("dj", "kaaze", { now }), false);
officialSiteMissRecord("dj", "kaaze", "wikidata", now);
assert.equal(officialSiteMissIsFresh("dj", "kaaze", { now }), true);
assert.equal(
  officialSiteMissIsFresh("dj", "kaaze", {
    now,
    env: { DJMAG_ENRICH_FORCE: "1" },
  }),
  false,
);
officialSiteMissClear("dj", "kaaze");
assert.equal(officialSiteMissIsFresh("dj", "kaaze", { now }), false);

console.log("officialSiteMiss.test.ts ok");
