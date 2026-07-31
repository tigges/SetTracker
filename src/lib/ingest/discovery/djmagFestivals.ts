/**
 * DJ Mag Top 100 Festivals — industry context for the venue graph.
 * Source: https://djmag.com/top100festivals
 *
 * Chart profiles do NOT embed official URLs (unlike Top 100 Clubs). We still
 * materialize all 100 festivals, then fill Event.website from:
 *   1) KNOWN_EVENTS aliases (Tomorrowland, EDC, Ultra, …)
 *   2) Seed / Wikidata P856 enrichment (`npm run enrich:djmag-festivals`)
 *
 * Mixmag.net is NOT crawled — Mixmag is YouTube-venue only (@Mixmag).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { KNOWN_EVENTS, type CanonicalEvent } from "../events";
import { slugify } from "../types";
import { resolveWikidataOfficialWebsite } from "./wikidataOfficial";

export type DjMagFestival = {
  rank: number;
  slug: string;
  name: string;
  djmagUrl: string;
  location?: string;
  website?: string;
};

const LIST_URL = "https://djmag.com/top100festivals";
const YEAR = 2026;
const SEED_PATH = join(
  process.cwd(),
  "data",
  "venue-seeds",
  "djmag-top100-festivals-2026.json",
);
const TIMEOUT_MS = 20_000;
const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; djmag-festivals)";

/** Chart slug → curated KNOWN_EVENTS slug (official site / location). */
const ALIAS_TO_KNOWN: Record<string, string> = {
  tomorrowland: "tomorrowland",
  "edc-las-vegas": "edc-lv",
  "edc-lv": "edc-lv",
  "ultra-music-festival": "ultra-miami",
  ultra: "ultra-miami",
  "coachella-valley-music-and-arts-festival": "coachella",
  coachella: "coachella",
  lollapalooza: "lollapalooza",
  "hard-summer": "hard-summer",
  "burning-man": "burning-man",
  dreamstate: "dreamstate",
  "nocturnal-wonderland": "nocturnal-wonderland",
  "beyond-wonderland": "beyond-wonderland",
  "escape-halloween": "escape-halloween",
  "countdown-nye": "countdown-nye",
  "untold-festival": "untold",
  untold: "untold",
  creamfields: "creamfields",
  defqon1: "defqon1",
  "electric-love": "electric-love",
  parklife: "parklife",
  "time-warp": "time-warp",
  mysteryland: "mysteryland",
  "awakenings-festival": "awakenings",
  awakenings: "awakenings",
  parookaville: "parookaville",
};

const SKIP_TITLE_MATCH = new Set(["amf", "exit"]);

/**
 * Hand-checked festival homepages when KNOWN_EVENTS / Wikidata miss.
 * DJ Mag festival profiles do not embed official URLs (unlike clubs).
 */
const EXTRA_OFFICIAL: Record<string, string> = {
  "lost-village": "https://lostvillagefestival.com/",
  "beyond-valley": "https://www.beyondthevalley.com.au/",
  "groove-cruise": "https://www.groovecruise.com/",
  amf: "https://www.amsterdammusicfestival.com/",
  "primer-music-festival": "https://primermusicfestival.com/",
  "world-dj-festival": "https://www.worlddjfestival.com/",
  "scream-or-dance": "https://www.screamordance.com/",
  "untold-dubai": "https://untold.ae/",
  positiv: "https://positivfestival.fr/",
};

let cached: DjMagFestival[] | null = null;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&uuml;/g, "ü")
    .replace(/&iuml;/g, "ï")
    .replace(/&auml;/g, "ä");
}

function loadSeed(): DjMagFestival[] {
  if (!existsSync(SEED_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(SEED_PATH, "utf8")) as {
      festivals?: DjMagFestival[];
    };
    return (raw.festivals ?? []).filter((f) => f.slug && f.name && f.rank);
  } catch {
    return [];
  }
}

function mergeSeedMeta(festivals: DjMagFestival[]): DjMagFestival[] {
  const seedBySlug = new Map(loadSeed().map((f) => [f.slug, f]));
  return festivals.map((f) => {
    const seed = seedBySlug.get(f.slug);
    const knownSlug = ALIAS_TO_KNOWN[f.slug];
    const known = knownSlug ? KNOWN_EVENTS[knownSlug] : undefined;
    const extra = EXTRA_OFFICIAL[f.slug] ?? EXTRA_OFFICIAL[slugify(f.name)];
    return {
      ...f,
      website: f.website ?? seed?.website ?? known?.website ?? extra,
      location: f.location ?? seed?.location ?? known?.location,
    };
  });
}

