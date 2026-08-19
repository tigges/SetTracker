/**
 * Visual homepage pickers — radar proof cards, collage faces, setgraph ticks.
 * Client-safe (no Prisma).
 */

import {
  compareFeedPriority,
  dedupeNearDuplicates,
  isRadarCandidate,
  pickRadarPicks,
} from "./feedPriority";
import { collapseHostTwins, identifiedRatio } from "./feedQuality";
import { detectPlaybackHost } from "./playback";
import { setDisplayThumb } from "./setBrowse";
import { STATUS_ORDER, type IdStatus } from "./status";

export type LandingFace = {
  src: string;
  label: string;
  accent?: string;
  href?: string;
};

export type LandingSetFields = {
  id: string;
  slug?: string;
  title: string;
  imageUrl?: string | null;
  eventImageUrl?: string | null;
  eventName?: string | null;
  eventSlug?: string | null;
  primaryDj?: {
    name: string;
    slug: string;
    accent?: string;
    imageUrl?: string | null;
  } | null;
  primaryDjSlug?: string | null;
  publishedAt: Date | string;
  durationSec: number;
  trackCount?: number | null;
  densitySeverity?: "ok" | "thin" | "severe" | null;
  sourceName?: string | null;
  seriesName?: string | null;
  playbackUrl?: string | null;
  dominantProvenance?: string | null;
  statusCounts: Partial<Record<IdStatus, number>>;
  venueTier?: "festival" | "club" | "livestream" | "radio" | "other" | null;
  top100Rank?: number | null;
  festivalRank?: number | null;
  clubRank?: number | null;
  performedAt?: Date | string | null;
  editionYear?: number | null;
};

function withLandingKeys<T extends LandingSetFields>(s: T) {
  return {
    ...s,
    primaryDjSlug: s.primaryDjSlug ?? s.primaryDj?.slug ?? null,
    identifiedRatio: identifiedRatio(s.statusCounts),
  };
}

function looksLikeRelive(s: {
  title?: string | null;
  sourceName?: string | null;
  seriesName?: string | null;
}): boolean {
  return /\brelive\b/i.test(
    [s.seriesName, s.sourceName, s.title].filter(Boolean).join(" "),
  );
}

/**
 * Homepage teasers should click through to something that plays.
 * SoundCloud / Mixcloud first. Official YouTube next. Relives last —
 * festival Relives often keep a watch URL after UMG blocks the embed.
 */
export function landingPlaybackTier(s: {
  playbackUrl?: string | null;
  title?: string | null;
  sourceName?: string | null;
  seriesName?: string | null;
}): 0 | 1 | 2 | 3 {
  const host = detectPlaybackHost(s.playbackUrl);
  if (host === "soundcloud" || host === "mixcloud") return 3;
  if (host === "youtube") return looksLikeRelive(s) ? 1 : 2;
  return 0;
}

/** Keep the best playback class that still leaves a non-empty pool. */
export function preferLandingPlayback<T extends LandingSetFields>(
  pool: T[],
): T[] {
  if (pool.length === 0) return pool;
  const best = Math.max(...pool.map((s) => landingPlaybackTier(s)));
  if (best <= 0) return pool;
  const kept = pool.filter((s) => landingPlaybackTier(s) >= best);
  return kept.length > 0 ? kept : pool;
}

/** Three proof sets: Radar first, then feed priority so the landing never goes blank. */
export function pickLandingSets<T extends LandingSetFields>(
  feed: T[],
  limit = 3,
  nowMs = Date.now(),
): T[] {
  if (limit <= 0 || feed.length === 0) return [];
  const mapped = collapseHostTwins(
    dedupeNearDuplicates(feed.map((s) => withLandingKeys(s))),
  );
  const radar = pickRadarPicks(
    preferLandingPlayback(mapped.filter((s) => isRadarCandidate(s, nowMs))),
    limit,
    nowMs,
  );
  if (radar.length >= limit) return radar;
  const used = new Set(radar.map((s) => s.id));
  const playableRest = preferLandingPlayback(
    mapped.filter((s) => !used.has(s.id)),
  ).sort(compareFeedPriority);
  const out = [...radar, ...playableRest];
  if (out.length >= limit) return out.slice(0, limit);
  const usedAll = new Set(out.map((s) => s.id));
  const filler = mapped
    .filter((s) => !usedAll.has(s.id))
    .sort(compareFeedPriority);
  return [...out, ...filler].slice(0, limit);
}

