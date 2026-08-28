/**
 * ACRCloud File Scanning — server-side YouTube fingerprinting.
 *
 * Why
 * ---
 * yt-dlp sampling from GitHub Actions gets YouTube-bot-walled (datacenter IPs)
 * even with cookies. File Scanning offloads the download+scan to ACRCloud's own
 * infrastructure: we POST a YouTube URL, ACR fetches and fingerprints the whole
 * video, and returns every matched track with an offset. No caller-IP problem.
 *
 * This complements — does not replace — the Identify path in `acrcloud.ts`
 * (still best for SoundCloud / hearthis streams). File Scanning uses a
 * **YouTube-only** sparse queue so Tomorrowland radio / academy mixes cannot
 * crowd festival playbacks out of the slice. Held official playbacks (fan-clip watch list) are
 * skipped. Same write rules: `provenance: "fingerprint"` into timeline gaps
 * only, never overwrites `sourceUrl` / `sourceName`, never deletes stronger
 * source rows.
 *
 * Console API (bearer token), NOT the HMAC Identify signature.
 *   ACRCLOUD_FS_TOKEN         Console access token (Bearer)
 *   ACRCLOUD_FS_CONTAINER_ID  File Scanning container id
 *   ACRCLOUD_FS_REGION        eu-west-1 | us-west-2 | ap-southeast-1 (default eu-west-1)
 *   ACRCLOUD_FS_BASE          optional full base override (e.g. https://api-eu-west-1.acrcloud.com)
 *   ACRCLOUD_FS_MIN_SCORE     accept hits ≥ this (default 55)
 *   ACRCLOUD_FS_SET_LIMIT     max YouTube sets per run (default 10)
 *   ACRCLOUD_FS_POLL_MS       poll interval (default 15000)
 *   ACRCLOUD_FS_TIMEOUT_MS    max wait per file (default 600000)
 *   ACRCLOUD_FS_DRY_RUN=1     scan but do not write DB
 */
import type { PrismaClient } from "@prisma/client";
import {
  acrSpendConfirmed,
  announceAcrPlan,
  assertAcrSpendAllowed,
  estimateAcrFileScanSpend,
} from "./acrCost";
import { playCollapseKey } from "../../playCollapse";
import { detectPlaybackHost } from "../../playback";
import { HELD_PLAYBACK_WATCH } from "../nextCaptures";
import { isFingerprintOnlyVideoId, isFingerprintOnlyWatchUrl } from "../identify/fingerprintWatch";
import {
  formatAcrPartialReason,
  formatAcrTrackMessage,
} from "./acrProbeRecord";
import {
  mapAcrMusicHit,
  nextPlayPosition,
  recordFingerprintMiss,
  selectSparseSetsForFingerprint,
  upsertFingerprintTrack,
  type AcrHit,
  type SparseSetCandidate,
} from "./acrcloud";

export type FileScanConfig = {
  token: string;
  containerId: string;
  base: string;
  minScore: number;
};

const REGION_BASE: Record<string, string> = {
  "eu-west-1": "https://api-eu-west-1.acrcloud.com",
  "us-west-2": "https://api-us-west-2.acrcloud.com",
  "ap-southeast-1": "https://api-ap-southeast-1.acrcloud.com",
};

