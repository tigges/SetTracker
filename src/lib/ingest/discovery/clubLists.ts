/**
 * Multi-source club list discovery.
 *
 * Scrapes curated “best clubs” articles, merges with DJ Mag Top 100, and
 * auto-identifies venues not yet in the catalog. New finds are upserted as
 * Event rows and recorded in data/venue-candidates.json for the next deep run.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { slugify } from "../types";

export type ListClub = {
  name: string;
  slug: string;
  location?: string;
  website?: string;
  source: string;
};

export type ClubListSource = {
  id: string;
  url: string;
  seedFile: string;
  /** How to parse live HTML */
  parser: "sixam-numbered-h2" | "heading-numbered" | "clubtickets-heading";
};

const TIMEOUT_MS = 18_000;
const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; club-lists)";

/** Map noisy list names → canonical Event slugs (DJ Mag / curated). */
const SLUG_ALIASES: Record<string, string> = {
  "nitsa-club": "nitsa",
  nitsa: "nitsa",
  "ministry-of-sound": "ministry-of-sound",
  amnesia: "amnesia-ibiza",
  "amnesia-ibiza": "amnesia-ibiza",
  "pacha-ibiza": "pacha-ibiza",
  pacha: "pacha-ibiza",
  "hi-ibiza": "hi-ibiza",
  "ushuaia-ibiza": "ushuaia-ibiza",
  "ushuaia": "ushuaia-ibiza",
  unvrs: "unvrs",
  "[unvrs]": "unvrs",
  "dc-10": "dc-10",
  dc10: "dc-10",
  berghain: "berghain",
  "berghain-panorama-bar": "berghain",
  fabric: "fabric",
  fabrik: "fabrik",
  "papaya-club": "papaya-club",
  "culture-club-revelin": "culture-club-revelin",
  "cavo-paradiso": "cavo-paradiso",
  "mad-club": "mad-club",
  "warehouse-project": "warehouse-project",
  "the-warehouse-project": "warehouse-project",
  "eden-ibiza": "eden",
  eden: "eden",
  bootshaus: "bootshaus",
  "input-high-fidelity-dance-club": "input",
  input: "input",
  "moog-club": "moog",
  moog: "moog",
  "o-beach-ibiza": "o-beach-ibiza",
  "es-paradis": "es-paradis",
  "lio-ibiza": "lio-ibiza",
  "cova-santa": "cova-santa",
  djoon: "djoon",
  "djoon-club": "djoon",
};

export const CLUB_LIST_SOURCES: ClubListSource[] = [
  {
    id: "sixam-europe-33",
    url: "https://6amgroup.com/articles/guides-all/33-best-house-techno-clubs-in-europe",
    seedFile: "sixam-europe-33.json",
    parser: "sixam-numbered-h2",
  },
  {
    id: "clubtickets-europe",
    url: "https://www.clubtickets.com/blog/best-clubs-europe",
    seedFile: "clubtickets-europe-8.json",
    parser: "clubtickets-heading",
  },
  {
    id: "clubtickets-ibiza",
    url: "https://www.clubtickets.com/blog/best-clubs-ibiza",
    seedFile: "clubtickets-ibiza-12.json",
    parser: "clubtickets-heading",
  },
];

/** Extra clubs for set-title inference (beyond DJ Mag cache). */
let extraForInfer: ListClub[] = [];

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/&uuml;/gi, "ü")
    .replace(/&iuml;/gi, "ï")
    .replace(/&auml;/gi, "ä");
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function tidyName(raw: string): string | null {
  let n = stripTags(raw)
    .replace(/^\[|\]$/g, "")
    .replace(/\s*\/\s*Panorama Bar/i, "")
    .replace(/\s*:\s*High Fidelity Dance Club/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (n.length < 2 || n.length > 80) return null;
  if (/^best (in|clubs)/i.test(n)) return null;
  if (/stay in the loop|other six am|need some listening/i.test(n)) return null;
  return n;
}

function canonicalSlug(name: string): string {
  const key = slugify(name);
  return SLUG_ALIASES[key] ?? SLUG_ALIASES[name.toLowerCase()] ?? key;
}

function loadSeed(seedFile: string, sourceUrl: string): ListClub[] {
  const path = join(process.cwd(), "data", "venue-seeds", seedFile);
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      clubs?: Array<{ name: string; location?: string }>;
      source?: string;
    };
    const src = raw.source || sourceUrl;
    const out: ListClub[] = [];
    for (const c of raw.clubs ?? []) {
      const name = tidyName(c.name);
      if (!name) continue;
      out.push({
        name,
        slug: canonicalSlug(name),
        location: c.location,
        website: src,
        source: src,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (/just a moment|cf-browser-verification|attention required/i.test(html)) {
      return null;
    }
    return html;
  } catch {
    return null;
  }
}

function parseSixAm(html: string, source: string): ListClub[] {
  const out: ListClub[] = [];
  for (const m of html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)) {
    const line = stripTags(m[1] ?? "");
    // Only en/em dash separates name from city (keeps DC-10 intact).
    const hit = line.match(/^(\d+)\.\s*(.+?)\s+[–—]\s*(.+)$/);
    if (!hit) continue;
    const name = tidyName(hit[2]!);
    if (!name) continue;
    out.push({
      name,
      slug: canonicalSlug(name),
      location: hit[3]!.trim().replace(/\s+/g, " "),
      website: source,
      source,
    });
  }
  return out;
}

function parseHeadingNumbered(html: string, source: string): ListClub[] {
  const out: ListClub[] = [];
  for (const m of html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)) {
    const line = stripTags(m[1] ?? "");
    const hit =
      line.match(/^(\d+)\.\s+(.+?)(?:\s*[–—(]\s*([^–—)]+))?$/) ||
      line.match(/^###?\s*(\d+)\.\s+(.+)$/);
    if (!hit) continue;
    let name = tidyName(hit[2]!);
    if (!name) continue;
    // "Hï Ibiza (Spain)" → name + location
    const paren = name.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    let location = hit[3]?.trim();
    if (paren) {
      name = paren[1]!.trim();
      location = location || paren[2]!.trim();
    }
    out.push({
      name,
      slug: canonicalSlug(name),
      location,
      website: source,
      source,
    });
  }
  return out;
}

async function scrapeSource(src: ClubListSource): Promise<{
  clubs: ListClub[];
  via: "live" | "seed";
}> {
  const html = await fetchHtml(src.url);
  let clubs: ListClub[] = [];
  if (html) {
    if (src.parser === "sixam-numbered-h2") clubs = parseSixAm(html, src.url);
    else clubs = parseHeadingNumbered(html, src.url);
  }
  if (clubs.length < 3) {
    return { clubs: loadSeed(src.seedFile, src.url), via: "seed" };
  }
  return { clubs, via: "live" };
}

function writeCandidates(
  discovered: Array<ListClub & { status: "new" | "existing" }>,
): void {
  const path = join(process.cwd(), "data", "venue-candidates.json");
  mkdirSync(dirname(path), { recursive: true });
  const neu = discovered.filter((d) => d.status === "new");
  writeFileSync(
    path,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        newCount: neu.length,
        newVenues: neu.map((d) => ({
          slug: d.slug,
          name: d.name,
          location: d.location,
          source: d.source,
        })),
        allFromLists: discovered.length,
      },
      null,
      2,
    ) + "\n",
  );
}

