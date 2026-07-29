/**
 * Transparent home-feed ranking.
 *
 * Within This week / Earlier we sort:
 *   1) Tracklist completeness (ok → thin → severe)
 *   2) DJ Mag Top 100 DJs (lower chart rank first)
 *   3) DJ Mag Top 100 Festivals (linked event; lower rank first)
 *   4) Venue class: festival → club → livestream → radio → other
 *   5) Recency
 *
 * Prefer Event.kind over Set.type for venue class (Set.type over-labels
 * many YouTube uploads as "festival"). No schema changes — ranks come from
 * JSON seeds + density from durationSec/trackCount.
 */

import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import {
  assessSetDensity,
  type DensitySeverity,
} from "./setDensity";

export type VenueTier =
  | "festival"
  | "club"
  | "livestream"
  | "radio"
  | "other";

export type FeedSpotlight = "top100" | "top-festival";

export const FEED_SPOTLIGHT_META: Record<
  FeedSpotlight,
  { label: string; short: string; title: string }
> = {
  top100: {
    short: "Top 100",
    label: "DJ Mag Top 100",
    title: "Primary artist is on the DJ Mag Top 100 DJs chart",
  },
  "top-festival": {
    short: "Festival",
    label: "Top festival",
    title: "Set is linked to a DJ Mag Top 100 Festival",
  },
};

const DENSITY_RANK: Record<DensitySeverity, number> = {
  ok: 0,
  thin: 1,
  severe: 2,
};

const VENUE_RANK: Record<VenueTier, number> = {
  festival: 0,
  club: 1,
  livestream: 2,
  radio: 3,
  other: 4,
};

let cachedTop100: Map<string, number> | null = null;
let cachedFestivals: Map<string, number> | null = null;

function top100Ranks(): Map<string, number> {
  if (!cachedTop100) cachedTop100 = loadDjMagTop100RankBySlug();
  return cachedTop100;
}

function festivalRanks(): Map<string, number> {
  if (!cachedFestivals) cachedFestivals = loadDjMagFestivalRankBySlug();
  return cachedFestivals;
}

/** Map Event.kind (preferred) or Set.type fallback → venue tier. */
export function resolveVenueTier(
  eventKind?: string | null,
  setType?: string | null,
): VenueTier {
  const k = (eventKind || "").toLowerCase();
  if (k === "festival" || k === "club" || k === "livestream" || k === "radio") {
    return k;
  }
  const t = (setType || "").toLowerCase();
  if (t === "festival") return "festival";
  if (t === "radio") return "radio";
  return "other";
}

export function resolveFeedRanks(opts: {
  primaryDjSlug?: string | null;
  eventSlug?: string | null;
  eventKind?: string | null;
  setType?: string | null;
  durationSec: number;
  trackCount: number;
}): {
  densitySeverity: DensitySeverity;
  top100Rank: number | null;
  festivalRank: number | null;
  venueTier: VenueTier;
  /** Primary card label — Top 100 DJ wins over festival badge when both apply. */
  spotlight: FeedSpotlight | null;
} {
  const density = assessSetDensity({
    durationSec: opts.durationSec,
    playCount: opts.trackCount,
  });
  const djSlug = opts.primaryDjSlug?.trim() || "";
  const top100Rank = djSlug ? (top100Ranks().get(djSlug) ?? null) : null;
  const evSlug = opts.eventSlug?.trim() || "";
  const festivalRank = evSlug ? (festivalRanks().get(evSlug) ?? null) : null;
  const venueTier = resolveVenueTier(opts.eventKind, opts.setType);

  let spotlight: FeedSpotlight | null = null;
  if (top100Rank != null) spotlight = "top100";
  else if (festivalRank != null) spotlight = "top-festival";

  return {
    densitySeverity: density.severity,
    top100Rank,
    festivalRank,
    venueTier,
    spotlight,
  };
}

export type FeedPriorityFields = {
  densitySeverity?: DensitySeverity | null;
  top100Rank?: number | null;
  festivalRank?: number | null;
  venueTier?: VenueTier | null;
  publishedAt: Date | string;
};

/** Within an age section — complete → Top 100 DJ → top festival → venue → date. */
export function compareFeedPriority(
  a: FeedPriorityFields,
  b: FeedPriorityFields,
): number {
  const da = DENSITY_RANK[a.densitySeverity ?? "ok"];
  const db = DENSITY_RANK[b.densitySeverity ?? "ok"];
  if (da !== db) return da - db;

  const ta = a.top100Rank ?? 999;
  const tb = b.top100Rank ?? 999;
  if (ta !== tb) return ta - tb;

  const fa = a.festivalRank ?? 999;
  const fb = b.festivalRank ?? 999;
  if (fa !== fb) return fa - fb;

  const va = VENUE_RANK[a.venueTier ?? "other"];
  const vb = VENUE_RANK[b.venueTier ?? "other"];
  if (va !== vb) return va - vb;

  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}
