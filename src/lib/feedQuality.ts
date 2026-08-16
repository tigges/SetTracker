/**
 * Homepage feed quality — twins, week buckets, provenance hints.
 * Type matching is for ingest/stats, not consumer chips.
 * Client-safe (no Prisma / Node fs).
 */

import { nearDuplicateKey } from "./feedPriority";
import type { DensitySeverity } from "./setDensity";
import type { IdStatus } from "./status";

const DAY_MS = 24 * 60 * 60 * 1000;

export type FeedTypeFilter = "all" | "festival" | "radio" | "mix";

export type ProvenanceHint = "1001tl" | "comments" | "credits" | "fingerprint" | "source";

export const PROVENANCE_HINT_LABEL: Record<ProvenanceHint, string> = {
  "1001tl": "1001tl",
  comments: "comments",
  credits: "credits",
  fingerprint: "fingerprint",
  source: "source",
};

export function identifiedRatio(counts: Partial<Record<IdStatus, number>> | null | undefined): number {
  if (!counts) return 0;
  const total =
    (counts.identified ?? 0) +
    (counts.unresolved_id ?? 0) +
    (counts.community_resolved ?? 0) +
    (counts.unparsed ?? 0);
  if (total === 0) return 0;
  return ((counts.identified ?? 0) + (counts.community_resolved ?? 0)) / total;
}

export function setMatchesTypeFilter(
  s: { type?: string | null; venueTier?: string | null },
  type: FeedTypeFilter,
): boolean {
  if (type === "all") return true;
  if (type === "festival") {
    return s.type === "festival" || s.venueTier === "festival";
  }
  if (type === "radio") return s.type === "radio" || s.venueTier === "radio";
  return s.type === "mix" || s.type === "soundcloud";
}

export function tracklistProvenanceHint(
  sourceName?: string | null,
  slug?: string | null,
  dominantProvenance?: string | null,
): ProvenanceHint {
  const p = (dominantProvenance || "").toLowerCase();
  if (p === "1001tl") return "1001tl";
  if (p === "fingerprint") return "fingerprint";
  if (p === "soundcloud" || p === "hearthis") return "comments";
  if (p === "youtube" || p === "insomniac") return "credits";
  const n = (sourceName || "").toLowerCase();
  if (n.includes("1001")) return "1001tl";
  if (n.includes("soundcloud") || n.includes("hearthis")) return "comments";
  if (n.includes("youtube") || n.includes("insomniac")) return "credits";
  if (slug?.startsWith("sc-") || slug?.startsWith("ht-")) return "comments";
  if (slug?.startsWith("yt-")) return "credits";
  return "source";
}

const TITLE_EVENT: [RegExp, string][] = [
  [/tomorrowland/i, "tomorrowland"],
  [/\bultra\b/i, "ultra-miami"],
  [/\bedc\b/i, "edc-lv"],
  [/coachella/i, "coachella"],
  [/creamfields/i, "creamfields"],
  [/lollapalooza/i, "lollapalooza"],
  [/untold/i, "untold"],
  [/parookaville/i, "parookaville"],
  [/hard\s*summer/i, "hard-summer"],
  [/mysteryland/i, "mysteryland"],
  [/defqon/i, "defqon1"],
];

export function eventDiversityKey(s: {
  eventSlug?: string | null;
  title: string;
}): string | null {
  if (s.eventSlug) return s.eventSlug;
  for (const [re, slug] of TITLE_EVENT) {
    if (re.test(s.title)) return slug;
  }
  return null;
}

export function diversifyByEvent<
  T extends { id: string; eventSlug?: string | null; title: string },
>(items: T[], maxPerEvent = 2): T[] {
  const counts = new Map<string, number>();
  const out: T[] = [];
  for (const s of items) {
    const key = eventDiversityKey(s) || `id:${s.id}`;
    const n = counts.get(key) ?? 0;
    if (n >= maxPerEvent) continue;
    counts.set(key, n + 1);
    out.push(s);
  }
  return out;
}

export function hostTwinKey(s: {
  primaryDjSlug?: string | null;
  eventSlug?: string | null;
  title: string;
  publishedAt: Date | string;
  durationSec: number;
}): string {
  const dj = (s.primaryDjSlug || "").toLowerCase();
  const ev = eventDiversityKey(s) || "";
  const week = Math.floor(new Date(s.publishedAt).getTime() / (7 * DAY_MS));
  const dur = Math.round((s.durationSec || 0) / 300) * 300;
  if (dj && ev) return `ev|${dj}|${ev}|${week}|${dur}`;
  return `nd|${nearDuplicateKey(s.title, s.primaryDjSlug)}|${week}`;
}

function twinScore(s: {
  slug?: string;
  trackCount?: number | null;
  densitySeverity?: DensitySeverity | null;
  sourceName?: string | null;
  dominantProvenance?: string | null;
}): number {
  let n = 0;
  if (s.densitySeverity === "ok") n += 50;
  else if (s.densitySeverity === "thin") n += 16;
  n += Math.min(40, s.trackCount ?? 0);
  const hint = tracklistProvenanceHint(
    s.sourceName,
    s.slug,
    s.dominantProvenance,
  );
  if (hint === "1001tl") n += 30;
  if (s.slug?.startsWith("yt-")) n += 8;
  return n;
}

export function collapseHostTwins<
  T extends {
    id: string;
    slug?: string;
    title: string;
    primaryDjSlug?: string | null;
    eventSlug?: string | null;
    publishedAt: Date | string;
    durationSec: number;
    trackCount?: number | null;
    densitySeverity?: DensitySeverity | null;
    sourceName?: string | null;
    dominantProvenance?: string | null;
  },
>(items: T[]): T[] {
  const best = new Map<string, T>();
  for (const s of items) {
    const key = hostTwinKey(s);
    const prev = best.get(key);
    if (!prev || twinScore(s) > twinScore(prev)) best.set(key, s);
  }
  const keep = new Set([...best.values()].map((s) => s.id));
  return items.filter((s) => keep.has(s.id));
}

export function deepWeekLabel(d: Date | string, nowMs = Date.now()): string {
  const days = Math.floor((nowMs - new Date(d).getTime()) / DAY_MS);
  if (days < 7) return "This week";
  if (days < 14) return "Last week";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function groupByDeepWeek<T extends { publishedAt: Date | string }>(
  items: T[],
  nowMs = Date.now(),
): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = [];
  const index = new Map<string, T[]>();
  for (const s of items) {
    const label = deepWeekLabel(s.publishedAt, nowMs);
    let bucket = index.get(label);
    if (!bucket) {
      bucket = [];
      index.set(label, bucket);
      groups.push({ label, items: bucket });
    }
    bucket.push(s);
  }
  return groups;
}

export function compareNeedsIds(
  a: { statusCounts?: Partial<Record<IdStatus, number>> | null; publishedAt: Date | string },
  b: { statusCounts?: Partial<Record<IdStatus, number>> | null; publishedAt: Date | string },
): number {
  const ra = identifiedRatio(a.statusCounts);
  const rb = identifiedRatio(b.statusCounts);
  if (ra !== rb) return ra - rb;
  const ua = a.statusCounts?.unresolved_id ?? 0;
  const ub = b.statusCounts?.unresolved_id ?? 0;
  if (ua !== ub) return ub - ua;
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}
