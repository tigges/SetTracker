/**
 * Transparent home-feed ranking — client-safe helpers.
 *
 * Rank *resolution* (chart JSON) lives in `feedPriorityResolve.ts` so
 * SetCard / SetFeed never pull seed data or Node builtins into the browser.
 *
 * Within This week / Earlier we sort:
 *   1) Tracklist completeness (ok → thin → severe)
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
