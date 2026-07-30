/**
 * Transparent home-feed ranking — client-safe helpers.
 *
 * Rank *resolution* (chart JSON) lives in `feedPriorityResolve.ts` so
 * SetCard / SetFeed never pull seed data or Node builtins into the browser.
 *
 * Within This week / Earlier — and on event/festival profile grids — we sort:
 *   1) Tracklist completeness (ok → thin → severe; empty last)
 *   2) DJ Mag Top 100 DJs (lower chart rank first)
 *   3) DJ Mag Top 100 Festivals (linked event; lower rank first)
 *   4) Venue class: festival → club → livestream → radio → other
 *   5) Recency
 */

import type { DensitySeverity } from "./setDensity";

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

const DAY_MS = 24 * 60 * 60 * 1000;

export type RadarPickFields = FeedPriorityFields & {
  id: string;
  primaryDjSlug?: string | null;
  eventSlug?: string | null;
  /** Optional ID health 0–1 (identified / total plays). */
  identifiedRatio?: number | null;
};

/**
 * Score for the Radar picks cluster (higher = better).
 * Mixes completeness, Top 100 / festival chart, venue class, and recency —
 * so decade-old #1 Ultra archives don't crowd out recent festival / club sets.
 */
export function radarPickScore(s: RadarPickFields, nowMs = Date.now()): number {
  let score = 0;

  if (s.densitySeverity === "ok") score += 42;
  else if (s.densitySeverity === "thin") score += 16;
  else score -= 8;

  if (s.top100Rank != null) {
    // #1 ≈ +28, #50 ≈ +18, #100 ≈ +8 — chart helps, doesn't dominate.
    score += Math.max(0, 28 - (s.top100Rank - 1) * 0.2);
  }
  if (s.festivalRank != null) {
    score += Math.max(0, 22 - (s.festivalRank - 1) * 0.12);
  }

  if (s.venueTier === "festival") score += 12;
  else if (s.venueTier === "club") score += 8;
  else if (s.venueTier === "livestream") score += 4;
  else if (s.venueTier === "radio") score += 2;

  const ageDays =
    (nowMs - new Date(s.publishedAt).getTime()) / DAY_MS;
  if (ageDays <= 90) score += 38;
  else if (ageDays <= 365) score += 26;
  else if (ageDays <= 730) score += 12;
  else if (ageDays <= 365 * 4) score += 2;
  else score -= 22; // deep archive — only fill if nothing else qualifies

  if (s.identifiedRatio != null) {
    score += s.identifiedRatio * 14;
  }

  return score;
}

/**
 * Greedy Radar cluster: highest score, at most one set per DJ and per event.
 * Prevents "David Guetta Ultra × 9 years" style repetition.
 */
export function pickRadarPicks<T extends RadarPickFields>(
  candidates: T[],
  limit: number,
  nowMs = Date.now(),
): T[] {
  if (limit <= 0 || candidates.length === 0) return [];

  const ranked = [...candidates].sort((a, b) => {
    const ds = radarPickScore(b, nowMs) - radarPickScore(a, nowMs);
    if (ds !== 0) return ds;
    return compareFeedPriority(a, b);
  });

  const out: T[] = [];
  const usedDj = new Set<string>();
  const usedEvent = new Set<string>();

  for (const s of ranked) {
    if (out.length >= limit) break;
    const dj = (s.primaryDjSlug || "").trim() || `id:${s.id}`;
    if (usedDj.has(dj)) continue;
    const ev = (s.eventSlug || "").trim();
    if (ev && usedEvent.has(ev)) continue;
    out.push(s);
    usedDj.add(dj);
    if (ev) usedEvent.add(ev);
  }

  // Fill remaining slots still unique by DJ (event constraint softens).
  if (out.length < limit) {
    const have = new Set(out.map((s) => s.id));
    for (const s of ranked) {
      if (out.length >= limit) break;
      if (have.has(s.id)) continue;
      const dj = (s.primaryDjSlug || "").trim() || `id:${s.id}`;
      if (usedDj.has(dj)) continue;
      out.push(s);
      usedDj.add(dj);
      have.add(s.id);
    }
  }

  return out;
}
