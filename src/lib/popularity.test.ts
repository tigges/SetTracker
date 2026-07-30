import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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
  it("ranks popular sets within the week window", () => {
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

  it("aggregates DJs and skips brand hosts", () => {
    const feed = [
      item({
        id: "1",
        slug: "s1",
        primaryDj: {
          name: "INSOMNIAC",
          slug: "insomniac",
          accent: "#f",
          imageUrl: "https://example.com/i.jpg",
        },
      }),
      item({
        id: "2",
        slug: "s2",
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

  it("aggregates venues by event slug", () => {
    const feed = [
      item({
        id: "1",
        slug: "s1",
        eventSlug: "ultra-miami",
        eventName: "Ultra Music Festival",
        eventKind: "festival",
      }),
      item({
        id: "2",
        slug: "s2",
        eventSlug: "ultra-miami",
        eventName: "Ultra Music Festival",
        eventKind: "festival",
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
});
