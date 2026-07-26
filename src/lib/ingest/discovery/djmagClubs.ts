/**
 * DJ Mag Top 100 Clubs — systematic venue expansion.
 * Source: https://djmag.com/top100clubs
 *
 * Live HTML parse each deep run; committed seed JSON is the fallback so
 * fast deploys still materialize the full club graph.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import type { CanonicalEvent } from "../events";
import { slugify } from "../types";

export type DjMagClub = {
  rank: number;
  slug: string;
  name: string;
  djmagUrl: string;
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
    if (!name) name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    clubs.push({
      rank,
      slug,
      name,
      djmagUrl: `https://djmag.com/top100clubs/2026/${rank}/${slug}`,
    });
  }
  return clubs;
}

async function fetchListHtml(): Promise<string | null> {
  try {
    const res = await fetch(LIST_URL, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Live scrape with seed fallback. Cached per process. */
export async function loadDjMagTopClubs(opts?: {
  force?: boolean;
}): Promise<DjMagClub[]> {
  if (cached && !opts?.force) return cached;
  const html = await fetchListHtml();
  let clubs = html ? parseListHtml(html) : [];
  const source = clubs.length >= 50 ? "live" : "seed";
  if (clubs.length < 50) clubs = loadSeed();
  cached = clubs;
  console.log(`[djmag-clubs] loaded ${clubs.length} venues via ${source}`);
  return clubs;
}

export function djMagClubToEvent(club: DjMagClub): CanonicalEvent {
  return {
    slug: club.slug,
    name: club.name,
    kind: "club",
    location: club.location,
    // DJ Mag profile is a real curated URL until we resolve an official site.
    website: club.djmagUrl,
  };
}

/** Upsert all Top 100 clubs as Event venues (visible via website even with 0 sets). */
export async function ensureDjMagVenues(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; total: number }> {
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
    // Keep curated festival rows if slug somehow collides — only fill empties.
    if (!existing.website) data.website = ev.website;
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
    (c) => c.slug === key || slugify(c.name) === key || c.name.toLowerCase() === name.toLowerCase(),
  );
  return hit ? djMagClubToEvent(hit) : null;
}
