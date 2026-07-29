import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import {
  compareFeedPriority,
  resolveVenueTier,
} from "./feedPriority";
import { resolveFeedRanks } from "./feedPriorityResolve";

describe("feedPriority complete → Top 100 → festivals", () => {
  it("loads DJ and festival chart ranks (with event aliases)", () => {
    const djs = loadDjMagTop100RankBySlug();
    assert.equal(djs.get("david-guetta"), 1);

    const fests = loadDjMagFestivalRankBySlug();
    assert.equal(fests.get("tomorrowland"), 1);
    assert.equal(fests.get("edc-las-vegas"), 2);
    assert.equal(fests.get("edc-lv"), 2, "catalog alias shares chart rank");
  });

  it("prefers Event.kind over Set.type for venue tier", () => {
    assert.equal(resolveVenueTier("club", "festival"), "club");
    assert.equal(resolveVenueTier(null, "festival"), "festival");
    assert.equal(resolveVenueTier(null, "soundcloud"), "other");
  });

  it("marks Top 100 DJ and top festival on ranks", () => {
    const ranks = resolveFeedRanks({
      primaryDjSlug: "mike-williams",
      eventSlug: "tomorrowland",
      eventKind: "festival",
      setType: "festival",
      durationSec: 3600,
      trackCount: 20,
    });
    assert.equal(ranks.densitySeverity, "ok");
    assert.equal(ranks.top100Rank, 72);
    assert.equal(ranks.festivalRank, 1);
    assert.equal(ranks.venueTier, "festival");
    assert.equal(ranks.spotlight, "top100");
  });

  it("orders complete → Top 100 → festival chart → venue → date", () => {
    const items = [
      {
        // empty Top 100 festival — last among these
        densitySeverity: "severe" as const,
        top100Rank: 1,
        festivalRank: 1,
        venueTier: "festival" as const,
        publishedAt: "2026-07-28T00:00:00.000Z",
      },
      {
        // complete radio, no chart
        densitySeverity: "ok" as const,
        top100Rank: null,
        festivalRank: null,
        venueTier: "radio" as const,
        publishedAt: "2026-07-27T00:00:00.000Z",
      },
      {
        // complete Top 100 club
        densitySeverity: "ok" as const,
        top100Rank: 20,
        festivalRank: null,
        venueTier: "club" as const,
        publishedAt: "2026-07-26T00:00:00.000Z",
      },
      {
        // complete Top 100 Tomorrowland
        densitySeverity: "ok" as const,
        top100Rank: 50,
        festivalRank: 1,
        venueTier: "festival" as const,
        publishedAt: "2026-07-25T00:00:00.000Z",
      },
      {
        // complete Top 100 lesser festival
        densitySeverity: "ok" as const,
        top100Rank: 10,
        festivalRank: 40,
        venueTier: "festival" as const,
        publishedAt: "2026-07-24T00:00:00.000Z",
      },
    ];
    const sorted = [...items].sort(compareFeedPriority);
    // Among ok: top100 #10 before #20 before #50 before null
    assert.equal(sorted[0]?.top100Rank, 10);
    assert.equal(sorted[1]?.top100Rank, 20);
    assert.equal(sorted[2]?.festivalRank, 1);
    assert.equal(sorted[3]?.venueTier, "radio");
    assert.equal(sorted[4]?.densitySeverity, "severe");
  });

  it("among equal Top 100, better festival rank and festival>club", () => {
    const sorted = [
      {
        densitySeverity: "ok" as const,
        top100Rank: 12,
        festivalRank: null,
        venueTier: "club" as const,
        publishedAt: "2026-07-28T00:00:00.000Z",
      },
      {
        densitySeverity: "ok" as const,
        top100Rank: 12,
        festivalRank: 5,
        venueTier: "festival" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
      },
    ].sort(compareFeedPriority);
    assert.equal(sorted[0]?.festivalRank, 5);
    assert.equal(sorted[1]?.venueTier, "club");
  });
});
