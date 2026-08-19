/**
 * Transparent home-feed ranking — client-safe helpers.
 *
 * Rank *resolution* (chart JSON) lives in `feedPriorityResolve.ts` so
 * SetCard / SetFeed never pull seed data or Node builtins into the browser.
 *
 * Spotlight rails (`compareFeedPriority`) sort:
 *   1) Tracklist completeness (ok → thin → severe; empty last)
 *   2) ID coverage (mostly identified → partial → sparse)
 *   3) Performance year (performedAt / edition year / publishedAt — never ingest)
 *   4) Live room (festival / club) ahead of radio; uncharted radio last
 *   5) DJ Mag Top 100 DJs (lower chart rank first)
 *   6) DJ Mag Top 100 Festivals (linked event; lower rank first)
 *   7) Venue class: festival → club → livestream → radio → other
 *   8) Performance date
 *
 * Deep catalog leftovers (`compareDeepCatalog`) put physical live ahead of
 * radio fillers, then date, IDs, density, chart. Uncharted radio with a
 * reasonable ID fill is leftover fodder — not a spotlight card.
 * Radar rejects radio. New this week drops uncharted radio.
 *
 * Event/festival profile grids (`sortEventSets`) list this year first
 * (today → upcoming → latest finished), then older title-years descending.
 * Completeness is a same-day tie-break only. No year headings.
 */

import { DENSITY_MIN_DURATION_SEC, type DensitySeverity } from "./setDensity";
import {
  comparePlaceSetTimes,
  groupPlaceSetsByYear,
  sortPlaceSets,
  yearFromSetTitle,
} from "./placeTimeline";
import type { IdStatus } from "./status";

export { yearFromSetTitle };

export type VenueTier =
  | "festival"
  | "club"
  | "livestream"
  | "radio"
  | "other";

