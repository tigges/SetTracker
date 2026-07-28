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
 *   ACRCLOUD_MIN_SCORE      accept identified hits ≥ this (default 70)
 *   ACRCLOUD_MIN_IDENTIFIED skip sets with ≥ N strong IDs (default 4)
 *   ACRCLOUD_ALLOW_YOUTUBE=1  allow YT playback (default off — bot walls)
 *   ACRCLOUD_DRY_RUN=1      resolve + probe but do not write DB
 *
 * Hook: `npm run enrich:fingerprint` from catalog-enrich.yml (after thumbs/MB).
 */

import { createHmac } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { PrismaClient } from "@prisma/client";
import { sanitizeArtistName } from "../../artistName";
import { detectPlaybackHost, type PlaybackHost } from "../../playback";
import { fmtTimestamp } from "../../status";
import { allocateTrackSlug, trackSlugBase } from "../../tracks/slug";
import {
  fetchTrackDetail,
  parseHearthisUrl,
  type HtTrack,
} from "../hearthis/client";
import { ARTIST_ROSTER } from "../roster";
import { getSoundCloudClientId, scGet, type ScTrack } from "../soundcloud/client";
import { slugify } from "../types";

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
  youtube: 2,
};

export type AcrEnrichStats = {
  enabled: boolean;
  candidates: number;
  probed: number;
  identified: number;
  unresolved: number;
  skipped: string;
};

export type AcrEnrichOptions = {
  setLimit?: number;
  /** Minimum identified plays already present (strong provenance) to skip the set */
  minIdentifiedToSkip?: number;
  sampleSec?: number;
  stepSec?: number;
  minScore?: number;
  dryRun?: boolean;
  allowYoutube?: boolean;
};

export type SparseSetCandidate = {
  id: string;
  slug: string;
  playbackUrl: string;
  durationSec: number;
  host: PlaybackHost;
  identifiedStrong: number;
  playCount: number;
  /** Unresolved ID rows on this set (comment/description IDs). */
  unresolvedCount: number;
  /**
   * Demand proxy: lower = hotter. DJ Mag Top 100 rank (1–100), or 50 for
   * roster `priority: "high"`, else 999.
   */
  popularityRank: number;
};

/** DJ Mag Top 100 slug → rank (demand proxy until we have real viewership). */
export function loadDjMagTop100RankBySlug(): Map<string, number> {
  const path = join(
    process.cwd(),
    "data",
    "artist-seeds",
    "djmag-top100-djs-2025.json",
  );
  const out = new Map<string, number>();
  if (!existsSync(path)) return out;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      djs?: Array<{ slug?: string; rank?: number }>;
    };
    for (const d of raw.djs ?? []) {
      if (d.slug && typeof d.rank === "number") out.set(d.slug, d.rank);
    }
  } catch {
    /* ignore */
  }
  return out;
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

function boolEnv(name: string): boolean {
  return process.env[name] === "1";
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

/** Map ACRCloud music hit → normalized fields. */
export function mapAcrMusicHit(raw: unknown): AcrHit | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as {
    title?: string;
    score?: number;
    label?: string;
    artists?: Array<{ name?: string }>;
    external_ids?: { isrc?: string };
  };
  const title = m.title?.trim();
  const artist =
    m.artists
      ?.map((a) => a.name?.trim())
      .filter(Boolean)
      .join(", ") || "";
  if (!title || !artist) return null;
  const cleaned = sanitizeArtistName(artist);
  if (!cleaned) return null;
  return {
    artist: cleaned,
    title,
    label: m.label?.trim() || undefined,
    isrc: m.external_ids?.isrc?.trim() || undefined,
    score: typeof m.score === "number" ? m.score : 0,
  };
}

/**
 * Probe offsets across a set duration. Marks gaps where no existing play
 * sits within ±halfStep (fingerprint / weak rows do not block).
 */
