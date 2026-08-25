/**
 * Skip repeat Wikidata / DJ Mag official-site lookups after a recent miss.
 * Persisted at data/crosscheck/official-site-miss.json (Actions discovery cache).
 *
 * Force a recrawl with DJMAG_ENRICH_FORCE=1. TTL defaults to 21 days
 * (OFFICIAL_SITE_MISS_TTL_DAYS).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type OfficialSiteKind = "dj" | "festival";
export type OfficialSiteMissSource = "wikidata" | "djmag";

export type OfficialSiteMissRow = {
  checkedAt: string;
  source: OfficialSiteMissSource;
  kind: OfficialSiteKind;
};

export type OfficialSiteMissFile = {
  generatedAt: string;
  ttlDays: number;
  rows: Record<string, OfficialSiteMissRow>;
};

export const OFFICIAL_SITE_MISS_DEFAULT_TTL_DAYS = 21;

export function officialSiteMissPath(): string {
  return join(process.cwd(), "data/crosscheck/official-site-miss.json");
}

export function officialSiteMissTtlDays(
  env: Record<string, string | undefined> = process.env,
): number {
  const n = Number(env.OFFICIAL_SITE_MISS_TTL_DAYS);
  return Number.isFinite(n) && n > 0 ? n : OFFICIAL_SITE_MISS_DEFAULT_TTL_DAYS;
}

export function officialSiteMissForced(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const v = (env.DJMAG_ENRICH_FORCE || "").trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true";
}

export function officialSiteMissKey(
  kind: OfficialSiteKind,
  slug: string,
): string {
  return `${kind}:${slug}`;
}

export function isFreshOfficialSiteMissRow(
  row: OfficialSiteMissRow | undefined,
  now: Date,
  ttlDays: number,
): boolean {
  if (!row?.checkedAt) return false;
  const at = Date.parse(row.checkedAt);
  if (!Number.isFinite(at)) return false;
  return now.getTime() - at < ttlDays * 24 * 60 * 60 * 1000;
}

export function emptyOfficialSiteMissFile(
  ttlDays = OFFICIAL_SITE_MISS_DEFAULT_TTL_DAYS,
): OfficialSiteMissFile {
  return { generatedAt: "", ttlDays, rows: {} };
}

export function readOfficialSiteMissFile(
  path = officialSiteMissPath(),
): OfficialSiteMissFile {
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as OfficialSiteMissFile;
    return {
      generatedAt: raw.generatedAt ?? "",
      ttlDays: raw.ttlDays || OFFICIAL_SITE_MISS_DEFAULT_TTL_DAYS,
      rows: raw.rows ?? {},
    };
  } catch {
    return emptyOfficialSiteMissFile();
  }
}

export function writeOfficialSiteMissFile(
  file: OfficialSiteMissFile,
  path = officialSiteMissPath(),
): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

let store: OfficialSiteMissFile | null = null;

export function loadOfficialSiteMissCache(): OfficialSiteMissFile {
  if (!store) store = readOfficialSiteMissFile();
  return store;
}

export function officialSiteMissIsFresh(
  kind: OfficialSiteKind,
  slug: string,
  opts?: {
    now?: Date;
    env?: Record<string, string | undefined>;
  },
): boolean {
  const env = opts?.env ?? process.env;
  if (officialSiteMissForced(env)) return false;
  const file = loadOfficialSiteMissCache();
  const ttl = officialSiteMissTtlDays(env);
  return isFreshOfficialSiteMissRow(
    file.rows[officialSiteMissKey(kind, slug)],
    opts?.now ?? new Date(),
    ttl,
  );
}

export function officialSiteMissRecord(
  kind: OfficialSiteKind,
  slug: string,
  source: OfficialSiteMissSource,
  now = new Date(),
): void {
  const file = loadOfficialSiteMissCache();
  file.rows[officialSiteMissKey(kind, slug)] = {
    checkedAt: now.toISOString(),
    source,
    kind,
  };
}

export function officialSiteMissClear(
  kind: OfficialSiteKind,
  slug: string,
): void {
  const file = loadOfficialSiteMissCache();
  delete file.rows[officialSiteMissKey(kind, slug)];
}

export function persistOfficialSiteMissCache(now = new Date()): void {
  const file = loadOfficialSiteMissCache();
  file.generatedAt = now.toISOString();
  file.ttlDays = officialSiteMissTtlDays();
  writeOfficialSiteMissFile(file);
}

/** Test helper — do not use from ingest. */
export function resetOfficialSiteMissCacheForTests(
  next?: OfficialSiteMissFile,
): void {
  store = next ?? emptyOfficialSiteMissFile();
}