function numEnv(name: string, def: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/** Read File Scanning config from env; null when not configured. */
export function fileScanConfig(): FileScanConfig | null {
  const token = (process.env.ACRCLOUD_FS_TOKEN || "").trim();
  const containerId = (process.env.ACRCLOUD_FS_CONTAINER_ID || "").trim();
  if (!token || !containerId) return null;
  const region = (process.env.ACRCLOUD_FS_REGION || "eu-west-1").trim();
  const base =
    (process.env.ACRCLOUD_FS_BASE || "").trim().replace(/\/+$/, "") ||
    REGION_BASE[region] ||
    REGION_BASE["eu-west-1"]!;
  const minScore = numEnv("ACRCLOUD_FS_MIN_SCORE", 55);
  return { token, containerId, base, minScore };
}

/** `yt-<id>` or a YouTube URL → canonical watch URL. */
export function youtubeWatchUrl(playbackUrlOrSlug: string): string | null {
  const v = playbackUrlOrSlug.trim();
  if (/^https?:\/\//i.test(v)) {
    if (detectPlaybackHost(v) !== "youtube") return null;
    return v;
  }
  const id = v.startsWith("yt-") ? v.slice(3) : v;
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

type FsMusicRow = {
  offset?: number;
  result?: unknown;
  title?: string;
  score?: number | string;
  artists?: unknown;
  artist?: string;
};

type FsFile = {
  id?: string | number;
  state?: number;
  duration?: number;
  results?: {
    music?: FsMusicRow[];
  };
};

/** Unwrap File Scanning `music[]` rows: nested `result`, JSON string, or flat hit. */
export function fileScanMusicPayload(row: FsMusicRow): unknown {
  const raw = row?.result;
  if (raw == null) return row;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  if (Array.isArray(raw)) return raw[0];
  if (raw && typeof raw === "object" && "music" in raw) {
    const nested = (raw as { music?: unknown }).music;
    if (Array.isArray(nested)) return nested[0];
  }
  return raw;
}

/**
 * List File Scanning containers visible to a token across all regions.
 * Used by the diagnostic to reveal the correct container id + region when a
 * configured id is rejected ("Invalid Container").
 */
export async function listFileScanContainers(
  token: string,
): Promise<Array<{ region: string; base: string; id: string; name: string }>> {
  const out: Array<{ region: string; base: string; id: string; name: string }> =
    [];
  for (const [region, base] of Object.entries(REGION_BASE)) {
    try {
      const res = await fetch(`${base}/api/fs-containers?page=1&per_page=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        data?: Array<{ id?: string | number; name?: string }>;
      };
      for (const c of json.data ?? []) {
        if (c?.id == null) continue;
        out.push({
          region,
          base,
          id: String(c.id),
          name: String(c.name ?? ""),
        });
      }
    } catch {
      // ignore region errors
    }
  }
  return out;
}

/** Submit a YouTube URL to the container. Returns the created file id. */
export async function submitPlatformScan(
  cfg: FileScanConfig,
  url: string,
): Promise<string | null> {
  // Billable. Blocked until the plan was printed and spend confirmed.
  assertAcrSpendAllowed("filescan");
  const res = await fetch(
    `${cfg.base}/api/fs-containers/${cfg.containerId}/files`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // engine 1 = Audio Fingerprint (music recognition). Force it so a
      // container defaulting to AI-detection (engine 5) still fingerprints —
      // the container must still have the ACRCloud Music bucket attached.
      body: JSON.stringify({
        data_type: "platforms",
        url,
        engine: Number(process.env.ACRCLOUD_FS_ENGINE || 1) || 1,
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.warn(`[acr-fs] submit HTTP ${res.status}: ${text.slice(0, 200)}`);
    return null;
  }
  try {
    const json = JSON.parse(text) as { data?: FsFile } | FsFile;
    const file = (json as { data?: FsFile }).data ?? (json as FsFile);
    const id = file?.id;
    return id != null ? String(id) : null;
  } catch {
    console.warn(`[acr-fs] submit non-JSON: ${text.slice(0, 200)}`);
    return null;
  }
}

/** GET one file (with results). */
export async function getScanFile(
  cfg: FileScanConfig,
  fileId: string,
): Promise<FsFile | null> {
  const res = await fetch(
    `${cfg.base}/api/fs-containers/${cfg.containerId}/files/${fileId}?with_result=1`,
    {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(30_000),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.warn(`[acr-fs] get HTTP ${res.status}: ${text.slice(0, 200)}`);
    return null;
  }
  try {
    const json = JSON.parse(text) as { data?: FsFile } | FsFile;
    return (json as { data?: FsFile }).data ?? (json as FsFile);
  } catch {
    return null;
  }
}

export type ScanHit = { offsetSec: number; hit: AcrHit };

export type ScanResults = { hits: ScanHit[]; partials: ScanHit[] };

function scanHitFromRow(m: FsMusicRow): ScanHit | null {
  const hit = mapAcrMusicHit(fileScanMusicPayload(m));
  if (!hit) return null;
  // File Scanning docs: score is optional (title + artists are required).
  // ACR already accepted the match — don't drop a real hit with score omitted.
  const score = hit.score > 0 ? hit.score : 100;
  return {
    offsetSec: Math.max(0, Math.floor(Number(m.offset) || 0)),
    hit: { ...hit, score },
  };
}

/** Strong hits plus below-floor named rows (parked, not written as IDs). */
export function parseScanResults(
  file: FsFile,
  minScore: number,
): ScanResults {
  const music = file.results?.music ?? [];
  const hits: ScanHit[] = [];
  const partials: ScanHit[] = [];
  for (const m of music) {
    const row = scanHitFromRow(m);
    if (!row) continue;
    if (row.hit.score < minScore) partials.push(row);
    else hits.push(row);
  }
  hits.sort((a, b) => a.offsetSec - b.offsetSec);
  partials.sort((a, b) => a.offsetSec - b.offsetSec);
  return { hits, partials };
}

/** Parse a ready FsFile's music results into offset-sorted hits ≥ minScore. */
export function parseScanHits(file: FsFile, minScore: number): ScanHit[] {
  return parseScanResults(file, minScore).hits;
}

/** List container files (one page) with results. */
async function listContainerFiles(
  cfg: FileScanConfig,
  page: number,
): Promise<FsFile[] | null> {
  const res = await fetch(
    `${cfg.base}/api/fs-containers/${cfg.containerId}/files?with_result=1&page=${page}&per_page=50`,
    {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(30_000),
    },
  ).catch(() => null);
  if (!res) return null;
  if (!res.ok) {
    console.warn(`[acr-fs] list HTTP ${res.status}`);
    return null;
  }
  try {
    const json = (await res.json()) as { data?: FsFile[] };
    return json.data ?? [];
  } catch {
    return null;
  }
}

/** Index YouTube video ids already in the File Scanning container. */
export async function listKnownFsVideos(
  cfg: FileScanConfig,
): Promise<Map<string, KnownFsFile & { file: FsFile }>> {
  const out = new Map<string, KnownFsFile & { file: FsFile }>();
  for (let page = 1; page <= 10; page++) {
    const files = await listContainerFiles(cfg, page);
    if (!files) break;
    for (const file of files) {
      const vid = youtubeVideoIdFromFsUri((file as { uri?: unknown }).uri);
      if (!vid) continue;
      const fileId = String((file as { id?: unknown }).id ?? "");
      if (!fileId) continue;
      out.set(vid, { fileId, state: Number(file.state), file });
    }
    if (files.length < 50) break;
  }
  return out;
}

/** Find a file in the container by its id (across pages). */
async function findFileById(
  cfg: FileScanConfig,
  fileId: string,
): Promise<FsFile | null> {
  for (let page = 1; page <= 10; page++) {
    const files = await listContainerFiles(cfg, page);
    if (!files) return null;
    const match = files.find((f) => String((f as { id?: unknown }).id) === fileId);
    if (match) return match;
    if (files.length < 50) break;
  }
  return null;
}

/**
 * Submit + poll a YouTube URL until ready; return parsed hits (or null).
 * Polls the documented LIST endpoint (single-file GET shape is unreliable) and
 * logs observed state so stalls are visible.
 */
export async function scanYoutube(
  cfg: FileScanConfig,
  url: string,
  opts: { pollMs?: number; timeoutMs?: number; minScore?: number } = {},
): Promise<ScanHit[] | null> {
  const pollMs = opts.pollMs ?? numEnv("ACRCLOUD_FS_POLL_MS", 15_000);
  const timeoutMs = opts.timeoutMs ?? numEnv("ACRCLOUD_FS_TIMEOUT_MS", 600_000);
  const minScore = opts.minScore ?? cfg.minScore;
  const fileId = await submitPlatformScan(cfg, url);
  if (!fileId) return null;
  console.log(`[acr-fs] submitted file ${fileId} for ${url}`);
  const deadline = Date.now() + timeoutMs;
  let lastState: number | null = null;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, pollMs));
    const file = await findFileById(cfg, fileId);
    if (!file) {
      console.log(`[acr-fs] file ${fileId} not yet listed …`);
      continue;
    }
    const state = Number(file.state);
    if (state !== lastState) {
      console.log(`[acr-fs] file ${fileId} state=${state}`);
      lastState = state;
    }
    if (state === 1) {
      const musicLen = file.results?.music?.length ?? 0;
      const keys = file.results ? Object.keys(file.results) : [];
      console.log(
        `[acr-fs] ready: results keys=[${keys.join(",")}] music=${musicLen}`,
      );
      const hits = parseScanHits(file, minScore);
      if (musicLen === 0) {
        // Help diagnose empty results (e.g. container missing the Music DB).
        try {
          console.log(
            `[acr-fs] raw results: ${JSON.stringify(file.results).slice(0, 400)}`,
          );
        } catch {}
      } else if (hits.length === 0) {
        try {
          const first = file.results?.music?.[0];
          console.log(
            `[acr-fs] dropped ${musicLen} music row(s) (minScore ${minScore}): ${JSON.stringify(first).slice(0, 600)}`,
          );
        } catch {}
      }
      return hits;
    }
    if (state === -1) return []; // ready, no matches
    if (state === -2 || state === -3) {
      console.warn(`[acr-fs] scan error state=${state} for ${url}`);
      return null;
    }
    // state 0 = still processing
  }
  console.warn(`[acr-fs] timed out waiting for ${url}`);
  return null;
}

type ExistingPlay = {
  timestamp: number;
  provenance: string;
  idStatus: string;
  track?: { artistName: string; title: string } | null;
};

const STRONG = new Set([
  "soundcloud",
  "hearthis",
  "youtube",
  "bandcamp",
  "community",
  "1001tl",
]);

/** Write scan hits into timeline gaps for one set. Returns counts. */
export async function applyScanHitsToSet(
  prisma: PrismaClient,
  setId: string,
  genre: string | null | undefined,
  hits: ScanHit[],
  opts: { dryRun?: boolean; gapWindowSec?: number } = {},
): Promise<{ written: number; skipped: number }> {
  const gap = opts.gapWindowSec ?? 45;
  const existing = (await prisma.played.findMany({
    where: { setId },
    select: {
      timestamp: true,
      provenance: true,
      idStatus: true,
      track: { select: { artistName: true, title: true } },
    },
    orderBy: { timestamp: "asc" },
  })) as ExistingPlay[];
  const marks = existing.map((p) => p.timestamp);
  const strongMarks = existing
    .filter((p) => STRONG.has(p.provenance) || p.idStatus === "identified")
    .map((p) => p.timestamp);
  let lastIdentifiedKey: string | null = null;
  for (const p of existing) {
    const key = playCollapseKey({
      artistName: p.track?.artistName,
      title: p.track?.title,
    });
    if (key) lastIdentifiedKey = key;
  }

  let written = 0;
  let skipped = 0;
  const ordered = [...hits].sort((a, b) => a.offsetSec - b.offsetSec);
  for (const { offsetSec, hit } of ordered) {
    const hitKey = playCollapseKey({
      artistName: hit.artist,
      title: hit.title,
    });
    if (hitKey && hitKey === lastIdentifiedKey) {
      skipped += 1;
      continue;
    }
    const nearStrong = strongMarks.some((t) => Math.abs(t - offsetSec) <= gap);
    const nearAny = marks.some((t) => Math.abs(t - offsetSec) <= gap);
    if (nearStrong || nearAny) {
      skipped += 1;
      continue;
    }
    if (opts.dryRun) {
      written += 1;
      marks.push(offsetSec);
      if (hitKey) lastIdentifiedKey = hitKey;
      continue;
    }
    const trackId = await upsertFingerprintTrack(prisma, hit, genre);
    const position = await nextPlayPosition(prisma, setId);
    await prisma.played.create({
      data: {
        setId,
        position,
        timestamp: offsetSec,
        idStatus: "identified",
        provenance: "fingerprint",
        trackId,
        rawText: `${hit.artist} - ${hit.title} (acr file-scan ${hit.score})`,
      },
    });
    written += 1;
    marks.push(offsetSec);
    if (hitKey) lastIdentifiedKey = hitKey;
  }
  return { written, skipped };
}

/** Park below-floor File Scan hits so Identify does not retrace those offsets. */
export async function applyScanPartialsToSet(
  prisma: PrismaClient,
  setId: string,
  partials: ScanHit[],
  opts: { dryRun?: boolean; gapWindowSec?: number } = {},
): Promise<{ parked: number; skipped: number }> {
  const gap = opts.gapWindowSec ?? 45;
  const existing = await prisma.played.findMany({
    where: { setId },
    select: { timestamp: true },
  });
  const marks = existing.map((p) => p.timestamp);
  let parked = 0;
  let skipped = 0;
  const ordered = [...partials].sort((a, b) => a.offsetSec - b.offsetSec);
  for (const { offsetSec, hit } of ordered) {
    if (marks.some((t) => Math.abs(t - offsetSec) <= gap)) {
      skipped += 1;
      continue;
    }
    if (!opts.dryRun) {
      await recordFingerprintMiss(
        prisma,
        setId,
        offsetSec,
        formatAcrPartialReason(hit),
      );
    }
    parked += 1;
    marks.push(offsetSec);
  }
  return { parked, skipped };
}

export type FileScanStats = {
  enabled: boolean;
  submitted: number;
  /** Same YouTube already in the container — no re-POST. */
  reused: number;
  ready: number;
  identified: number;
  partial: number;
  missed: number;
  skipped: string;
};

function emptyFileScanStats(
  partial: Partial<FileScanStats> & Pick<FileScanStats, "enabled" | "skipped">,
): FileScanStats {
  return {
    submitted: 0,
    reused: 0,
    ready: 0,
    identified: 0,
    partial: 0,
    missed: 0,
    ...partial,
  };
}

function videoIdFromSlug(slug: string): string | null {
  const id = slug.startsWith("yt-") ? slug.slice(3) : slug;
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

/**
 * Skip File Scanning for held official playbacks (Calvin Harris / Chris Lorenzo / …)
 * until an official upload is wired. Matches DJ slug or set title.
 */
export function isHeldFileScanTarget(opts: {
  title?: string | null;
  primaryDjSlug?: string | null;
}): boolean {
  const hay = [opts.title ?? "", (opts.primaryDjSlug ?? "").replace(/-/g, " ")]
    .join(" ")
    .trim();
  if (!hay) return false;
  return HELD_PLAYBACK_WATCH.some((h) => h.match.test(hay));
}

/** Fan Identify-only clips must never enter the File Scanning playback queue. */
export function isFingerprintOnlyFileScanTarget(opts: {
  slug?: string | null;
  playbackUrl?: string | null;
}): boolean {
  const slug = opts.slug ?? "";
  const fromSlug = slug.startsWith("yt-") ? slug.slice(3) : "";
  if (fromSlug && isFingerprintOnlyVideoId(fromSlug)) return true;
  return opts.playbackUrl ? isFingerprintOnlyWatchUrl(opts.playbackUrl) : false;
}

/**
 * File Scanning queue: YouTube only, held official playbacks out, then slice.
 * Identify keeps SoundCloud-first ranking; this path must not share it.
 */
export function youtubeFileScanQueue(
  candidates: SparseSetCandidate[],
  setLimit: number,
): SparseSetCandidate[] {
  const limit = Number.isFinite(setLimit) && setLimit > 0 ? setLimit : 0;
  return candidates
    .filter((c) => c.host === "youtube")
    .filter((c) => !isHeldFileScanTarget(c))
    .filter((c) => !isFingerprintOnlyFileScanTarget(c))
    .slice(0, limit);
}

/** file.uri is `youtube:video:{id}` for platform scans. */
export function youtubeVideoIdFromFsUri(uri: unknown): string | null {
  const m = String(uri ?? "").match(/youtube:video:([A-Za-z0-9_-]{11})/);
  return m ? m[1]! : null;
}

export type KnownFsFile = { fileId: string; state: number };

/** Reuse a container file instead of POSTing the same YouTube URL again. */
export function fileScanActionForVideo(
  videoId: string,
  known: Map<string, KnownFsFile>,
): { action: "submit" } | { action: "reuse"; fileId: string; state: number } {
  const hit = known.get(videoId);
  if (hit?.fileId) return { action: "reuse", fileId: hit.fileId, state: hit.state };
  return { action: "submit" };
}

/**
 * Scan sparse YouTube sets via File Scanning. Safe no-op when unconfigured.
 *
 * Batch model: File Scanning is async and scans server-side in parallel, so we
 * submit all targets first, then poll the container's file list until each is
 * ready — far better than blocking ~10–20 min per set sequentially. Results
 * persist in the container, so a later run can still collect stragglers.
 */
export async function enrichYoutubeSetsWithFileScan(
  prisma: PrismaClient,
): Promise<FileScanStats> {
  const cfg = fileScanConfig();
  if (!cfg) {
    return emptyFileScanStats({
      enabled: false,
      skipped: "ACRCLOUD_FS_TOKEN / ACRCLOUD_FS_CONTAINER_ID not set",
    });
  }
  const setLimit = numEnv("ACRCLOUD_FS_SET_LIMIT", 10);
  const dryRun = process.env.ACRCLOUD_FS_DRY_RUN === "1";

  // Disclose the worst-case spend, then require confirmation for this run.
  const estimate = estimateAcrFileScanSpend({ videos: setLimit });
  announceAcrPlan(estimate);
  if (!dryRun && !acrSpendConfirmed()) {
    console.log(
      "[acr-fs] no requests — set ACRCLOUD_CONFIRM_SPEND=1 for this local run",
    );
    return emptyFileScanStats({
      enabled: false,
      skipped: `spend not confirmed (${estimate.summary})`,
    });
  }

  const pollMs = numEnv("ACRCLOUD_FS_POLL_MS", 20_000);
  const timeoutMs = numEnv("ACRCLOUD_FS_TIMEOUT_MS", 1_500_000); // 25m default

  // YouTube-only pool (over-fetch a little so held official playbacks can be dropped).
  const pooled = await selectSparseSetsForFingerprint(prisma, {
    setLimit: Math.max(setLimit * 3, setLimit),
    allowYoutube: true,
    host: "youtube",
  });
  const heldSkip = pooled.filter((c) => isHeldFileScanTarget(c)).length;
  const ytOnly = youtubeFileScanQueue(pooled, setLimit);

  console.log(
    `[acr-fs] ${ytOnly.length} YouTube sets (pooled ${pooled.length}, ` +
      `held-skip ${heldSkip}, base ${cfg.base}, ` +
      `container ${cfg.containerId}, minScore ${cfg.minScore})` +
      (dryRun ? " (dry-run)" : ""),
  );
  if (ytOnly.length === 0) {
    return emptyFileScanStats({
      enabled: true,
      skipped: "no sparse YouTube candidates",
    });
  }

  // Phase A — reuse files already in the container; submit only new videos.
  const known = await listKnownFsVideos(cfg);
  const byVideo = new Map<
    string,
    { candidate: SparseSetCandidate; fileId: string | null; done: boolean }
  >();
  let submitted = 0;
  let reused = 0;
  let ready = 0;
  let identified = 0;
  let partial = 0;
  let missed = 0;
  const genreCache = new Map<string, string | null>();

  const finish = (skipped: string): FileScanStats => {
    const trackMsg = formatAcrTrackMessage({
      probed: ready,
      identified,
      partial,
      missed,
    });
    console.log(`[acr-fs] ${trackMsg}`);
    return {
      enabled: true,
      submitted,
      reused,
      ready,
      identified,
      partial,
      missed,
      skipped,
    };
  };

  const applyReady = async (
    slug: string,
    setId: string,
    file: FsFile,
  ): Promise<void> => {
    const { hits, partials } = parseScanResults(file, cfg.minScore);
    if (hits.length === 0 && partials.length === 0) {
      missed += 1;
      console.log(`[acr-fs] ${slug}: ready, no matches`);
      return;
    }
    if (hits.length > 0 && !genreCache.has(setId)) {
      const s = await prisma.set.findUnique({
        where: { id: setId },
        select: { genre: true },
      });
      genreCache.set(setId, s?.genre ?? null);
    }
    if (hits.length > 0) {
      const { written, skipped } = await applyScanHitsToSet(
        prisma,
        setId,
        genreCache.get(setId),
        hits,
        { dryRun },
      );
      identified += written;
      console.log(
        `[acr-fs] ${slug}: ${written} written, ${skipped} skipped (${hits.length} hits)`,
      );
    }
    if (partials.length > 0) {
      const parked = await applyScanPartialsToSet(prisma, setId, partials, {
        dryRun,
      });
      partial += parked.parked;
      console.log(
        `[acr-fs] ${slug}: ${parked.parked} partial parked, ${parked.skipped} skipped (${partials.length} below floor)`,
      );
    }
  };

  for (const c of ytOnly) {
    const videoId = videoIdFromSlug(c.slug);
    const url = youtubeWatchUrl(c.playbackUrl);
    if (!videoId || !url) continue;
    const existing = known.get(videoId);
    if (existing) {
      reused += 1;
      const done = existing.state !== 0;
      byVideo.set(videoId, { candidate: c, fileId: existing.fileId, done });
      if (existing.state === 1) {
        ready += 1;
        await applyReady(c.slug, c.id, existing.file);
      } else if (existing.state !== 0) {
        console.log(
          `[acr-fs] reuse ${c.slug} file ${existing.fileId} state=${existing.state} (no re-submit)`,
        );
      } else {
        console.log(
          `[acr-fs] reuse ${c.slug} file ${existing.fileId} (still processing, no re-submit)`,
        );
      }
      continue;
    }
    const fileId = await submitPlatformScan(cfg, url);
    byVideo.set(videoId, { candidate: c, fileId, done: false });
    if (fileId) submitted += 1;
    console.log(
      `[acr-fs] submit ${c.slug} → ${fileId ? `file ${fileId}` : "FAILED"}`,
    );
  }
  console.log(
    `[acr-fs] submit ${submitted} new, reuse ${reused} already in container`,
  );
  if (submitted === 0 && reused === 0) {
    return finish("all submits failed (token/container/region?)");
  }

  // Phase B — poll only files that are still processing (new submits + reused in-flight).
  const inflight = [...byVideo.values()].filter((v) => v.fileId && !v.done);
  if (inflight.length === 0) {
    return finish(
      reused
        ? `reused ${reused} already-scanned YouTube file(s); no re-submit`
        : "",
    );
  }
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, pollMs));
    let page = 1;
    let sawFull = true;
    while (sawFull && page <= 10) {
      const res = await fetch(
        `${cfg.base}/api/fs-containers/${cfg.containerId}/files?with_result=1&page=${page}&per_page=50`,
        {
          headers: {
            Authorization: `Bearer ${cfg.token}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(30_000),
        },
      ).catch(() => null);
      if (!res || !res.ok) break;
      const json = (await res.json()) as { data?: FsFile[] };
      const files = json.data ?? [];
      sawFull = files.length === 50;
      page += 1;
      for (const file of files) {
        const vid = youtubeVideoIdFromFsUri((file as { uri?: unknown }).uri);
        if (!vid) continue;
        const target = byVideo.get(vid);
        if (!target || target.done) continue;
        const state = Number(file.state);
        if (state === 0) continue; // still processing
        target.done = true;
        ready += 1;
        if (state !== 1) {
          missed += 1;
          console.log(
            `[acr-fs] ${target.candidate.slug}: state=${state} (no result)`,
          );
          continue;
        }
        await applyReady(target.candidate.slug, target.candidate.id, file);
      }
    }
    const pending = [...byVideo.values()].filter((v) => v.fileId && !v.done);
    if (pending.length === 0) break;
    console.log(`[acr-fs] waiting on ${pending.length} scan(s) still processing …`);
  }

  const stillPending = [...byVideo.values()].filter(
    (v) => v.fileId && !v.done,
  ).length;
  return finish(
    stillPending
      ? `${stillPending} scan(s) still processing (results persist; next run collects)`
      : "",
  );
}