export function planGapProbes(
  durationSec: number,
  existing: ExistingPlayMark[],
  stepSec: number,
  sampleSec: number,
): GapProbePlan[] {
  const half = Math.max(30, Math.floor(stepSec / 2));
  const blockers = existing.filter(
    (p) =>
      STRONG_PROVENANCE.has(p.provenance) ||
      p.provenance === "fingerprint" ||
      p.idStatus === "identified" ||
      p.idStatus === "community_resolved",
  );
  // Align probes to the step grid (90, 180, …), leaving room for the clip.
  const first = Math.max(stepSec, sampleSec);
  const plans: GapProbePlan[] = [];
  for (let t = first; t + sampleSec <= durationSec; t += stepSec) {
    const offsetSec = Math.floor(t);
    const blocked = blockers.some(
      (p) => Math.abs(p.timestamp - offsetSec) <= half,
    );
    plans.push({ offsetSec, isGap: !blocked });
  }
  return plans;
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
  // YouTube: no stable anonymous progressive URL without yt-dlp — skip.
  return null;
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
 * Prefers SoundCloud / hearthis over YouTube, then DJ Mag Top 100 / roster
 * demand, then worst density / most unresolved IDs.
 */
export async function selectSparseSetsForFingerprint(
  prisma: PrismaClient,
  opts: AcrEnrichOptions = {},
): Promise<SparseSetCandidate[]> {
  const setLimit = opts.setLimit ?? numEnv("ACRCLOUD_SET_LIMIT", 5);
  const minIdentified =
    opts.minIdentifiedToSkip ?? numEnv("ACRCLOUD_MIN_IDENTIFIED", 4);
  const allowYoutube = opts.allowYoutube ?? boolEnv("ACRCLOUD_ALLOW_YOUTUBE");
  const top100 = loadDjMagTop100RankBySlug();
  const rosterHigh = rosterHighPrioritySlugs();

  const rows = await prisma.set.findMany({
    where: {
      playbackUrl: { not: null },
      durationSec: { gte: 10 * 60 },
    },
    select: {
      id: true,
      slug: true,
      playbackUrl: true,
      durationSec: true,
      plays: {
        select: { idStatus: true, provenance: true },
      },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true } } },
      },
    },
    take: 500,
  });

  const candidates: SparseSetCandidate[] = [];
  for (const row of rows) {
    const playbackUrl = row.playbackUrl?.trim();
    if (!playbackUrl) continue;
    const host = detectPlaybackHost(playbackUrl);
    const rank = rankPlaybackHost(host, allowYoutube);
    if (rank == null || !host) continue;

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

    const primarySlug = row.artists[0]?.dj.slug;
    candidates.push({
      id: row.id,
      slug: row.slug,
      playbackUrl,
      durationSec: row.durationSec,
      host,
      identifiedStrong,
      playCount: row.plays.length,
      unresolvedCount,
      popularityRank: popularityRankForDjSlug(primarySlug, top100, rosterHigh),
    });
  }

  candidates.sort(compareSparseSetCandidates);

  return candidates.slice(0, setLimit);
}

/** Sort: host → Top 100/roster demand → unresolved cues → density. */
export function compareSparseSetCandidates(
  a: SparseSetCandidate,
  b: SparseSetCandidate,
): number {
  const ha = HOST_PREF[a.host] - HOST_PREF[b.host];
  if (ha !== 0) return ha;
  if (a.popularityRank !== b.popularityRank) {
    return a.popularityRank - b.popularityRank;
  }
  if (a.unresolvedCount !== b.unresolvedCount) {
    return b.unresolvedCount - a.unresolvedCount;
  }
  const densA = a.playCount / Math.max(a.durationSec, 1);
  const densB = b.playCount / Math.max(b.durationSec, 1);
  if (densA !== densB) return densA - densB;
  if (a.identifiedStrong !== b.identifiedStrong) {
    return a.identifiedStrong - b.identifiedStrong;
  }
  if (a.playCount !== b.playCount) return a.playCount - b.playCount;
  return b.durationSec - a.durationSec;
}

async function upsertFingerprintTrack(
  prisma: PrismaClient,
  hit: AcrHit,
  setGenre: string | null | undefined,
): Promise<string> {
  const artistName = hit.artist;
  const title = hit.title;
  const existing = await prisma.track.findFirst({
    where: { title, artistName },
  });
  if (existing) {
    const data: Record<string, unknown> = {};
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
    },
  });
  return created.id;
}

