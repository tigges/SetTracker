import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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

  it("flags recently ended editions for season rail", () => {
    const now = Date.parse("2026-07-30T12:00:00Z");
    const recent = recentlyEndedEditions(21, now);
    assert.ok(recent.some((e) => e.slug === "tomorrowland-2026-belgium"));
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
  });
});
