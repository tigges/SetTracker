/**
 * ACRCloud fingerprint enrich — fills sparse tracklists from playback audio.
 *
 * Goal
 * ----
 * For sets with sparse / empty tracklists but a resolvable `playbackUrl`
 * (prefer SoundCloud / hearthis; YouTube opt-in), sample audio and identify
 * segments via ACRCloud Identify API. Write Played rows with:
 *   idStatus: "identified" | "unresolved_id"
 *   provenance: "fingerprint"
 *
 * Policy
 * ------
 * - Call ACRCloud / AudD **directly** (user trial / own keys).
 * - Do **not** scrape AudioScout, 1001Tracklists, TrackId, or MusicMate.
 * - Keep source ≠ playback: never overwrite `sourceUrl` / `sourceName` with
 *   the fingerprint vendor; only enrich Played + Track rows.
 * - Never delete stronger source-derived Played rows; fill timeline gaps only.
 *
 * Env
 * ---
 *   ACRCLOUD_HOST           e.g. identify-eu-west-1.acrcloud.com
 *   ACRCLOUD_ACCESS_KEY
 *   ACRCLOUD_ACCESS_SECRET
 *   ACRCLOUD_ENABLED=1      hard gate — no network without this
 *   ACRCLOUD_SET_LIMIT      max sets per enrich run (default 5)
 *   ACRCLOUD_SAMPLE_SEC     clip length per probe (default 12)
 *   ACRCLOUD_STEP_SEC       spacing between probes (default 90)
 *   ACRCLOUD_MIN_SCORE      accept identified hits ≥ this (default 55).
 *     yt-dlp-sourced YouTube clips score lower than studio audio — a clean
 *     control track (Never Gonna Give You Up) only scored ~64 from a 12s YT
 *     clip, so 70 silently rejected real hits. 55 is the balanced floor.
 *   ACRCLOUD_MIN_IDENTIFIED skip sets with ≥ N strong IDs (default 4)
 *   ACRCLOUD_ALLOW_YOUTUBE=1  allow all YT playback (default off)
 *   ACRCLOUD_ALLOW_YOUTUBE_PRIORITY=0  disable YT for Top 20 / festival
 *     unresolved targets (default on — EDC playbacks etc. are often YT-only)
 *   ACRCLOUD_YT_DLP=0       force-disable yt-dlp sampling (default: use when
 *     yt-dlp is on PATH). YouTube has no anonymous progressive URL — clips
 *     are cut with yt-dlp --download-sections, then Identify as usual.
 *   ACRCLOUD_YTDLP_COOKIES  path to Netscape cookies.txt (CI copies
 *     YT_DUMMY_COOKIE_LOCAL here). Helps when YouTube returns
 *     “Sign in to confirm you’re not a bot” off GitHub IPs.
 *   ACRCLOUD_IDENTIFY_YOUTUBE=0  skip yt-dlp Identify (CI default when File
 *     Scan secrets are present). File Scanning still fingerprints YouTube.
 *   ACRCLOUD_YT_FAIL_FAST=1      1 extractor retry + short timeout (CI default)
 *   ACRCLOUD_DRY_RUN=1      resolve + probe but do not write DB
 *
 * Hook: `npm run enrich:fingerprint` from catalog-enrich.yml (after thumbs/MB).
 */

