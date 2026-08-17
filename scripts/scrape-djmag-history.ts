/**
 * Fetch DJ Mag Top 100 year archives and write history seeds.
 * DJs: 2016–2025, clubs: 2018–2026, festivals: 2026 (+ inferred 2025 from YoY).
 *
 * Usage: npx tsx scripts/scrape-djmag-history.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  djMagListUrl,
  parseDjMagListHtml,
  priorRankFromChange,
  type DjMagChartEntry,
  type DjMagChartKind,
} from "../src/lib/djmag/parseList";

const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; djmag-history)";
const DELAY_MS = Number(process.env.DJMAG_HISTORY_DELAY_MS || 450);
const OUT_DIR = join(process.cwd(), "data", "chart-history");

const RANGES: Record<DjMagChartKind, number[]> = {
  dj: years(2016, 2025),
  club: years(2018, 2026),
  festival: [2026],
};

function years(from: number, to: number): number[] {
  const out: number[] = [];
  for (let y = from; y <= to; y++) out.push(y);
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) {
      console.log(`[djmag-history] ${res.status} ${url}`);
      return null;
    }
    const text = await res.text();
    return text.length >= 5000 ? text : null;
  } catch (err) {
    console.log(`[djmag-history] fail ${url}: ${err}`);
    return null;
  }
}

function inferFestival2025(entries2026: DjMagChartEntry[]): DjMagChartEntry[] {
  const out: DjMagChartEntry[] = [];
  for (const e of entries2026) {
    const prev = priorRankFromChange(e.rank, e.change);
    if (prev == null || prev > 100) continue;
    out.push({
      year: 2025,
      rank: prev,
      slug: e.slug,
      name: e.name,
      change: null,
      inferred: true,
    });
  }
  out.sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug));
  return out;
}

function writeKind(
  kind: DjMagChartKind,
  entries: DjMagChartEntry[],
  note: string,
) {
  mkdirSync(OUT_DIR, { recursive: true });
  const byYear = new Map<number, DjMagChartEntry[]>();
  for (const e of entries) {
    const list = byYear.get(e.year) ?? [];
    list.push(e);
    byYear.set(e.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);
  const file = join(OUT_DIR, `djmag-${kind === "dj" ? "djs" : `${kind}s`}.json`);
  writeFileSync(
    file,
    `${JSON.stringify(
      {
        source: `https://djmag.com/${kind === "dj" ? "top100djs" : kind === "club" ? "top100clubs" : "top100festivals"}/{year}`,
        kind,
        note,
        years,
        entries,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  for (const y of years) {
    const n = byYear.get(y)?.length ?? 0;
    console.log(`[djmag-history] wrote ${kind} ${y}: ${n}`);
  }
  console.log(`[djmag-history] ${file}`);
}

async function scrapeKind(kind: DjMagChartKind): Promise<DjMagChartEntry[]> {
  const all: DjMagChartEntry[] = [];
  for (const year of RANGES[kind]) {
    const url = djMagListUrl(kind, year);
    const html = await fetchHtml(url);
    await sleep(DELAY_MS);
    const rows = html ? parseDjMagListHtml(html, kind, year) : [];
    if (rows.length < 80) {
      console.log(`[djmag-history] skip ${kind} ${year} (got ${rows.length})`);
      continue;
    }
    all.push(...rows);
    console.log(`[djmag-history] ${kind} ${year} ${rows.length}`);
  }
  return all;
}

async function main() {
  const djs = await scrapeKind("dj");
  writeKind(
    "dj",
    djs,
    "DJ Mag Top 100 DJs year archives. Latest poll is also at /top100djs.",
  );

  const clubs = await scrapeKind("club");
  writeKind(
    "club",
    clubs,
    "DJ Mag Top 100 Clubs year archives. Latest poll is also at /top100clubs.",
  );

  const festivals = await scrapeKind("festival");
  const inferred = inferFestival2025(festivals);
  if (inferred.length) {
    festivals.push(...inferred);
    console.log(`[djmag-history] inferred festival 2025: ${inferred.length}`);
  }
  // Atlas 2026 YoY is the source of inferred 2025 when live parse missed change.
  try {
    const atlas = JSON.parse(
      readFileSync(
        join(process.cwd(), "data/venue-seeds/djmag-atlas-2026.json"),
        "utf8",
      ),
    ) as {
      venues?: Array<{
        kind?: string;
        rank?: number;
        chartSlug?: string;
        slug?: string;
        name?: string;
        change?: string;
      }>;
    };
    const have2025 = new Set(
      festivals.filter((e) => e.year === 2025).map((e) => e.slug),
    );
    for (const v of atlas.venues ?? []) {
      if (v.kind !== "festival" || typeof v.rank !== "number") continue;
      const slug = v.chartSlug || v.slug;
      if (!slug || have2025.has(slug)) continue;
      const prev = priorRankFromChange(v.rank, v.change ?? null);
      if (prev == null || prev > 100) continue;
      festivals.push({
        year: 2025,
        rank: prev,
        slug,
        name: v.name ?? slug,
        change: null,
        inferred: true,
      });
      have2025.add(slug);
    }
  } catch {
    /* atlas seed optional */
  }
  writeKind(
    "festival",
    festivals,
    "DJ Mag Top 100 Festivals. Structured year pages start at 2026; 2025 ranks are inferred from 2026 YoY movement.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
