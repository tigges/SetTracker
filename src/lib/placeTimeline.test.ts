import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  comparePlaceNights,
  comparePlaceSetTimes,
  placeNightsHeading,
  sortPlaceNights,
} from "./placeTimeline";

const NOW = Date.parse("2026-08-18T12:00:00Z");

describe("placeTimeline", () => {
  it("labels the night list from what is actually on the bill", () => {
    assert.equal(
      placeNightsHeading([{ bucket: "recent" }, { bucket: "recent" }]),
      "Just ended",
    );
    assert.equal(
      placeNightsHeading([{ bucket: "upcoming" }, { bucket: "recent" }]),
      "Upcoming nights",
    );
    assert.equal(
      placeNightsHeading([{ bucket: "current" }, { bucket: "upcoming" }]),
      "On now",
    );
  });

  it("orders nights on now, then upcoming forward, then just ended backward", () => {
    const sorted = sortPlaceNights([
      { startsAt: "2026-08-06", bucket: "recent", id: "aug6" },
      { startsAt: "2026-08-23", bucket: "upcoming", id: "aug23" },
      { startsAt: "2026-08-17", bucket: "recent", id: "aug17" },
      { startsAt: "2026-08-18", bucket: "current", id: "aug18" },
      { startsAt: "2026-08-20", bucket: "upcoming", id: "aug20" },
    ]);
    assert.deepEqual(
      sorted.map((n) => n.id),
      ["aug18", "aug20", "aug23", "aug17", "aug6"],
    );
    assert.ok(
      comparePlaceNights(
        { startsAt: "2026-08-17", bucket: "recent" },
        { startsAt: "2026-08-06", bucket: "recent" },
      ) < 0,
    );
  });

  it("orders Relives today, then upcoming, then latest finished first", () => {
    const items = [
      { publishedAt: "2025-07-26T00:00:00.000Z", id: "2025" },
      { publishedAt: "2026-08-20T00:00:00.000Z", id: "future" },
      { publishedAt: "2026-08-15T00:00:00.000Z", id: "3d" },
      { publishedAt: "2026-08-18T00:00:00.000Z", id: "today" },
      { publishedAt: "2023-08-01T00:00:00.000Z", id: "2023" },
    ];
    const sorted = [...items].sort((a, b) => comparePlaceSetTimes(a, b, NOW));
    assert.deepEqual(
      sorted.map((s) => s.id),
      ["today", "future", "3d", "2025", "2023"],
    );
  });
});