import { createHmac } from "node:crypto";
import { execFile } from "node:child_process";
import { appendFileSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { PrismaClient } from "@prisma/client";
import { sanitizeArtistName } from "../../artistName";
import { playCollapseKey } from "../../playCollapse";
import { loadDjMagTop100RankBySlug } from "../../djmagTop100";
import { normalizeGenre } from "../../genre";
import { detectPlaybackHost, type PlaybackHost } from "../../playback";
import {
  assessSetDensity,
  type DensitySeverity,
} from "../../setDensity";
import { fmtTimestamp } from "../../status";
import { allocateTrackSlug, trackSlugBase } from "../../tracks/slug";
import { normalizeIsrc } from "../../trackMeta";
import {
  fetchTrackDetail,
  parseHearthisUrl,
  type HtTrack,
} from "../hearthis/client";
import { isFestivalSeasonSet } from "../festivalDrops";
import {
  isLiveVenueSet,
  isLivestreamSet,
  isWeeklyRadioSet,
} from "../../setType";
import { ARTIST_ROSTER } from "../roster";
import { getSoundCloudClientId, scGet, type ScTrack } from "../soundcloud/client";
import { slugify } from "../types";
import { recognizeAuddClip } from "../identify/audd";
import {
  isUnresolvedDetectPriority,
  TOP_DJ_UNRESOLVED_PRIORITY,
} from "../../unresolvedPriority";

export { loadDjMagTop100RankBySlug } from "../../djmagTop100";
export {
  isUnresolvedDetectPriority,
  TOP_DJ_UNRESOLVED_PRIORITY,
} from "../../unresolvedPriority";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** Festival playback dumps often land weeks after the weekend. */
const FESTIVAL_DETECT_MS = 45 * 24 * 60 * 60 * 1000;
const DENSITY_SEVERITY_RANK: Record<DensitySeverity, number> = {
  severe: 0,
  thin: 1,
  ok: 2,
};

const execFileAsync = promisify(execFile);

const STRONG_PROVENANCE = new Set([
  "soundcloud",
  "hearthis",
  "youtube",
  "insomniac",
  "bandcamp",
  "community",
  "1001tl",
]);

const HOST_PREF: Record<PlaybackHost, number> = {
  soundcloud: 0,
  hearthis: 1,
  mixcloud: 2,
  youtube: 3,
};

export type AcrEnrichStats = {
  enabled: boolean;
  candidates: number;
  probed: number;
  identified: number;
  unresolved: number;
  skipped: string;
  /** yt-dlp clips that failed (bot-wall, empty, timeout). */
  clipFails: number;
  /** Sets that actually ran Identify (SC/hearthis, or a rare YT clip). */
  setsProbed: number;
  /** YouTube videos that returned the CI bot-wall. */
  youtubeBotWalls: number;
  /** YouTube candidates skipped (circuit, File Scan owns YT, archive title). */
  youtubeSkipped: number;
};

export type ClipSampleResult =
  | { ok: true; clip: Buffer }
  | { ok: false; reason: "bot-wall" | "unavailable" | "empty" };

export type AcrSetEnrichResult = {
  probed: number;
  identified: number;
  unresolved: number;
  clipFails: number;
  botWall: boolean;
  skipReason: string;
};

function emptyStats(
  partial: Partial<AcrEnrichStats> &
    Pick<AcrEnrichStats, "enabled" | "skipped">,
): AcrEnrichStats {
  return {
    candidates: 0,
    probed: 0,
    identified: 0,
    unresolved: 0,
    clipFails: 0,
    setsProbed: 0,
    youtubeBotWalls: 0,
    youtubeSkipped: 0,
    ...partial,
  };
}

export type AcrEnrichOptions = {
  setLimit?: number;
  /** Minimum identified plays already present (strong provenance) to skip the set */
  minIdentifiedToSkip?: number;
  sampleSec?: number;
  stepSec?: number;
  minScore?: number;
  dryRun?: boolean;
  allowYoutube?: boolean;
  /**
   * Restrict the sparse queue to one playback host. File Scanning passes
   * `"youtube"` so SoundCloud radio cannot crowd festival playbacks out of the slice.
   */
  host?: PlaybackHost;
  /** Cap ACR identify calls per set (resolve cues + gap probes). */
  maxProbesPerSet?: number;
};

export type SparseSetCandidate = {
  id: string;
  slug: string;
  playbackUrl: string;
  durationSec: number;
  host: PlaybackHost;
  title?: string;
  primaryDjSlug?: string | null;
  identifiedStrong: number;
  playCount: number;
  /** Unresolved ID rows on this set (comment/description IDs). */
  unresolvedCount: number;
  /**
   * Demand proxy: lower = hotter. DJ Mag Top 100 rank (1–100), or 50 for
   * roster `priority: "high"`, else 999.
   */
  popularityRank: number;
  /** Higher = more urgent for people looking at the homepage. */
  homepageBoost: number;
  /**
   * 1 when the set's event matches ACRCLOUD_EVENT_SLUGS (e.g. edc-lv focus run).
   */
  eventBoost: number;
  densitySeverity: DensitySeverity;
  publishedAtMs: number;
};

/** Optional comma/space-separated Event.slug focus list for enrich queue. */
export function acrEventFocusSlugs(
  raw: string | undefined = process.env.ACRCLOUD_EVENT_SLUGS,
): Set<string> {
  return new Set(
    (raw ?? "")
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

function rosterHighPrioritySlugs(): Set<string> {
  const out = new Set<string>();
  for (const a of ARTIST_ROSTER) {
    if (a.priority === "high") out.add(slugify(a.name));
  }
  return out;
}

/** Popularity rank for a primary DJ slug (1 = hottest). */
export function popularityRankForDjSlug(
  slug: string | null | undefined,
  top100: Map<string, number>,
  rosterHigh: Set<string>,
): number {
  if (!slug) return 999;
  const chart = top100.get(slug);
  if (chart != null) return chart;
  if (rosterHigh.has(slug)) return 50;
  return 999;
}

/**
 * Homepage / product urgency for fingerprint enrich.
 * Aligns the ACR queue with sets people actually see — especially pink
 * unresolved IDs on recent festival sets and Top 20 DJs.
 *
 * 4 — unresolved IDs on Top 20 / festival (recent or festival playback window)
 * 3 — unresolved on Top 20 / festival (older), or recent spotlight + severe
 * 2 — recent + (spotlight or severe)
 * 1 — older spotlight that is still thin/severe
 * 0 — everything else
 */
export function homepageEnrichBoost(opts: {
  publishedAt: Date;
  primaryDjSlug?: string | null;
  genre?: string | null;
  densitySeverity: DensitySeverity;
  top100: Map<string, number>;
  nowMs?: number;
  unresolvedCount?: number;
  /** Total cue rows — 0 means playback with no description/credits yet. */
  playCount?: number;
  isFestival?: boolean;
  festivalSeason?: boolean;
  isLivestream?: boolean;
  isWeeklyRadio?: boolean;
}): number {
  const now = opts.nowMs ?? Date.now();
  const ageMs = now - opts.publishedAt.getTime();
  const recent = ageMs >= 0 && ageMs < WEEK_MS;
  const festWindow = ageMs >= 0 && ageMs < FESTIVAL_DETECT_MS;
  const slug = opts.primaryDjSlug?.trim() || "";
  const chartRank = slug ? opts.top100.get(slug) : undefined;
  const top20 =
    chartRank != null && chartRank <= TOP_DJ_UNRESOLVED_PRIORITY;
  const spotlight =
    chartRank != null || normalizeGenre(opts.genre) === "Bass House";
  const severe = opts.densitySeverity === "severe";
  const thinOrWorse = opts.densitySeverity !== "ok";
  const hasUnresolved = (opts.unresolvedCount ?? 0) > 0;
  const festFocus = Boolean(
    opts.isFestival || opts.festivalSeason || opts.isLivestream,
  );
  const emptyOfficial = (opts.playCount ?? 1) === 0;

  // Empty official playbacks — Identify / File Scan must create rows.
  // Live rooms and livestreams stay ahead of weekly radio.
  if (emptyOfficial) {
    if (opts.isWeeklyRadio) return recent ? 1 : 0;
    if (festFocus && (recent || festWindow)) return 4;
    if (festFocus) return 3;
    if (recent) return 3;
    return 2;
  }

  if (hasUnresolved && (top20 || festFocus)) {
    if (recent || (festFocus && festWindow)) return 4;
    return 3;
  }

  if (recent && spotlight && severe) return 3;
  if (recent && (spotlight || severe)) return 2;
  if (spotlight && thinOrWorse) return 1;
  return 0;
}

export type ExistingPlayMark = {
  timestamp: number;
  provenance: string;
  idStatus: string;
};

export type AcrHit = {
  artist: string;
  title: string;
  label?: string;
  isrc?: string;
  score: number;
};

export type GapProbePlan = {
  offsetSec: number;
  /** true when no nearby play blocks this probe */
  isGap: boolean;
  /** gap midpoint vs just-after a known cue */
  kind?: "gap" | "transition" | "empty";
};

function envEnabled(): boolean {
  return process.env.ACRCLOUD_ENABLED === "1";
}

function cred(name: string): string {
  return (process.env[name] ?? "").trim();
}

function hasCredentials(): boolean {
  return Boolean(
    cred("ACRCLOUD_HOST") &&
      cred("ACRCLOUD_ACCESS_KEY") &&
      cred("ACRCLOUD_ACCESS_SECRET"),
  );
}

function numEnv(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Wall-clock Identify budget (ms). 0 = no deadline. */
export function identifyBudgetMs(
  env: Record<string, string | undefined> = process.env,
): number {
  const n = Number(env.ACRCLOUD_DEADLINE_MS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function boolEnv(name: string): boolean {
  return process.env[name] === "1";
}

/** Env flag that defaults on unless explicitly set to "0". */
function boolEnvDefaultOn(name: string): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return true;
  return v === "1";
}

/** HMAC-SHA1 signature for ACRCloud Identify Protocol V1. */
export function acrSignature(
  accessKey: string,
  accessSecret: string,
  timestamp: string,
  dataType = "audio",
  signatureVersion = "1",
): string {
  const stringToSign = [
    "POST",
    "/v1/identify",
    accessKey,
    dataType,
    signatureVersion,
    timestamp,
  ].join("\n");
  return createHmac("sha1", accessSecret).update(stringToSign).digest("base64");
}

function artistFromAcrFields(m: {
  artist?: unknown;
  artists?: unknown;
}): string {
  if (typeof m.artists === "string") return m.artists.trim();
  if (Array.isArray(m.artists)) {
    return m.artists
      .map((a) =>
        a && typeof a === "object" && "name" in a
          ? String((a as { name?: unknown }).name ?? "").trim()
          : typeof a === "string"
            ? a.trim()
            : "",
      )
      .filter(Boolean)
      .join(", ");
  }
  if (typeof m.artist === "string") return m.artist.trim();
  return "";
}

/** Map ACRCloud music hit → normalized fields. */
export function mapAcrMusicHit(raw: unknown): AcrHit | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as {
    title?: string;
    score?: number | string;
    label?: string;
    artist?: string;
    artists?: Array<{ name?: string }> | string;
    external_ids?: { isrc?: string };
  };
  const title = m.title?.trim();
  const artist = artistFromAcrFields(m);
  if (!title || !artist) return null;
  const cleaned = sanitizeArtistName(artist);
  if (!cleaned) return null;
  const scoreNum = Number(m.score);
  return {
    artist: cleaned,
    title,
    label: m.label?.trim() || undefined,
    isrc: m.external_ids?.isrc?.trim() || undefined,
    score: Number.isFinite(scoreNum) ? scoreNum : 0,
  };
}

/**
 * Probe offsets at gaps and transitions — not a 30s/90s grid.
 *
 * - Empty set: a handful of interior anchors (never a dense step grid).
 * - Sparse set: midpoint of each large gap + just after each known cue.
 * `stepSec` is the minimum gap worth probing, not the stride.
 */
export function planTransitionProbes(
  durationSec: number,
  existing: ExistingPlayMark[],
  sampleSec: number,
  minGapSec = 75,
): GapProbePlan[] {
  const half = Math.max(24, Math.floor(sampleSec));
  const blockers = existing.filter(
    (p) =>
      STRONG_PROVENANCE.has(p.provenance) ||
      p.provenance === "fingerprint" ||
      p.idStatus === "identified" ||
      p.idStatus === "community_resolved",
  );
  const blocked = (offsetSec: number) =>
    blockers.some((p) => Math.abs(p.timestamp - offsetSec) <= half) ||
    offsetSec < sampleSec ||
    offsetSec + sampleSec > durationSec;

  const times = [
    ...new Set(
      existing
        .filter(
          (p) =>
            p.idStatus === "identified" ||
            p.idStatus === "community_resolved" ||
            STRONG_PROVENANCE.has(p.provenance),
        )
        .map((p) => Math.max(0, Math.floor(p.timestamp))),
    ),
  ].sort((a, b) => a - b);

  const candidates: GapProbePlan[] = [];
  if (times.length === 0) {
    for (const frac of [0.18, 0.38, 0.55, 0.72, 0.88]) {
      const offsetSec = Math.floor(durationSec * frac);
      candidates.push({
        offsetSec,
        isGap: !blocked(offsetSec),
        kind: "empty",
      });
    }
  } else {
    const anchors = [0, ...times, Math.floor(durationSec)];
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i]!;
      const b = anchors[i + 1]!;
      const gap = b - a;
      if (gap >= minGapSec) {
        const mid = Math.floor((a + b) / 2);
        candidates.push({
          offsetSec: mid,
          isGap: !blocked(mid),
          kind: "gap",
        });
      }
      if (a > 0 && gap >= minGapSec) {
        const after = a + sampleSec + 6;
        if (after + sampleSec < b) {
          candidates.push({
            offsetSec: after,
            isGap: !blocked(after),
            kind: "transition",
          });
        }
      }
    }
  }

  const seen = new Set<number>();
  const plans: GapProbePlan[] = [];
  for (const p of candidates.sort((a, b) => a.offsetSec - b.offsetSec)) {
    const key = Math.round(p.offsetSec / 8);
    if (seen.has(key)) continue;
    seen.add(key);
    plans.push(p);
  }
  return plans;
}

/** @deprecated alias — `stepSec` is the min gap, not a grid stride. */
export function planGapProbes(
  durationSec: number,
  existing: ExistingPlayMark[],
  stepSec: number,
  sampleSec: number,
): GapProbePlan[] {
  return planTransitionProbes(
    durationSec,
    existing,
    sampleSec,
    Math.max(75, stepSec),
  );
}

/**
 * True when Identify still has work: unresolved cues, or gap/transition
 * slots that are not already blocked by a hit *or* a recorded miss.
 */
export function hasRemainingAcrWork(opts: {
  durationSec: number;
  plays: ExistingPlayMark[];
  unresolvedCount: number;
  stepSec?: number;
  sampleSec?: number;
}): boolean {
  if (opts.unresolvedCount > 0) return true;
  const stepSec = opts.stepSec ?? 90;
  const sampleSec = opts.sampleSec ?? 12;
  return planGapProbes(
    opts.durationSec,
    opts.plays,
    stepSec,
    sampleSec,
  ).some((p) => p.isGap);
}

/** Prefer SoundCloud / hearthis; YouTube last (or excluded). */
export function rankPlaybackHost(
  host: PlaybackHost | null,
  allowYoutube: boolean,
): number | null {
  if (!host) return null;
  if (host === "youtube" && !allowYoutube) return null;
  return HOST_PREF[host];
}

type ScMediaTrack = ScTrack & {
  media?: {
    transcodings?: Array<{
      url?: string;
      duration?: number;
      format?: { protocol?: string; mime_type?: string };
      quality?: string;
      preset?: string;
    }>;
  };
};

export type ResolvedStream = {
  host: PlaybackHost;
  streamUrl: string;
  /** progressive | hls | http */
  kind: "progressive" | "hls" | "http";
};

/**
 * Resolve a direct audio URL for ffmpeg sampling.
 * Prefers progressive MP3; falls back to HLS (ffmpeg can read m3u8).
 */
export async function resolvePlaybackStream(
  playbackUrl: string,
  opts: { allowYoutube?: boolean } = {},
): Promise<ResolvedStream | null> {
  const host = detectPlaybackHost(playbackUrl);
  if (!host) return null;
  if (host === "youtube" && !opts.allowYoutube) return null;

  if (host === "soundcloud") {
    return resolveSoundCloudStream(playbackUrl);
  }
  if (host === "hearthis") {
    return resolveHearthisStream(playbackUrl);
  }
  // YouTube: no anonymous progressive URL — sampling uses yt-dlp separately.
  return null;
}

let ytDlpCached: boolean | null = null;

/** True when yt-dlp is on PATH and not disabled via ACRCLOUD_YT_DLP=0. */
export async function ytDlpAvailable(): Promise<boolean> {
  if (process.env.ACRCLOUD_YT_DLP === "0") return false;
  if (ytDlpCached != null) return ytDlpCached;
  try {
    await execFileAsync("yt-dlp", ["--version"], { timeout: 5_000 });
    ytDlpCached = true;
  } catch {
    ytDlpCached = false;
  }
  return ytDlpCached;
}

/** Reset cached yt-dlp probe (tests). */
export function resetYtDlpAvailableCache(): void {
  ytDlpCached = null;
}

/**
 * yt-dlp `--download-sections` time range (`*START-END`, seconds).
 * Adds a small pad so Identify gets a full sampleSec of audio.
 */
export function ytDlpSectionRange(
  offsetSec: number,
  sampleSec: number,
): string {
  const start = Math.max(0, Math.floor(offsetSec));
  const end = start + Math.max(1, Math.ceil(sampleSec));
  return `*${start}-${end}`;
}

type EnvMap = Record<string, string | undefined>;

/** True on GitHub Actions / generic CI. */
export function isGithubActions(env: EnvMap = process.env): boolean {
  return env.GITHUB_ACTIONS === "true" || env.CI === "true";
}

/**
 * Skip yt-dlp Identify for YouTube. File Scanning is the CI-safe path.
 * Explicit ACRCLOUD_IDENTIFY_YOUTUBE=0/1 wins; otherwise CI + File Scan secrets.
 */
export function skipYoutubeIdentifySampling(env: EnvMap = process.env): boolean {
  const explicit = (env.ACRCLOUD_IDENTIFY_YOUTUBE || "").trim();
  if (explicit === "0") return true;
  if (explicit === "1") return false;
  const fsReady =
    Boolean((env.ACRCLOUD_FS_TOKEN || "").trim()) &&
    Boolean((env.ACRCLOUD_FS_CONTAINER_ID || "").trim());
  return isGithubActions(env) && fsReady;
}

/** Fail-fast yt-dlp retries/timeout. Default on in CI. */
export function ytDlpFailFast(env: EnvMap = process.env): boolean {
  if (env.ACRCLOUD_YT_FAIL_FAST === "1") return true;
  if (env.ACRCLOUD_YT_FAIL_FAST === "0") return false;
  return isGithubActions(env);
}

const YT_BOT_WALL_RE =
  /sign in to confirm you.?re not a bot|confirm you.?re not a bot/i;

/** YouTube bot-wall / consent challenge in yt-dlp stderr. */
export function isYoutubeBotWall(text: string): boolean {
  return YT_BOT_WALL_RE.test(text);
}

/** Latest 19xx/20xx year in a set title, if any. */
export function youtubeTitleYear(title: string | undefined): number | null {
  if (!title) return null;
  const years = [...title.matchAll(/\b((?:19|20)\d{2})\b/g)].map((m) =>
    Number(m[1]),
  );
  if (years.length === 0) return null;
  return Math.max(...years);
}

/**
 * Archive-titled YouTube (year ≤ now − 3) is a poor Identify target from CI
 * IPs. File Scanning still fingerprints those URLs.
 */
export function isYoutubeIdentifyArchive(
  title: string | undefined,
  nowYear = new Date().getFullYear(),
  minAgeYears = 3,
): boolean {
  const y = youtubeTitleYear(title);
  return y != null && y <= nowYear - minAgeYears;
}

export function execErrorText(err: unknown): string {
  if (!err || typeof err !== "object") return String(err);
  const e = err as { message?: string; stderr?: unknown; stdout?: unknown };
  const parts = [e.message, stringifyExecIo(e.stderr), stringifyExecIo(e.stdout)];
  return parts.filter(Boolean).join("\n");
}

function stringifyExecIo(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Buffer.isBuffer(v)) return v.toString("utf8");
  return String(v);
}

/** yt-dlp argv for a 12s Identify clip (no full download). */
export function ytDlpSampleArgs(opts: {
  section: string;
  outTpl: string;
  pageUrl: string;
  cookiePath?: string;
  playerClients?: string;
  failFast?: boolean;
  sleepRequests?: string;
}): string[] {
  const retries = opts.failFast ? "1" : "5";
  const extractorRetries = opts.failFast ? "1" : "3";
  const args = [
    "--no-playlist",
    "--no-warnings",
    "-f",
    "bestaudio/best",
    "--download-sections",
    opts.section,
    "--force-keyframes-at-cuts",
    "--retries",
    retries,
    "--fragment-retries",
    retries,
    "--extractor-retries",
    extractorRetries,
    "--sleep-requests",
    opts.sleepRequests || (opts.failFast ? "0.5" : "1.5"),
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "5",
    "-o",
    opts.outTpl,
  ];
  if (opts.playerClients) {
    args.push("--extractor-args", `youtube:player_client=${opts.playerClients}`);
  }
  if (opts.cookiePath) {
    args.push("--cookies", opts.cookiePath);
  }
  args.push(opts.pageUrl);
  return args;
}

function appendIdentifySummary(lines: string[]): void {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  try {
    appendFileSync(path, `${lines.join("\n")}\n`);
  } catch {
    // Visibility only — never fail the enrich.
  }
}

/**
 * Cut a short mono mp3 from a YouTube watch URL via yt-dlp (+ ffmpeg post).
 * Uses --download-sections so we never pull the full playback.
 */
export async function sampleClipFromYoutube(
  pageUrl: string,
  offsetSec: number,
  sampleSec: number,
): Promise<ClipSampleResult> {
  if (!(await ytDlpAvailable())) {
    console.warn("[acrcloud] yt-dlp not available — cannot sample YouTube");
    return { ok: false, reason: "unavailable" };
  }
  const dir = await mkdtemp(join(tmpdir(), "setradar-acr-yt-"));
  const outTpl = join(dir, "clip.%(ext)s");
  const section = ytDlpSectionRange(offsetSec, sampleSec);
  const cookiePath = (process.env.ACRCLOUD_YTDLP_COOKIES || "").trim();
  // Retries + request pacing help with transient throttling. NOTE: YouTube
  // bot-walls ("Sign in to confirm you're not a bot") are driven mainly by the
  // caller IP — GitHub Actions datacenter IPs get blocked even WITH valid
  // cookies, so CI YouTube sampling is unreliable. Prefer File Scanning.
  // player_client rotation is opt-in only (some clients break format
  // selection, e.g. web_safari → "Requested format is not available").
  const playerClients = (process.env.ACRCLOUD_YT_PLAYER_CLIENTS || "").trim();
  const failFast = ytDlpFailFast();
  const args = ytDlpSampleArgs({
    section,
    outTpl,
    pageUrl,
    cookiePath: cookiePath || undefined,
    playerClients: playerClients || undefined,
    failFast,
    sleepRequests: process.env.ACRCLOUD_YT_SLEEP_REQUESTS,
  });
  const timeoutMs = failFast ? 45_000 : 180_000;
  try {
    await execFileAsync("yt-dlp", args, {
      timeout: timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
    });
    const files = await readdir(dir);
    const mp3 = files.find((f) => f.endsWith(".mp3"));
    if (!mp3) {
      console.warn(
        `[acrcloud] yt-dlp produced no mp3 @${offsetSec}s for ${pageUrl}`,
      );
      return { ok: false, reason: "empty" };
    }
    const buf = await readFile(join(dir, mp3));
    if (buf.length < 1000) return { ok: false, reason: "empty" };
    return { ok: true, clip: buf };
  } catch (err) {
    const text = execErrorText(err);
    const botWall = isYoutubeBotWall(text);
    console.warn(
      `[acrcloud] yt-dlp sample @${offsetSec}s failed${botWall ? " (bot-wall)" : ""}:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: false, reason: botWall ? "bot-wall" : "unavailable" };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Sample a clip for ACR Identify from the candidate's playback host. */
export async function sampleClipForCandidate(
  candidate: Pick<SparseSetCandidate, "host" | "playbackUrl">,
  streamUrl: string | null,
  offsetSec: number,
  sampleSec: number,
): Promise<ClipSampleResult> {
  if (candidate.host === "youtube") {
    return sampleClipFromYoutube(candidate.playbackUrl, offsetSec, sampleSec);
  }
  if (!streamUrl) return { ok: false, reason: "unavailable" };
  const clip = await sampleClipFromStream(streamUrl, offsetSec, sampleSec);
  if (!clip) return { ok: false, reason: "empty" };
  return { ok: true, clip };
}

async function resolveSoundCloudStream(
  pageUrl: string,
): Promise<ResolvedStream | null> {
  const track = await scGet<ScMediaTrack & { policy?: string }>(
    `/resolve?url=${encodeURIComponent(pageUrl)}`,
  );
  // SNIP = 30s preview only — useless for mid-set fingerprint probes.
  if (String(track.policy || "").toUpperCase() === "SNIP") {
    console.log(`[acrcloud] skip SoundCloud SNIP/preview-only: ${pageUrl}`);
    return null;
  }
  const clientId = await getSoundCloudClientId();
  const transcodings = track.media?.transcodings ?? [];
  const ordered = [...transcodings].sort((a, b) => {
    const score = (t: (typeof transcodings)[0]) => {
      const proto = t.format?.protocol ?? "";
      if (proto === "progressive") return 0;
      if (proto === "hls") return 1;
      return 2;
    };
    return score(a) - score(b);
  });

  for (const t of ordered) {
    if (!t.url) continue;
    const proto = t.format?.protocol ?? "";
    try {
      const u = new URL(t.url);
      u.searchParams.set("client_id", clientId);
      const look = await fetch(u, {
        headers: {
          "User-Agent": "SetRadar/0.1 (+https://setradar.ai; acr enrich)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(20_000),
      });
      if (!look.ok) continue;
      const body = (await look.json()) as { url?: string };
      if (!body.url) continue;
      // Preview CDN paths are ≤30s — skip so we never seek past EOF.
      if (/\/preview\//i.test(body.url) || /preview-media/i.test(body.url)) {
        continue;
      }
      return {
        host: "soundcloud",
        streamUrl: body.url,
        kind: proto === "hls" ? "hls" : "progressive",
      };
    } catch {
      continue;
    }
  }
  return null;
}

async function resolveHearthisStream(
  playbackUrl: string,
): Promise<ResolvedStream | null> {
  // Embed URL → need page permalinks via track id lookup, or parse page URL.
  const parsed = parseHearthisUrl(playbackUrl);
  let detail: (HtTrack & { stream_url?: string; download_url?: string }) | null =
    null;

  if (parsed?.user && parsed.track) {
    detail = (await fetchTrackDetail(parsed.user, parsed.track)) as HtTrack & {
      stream_url?: string;
      download_url?: string;
    };
  } else {
    // Embed form: https://app.hearthis.at/embed/{id}/…
    try {
      const u = new URL(playbackUrl);
      const parts = u.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      const id = embedIdx >= 0 ? parts[embedIdx + 1] : null;
      if (id && /^\d+$/.test(id)) {
        const res = await fetch(`https://api-v2.hearthis.at/track/${id}/`, {
          headers: {
            "User-Agent": "SetRadar/0.1 (+https://setradar.ai; acr enrich)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(20_000),
        });
        if (res.ok) {
          detail = (await res.json()) as HtTrack & {
            stream_url?: string;
            download_url?: string;
          };
        }
      }
    } catch {
      detail = null;
    }
  }

  const stream =
    detail?.download_url?.trim() || detail?.stream_url?.trim() || null;
  if (!stream) return null;
  return { host: "hearthis", streamUrl: stream, kind: "http" };
}

