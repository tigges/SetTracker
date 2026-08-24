/**
 * /stats health cards — exclusive slices + current Top 100 stars.
 * Client-safe (no Prisma). Junk / low-signal DJs stay off the bar.
 */

import { assessSetDensity } from "./setDensity";

export type DjHealthInput = {
  slug: string;
  hasHandle: boolean;
  imageUrl: string | null;
  setCount: number;
  isJunk: boolean;
  isLowSignal: boolean;
};

export type PlaceHealthInput = {
  slug: string;
  name?: string;
  setCount: number;
  onChart: boolean;
};

export type SetHealthInput = {
  durationSec: number;
  playCount: number;
  playbackUrl?: string | null;
  top100Rank?: number | null;
  festivalRank?: number | null;
  clubRank?: number | null;
};

export type HealthSliceKey = string;

export type HealthSlice = {
  key: HealthSliceKey;
  label: string;
  count: number;
  color: string;
  /** Current Top 100 rows inside this slice. */
  star: number;
};

export function isDjOnHealthBar(d: DjHealthInput): boolean {
  return !d.isJunk && !d.isLowSignal && d.setCount > 0;
}

/** Mutually exclusive: handle first, then artwork, else ready. */
export function djHealthSlice(
  d: DjHealthInput,
): "ready" | "no_handle" | "no_art" {
  if (!d.hasHandle) return "no_handle";
  if (!d.imageUrl?.trim()) return "no_art";
  return "ready";
}

export function placeHealthSlice(setCount: number): "has_set" | "no_set" {
  return setCount > 0 ? "has_set" : "no_set";
}

export function isChartTouchingSet(s: {
  top100Rank?: number | null;
  festivalRank?: number | null;
  clubRank?: number | null;
}): boolean {
  return s.top100Rank != null || s.festivalRank != null || s.clubRank != null;
}

/** Empty or density-thin/severe → thin. Short uploads with cues stay complete. */
export function setListSlice(s: {
  durationSec: number;
  playCount: number;
}): "complete" | "thin" {
  if (s.playCount < 1) return "thin";
  return assessSetDensity({
    durationSec: s.durationSec,
    playCount: s.playCount,
  }).severity === "ok"
    ? "complete"
    : "thin";
}

export function summarizeDjHealth(
  djs: DjHealthInput[],
  onChart: (slug: string) => boolean,
): { total: number; onChart: number; slices: HealthSlice[] } {
  const rows = djs.filter(isDjOnHealthBar);
  const buckets = {
    ready: { count: 0, star: 0 },
    no_handle: { count: 0, star: 0 },
    no_art: { count: 0, star: 0 },
  };
  let chart = 0;
  for (const d of rows) {
    const slice = djHealthSlice(d);
    const star = onChart(d.slug);
    buckets[slice].count += 1;
    if (star) {
      buckets[slice].star += 1;
      chart += 1;
    }
  }
  return {
    total: rows.length,
    onChart: chart,
    slices: [
      {
        key: "ready",
        label: "ready",
        count: buckets.ready.count,
        color: "var(--brand)",
        star: buckets.ready.star,
      },
      {
        key: "no_handle",
        label: "no handle",
        count: buckets.no_handle.count,
        color: "var(--magenta)",
        star: buckets.no_handle.star,
      },
      {
        key: "no_art",
        label: "no art",
        count: buckets.no_art.count,
        color: "var(--amber)",
        star: buckets.no_art.star,
      },
    ],
  };
}

