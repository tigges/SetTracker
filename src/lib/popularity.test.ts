import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  festivalSeasonSets,
  isFestivalStorySet,
  MIN_RAIL_SHOW,
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

  it("treats recent festival Relives as festival-story, not new-week", () => {
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
    });
    assert.equal(isFestivalStorySet(fest, now), true);
    assert.equal(isFestivalStorySet(radio, now), false);
    assert.equal(MIN_RAIL_SHOW, 3);
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
