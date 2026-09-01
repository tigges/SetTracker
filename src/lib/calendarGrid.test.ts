import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysCoveredByEditions,
  editionCoversDay,
  editionsInMonth,
  isoUTC,
  monthGrid,
  monthTitle,
  monthSectionId,
  monthsForEditions,
  partitionCalendarMonths,
} from "./calendarGrid";
import {
  calendarPillClass,
  dedupeDayPills,
  groupMonthLocations,
  mergeLocationBucket,
  occurrencesOnDay,
  nextClubNight,
  toCalendarOccurrences,
  venueShortName,
} from "./calendarLocations";

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

  it("opens the current month first and parks earlier months", () => {
    const now = Date.parse("2026-09-01T12:00:00Z");
    const months = monthsForEditions(
      [
        { startsAt: "2026-07-30", endsAt: "2026-08-02" },
        { startsAt: "2026-08-30", endsAt: "2026-09-07" },
      ],
      now,
    );
    const parts = partitionCalendarMonths(months, now);
    assert.deepEqual(parts.current, { year: 2026, month: 9 });
    assert.deepEqual(
      parts.earlier.map((m) => `${m.year}-${m.month}`),
      ["2026-7", "2026-8"],
    );
    assert.equal(monthSectionId(2026, 9), "cal-2026-09");
  });
});

describe("calendarLocations", () => {
  it("strips city suffixes from club venue pills", () => {
    assert.equal(venueShortName("Ushuaïa Ibiza"), "Ushuaïa");
    assert.equal(venueShortName("UNVRS"), "UNVRS");
  });

  it("merges night buckets with current winning", () => {
    assert.equal(mergeLocationBucket(["upcoming", "recent"]), "upcoming");
    assert.equal(mergeLocationBucket(["recent", "current", "upcoming"]), "current");
    assert.equal(mergeLocationBucket(["recent"]), "recent");
  });

  it("groups August as places, not artist nights", () => {
    const editions = [
      {
        slug: "lollapalooza-2026-chicago",
        eventSlug: "lollapalooza",
        name: "Lollapalooza",
        year: 2026,
        label: "Chicago",
        startsAt: "2026-07-30",
        endsAt: "2026-08-02",
        bucket: "recent" as const,
        imageUrl: null,
      },
    ];
    const nights = [
      {
        slug: "unvrs-2026-08-16-tiesto",
        eventSlug: "unvrs",
        name: "UNVRS",
        title: "Tiësto",
        startsAt: "2026-08-16",
        endsAt: "2026-08-16",
        bucket: "current" as const,
        imageUrl: null,
      },
      {
        slug: "unvrs-2026-08-17-fisher",
        eventSlug: "unvrs",
        name: "UNVRS",
        title: "FISHER",
        startsAt: "2026-08-17",
        endsAt: "2026-08-17",
        bucket: "upcoming" as const,
        imageUrl: null,
      },
      {
        slug: "ushuaia-2026-08-07-calvin",
        eventSlug: "ushuaia-ibiza",
        name: "Ushuaïa Ibiza",
        title: "Calvin Harris",
        startsAt: "2026-08-07",
        endsAt: "2026-08-07",
        bucket: "recent" as const,
        imageUrl: null,
      },
      {
        slug: "ushuaia-2026-08-14-calvin",
        eventSlug: "ushuaia-ibiza",
        name: "Ushuaïa Ibiza",
        title: "Calvin Harris",
        startsAt: "2026-08-14",
        endsAt: "2026-08-14",
        bucket: "recent" as const,
        imageUrl: null,
      },
    ];
    const monthEds = editionsInMonth(editions, 2026, 8);
    const monthNights = editionsInMonth(nights, 2026, 8);
    const locs = groupMonthLocations(monthEds, monthNights);
    assert.equal(locs.length, 3);
    assert.deepEqual(
      locs.map((l) => l.key),
      ["club:unvrs", "fest:lollapalooza-2026-chicago", "club:ushuaia-ibiza"],
    );
    const unvrs = locs.find((l) => l.kind === "club" && l.eventSlug === "unvrs");
    assert.ok(unvrs && unvrs.kind === "club");
    assert.equal(unvrs.nights.length, 2);
    assert.equal(unvrs.startsAt, "2026-08-16");
    assert.equal(unvrs.endsAt, "2026-08-17");
    assert.equal(unvrs.bucket, "current");
    const ushuaia = locs.find((l) => l.kind === "club" && l.eventSlug === "ushuaia-ibiza");
    assert.ok(ushuaia && ushuaia.kind === "club");
    assert.equal(ushuaia.nights.length, 2);
    assert.equal(ushuaia.startsAt, "2026-08-07");
    assert.equal(ushuaia.endsAt, "2026-08-14");
  });

  it("shows venue-only day pills and dedupes the same club", () => {
    const occ = toCalendarOccurrences(
      [
        {
          slug: "hard-summer-2026",
          eventSlug: "hard-summer",
          name: "HARD Summer",
          year: 2026,
          startsAt: "2026-08-01",
          endsAt: "2026-08-02",
          bucket: "recent",
        },
      ],
      [
        {
          slug: "unvrs-a",
          eventSlug: "unvrs",
          name: "UNVRS",
          title: "Tiësto",
          startsAt: "2026-08-01",
          endsAt: "2026-08-01",
          bucket: "recent",
        },
        {
          slug: "unvrs-b",
          eventSlug: "unvrs",
          name: "UNVRS",
          title: "FISHER",
          startsAt: "2026-08-01",
          endsAt: "2026-08-01",
          bucket: "recent",
        },
      ],
    );
    assert.equal(occ.find((o) => o.groupKey === "fest:hard-summer-2026")?.accent, "festival");
    assert.equal(occ.find((o) => o.groupKey === "club:unvrs")?.accent, "club");
    assert.equal(occ.find((o) => o.groupKey === "club:unvrs")?.name, "UNVRS");
    assert.ok(!occ.some((o) => o.name.includes("Tiësto")));
    const pills = dedupeDayPills(occurrencesOnDay(occ, "2026-08-01"));
    assert.equal(pills.length, 2);
    const club = pills.find((p) => p.groupKey === "club:unvrs");
    assert.equal(club?.name, "UNVRS");
    assert.equal(club?.tooltip, "Tiësto; FISHER");
  });

  it("picks the soonest current or upcoming night", () => {
    const next = nextClubNight([
      { startsAt: "2026-08-07", bucket: "recent" },
      { startsAt: "2026-08-20", bucket: "upcoming" },
      { startsAt: "2026-08-16", bucket: "current" },
    ]);
    assert.equal(next?.startsAt, "2026-08-16");
    const fallback = nextClubNight([
      { startsAt: "2026-08-14", bucket: "recent" },
      { startsAt: "2026-08-07", bucket: "recent" },
    ]);
    assert.equal(fallback?.startsAt, "2026-08-07");
  });

  it("paints pills by place; time is ring or fade", () => {
    assert.match(calendarPillClass("festival", "upcoming"), /bg-amber/);
    assert.match(calendarPillClass("club", "upcoming"), /bg-teal/);
    assert.match(calendarPillClass("club", "current"), /ring-brand/);
    assert.doesNotMatch(calendarPillClass("festival", "current"), /bg-brand\/35/);
    assert.match(calendarPillClass("festival", "recent"), /opacity-55/);
    assert.match(calendarPillClass("club", "past"), /opacity-55/);
  });
});
