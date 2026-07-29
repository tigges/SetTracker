/**
 * Server-side feed rank resolution (chart seeds + density).
 * Keep out of client components — import only from queries / enrich.
 */

import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import {
  resolveVenueTier,
  type FeedSpotlight,
  type VenueTier,
} from "./feedPriority";
import {
  assessSetDensity,
  type DensitySeverity,
} from "./setDensity";

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
