/**
 * Build the operator capture queue.
 *
 * Offline JSON (set-density / top100 reports) is a fallback for CI scripts.
 * The /stats#workbench ranks from the catalog DB at Pages build time
 * so every deploy after deep/enrich shows current gaps. Capture 1001
 * stays a closed #capture-1001 anchor — last lane, not the default.
 */

import { readFileSync, existsSync } from "node:fs";
import { CAPTURE_QUEUE_LIMIT } from "./captureQueueLimits";
import { join } from "node:path";
import {
  isArchiveTitledSet,
  setPerformanceYear,
  yearFromSetTitle,
} from "../feedPriority";
import { derivePerformedAt } from "./derivePerformedAt";
import { dateConflictsTitle, parseDateFromSetTitle } from "../placeTimeline";
import { KNOWN_EVENTS } from "./events";
import { looksLikeLiveFestivalRadio } from "../sourceComments";
import {
  isLivestreamHubFeedTitle,
  looksLikeWeeklyRadioSeries,
} from "../tracklistGap";
import type { DensitySeverity } from "../setDensity";
import { SET_SLUG_ALIASES } from "./sourceRemaps";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";
import { isSecondaryPlaybackSlug } from "./tracklists1001/seeds";
import {
  isGenericHostTitle,
  nativeCaptureSearchUrl,
  search1001,
  search1001Query,
  search1001QueryFromUrl,
} from "../search1001";
import { searchMixesdbByPlayerUrl } from "../searchMixesdb";

export { nativeCaptureSearchUrl, search1001, searchMixesdbByPlayerUrl };

/** /stats#capture-1001 ranked queue size (live DB + committed snapshot). */
export {
  CAPTURE_QUEUE_LIMIT,
  CAPTURE_QUEUE_RESERVE,
} from "./captureQueueLimits";

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
  /** Performance year (performedAt / title / 1001 URL / edition — not ingest). */
  performanceYear?: number;
  /** Exact 1001 POST query (artist + venue + date). Shown on the row. */
  searchQuery?: string;
};

/** Hand-curated high-value assists (official YT, 1001 TBD). Empty when wired. */
export const PRIORITY_CAPTURES: CapturePreset[] = [];

