/**
 * Build the operator capture queue.
 *
 * Offline JSON (set-density / top100 reports) is a fallback for CI scripts.
 * The /stats#capture-1001 workbench ranks from the catalog DB at Pages
 * build time so every deploy after deep/enrich shows current gaps.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { isArchiveTitledSet } from "../feedPriority";
import type { DensitySeverity } from "../setDensity";
import { SET_SLUG_ALIASES } from "./sourceRemaps";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";
import { isSecondaryPlaybackSlug } from "./tracklists1001/seeds";
import { search1001 } from "../search1001";

export { search1001 };

export type CapturePreset = {
  label: string;
  slug: string;
  name: string;
  searchUrl: string;
  /** Known 1001 tracklist page (preferred over searchUrl when set). */
  tracklistUrl?: string;
  /** Why this row was queued */
  reason?: string;
  /** Official playback (YT or SC). */
  watchUrl?: string;
  host?: "youtube" | "soundcloud";
};

/** Hand-curated high-value assists (official YT, 1001 TBD). Empty when wired. */
export const PRIORITY_CAPTURES: CapturePreset[] = [];

/** Held 1001 seeds waiting on official playback — do not queue fan clips. */
export const HELD_RELIVE_WATCH: {
  name: string;
  seed: string;
  match: RegExp;
  search: string[];
  /** Official playback title must also match (default: Tomorrowland Relive). */
  venue?: RegExp;
  waitNote?: string;
  /** Extra title token required (e.g. B2B partner). */
  alsoMatch?: RegExp;
}[] = [
  {
    name: "Calvin Harris · TML WE2",
    seed: "TL_CALVIN_HARRIS_TML_WE2_2026",
    match: /calvin\s*harris/i,
    search: ["calvin harris", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Chris Lorenzo · TML WE2",
    seed: "TL_CHRIS_LORENZO_TML_WE2_2026",
    match: /chris\s*lorenzo/i,
    search: ["chris lorenzo", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Sonny Fodera · TML WE2",
    seed: "TL_SONNY_FODERA_TML_WE2_2026",
    match: /sonny\s*fodera/i,
    search: ["sonny fodera", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Darren Styles · TML WE2",
    seed: "TL_DARREN_STYLES_TML_WE2_2026",
    match: /darren\s*styles/i,
    search: ["darren styles", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Dyzen · TML WE2",
    seed: "TL_DYZEN_TML_WE2_2026",
    match: /\bdyzen\b/i,
    search: ["dyzen", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Holy Priest · TML WE1",
    seed: "TL_HOLY_PRIEST_TML_WE1_2026",
    match: /holy\s*priest/i,
    search: ["holy priest", "tomorrowland", "weekend 1", "2026"],
  },
  {
    name: "Knock2 B2B Zedd · HARD Summer",
    seed: "TL_KNOCK2_ZEDD_HARD_SUMMER_2026",
    match: /knock2/i,
    search: ["knock2", "zedd", "hard summer", "2026"],
    venue: /hard\s*summer|hardfest|\binsomniac\b/i,
    alsoMatch: /zedd/i,
    waitNote:
      "Do not wire fan clips (DerekD2 yt-6DC3xoQF4Zs) — wait for official HARD/Insomniac playback.",
  },
  {
    name: "Cole Terrazas · HARD Summer",
    seed: "TL_COLE_TERRAZAS_HARD_SUMMER_2026",
    match: /cole\s*terrazas/i,
    search: ["cole terrazas", "hard summer", "pink stage", "2026"],
    venue: /hard\s*summer|hardfest|\binsomniac\b/i,
    waitNote:
      "Do not wire fan clips — wait for official HARD/Insomniac playback.",
  },
];

type DensityRow = {
  slug?: string;
  title?: string;
  primaryDj?: string;
  severity?: string;
};

type Top100Row = {
  rank: number;
  name: string;
  slug: string;
  sets: number;
  tracks: number;
  missingTracks?: boolean;
};

function mappedSlugs(): Set<string> {
  return new Set(Object.keys(TRACKLIST_1001_BY_SOURCE_SLUG));
}

export function tlNameFromLabel(label: string): string {
  return (
    "TL_" +
    label
      .replace(/[·|@]/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .toUpperCase()
  );
}

function loadDensityYtSevere(cwd: string): CapturePreset[] {
  const paths = [
    join(cwd, "data/crosscheck/set-density.json"),
    join(cwd, "data/crosscheck/set-density-live.json"),
  ];
  const out: CapturePreset[] = [];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    try {
      const d = JSON.parse(readFileSync(p, "utf8")) as {
        severeEmpty?: DensityRow[];
        severeSparse?: DensityRow[];
      };
      for (const row of [...(d.severeEmpty ?? []), ...(d.severeSparse ?? [])]) {
        const slug = row.slug?.trim();
        if (!slug?.startsWith("yt-")) continue;
        const dj = row.primaryDj || "Unknown";
        const title = (row.title || slug).slice(0, 80);
        out.push({
          label: `${dj} · density gap`,
          slug,
          name: tlNameFromLabel(dj),
          searchUrl: search1001(dj, title.replace(/\|/g, " ").slice(0, 60)),
          reason: `density:${row.severity ?? "severe"}`,
        });
      }
      break;
    } catch {
      /* try next */
    }
  }
  return out;
}

function loadTop100Gaps(cwd: string): { slug: string; name: string; tracks: number }[] {
  const p = join(cwd, "data/crosscheck/top100-coverage.json");
  if (!existsSync(p)) return [];
  try {
    const t = JSON.parse(readFileSync(p, "utf8")) as { rows?: Top100Row[] };
    return (t.rows ?? [])
      .filter((r) => r.missingTracks || (r.sets > 0 && r.tracks < 8))
      .map((r) => ({ slug: r.slug, name: r.name, tracks: r.tracks }));
  } catch {
    return [];
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;
const STRONG_ID = new Set([
  "soundcloud",
  "hearthis",
  "youtube",
  "insomniac",
  "bandcamp",
  "community",
  "1001tl",
  "mixesdb",
]);

export type CaptureNeedRow = {
  slug: string;
  title: string;
  primaryDj: string;
  primaryDjSlug?: string;
  type: string;
  eventSlug?: string | null;
  publishedAt: Date | string;
  durationSec: number;
  playCount: number;
  plays1001: number;
  identifiedStrong: number;
  top100Rank: number | null;
  isFestival: boolean;
  festivalSeason: boolean;
  /** Event brand is in an edition-gap window (few complete playbacks). */
  editionGap?: boolean;
  density: DensitySeverity;
  watchUrl?: string;
  /** Known 1001 page from a curated YT seed (not yet captured as a seed). */
  tracklistUrl?: string;
};

export function captureHost(
  slug: string,
): "youtube" | "soundcloud" | null {
  if (slug.startsWith("yt-")) return "youtube";
  if (slug.startsWith("sc-")) return "soundcloud";
  return null;
}

export function watchUrlForSlug(slug: string, playbackUrl?: string | null): string {
  if (playbackUrl?.startsWith("http")) return playbackUrl;
  if (slug.startsWith("yt-")) {
    return `https://www.youtube.com/watch?v=${slug.slice(3)}`;
  }
  return "";
}

/** Skip shorts, already-wired lists, and stale low-value rows. */
export function skipCaptureNeed(
  row: CaptureNeedRow,
  mapped: Set<string>,
  nowMs = Date.now(),
): string | null {
  if (mapped.has(row.slug)) return "mapped";
  if (isSecondaryPlaybackSlug(row.slug)) return "mirror";
  if (SET_SLUG_ALIASES[row.slug]) return "alias";
  if (!captureHost(row.slug)) return "host";
  if (row.durationSec < 20 * 60) return "short";
  if (/\bshorts?\b/i.test(row.title)) return "shorts";
  if (isArchiveTitledSet(row.title, nowMs)) return "archive-title";
  if (row.plays1001 >= 12) return "has-1001";
  const ageDays =
    (nowMs - new Date(row.publishedAt).getTime()) / DAY_MS;
  if (
    ageDays > 400 &&
    !row.festivalSeason &&
    (row.top100Rank == null || row.top100Rank > 20)
  ) {
    return "stale";
  }
  if (
    row.density === "ok" &&
    row.playCount >= 8 &&
    row.plays1001 === 0 &&
    !row.festivalSeason &&
    !(row.isFestival && row.top100Rank != null && ageDays <= 90)
  ) {
    return "already-dense";
  }
  return null;
}

export function scoreCaptureNeed(row: CaptureNeedRow, nowMs = Date.now()): number {
  let s = 0;
  if (row.festivalSeason) s += 120;
  if (row.editionGap) s += 35;
  if (row.top100Rank != null) {
    s += row.top100Rank <= 20 ? 90 : 45;
    s += Math.max(0, 25 - row.top100Rank);
  }
  if (row.isFestival) s += 40;
  if (row.slug.startsWith("yt-")) s += 15;
  if (row.density === "severe") s += 50;
  else if (row.density === "thin") s += 25;
  if (row.playCount === 0) s += 20;
  if (row.plays1001 === 0) s += 15;
  const ageDays =
    (nowMs - new Date(row.publishedAt).getTime()) / DAY_MS;
  if (ageDays <= 21) s += 45;
  else if (ageDays <= 90) s += 25;
  else if (ageDays <= 365) s += 8;
  const hay = `${row.title} ${row.eventSlug ?? ""}`;
  if (
    /tomorrowland|ultra|edc|street.?parade|lollapalooza|parookaville/i.test(
      hay,
    )
  ) {
    s += 20;
  }
  return s;
}

export function captureReason(row: CaptureNeedRow): string {
  if (row.tracklistUrl && row.plays1001 < 12) {
    return "YT/SC in · 1001 URL known · no seed";
  }
  if (row.festivalSeason) return "festival season · find 1001";
  if (row.editionGap) return "edition gap · find 1001";
  if (row.density === "severe") return "thin tracklist · capture 1001";
  if (row.density === "thin") return "thin tracklist · capture 1001";
  if (row.top100Rank != null && row.top100Rank <= 20) return "Top 20 · no 1001 seed";
  if (row.isFestival) return "festival · no 1001 seed";
  return "catalog gap · no 1001 seed";
}

export function presetFromNeed(row: CaptureNeedRow): CapturePreset {
  const host = captureHost(row.slug) ?? undefined;
  return {
    label: row.title.slice(0, 90),
    slug: row.slug,
    name: tlNameFromLabel(row.primaryDj || row.title),
    searchUrl: search1001(
      row.primaryDj || row.title,
      row.title.replace(/\|/g, " ").slice(0, 50),
    ),
    tracklistUrl: row.tracklistUrl,
    reason: captureReason(row),
    watchUrl: row.watchUrl || watchUrlForSlug(row.slug),
    host,
  };
}

/** Rank catalog gaps. Already-mapped slugs never appear. */
export function buildCaptureQueueFromNeeds(
  rows: CaptureNeedRow[],
  opts: { limit?: number; extra?: CapturePreset[]; nowMs?: number } = {},
): CapturePreset[] {
  const limit = opts.limit ?? 20;
  const mapped = mappedSlugs();
  const nowMs = opts.nowMs ?? Date.now();
  const seen = new Set<string>();
  const out: CapturePreset[] = [];

  const push = (p: CapturePreset) => {
    if (seen.has(p.slug) || mapped.has(p.slug)) return;
    if (out.length >= limit) return;
    seen.add(p.slug);
    out.push(p);
  };

  for (const p of PRIORITY_CAPTURES) push(p);
  for (const p of opts.extra ?? []) push(p);

  const ranked = rows
    .filter((r) => !skipCaptureNeed(r, mapped, nowMs))
    .map((r) => ({ row: r, score: scoreCaptureNeed(r, nowMs) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.row.publishedAt).getTime() -
          new Date(a.row.publishedAt).getTime(),
    );

  for (const { row } of ranked) push(presetFromNeed(row));
  return out.slice(0, limit);
}

export function isStrongIdentifiedPlay(p: {
  idStatus: string;
  provenance: string;
}): boolean {
  return (
    (p.idStatus === "identified" || p.idStatus === "community_resolved") &&
    STRONG_ID.has(p.provenance)
  );
}

/**
 * Build up to `limit` capture presets, priority first, then density gaps
 * that aren't already 1001-mapped. Offline fallback when no catalog DB.
 */
export function buildNextCaptures(
  opts: { cwd?: string; limit?: number; extra?: CapturePreset[] } = {},
): CapturePreset[] {
  const cwd = opts.cwd ?? process.cwd();
  const limit = opts.limit ?? 10;
  const mapped = mappedSlugs();
  const seen = new Set<string>();
  const out: CapturePreset[] = [];

  const push = (p: CapturePreset) => {
    if (seen.has(p.slug) || mapped.has(p.slug)) return;
    if (out.length >= limit) return;
    seen.add(p.slug);
    out.push(p);
  };

  for (const p of PRIORITY_CAPTURES) push(p);
  for (const p of opts.extra ?? []) push(p);

  // Prefer density gaps whose primary DJ is Top100 thin/missing.
  const topGaps = loadTop100Gaps(cwd);
  const topNames = new Set(topGaps.map((g) => g.name.toLowerCase()));
  const density = loadDensityYtSevere(cwd);
  const densityTop = density.filter(
    (d) =>
      d.label &&
      [...topNames].some((n) => d.label.toLowerCase().includes(n.split(" ")[0]!)),
  );
  for (const p of densityTop) push(p);
  for (const p of density) push(p);

  return out.slice(0, limit);
}

export type HeldReliveReport = {
  generatedAt: string;
  held: {
    name: string;
    seed: string;
    searchUrl: string;
    status: "waiting" | "candidate";
    note: string;
  }[];
};

/** Offline held-seed watch report (operator finds official playback, then wires). */
export function buildHeldReliveWatch(): HeldReliveReport {
  return {
    generatedAt: new Date().toISOString(),
    held: HELD_RELIVE_WATCH.map((h) => ({
      name: h.name,
      seed: h.seed,
      searchUrl: search1001(...h.search, "relive", "youtube"),
      status: "waiting" as const,
      note:
        h.waitNote ??
        "Do not wire fan clips — wait for official Tomorrowland Relive / artist playback.",
    })),
  };
}
