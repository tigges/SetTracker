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
 * (still best for SoundCloud / hearthis streams). Same rules apply: writes
 * `provenance: "fingerprint"` into timeline gaps only, never overwrites
 * `sourceUrl` / `sourceName`, never deletes stronger source rows.
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
import { detectPlaybackHost } from "../../playback";
import {
  mapAcrMusicHit,
  nextPlayPosition,
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

type FsFile = {
  id?: string | number;
  state?: number;
  duration?: number;
  results?: {
    music?: Array<{ offset?: number; result?: unknown }>;
  };
};

/** Submit a YouTube URL to the container. Returns the created file id. */
export async function submitPlatformScan(
  cfg: FileScanConfig,
  url: string,
): Promise<string | null> {
  const res = await fetch(
    `${cfg.base}/api/fs-containers/${cfg.containerId}/files`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ data_type: "platforms", url }),
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

/** Parse a ready FsFile's music results into offset-sorted hits ≥ minScore. */
export function parseScanHits(file: FsFile, minScore: number): ScanHit[] {
  const music = file.results?.music ?? [];
  const out: ScanHit[] = [];
  for (const m of music) {
    const hit = mapAcrMusicHit(m.result);
    if (!hit || hit.score < minScore) continue;
    out.push({ offsetSec: Math.max(0, Math.floor(Number(m.offset) || 0)), hit });
  }
  out.sort((a, b) => a.offsetSec - b.offsetSec);
  return out;
}

/** Submit + poll a YouTube URL until ready; return parsed hits (or null). */
export async function scanYoutube(
  cfg: FileScanConfig,
  url: string,
  opts: { pollMs?: number; timeoutMs?: number } = {},
): Promise<ScanHit[] | null> {
  const pollMs = opts.pollMs ?? numEnv("ACRCLOUD_FS_POLL_MS", 15_000);
  const timeoutMs = opts.timeoutMs ?? numEnv("ACRCLOUD_FS_TIMEOUT_MS", 600_000);
  const fileId = await submitPlatformScan(cfg, url);
  if (!fileId) return null;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, pollMs));
    const file = await getScanFile(cfg, fileId);
    if (!file) continue;
    const state = Number(file.state);
    if (state === 1) return parseScanHits(file, cfg.minScore);
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
    select: { timestamp: true, provenance: true, idStatus: true },
  })) as ExistingPlay[];
  const marks = existing.map((p) => p.timestamp);
  const strongMarks = existing
    .filter((p) => STRONG.has(p.provenance) || p.idStatus === "identified")
    .map((p) => p.timestamp);

  let written = 0;
  let skipped = 0;
  for (const { offsetSec, hit } of hits) {
    const nearStrong = strongMarks.some((t) => Math.abs(t - offsetSec) <= gap);
    const nearAny = marks.some((t) => Math.abs(t - offsetSec) <= gap);
    if (nearStrong || nearAny) {
      skipped += 1;
      continue;
    }
    if (opts.dryRun) {
      written += 1;
      marks.push(offsetSec);
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
  }
  return { written, skipped };
}

export type FileScanStats = {
  enabled: boolean;
  scanned: number;
  identified: number;
  skipped: string;
};

/**
 * Scan sparse YouTube sets via File Scanning. Safe no-op when unconfigured.
 */
export async function enrichYoutubeSetsWithFileScan(
  prisma: PrismaClient,
): Promise<FileScanStats> {
  const cfg = fileScanConfig();
  if (!cfg) {
    return {
      enabled: false,
      scanned: 0,
      identified: 0,
      skipped: "ACRCLOUD_FS_TOKEN / ACRCLOUD_FS_CONTAINER_ID not set",
    };
  }
  const setLimit = numEnv("ACRCLOUD_FS_SET_LIMIT", 10);
  const dryRun = process.env.ACRCLOUD_FS_DRY_RUN === "1";

  // Reuse the severity-ranked queue, then keep only YouTube-playback sets.
  const all = await selectSparseSetsForFingerprint(prisma, {
    setLimit: setLimit * 6,
    allowYoutube: true,
  });
  const ytOnly: SparseSetCandidate[] = all
    .filter((c) => c.host === "youtube")
    .slice(0, setLimit);

  console.log(
    `[acr-fs] ${ytOnly.length} YouTube sets to scan (base ${cfg.base}, ` +
      `container ${cfg.containerId}, minScore ${cfg.minScore})` +
      (dryRun ? " (dry-run)" : ""),
  );

  let scanned = 0;
  let identified = 0;
  for (const c of ytOnly) {
    const url = youtubeWatchUrl(c.playbackUrl);
    if (!url) continue;
    console.log(`[acr-fs] scanning ${c.slug} → ${url}`);
    const hits = await scanYoutube(cfg, url);
    scanned += 1;
    if (!hits || hits.length === 0) {
      console.log(`[acr-fs] ${c.slug}: no matches`);
      continue;
    }
    const genre = await prisma.set
      .findUnique({ where: { id: c.id }, select: { genre: true } })
      .then((s) => s?.genre ?? null);
    const { written, skipped } = await applyScanHitsToSet(
      prisma,
      c.id,
      genre,
      hits,
      { dryRun },
    );
    identified += written;
    console.log(
      `[acr-fs] ${c.slug}: ${written} written, ${skipped} skipped (${hits.length} hits)`,
    );
  }

  return {
    enabled: true,
    scanned,
    identified,
    skipped: ytOnly.length === 0 ? "no sparse YouTube candidates" : "",
  };
}
