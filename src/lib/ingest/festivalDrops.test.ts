import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  eventInDropWindow,
  festivalSourcePollLimit,
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

  it("matches Lollapalooza Chicago 2026", () => {
    const seed = matchEditionSeed(
      "lollapalooza",
      "Artist | Lollapalooza Chicago 2026",
      new Date("2026-08-03"),
    );
    assert.equal(seed?.slug, "lollapalooza-2026");
  });
});
