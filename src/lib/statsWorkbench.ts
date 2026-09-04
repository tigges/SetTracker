/**
 * Ranked /stats tracklist workbench.
 *
 * Lanes: first-party text → fingerprint → track IDs → optional 1001 last.
 * One set appears in one lane. Capture 1001 never outranks the others.
 *
 * /stats Auto ID renders the three automatic lanes with a per-lane quota
 * and Open playback / Search MixesDB actions. Capture 1001 stays its own
 * exceptional fold.
 */

import {
  compareCueQueueSeeds,
  isCueRadioSet,
  isCueStub,
} from "./ingest/discovery/llmCues";
import type { CapturePreset } from "./ingest/nextCaptures";
import type {
  StatsNeedsIdSet,
  StatsSparseSet,
  StatsTracklistGap,
} from "./catalogStats";
import { searchMixesdbByPlayerUrl } from "./searchMixesdb";

export type WorkbenchLane =
  | "first_party"
  | "fingerprint"
  | "track_id"
  | "capture_1001";

export type WorkbenchRow = {
  lane: WorkbenchLane;
  slug: string;
  title: string;
  detail: string;
  href: string | null;
  score: number;
};

export const WORKBENCH_LANE_LABEL: Record<WorkbenchLane, string> = {
  first_party: "text",
  fingerprint: "ACR",
  track_id: "IDs",
  capture_1001: "1001",
};

export const AUTO_ID_LANES = [
  "first_party",
  "fingerprint",
  "track_id",
] as const satisfies readonly WorkbenchLane[];

/** Per automatic lane so text / ACR / IDs cannot starve each other. */
export const AUTO_ID_LANE_QUOTA = 8;

export type AutoIdRow = WorkbenchRow & {
  watchUrl: string | null;
  mixesdbUrl: string | null;
  hostLabel: "YT" | "SC" | "HT" | null;
};

type Watchable = {
  slug: string;
  playbackUrl?: string | null;
  sourceUrl?: string | null;
};

export function watchUrlForAutoId(
  slug: string,
  playbackUrl?: string | null,
  sourceUrl?: string | null,
): string | null {
  if (playbackUrl?.startsWith("http")) return playbackUrl;
  const source = sourceUrl?.startsWith("http") ? sourceUrl : null;
  if (
    source &&
    !/1001tracklists\.com|1001\.tl/i.test(source)
  ) {
    return source;
  }
  if (slug.startsWith("yt-") && slug.length > 3) {
    return `https://www.youtube.com/watch?v=${slug.slice(3)}`;
  }
  return null;
}

export function autoIdHostLabel(
  slug: string,
  watchUrl: string | null,
): AutoIdRow["hostLabel"] {
  const hay = `${slug} ${watchUrl ?? ""}`.toLowerCase();
  if (hay.includes("soundcloud") || slug.startsWith("sc-")) return "SC";
  if (hay.includes("hearthis") || slug.startsWith("ht-")) return "HT";
  if (hay.includes("youtube") || slug.startsWith("yt-")) return "YT";
  return null;
}

export function workbenchLaneRank(lane: WorkbenchLane): number {
  if (lane === "first_party") return 0;
  if (lane === "fingerprint") return 1;
  if (lane === "track_id") return 2;
  return 3;
}

export function compareWorkbenchRows(a: WorkbenchRow, b: WorkbenchRow): number {
  const lanes = workbenchLaneRank(a.lane) - workbenchLaneRank(b.lane);
  if (lanes) return lanes;
  return b.score - a.score || a.title.localeCompare(b.title);
}

function officialHost(
  sourceName: string | null | undefined,
  slug: string,
): boolean {
  const hay = `${sourceName ?? ""} ${slug}`.toLowerCase();
  return (
    hay.includes("youtube") ||
    hay.includes("soundcloud") ||
    hay.includes("hearthis") ||
    slug.startsWith("yt-") ||
    slug.startsWith("sc-") ||
    slug.startsWith("ht-")
  );
}