export type ClubListEnsureStats = {
  scraped: number;
  created: number;
  updated: number;
  /** Brand-new venues not previously in the DB */
  newVenues: string[];
  bySource: Record<string, { via: string; count: number }>;
};

/**
 * Scrape all curated club lists, upsert Events, and report newly identified venues.
 */
export async function ensureClubListVenues(
  prisma: PrismaClient,
): Promise<ClubListEnsureStats> {
  const bySlug = new Map<string, ListClub>();
  const bySource: ClubListEnsureStats["bySource"] = {};

  for (const src of CLUB_LIST_SOURCES) {
    const { clubs, via } = await scrapeSource(src);
    bySource[src.id] = { via, count: clubs.length };
    console.log(`[club-lists] ${src.id}: ${clubs.length} via ${via}`);
    for (const c of clubs) {
      const prev = bySlug.get(c.slug);
      if (!prev) {
        bySlug.set(c.slug, c);
        continue;
      }
      // Prefer entry that has a location.
      if (!prev.location && c.location) bySlug.set(c.slug, { ...prev, ...c });
    }
  }

  extraForInfer = [...bySlug.values()];

  let created = 0;
  let updated = 0;
  const newVenues: string[] = [];
  const discovered: Array<ListClub & { status: "new" | "existing" }> = [];

  for (const club of bySlug.values()) {
    const existing = await prisma.event.findUnique({ where: { slug: club.slug } });
    if (!existing) {
      await prisma.event.create({
        data: {
          slug: club.slug,
          name: club.name,
          kind: "club",
          location: club.location ?? null,
          website: club.website ?? null,
        },
      });
      created += 1;
      newVenues.push(club.name);
      discovered.push({ ...club, status: "new" });
      continue;
    }
    discovered.push({ ...club, status: "existing" });
    const data: Record<string, unknown> = {};
    if (!existing.website && club.website) data.website = club.website;
    if (!existing.location && club.location) data.location = club.location;
    if (existing.kind === "event") data.kind = "club";
    if (Object.keys(data).length) {
      await prisma.event.update({ where: { id: existing.id }, data });
      updated += 1;
    }
  }

  writeCandidates(discovered);
  console.log(
    `[club-lists] ensured scraped=${bySlug.size} created=${created} ` +
      `updated=${updated} new=[${newVenues.slice(0, 12).join(", ")}${
        newVenues.length > 12 ? ",…" : ""
      }]`,
  );

  return {
    scraped: bySlug.size,
    created,
    updated,
    newVenues,
    bySource,
  };
}

/** Title inference for clubs discovered via list articles (not only DJ Mag). */
export function inferListClubEvent(title: string): {
  slug: string;
  name: string;
  kind: string;
  location?: string;
  website?: string;
} | null {
  const clubs = extraForInfer.length
    ? extraForInfer
    : CLUB_LIST_SOURCES.flatMap((s) => loadSeed(s.seedFile, s.url));
  const t = title.replace(/\s+/g, " ").trim();
  const ranked = [...clubs].sort((a, b) => b.name.length - a.name.length);
  for (const club of ranked) {
    if (club.slug.length < 4) continue;
    if (["eden", "sound", "time", "input"].includes(club.slug)) continue;
    const name = club.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[^\\w])${name}(?:[^\\w]|$)`, "i");
    if (re.test(t)) {
      return {
        slug: club.slug,
        name: club.name,
        kind: "club",
        location: club.location,
        website: club.website,
      };
    }
  }
  return null;
}

export function listClubsForInfer(): ListClub[] {
  return extraForInfer.length
    ? extraForInfer
    : CLUB_LIST_SOURCES.flatMap((s) => loadSeed(s.seedFile, s.url));
}
