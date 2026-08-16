import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import {
  compareEventSetPriority,
  compareFeedPriority,
  dedupeNearDuplicates,
  diversifyByArtist,
  diversifyBySeries,
  idQualityTier,
  nearDuplicateKey,
  isRadarCandidate,
  pickRadarPicks,
  radarPickScore,
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
    assert.equal(ranks.clubRank, null);
    assert.equal(ranks.venueTier, "festival");
    assert.equal(ranks.spotlight, "top100");
  });

  it("orders complete → year → Top 100 → festival chart → venue → date", () => {
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

  it("event grids prefer identified IDs over all-pink unresolved", () => {
    assert.equal(
      idQualityTier({ identified: 10, unresolved_id: 2 }, 12),
      0,
    );
    assert.equal(idQualityTier({ unresolved_id: 20 }, 20), 1);
    assert.equal(idQualityTier({}, 0), 2);

    const sorted = [
      {
        // Dom Dolla-style: tracks but all unresolved
        densitySeverity: "ok" as const,
        top100Rank: 5,
        festivalRank: 2,
        publishedAt: "2026-07-28T00:00:00.000Z",
        trackCount: 20,
        statusCounts: { unresolved_id: 20 },
      },
      {
        // empty shell
        densitySeverity: "severe" as const,
        top100Rank: 1,
        festivalRank: 2,
        publishedAt: "2026-07-29T00:00:00.000Z",
        trackCount: 0,
        statusCounts: {},
      },
      {
        // Charlotte-style: mostly identified
        densitySeverity: "ok" as const,
        top100Rank: 9,
        festivalRank: 2,
        publishedAt: "2026-07-20T00:00:00.000Z",
        trackCount: 18,
        statusCounts: { identified: 15, unresolved_id: 3 },
      },
    ].sort(compareEventSetPriority);

    assert.equal(sorted[0]?.top100Rank, 9);
    assert.equal(sorted[1]?.top100Rank, 5);
    assert.equal(sorted[2]?.densitySeverity, "severe");
  });

  it("current year beats last year's Top 100 festival", () => {
    const sorted = [
      {
        densitySeverity: "ok" as const,
        top100Rank: 1,
        festivalRank: 1,
        venueTier: "festival" as const,
        publishedAt: "2025-07-20T00:00:00.000Z",
      },
      {
        densitySeverity: "ok" as const,
        top100Rank: null,
        festivalRank: null,
        venueTier: "radio" as const,
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
    ].sort(compareFeedPriority);
    assert.equal(sorted[0]?.venueTier, "radio");
    assert.equal(sorted[1]?.festivalRank, 1);
  });

  it("uses performedAt year, not a later upload publishedAt", () => {
    const sorted = [
      {
        densitySeverity: "ok" as const,
        top100Rank: 1,
        festivalRank: 1,
        venueTier: "festival" as const,
        publishedAt: "2026-08-10T00:00:00.000Z",
        performedAt: "2024-07-28T00:00:00.000Z",
      },
      {
        densitySeverity: "ok" as const,
        top100Rank: null,
        festivalRank: null,
        venueTier: "radio" as const,
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
    ].sort(compareFeedPriority);
    assert.equal(sorted[0]?.venueTier, "radio");
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

  it("radar score prefers this year over last year's #1 festival", () => {
    const now = Date.parse("2026-08-16T12:00:00.000Z");
    const thisYear = radarPickScore(
      {
        id: "radio",
        densitySeverity: "ok",
        top100Rank: null,
        festivalRank: null,
        venueTier: "radio",
        publishedAt: "2026-08-01T00:00:00.000Z",
        primaryDjSlug: "local",
      },
      now,
    );
    const lastYearChart = radarPickScore(
      {
        id: "tml",
        densitySeverity: "ok",
        top100Rank: 1,
        festivalRank: 1,
        venueTier: "festival",
        publishedAt: "2025-07-20T00:00:00.000Z",
        primaryDjSlug: "david-guetta",
      },
      now,
    );
    assert.ok(thisYear > lastYearChart);
  });

  it("radar score prefers recent complete sets over decade archives", () => {
    const now = Date.parse("2026-07-29T12:00:00.000Z");
    const recent = radarPickScore(
      {
        id: "a",
        densitySeverity: "ok",
        top100Rank: 40,
        festivalRank: 5,
        venueTier: "festival",
        publishedAt: "2026-05-01T00:00:00.000Z",
        primaryDjSlug: "don-diablo",
      },
      now,
    );
    const archive = radarPickScore(
      {
        id: "b",
        densitySeverity: "ok",
        top100Rank: 1,
        festivalRank: 4,
        venueTier: "festival",
        publishedAt: "2015-03-01T00:00:00.000Z",
        primaryDjSlug: "david-guetta",
      },
      now,
    );
    assert.ok(recent > archive);
  });

  it("pickRadarPicks keeps one set per DJ and per event", () => {
    const now = Date.parse("2026-07-29T12:00:00.000Z");
    const picks = pickRadarPicks(
      [
        {
          id: "g15",
          densitySeverity: "ok" as const,
          top100Rank: 1,
          festivalRank: 4,
          venueTier: "festival" as const,
          publishedAt: "2015-03-01T00:00:00.000Z",
          primaryDjSlug: "david-guetta",
          eventSlug: "ultra-miami",
        },
        {
          id: "g24",
          densitySeverity: "ok" as const,
          top100Rank: 1,
          festivalRank: 4,
          venueTier: "festival" as const,
          publishedAt: "2024-03-01T00:00:00.000Z",
          primaryDjSlug: "david-guetta",
          eventSlug: "ultra-miami",
        },
        {
          id: "g26",
          densitySeverity: "ok" as const,
          top100Rank: 1,
          festivalRank: 4,
          venueTier: "festival" as const,
          publishedAt: "2026-03-22T00:00:00.000Z",
          primaryDjSlug: "david-guetta",
          eventSlug: "ultra-miami",
        },
        {
          id: "dd",
          densitySeverity: "ok" as const,
          top100Rank: 13,
          festivalRank: 2,
          venueTier: "festival" as const,
          publishedAt: "2026-05-20T00:00:00.000Z",
          primaryDjSlug: "don-diablo",
          eventSlug: "edc-lv",
        },
        {
          id: "oh",
          densitySeverity: "ok" as const,
          top100Rank: 20,
          festivalRank: null,
          venueTier: "radio" as const,
          publishedAt: "2026-07-20T00:00:00.000Z",
          primaryDjSlug: "oliver-heldens",
          eventSlug: null,
        },
      ],
      3,
      now,
    );
    assert.equal(picks.length, 3);
    const djs = picks.map((p) => p.primaryDjSlug);
    assert.equal(new Set(djs).size, 3);
    assert.ok(djs.includes("david-guetta"));
    assert.equal(
      picks.find((p) => p.primaryDjSlug === "david-guetta")?.id,
      "g26",
      "keeps this year's Guetta Ultra, not 2015/2024",
    );
  });

  it("Radar candidates are this-year complete chart sets, not archives", () => {
    const now = Date.parse("2026-08-16T12:00:00.000Z");
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 12,
          festivalRank: 8,
          venueTier: "festival",
          publishedAt: "2022-08-01T00:00:00.000Z",
          statusCounts: { identified: 11 },
          trackCount: 11,
        },
        now,
      ),
      false,
      "ATB Untold 2022",
    );
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 40,
          festivalRank: 20,
          venueTier: "festival",
          publishedAt: "2025-08-01T00:00:00.000Z",
          statusCounts: { unresolved_id: 9 },
          trackCount: 9,
        },
        now,
      ),
      false,
      "Miss Monique all-pink 2025",
    );
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 8,
          festivalRank: 2,
          venueTier: "festival",
          publishedAt: "2026-05-16T00:00:00.000Z",
          statusCounts: { identified: 90, unresolved_id: 4 },
          trackCount: 94,
          durationSec: 89 * 60,
        },
        now,
      ),
      true,
      "Tiësto EDC 2026",
    );
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 4,
          festivalRank: 2,
          venueTier: "festival",
          publishedAt: "2026-07-25T00:00:00.000Z",
          statusCounts: { identified: 7 },
          trackCount: 7,
          durationSec: 14 * 60,
        },
        now,
      ),
      false,
      "Armin YouTube House 14m clip",
    );
  });

  it("dedupes near-duplicate titles from the same DJ", () => {
    assert.equal(
      nearDuplicateKey(
        "Tomorrowland Friendship Mix with Steve Aoki - August, 2026",
        "steve-aoki",
      ),
      nearDuplicateKey("Steve Aoki - Tomorrowland Friendship Mix 2026-08-13", "steve-aoki"),
    );
    const kept = dedupeNearDuplicates([
      {
        id: "a",
        title: "Tomorrowland Friendship Mix with Steve Aoki - August, 2026",
        primaryDjSlug: "steve-aoki",
      },
      {
        id: "b",
        title: "Steve Aoki - Tomorrowland Friendship Mix 2026-08-13",
        primaryDjSlug: "steve-aoki",
      },
    ]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0]!.id, "a");
  });

  it("caps cards per series host", () => {
    const out = diversifyBySeries(
      [
        { id: "1", seriesName: "Gentlemen's Groove" },
        { id: "2", seriesName: "Gentlemen's Groove" },
        { id: "3", seriesName: "Night Owl Radio" },
      ],
      1,
    );
    assert.deepEqual(
      out.map((s) => s.id),
      ["1", "3"],
    );
  });

  it("caps cards per artist", () => {
    const out = diversifyByArtist(
      [
        { id: "1", primaryDjSlug: "david-guetta" },
        { id: "2", primaryDjSlug: "david-guetta" },
        { id: "3", primaryDjSlug: "alok" },
      ],
      1,
    );
    assert.deepEqual(
      out.map((s) => s.id),
      ["1", "3"],
    );
  });
});
