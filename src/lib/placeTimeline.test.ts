import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  comparePlaceNights,
  comparePlaceSetTimes,
  dateConflictsTitle,
  groupPlaceSetsByYear,
  parseDateFromSetTitle,
  placeNightsHeading,
  setBandYear,
  sortPlaceNights,
  sortPlaceSets,
  titleCalendarHint,
} from "./placeTimeline";

const NOW = Date.parse("2026-08-18T12:00:00Z");

describe("placeTimeline", () => {
  it("reads a calendar day from titles and 1001 URLs", () => {
    const now = Date.parse("2026-08-20T12:00:00Z");
    assert.equal(
      parseDateFromSetTitle("HoneyLuv @ ANTS Ushuaïa Ibiza 2026-06-17", now)?.toISOString(),
      "2026-06-17T00:00:00.000Z",
    );
    assert.equal(
      parseDateFromSetTitle(
        "https://www.1001tracklists.com/tracklist/2787514k/chris-stassy-boiler-room-edinburgh-united-kingdom-2024-05-19.html",
        now,
      )?.toISOString(),
      "2024-05-19T00:00:00.000Z",
    );
    assert.equal(
      parseDateFromSetTitle("Deborah de Luca - Zurich Street Parade 2025", now),
      null,
    );
    assert.equal(
      parseDateFromSetTitle("Chris Stussy | Boiler Room: Edinburgh", now),
      null,
    );
  });

  it("reads August, 2026 as a month hint, not a night", () => {
    assert.deepEqual(
      titleCalendarHint(
        "Tomorrowland Friendship Mix with Topic - August, 2026",
        NOW,
      ),
      { year: 2026, month: 8 },
    );
    assert.equal(
      parseDateFromSetTitle(
        "Tomorrowland Friendship Mix with Topic - August, 2026",
        NOW,
      ),
      null,
    );
    assert.equal(
      dateConflictsTitle(
        "2026-07-26T23:59:59Z",
        "Tomorrowland Friendship Mix with Topic - August, 2026",
        NOW,
      ),
      true,
    );
    assert.equal(
      dateConflictsTitle(
        "2026-08-20T00:00:00Z",
        "Tomorrowland Friendship Mix with Topic - August, 2026",
        NOW,
      ),
      false,
    );
    assert.equal(
      dateConflictsTitle(
        "2026-07-18T00:00:00Z",
        "Steve Angello WE1 | Tomorrowland 2026",
        NOW,
      ),
      false,
    );
  });

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

  it("orders playbacks today, then upcoming, then latest finished first", () => {
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

  it("bands a remapped 2018 title onto 2018, not the 2026 edition", () => {
    assert.equal(
      setBandYear(
        {
          title: "Alan Walker | Tomorrowland Belgium 2018",
          publishedAt: "2026-08-01T00:00:00.000Z",
          performedAt: "2026-07-18T00:00:00.000Z",
        },
        NOW,
      ),
      2018,
    );
    assert.equal(
      setBandYear(
        {
          title: "Lost Frequencies | Tomorrowland 2024",
          publishedAt: "2026-08-18T00:00:00.000Z",
        },
        NOW,
      ),
      2024,
    );
    assert.equal(
      setBandYear(
        { title: "Main Stage — Weekend 1", publishedAt: "2026-07-20T00:00:00.000Z" },
        NOW,
      ),
      2026,
    );
  });

  it("groups place sets into year bands and keeps 2018 out of 2026", () => {
    const bands = groupPlaceSetsByYear(
      [
        {
          id: "walker-2018",
          title: "Alan Walker | Tomorrowland Belgium 2018",
          publishedAt: "2026-08-01T00:00:00.000Z",
          performedAt: "2026-07-18T00:00:00.000Z",
        },
        {
          id: "today",
          title: "Alok | Tomorrowland 2026",
          publishedAt: "2026-08-18T00:00:00.000Z",
        },
        {
          id: "future",
          title: "Amelie Lens | Tomorrowland 2026",
          publishedAt: "2026-08-20T00:00:00.000Z",
        },
        {
          id: "done",
          title: "Charlotte de Witte | Tomorrowland 2026",
          publishedAt: "2026-08-15T00:00:00.000Z",
        },
        {
          id: "garrix-2025",
          title: "Martin Garrix | Tomorrowland 2025",
          publishedAt: "2025-07-26T00:00:00.000Z",
        },
        {
          id: "older-2025",
          title: "FISHER | Tomorrowland 2025",
          publishedAt: "2025-07-18T00:00:00.000Z",
        },
      ],
      NOW,
    );
    assert.deepEqual(
      bands.map((b) => ({ year: b.year, current: b.current, ids: b.sets.map((s) => s.id) })),
      [
        { year: 2026, current: true, ids: ["today", "future", "done"] },
        { year: 2025, current: false, ids: ["garrix-2025", "older-2025"] },
        { year: 2018, current: false, ids: ["walker-2018"] },
      ],
    );
    assert.deepEqual(
      sortPlaceSets(bands.flatMap((b) => b.sets), NOW).map((s) => s.id),
      ["today", "future", "done", "garrix-2025", "older-2025", "walker-2018"],
    );
  });

  it("uses completeness only as a same-day tie-break inside a band", () => {
    const bands = groupPlaceSetsByYear(
      [
        {
          id: "thin",
          title: "Thin | Tomorrowland 2025",
          publishedAt: "2025-07-26T00:00:00.000Z",
        },
        {
          id: "full",
          title: "Full | Tomorrowland 2025",
          publishedAt: "2025-07-26T00:00:00.000Z",
        },
        {
          id: "newer-empty",
          title: "Empty | Tomorrowland 2025",
          publishedAt: "2025-07-27T00:00:00.000Z",
        },
      ],
      NOW,
      (s) => (s.id === "full" ? 0 : 1),
    );
    assert.deepEqual(
      bands[0]?.sets.map((s) => s.id),
      ["newer-empty", "full", "thin"],
    );
  });
});