/** Extract a short audio clip via ffmpeg (mp3). */
export async function sampleClipFromStream(
  streamUrl: string,
  offsetSec: number,
  sampleSec: number,
): Promise<Buffer | null> {
  const dir = await mkdtemp(join(tmpdir(), "setradar-acr-"));
  const out = join(dir, "clip.mp3");
  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        String(Math.max(0, offsetSec)),
        "-t",
        String(sampleSec),
        "-i",
        streamUrl,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "44100",
        "-b:a",
        "128k",
        "-y",
        out,
      ],
      { timeout: 90_000, maxBuffer: 4 * 1024 * 1024 },
    );
    const buf = await readFile(out);
    if (buf.length < 1000) return null;
    return buf;
  } catch (err) {
    console.warn(
      `[acrcloud] ffmpeg sample @${offsetSec}s failed:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

type AcrIdentifyResult =
  | { ok: true; hit: AcrHit | null; statusCode: number; statusMsg: string }
  | { ok: false; error: string };

/** AudD on the clip first (when token + AUDD_ANALYZE=1); ACR on miss. */
async function identifyClipPreferAudd(
  sample: Buffer,
): Promise<AcrIdentifyResult> {
  const audd = await recognizeAuddClip(sample);
  if (audd?.artist && audd.title) {
    const cleaned = sanitizeArtistName(audd.artist);
    if (cleaned) {
      return {
        ok: true,
        hit: {
          artist: cleaned,
          title: audd.title,
          isrc: audd.isrc,
          score: 80,
        },
        statusCode: 0,
        statusMsg: "audd",
      };
    }
  }
  return acrIdentify(sample);
}

/** POST sample bytes to ACRCloud Identify. */
export async function acrIdentify(
  sample: Buffer,
  opts?: { host?: string; accessKey?: string; accessSecret?: string },
): Promise<AcrIdentifyResult> {
  const host = (opts?.host ?? cred("ACRCLOUD_HOST")).replace(
    /^https?:\/\//,
    "",
  );
  const accessKey = opts?.accessKey?.trim() ?? cred("ACRCLOUD_ACCESS_KEY");
  const accessSecret =
    opts?.accessSecret?.trim() ?? cred("ACRCLOUD_ACCESS_SECRET");
  if (!host || !accessKey || !accessSecret) {
    return { ok: false, error: "missing credentials" };
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const dataType = "audio";
  const signatureVersion = "1";
  const signature = acrSignature(
    accessKey,
    accessSecret,
    timestamp,
    dataType,
    signatureVersion,
  );

  const form = new FormData();
  form.append(
    "sample",
    new Blob([new Uint8Array(sample)], { type: "audio/mpeg" }),
    "sample.mp3",
  );
  form.append("sample_bytes", String(sample.length));
  form.append("access_key", accessKey);
  form.append("data_type", dataType);
  form.append("signature_version", signatureVersion);
  form.append("signature", signature);
  form.append("timestamp", timestamp);

  const url = `https://${host.replace(/^https?:\/\//, "")}/v1/identify`;
  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
    const text = await res.text();
    let json: {
      status?: { code?: number; msg?: string };
      metadata?: { music?: unknown[] };
    };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      return { ok: false, error: `non-JSON HTTP ${res.status}` };
    }
    const code = json.status?.code ?? -1;
    const msg = json.status?.msg ?? "";
    // 0 = Success, 1001 = No result
    if (code !== 0 && code !== 1001) {
      return { ok: false, error: `ACR status ${code}: ${msg}` };
    }
    const music = json.metadata?.music?.[0];
    return {
      ok: true,
      hit: music ? mapAcrMusicHit(music) : null,
      statusCode: code,
      statusMsg: msg,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Sets that are good fingerprint candidates: have playback, thin tracklist.
 * Prefers SoundCloud / hearthis over YouTube, then homepage-visible sparse
 * sets — especially unresolved (pink) IDs on Top 20 DJs / recent festivals.
 * YouTube is allowed for those priority targets by default.
 * Pass `host: "youtube"` to build a YouTube-only queue (File Scanning).
 */
export async function selectSparseSetsForFingerprint(
  prisma: PrismaClient,
  opts: AcrEnrichOptions = {},
): Promise<SparseSetCandidate[]> {
  const setLimit = opts.setLimit ?? numEnv("ACRCLOUD_SET_LIMIT", 5);
  const minIdentified =
    opts.minIdentifiedToSkip ?? numEnv("ACRCLOUD_MIN_IDENTIFIED", 4);
  const hostFilter = opts.host;
  const allowYoutube =
    hostFilter === "youtube"
      ? true
      : (opts.allowYoutube ?? boolEnv("ACRCLOUD_ALLOW_YOUTUBE"));
  const allowYoutubePriority = boolEnvDefaultOn(
    "ACRCLOUD_ALLOW_YOUTUBE_PRIORITY",
  );
  const top100 = loadDjMagTop100RankBySlug();
  const rosterHigh = rosterHighPrioritySlugs();
  const eventFocus = acrEventFocusSlugs();
  const nowMs = Date.now();

  // Full pool — the old take:500 silently dropped chart DJs outside rowid order.
  const rows = await prisma.set.findMany({
    where: {
      playbackUrl: { not: null },
      durationSec: { gte: 10 * 60 },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      playbackUrl: true,
      durationSec: true,
      publishedAt: true,
      genre: true,
      type: true,
      plays: {
        select: { idStatus: true, provenance: true, timestamp: true },
      },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true } } },
      },
      event: { select: { slug: true, kind: true } },
      edition: { select: { endsAt: true } },
    },
  });

  const candidates: SparseSetCandidate[] = [];
  for (const row of rows) {
    const playbackUrl = row.playbackUrl?.trim();
    if (!playbackUrl) continue;

    const identifiedStrong = row.plays.filter(
      (p) =>
        (p.idStatus === "identified" || p.idStatus === "community_resolved") &&
        STRONG_PROVENANCE.has(p.provenance),
    ).length;
    const unresolvedCount = row.plays.filter(
      (p) => p.idStatus === "unresolved_id",
    ).length;
    // Duration-aware skip: a 2h set with 4 IDs is still sparse (~2/h).
    // Keep sets that still have unresolved IDs even if density looks ok.
    const expectedFloor = Math.max(
      minIdentified,
      Math.floor(row.durationSec / (8 * 60)), // at least ~7.5 tracks/hour identified
    );
    if (identifiedStrong >= expectedFloor && unresolvedCount === 0) continue;
    if (
      !hasRemainingAcrWork({
        durationSec: row.durationSec,
        plays: row.plays,
        unresolvedCount,
      })
    ) {
      continue;
    }

    const primarySlug = row.artists[0]?.dj.slug;
    const top100Rank = primarySlug ? (top100.get(primarySlug) ?? null) : null;
    const liveSignals = {
      type: row.type,
      eventKind: row.event?.kind,
      title: row.title,
    };
    const isFestival = isLiveVenueSet(liveSignals);
    const isLivestream = isLivestreamSet(liveSignals);
    const isWeeklyRadio = isWeeklyRadioSet(liveSignals);
    const festivalSeason = isFestivalSeasonSet(
      {
        eventSlug: row.event?.slug,
        editionEndsAt: row.edition?.endsAt ?? null,
        publishedAt: row.publishedAt,
        type: row.type,
      },
      45,
      nowMs,
    );
    const sparseFestival =
      (isFestival || isLivestream) &&
      (row.plays.length === 0 || identifiedStrong < expectedFloor);
    const priorityTarget = isUnresolvedDetectPriority({
      unresolvedCount,
      top100Rank,
      isFestival,
      isLiveFocus: isLivestream,
      festivalSeason,
      sparseFestival,
    });

    const host = detectPlaybackHost(playbackUrl);
    if (hostFilter && host !== hostFilter) continue;
    const rank = rankPlaybackHost(
      host,
      allowYoutube || (allowYoutubePriority && priorityTarget),
    );
    if (rank == null || !host) continue;

    const density = assessSetDensity({
      durationSec: row.durationSec,
      playCount: row.plays.length,
    });
    const eventSlug = row.event?.slug?.toLowerCase() ?? "";
    candidates.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      playbackUrl,
      durationSec: row.durationSec,
      host,
      primaryDjSlug: primarySlug ?? null,
      identifiedStrong,
      playCount: row.plays.length,
      unresolvedCount,
      popularityRank: popularityRankForDjSlug(primarySlug, top100, rosterHigh),
      homepageBoost: homepageEnrichBoost({
        publishedAt: row.publishedAt,
        primaryDjSlug: primarySlug,
        genre: row.genre,
        densitySeverity: density.severity,
        top100,
        nowMs,
        unresolvedCount,
        playCount: row.plays.length,
        isFestival,
        festivalSeason,
        isLivestream,
        isWeeklyRadio,
      }),
      eventBoost:
        eventFocus.size > 0 && eventSlug && eventFocus.has(eventSlug) ? 1 : 0,
      densitySeverity: density.severity,
      publishedAtMs: row.publishedAt.getTime(),
    });
  }

  candidates.sort(compareSparseSetCandidates);

  return candidates.slice(0, setLimit);
}

