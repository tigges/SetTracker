/**
 * HEAD-only liveness for canonical Beatport /track/{slug}/{id} pins.
 * Never fetches or parses HTML (Cloudflare wall). 404/410 drop the URL
 * and keep the ISRC. 401/403/429/5xx are a soft wall — URL stays.
 *
 *   npx tsx scripts/probe-beatport-heads.ts [--new|--since <git-ref>] [--limit N]
 *
 * `--new` diffs against HEAD~1. `--since <ref>` diffs against that commit's
 * pins (use after this script itself is committed). Default probes every
 * pin that has a Beatport URL.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  loadTrackIdPins,
  type TrackIdPin,
} from "../src/lib/ingest/identify/trackIdPins";
import { canonicalBeatportUrl } from "../src/lib/trackMeta";

const UA = "SetRadar/0.2.203 (+https://setradar.ai; beatport-head)";
const TIMEOUT_MS = 8_000;
const CONCURRENCY = 2;
const PACE_MS = 200;
const WALL_STREAK = 3;

type HeadKind = "live" | "dead" | "soft" | "unknown" | "skipped";

type HeadHit = {
  url: string;
  status: number | null;
  kind: HeadKind;
};

function classify(status: number | null): Exclude<HeadKind, "skipped"> {
  if (status === 404 || status === 410) return "dead";
  if (status === 401 || status === 403 || status === 429) return "soft";
  if (status !== null && status < 400) return "live";
  if (status !== null && status >= 500) return "soft";
  return "unknown";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function headOnly(url: string): Promise<HeadHit> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "*/*" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { url, status: res.status, kind: classify(res.status) };
  } catch {
    return { url, status: null, kind: "unknown" };
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i]!);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );
  return out;
}

function parseArgs(argv: string[]) {
  const newOnly = argv.includes("--new");
  const sinceIdx = argv.indexOf("--since");
  const sinceRef =
    sinceIdx >= 0 && argv[sinceIdx + 1]
      ? argv[sinceIdx + 1]
      : newOnly
        ? "HEAD~1"
        : null;
  const limitIdx = argv.indexOf("--limit");
  const limitRaw = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;
  return { sinceRef, limit };
}

async function pinUrlsAt(ref: string): Promise<Set<string>> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const exec = promisify(execFile);
  try {
    const { stdout } = await exec("git", [
      "show",
      `${ref}:data/track-id-pins.json`,
    ]);
    const rows = JSON.parse(stdout) as TrackIdPin[];
    return new Set(
      rows
        .map((p) => canonicalBeatportUrl(p.beatportUrl))
        .filter((u): u is string => Boolean(u)),
    );
  } catch {
    return new Set();
  }
}

async function main() {
  const { sinceRef, limit } = parseArgs(process.argv.slice(2));
  const pins = loadTrackIdPins();
  const prev = sinceRef ? await pinUrlsAt(sinceRef) : new Set<string>();
  let urls = [
    ...new Set(
      pins
        .map((p) => canonicalBeatportUrl(p.beatportUrl))
        .filter((u): u is string => Boolean(u)),
    ),
  ];
  if (sinceRef) urls = urls.filter((u) => !prev.has(u));
  if (limit) urls = urls.slice(0, limit);

  let aborted = false;
  let wallStreak = 0;
  const hits = await mapPool(urls, CONCURRENCY, async (url) => {
    if (aborted) return { url, status: null, kind: "skipped" as const };
    await sleep(PACE_MS);
    const hit = await headOnly(url);
    if (hit.kind === "soft") {
      wallStreak += 1;
      if (wallStreak >= WALL_STREAK) aborted = true;
    } else if (hit.kind === "live" || hit.kind === "dead") {
      wallStreak = 0;
    }
    return hit;
  });

  const dead = new Set(hits.filter((h) => h.kind === "dead").map((h) => h.url));
  const next = pins.map((p) => {
    const url = canonicalBeatportUrl(p.beatportUrl);
    if (url && dead.has(url)) {
      return { slug: p.slug, ...(p.isrc ? { isrc: p.isrc } : {}) };
    }
    return p;
  });

  if (dead.size) {
    await writeFile(
      join(process.cwd(), "data/track-id-pins.json"),
      `${JSON.stringify(next, null, 2)}\n`,
    );
  }

  const counts = {
    probed: hits.filter((h) => h.kind !== "skipped").length,
    skipped: hits.filter((h) => h.kind === "skipped").length,
    live: hits.filter((h) => h.kind === "live").length,
    dead: hits.filter((h) => h.kind === "dead").length,
    soft: hits.filter((h) => h.kind === "soft").length,
    unknown: hits.filter((h) => h.kind === "unknown").length,
    wallAbort: aborted,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    mode: "HEAD-only",
    sinceRef,
    ...counts,
    dropped: [...dead],
    softUrls: hits.filter((h) => h.kind === "soft").map((h) => h.url),
    sample: hits.filter((h) => h.kind !== "skipped").slice(0, 12),
    note: "Canonical /track/{slug}/{id} from producer input. HEAD only — Beatport HTML is never fetched. 404 drops the URL (ISRC kept). 403/429 is Cloudflare, not a dead page.",
  };
  await writeFile(
    join(process.cwd(), "data/crosscheck/track-id-beatport-heads.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
  if (aborted) {
    console.error(
      `Stopped after ${WALL_STREAK} Cloudflare/soft HEAD responses. Remaining URLs were not probed.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
