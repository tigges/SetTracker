/**
 * Homepage popularity helpers — reuse Radar scoring, no second Prisma shape.
 */

import {
  pickRadarPicks,
  radarPickScore,
  type RadarPickFields,
} from "@/lib/feedPriority";
import { isBrandHostSlug } from "@/lib/brandHosts";
import { isFestivalSeasonSet } from "@/lib/ingest/festivalDrops";
import type { FeedItem } from "@/lib/queries";

const DAY_MS = 24 * 60 * 60 * 1000;

export function withinDays(
  d: Date | string,
  days: number,
  nowMs = Date.now(),
): boolean {
  return nowMs - new Date(d).getTime() < days * DAY_MS;
}

function identifiedRatio(s: FeedItem): number {
  const c = s.statusCounts;
  const total =
    (c.identified ?? 0) +
    (c.unresolved_id ?? 0) +
    (c.community_resolved ?? 0) +
    (c.unparsed ?? 0);
  if (total === 0) return 0;
  return (c.identified ?? 0) / total;
}

function toRadarFields(s: FeedItem): FeedItem & RadarPickFields {
  return {
    ...s,
    primaryDjSlug: s.primaryDj?.slug ?? null,
    identifiedRatio: identifiedRatio(s),
  };
}

/** Top Radar-scored sets in the last N days (diversified like Radar picks). */
export function popularSetsThisWeek(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): FeedItem[] {
  const week = feed
    .filter((s) => withinDays(s.publishedAt, 7, nowMs))
    .map(toRadarFields);
  return pickRadarPicks(week, limit, nowMs);
}

export type PopularDjRail = {
  slug: string;
  name: string;
  accent: string;
  imageUrl: string | null;
  setCount: number;
  score: number;
};

/**
 * Aggregate week sets by performing DJ.
 * Until discovery quality is solid, only DJ Mag Top 100 DJs appear —
 * recent upload volume alone surfaces hobby / mis-attributed profiles.
 */
export function popularDjsThisWeek(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): PopularDjRail[] {
  const week = feed.filter((s) => withinDays(s.publishedAt, 7, nowMs));
  const bySlug = new Map<string, PopularDjRail>();
  const chartRank = new Map<string, number>();

  for (const s of week) {
    const dj = s.primaryDj;
    if (!dj || isBrandHostSlug(dj.slug)) continue;
    // Gate on chart membership (resolved on FeedItem via djmag-top100 seeds).
    if (s.top100Rank == null) continue;
    const score = radarPickScore(toRadarFields(s), nowMs);
    const row = bySlug.get(dj.slug);
    if (!row) {
      bySlug.set(dj.slug, {
        slug: dj.slug,
        name: dj.name,
        accent: dj.accent,
        imageUrl: dj.imageUrl,
        setCount: 1,
        score,
      });
      chartRank.set(dj.slug, s.top100Rank);
    } else {
      row.setCount += 1;
      row.score += score;
      if (!row.imageUrl && dj.imageUrl) row.imageUrl = dj.imageUrl;
      const prev = chartRank.get(dj.slug) ?? s.top100Rank;
      if (s.top100Rank < prev) chartRank.set(dj.slug, s.top100Rank);
    }
  }

  return [...bySlug.values()]
    .filter((d) => d.imageUrl?.trim())
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.setCount - a.setCount ||
        (chartRank.get(a.slug) ?? 999) - (chartRank.get(b.slug) ?? 999),
    )
    .slice(0, limit);
}

export type PopularVenueRail = {
  slug: string;
  name: string;
  kind: string | null;
  imageUrl: string | null;
  accent: string;
  setCount: number;
  score: number;
};

/**
 * Sets from festivals whose edition just ended (or recent festival uploads
 * during a post-weekend boost window). Diversified like Radar.
 */
export function festivalSeasonSets(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): FeedItem[] {
  const pool = feed
    .filter((s) =>
      isFestivalSeasonSet(
        {
          eventSlug: s.eventSlug,
          editionEndsAt: s.editionEndsAt,
          publishedAt: s.publishedAt,
          type: s.type,
        },
        21,
        nowMs,
      ),
    )
    .map(toRadarFields);
  return pickRadarPicks(pool, limit, nowMs);
}

/** Aggregate week sets by event / venue. */
export function popularVenuesThisWeek(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): PopularVenueRail[] {
  const week = feed.filter((s) => withinDays(s.publishedAt, 7, nowMs));
  const bySlug = new Map<string, PopularVenueRail>();

  for (const s of week) {
    if (!s.eventSlug || !s.eventName) continue;
    const score = radarPickScore(toRadarFields(s), nowMs);
    const row = bySlug.get(s.eventSlug);
    if (!row) {
      bySlug.set(s.eventSlug, {
        slug: s.eventSlug,
        name: s.eventName,
        kind: s.eventKind,
        imageUrl: s.eventImageUrl ?? s.imageUrl ?? s.primaryDj?.imageUrl ?? null,
        accent: s.primaryDj?.accent ?? "var(--brand)",
        setCount: 1,
        score,
      });
    } else {
      row.setCount += 1;
      row.score += score;
      if (!row.imageUrl) {
        row.imageUrl =
          s.eventImageUrl ?? s.imageUrl ?? s.primaryDj?.imageUrl ?? null;
      }
    }
  }

  return [...bySlug.values()]
    .filter((v) => v.setCount >= 1)
    .sort((a, b) => b.score - a.score || b.setCount - a.setCount)
    .slice(0, limit);
}
