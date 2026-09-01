/**
 * Homepage popularity helpers — reuse Radar scoring, no second Prisma shape.
 */

import {
  compareFeedPriority,
  isFeedLeadCard,
  isRadioFiller,
  isRecentPerformance,
  pickRadarPicks,
  radarPickScore,
  type RadarPickFields,
} from "@/lib/feedPriority";
import { diversifyByEvent, identifiedRatio } from "@/lib/feedQuality";
import { isBrandHostSlug } from "@/lib/brandHosts";
import {
  festivalWeekActive,
  isFestivalSeasonSet,
} from "@/lib/ingest/festivalDrops";
import type { FeedItem } from "@/lib/queries";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Primary window for Popular sets (then fill from longer lookback). */
export const POPULAR_SETS_LOOKBACK_DAYS = 14;
export const POPULAR_SETS_FILL_DAYS = 28;
/** Primary window for Top events (then fill from season lookback). */
export const POPULAR_VENUES_LOOKBACK_DAYS = 28;
export const POPULAR_VENUES_FILL_DAYS = 90;
const RAIL_FILL_MIN = 6;

export function withinDays(
  d: Date | string,
  days: number,
  nowMs = Date.now(),
): boolean {
  return nowMs - new Date(d).getTime() < days * DAY_MS;
}

function setIdentifiedRatio(s: FeedItem): number {
  return identifiedRatio(s.statusCounts);
}

/** Spotlight rails hide incomplete parses; Deep catalog still lists them. */
export function isCompleteTracklist(s: FeedItem): boolean {
  return (s.densitySeverity ?? "ok") === "ok";
}

/** Hide a homepage cluster when it would be a lonely 1–2 cards. */
export const MIN_RAIL_SHOW = 3;

/** Festival playbacks belong on Festival season, not New this week. */
export function isFestivalStorySet(
  s: FeedItem,
  nowMs = Date.now(),
): boolean {
  return isFestivalSeasonSet(
    {
      eventSlug: s.eventSlug,
      editionStartsAt: s.editionStartsAt,
      editionEndsAt: s.editionEndsAt,
      publishedAt: s.publishedAt,
      type: s.type,
    },
    21,
    nowMs,
  );
}

function toRadarFields(s: FeedItem): FeedItem & RadarPickFields {
  return {
    ...s,
    primaryDjSlug: s.primaryDj?.slug ?? null,
    identifiedRatio: setIdentifiedRatio(s),
  };
}

function pickRecentSets(
  feed: FeedItem[],
  lookbackDays: number,
  limit: number,
  nowMs: number,
  excludeIds?: Set<string>,
): FeedItem[] {
  const pool = feed
    .filter(
      (s) =>
        isCompleteTracklist(s) &&
        !isRadioFiller(s, { festivalWeek: festivalWeekActive(nowMs) }) &&
        withinDays(s.publishedAt, lookbackDays, nowMs) &&
        !excludeIds?.has(s.id),
    )
    .map(toRadarFields);
  return pickRadarPicks(pool, limit, nowMs);
}

/**
 * Top Radar-scored sets recently (14d), with a 28d fill when the rail is thin.
 * Diversified like Radar picks.
 */
export function popularSetsThisWeek(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): FeedItem[] {
  const primary = pickRecentSets(
    feed,
    POPULAR_SETS_LOOKBACK_DAYS,
    limit,
    nowMs,
  );
  if (primary.length >= Math.min(limit, RAIL_FILL_MIN)) return primary;
  const used = new Set(primary.map((s) => s.id));
  const fill = pickRecentSets(
    feed,
    POPULAR_SETS_FILL_DAYS,
    limit - primary.length,
    nowMs,
    used,
  );
  return [...primary, ...fill];
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
  festivalRank?: number | null;
  clubRank?: number | null;
};

function venueKindBoost(kind: string | null | undefined): number {
  if (kind === "festival") return 12;
  if (kind === "conference") return 6;
  if (kind === "club") return 4;
  return 0;
}

function venueChartBoost(chartRank: number | null | undefined): number {
  if (chartRank == null) return 0;
  return Math.max(0, 36 - (chartRank - 1) * 0.28);
}