/** Held 1001 seeds waiting on official playback — do not queue fan clips. */
export const HELD_PLAYBACK_WATCH: {
  name: string;
  seed: string;
  match: RegExp;
  search: string[];
  /** Official playback title must also match (default: Tomorrowland). */
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

/** Official-playback extras from the committed snapshot — drop wired slugs + remap Google. */
/** Held Relive/HARD rows that already have an official watch URL — never invent one. */
export function extrasFromHeldReliveWatch(
  cwd = process.cwd(),
): CapturePreset[] {
  const p = join(cwd, "data/crosscheck/held-relive-watch.json");
  if (!existsSync(p)) return [];
  try {
    const d = JSON.parse(readFileSync(p, "utf8")) as {
      held?: Array<{
        name: string;
        seed: string;
        searchUrl: string;
        status?: string;
        youtubeUrl?: string;
        videoId?: string;
        title?: string;
      }>;
    };
    return (d.held ?? [])
      .filter((h) => h.status === "candidate" && (h.youtubeUrl || h.videoId))
      .flatMap((h) => {
        const videoId =
          h.videoId ||
          h.youtubeUrl?.match(/[?&]v=([\w-]{11})/)?.[1] ||
          "";
        if (!videoId) return [];
        const watchUrl =
          h.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`;
        return [
          {
            label: (h.title || h.name).slice(0, 90),
            slug: `yt-${videoId}`,
            name: h.seed,
            searchUrl: h.searchUrl,
            watchUrl,
            host: "youtube" as const,
            reason: "relive:official-unwired",
          },
        ];
      });
  } catch {
    return [];
  }
}

export function extrasFromCaptureSnapshot(snapshot: {
  presets?: CapturePreset[];
}): CapturePreset[] {
  const mapped = mappedSlugs();
  return (snapshot.presets ?? [])
    .filter((p) => p.reason === "relive:official-unwired")
    .filter((p) => !mapped.has(p.slug) && !isSecondaryPlaybackSlug(p.slug))
    .map(withNativeSearch);
}

function withNativeSearch(p: CapturePreset): CapturePreset {
  const searchUrl = nativeCaptureSearchUrl(p.searchUrl, p.label);
  return {
    ...p,
    searchUrl,
    searchQuery:
      search1001QueryFromUrl(searchUrl) ||
      p.searchQuery ||
      search1001Query(p.label),
  };
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
          searchUrl: search1001(dj, title.replace(/\|/g, " ")),
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
  "applemusic",
]);

export type CaptureNeedRow = {
  slug: string;
  title: string;
  primaryDj: string;
  primaryDjSlug?: string;
  type: string;
  eventSlug?: string | null;
  eventName?: string | null;
  publishedAt: Date | string;
  performedAt?: Date | string | null;
  editionYear?: number | null;
  durationSec: number;
  playCount: number;
  plays1001: number;
  identifiedStrong: number;
  top100Rank: number | null;
  isFestival: boolean;
  /** Official venue or DJ livestream — above weekly radio, below a room. */
  isLivestream?: boolean;
  festivalSeason: boolean;
  /** Event brand is in an edition-gap window (few complete playbacks). */
  editionGap?: boolean;
  /**
   * DJ Mag Top 100 Festivals rank of this row's event, when it has one.
   * Used as a flat "notable festival" signal, never scaled by rank: a
   * rank-proportional boost would push the biggest brand even harder, which is
   * the opposite of spreading capture work across venues.
   */
  eventRank?: number | null;
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
  if (isLivestreamHubFeedTitle(row.title)) return "livestream-hub";
  if (isArchiveTitledSet(row.title, nowMs)) return "archive-title";
  const whenYear = Number((captureSearchWhen(row, nowMs) ?? "").slice(0, 4));
  if (
    Number.isFinite(whenYear) &&
    whenYear >= 2005 &&
    whenYear < new Date(nowMs).getUTCFullYear() - 1
  ) {
    return "archive-title";
  }
  if (
    isGenericHostTitle(row.title, row.primaryDj) &&
    !captureEventSearchName(row) &&
    !captureSearchWhen(row, nowMs)
  ) {
    return "generic-title";
  }
  if (row.plays1001 >= 12) return "has-1001";
  if (
    looksLikeWeeklyRadioSeries(row.title) &&
    !looksLikeLiveFestivalRadio(row.title)
  ) {
    return "weekly-radio";
  }
  if (
    row.type === "radio" &&
    !row.isLivestream &&
    !looksLikeLiveFestivalRadio(row.title)
  ) {
    return "weekly-radio";
  }
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
  if (row.festivalSeason && isCaptureRealNight(row)) s += 120;
  if (row.editionGap) s += 35;
  if (row.top100Rank != null) {
    s += row.top100Rank <= 20 ? 90 : 45;
    s += Math.max(0, 25 - row.top100Rank);
  }
  if (row.isFestival) s += 40;
  else if (row.isLivestream) s += 25;
  if (row.type === "radio" && !row.isFestival) s -= 40;
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
  // Notable-festival bump, flat on purpose. Any DJ Mag Top 100 Festivals event
  // counts the same, so a Nameless or Awakenings gap ranks level with a
  // Tomorrowland one instead of losing to the six brands this used to hardcode.
  if (row.eventRank != null) s += 20;
  else if (
    /tomorrowland|ultra|edc|street.?parade|lollapalooza|parookaville/i.test(
      `${row.title} ${row.eventSlug ?? ""}`,
    )
  ) {
    // No rank on the row (offline fallback, or an event we do not map yet).
    s += 20;
  }
  return s;
}

export function captureReason(row: CaptureNeedRow): string {
  if (row.tracklistUrl && row.plays1001 < 12) {
    return "YT/SC in · 1001 URL known · no seed";
  }
  if (row.festivalSeason && isCaptureRealNight(row)) {
    return "festival season · find 1001";
  }
  if (row.editionGap) return "edition gap · find 1001";
  if (row.density === "severe") return "thin tracklist · capture 1001";
  if (row.density === "thin") return "thin tracklist · capture 1001";
  if (row.top100Rank != null && row.top100Rank <= 20) return "Top 20 · no 1001 seed";
  if (row.isFestival) {
    return row.type === "club" ? "club · no 1001 seed" : "festival · no 1001 seed";
  }
  if (row.isLivestream) return "livestream · no 1001 seed";
  return "catalog gap · no 1001 seed";
}

export function capturePerformanceYear(
  row: Pick<
    CaptureNeedRow,
    "title" | "slug" | "publishedAt" | "performedAt" | "editionYear" | "tracklistUrl"
  >,
  nowMs = Date.now(),
): number {
  const performedAt =
    row.performedAt ??
    derivePerformedAt(
      row.title,
      row.slug,
      row.tracklistUrl ? { [row.slug]: row.tracklistUrl } : {},
      nowMs,
    );
  return setPerformanceYear(
    {
      title: row.title,
      publishedAt: row.publishedAt,
      performedAt,
      editionYear: row.editionYear,
    },
    nowMs,
  );
}

/** Capture 1001 works this year first. Next January that year moves on. */
export function captureFocusYear(nowMs = Date.now()): number {
  return new Date(nowMs).getUTCFullYear();
}

/** Printed title year, else performance / publish year. */
export function captureQueueYear(
  row: Pick<
    CaptureNeedRow,
    "title" | "slug" | "publishedAt" | "performedAt" | "editionYear" | "tracklistUrl"
  >,
  nowMs = Date.now(),
): number {
  const titled = yearFromSetTitle(row.title, nowMs);
  if (titled != null) return titled;
  return capturePerformanceYear(row, nowMs);
}

export function isFocusYearCaptureNeed(
  row: Pick<
    CaptureNeedRow,
    "title" | "slug" | "publishedAt" | "performedAt" | "editionYear" | "tracklistUrl"
  >,
  nowMs = Date.now(),
): boolean {
  return captureQueueYear(row, nowMs) === captureFocusYear(nowMs);
}

/**
 * This year's Top 100 DJ or Top 100 festival night. Mix / weekly radio
 * wait behind real nights even when the host brand is charted, and even
 * when ingest glued the row onto a festival event.
 */
export function isFocusChartCaptureNeed(
  row: CaptureNeedRow,
  nowMs = Date.now(),
): boolean {
  if (!isFocusYearCaptureNeed(row, nowMs)) return false;
  if (!isCaptureRealNight(row)) return false;
  return row.top100Rank != null || row.eventRank != null;
}

const MONTH_YEAR_IN_TITLE =
  /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec),?\s+(19|20)\d{2}\b/i;

const LIVE_NIGHT_CUE =
  /\b(we\s*[12]|weekend\s*[12]|mainstage|freedom\s*stage|live\s+(at|from|@)|@\s+)/i;

/**
 * "Hardwell presents Euphoria - August, 2026" is a monthly studio mix,
 * not the July weekend. WE1 / live @ / a stage keep the row a night.
 */
export function isStudioMonthSpecial(title: string): boolean {
  if (LIVE_NIGHT_CUE.test(title)) return false;
  return MONTH_YEAR_IN_TITLE.test(title);
}

/**
 * Festival / club / livestream night. Weekly series and month-named
 * studio mixes stay out even when they inherit a festival event.
 */
export function isCaptureRealNight(row: Pick<CaptureNeedRow, "title" | "type" | "isFestival" | "isLivestream">): boolean {
  if (isStudioMonthSpecial(row.title)) return false;
  if (
    looksLikeWeeklyRadioSeries(row.title) &&
    !looksLikeLiveFestivalRadio(row.title)
  ) {
    return false;
  }
  if (
    row.type === "mix" ||
    row.type === "radio" ||
    row.type === "soundcloud"
  ) {
    return looksLikeLiveFestivalRadio(row.title);
  }
  return (
    row.isFestival ||
    Boolean(row.isLivestream) ||
    row.type === "festival" ||
    row.type === "club" ||
    row.type === "livestream"
  );
}

export function captureEventSearchName(
  row: Pick<CaptureNeedRow, "eventSlug" | "eventName">,
): string {
  const named = row.eventName?.trim();
  if (named) return named;
  if (!row.eventSlug) return "";
  return KNOWN_EVENTS[row.eventSlug]?.name ?? "";
}

/**
 * Calendar day or year for a 1001 search. Printed title first, then a
 * catalog night that does not fight that title, then a 1001 URL / edition
 * year. Never YouTube upload time (reuploads lie). Never a festival
 * weekend glued onto an August mix.
 */
export function captureSearchWhen(
  row: Pick<
    CaptureNeedRow,
    "title" | "slug" | "performedAt" | "editionYear" | "tracklistUrl"
  >,
  nowMs = Date.now(),
): string | undefined {
  const titledDay = parseDateFromSetTitle(row.title, nowMs);
  if (titledDay) return titledDay.toISOString().slice(0, 10);

  const stored = row.performedAt ? new Date(row.performedAt) : null;
  if (
    stored &&
    Number.isFinite(stored.getTime()) &&
    !dateConflictsTitle(stored, row.title, nowMs)
  ) {
    return stored.toISOString().slice(0, 10);
  }

  const derived = derivePerformedAt(
    row.title,
    row.slug,
    row.tracklistUrl ? { [row.slug]: row.tracklistUrl } : {},
    nowMs,
  );
  if (derived && !dateConflictsTitle(derived, row.title, nowMs)) {
    return derived.toISOString().slice(0, 10);
  }

  const titled = yearFromSetTitle(row.title, nowMs);
  if (titled) return String(titled);
  const urlYear = row.tracklistUrl?.match(/-(20\d{2})(?:-\d{2}-\d{2})?(?:\.html)?(?:[?#]|$)/);
  if (urlYear) return urlYear[1];
  if (row.editionYear && row.editionYear > 1990 && row.editionYear < 2100) {
    return String(row.editionYear);
  }
  return undefined;
}

/** Artist + venue + weekend + date. Never slice the title mid-word. */
export function captureSearchQuery(
  row: Pick<
    CaptureNeedRow,
    | "title"
    | "slug"
    | "primaryDj"
    | "eventSlug"
    | "eventName"
    | "performedAt"
    | "editionYear"
    | "tracklistUrl"
  >,
  nowMs = Date.now(),
): string {
  const when = captureSearchWhen(row, nowMs) ?? "";
  const title = isGenericHostTitle(row.title, row.primaryDj) ? "" : row.title;
  const q = search1001Query(
    row.primaryDj || title,
    title,
    captureEventSearchName(row),
    when,
  );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) return q;
  const year = when.slice(0, 4);
  return q
    .replace(new RegExp(`\\b${year}\\b(?!-)`), " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function captureQueueLabel(
  row: Pick<
    CaptureNeedRow,
    | "title"
    | "slug"
    | "primaryDj"
    | "eventSlug"
    | "eventName"
    | "performedAt"
    | "editionYear"
    | "tracklistUrl"
  >,
  nowMs = Date.now(),
): string {
  const title = row.title.trim();
  const artist = row.primaryDj?.trim() ?? "";
  const when = captureSearchWhen(row, nowMs);
  const event = captureEventSearchName(row);
  const generic = isGenericHostTitle(title, artist || undefined);
  if (generic) {
    const parts = [artist, event, when].filter((p) => p && p.length > 0);
    const seen = new Set<string>();
    const kept: string[] = [];
    for (const part of parts) {
      const key = part.toLowerCase();
      if (seen.has(key)) continue;
      if (kept.some((k) => k.toLowerCase().includes(key))) continue;
      seen.add(key);
      kept.push(part);
    }
    return (kept.join(" · ") || title).slice(0, 90);
  }
  let label = title;
  if (artist && !title.toLowerCase().startsWith(artist.toLowerCase())) {
    label = `${artist} · ${title}`;
  }
  if (when && !label.includes(when)) label = `${label} ${when}`;
  return label.slice(0, 90);
}

export function presetFromNeed(row: CaptureNeedRow): CapturePreset {
  const host = captureHost(row.slug) ?? undefined;
  const searchQuery = captureSearchQuery(row);
  return {
    label: captureQueueLabel(row),
    slug: row.slug,
    name: tlNameFromLabel(row.primaryDj || row.title),
    searchUrl: search1001(searchQuery),
    searchQuery,
    tracklistUrl: row.tracklistUrl,
    reason: captureReason(row),
    watchUrl: row.watchUrl || watchUrlForSlug(row.slug),
    host,
    performanceYear: capturePerformanceYear(row),
  };
}

/** Rank catalog gaps. Already-mapped slugs never appear. */
export function buildCaptureQueueFromNeeds(
  rows: CaptureNeedRow[],
  opts: {
    limit?: number;
    extra?: CapturePreset[];
    nowMs?: number;
    /** Parked rows (data/capture-defer.json) — filtered before the cap. */
    deferred?: Set<string>;
    /**
     * Max rows per event in the first pass. An in-season brand can hold
     * hundreds of gap rows, all carrying the same +120 season bonus, so score
     * order alone hands it every slot. Overflow still fills leftover slots, so
     * a quiet week is never short-changed.
     */
    perEventCap?: number;
  } = {},
): CapturePreset[] {
  const limit = opts.limit ?? CAPTURE_QUEUE_LIMIT;
  const perEventCap = opts.perEventCap ?? capturePerEventCap(limit);
  const mapped = mappedSlugs();
  const nowMs = opts.nowMs ?? Date.now();
  const deferred = opts.deferred ?? new Set<string>();
  const seen = new Set<string>();
  const out: CapturePreset[] = [];

  const push = (p: CapturePreset) => {
    if (seen.has(p.slug) || mapped.has(p.slug)) return;
    if (deferred.has(p.slug)) return;
    if (isSecondaryPlaybackSlug(p.slug)) return;
    if (out.length >= limit) return;
    seen.add(p.slug);
    out.push(withNativeSearch(p));
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

  // This year first: Top 100 DJ / festival nights, then other current-year
  // nights, then leftover current-year night slots. Older nights next.
  // Mix / weekly radio wait until real nights are covered. Per-event cap
  // still spreads the first passes so one brand cannot take all 40.
  const yearFocus = ranked.filter(({ row }) =>
    isFocusYearCaptureNeed(row, nowMs),
  );
  const older = ranked.filter(
    ({ row }) => !isFocusYearCaptureNeed(row, nowMs),
  );
  const yearNights = yearFocus.filter(({ row }) => isCaptureRealNight(row));
  const yearMix = yearFocus.filter(({ row }) => !isCaptureRealNight(row));
  const olderNights = older.filter(({ row }) => isCaptureRealNight(row));
  const olderMix = older.filter(({ row }) => !isCaptureRealNight(row));
  const chart = yearNights.filter(({ row }) =>
    isFocusChartCaptureNeed(row, nowMs),
  );
  const yearRestNights = yearNights.filter(
    ({ row }) => !isFocusChartCaptureNeed(row, nowMs),
  );

  const perEvent = new Map<string, number>();
  const fillCapped = (list: typeof ranked) => {
    for (const { row } of list) {
      const key = captureEventBucket(row);
      const used = perEvent.get(key) ?? 0;
      if (used >= perEventCap) continue;
      const before = out.length;
      push(presetFromNeed(row));
      if (out.length > before) perEvent.set(key, used + 1);
    }
  };
  fillCapped(chart);
  fillCapped(yearRestNights);
  for (const { row } of yearNights) push(presetFromNeed(row));
  for (const { row } of olderNights) push(presetFromNeed(row));
  for (const { row } of yearMix) push(presetFromNeed(row));
  for (const { row } of olderMix) push(presetFromNeed(row));
  return out.slice(0, limit);
}

/**
 * Bucket a row for the per-event cap. Rows with no event fall back to the DJ so
 * one artist's back catalogue cannot flood the queue either; slug is the last
 * resort so an unattributed row is never lumped in with unrelated ones.
 */
export function captureEventBucket(row: CaptureNeedRow): string {
  if (row.eventSlug) return `event:${row.eventSlug}`;
  if (row.primaryDjSlug) return `dj:${row.primaryDjSlug}`;
  return `slug:${row.slug}`;
}

/** Room for at least 8 distinct events in the first pass, never below 3. */
export function capturePerEventCap(limit = CAPTURE_QUEUE_LIMIT): number {
  return Math.max(3, Math.ceil(limit / 8));
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
    if (isSecondaryPlaybackSlug(p.slug)) return;
    if (out.length >= limit) return;
    seen.add(p.slug);
    out.push(withNativeSearch(p));
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

export type HeldPlaybackReport = {
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
export function buildHeldPlaybackWatch(): HeldPlaybackReport {
  return {
    generatedAt: new Date().toISOString(),
    held: HELD_PLAYBACK_WATCH.map((h) => ({
      name: h.name,
      seed: h.seed,
      searchUrl: search1001(...h.search),
      status: "waiting" as const,
      note:
        h.waitNote ??
        "Do not wire fan clips — wait for official playback.",
    })),
  };
}