/**
 * Sort: event focus → host → detect urgency (Top 20 / festival) → density →
 * chart/roster demand → capped unresolved cues → sparsity → recency.
 *
 * Event focus (ACRCLOUD_EVENT_SLUGS) beats host preference so a YT-only
 * festival run (e.g. Street Parade ARTE) is not starved by SoundCloud filler.
 */
export function compareSparseSetCandidates(
  a: SparseSetCandidate,
  b: SparseSetCandidate,
): number {
  if (a.eventBoost !== b.eventBoost) {
    return b.eventBoost - a.eventBoost;
  }
  const ha = HOST_PREF[a.host] - HOST_PREF[b.host];
  if (ha !== 0) return ha;
  if (a.homepageBoost !== b.homepageBoost) {
    return b.homepageBoost - a.homepageBoost;
  }
  const sev =
    DENSITY_SEVERITY_RANK[a.densitySeverity] -
    DENSITY_SEVERITY_RANK[b.densitySeverity];
  if (sev !== 0) return sev;
  if (a.popularityRank !== b.popularityRank) {
    return a.popularityRank - b.popularityRank;
  }
  // Cap unresolved so comment-spam ID dumps don't beat empty homepage sets.
  const ua = Math.min(a.unresolvedCount, 8);
  const ub = Math.min(b.unresolvedCount, 8);
  if (ua !== ub) return ub - ua;
  if (a.identifiedStrong !== b.identifiedStrong) {
    return a.identifiedStrong - b.identifiedStrong;
  }
  if (a.playCount !== b.playCount) return a.playCount - b.playCount;
  if (a.publishedAtMs !== b.publishedAtMs) {
    return b.publishedAtMs - a.publishedAtMs;
  }
  return b.durationSec - a.durationSec;
}

