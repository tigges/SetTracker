/**
 * Skip HEAD of social / website URLs that we already kept recently.
 * Persisted at data/crosscheck/url-probe.json (Actions discovery cache).
 *
 * Probe when the URL is new, the last result is older than 30 days, or
 * VERIFY_URLS_FORCE=1. TTL: URL_PROBE_TTL_DAYS.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type UrlProbeResult = "ok" | "dead" | "soft";

export type UrlProbeRow = {
  checkedAt: string;
  result: UrlProbeResult;
};

export type UrlProbeFile = {
  generatedAt: string;
  ttlDays: number;
  urls: Record<string, UrlProbeRow>;
};

export const URL_PROBE_DEFAULT_TTL_DAYS = 30;

export function urlProbePath(): string {
  return join(process.cwd(), "data/crosscheck/url-probe.json");
}

export function urlProbeTtlDays(
  env: Record<string, string | undefined> = process.env,
): number {
  const n = Number(env.URL_PROBE_TTL_DAYS);
  return Number.isFinite(n) && n > 0 ? n : URL_PROBE_DEFAULT_TTL_DAYS;
}

export function urlProbeForced(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const v = (env.VERIFY_URLS_FORCE || "").trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true";
}

export function normalizeProbeUrl(url: string): string {
  return url.trim();
}

export function isFreshUrlProbeRow(
  row: UrlProbeRow | undefined,
  now: Date,
  ttlDays: number,
): boolean {
  if (!row?.checkedAt) return false;
  const at = Date.parse(row.checkedAt);
  if (!Number.isFinite(at)) return false;
  return now.getTime() - at < ttlDays * 24 * 60 * 60 * 1000;
}

export function emptyUrlProbeFile(
  ttlDays = URL_PROBE_DEFAULT_TTL_DAYS,
): UrlProbeFile {
  return { generatedAt: "", ttlDays, urls: {} };
}

export function readUrlProbeFile(path = urlProbePath()): UrlProbeFile {
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as UrlProbeFile;
    return {
      generatedAt: raw.generatedAt ?? "",
      ttlDays: raw.ttlDays || URL_PROBE_DEFAULT_TTL_DAYS,
      urls: raw.urls ?? {},
    };
  } catch {
    return emptyUrlProbeFile();
  }
}

export function writeUrlProbeFile(
  file: UrlProbeFile,
  path = urlProbePath(),
): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

let store: UrlProbeFile | null = null;

export function loadUrlProbeCache(): UrlProbeFile {
  if (!store) store = readUrlProbeFile();
  return store;
}

/** Fresh ok/soft hit — skip the network. Dead or stale → probe. */
export function cachedUrlProbe(
  url: string,
  opts?: {
    now?: Date;
    env?: Record<string, string | undefined>;
  },
): UrlProbeResult | null {
  const env = opts?.env ?? process.env;
  if (urlProbeForced(env)) return null;
  const key = normalizeProbeUrl(url);
  if (!key) return null;
  const file = loadUrlProbeCache();
  const row = file.urls[key];
  if (!isFreshUrlProbeRow(row, opts?.now ?? new Date(), urlProbeTtlDays(env))) {
    return null;
  }
  if (row.result === "dead") return null;
  return row.result;
}

export function recordUrlProbe(
  url: string,
  result: UrlProbeResult,
  now = new Date(),
): void {
  const key = normalizeProbeUrl(url);
  if (!key) return;
  const file = loadUrlProbeCache();
  file.urls[key] = { checkedAt: now.toISOString(), result };
}

export function persistUrlProbeCache(now = new Date()): void {
  const file = loadUrlProbeCache();
  file.generatedAt = now.toISOString();
  file.ttlDays = urlProbeTtlDays();
  writeUrlProbeFile(file);
}

/** Test helper — do not use from ingest. */
export function resetUrlProbeCacheForTests(next?: UrlProbeFile): void {
  store = next ?? emptyUrlProbeFile();
}