/** Unique image faces, first-seen wins. Skips empty / duplicate src. */
export function pickVisualFaces(
  items: Array<{
    src?: string | null;
    label: string;
    accent?: string;
    href?: string;
  }>,
  limit: number,
): LandingFace[] {
  const out: LandingFace[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const src = item.src?.trim();
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push({
      src,
      label: item.label,
      accent: item.accent,
      href: item.href,
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function pickVenueMosaic(
  venues: Array<{
    slug: string;
    name: string;
    kind: string;
    imageUrl?: string | null;
    accent?: string;
    isBrowseReady?: boolean;
  }>,
  kind: string,
  limit = 6,
): LandingFace[] {
  return pickVisualFaces(
    venues
      .filter((v) => v.kind === kind && v.isBrowseReady !== false)
      .map((v) => ({
        src: v.imageUrl,
        label: v.name,
        accent: v.accent,
        href: `/events/${v.slug}`,
      })),
    limit,
  );
}

export function pickDjFaces(
  djs: Array<{
    slug: string;
    name: string;
    imageUrl?: string | null;
    accent?: string;
    isBrowseReady?: boolean;
    setCount?: number;
  }>,
  limit = 10,
): LandingFace[] {
  const ranked = [...djs]
    .filter((d) => d.isBrowseReady !== false)
    .sort((a, b) => (b.setCount ?? 0) - (a.setCount ?? 0));
  return pickVisualFaces(
    ranked.map((d) => ({
      src: d.imageUrl,
      label: d.name,
      accent: d.accent,
      href: `/djs/${d.slug}`,
    })),
    limit,
  );
}

/** Overlapping hero wall: set covers, then DJ / venue portraits. */
export function pickHeroCollage(opts: {
  sets: LandingSetFields[];
  djs: LandingFace[];
  venues: LandingFace[];
  limit?: number;
}): LandingFace[] {
  const setFaces = opts.sets.flatMap((s) => {
    const faces: Array<{
      src?: string | null;
      label: string;
      accent?: string;
      href?: string;
    }> = [];
    const cover = setDisplayThumb({
      imageUrl: s.imageUrl,
      primaryDjImageUrl: s.primaryDj?.imageUrl,
      eventImageUrl: s.eventImageUrl,
      primaryDjSlug: s.primaryDj?.slug,
    });
    if (cover) {
      faces.push({
        src: cover,
        label: s.title,
        accent: s.primaryDj?.accent,
        href: s.slug ? `/sets/${s.slug}` : undefined,
      });
    }
    if (s.primaryDj?.imageUrl && s.primaryDj.imageUrl !== cover) {
      faces.push({
        src: s.primaryDj.imageUrl,
        label: s.primaryDj.name,
        accent: s.primaryDj.accent,
        href: `/djs/${s.primaryDj.slug}`,
      });
    }
    if (s.eventImageUrl && s.eventSlug && s.eventImageUrl !== cover) {
      faces.push({
        src: s.eventImageUrl,
        label: s.eventName ?? s.eventSlug,
        href: `/events/${s.eventSlug}`,
      });
    }
    return faces;
  });
  return pickVisualFaces(
    [...setFaces, ...opts.djs, ...opts.venues],
    opts.limit ?? 8,
  );
}

/**
 * Expand status counts into cue-like ticks (amber / magenta / teal / grey).
 * Keeps at least one tick per non-zero status.
 */
export function setgraphTicks(
  counts: Partial<Record<IdStatus, number>>,
  maxTicks = 40,
): IdStatus[] {
  const present = STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0);
  if (present.length === 0 || maxTicks <= 0) return [];
  const total = present.reduce((n, s) => n + (counts[s] ?? 0), 0);
  const raw = present.map((s) => ({
    status: s,
    n: Math.max(1, Math.round(((counts[s] ?? 0) / total) * maxTicks)),
  }));
  while (raw.reduce((n, r) => n + r.n, 0) > maxTicks) {
    const largest = raw.reduce((a, b) => (b.n > a.n ? b : a));
    if (largest.n <= 1) break;
    largest.n -= 1;
  }
  const ticks: IdStatus[] = [];
  for (const row of raw) {
    for (let i = 0; i < row.n; i++) ticks.push(row.status);
  }
  return ticks.slice(0, maxTicks);
}

export function mergeStatusCounts(
  rows: Array<Partial<Record<IdStatus, number>>>,
): Record<IdStatus, number> {
  const out: Record<IdStatus, number> = {
    identified: 0,
    unresolved_id: 0,
    community_resolved: 0,
    unparsed: 0,
  };
  for (const row of rows) {
    for (const s of STATUS_ORDER) out[s] += row[s] ?? 0;
  }
  return out;
}