export type FeedSpotlight = "top100" | "top-festival" | "top-club";

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
  "top-club": {
    short: "Club",
    label: "Top club",
    title: "Set is linked to a DJ Mag Top 100 Club",
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

/** Festival or club — a physical room, not a studio show. */
export function isPhysicalLive(s: {
  venueTier?: VenueTier | null;
}): boolean {
  return s.venueTier === "festival" || s.venueTier === "club";
}

/**
 * Weekly radio from a DJ who is not on the current Top 100.
 * Identified episodes fill Deep catalog after live sets.
 */
export function isRadioFiller(s: {
  venueTier?: VenueTier | null;
  top100Rank?: number | null;
}): boolean {
  return s.venueTier === "radio" && s.top100Rank == null;
}

/**
 * Homepage prominence. Lower = more visible.
 * 0 live room · 1 livestream · 2 chart radio / mix · 3 uncharted radio filler
 */
export function displayLane(s: {
  venueTier?: VenueTier | null;
  top100Rank?: number | null;
}): number {
  if (isPhysicalLive(s)) return 0;
  if (s.venueTier === "livestream") return 1;
  if (s.venueTier === "radio" && s.top100Rank != null) return 2;
  if (s.venueTier === "radio") return 3;
  return 2;
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

export type FeedPriorityFields = {
  densitySeverity?: DensitySeverity | null;
  top100Rank?: number | null;
  festivalRank?: number | null;
  clubRank?: number | null;
  venueTier?: VenueTier | null;
  publishedAt: Date | string;
  /** Festival weekend / edition date when known — not site ingest time. */
  performedAt?: Date | string | null;
  editionYear?: number | null;
  statusCounts?: StatusCountFields;
  trackCount?: number | null;
};

/**
 * Title names an older festival year and none of the printed years are
 * current/last-year — archive playback, even if YouTube reuploaded it this week.
 */
export function isArchiveTitledSet(
  title: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  const year = yearFromSetTitle(title, nowMs);
  if (year == null) return false;
  return year < new Date(nowMs).getUTCFullYear() - 1;
}

/**
 * When the set was played (or first published by the source).
 * Never uses Prisma createdAt / site ingest time.
 * Title year beats edition/upload so a 2018 playback remapped onto a 2026
 * edition does not rank as this-year.
 */
export function setPerformanceTime(s: {
  publishedAt: Date | string;
  performedAt?: Date | string | null;
  editionYear?: number | null;
  title?: string | null;
}): number {
  if (s.performedAt) {
    const t = new Date(s.performedAt).getTime();
    if (Number.isFinite(t)) return t;
  }
  const titleYear = yearFromSetTitle(s.title);
  if (titleYear != null) return Date.UTC(titleYear, 6, 1);
  if (s.editionYear && s.editionYear > 1990 && s.editionYear < 2100) {
    return Date.UTC(s.editionYear, 6, 1);
  }
  const t = new Date(s.publishedAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function setPerformanceYear(
  s: {
    publishedAt: Date | string;
    performedAt?: Date | string | null;
    editionYear?: number | null;
    title?: string | null;
  },
  nowMs = Date.now(),
): number {
  const y = new Date(setPerformanceTime(s)).getUTCFullYear();
  return Number.isFinite(y) ? y : new Date(nowMs).getUTCFullYear();
}

/** Within an age section — complete → IDs → year → live room → chart → date. */
export function compareFeedPriority(
  a: FeedPriorityFields,
  b: FeedPriorityFields,
): number {
  const da = DENSITY_RANK[a.densitySeverity ?? "ok"];
  const db = DENSITY_RANK[b.densitySeverity ?? "ok"];
  if (da !== db) return da - db;

  const ia = idCoverageTier(a.statusCounts, a.trackCount ?? 0);
  const ib = idCoverageTier(b.statusCounts, b.trackCount ?? 0);
  if (ia !== ib) return ia - ib;

  const ya = setPerformanceYear(a);
  const yb = setPerformanceYear(b);
  if (ya !== yb) return yb - ya;

  const la = displayLane(a);
  const lb = displayLane(b);
  if (la !== lb) return la - lb;

  const ta = a.top100Rank ?? 999;
  const tb = b.top100Rank ?? 999;
  if (ta !== tb) return ta - tb;

  const fa = a.festivalRank ?? 999;
  const fb = b.festivalRank ?? 999;
  if (fa !== fb) return fa - fb;

  const ca = a.clubRank ?? 999;
  const cb = b.clubRank ?? 999;
  if (ca !== cb) return ca - cb;

  const va = VENUE_RANK[a.venueTier ?? "other"];
  const vb = VENUE_RANK[b.venueTier ?? "other"];
  if (va !== vb) return va - vb;

  return setPerformanceTime(b) - setPerformanceTime(a);
}

/** Leftover Deep catalog: live rooms first, then date, IDs, density, chart. */
export function compareDeepCatalog(
  a: FeedPriorityFields,
  b: FeedPriorityFields,
): number {
  const la = displayLane(a);
  const lb = displayLane(b);
  if (la !== lb) return la - lb;

  const ta = setPerformanceTime(a);
  const tb = setPerformanceTime(b);
  if (ta !== tb) return tb - ta;

  const ia = idCoverageTier(a.statusCounts, a.trackCount ?? 0);
  const ib = idCoverageTier(b.statusCounts, b.trackCount ?? 0);
  if (ia !== ib) return ia - ib;

  const da = DENSITY_RANK[a.densitySeverity ?? "ok"];
  const db = DENSITY_RANK[b.densitySeverity ?? "ok"];
  if (da !== db) return da - db;

  const ra = a.top100Rank ?? 999;
  const rb = b.top100Rank ?? 999;
  if (ra !== rb) return ra - rb;

  const fa = a.festivalRank ?? 999;
  const fb = b.festivalRank ?? 999;
  if (fa !== fb) return fa - fb;

  const ca = a.clubRank ?? 999;
  const cb = b.clubRank ?? 999;
  if (ca !== cb) return ca - cb;

  return 0;
}

export function isThisPerformanceYear(
  s: FeedPriorityFields,
  nowMs = Date.now(),
): boolean {
  return setPerformanceYear(s, nowMs) >= new Date(nowMs).getUTCFullYear();
}

export type StatusCountFields = Partial<Record<IdStatus, number>> | null | undefined;

/** Identified + community-resolved play count (orange / teal on the status bar). */
export function resolvedIdCount(counts: StatusCountFields): number {
  if (!counts) return 0;
  return (counts.identified ?? 0) + (counts.community_resolved ?? 0);
}

/** Identified + community-resolved share of logged plays (0–1). */
export function resolvedIdRatio(
  counts: StatusCountFields,
  trackCount = 0,
): number {
  if (!counts) return 0;
  const total =
    (counts.identified ?? 0) +
    (counts.unresolved_id ?? 0) +
    (counts.community_resolved ?? 0) +
    (counts.unparsed ?? 0);
  const n = total > 0 ? total : trackCount;
  if (n <= 0) return 0;
  return resolvedIdCount(counts) / n;
}

/**
 * Homepage ID fill:
 *   0 = mostly tracked (≥70% identified / community-resolved)
 *   1 = half-plus (≥50%)
 *   2 = sparse / few IDs
 */
export function idCoverageTier(
  counts: StatusCountFields,
  trackCount = 0,
): 0 | 1 | 2 {
  const ratio = resolvedIdRatio(counts, trackCount);
  if (ratio >= 0.7) return 0;
  if (ratio >= 0.5) return 1;
  return 2;
}

/**
 * ID quality bucket for event grids:
 *   0 = has identified / community-resolved tracks
 *   1 = tracklist present but only unresolved / unparsed (all-pink/grey)
 *   2 = empty tracklist
 */
export function idQualityTier(
  counts: StatusCountFields,
  trackCount = 0,
): 0 | 1 | 2 {
  if (resolvedIdCount(counts) > 0) return 0;
  if (trackCount > 0) return 1;
  return 2;
}

export type EventSetPriorityFields = FeedPriorityFields & {
  statusCounts?: StatusCountFields;
  trackCount?: number | null;
  title?: string | null;
};

function placeSetQuality(s: EventSetPriorityFields): number {
  const d = DENSITY_RANK[s.densitySeverity ?? "ok"];
  const q = idQualityTier(s.statusCounts, s.trackCount ?? 0);
  // q * 1000 keeps identified (q=0, fill ≤999) ahead of unresolved (q=1).
  const idFill =
    q === 0 ? Math.max(0, 999 - resolvedIdCount(s.statusCounts)) : 0;
  return d * 100_000 + q * 1_000 + idFill;
}

/**
 * Place-page playback grid: today → upcoming ↑ → past ↓.
 * Completeness / IDs only separate sets on the same UTC day.
 */
export function compareEventSetPriorityAt(
  nowMs: number,
): (a: EventSetPriorityFields, b: EventSetPriorityFields) => number {
  return (a, b) =>
    comparePlaceSetTimes(a, b, nowMs, placeSetQuality(a) - placeSetQuality(b));
}

export function compareEventSetPriority(
  a: EventSetPriorityFields,
  b: EventSetPriorityFields,
): number {
  return compareEventSetPriorityAt(Date.now())(a, b);
}

/** Place-page set grid: title-year order, newest first. Never remapped edition year. */
export function groupEventSetsByYear<T extends EventSetPriorityFields>(
  sets: T[],
  nowMs: number,
) {
  return groupPlaceSetsByYear(sets, nowMs, placeSetQuality);
}

export function sortEventSets<T extends EventSetPriorityFields>(
  sets: T[],
  nowMs: number,
) {
  return sortPlaceSets(sets, nowMs, placeSetQuality);
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
 * Mixes completeness, performance year, Top 100 / festival chart, and recency —
 * so last year's #1 Ultra does not crowd out this year's sets.
 */
export function radarPickScore(s: RadarPickFields, nowMs = Date.now()): number {
  let score = 0;

  if (s.densitySeverity === "ok") score += 42;
  else if (s.densitySeverity === "thin") score += 16;
  else score -= 8;

  const nowYear = new Date(nowMs).getUTCFullYear();
  const ageYears = nowYear - setPerformanceYear(s, nowMs);
  if (ageYears <= 0) score += 52;
  else if (ageYears === 1) score += 10;
  else score -= Math.min(40, ageYears * 14);

  if (s.top100Rank != null) {
    // #1 ≈ +28, #50 ≈ +18, #100 ≈ +8 — chart helps, doesn't dominate year.
    score += Math.max(0, 28 - (s.top100Rank - 1) * 0.2);
  }
  if (s.festivalRank != null) {
    score += Math.max(0, 22 - (s.festivalRank - 1) * 0.12);
  }
  if (s.clubRank != null) {
    score += Math.max(0, 18 - (s.clubRank - 1) * 0.12);
  }

  if (s.venueTier === "festival") score += 12;
  else if (s.venueTier === "club") score += 8;
  else if (s.venueTier === "livestream") score += 4;
  else if (s.venueTier === "radio") score += s.top100Rank != null ? 2 : -8;

  const ageDays = (nowMs - setPerformanceTime(s)) / DAY_MS;
  if (ageDays <= 90) score += 38;
  else if (ageDays <= 365) score += 26;
  else if (ageDays <= 730) score += 12;
  else if (ageDays <= 365 * 4) score += 2;
  else score -= 22;

  const idRatio =
    s.identifiedRatio ?? resolvedIdRatio(s.statusCounts, s.trackCount ?? 0);
  // Mostly-orange bars beat chart fame when the strip is mostly grey/pink.
  score += idRatio * 40;
  score -= idCoverageTier(s.statusCounts, s.trackCount ?? 0) * 18;

  return score;
}

/**
 * Radar pool: this performance year, dense tracklist, at least half identified,
 * and a Top 100 DJ or top festival/club. Sparse / all-pink parses stay in Deep.
 */
export function isRadarCandidate(
  s: FeedPriorityFields & {
    statusCounts?: StatusCountFields;
    trackCount?: number | null;
    durationSec?: number | null;
  },
  nowMs = Date.now(),
): boolean {
  if ((s.densitySeverity ?? "ok") !== "ok") return false;
  // Short uploads are density-ok by design; Radar still wants a real set.
  const durationSec = s.durationSec ?? 0;
  if (durationSec > 0 && durationSec < DENSITY_MIN_DURATION_SEC) {
    return false;
  }
  if (setPerformanceYear(s, nowMs) < new Date(nowMs).getUTCFullYear()) {
    return false;
  }
  if (idCoverageTier(s.statusCounts, s.trackCount ?? 0) > 1) return false;
  if (s.venueTier === "radio") return false;
  return s.top100Rank != null || s.festivalRank != null || s.clubRank != null;
}

/**
 * Greedy Radar cluster: this-year candidates, at most one set per DJ and per event.
 * Prevents "David Guetta Ultra × 9 years" style repetition.
 */
export function pickRadarPicks<T extends RadarPickFields>(
  candidates: T[],
  limit: number,
  nowMs = Date.now(),
): T[] {
  if (limit <= 0 || candidates.length === 0) return [];

  const yearNow = new Date(nowMs).getUTCFullYear();
  const currentYear = candidates.filter(
    (s) => setPerformanceYear(s, nowMs) >= yearNow,
  );
  const pool = currentYear.length > 0 ? currentYear : [];
  if (pool.length === 0) return [];

  const ranked = [...pool].sort((a, b) => {
    const y = setPerformanceYear(b, nowMs) - setPerformanceYear(a, nowMs);
    if (y !== 0) return y;
    const ca = idCoverageTier(a.statusCounts, a.trackCount ?? 0);
    const cb = idCoverageTier(b.statusCounts, b.trackCount ?? 0);
    if (ca !== cb) return ca - cb;
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

/** Collapse "Friendship Mix" festival + mix dupes from the same DJ. */
const MONTH =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/g;

export function nearDuplicateKey(
  title: string,
  djSlug?: string | null,
): string {
  const slug = (djSlug || "").toLowerCase();
  const artist = slug.replace(/-/g, " ").trim();
  let t = title
    .toLowerCase()
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\b20\d{2}\b/g, " ")
    .replace(/\bwe\s*[12]\b/g, " ")
    .replace(MONTH, " ")
    .replace(/[^a-z0-9]+/g, " ");
  if (artist) {
    t = t.replace(new RegExp(`\\b${artist.replace(/\s+/g, "\\s+")}\\b`, "g"), " ");
  }
  t = t
    .replace(/\b(with|ft|feat|featuring)\b/g, " ")
    .replace(/\b\d{1,2}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = t.split(" ").filter(Boolean).sort().join(" ");
  return `${slug}|${words}`;
}

export function dedupeNearDuplicates<
  T extends { id: string; title: string; primaryDjSlug?: string | null },
>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const s of items) {
    const key = nearDuplicateKey(s.title, s.primaryDjSlug);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

/** Walk a pre-sorted list and keep at most N cards per primary DJ. */
export function diversifyByArtist<
  T extends { id: string; primaryDjSlug?: string | null },
>(items: T[], maxPerDj = 1): T[] {
  return diversifyByKey(items, (s) => s.primaryDjSlug, maxPerDj);
}

/** Cap repeating series hosts (e.g. Gentlemen's Groove) in Deep catalog. */
export function diversifyBySeries<
  T extends { id: string; seriesName?: string | null },
>(items: T[], maxPerSeries = 1): T[] {
  return diversifyByKey(items, (s) => s.seriesName, maxPerSeries);
}

function diversifyByKey<T extends { id: string }>(
  items: T[],
  keyOf: (item: T) => string | null | undefined,
  maxPer: number,
): T[] {
  const counts = new Map<string, number>();
  const out: T[] = [];
  for (const s of items) {
    const raw = (keyOf(s) || "").trim();
    const key = raw || `id:${s.id}`;
    const n = counts.get(key) ?? 0;
    if (n >= maxPer) continue;
    counts.set(key, n + 1);
    out.push(s);
  }
  return out;
}
