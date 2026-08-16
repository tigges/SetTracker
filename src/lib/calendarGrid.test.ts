import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysCoveredByEditions,
  editionCoversDay,
  editionsInMonth,
  isoUTC,
  monthGrid,
  monthTitle,
  monthsForEditions,
} from "./calendarGrid";

describe("calendarGrid", () => {
  it("builds a Sunday-start August 2026 grid", () => {
    const now = Date.parse("2026-08-16T12:00:00Z");
    const cells = monthGrid(2026, 8, now);
    assert.equal(cells.length % 7, 0);
    assert.equal(cells[0]?.iso, "2026-07-26");
    assert.equal(cells[0]?.inMonth, false);
    const first = cells.find((c) => c.iso === "2026-08-01");
    assert.equal(first?.inMonth, true);
    assert.equal(first?.day, 1);
    assert.equal(cells.find((c) => c.iso === "2026-08-16")?.isToday, true);
    assert.equal(monthTitle(2026, 8), "August 2026");
  });

  it("marks edition spans and lists months that host them", () => {
    const eds = [
      { startsAt: "2026-08-01", endsAt: "2026-08-02" },
      { startsAt: "2026-08-30", endsAt: "2026-09-07" },
    ];
    assert.equal(editionCoversDay(eds[0]!, "2026-08-01"), true);
    assert.equal(editionCoversDay(eds[0]!, "2026-08-03"), false);
    const months = monthsForEditions(eds, Date.parse("2026-08-16T12:00:00Z"));
    assert.deepEqual(
      months.map((m) => `${m.year}-${m.month}`),
      ["2026-8", "2026-9"],
    );
    assert.equal(editionsInMonth(eds, 2026, 9).length, 1);
    assert.ok(daysCoveredByEditions(eds).has("2026-09-01"));
    assert.equal(isoUTC(new Date("2026-08-16T12:00:00Z")), "2026-08-16");
  });
});