export async function upsertFingerprintTrack(
  prisma: PrismaClient,
  hit: AcrHit,
  setGenre: string | null | undefined,
): Promise<string> {
  const artistName = hit.artist;
  const title = hit.title;
  const isrc = normalizeIsrc(hit.isrc);
  const existing =
    (isrc
      ? await prisma.track.findFirst({ where: { isrc } })
      : null) ??
    (await prisma.track.findFirst({
      where: { title, artistName },
    }));
  if (existing) {
    const data: Record<string, unknown> = {};
    if (isrc && !existing.isrc) data.isrc = isrc;
    if (hit.label && !existing.labelId) {
      const slug = hit.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (slug) {
        const label = await prisma.label.upsert({
          where: { slug },
          create: { slug, name: hit.label },
          update: {},
        });
        data.labelId = label.id;
      }
    }
    if (setGenre && !existing.genre) data.genre = setGenre;
    if (Object.keys(data).length > 0) {
      await prisma.track.update({ where: { id: existing.id }, data });
    }
    return existing.id;
  }

  let labelId: string | null = null;
  if (hit.label) {
    const slug = hit.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (slug) {
      const label = await prisma.label.upsert({
        where: { slug },
        create: { slug, name: hit.label },
        update: {},
      });
      labelId = label.id;
    }
  }

  const slug = await allocateTrackSlug(
    artistName,
    title,
    async (candidate) => {
      const hitRow = await prisma.track.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return !!hitRow;
    },
    trackSlugBase(artistName, title),
  );

  const created = await prisma.track.create({
    data: {
      slug,
      title,
      artistName,
      labelId,
      genre: setGenre ?? null,
      isrc,
    },
  });
  return created.id;
}

