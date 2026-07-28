/**
 * DJ Mag Top 100 Clubs — systematic venue expansion.
 * Source: https://djmag.com/top100clubs
 *
 * Live HTML parse each deep run; committed seed JSON is the fallback so
 * fast deploys still materialize the full club graph.
 *
 * Official club websites are scraped from each Top 100 profile page
 * (first body link, e.g. savaya.com) and preferred over the DJ Mag URL
 * for Event.website / WWW pills + OG thumbnails.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import type { CanonicalEvent } from "../events";
import { slugify } from "../types";

export type DjMagClub = {
  rank: number;
  slug: string;
  name: string;
  djmagUrl: string;
  /** Official club site when known (from profile page or seed). */
  website?: string;
  location?: string;
};

const LIST_URL = "https://djmag.com/top100clubs";
const SEED_PATH = join(
  process.cwd(),
  "data",
  "venue-seeds",
  "djmag-top100-clubs-2026.json",
);
const TIMEOUT_MS = 20_000;
const PROFILE_DELAY_MS = Number(process.env.DJMAG_PROFILE_DELAY_MS || 350);
const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; djmag-top100)";

/** Short / generic names that must not steal unrelated set titles. */
const SKIP_TITLE_MATCH = new Set(
  [
    "sound",
    "time",
    "index",
    "void",
    "mute",
    "fomo",
    "lod",
    "eden",
    "warehouse",
    "radius",
    "play-x",
    "wave-club",
    "space-club",
    "zouk", // ambiguous (Singapore / Tokyo / generic)
  ].map((s) => s),
);

const DJMAG_NOISE =
  /djmag|djtickets\.|google|doubleclick|fonts\.|gstatic|cloudflare|inmobi|schema\.org|w3\.org|wp-json|facebook\.com\/djmagazine|twitter\.com\/djmag|youtube\.com\/user\/djmag|soundcloud\.com\/djmag/i;

let cached: DjMagClub[] | null = null;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&uuml;/g, "ü")
    .replace(/&iuml;/g, "ï")
    .replace(/&auml;/g, "ä");
}

/** True when website is a DJ Mag Top 100 profile (weak — not the club's site). */
export function isDjMagProfileUrl(url: string | null | undefined): boolean {
  return !!url && /djmag\.com\/top100clubs/i.test(url);
}

/** DJ Mag profile or other DJ Mag property — replace when we have an official site. */
export function isWeakClubWebsite(url: string | null | undefined): boolean {
  if (!url) return true;
  if (isDjMagProfileUrl(url)) return true;
  try {
    return /djmag/i.test(new URL(url).hostname);
  } catch {
    return true;
  }
}

export function normalizeClubWebsite(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  // Protocol-relative (//unvrs.com) and bare hosts from DJ Mag intros.
  if (s.startsWith("//")) s = `https:${s}`;
  else if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (!/^https?:$/i.test(u.protocol)) return null;
    if (DJMAG_NOISE.test(u.hostname) || DJMAG_NOISE.test(u.href)) return null;
    u.hash = "";
    // Prefer https for bare club hosts.
    if (u.protocol === "http:") u.protocol = "https:";
    let path = u.pathname.replace(/\/+$/, "");
    if (path === "/") path = "";
    return `${u.origin}${path}/`;
  } catch {
    return null;
  }
}

/**
 * Pull the official club URL from a DJ Mag Top 100 club profile HTML.
 * Profiles typically lead the intro with `<p><a href="//club.example">…`.
 */
export function parseOfficialWebsiteFromClubHtml(html: string): string | null {
  const slices = [
    html.match(/field--name-field-intro[\s\S]{0,4000}/i)?.[0],
    html.match(/field--name-body[\s\S]{0,8000}/i)?.[0],
    html.match(/djm26-entry-header__info[\s\S]{0,4000}/i)?.[0],
    html.match(/field-club-reference[\s\S]{0,4000}/i)?.[0],
  ].filter(Boolean) as string[];

  const hrefRe =
    /<p[^>]*>\s*(?:<strong>[^<]*<\/strong>\s*)*<a\s+[^>]*href=["']((?:https?:)?\/\/[^"']+|https?:\/\/[^"']+)["']/gi;

  for (const slice of slices) {
    for (const m of slice.matchAll(hrefRe)) {
      const url = normalizeClubWebsite(m[1]!);
      if (url) return url;
    }
    // Same pattern without requiring <p> wrapper.
    for (const m of slice.matchAll(
      /href=["']((?:https?:)?\/\/[^"']+)["'][^>]*>\s*[^<]{0,40}\.(?:com|tv|es|fr|nl|de|it|jp|br|uk|club|art|in|hr|cz|vn|co\.uk|com\.br|com\.hr)/gi,
    )) {
      const url = normalizeClubWebsite(m[1]!);
      if (url) return url;
    }
  }
  return null;
}

