/**
 * DJ Mag Top 100 DJs — industry context for artist discovery.
 * Source: https://djmag.com/top100djs (latest published year seed).
 *
 * Chart profiles list From: / style but NOT official URLs (unlike clubs).
 * We fill Dj.website from roster/pins first, then Wikidata P856.
 *
 * Mixmag.net is NOT crawled — Mixmag contributes sets via YouTube only.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { sanitizeArtistName } from "../../artistName";
import { DJ_SOCIAL_PINS } from "../djSocialPins";
import { ARTIST_ROSTER } from "../roster";
import { slugify } from "../types";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";
import {
  normalizeOfficialWebsite,
  resolveWikidataOfficialWebsite,
} from "./wikidataOfficial";

export type DjMagTopDj = {
  rank: number;
  slug: string;
  name: string;
  djmagUrl: string;
  homeCity?: string;
  website?: string;
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
const PROFILE_DELAY_MS = Number(process.env.DJMAG_PROFILE_DELAY_MS || 350);
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
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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

/**
 * Hand-checked brand homepages when roster/pins/Wikidata miss.
 * DJ Mag profiles do not embed official URLs (unlike clubs).
 */
const EXTRA_OFFICIAL: Record<string, string> = {
  anyma: "https://www.anyma.com/",
  "fred-again": "https://www.fredagain.com/",
  "martinez-brothers": "https://themartinezbrothers.com/",
  kolsch: "https://www.kolschofficial.com/",
  gordo: "https://www.gordomusic.com/",
  pawsa: "https://www.pawsaofficial.com/",
  "jamie-jones": "https://jamiejones.com/",
  "indira-paganotto": "https://indirapaganotto.com/",
  "joel-corry": "https://www.joelcorry.com/",
  "deborah-de-luca": "https://deborahdeluca.it/",
};

/** Official site already known from roster / social pins / EXTRA_OFFICIAL. */
function curatedWebsiteFor(name: string, slug: string): string | null {
  const pin = DJ_SOCIAL_PINS.find(
    (p) => p.slug === slug || slugify(p.name) === slug,
  );
  if (pin?.website) return normalizeOfficialWebsite(pin.website);
  const roster = ARTIST_ROSTER.find(
    (a) => slugify(a.name) === slug || a.name.toLowerCase() === name.toLowerCase(),
  );
  if (roster?.website) return normalizeOfficialWebsite(roster.website);
  const extra = EXTRA_OFFICIAL[slug] ?? EXTRA_OFFICIAL[slugify(name)];
  if (extra) return normalizeOfficialWebsite(extra);
  return null;
}

function mergeSeedMeta(djs: DjMagTopDj[]): DjMagTopDj[] {
  const seedBySlug = new Map(loadSeed().map((d) => [d.slug, d]));
  return djs.map((d) => {
    const seed = seedBySlug.get(d.slug);
    const curated = curatedWebsiteFor(d.name, d.slug);
    return {
      ...d,
      homeCity: d.homeCity ?? seed?.homeCity,
      website: d.website ?? seed?.website ?? curated ?? undefined,
    };
  });
}

/** `From: Paris, France` on DJ Mag Top 100 DJ profiles. */
export function parseHomeFromDjHtml(html: string): string | null {
  const m = html.match(/From:\s*<\/strong>\s*([^<]+)/i);
  if (!m?.[1]) return null;
  const loc = decodeEntities(m[1])
    .replace(/\s+/g, " ")
    .replace(/\.+$/, "")
    .trim();
  return loc.length >= 2 && loc.length <= 80 ? loc : null;
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
  return mergeSeedMeta(djs);
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
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
  const html = await fetchHtml(LIST_URL);
  let djs = html ? parseListHtml(html) : [];
  const source = djs.length >= 50 ? "live" : "seed";
  if (djs.length < 50) djs = mergeSeedMeta(loadSeed());
  cached = djs;
  console.log(`[djmag-djs] loaded ${djs.length} via ${source}`);
  return djs;
}