/** Grey fingerprint miss — blocks the gap grid without counting as unresolved. */
async function recordFingerprintMiss(
  prisma: PrismaClient,
  setId: string,
  offsetSec: number,
  reason: string,
): Promise<void> {
  const position = await nextPlayPosition(prisma, setId);
  await prisma.played.create({
    data: {
      setId,
      position,
      timestamp: offsetSec,
      idStatus: "unparsed",
      provenance: "fingerprint",
      rawText: `acr-miss @ ${fmtTimestamp(offsetSec)}: ${reason}`.slice(0, 240),
    },
  });
}

export async function nextPlayPosition(
  prisma: PrismaClient,
  setId: string,
): Promise<number> {
  const agg = await prisma.played.aggregate({
    where: { setId },
    _max: { position: true },
  });
  return (agg._max.position ?? 0) + 1;
}

async function enrichOneSet(
  prisma: PrismaClient,
  candidate: SparseSetCandidate,
  opts: Required<
    Pick<
      AcrEnrichOptions,
      | "sampleSec"
      | "stepSec"
      | "minScore"
      | "dryRun"
      | "allowYoutube"
      | "maxProbesPerSet"
    >
  >,
): Promise<AcrSetEnrichResult> {
  const empty: AcrSetEnrichResult = {
    probed: 0,
    identified: 0,
    unresolved: 0,
    clipFails: 0,
    botWall: false,
    skipReason: "",
  };
  // YouTube: selection already applied allow/priority policy. Clips come from
  // yt-dlp (no progressive stream URL). SC/hearthis still need a stream.
  let streamUrl: string | null = null;
  if (candidate.host === "youtube") {
    if (!(await ytDlpAvailable())) {
      console.log(
        `[acrcloud] skip ${candidate.slug}: YouTube needs yt-dlp on PATH`,
      );
      return { ...empty, skipReason: "yt-dlp missing" };
    }
  } else {
    const stream = await resolvePlaybackStream(candidate.playbackUrl, {
      allowYoutube: opts.allowYoutube,
    });
    if (!stream) {
      console.log(
        `[acrcloud] skip ${candidate.slug}: no stream (${candidate.host})`,
      );
      return { ...empty, skipReason: "no stream" };
    }
    streamUrl = stream.streamUrl;
  }

  const set = await prisma.set.findUnique({
    where: { id: candidate.id },
    select: {
      genre: true,
      durationSec: true,
      plays: {
        select: {
          id: true,
          timestamp: true,
          provenance: true,
          idStatus: true,
          idTrackId: true,
          rawText: true,
          track: { select: { artistName: true, title: true } },
          idTrack: { select: { note: true } },
        },
      },
    },
  });
  if (!set) return empty;

  const marks: ExistingPlayMark[] = set.plays.map((p) => ({
    timestamp: p.timestamp,
    provenance: p.provenance,
    idStatus: p.idStatus,
  }));
  let lastIdentifiedKey: string | null = null;
  for (const p of [...set.plays].sort((a, b) => a.timestamp - b.timestamp)) {
    const key = playCollapseKey({
      artistName: p.track?.artistName,
      title: p.track?.title,
    });
    if (key) lastIdentifiedKey = key;
  }
  const half = Math.max(30, Math.floor(opts.stepSec / 2));
  const writeWeakGaps = boolEnv("ACRCLOUD_WRITE_WEAK_GAPS");

  let probed = 0;
  let identified = 0;
  let unresolved = 0;
  let clipFails = 0;
  let clipAttempts = 0;
  let consecutiveFails = 0;
  let botWall = false;

  const takeClip = async (offsetSec: number): Promise<Buffer | null> => {
    if (botWall) return null;
    if (clipAttempts >= opts.maxProbesPerSet) return null;
    if (consecutiveFails >= 3) return null;
    clipAttempts += 1;
    const sample = await sampleClipForCandidate(
      candidate,
      streamUrl,
      offsetSec,
      opts.sampleSec,
    );
    if (sample.ok) {
      consecutiveFails = 0;
      return sample.clip;
    }
    clipFails += 1;
    consecutiveFails += 1;
    if (sample.reason === "bot-wall") {
      botWall = true;
      console.warn(
        `[acrcloud] YouTube bot-wall on ${candidate.slug} — skip remaining probes for this set`,
      );
    }
    return null;
  };

  // 1) Resolve existing unresolved_id cues at their timestamps (Top 100 path).
  const unresolvedPlays = set.plays
    .filter((p) => p.idStatus === "unresolved_id")
    .filter((p) => !/acr-miss/i.test(p.idTrack?.note ?? ""))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 8);
  for (const play of unresolvedPlays) {
    if (botWall || clipAttempts >= opts.maxProbesPerSet) break;
    const clip = await takeClip(play.timestamp);
    if (!clip) {
      if (botWall) break;
      continue;
    }
    probed += 1;
    const result = await identifyClipPreferAudd(clip);
    if (!result.ok) {
      console.warn(
        `[acrcloud] resolve fail ${candidate.slug}@${play.timestamp}: ${result.error}`,
      );
      if (!opts.dryRun && play.idTrackId) {
        await prisma.idTrack.update({
          where: { id: play.idTrackId },
          data: { note: `acr-miss: ${result.error}` },
        });
      }
      continue;
    }
    if (!result.hit || result.hit.score < opts.minScore) {
      unresolved += 1;
      if (!opts.dryRun && play.idTrackId) {
        await prisma.idTrack.update({
          where: { id: play.idTrackId },
          data: {
            note: result.hit
              ? `acr-miss: weak score ${result.hit.score}`
              : "acr-miss: no ACRCloud match",
          },
        });
      }
      continue;
    }
    identified += 1;
    const resolveKey = playCollapseKey({
      artistName: result.hit.artist,
      title: result.hit.title,
    });
    if (resolveKey) lastIdentifiedKey = resolveKey;
    if (!opts.dryRun) {
      const trackId = await upsertFingerprintTrack(
        prisma,
        result.hit,
        set.genre,
      );
      if (play.idTrackId) {
        await prisma.idTrack.update({
          where: { id: play.idTrackId },
          data: {
            status: "community_resolved",
            resolvedTrackId: trackId,
            note: `ACRCloud score ${result.hit.score}: ${result.hit.artist} - ${result.hit.title}`,
          },
        });
      }
      await prisma.played.update({
        where: { id: play.id },
        data: {
          idStatus: "identified",
          provenance: "fingerprint",
          trackId,
          rawText: `${result.hit.artist} - ${result.hit.title} (acr resolve ${result.hit.score})`,
        },
      });
      console.log(
        `[acrcloud] resolved ${candidate.slug}@${fmtTimestamp(play.timestamp)} → ${result.hit.artist} - ${result.hit.title}`,
      );
    } else {
      console.log(
        `[acrcloud] dry-run resolve ${candidate.slug}@${play.timestamp}: ${result.hit.artist} - ${result.hit.title} (${result.hit.score})`,
      );
    }
    // Treat as identified so gap probes don't re-hit the same window.
    marks.push({
      timestamp: play.timestamp,
      provenance: "fingerprint",
      idStatus: "identified",
    });
  }

  // 2) Gap + transition probes (not a 30s grid). Budget-capped.
  const plans = planGapProbes(
    set.durationSec,
    marks,
    opts.stepSec,
    opts.sampleSec,
  ).filter((p) => p.isGap);

  for (const plan of plans) {
    if (botWall) break;
    if (clipAttempts >= opts.maxProbesPerSet) {
      console.log(
        `[acrcloud] probe cap ${opts.maxProbesPerSet} reached for ${candidate.slug}`,
      );
      break;
    }
    if (consecutiveFails >= 3) {
      console.log(
        `[acrcloud] 3 consecutive clip fails — skip rest of ${candidate.slug}`,
      );
      break;
    }
    // Skip if an earlier probe in this run already filled nearby.
    if (
      marks.some(
        (m) =>
          m.provenance === "fingerprint" &&
          Math.abs(m.timestamp - plan.offsetSec) <= half,
      )
    ) {
      continue;
    }

    const clip = await takeClip(plan.offsetSec);
    if (!clip) {
      if (botWall) break;
      continue;
    }
    probed += 1;

    const result = await identifyClipPreferAudd(clip);
    if (!result.ok) {
      console.warn(
        `[acrcloud] identify fail ${candidate.slug}@${plan.offsetSec}: ${result.error}`,
      );
      // Record the miss so the next run advances past this offset.
      if (!opts.dryRun) {
        await recordFingerprintMiss(
          prisma,
          candidate.id,
          plan.offsetSec,
          result.error,
        );
      }
      marks.push({
        timestamp: plan.offsetSec,
        provenance: "fingerprint",
        idStatus: "unparsed",
      });
      continue;
    }

    const tsLabel = fmtTimestamp(plan.offsetSec);
    if (!result.hit || result.hit.score < opts.minScore) {
      unresolved += 1;
      // Default: do not write weak gap rows — they inflate unresolvedCount and
      // crowd the next enrich queue. Opt in with ACRCLOUD_WRITE_WEAK_GAPS=1.
      // Always record a grey miss so we do not re-Identify the same offset.
      if (!opts.dryRun && writeWeakGaps) {
        const idLabel = `ID @ ${tsLabel} (fingerprint weak)`;
        const idTrack = await prisma.idTrack.create({
          data: {
            label: idLabel,
            note: result.hit
              ? `weak score ${result.hit.score}: ${result.hit.artist} - ${result.hit.title}`
              : "no ACRCloud match",
            status: "unresolved",
          },
        });
        const position = await nextPlayPosition(prisma, candidate.id);
        await prisma.played.create({
          data: {
            setId: candidate.id,
            position,
            timestamp: plan.offsetSec,
            idStatus: "unresolved_id",
            provenance: "fingerprint",
            rawText: idLabel,
            idTrackId: idTrack.id,
          },
        });
      } else if (!opts.dryRun) {
        await recordFingerprintMiss(
          prisma,
          candidate.id,
          plan.offsetSec,
          result.hit
            ? `weak score ${result.hit.score}`
            : "no ACRCloud match",
        );
      }
      marks.push({
        timestamp: plan.offsetSec,
        provenance: "fingerprint",
        idStatus: writeWeakGaps ? "unresolved_id" : "unparsed",
      });
      continue;
    }

    const hitKey = playCollapseKey({
      artistName: result.hit.artist,
      title: result.hit.title,
    });
    if (hitKey && hitKey === lastIdentifiedKey) {
      marks.push({
        timestamp: plan.offsetSec,
        provenance: "fingerprint",
        idStatus: "identified",
      });
      continue;
    }
    identified += 1;
    if (!opts.dryRun) {
      const trackId = await upsertFingerprintTrack(
        prisma,
        result.hit,
        set.genre,
      );
      const position = await nextPlayPosition(prisma, candidate.id);
      await prisma.played.create({
        data: {
          setId: candidate.id,
          position,
          timestamp: plan.offsetSec,
          idStatus: "identified",
          provenance: "fingerprint",
          rawText: `${result.hit.artist} - ${result.hit.title} (acr score ${result.hit.score})`,
          trackId,
        },
      });
    } else {
      console.log(
        `[acrcloud] dry-run ${candidate.slug}@${plan.offsetSec}: ${result.hit.artist} - ${result.hit.title} (${result.hit.score})`,
      );
    }
    if (hitKey) lastIdentifiedKey = hitKey;

    marks.push({
      timestamp: plan.offsetSec,
      provenance: "fingerprint",
      idStatus: "identified",
    });
  }

  return { probed, identified, unresolved, clipFails, botWall, skipReason: "" };
}

