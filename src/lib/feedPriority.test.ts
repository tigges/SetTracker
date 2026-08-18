import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import {
  compareDeepCatalog,
  compareEventSetPriorityAt,
  groupEventSetsByYear,
  compareFeedPriority,
  displayLane,
  isRadioFiller,
  isArchiveTitledSet,
  isThisPerformanceYear,
  dedupeNearDuplicates,
  diversifyByArtist,
  diversifyBySeries,
  idCoverageTier,
  idQualityTier,
  nearDuplicateKey,
  isRadarCandidate,
  pickRadarPicks,
  radarPickScore,
  resolveVenueTier,
  setPerformanceYear,
  yearFromSetTitle,
} from "./feedPriority";
import { resolveFeedRanks } from "./feedPriorityResolve";

describe("title year vs upload date", () => {
  const now = Date.parse("2026-08-16T12:00:00.000Z");

  it("reads the last 20xx in the set title", () => {
    assert.equal(
      yearFromSetTitle("Alan Walker | Tomorrowland Belgium 2018", now),
      2018,
    );
    assert.equal(
      yearFromSetTitle("Hardwell On Air 527 YEARMIX 2025", now),
      2025,
    );
    assert.equal(yearFromSetTitle("Joel Corry Live @ Edge NYC", now), null);
  });

  it("treats pre-last-year title years as archive Relives", () => {
    assert.equal(
      isArchiveTitledSet("Alan Walker | Tomorrowland Belgium 2018", now),
      true,
    );
    assert.equal(isArchiveTitledSet("FISHER — EDC Orlando 2024", now), true);
    assert.equal(
      isArchiveTitledSet("Hardwell On Air 527 YEARMIX 2025", now),
      false,
    );
    assert.equal(
      isArchiveTitledSet("Alok | Tomorrowland Winter 2026", now),
      false,
    );
  });

  it("prefers title year over a remapped 2026 edition", () => {
    assert.equal(
      setPerformanceYear(
        {
          title: "Alan Walker | Tomorrowland Belgium 2018",
          publishedAt: "2026-08-01T00:00:00.000Z",
          editionYear: 2026,
        },
        now,
      ),
      2018,
    );
  });
});

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

  it("event grids prefer identified IDs over all-pink unresolved on the same day", () => {
    assert.equal(
      idQualityTier({ identified: 10, unresolved_id: 2 }, 12),
      0,
    );
    assert.equal(idQualityTier({ unresolved_id: 20 }, 20), 1);
    assert.equal(idQualityTier({}, 0), 2);

    const day = "2026-07-20T00:00:00.000Z";
    const cmp = compareEventSetPriorityAt(Date.parse("2026-08-18T12:00:00Z"));
    const sorted = [
      {
        densitySeverity: "ok" as const,
        publishedAt: day,
        trackCount: 20,
        statusCounts: { unresolved_id: 20 },
      },
      {
        densitySeverity: "severe" as const,
        publishedAt: day,
        trackCount: 0,
        statusCounts: {},
      },
      {
        densitySeverity: "ok" as const,
        publishedAt: day,
        trackCount: 18,
        statusCounts: { identified: 15, unresolved_id: 3 },
      },
    ].sort(cmp);

    assert.equal(sorted[0]?.statusCounts?.identified, 15);
    assert.equal(sorted[1]?.statusCounts?.unresolved_id, 20);
    assert.equal(sorted[2]?.densitySeverity, "severe");
  });

  it("event grids keep a newer Relive ahead of a denser older one", () => {
    const cmp = compareEventSetPriorityAt(Date.parse("2026-08-18T12:00:00Z"));
    const sorted = [
      {
        id: "garrix-2025",
        densitySeverity: "ok" as const,
        publishedAt: "2025-07-26T00:00:00.000Z",
        trackCount: 40,
        statusCounts: { identified: 40 },
      },
      {
        id: "thin-2026",
        densitySeverity: "thin" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
        trackCount: 8,
        statusCounts: { identified: 4, unresolved_id: 4 },
      },
    ].sort(cmp);
    assert.equal(sorted[0]?.id, "thin-2026");
    assert.equal(sorted[1]?.id, "garrix-2025");
  });

  it("event grids keep empty shells after playable Relives on the same day", () => {
    const cmp = compareEventSetPriorityAt(Date.parse("2026-08-18T12:00:00Z"));
    const sorted = [
      {
        id: "empty-2026",
        densitySeverity: "severe" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
        trackCount: 0,
        statusCounts: {},
      },
      {
        id: "playable-2026",
        densitySeverity: "ok" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
        trackCount: 18,
        statusCounts: { identified: 15 },
      },
    ].sort(cmp);
    assert.equal(sorted[0]?.id, "playable-2026");
    assert.equal(sorted[1]?.id, "empty-2026");
  });

  it("place year bands keep a remapped 2018 title out of this year", () => {
    const now = Date.parse("2026-08-18T12:00:00Z");
    const bands = groupEventSetsByYear(
      [
        {
          id: "walker-2018",
          title: "Alan Walker | Tomorrowland Belgium 2018",
          publishedAt: "2026-08-18T00:00:00.000Z",
          performedAt: "2026-07-18T00:00:00.000Z",
          editionYear: 2026,
          densitySeverity: "ok" as const,
          trackCount: 30,
          statusCounts: { identified: 30 },
        },
        {
          id: "thin-2026",
          title: "Main Stage 2026",
          publishedAt: "2026-07-20T00:00:00.000Z",
          densitySeverity: "thin" as const,
          trackCount: 8,
          statusCounts: { identified: 4, unresolved_id: 4 },
        },
      ],
      now,
    );
    assert.deepEqual(
      bands.map((b) => ({ year: b.year, ids: b.sets.map((s) => s.id) })),
      [
        { year: 2026, ids: ["thin-2026"] },
        { year: 2018, ids: ["walker-2018"] },
      ],
    );
  });

  it("event grids put a newer empty shell ahead of an older playable Relive", () => {
    const cmp = compareEventSetPriorityAt(Date.parse("2026-08-18T12:00:00Z"));
    const sorted = [
      {
        id: "empty-newer",
        densitySeverity: "severe" as const,
        publishedAt: "2026-08-11T00:00:00.000Z",
        trackCount: 0,
        statusCounts: {},
      },
      {
        id: "playable-older",
        densitySeverity: "ok" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
        trackCount: 18,
        statusCounts: { identified: 15 },
      },
    ].sort(cmp);
    assert.equal(sorted[0]?.id, "empty-newer");
    assert.equal(sorted[1]?.id, "playable-older");
  });

  it("homepage prefers mostly identified tracklists over sparse IDs", () => {
    assert.equal(
      idCoverageTier({ identified: 30, unresolved_id: 2, unparsed: 1 }, 33),
      0,
    );
    assert.equal(
      idCoverageTier({ identified: 6, unresolved_id: 1, unparsed: 12 }, 19),
      2,
    );
    const sorted = [
      {
        id: "vintage-sparse",
        densitySeverity: "ok" as const,
        top100Rank: 1,
        festivalRank: 1,
        venueTier: "festival" as const,
        publishedAt: "2026-08-01T00:00:00.000Z",
        trackCount: 18,
        statusCounts: { identified: 6, unresolved_id: 1, unparsed: 11 },
      },
      {
        id: "hype-full",
        densitySeverity: "ok" as const,
        top100Rank: 40,
        festivalRank: null,
        venueTier: "club" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
        trackCount: 34,
        statusCounts: { identified: 34, unresolved_id: 0, unparsed: 0 },
      },
    ].sort(compareFeedPriority);
    assert.equal(sorted[0]?.id, "hype-full");
    assert.equal(sorted[1]?.id, "vintage-sparse");
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

  it("Deep catalog sorts by performance date, then density, then chart", () => {
    const now = Date.parse("2026-08-16T12:00:00.000Z");
    const sorted = [
      {
        id: "guetta-2024",
        densitySeverity: "ok" as const,
        top100Rank: 1,
        festivalRank: 4,
        publishedAt: "2024-05-01T00:00:00.000Z",
      },
      {
        id: "alok-winter",
        densitySeverity: "ok" as const,
        top100Rank: 20,
        festivalRank: 1,
        publishedAt: "2026-03-15T00:00:00.000Z",
      },
      {
        id: "lost-freq",
        densitySeverity: "ok" as const,
        top100Rank: 15,
        festivalRank: 1,
        publishedAt: "2026-07-20T00:00:00.000Z",
      },
      {
        id: "thin-july",
        densitySeverity: "thin" as const,
        top100Rank: 2,
        festivalRank: 1,
        publishedAt: "2026-07-20T00:00:00.000Z",
      },
    ].sort(compareDeepCatalog);
    assert.deepEqual(
      sorted.map((s) => s.id),
      ["lost-freq", "thin-july", "alok-winter", "guetta-2024"],
    );
    assert.equal(
      isThisPerformanceYear({ publishedAt: "2026-03-15T00:00:00.000Z" }, now),
      true,
    );
    assert.equal(
      isThisPerformanceYear({ publishedAt: "2024-05-01T00:00:00.000Z" }, now),
      false,
    );
  });

  it("Deep catalog prefers mostly identified sets on the same date", () => {
    const sorted = [
      {
        id: "sparse",
        densitySeverity: "ok" as const,
        top100Rank: 1,
        publishedAt: "2026-07-20T00:00:00.000Z",
        statusCounts: { identified: 4, unparsed: 14 },
      },
      {
        id: "full",
        densitySeverity: "ok" as const,
        top100Rank: 80,
        publishedAt: "2026-07-20T00:00:00.000Z",
        statusCounts: { identified: 18, unparsed: 0 },
      },
    ].sort(compareDeepCatalog);
    assert.deepEqual(
      sorted.map((s) => s.id),
      ["full", "sparse"],
    );
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
        id: "club",
        densitySeverity: "ok",
        top100Rank: 40,
        festivalRank: null,
        venueTier: "club",
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
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 12,
          festivalRank: 8,
          venueTier: "festival",
          publishedAt: "2026-08-01T00:00:00.000Z",
          statusCounts: { identified: 6, unresolved_id: 1, unparsed: 11 },
          trackCount: 18,
          durationSec: 2 * 3600 + 21 * 60,
        },
        now,
      ),
      false,
      "Vintage Culture-style: only a few IDs, rest unparsed",
    );
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 40,
          festivalRank: null,
          venueTier: "club",
          publishedAt: "2026-07-20T00:00:00.000Z",
          statusCounts: { identified: 34 },
          trackCount: 34,
          durationSec: 46 * 60,
        },
        now,
      ),
      true,
      "mostly identified Cafe Mambo-style set",
    );
    assert.equal(
      isRadarCandidate(
        {
          densitySeverity: "ok",
          top100Rank: 11,
          festivalRank: null,
          venueTier: "radio",
          publishedAt: "2026-08-01T00:00:00.000Z",
          statusCounts: { identified: 20 },
          trackCount: 20,
          durationSec: 3600,
        },
        now,
      ),
      false,
      "Top 100 radio stays off Radar",
    );
  });

  it("treats uncharted radio as a Deep filler, behind live rooms", () => {
    assert.equal(isRadioFiller({ venueTier: "radio", top100Rank: null }), true);
    assert.equal(isRadioFiller({ venueTier: "radio", top100Rank: 11 }), false);
    assert.equal(isRadioFiller({ venueTier: "festival", top100Rank: null }), false);
    assert.equal(displayLane({ venueTier: "festival" }), 0);
    assert.equal(displayLane({ venueTier: "radio", top100Rank: 4 }), 2);
    assert.equal(displayLane({ venueTier: "radio" }), 3);

    const spotlight = [
      {
        id: "radio-star",
        densitySeverity: "ok" as const,
        top100Rank: 4,
        venueTier: "radio" as const,
        publishedAt: "2026-08-10T00:00:00.000Z",
      },
      {
        id: "club-unknown",
        densitySeverity: "ok" as const,
        top100Rank: null,
        venueTier: "club" as const,
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
    ].sort(compareFeedPriority);
    assert.equal(spotlight[0]?.id, "club-unknown");

    const deep = [
      {
        id: "radio-new",
        densitySeverity: "ok" as const,
        top100Rank: null,
        venueTier: "radio" as const,
        publishedAt: "2026-08-16T00:00:00.000Z",
        statusCounts: { identified: 18 },
        trackCount: 18,
      },
      {
        id: "fest-older",
        densitySeverity: "ok" as const,
        top100Rank: 80,
        venueTier: "festival" as const,
        publishedAt: "2026-07-20T00:00:00.000Z",
        statusCounts: { identified: 18 },
        trackCount: 18,
      },
    ].sort(compareDeepCatalog);
    assert.equal(deep[0]?.id, "fest-older");
    assert.equal(deep[1]?.id, "radio-new");
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
