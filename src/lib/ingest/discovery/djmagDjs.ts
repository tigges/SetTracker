/**
 * DJ Mag Top 100 DJs — industry context for artist discovery.
 * Source: https://djmag.com/top100djs (latest published year seed).
 *
 * Upserts Dj stubs + soft-promotes artist-candidates so crosslink / roster
 * can fill handles. Does NOT invent social URLs from names.
 *
 * Mixmag.net is NOT crawled — Mixmag contributes sets via YouTube only.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { sanitizeArtistName } from "../../artistName";
import { slugify } from "../types";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";

export type DjMagTopDj = {
  rank: number;
  slug: string;
  name: string;
  djmagUrl: string;
  homeCity?: string;
};

const LIST_URL = "https://djmag.com/top100djs";
const YEAR = 2025;
const SEED_PATH = join(
  process.cwd(),
  "data",
  "artist-seeds",
  "djmag-top100-djs-2025.json",
);
const TIMEOUT_MS = 20_000;
const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; djmag-djs)";

const ACCENTS = [
  "#ff7a45",
  "#4fb0e0",
  "#ff7096",
  "#b0d24e",
  "#ffd24d",
  "#5cc7d6",
  "#c56cff",
  "#ff6f5e",
];

let cached: DjMagTopDj[] | null = null;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&uuml;/g, "ü")
    .replace(/&iuml;/g, "ï")
    .replace(/&auml;/g, "ä");
}

function accentFor(slug: string): string {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length]!;
}

function loadSeed(): DjMagTopDj[] {
  if (!existsSync(SEED_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(SEED_PATH, "utf8")) as {
      djs?: DjMagTopDj[];
    };
    return (raw.djs ?? []).filter((d) => d.slug && d.name && d.rank);
  } catch {
    return [];
  }
}

function parseListHtml(html: string): DjMagTopDj[] {
  const rankSlug = new Map<number, string>();
  for (const m of html.matchAll(
    new RegExp(`/top100djs/${YEAR}/(\\d+)/([a-z0-9-]+)`, "gi"),
  )) {
    const rank = Number(m[1]);
    const slug = m[2]!.toLowerCase();
    if (!rankSlug.has(rank)) rankSlug.set(rank, slug);
  }
  if (rankSlug.size < 50) return [];

  const djs: DjMagTopDj[] = [];
  for (let rank = 1; rank <= 100; rank++) {
    const slug = rankSlug.get(rank);
    if (!slug) continue;
    const re = new RegExp(
      `href=["']/top100djs/${YEAR}/${rank}/${slug}["'][^>]*>\\s*(?:<[^>]+>\\s*)*([^<]{1,120})`,
      "i",
    );
    const texts = [...html.matchAll(new RegExp(re.source, "gi"))].map((x) =>
      decodeEntities(x[1] ?? "")
        .replace(/\s+/g, " ")
        .trim(),
    );
    let name: string | null = null;
    for (let t of texts) {
      if (!t || /^\d+$/.test(t) || t.startsWith("{")) continue;
      if (t.startsWith("[")) t = t.replace(/^\[|\]$/g, "");
      if (t.length >= 2) {
        name = t;
        break;
      }
    }
    if (!name)
      name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    djs.push({
      rank,
      slug,
      name,
      djmagUrl: `https://djmag.com/top100djs/${YEAR}/${rank}/${slug}`,
    });
  }
  return djs;
}

async function fetchListHtml(): Promise<string | null> {
  try {
    const res = await fetch(LIST_URL, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (text.length < 5000) return null;
    return text;
  } catch {
    return null;
  }
}

export async function loadDjMagTopDjs(opts?: {
  force?: boolean;
}): Promise<DjMagTopDj[]> {
  if (cached && !opts?.force) return cached;
  const html = await fetchListHtml();
  let djs = html ? parseListHtml(html) : [];
  const source = djs.length >= 50 ? "live" : "seed";
  if (djs.length < 50) djs = loadSeed();
  // Merge homeCity from seed when live list has none.
  if (source === "live") {
    const seedBySlug = new Map(loadSeed().map((d) => [d.slug, d]));
    djs = djs.map((d) => ({
      ...d,
      homeCity: d.homeCity ?? seedBySlug.get(d.slug)?.homeCity,
    }));
  }
  cached = djs;
  console.log(`[djmag-djs] loaded ${djs.length} via ${source}`);
  return djs;
}

/**
 * Persist Top 100 DJs as Dj stubs + industry-chart candidates.
 * Social/web fields stay null until roster/crosslink/pins resolve them.
 */
export async function ensureDjMagTopDjs(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; candidates: number; total: number }> {
  const djs = await loadDjMagTopDjs();
  let created = 0;
  let updated = 0;
  const file = loadCandidates();
  let candidates = 0;

  for (const row of djs) {
    const clean = sanitizeArtistName(row.name);
    if (!clean) continue;
    const slug = slugify(clean);
    const bio = `DJ Mag Top 100 DJs ${YEAR} · #${row.rank}.`;
    const existing = await prisma.dj.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.dj.create({
        data: {
          slug,
          name: clean,
          accent: accentFor(slug),
          homeCity: row.homeCity ?? null,
          bio,
        },
      });
      created += 1;
    } else {
      const data: Record<string, unknown> = {};
      if (!existing.homeCity && row.homeCity) data.homeCity = row.homeCity;
      if (!existing.bio) data.bio = bio;
      else if (
        !/DJ Mag Top 100 DJs/i.test(existing.bio) &&
        existing.bio.length < 400
      ) {
        data.bio = `${existing.bio} ${bio}`.trim();
      }
      if (Object.keys(data).length) {
        await prisma.dj.update({ where: { id: existing.id }, data });
        updated += 1;
      }
    }

    upsertCandidate(file, {
      slug,
      name: clean,
      score: Math.max(36, 52 - Math.floor(row.rank / 5)),
      status: "queued",
      accent: accentFor(slug),
      evidence: [
        {
          kind: "press",
          detail: `DJ Mag Top 100 DJs ${YEAR} #${row.rank}`,
          sourceSlug: `djmag-top100djs-${YEAR}-${row.rank}`,
          weight: 40,
        },
      ],
    });
    candidates += 1;
  }

  saveCandidates(file);
  console.log(
    `[djmag-djs] ensure created=${created} updated=${updated} candidates=${candidates} total=${djs.length}`,
  );
  return { created, updated, candidates, total: djs.length };
}