function parseListHtml(html: string): DjMagFestival[] {
  const rankSlug = new Map<number, string>();
  for (const m of html.matchAll(
    new RegExp(`/top100festivals/${YEAR}/(\\d+)/([a-z0-9-]+)`, "gi"),
  )) {
    const rank = Number(m[1]);
    const slug = m[2]!.toLowerCase();
    if (!rankSlug.has(rank)) rankSlug.set(rank, slug);
  }
  if (rankSlug.size < 50) return [];

  const festivals: DjMagFestival[] = [];
  for (let rank = 1; rank <= 100; rank++) {
    const slug = rankSlug.get(rank);
    if (!slug) continue;
    const re = new RegExp(
      `href=["']/top100festivals/${YEAR}/${rank}/${slug}["'][^>]*>\\s*(?:<[^>]+>\\s*)*([^<]{1,120})`,
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
    festivals.push({
      rank,
      slug,
      name,
      djmagUrl: `https://djmag.com/top100festivals/${YEAR}/${rank}/${slug}`,
    });
  }
  return mergeSeedMeta(festivals);
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

export async function loadDjMagTopFestivals(opts?: {
  force?: boolean;
}): Promise<DjMagFestival[]> {
  if (cached && !opts?.force) return cached;
  const html = await fetchListHtml();
  let festivals = html ? parseListHtml(html) : [];
  const source = festivals.length >= 50 ? "live" : "seed";
  if (festivals.length < 50) festivals = mergeSeedMeta(loadSeed());
  cached = festivals;
  console.log(`[djmag-festivals] loaded ${festivals.length} via ${source}`);
  return festivals;
}

/**
 * Fill missing festival websites via Wikidata P856 (DJ Mag profiles omit them).
 */
export async function enrichDjMagFestivalWebsites(opts?: {
  missingOnly?: boolean;
  limit?: number;
  persistSeed?: boolean;
  delayMs?: number;
}): Promise<{ fetched: number; found: number; festivals: DjMagFestival[] }> {
  const missingOnly = opts?.missingOnly !== false;
  const festivals = await loadDjMagTopFestivals({ force: true });
  const targets = festivals.filter((f) => {
    if (!missingOnly) return true;
    if (f.website && !/djmag\.com/i.test(f.website)) return false;
    return true;
  });
  const limit = opts?.limit ?? targets.length;
  let fetched = 0;
  let found = 0;

  for (const fest of targets.slice(0, limit)) {
    fetched += 1;
    // Curated alias already has a real site — copy onto the chart row.
    const knownSlug = ALIAS_TO_KNOWN[fest.slug];
    const known = knownSlug ? KNOWN_EVENTS[knownSlug] : undefined;
    if (known?.website) {
      fest.website = known.website;
      if (known.location) fest.location = known.location;
      found += 1;
      console.log(`[djmag-festivals] ${fest.slug} → ${fest.website} (curated)`);
      continue;
    }
    const extra = EXTRA_OFFICIAL[fest.slug] ?? EXTRA_OFFICIAL[slugify(fest.name)];
    if (extra) {
      fest.website = extra;
      found += 1;
      console.log(`[djmag-festivals] ${fest.slug} → ${extra} (extra)`);
      continue;
    }
    const website = await resolveWikidataOfficialWebsite(fest.name, "festival", {
      delayMs: opts?.delayMs,
    });
    if (!website) {
      console.log(`[djmag-festivals] no site ${fest.slug}`);
      continue;
    }
    fest.website = website;
    found += 1;
    console.log(`[djmag-festivals] ${fest.slug} → ${website}`);
  }

  cached = festivals;
  if (opts?.persistSeed) {
    const seed = loadSeed();
    const bySlug = new Map(festivals.map((f) => [f.slug, f]));
    const next = seed.map((f) => {
      const live = bySlug.get(f.slug);
      return live
        ? {
            ...f,
            website: live.website ?? f.website,
            location: live.location ?? f.location,
          }
        : f;
    });
    for (const f of festivals) {
      if (!next.some((x) => x.slug === f.slug)) next.push(f);
    }
    next.sort((a, b) => a.rank - b.rank);
    writeFileSync(
      SEED_PATH,
      `${JSON.stringify(
        {
          source: LIST_URL,
          year: YEAR,
          note: "DJ Mag Top 100 Festivals. Profiles omit official URLs — `website` from KNOWN_EVENTS aliases + Wikidata P856. Mixmag.net not crawled.",
          festivals: next,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    console.log(`[djmag-festivals] wrote seed (${found} websites)`);
  }
  return { fetched, found, festivals };
}

/** Canonical event for a chart row — prefer curated KNOWN_EVENTS. */
export function djMagFestivalToEvent(fest: DjMagFestival): CanonicalEvent {
  const knownSlug = ALIAS_TO_KNOWN[fest.slug] ?? ALIAS_TO_KNOWN[slugify(fest.name)];
  const extra =
    EXTRA_OFFICIAL[fest.slug] ?? EXTRA_OFFICIAL[slugify(fest.name)];
  if (knownSlug && KNOWN_EVENTS[knownSlug]) {
    const known = KNOWN_EVENTS[knownSlug]!;
    return {
      ...known,
      website: known.website ?? fest.website ?? extra,
      location: known.location ?? fest.location,
    };
  }
  return {
    slug: fest.slug,
    name: fest.name,
    kind: "festival",
    location: fest.location,
    website: fest.website ?? extra ?? fest.djmagUrl,
  };
}

export async function ensureDjMagFestivals(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; total: number }> {
  if (process.env.DJMAG_ENRICH_FESTIVALS === "1") {
    await enrichDjMagFestivalWebsites({
      missingOnly: true,
      limit: Number(process.env.DJMAG_OFFICIAL_LIMIT || 100),
      persistSeed: process.env.DJMAG_PERSIST_SEED === "1",
    });
  }

  const festivals = await loadDjMagTopFestivals();
  let created = 0;
  let updated = 0;
  for (const fest of festivals) {
    const ev = djMagFestivalToEvent(fest);
    const existing = await prisma.event.findUnique({ where: { slug: ev.slug } });
    if (!existing) {
      await prisma.event.create({
        data: {
          slug: ev.slug,
          name: ev.name,
          kind: "festival",
          location: ev.location ?? null,
          website: ev.website ?? null,
          soundcloud: ev.soundcloud ?? null,
          instagram: ev.instagram ?? null,
          twitter: ev.twitter ?? null,
        },
      });
      created += 1;
      continue;
    }
    const data: Record<string, unknown> = {};
    if (ev.website) {
      const weak =
        !existing.website || /djmag\.com\/top100festivals/i.test(existing.website);
      if (weak) data.website = ev.website;
    }
    if (!existing.location && ev.location) data.location = ev.location;
    if (existing.kind === "event") data.kind = "festival";
    if (existing.name === slugify(existing.name) || existing.name === ev.slug) {
      data.name = ev.name;
    }
    if (Object.keys(data).length) {
      await prisma.event.update({ where: { id: existing.id }, data });
      updated += 1;
    }
  }
  console.log(
    `[djmag-festivals] ensure created=${created} updated=${updated} total=${festivals.length}`,
  );
  return { created, updated, total: festivals.length };
}

export function inferDjMagFestivalEvent(title: string): CanonicalEvent | null {
  const festivals = cached ?? loadSeed();
  if (!festivals.length) return null;
  const t = title.replace(/\s+/g, " ").trim();
  const ranked = [...festivals].sort((a, b) => b.name.length - a.name.length);
  for (const fest of ranked) {
    if (SKIP_TITLE_MATCH.has(fest.slug)) continue;
    const tokens = fest.name.trim().split(/\s+/);
    if (tokens.length === 1 && fest.name.length < 6) continue;
    const name = fest.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[^\\w])${name}(?:[^\\w]|$)`, "i");
    if (re.test(t)) return djMagFestivalToEvent(fest);
    const slugWords = fest.slug.replace(/-/g, " ");
    if (slugWords.length >= 8) {
      const re2 = new RegExp(
        `(?:^|[^\\w])${slugWords.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^\\w]|$)`,
        "i",
      );
      if (re2.test(t)) return djMagFestivalToEvent(fest);
    }
  }
  return null;
}