export function summarizePlaceHealth(places: PlaceHealthInput[]): {
  total: number;
  onChart: number;
  slices: HealthSlice[];
} {
  const buckets = {
    has_set: { count: 0, star: 0 },
    no_set: { count: 0, star: 0 },
  };
  let chart = 0;
  for (const p of places) {
    const slice = placeHealthSlice(p.setCount);
    buckets[slice].count += 1;
    if (p.onChart) {
      buckets[slice].star += 1;
      chart += 1;
    }
  }
  return {
    total: places.length,
    onChart: chart,
    slices: [
      {
        key: "has_set",
        label: "has a set",
        count: buckets.has_set.count,
        color: "var(--brand)",
        star: buckets.has_set.star,
      },
      {
        key: "no_set",
        label: "no set",
        count: buckets.no_set.count,
        color: "var(--magenta)",
        star: buckets.no_set.star,
      },
    ],
  };
}

export function summarizeSetHealth(sets: SetHealthInput[]): {
  total: number;
  onChart: number;
  slices: HealthSlice[];
  playback: HealthSlice[];
  noPlaybackStar: number;
  chartTouching: number;
} {
  const list = { complete: { count: 0, star: 0 }, thin: { count: 0, star: 0 } };
  const play = { yes: { count: 0, star: 0 }, no: { count: 0, star: 0 } };
  let chart = 0;
  for (const s of sets) {
    const touching = isChartTouchingSet(s);
    if (touching) chart += 1;
    const listSlice = setListSlice(s);
    list[listSlice].count += 1;
    if (touching) list[listSlice].star += 1;
    const hasPlay = Boolean(s.playbackUrl?.trim());
    const playKey = hasPlay ? "yes" : "no";
    play[playKey].count += 1;
    if (touching) play[playKey].star += 1;
  }
  return {
    total: sets.length,
    onChart: chart,
    chartTouching: chart,
    slices: [
      {
        key: "complete",
        label: "complete",
        count: list.complete.count,
        color: "var(--brand)",
        star: list.complete.star,
      },
      {
        key: "thin",
        label: "thin",
        count: list.thin.count,
        color: "var(--magenta)",
        star: list.thin.star,
      },
    ],
    playback: [
      {
        key: "playable",
        label: "can play",
        count: play.yes.count,
        color: "var(--brand)",
        star: play.yes.star,
      },
      {
        key: "no_playback",
        label: "no playback",
        count: play.no.count,
        color: "var(--grey)",
        star: play.no.star,
      },
    ],
    noPlaybackStar: play.no.star,
  };
}

type CueMixLike = {
  key: string;
  label: string;
  count: number;
  color: string;
};

const FIRST_PARTY_CLOCK = new Set([
  "youtube",
  "soundcloud",
  "hearthis",
  "bandcamp",
  "insomniac",
]);
const OVERLAY_CLOCK = new Set(["1001tl", "mixesdb", "applemusic"]);

/** Group play provenance for /stats — first-party + fingerprint vs community overlays. */
export function clockSourceSlices(
  rows: Array<{ key: string; count: number }>,
): CueMixLike[] {
  const buckets = {
    first_party: 0,
    fingerprint: 0,
    overlay: 0,
    community: 0,
  };
  for (const row of rows) {
    if (FIRST_PARTY_CLOCK.has(row.key)) buckets.first_party += row.count;
    else if (row.key === "fingerprint") buckets.fingerprint += row.count;
    else if (OVERLAY_CLOCK.has(row.key)) buckets.overlay += row.count;
    else if (row.key === "community") buckets.community += row.count;
  }
  return [
    {
      key: "first_party",
      label: "first-party",
      count: buckets.first_party,
      color: "var(--brand)",
    },
    {
      key: "fingerprint",
      label: "fingerprint",
      count: buckets.fingerprint,
      color: "var(--amber)",
    },
    {
      key: "overlay",
      label: "1001 / MixesDB overlay",
      count: buckets.overlay,
      color: "#8b9cff",
    },
    {
      key: "community",
      label: "community",
      count: buckets.community,
      color: "var(--grey)",
    },
  ].filter((s) => s.count > 0);
}

export function slicePct(count: number, total: number): number {
  if (total <= 0 || count <= 0) return 0;
  return Math.max(2, Math.round((count / total) * 100));
}
