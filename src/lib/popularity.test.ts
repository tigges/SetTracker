import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  festivalSeasonSets,
  isFestivalStorySet,
  MIN_RAIL_SHOW,
  newThisWeekSets,
  popularDjsThisWeek,
  popularSetsThisWeek,
  popularVenuesThisWeek,
} from "./popularity";
import type { FeedItem } from "./queries";

function item(partial: Partial<FeedItem> & { id: string; slug: string }): FeedItem {
  const now = Date.now();
  return {
    title: partial.title ?? partial.slug,
    type: "festival",
    genre: "House",
    genres: ["House"],
    publishedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
    durationSec: 3600,
    sourceName: "test",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    playbackUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    cover: "#fff",
    imageUrl: "https://example.com/a.jpg",
    eventName: null,
    eventSlug: null,
    eventKind: null,
    eventImageUrl: null,
    editionSlug: null,
    editionYear: null,
    editionLabel: null,
    editionStartsAt: null,
    editionEndsAt: null,
    seriesName: null,
    primaryDj: {
      name: "Dom Dolla",
      slug: "dom-dolla",
      accent: "#f00",
      imageUrl: "https://example.com/dj.jpg",
    },
    collaborators: [],
    trackCount: 40,
    statusCounts: {
      identified: 30,
      unresolved_id: 5,
      community_resolved: 0,
      unparsed: 0,
    },
    spotlight: null,
    top100Rank: 10,
    festivalRank: null,
    venueTier: "festival",
    densitySeverity: "ok",
    ...partial,
  } as FeedItem;
}