async function nextPlayPosition(
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
      "sampleSec" | "stepSec" | "minScore" | "dryRun" | "allowYoutube"
    >
  >,
): Promise<{ probed: number; identified: number; unresolved: number }> {
  const stream = await resolvePlaybackStream(candidate.playbackUrl, {
    allowYoutube: opts.allowYoutube,
  });
  if (!stream) {
    console.log(
      `[acrcloud] skip ${candidate.slug}: no stream (${candidate.host})`,
    );
    return { probed: 0, identified: 0, unresolved: 0 };
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
        },
      },
    },
  });
  if (!set) return { probed: 0, identified: 0, unresolved: 0 };

  const marks: ExistingPlayMark[] = set.plays.map((p) => ({
    timestamp: p.timestamp,
    provenance: p.provenance,
    idStatus: p.idStatus,
  }));
  const half = Math.max(30, Math.floor(opts.stepSec / 2));

  let probed = 0;
  let identified = 0;
  let unresolved = 0;

  // 1) Resolve existing unresolved_id cues at their timestamps (Top 100 path).
  const unresolvedPlays = set.plays
    .filter((p) => p.idStatus === "unresolved_id")
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 8);
  for (const play of unresolvedPlays) {
    const clip = await sampleClipFromStream(
      stream.streamUrl,
      play.timestamp,
      opts.sampleSec,
    );
    if (!clip) continue;
    probed += 1;
    const result = await acrIdentify(clip);
    if (!result.ok) {
      console.warn(
        `[acrcloud] resolve fail ${candidate.slug}@${play.timestamp}: ${result.error}`,
      );
      continue;
    }
    if (!result.hit || result.hit.score < opts.minScore) {
      unresolved += 1;
      continue;
    }
    identified += 1;
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

  // 2) Gap-fill probes on the step grid.
  const plans = planGapProbes(
    set.durationSec,
    marks,
    opts.stepSec,
    opts.sampleSec,
  ).filter((p) => p.isGap);

  for (const plan of plans) {
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

    const clip = await sampleClipFromStream(
      stream.streamUrl,
      plan.offsetSec,
      opts.sampleSec,
    );
    if (!clip) continue;
    probed += 1;

    const result = await acrIdentify(clip);
    if (!result.ok) {
      console.warn(
        `[acrcloud] identify fail ${candidate.slug}@${plan.offsetSec}: ${result.error}`,
      );
      continue;
    }

    const tsLabel = fmtTimestamp(plan.offsetSec);
    if (!result.hit || result.hit.score < opts.minScore) {
      unresolved += 1;
      if (!opts.dryRun) {
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
      }
      marks.push({
        timestamp: plan.offsetSec,
        provenance: "fingerprint",
        idStatus: "unresolved_id",
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

    marks.push({
      timestamp: plan.offsetSec,
      provenance: "fingerprint",
      idStatus: "identified",
    });
  }

  return { probed, identified, unresolved };
}

/**
 * One enrich pass. No-op unless ACRCLOUD_ENABLED=1 and credentials exist.
 */
export async function enrichSparseSetsWithAcrCloud(
  prisma: PrismaClient,
  opts: AcrEnrichOptions = {},
): Promise<AcrEnrichStats> {
  if (!envEnabled()) {
    return {
      enabled: false,
      candidates: 0,
      probed: 0,
      identified: 0,
      unresolved: 0,
      skipped: "ACRCLOUD_ENABLED!=1",
    };
  }
  if (!hasCredentials()) {
    return {
      enabled: false,
      candidates: 0,
      probed: 0,
      identified: 0,
      unresolved: 0,
      skipped: "missing ACRCLOUD_* credentials",
    };
  }

  // ffmpeg required for sampling
  try {
    await execFileAsync("ffmpeg", ["-version"], { timeout: 5_000 });
  } catch {
    return {
      enabled: false,
      candidates: 0,
      probed: 0,
      identified: 0,
      unresolved: 0,
      skipped: "ffmpeg not available",
    };
  }

  const sampleSec = opts.sampleSec ?? numEnv("ACRCLOUD_SAMPLE_SEC", 12);
  const stepSec = opts.stepSec ?? numEnv("ACRCLOUD_STEP_SEC", 90);
  const minScore = opts.minScore ?? numEnv("ACRCLOUD_MIN_SCORE", 70);
  const dryRun = opts.dryRun ?? boolEnv("ACRCLOUD_DRY_RUN");
  const allowYoutube = opts.allowYoutube ?? boolEnv("ACRCLOUD_ALLOW_YOUTUBE");

  // Over-fetch candidates so SNIP/preview-only SC tracks don't burn the set budget.
  const setLimit = opts.setLimit ?? numEnv("ACRCLOUD_SET_LIMIT", 5);
  const candidates = await selectSparseSetsForFingerprint(prisma, {
    ...opts,
    setLimit: Math.max(setLimit * 4, setLimit),
  });
  console.log(
    `[acrcloud] ${candidates.length} sparse candidates (probe budget ${setLimit})` +
      (dryRun ? " (dry-run)" : ""),
  );

  let probed = 0;
  let identified = 0;
  let unresolved = 0;
  let setsWithStream = 0;

  for (const c of candidates) {
    if (setsWithStream >= setLimit) break;
    console.log(
      `[acrcloud] probing ${c.slug} (${c.host}, pop=#${c.popularityRank}, ` +
        `${c.identifiedStrong} strong, ${c.unresolvedCount} unresolved, ${c.playCount} plays)`,
    );
    const before = probed;
    const r = await enrichOneSet(prisma, c, {
      sampleSec,
      stepSec,
      minScore,
      dryRun,
      allowYoutube,
    });
    probed += r.probed;
    identified += r.identified;
    unresolved += r.unresolved;
    // Count only sets that actually yielded a stream (probed or dry-run identify loop).
    if (r.probed > 0 || r.identified > 0 || r.unresolved > 0) {
      setsWithStream += 1;
    } else if (probed === before) {
      // no stream / empty plan — do not consume budget
    }
  }

  return {
    enabled: true,
    candidates: candidates.length,
    probed,
    identified,
    unresolved,
    skipped: candidates.length === 0 ? "no sparse candidates" : "",
  };
}
