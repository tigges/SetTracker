/**
 * Ranked /stats tracklist workbench.
 *
 * Lanes: first-party text → fingerprint → track IDs → optional 1001 last.
 * One set appears in one lane. Capture 1001 never outranks the others.
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
  emptySets?: Array<{ slug: string; title: string; sourceName: string | null }>;
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

/** Test helper: empty official playbacks rank as first-party stubs. */
export function looksLikeFirstPartyStub(plays: { provenance: string }[]): boolean {
  return isCueStub(plays);
}