describe("popularity rails", () => {
  it("ranks popular sets within the recent window", () => {
    const feed = [
      item({
        id: "1",
        slug: "a",
        top100Rank: 1,
        primaryDj: {
          name: "A",
          slug: "a-dj",
          accent: "#1",
          imageUrl: "https://example.com/a.jpg",
        },
      }),
      item({
        id: "2",
        slug: "b",
        top100Rank: 50,
        primaryDj: {
          name: "B",
          slug: "b-dj",
          accent: "#2",
          imageUrl: "https://example.com/b.jpg",
        },
      }),
      item({
        id: "old",
        slug: "old",
        publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        top100Rank: 1,
      }),
    ];
    const popular = popularSetsThisWeek(feed, 9);
    assert.equal(popular[0]?.id, "1");
    assert.ok(!popular.some((s) => s.id === "old"));
  });

  it("fills popular sets from the longer lookback when the rail is thin", () => {
    const feed = [
      item({
        id: "mid",
        slug: "mid",
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        top100Rank: 1,
      }),
      item({
        id: "old",
        slug: "old",
        publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        top100Rank: 1,
      }),
    ];
    const popular = popularSetsThisWeek(feed, 9);
    assert.ok(popular.some((s) => s.id === "mid"));
    assert.ok(!popular.some((s) => s.id === "old"));
  });

  it("aggregates Top 100 DJs and skips brand hosts + hobbyists", () => {
    const feed = [
      item({
        id: "1",
        slug: "s1",
        top100Rank: null,
        primaryDj: {
          name: "INSOMNIAC",
          slug: "insomniac",
          accent: "#f",
          imageUrl: "https://example.com/i.jpg",
        },
      }),
      item({
        id: "hobby",
        slug: "hobby",
        top100Rank: null,
        primaryDj: {
          name: "DJ Tito",
          slug: "tito-dj",
          accent: "#0",
          imageUrl: "https://example.com/t.jpg",
        },
      }),
      item({
        id: "2",
        slug: "s2",
        top100Rank: 41,
        primaryDj: {
          name: "Dom Dolla",
          slug: "dom-dolla",
          accent: "#f00",
          imageUrl: "https://example.com/d.jpg",
        },
      }),
      item({
        id: "3",
        slug: "s3",
        top100Rank: 41,
        primaryDj: {
          name: "Dom Dolla",
          slug: "dom-dolla",
          accent: "#f00",
          imageUrl: "https://example.com/d.jpg",
        },
      }),
    ];
    const djs = popularDjsThisWeek(feed, 9);
    assert.equal(djs.length, 1);
    assert.equal(djs[0]?.slug, "dom-dolla");
    assert.equal(djs[0]?.setCount, 2);
  });

  it("excludes non–Top 100 DJs from the in-demand rail", () => {
    const feed = [
      item({
        id: "1",
        slug: "s1",
        top100Rank: null,
        primaryDj: {
          name: "Enrico Pacca",
          slug: "enrico-pacca",
          accent: "#1",
          imageUrl: "https://example.com/e.jpg",
        },
      }),
      item({
        id: "2",
        slug: "s2",
        top100Rank: 9,
        primaryDj: {
          name: "Charlotte de Witte",
          slug: "charlotte-de-witte",
          accent: "#2",
          imageUrl: "https://example.com/c.jpg",
        },
      }),
    ];
    const djs = popularDjsThisWeek(feed, 9);
    assert.deepEqual(
      djs.map((d) => d.slug),
      ["charlotte-de-witte"],
    );
  });

  it("aggregates venues by event slug", () => {
    const feed = [
      item({
        id: "1",
        slug: "s1",
        eventSlug: "ultra-miami",
        eventName: "Ultra Music Festival",
        eventKind: "festival",
        festivalRank: 4,
      }),
      item({
        id: "2",
        slug: "s2",
        eventSlug: "ultra-miami",
        eventName: "Ultra Music Festival",
        eventKind: "festival",
        festivalRank: 4,
        primaryDj: {
          name: "Other",
          slug: "other",
          accent: "#0",
          imageUrl: "https://example.com/o.jpg",
        },
      }),
    ];
    const venues = popularVenuesThisWeek(feed, 9);
    assert.equal(venues.length, 1);
    assert.equal(venues[0]?.slug, "ultra-miami");
    assert.equal(venues[0]?.setCount, 2);
  });

  it("prefers chart festivals over livestream brands on the events rail", () => {
    const feed = [
      item({
        id: "1",
        slug: "mix",
        eventSlug: "mixmag",
        eventName: "Mixmag",
        eventKind: "livestream",
        festivalRank: null,
      }),
      item({
        id: "2",
        slug: "tl",
        eventSlug: "tomorrowland",
        eventName: "Tomorrowland",
        eventKind: "festival",
        festivalRank: 1,
      }),
    ];
    const venues = popularVenuesThisWeek(feed, 9);
    assert.equal(venues[0]?.slug, "tomorrowland");
  });

  it("keeps thin tracklists off popular and festival rails", () => {
    const now = Date.parse("2026-07-30T12:00:00Z");
    const feed = [
      item({
        id: "thin",
        slug: "thin",
        densitySeverity: "severe",
        top100Rank: 1,
        eventSlug: "tomorrowland",
        editionEndsAt: new Date("2026-07-26T23:59:59Z"),
        publishedAt: new Date("2026-07-28"),
        type: "festival",
      }),
      item({
        id: "ok",
        slug: "ok",
        densitySeverity: "ok",
        top100Rank: 8,
        eventSlug: "tomorrowland",
        editionEndsAt: new Date("2026-07-26T23:59:59Z"),
        publishedAt: new Date("2026-07-28"),
        type: "festival",
      }),
    ];
    const popular = popularSetsThisWeek(feed, 9, now);
    assert.ok(popular.some((s) => s.id === "ok"));
    assert.ok(!popular.some((s) => s.id === "thin"));
    const season = festivalSeasonSets(feed, 9, now);
    assert.ok(season.some((s) => s.id === "ok"));
    assert.ok(!season.some((s) => s.id === "thin"));
  });

  it("treats recent festival playbacks as festival-story, not new-week", () => {
    const now = Date.parse("2026-07-30T12:00:00Z");
    const fest = item({
      id: "tl",
      slug: "tl",
      eventSlug: "tomorrowland",
      editionEndsAt: new Date("2026-07-26T23:59:59Z"),
      publishedAt: new Date("2026-07-28"),
      type: "festival",
    });
    const radio = item({
      id: "radio",
      slug: "radio",
      type: "radio",
      eventSlug: null,
      editionEndsAt: null,
      venueTier: "radio",
      top100Rank: null,
    });
    const club = item({
      id: "club",
      slug: "club",
      type: "mix",
      eventSlug: "ushuaia",
      editionEndsAt: null,
      venueTier: "club",
      publishedAt: new Date("2026-07-28"),
    });
    assert.equal(isFestivalStorySet(fest, now), true);
    assert.equal(isFestivalStorySet(radio, now), false);
    assert.equal(MIN_RAIL_SHOW, 3);
    const week = newThisWeekSets([fest, radio, club], 9, now);
    assert.ok(week.some((s) => s.id === "club"));
    assert.ok(!week.some((s) => s.id === "radio"), "uncharted radio is filler");
    assert.ok(!week.some((s) => s.id === "tl"));
  });

  it("keeps New this week on recent nights, not ingest-today archives", () => {
    const now = Date.parse("2026-08-20T12:00:00Z");
    const feed = [
      item({
        id: "honeyluv-june",
        slug: "honeyluv-june",
        type: "mix",
        venueTier: "club",
        title: "HoneyLuv @ ANTS Ushuaïa Ibiza 2026-06-17",
        publishedAt: new Date("2026-08-20T00:00:00Z"),
      }),
      item({
        id: "street-2025",
        slug: "street-2025",
        type: "mix",
        venueTier: "festival",
        title: "Deborah de Luca - Zurich Street Parade 2025 - ARTE Concert",
        publishedAt: new Date("2026-08-20T00:00:00Z"),
      }),
      item({
        id: "stussy-2024",
        slug: "stussy-2024",
        type: "mix",
        venueTier: "livestream",
        title: "Chris Stussy | Boiler Room: Edinburgh",
        publishedAt: new Date("2026-08-20T00:00:00Z"),
        performedAt: new Date("2024-05-19T00:00:00Z"),
      }),
      item({
        id: "fresh",
        slug: "fresh",
        type: "mix",
        venueTier: "club",
        title: "Artist Live @ Club",
        publishedAt: new Date("2026-08-18T00:00:00Z"),
      }),
    ];
    const week = newThisWeekSets(feed, 9, now);
    assert.deepEqual(
      week.map((s) => s.id),
      ["fresh"],
    );
  });

  it("drops a half-identified recent radio from This week", () => {
    const now = Date.parse("2026-08-28T12:00:00Z");
    const week = newThisWeekSets(
      [
        item({
          id: "hot-robot-255",
          slug: "hot-robot-255",
          type: "radio",
          venueTier: "radio",
          top100Rank: 4,
          title: "Hot Robot Radio 255",
          publishedAt: new Date("2026-08-27T00:00:00Z"),
          durationSec: 58 * 60,
          trackCount: 12,
          statusCounts: { identified: 12, unresolved_id: 0, unparsed: 0 },
          primaryDj: {
            name: "Jamie Jones",
            slug: "jamie-jones",
            accent: "#1",
            imageUrl: "https://example.com/jj.jpg",
          },
        }),
        item({
          id: "hot-robot-254",
          slug: "hot-robot-254",
          type: "radio",
          venueTier: "radio",
          top100Rank: 4,
          title: "Hot Robot Radio 254",
          publishedAt: new Date("2026-08-25T00:00:00Z"),
          durationSec: 58 * 60,
          trackCount: 15,
          statusCounts: {
            identified: 0,
            community_resolved: 6,
            unresolved_id: 3,
            unparsed: 6,
          },
          primaryDj: {
            name: "Jamie Jones",
            slug: "jamie-jones",
            accent: "#1",
            imageUrl: "https://example.com/jj.jpg",
          },
        }),
      ],
      9,
      now,
    );
    assert.deepEqual(
      week.map((s) => s.id),
      ["hot-robot-255"],
    );
  });

  it("fills New this week from 14 days when the 7-day pool is thin", () => {
    const now = Date.parse("2026-08-16T12:00:00Z");
    const feed = [
      item({
        id: "d10",
        slug: "d10",
        type: "mix",
        venueTier: "club",
        eventSlug: "ushuaia",
        publishedAt: new Date("2026-08-06T00:00:00Z"),
      }),
    ];
    const week = newThisWeekSets(feed, 9, now);
    assert.ok(week.some((s) => s.id === "d10"));
  });

  it("treats a mid-week Burning Man upload as festival-story", () => {
    const now = Date.parse("2026-09-01T12:00:00Z");
    const bm = item({
      id: "bm",
      slug: "bm",
      eventSlug: "burning-man",
      editionStartsAt: new Date("2026-08-30T00:00:00Z"),
      editionEndsAt: new Date("2026-09-07T23:59:59Z"),
      publishedAt: new Date("2026-09-01"),
      type: "festival",
    });
    const radio = item({
      id: "joel-radio",
      slug: "joel-radio",
      title: "Joel Corry Radio 188",
      type: "radio",
      eventSlug: null,
      editionEndsAt: null,
      venueTier: "radio",
      top100Rank: 11,
      publishedAt: new Date("2026-08-31"),
    });
    assert.equal(isFestivalStorySet(bm, now), true);
    const week = newThisWeekSets([bm, radio], 9, now);
    assert.ok(!week.some((s) => s.id === "joel-radio"));
    assert.ok(!week.some((s) => s.id === "bm"));
    const season = festivalSeasonSets([bm, radio], 9, now);
    assert.ok(season.some((s) => s.id === "bm"));
  });

  it("caps festival season at two cards per event brand", () => {
    const now = Date.parse("2026-07-30T12:00:00Z");
    const feed = [1, 2, 3, 4].map((n) =>
      item({
        id: `tml-${n}`,
        slug: `tml-${n}`,
        title: `Artist ${n} | Tomorrowland 2026`,
        eventSlug: n <= 2 ? "tomorrowland" : null,
        editionEndsAt: new Date("2026-07-26T23:59:59Z"),
        publishedAt: new Date("2026-07-28"),
        type: "festival",
        primaryDj: {
          name: `A${n}`,
          slug: `a-${n}`,
          accent: "#1",
          imageUrl: "https://example.com/a.jpg",
        },
      }),
    );
    const season = festivalSeasonSets(feed, 9, now);
    assert.ok(season.length <= 2);
    assert.ok(
      season.every((s) => /tomorrowland/i.test(s.title) || s.eventSlug === "tomorrowland"),
    );
  });

  it("includes venues from the 28-day window", () => {
    const feed = [
      item({
        id: "1",
        slug: "s1",
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        eventSlug: "creamfields",
        eventName: "Creamfields",
        eventKind: "festival",
        festivalRank: 7,
      }),
    ];
    const venues = popularVenuesThisWeek(feed, 9);
    assert.equal(venues[0]?.slug, "creamfields");
  });
});
