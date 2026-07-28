/**
 * DJ Mag Top 100 Festivals — industry context for the venue graph.
 * Source: https://djmag.com/top100festivals
 *
 * Materializes festival Events + title inference. Official websites come from
 * KNOWN_EVENTS aliases when we already curate them (Tomorrowland, EDC, Ultra…).
 * Festival profile pages rarely list an official site (unlike Top 100 Clubs).
 *
 * Mixmag.net is NOT crawled — Mixmag is YouTube-venue only (@Mixmag).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { KNOWN_EVENTS, type CanonicalEvent } from "../events";
import { slugify } from "../types";

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
};

const SKIP_TITLE_MATCH = new Set([
  "amf", // short acronym
  "exit",
]);

let cached: DjMagFestival[] | null = null;

function decodeEntities(s: string): string {
  return s
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
  return festivals;
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
  if (festivals.length < 50) festivals = loadSeed();
  cached = festivals;
  console.log(`[djmag-festivals] loaded ${festivals.length} via ${source}`);
  return festivals;
}

/** Canonical event for a chart row — prefer curated KNOWN_EVENTS. */
export function djMagFestivalToEvent(fest: DjMagFestival): CanonicalEvent {
  const knownSlug = ALIAS_TO_KNOWN[fest.slug] ?? ALIAS_TO_KNOWN[slugify(fest.name)];
  if (knownSlug && KNOWN_EVENTS[knownSlug]) {
    return { ...KNOWN_EVENTS[knownSlug]! };
  }
  return {
    slug: fest.slug,
    name: fest.name,
    kind: "festival",
    location: fest.location,
    // Weak fallback — thumbs skip DJ Mag hosts; curated aliases supply real sites.
    website: fest.website ?? fest.djmagUrl,
  };
}

export async function ensureDjMagFestivals(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; total: number }> {
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
    if (existing.kind === "event" || existing.kind === "club") {
      // Chart says festival — upgrade generic/event; don't demote curated livestreams.
      if (existing.kind === "event") data.kind = "festival";
    }
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