/**
 * One enrich pass. No-op unless ACRCLOUD_ENABLED=1 and credentials exist.
 */
export async function enrichSparseSetsWithAcrCloud(
  prisma: PrismaClient,
  opts: AcrEnrichOptions = {},
): Promise<AcrEnrichStats> {
  if (!envEnabled()) {
    return emptyStats({ enabled: false, skipped: "ACRCLOUD_ENABLED!=1" });
  }
  if (!hasCredentials()) {
    return emptyStats({
      enabled: false,
      skipped: "missing ACRCLOUD_* credentials",
    });
  }

  // ffmpeg required for sampling
  try {
    await execFileAsync("ffmpeg", ["-version"], { timeout: 5_000 });
  } catch {
    return emptyStats({ enabled: false, skipped: "ffmpeg not available" });
  }

  const sampleSec = opts.sampleSec ?? numEnv("ACRCLOUD_SAMPLE_SEC", 12);
  const stepSec = opts.stepSec ?? numEnv("ACRCLOUD_STEP_SEC", 90);
  const minScore = opts.minScore ?? numEnv("ACRCLOUD_MIN_SCORE", 55);
  const dryRun = opts.dryRun ?? boolEnv("ACRCLOUD_DRY_RUN");
  const allowYoutube = opts.allowYoutube ?? boolEnv("ACRCLOUD_ALLOW_YOUTUBE");
  const maxProbesPerSet =
    opts.maxProbesPerSet ?? numEnv("ACRCLOUD_MAX_PROBES_PER_SET", 20);

  // Over-fetch candidates so SNIP/preview-only SC tracks don't burn the set budget.
  const setLimit = opts.setLimit ?? numEnv("ACRCLOUD_SET_LIMIT", 5);
  const candidates = await selectSparseSetsForFingerprint(prisma, {
    ...opts,
    setLimit: Math.max(setLimit * 4, setLimit),
  });
  const skipYtIdentify = skipYoutubeIdentifySampling();
  console.log(
    `[acrcloud] ${candidates.length} sparse candidates (probe budget ${setLimit}, ` +
      `max ${maxProbesPerSet}/set)` +
      (dryRun ? " (dry-run)" : "") +
      (skipYtIdentify
        ? "; YouTube Identify off — File Scan / circuit owns YT"
        : ""),
  );
  if (skipYtIdentify && isGithubActions()) {
    console.log(
      "::notice title=ACR Identify::YouTube Identify skipped in CI. File Scanning (next step) fingerprints YouTube. SoundCloud / hearthis Identify still runs.",
    );
  }
  appendIdentifySummary([
    "## ACRCloud Identify (live)",
    "",
    skipYtIdentify
      ? "YouTube Identify is off — File Scanning handles YouTube. This table updates as each set finishes."
      : "Per-set results (updates while this step runs).",
    "",
    "| set | host | result |",
    "| --- | --- | --- |",
  ]);

  let probed = 0;
  let identified = 0;
  let unresolved = 0;
  let clipFails = 0;
  let setsWithStream = 0;
  let youtubeBotWalls = 0;
  let youtubeSkipped = 0;
  let skipRemainingYoutube = skipYtIdentify;
  const startedAt = Date.now();
  const budgetMs = identifyBudgetMs();
  const stopAt = budgetMs > 0 ? startedAt + budgetMs : Number.POSITIVE_INFINITY;
  let index = 0;
  let hitDeadline = false;

  for (const c of candidates) {
    if (setsWithStream >= setLimit) break;
    if (Date.now() >= stopAt) {
      hitDeadline = true;
      console.log(
        `::warning title=ACR Identify::wall-clock budget ${Math.round(budgetMs / 60_000)}m reached — remaining sets skipped so File Scan / save can still run`,
      );
      break;
    }
    index += 1;
    const elapsedMin = Math.round((Date.now() - startedAt) / 60_000);
    if (c.host === "youtube") {
      let reason = "";
      if (skipRemainingYoutube) {
        reason = skipYtIdentify
          ? "File Scan owns YouTube"
          : "bot-wall circuit";
      } else if (isYoutubeIdentifyArchive(c.title)) {
        reason = "archive title — File Scan";
      }
      if (reason) {
        youtubeSkipped += 1;
        console.log(
          `[acrcloud] skip ${c.slug}: ${reason} (${elapsedMin}m elapsed)`,
        );
        appendIdentifySummary([`| ${c.slug} | youtube | skipped — ${reason} |`]);
        continue;
      }
    }
    console.log(`::group::${c.slug} (${c.host})`);
    console.log(
      `[acrcloud] ${new Date().toISOString()} probing ${c.slug} ` +
        `(${index}/${candidates.length}, ${c.host}, home=${c.homepageBoost}, ` +
        `density=${c.densitySeverity}, pop=#${c.popularityRank}, ` +
        `${c.identifiedStrong} strong, ${c.unresolvedCount} unresolved, ` +
        `${c.playCount} plays, elapsed=${elapsedMin}m)`,
    );
    const r = await enrichOneSet(prisma, c, {
      sampleSec,
      stepSec,
      minScore,
      dryRun,
      allowYoutube,
      maxProbesPerSet,
    });
    probed += r.probed;
    identified += r.identified;
    unresolved += r.unresolved;
    clipFails += r.clipFails;
    if (r.botWall) {
      youtubeBotWalls += 1;
      skipRemainingYoutube = true;
      console.log(
        `::warning title=YouTube bot-wall::${c.slug} — Identify cannot sample this video from GitHub IPs (cookies do not help). Remaining YouTube Identify probes skipped. File Scan still runs.`,
      );
    }
    // Count only sets that actually yielded a stream (probed or dry-run identify loop).
    if (r.probed > 0 || r.identified > 0 || r.unresolved > 0) {
      setsWithStream += 1;
    }
    const result = r.botWall
      ? `bot-wall (clipFails=${r.clipFails})`
      : r.skipReason
        ? `skip — ${r.skipReason}`
        : `probed=${r.probed} hits=${r.identified} weak=${r.unresolved} clipFails=${r.clipFails}`;
    console.log(`[acrcloud] done ${c.slug}: ${result}`);
    console.log("::endgroup::");
    console.log(
      `::notice title=ACR Identify::${setsWithStream}/${setLimit} ${c.slug} ${c.host} ${result} elapsed=${elapsedMin}m`,
    );
    appendIdentifySummary([`| ${c.slug} | ${c.host} | ${result} |`]);
  }

  return emptyStats({
    enabled: true,
    candidates: candidates.length,
    probed,
    identified,
    unresolved,
    clipFails,
    setsProbed: setsWithStream,
    youtubeBotWalls,
    youtubeSkipped,
    skipped:
      candidates.length === 0
        ? "no sparse candidates"
        : hitDeadline
          ? "Identify wall-clock budget reached"
          : "",
  });
}
