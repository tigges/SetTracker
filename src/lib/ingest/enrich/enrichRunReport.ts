/**
 * Last Catalog enrich snapshot — rides prisma/dev.db so /stats can show it
 * after Pages restores the cache. No cookie values. Fill-null merge.
 */
import { readFileSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import {
  inspectYoutubeCookies,
  type YoutubeCookieHealth,
} from "./youtubeCookies";

export type EnrichIdentifySnapshot = {
  enabled: boolean;
  candidates: number;
  setsProbed: number;
  probed: number;
  identified: number;
  unresolved: number;
  clipFails: number;
  youtubeBotWalls: number;
  youtubeSkipped: number;
  skipped: string;
};

export type EnrichFileScanSnapshot = {
  enabled: boolean;
  submitted: number;
  ready: number;
  identified: number;
  skipped: string;
};

export type EnrichGithubSnapshot = {
  runId: string;
  runUrl: string;
  workflow: string;
  mode: string;
  ref: string;
};

export type EnrichRunReport = {
  version: 1;
  updatedAt: string;
  outcome: "ok" | "partial" | "noop";
  github?: EnrichGithubSnapshot;
  cookies?: YoutubeCookieHealth;
  identify?: EnrichIdentifySnapshot;
  filescan?: EnrichFileScanSnapshot;
};

const TABLE = `
CREATE TABLE IF NOT EXISTS EnrichRunReport (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)`;

export function githubEnrichContext(
  env: Record<string, string | undefined> = process.env,
): EnrichGithubSnapshot | undefined {
  const runId = (env.GITHUB_RUN_ID || "").trim();
  const repo = (env.GITHUB_REPOSITORY || "").trim();
  const server = (env.GITHUB_SERVER_URL || "https://github.com").replace(/\/+$/, "");
  if (!runId || !repo) return undefined;
  return {
    runId,
    runUrl: `${server}/${repo}/actions/runs/${runId}`,
    workflow: (env.GITHUB_WORKFLOW || "Catalog enrich").trim(),
    mode: (env.ACRCLOUD_SET_LIMIT || "").trim()
      ? `sets=${env.ACRCLOUD_SET_LIMIT} probes=${env.ACRCLOUD_MAX_PROBES_PER_SET || "?"}`
      : (env.GITHUB_EVENT_NAME || "").trim(),
    ref: (env.GITHUB_REF_NAME || env.GITHUB_REF || "").trim(),
  };
}

export function inspectCookiesFromEnv(
  env: Record<string, string | undefined> = process.env,
): YoutubeCookieHealth | undefined {
  const path = (env.ACRCLOUD_YTDLP_COOKIES || "").trim();
  if (!path) {
    return inspectYoutubeCookies("");
  }
  try {
    return inspectYoutubeCookies(readFileSync(path, "utf8"));
  } catch {
    return inspectYoutubeCookies("");
  }
}

export function enrichOutcome(report: Pick<EnrichRunReport, "identify" | "filescan">): EnrichRunReport["outcome"] {
  const idHits = report.identify?.identified ?? 0;
  const fsHits = report.filescan?.identified ?? 0;
  const idOn = report.identify?.enabled;
  const fsOn = report.filescan?.enabled;
  if (idHits + fsHits > 0) return "ok";
  if (idOn === false && fsOn === false) return "noop";
  if (idOn == null && fsOn == null) return "noop";
  return "partial";
}

export async function loadEnrichRunReport(
  prisma: PrismaClient,
): Promise<EnrichRunReport | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ payload: string }>>`
      SELECT payload FROM EnrichRunReport WHERE id = 'last'
    `;
    const raw = rows[0]?.payload;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EnrichRunReport;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function mergeEnrichRunReport(
  prisma: PrismaClient,
  patch: Partial<Omit<EnrichRunReport, "version" | "updatedAt" | "outcome">> & {
    identify?: EnrichIdentifySnapshot;
    filescan?: EnrichFileScanSnapshot;
    cookies?: YoutubeCookieHealth;
    github?: EnrichGithubSnapshot;
  },
): Promise<EnrichRunReport> {
  await prisma.$executeRawUnsafe(TABLE);
  const prev = (await loadEnrichRunReport(prisma)) ?? {
    version: 1 as const,
    updatedAt: "",
    outcome: "noop" as const,
  };
  const next: EnrichRunReport = {
    version: 1,
    updatedAt: new Date().toISOString(),
    github: patch.github ?? prev.github,
    cookies: patch.cookies ?? prev.cookies,
    identify: patch.identify ?? prev.identify,
    filescan: patch.filescan ?? prev.filescan,
    outcome: "noop",
  };
  next.outcome = enrichOutcome(next);
  const json = JSON.stringify(next);
  await prisma.$executeRaw`
    INSERT INTO EnrichRunReport (id, payload, updatedAt)
    VALUES ('last', ${json}, ${next.updatedAt})
    ON CONFLICT(id) DO UPDATE SET
      payload = ${json},
      updatedAt = ${next.updatedAt}
  `;
  return next;
}
