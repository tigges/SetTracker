import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  currentFestivalEventSlugs,
  editionCalendar,
  editionGapReport,
  editionLabel,
  eventInDropWindow,
  festivalSourcePollLimit,
  festivalWeekActive,
  isFestivalSeasonSet,
  matchEditionSeed,
  recentlyEndedEditions,
} from "./festivalDrops";

describe("festivalDrops", () => {
  it("matches Tomorrowland Belgium 2026 from title", () => {
    const seed = matchEditionSeed(
      "tomorrowland",
      "David Guetta | Tomorrowland Belgium 2026",
      new Date("2026-07-28"),
    );
    assert.equal(seed?.slug, "tomorrowland-2026-belgium");
  });

  it("matches Winter edition when title says Winter", () => {
    const seed = matchEditionSeed(
      "tomorrowland",
      "Axwell | Tomorrowland Winter 2026",
      new Date("2026-03-30"),
    );
    assert.equal(seed?.slug, "tomorrowland-2026-winter");
  });

  it("matches Parookaville 2026", () => {
    const seed = matchEditionSeed(
      "parookaville",
      "MARTEN HØRGER @ Mainstage, Parookaville 2026",
      new Date("2026-07-20"),
    );
    assert.equal(seed?.slug, "parookaville-2026");
  });

  it("matches Parookaville 2024 from a 2024 title", () => {
    const seed = matchEditionSeed(
      "parookaville",
      "BRANDON @ Desert Valley, Parookaville 2024",
      new Date("2024-07-28"),
    );
    assert.equal(seed?.slug, "parookaville-2024");
  });

  it("matches Parookaville 2025 from a 2025 title", () => {
    const seed = matchEditionSeed(
      "parookaville",
      "Dillon Francis B2B Marten Horger | Parookaville 2025 Mainstage",
      new Date("2025-07-21"),
    );
    assert.equal(seed?.slug, "parookaville-2025");
  });

  it("flags recently ended editions for season rail", () => {
    const now = Date.parse("2026-07-30T12:00:00Z");
    const recent = recentlyEndedEditions(21, now);
    assert.ok(recent.some((e) => e.slug === "tomorrowland-2026-belgium"));
    assert.ok(recent.some((e) => e.slug === "parookaville-2026"));
    assert.equal(
      isFestivalSeasonSet(
        {
          eventSlug: "tomorrowland",
          editionEndsAt: new Date("2026-07-26T23:59:59Z"),
          publishedAt: new Date("2026-07-28"),
          type: "festival",
        },
        21,
        now,
      ),
      true,
    );
    assert.equal(
      isFestivalSeasonSet(
        {
          eventSlug: "holy-ship",
          editionEndsAt: new Date("2026-07-26T23:59:59Z"),
          publishedAt: new Date("2019-01-10"),
          type: "festival",
        },
        21,
        now,
      ),
      false,
      "old uploads stay out of Festival season even if editionEndsAt is current",
    );
  });

  it("treats Burning Man mid-week as festival season and a live drop window", () => {
    const now = Date.parse("2026-09-01T12:00:00Z");
    assert.equal(festivalWeekActive(now), true);
    assert.ok(currentFestivalEventSlugs(now).has("burning-man"));
    assert.equal(eventInDropWindow("burning-man", 21, now), true);
    assert.equal(
      isFestivalSeasonSet(
        {
          eventSlug: "burning-man",
          editionStartsAt: new Date("2026-08-30T00:00:00Z"),
          editionEndsAt: new Date("2026-09-07T23:59:59Z"),
          publishedAt: new Date("2026-09-01"),
          type: "festival",
        },
        21,
        now,
      ),
      true,
    );
    assert.equal(
      isFestivalSeasonSet(
        {
          eventSlug: "burning-man",
          editionStartsAt: new Date("2026-08-30T00:00:00Z"),
          editionEndsAt: new Date("2026-09-07T23:59:59Z"),
          publishedAt: new Date("2024-09-05"),
          type: "festival",
        },
        21,
        now,
      ),
      false,
      "2024 Burning Man uploads stay off Festival season during 2026 week",
    );
  });

  it("phase-boosts poll limits only in drop window", () => {
    const now = Date.parse("2026-07-30T12:00:00Z");
    assert.equal(eventInDropWindow("tomorrowland", 21, now), true);
    assert.equal(eventInDropWindow("ultra-miami", 21, now), false);
    assert.equal(
      festivalSourcePollLimit("tomorrowland", 40, 100, 21, now),
      100,
    );
    assert.equal(
      festivalSourcePollLimit("ultra-miami", 40, 100, 21, now),
      40,
    );
    assert.equal(festivalSourcePollLimit(undefined, 40, 100, 21, now), 40);
  });

  it("buckets current / upcoming / recent editions", () => {
    const now = Date.parse("2026-08-15T12:00:00Z");
    const cal = editionCalendar(now);
    assert.equal(
      cal.find((e) => e.slug === "untold-2026")?.bucket,
      "recent",
    );
    assert.equal(
      cal.find((e) => e.slug === "creamfields-2026")?.bucket,
      "upcoming",
    );
    assert.equal(
      cal.find((e) => e.slug === "creamfields-chile-2026")?.bucket,
      "upcoming",
    );
    assert.match(
      editionLabel(cal.find((e) => e.slug === "creamfields-chile-2026")!),
      /Creamfields Chile/,
    );
    assert.equal(
      cal.find((e) => e.slug === "hard-summer-2026")?.bucket,
      "recent",
    );
    assert.equal(
      cal.find((e) => e.slug === "ultra-miami-2025")?.bucket,
      "past",
    );
    assert.match(editionLabel(cal.find((e) => e.slug === "untold-2026")!), /Untold/);
  });

  it("flags recent editions with thin catalog coverage", () => {
    const now = Date.parse("2026-08-15T12:00:00Z");
    const gaps = editionGapReport(
      [
        {
          eventSlug: "untold",
          publishedAt: "2026-08-10",
          trackCount: 2,
          durationSec: 3600,
        },
        {
          eventSlug: "creamfields",
          publishedAt: "2026-08-22",
          trackCount: 40,
          durationSec: 5400,
        },
      ],
      now,
    );
    assert.ok(gaps.some((g) => g.edition.slug === "untold-2026"));
    assert.ok(!gaps.some((g) => g.edition.slug === "creamfields-2026"));
  });

  it("matches Lollapalooza Chicago 2026", () => {
    const seed = matchEditionSeed(
      "lollapalooza",
      "Artist | Lollapalooza Chicago 2026",
      new Date("2026-08-03"),
    );
    assert.equal(seed?.slug, "lollapalooza-2026");
  });
});