function aggregateVenues(
  sets: FeedItem[],
  nowMs: number,
): Map<string, PopularVenueRail> {
  const bySlug = new Map<string, PopularVenueRail>();

  for (const s of sets) {
    if (!s.eventSlug || !s.eventName) continue;
    const base = radarPickScore(toRadarFields(s), nowMs);
    const row = bySlug.get(s.eventSlug);
    if (!row) {
      bySlug.set(s.eventSlug, {
        slug: s.eventSlug,
        name: s.eventName,
        kind: s.eventKind,
        imageUrl: s.eventImageUrl ?? s.imageUrl ?? s.primaryDj?.imageUrl ?? null,
        accent: s.primaryDj?.accent ?? "var(--brand)",
        setCount: 1,
        score: base,
        festivalRank: s.festivalRank ?? null,
        clubRank: s.clubRank ?? null,
      });
    } else {
      row.setCount += 1;
      row.score += base;
      if (row.festivalRank == null && s.festivalRank != null) {
        row.festivalRank = s.festivalRank;
      } else if (
        s.festivalRank != null &&
        row.festivalRank != null &&
        s.festivalRank < row.festivalRank
      ) {
        row.festivalRank = s.festivalRank;
      }
      if (row.clubRank == null && s.clubRank != null) {
        row.clubRank = s.clubRank;
      } else if (
        s.clubRank != null &&
        row.clubRank != null &&
        s.clubRank < row.clubRank
      ) {
        row.clubRank = s.clubRank;
      }
      if (!row.imageUrl) {
        row.imageUrl =
          s.eventImageUrl ?? s.imageUrl ?? s.primaryDj?.imageUrl ?? null;
      }
    }
  }

  for (const row of bySlug.values()) {
    row.score +=
      venueChartBoost(row.festivalRank ?? row.clubRank) +
      venueKindBoost(row.kind) * row.setCount;
  }

  return bySlug;
}

function rankVenueRails(
  bySlug: Map<string, PopularVenueRail>,
  limit: number,
  excludeSlugs?: Set<string>,
): PopularVenueRail[] {
  return [...bySlug.values()]
    .filter((v) => v.setCount >= 1 && !excludeSlugs?.has(v.slug))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.setCount - a.setCount ||
        (a.festivalRank ?? a.clubRank ?? 999) -
        (b.festivalRank ?? b.clubRank ?? 999),
    )
    .slice(0, limit);
}

/**
 * Aggregate recent sets by event / venue (28d), preferring chart festivals.
 * Fills from 90d when the rail would otherwise be thin.
 */
export function popularVenuesThisWeek(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): PopularVenueRail[] {
  const primarySets = feed.filter((s) =>
    withinDays(s.publishedAt, POPULAR_VENUES_LOOKBACK_DAYS, nowMs),
  );
  const primary = rankVenueRails(aggregateVenues(primarySets, nowMs), limit);
  if (primary.length >= Math.min(limit, RAIL_FILL_MIN)) return primary;

  const used = new Set(primary.map((v) => v.slug));
  const fillSets = feed.filter((s) =>
    withinDays(s.publishedAt, POPULAR_VENUES_FILL_DAYS, nowMs),
  );
  const fill = rankVenueRails(
    aggregateVenues(fillSets, nowMs),
    limit - primary.length,
    used,
  );
  return [...primary, ...fill];
}

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
    .filter(
      (s) =>
        isCompleteTracklist(s) &&
        isFestivalSeasonSet(
          {
            eventSlug: s.eventSlug,
            editionStartsAt: s.editionStartsAt,
            editionEndsAt: s.editionEndsAt,
            publishedAt: s.publishedAt,
            type: s.type,
          },
          21,
          nowMs,
        ),
    )
    .map(toRadarFields);
  return diversifyByEvent(pickRadarPicks(pool, limit * 2, nowMs), 2).slice(
    0,
    limit,
  );
}

/** Mostly-identified non-festival-story sets from 7 days, fill from 14 when thin. */
export function newThisWeekSets(
  feed: FeedItem[],
  limit = 9,
  nowMs = Date.now(),
): FeedItem[] {
  const pick = (days: number, exclude: Set<string>) =>
    feed
      .filter(
        (s) =>
          isCompleteTracklist(s) &&
          isFeedLeadCard(s) &&
          !isRadioFiller(s, { festivalWeek: festivalWeekActive(nowMs) }) &&
          isRecentPerformance(s, days, nowMs) &&
          !isFestivalStorySet(s, nowMs) &&
          !exclude.has(s.id),
      )
      .sort(compareFeedPriority);
  const primary = pick(7, new Set()).slice(0, limit);
  if (primary.length >= Math.min(limit, MIN_RAIL_SHOW)) return primary;
  const used = new Set(primary.map((s) => s.id));
  return [...primary, ...pick(14, used)].slice(0, limit);
}