export function buildTracklistWorkbench(input: {
  emptySets?: Array<{
    slug: string;
    title: string;
    sourceName: string | null;
    playbackUrl?: string | null;
    sourceUrl?: string | null;
  }>;
  sparseSets?: StatsSparseSet[];
  tracklistGaps?: StatsTracklistGap[];
  needsIdsSets?: StatsNeedsIdSet[];
  capturePresets?: CapturePreset[];
  limit?: number;
}): WorkbenchRow[] {
  const limit = input.limit ?? 40;
  const seen = new Set<string>();
  const rows: WorkbenchRow[] = [];
  const take = (row: WorkbenchRow) => {
    if (seen.has(row.slug)) return;
    seen.add(row.slug);
    rows.push(row);
  };

  const empties = input.emptySets ?? [];
  const sparse = input.sparseSets ?? [];
  const firstPartySeeds = [
    ...empties.map((s) => ({
      slug: s.slug,
      title: s.title,
      sourceName: s.sourceName,
      playCount: 0,
      playbackHost: null as string | null,
    })),
    ...sparse.filter((s) => s.playCount <= 4),
  ].filter((s) => officialHost(s.sourceName, s.slug));

  const rankedFirst = [...firstPartySeeds].sort((a, b) =>
    compareCueQueueSeeds(
      {
        slug: a.slug,
        title: a.title,
        type: isCueRadioSet({ title: a.title, slug: a.slug }) ? "radio" : "mix",
      },
      {
        slug: b.slug,
        title: b.title,
        type: isCueRadioSet({ title: b.title, slug: b.slug }) ? "radio" : "mix",
      },
    ),
  );
  rankedFirst.forEach((s, i) => {
    take({
      lane: "first_party",
      slug: s.slug,
      title: s.title,
      detail: "Re-read official description / timed comments",
      href: `/sets/${s.slug}`,
      score: 1000 - i,
    });
  });

  for (const s of sparse) {
    if (!officialHost(s.sourceName, s.slug) && !s.playbackHost) continue;
    take({
      lane: "fingerprint",
      slug: s.slug,
      title: s.title,
      detail: `${s.playCount} cues · Identify / File Scan`,
      href: `/sets/${s.slug}`,
      score: Math.max(0, 200 - s.playCount),
    });
  }
  for (const g of input.tracklistGaps ?? []) {
    take({
      lane: "fingerprint",
      slug: g.slug,
      title: g.title,
      detail: g.reason,
      href: g.hasSetPage ? `/sets/${g.slug}` : null,
      score: Math.max(0, 120 - g.playCount),
    });
  }

  for (const s of input.needsIdsSets ?? []) {
    take({
      lane: "track_id",
      slug: s.slug,
      title: s.title,
      detail: `${Math.round(s.identifiedRatio * 100)}% ID${
        s.primaryDj ? ` · ${s.primaryDj}` : ""
      }`,
      href: `/sets/${s.slug}`,
      score: Math.round((1 - s.identifiedRatio) * 100),
    });
  }

  (input.capturePresets ?? []).forEach((p, i) => {
    take({
      lane: "capture_1001",
      slug: p.slug,
      title: p.label || p.name,
      detail: p.reason || "Optional 1001 overlay — do not invent a URL",
      href: `/sets/${p.slug}`,
      score: Math.max(0, 80 - i),
    });
  });

  return rows.sort(compareWorkbenchRows).slice(0, limit);
}

function watchMapFromWorkbenchInput(input: {
  emptySets?: Watchable[];
  sparseSets?: Watchable[];
  tracklistGaps?: Watchable[];
  needsIdsSets?: Watchable[];
}): Map<string, string> {
  const map = new Map<string, string>();
  const remember = (row: Watchable) => {
    if (map.has(row.slug)) return;
    const url = watchUrlForAutoId(row.slug, row.playbackUrl, row.sourceUrl);
    if (url) map.set(row.slug, url);
  };
  for (const row of input.emptySets ?? []) remember(row);
  for (const row of input.sparseSets ?? []) remember(row);
  for (const row of input.tracklistGaps ?? []) remember(row);
  for (const row of input.needsIdsSets ?? []) remember(row);
  return map;
}

/** Automatic ID spine — no 1001 lane, per-lane quota, MixesDB follow actions. */
export function buildAutoIdQueue(
  input: Parameters<typeof buildTracklistWorkbench>[0] & {
    laneQuota?: number;
  },
): AutoIdRow[] {
  const quota = input.laneQuota ?? AUTO_ID_LANE_QUOTA;
  const ranked = buildTracklistWorkbench({
    ...input,
    capturePresets: [],
    // Rank the full pool first; per-lane quota is applied below so one
    // lane of stubs cannot eat the 24-row cut.
    limit: 400,
  });
  const watches = watchMapFromWorkbenchInput(input);
  const taken: Record<string, number> = {};
  const out: AutoIdRow[] = [];
  for (const row of ranked) {
    if (row.lane === "capture_1001") continue;
    const n = taken[row.lane] ?? 0;
    if (n >= quota) continue;
    taken[row.lane] = n + 1;
    const watchUrl = watches.get(row.slug) ?? watchUrlForAutoId(row.slug);
    out.push({
      ...row,
      watchUrl,
      mixesdbUrl: searchMixesdbByPlayerUrl(watchUrl),
      hostLabel: autoIdHostLabel(row.slug, watchUrl),
    });
  }
  return out;
}

/** Test helper: empty official playbacks rank as first-party stubs. */
export function looksLikeFirstPartyStub(plays: { provenance: string }[]): boolean {
  return isCueStub(plays);
}
