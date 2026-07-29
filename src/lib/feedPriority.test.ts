import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bassHouseSelectionSlugs,
  compareFeedPriority,
  resolveFeedSpotlight,
} from "./feedPriority";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";

describe("feedPriority", () => {
  it("includes curated bass house artists from roster / SC shows", () => {
    const slugs = bassHouseSelectionSlugs();
    assert.ok(slugs.has("ac-slater"));
    assert.ok(slugs.has("marten-horger"));
  });

  it("loads DJ Mag Top 100 ranks from the chart seed", () => {
    const ranks = loadDjMagTop100RankBySlug();
    assert.equal(ranks.get("david-guetta"), 1);
    assert.ok((ranks.size ?? 0) >= 90);
  });

  it("prefers bass house selection over Top 100 for dual members", () => {
    // Liu is Bass House on roster and also appears on some charts; AC Slater
    // is selection-only. Guetta is Top 100 only.
    const bass = resolveFeedSpotlight({ primaryDjSlug: "ac-slater" });
    assert.equal(bass.spotlight, "bass-house");

    const chart = resolveFeedSpotlight({ primaryDjSlug: "david-guetta" });
    assert.equal(chart.spotlight, "top100");
    assert.equal(chart.top100Rank, 1);
  });

  it("orders bass house → Top 100 (by rank) → recency", () => {
    const items: Array<{
      spotlight: "bass-house" | "top100" | null;
      top100Rank: number | null;
      publishedAt: string;
    }> = [
      {
        spotlight: null,
        top100Rank: null,
        publishedAt: "2026-07-28T00:00:00.000Z",
      },
      {
        spotlight: "top100",
        top100Rank: 5,
        publishedAt: "2026-07-20T00:00:00.000Z",
      },
      {
        spotlight: "top100",
        top100Rank: 2,
        publishedAt: "2026-07-19T00:00:00.000Z",
      },
      {
        spotlight: "bass-house",
        top100Rank: null,
        publishedAt: "2026-07-10T00:00:00.000Z",
      },
    ];
    const sorted = [...items].sort(compareFeedPriority);
    assert.equal(sorted[0]?.spotlight, "bass-house");
    assert.equal(sorted[1]?.top100Rank, 2);
    assert.equal(sorted[2]?.top100Rank, 5);
    assert.equal(sorted[3]?.spotlight, null);
  });
});
