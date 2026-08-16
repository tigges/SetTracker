import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bucketVenueNight, parseJsonStringList } from "./board";

describe("venue calendar board", () => {
  it("buckets a night relative to now", () => {
    const now = Date.parse("2026-08-16T12:00:00Z");
    assert.equal(bucketVenueNight("2026-08-16", "2026-08-16", now), "current");
    assert.equal(bucketVenueNight("2026-09-18", "2026-09-18", now), "upcoming");
    assert.equal(bucketVenueNight("2026-08-01", "2026-08-01", now), "recent");
    assert.equal(bucketVenueNight("2025-01-01", "2025-01-01", now), "past");
  });

  it("parses artist JSON lists", () => {
    assert.deepEqual(parseJsonStringList('["Carl Cox","FISHER"]'), [
      "Carl Cox",
      "FISHER",
    ]);
    assert.deepEqual(parseJsonStringList(null), []);
  });
});