/**
 * Scan DJ Mag profiles for From: + fill websites via roster/pins/Wikidata.
 */
export async function enrichDjMagDjWebsites(opts?: {
  missingOnly?: boolean;
  limit?: number;
  persistSeed?: boolean;
  delayMs?: number;
}): Promise<{ fetched: number; found: number; djs: DjMagTopDj[] }> {
  const missingOnly = opts?.missingOnly !== false;
  const delay = opts?.delayMs ?? PROFILE_DELAY_MS;
  const djs = await loadDjMagTopDjs({ force: true });
  const targets = djs.filter((d) => {
    if (!missingOnly) return true;
    return !d.website || !d.homeCity;
  });
  const limit = opts?.limit ?? targets.length;
  let fetched = 0;
  let found = 0;

  for (const row of targets.slice(0, limit)) {
    fetched += 1;
    // Profile → home city (always cheap when missing).
    if (!row.homeCity) {
      const html = await fetchHtml(row.djmagUrl);
      await sleep(delay);
      if (html) {
        const home = parseHomeFromDjHtml(html);
        if (home) row.homeCity = home;
      }
    }

    if (row.website && !/djmag\.com/i.test(row.website)) {
      found += 1;
      continue;
    }

    const curated = curatedWebsiteFor(row.name, row.slug);
    if (curated) {
      row.website = curated;
      found += 1;
      console.log(`[djmag-djs] ${row.slug} → ${curated} (curated)`);
      continue;
    }

    const website = await resolveWikidataOfficialWebsite(row.name, "dj", {
      delayMs: Math.min(delay, 150),
    });
    if (!website) {
      console.log(
        `[djmag-djs] no site ${row.slug}` +
          (row.homeCity ? ` (from=${row.homeCity})` : ""),
      );
      continue;
    }
    row.website = website;
    found += 1;
    console.log(`[djmag-djs] ${row.slug} → ${website}`);
  }

  cached = djs;
  if (opts?.persistSeed) {
    const seed = loadSeed();
    const bySlug = new Map(djs.map((d) => [d.slug, d]));
    const next = seed.map((d) => {
      const live = bySlug.get(d.slug);
      return live
        ? {
            ...d,
            website: live.website ?? d.website,
            homeCity: live.homeCity ?? d.homeCity,
          }
        : d;
    });
    for (const d of djs) {
      if (!next.some((x) => x.slug === d.slug)) next.push(d);
    }
    next.sort((a, b) => a.rank - b.rank);
    writeFileSync(
      SEED_PATH,
      `${JSON.stringify(
        {
          source: LIST_URL,
          year: YEAR,
          note: "DJ Mag Top 100 DJs. Profiles omit official URLs — `website` from roster/pins + Wikidata P856; `homeCity` from profile From:. Mixmag.net not used.",
          djs: next,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    console.log(`[djmag-djs] wrote seed (${found} with websites)`);
  }
  return { fetched, found, djs };
}

/**
 * Persist Top 100 DJs as Dj stubs + industry-chart candidates.
 */
export async function ensureDjMagTopDjs(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; candidates: number; total: number }> {
  if (process.env.DJMAG_ENRICH_DJS === "1") {
    await enrichDjMagDjWebsites({
      missingOnly: true,
      limit: Number(process.env.DJMAG_OFFICIAL_LIMIT || 100),
      persistSeed: process.env.DJMAG_PERSIST_SEED === "1",
    });
  }

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
          website: row.website ?? null,
          bio,
        },
      });
      created += 1;
    } else {
      const data: Record<string, unknown> = {};
      if (!existing.homeCity && row.homeCity) data.homeCity = row.homeCity;
      if (
        row.website &&
        (!existing.website || /djmag\.com\/top100djs/i.test(existing.website))
      ) {
        data.website = row.website;
      }
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