function loadSeed(): DjMagClub[] {
  if (!existsSync(SEED_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(SEED_PATH, "utf8")) as {
      clubs?: DjMagClub[];
    };
    return (raw.clubs ?? []).filter((c) => c.slug && c.name && c.rank);
  } catch {
    return [];
  }
}

function mergeSeedMeta(clubs: DjMagClub[]): DjMagClub[] {
  const seedBySlug = new Map(loadSeed().map((c) => [c.slug, c]));
  return clubs.map((c) => {
    const seed = seedBySlug.get(c.slug);
    return {
      ...c,
      website: c.website ?? seed?.website,
      location: c.location ?? seed?.location,
    };
  });
}

function parseListHtml(html: string): DjMagClub[] {
  const rankSlug = new Map<number, string>();
  for (const m of html.matchAll(/\/top100clubs\/2026\/(\d+)\/([a-z0-9-]+)/gi)) {
    const rank = Number(m[1]);
    const slug = m[2]!.toLowerCase();
    if (!rankSlug.has(rank)) rankSlug.set(rank, slug);
  }
  if (rankSlug.size < 50) return [];

  const clubs: DjMagClub[] = [];
  for (let rank = 1; rank <= 100; rank++) {
    const slug = rankSlug.get(rank);
    if (!slug) continue;
    const re = new RegExp(
      `href=["']/top100clubs/2026/${rank}/${slug}["'][^>]*>\\s*(?:<[^>]+>\\s*)*([^<]{1,100})`,
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
    clubs.push({
      rank,
      slug,
      name,
      djmagUrl: `https://djmag.com/top100clubs/2026/${rank}/${slug}`,
    });
  }
  return mergeSeedMeta(clubs);
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
    // Soft bot walls return tiny shells.
    if (text.length < 5000) return null;
    return text;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Live scrape with seed fallback. Cached per process. */
export async function loadDjMagTopClubs(opts?: {
  force?: boolean;
}): Promise<DjMagClub[]> {
  if (cached && !opts?.force) return cached;
  const html = await fetchHtml(LIST_URL);
  let clubs = html ? parseListHtml(html) : [];
  const source = clubs.length >= 50 ? "live" : "seed";
  if (clubs.length < 50) clubs = mergeSeedMeta(loadSeed());
  cached = clubs;
  console.log(`[djmag-clubs] loaded ${clubs.length} venues via ${source}`);
  return clubs;
}

/**
 * Fetch DJ Mag profile pages for clubs missing an official website.
 * Updates in-memory cache; optionally persists into the seed JSON.
 */
export async function enrichDjMagOfficialWebsites(opts?: {
  /** Only clubs still missing website (default true). */
  missingOnly?: boolean;
  /** Cap profile fetches (default all). */
  limit?: number;
  /** Write websites back into data/venue-seeds/….json */
  persistSeed?: boolean;
  delayMs?: number;
}): Promise<{ fetched: number; found: number; clubs: DjMagClub[] }> {
  const missingOnly = opts?.missingOnly !== false;
  const delay = opts?.delayMs ?? PROFILE_DELAY_MS;
  const clubs = await loadDjMagTopClubs({ force: true });
  const targets = clubs.filter((c) => !(missingOnly && c.website));
  const limit = opts?.limit ?? targets.length;
  let fetched = 0;
  let found = 0;

  for (const club of targets.slice(0, limit)) {
    const html = await fetchHtml(club.djmagUrl);
    fetched += 1;
    await sleep(delay);
    if (!html) {
      console.log(`[djmag-clubs] profile miss ${club.slug}`);
      continue;
    }
    const website = parseOfficialWebsiteFromClubHtml(html);
    if (!website) {
      console.log(`[djmag-clubs] no official site ${club.slug}`);
      continue;
    }
    club.website = website;
    found += 1;
    console.log(`[djmag-clubs] ${club.slug} → ${website}`);
  }

  cached = clubs;

  if (opts?.persistSeed) {
    const seedClubs = loadSeed();
    const bySlug = new Map(clubs.map((c) => [c.slug, c]));
    const next = seedClubs.map((c) => {
      const live = bySlug.get(c.slug);
      return live?.website ? { ...c, website: live.website } : c;
    });
    // Include any live-only ranks.
    for (const c of clubs) {
      if (!next.some((x) => x.slug === c.slug)) next.push(c);
    }
    next.sort((a, b) => a.rank - b.rank);
    const payload = {
      source: LIST_URL,
      year: 2026,
      note: "Fallback seed when live DJ Mag scrape fails. Prefer live HTML parse. `website` = official club site from profile pages.",
      clubs: next,
    };
    writeFileSync(SEED_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`[djmag-clubs] wrote seed ${SEED_PATH} (${found} websites)`);
  }

  return { fetched, found, clubs };
}

export function djMagClubToEvent(club: DjMagClub): CanonicalEvent {
  return {
    slug: club.slug,
    name: club.name,
    kind: "club",
    location: club.location,
    // Prefer official club site; DJ Mag profile is a weak fallback.
    website: club.website ?? club.djmagUrl,
  };
}

/** Upsert all Top 100 clubs as Event venues (visible via website even with 0 sets). */
export async function ensureDjMagVenues(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; total: number }> {
  // Official-site profile scrape is opt-in (deep / manual). Seed JSON carries
  // websites for fast deploys — set DJMAG_ENRICH_OFFICIAL=1 to refresh gaps.
  if (process.env.DJMAG_ENRICH_OFFICIAL === "1") {
    const missing = (await loadDjMagTopClubs()).filter((c) => !c.website);
    if (missing.length) {
      const cap = Number(process.env.DJMAG_OFFICIAL_LIMIT || 100);
      await enrichDjMagOfficialWebsites({
        missingOnly: true,
        limit: Math.min(cap, missing.length),
        persistSeed: process.env.DJMAG_PERSIST_SEED === "1",
      });
    }
  }

  const clubs = await loadDjMagTopClubs();
  let created = 0;
  let updated = 0;
  for (const club of clubs) {
    const ev = djMagClubToEvent(club);
    const existing = await prisma.event.findUnique({ where: { slug: ev.slug } });
    if (!existing) {
      await prisma.event.create({
        data: {
          slug: ev.slug,
          name: ev.name,
          kind: "club",
          location: ev.location ?? null,
          website: ev.website ?? null,
        },
      });
      created += 1;
      continue;
    }
    const data: Record<string, unknown> = {};
    // Upgrade DJ Mag / empty websites to the official club site.
    // Do not clobber curated KNOWN_EVENTS sites (non-weak URLs already set).
    if (club.website && isWeakClubWebsite(existing.website)) {
      data.website = club.website;
    } else if (!existing.website && ev.website) {
      data.website = ev.website;
    }
    if (!existing.location && ev.location) data.location = ev.location;
    if (existing.kind === "event") data.kind = "club";
    // Prefer DJ Mag display spelling when we only have a slug-ish name.
    if (existing.name === slugify(existing.name) || existing.name === ev.slug) {
      data.name = ev.name;
    }
    if (Object.keys(data).length) {
      await prisma.event.update({ where: { id: existing.id }, data });
      updated += 1;
    }
  }
  console.log(
    `[djmag-clubs] ensure venues created=${created} updated=${updated} total=${clubs.length}`,
  );
  return { created, updated, total: clubs.length };
}

/**
 * If a set title clearly names a Top 100 club, return that venue.
 * Skips ambiguous short names (Sound, Time, Eden, …).
 */
export function inferDjMagClubEvent(title: string): CanonicalEvent | null {
  const clubs = cached ?? loadSeed();
  if (!clubs.length) return null;
  const t = title.replace(/\s+/g, " ").trim();
  const ranked = [...clubs].sort((a, b) => b.name.length - a.name.length);
  for (const club of ranked) {
    if (SKIP_TITLE_MATCH.has(club.slug)) continue;
    const name = club.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Require multi-word, long single token, or distinctive slug.
    const tokens = club.name.trim().split(/\s+/);
    if (tokens.length === 1 && club.name.length < 7 && club.slug.length < 8) {
      continue;
    }
    const re = new RegExp(`(?:^|[^\\w])${name}(?:[^\\w]|$)`, "i");
    if (re.test(t)) return djMagClubToEvent(club);
    // Also match slug tokens in titles ("live at bootshaus", "ushuaia ibiza")
    const slugWords = club.slug.replace(/-/g, " ");
    if (slugWords.length >= 6) {
      const re2 = new RegExp(
        `(?:^|[^\\w])${slugWords.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^\\w]|$)`,
        "i",
      );
      if (re2.test(t)) return djMagClubToEvent(club);
    }
  }
  return null;
}

export function resolveDjMagClubByName(name: string): CanonicalEvent | null {
  const clubs = cached ?? loadSeed();
  const key = slugify(name);
  const hit = clubs.find(
    (c) =>
      c.slug === key ||
      slugify(c.name) === key ||
      c.name.toLowerCase() === name.toLowerCase(),
  );
  return hit ? djMagClubToEvent(hit) : null;
}
