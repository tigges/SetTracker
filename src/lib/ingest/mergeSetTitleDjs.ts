/**
 * Fold set-title / episode / festival Dj rows onto real artists.
 *
 * Examples:
 *   "Odd Mob at Seismic…" → odd-mob
 *   "Dom Dolla // Dancefloor Currency" → dom-dolla
 *   "Defected Virtual Festival 4.0" (set: … - Dom Dolla) → dom-dolla
 *   "Day Trip Festival 2024 Mega-Mix" (Night Owl) → insomniac
 *
 * Never invents social URLs — only relinks SetArtist + deletes empty junk.
 */

import type { PrismaClient } from "@prisma/client";
import { isJunkArtistName, sanitizeArtistName } from "../artistName";
import {
  looksLikeEventOrSeriesCredit,
  performingCreditFromTitle,
  tidyPerformingCredit,
} from "./artists";
import { canonicalDjSlug } from "./djSlugAliases";
import { slugify } from "./types";

export type MergeSetTitleStats = {
  scanned: number;
  setsRelinked: number;
  junkRemoved: number;
  ensured: number;
};

/** Explicit slug → canonical when heuristics are ambiguous. */
const EXPLICIT_ALIAS: Record<string, string> = {
  "dom-dolla-dancefloor-currency": "dom-dolla",
  "dom-dolla-warm-up": "dom-dolla",
  "dom-dolla-you-tour-mix": "dom-dolla",
  "everything-always-dom-dolla": "dom-dolla",
  "the-sydney-social-podcast-3-dom-dolla-download-now": "dom-dolla",
  "the-sydney-social-podcast-3": "dom-dolla",
  "defected-virtual-festival-4-0": "dom-dolla",
  "odd-mob-at-seismic-dance-event-8-0": "odd-mob",
  "odd-mob-live": "odd-mob",
  "odd-mob-palladium-2024": "odd-mob",
  "odd-mob-live-set-at-tivoli-brisbane": "odd-mob",
  "james-hype-live": "james-hype",
  "sara-landry-live": "sara-landry",
  "tape-b-mutiny-shareholders-meeting-live": "tape-b",
  "ann-clue-at-cercle-festival-2024-concorde-stage": "ann-clue",
  "argy-for-cercle-at-jungfraujoch": "argy",
  "charlotte-de-witte-at-amf-festival-2023": "charlotte-de-witte",
  "indira-paganotto-at-cercle-festival-2024-a380-stage": "indira-paganotto",
  "mochakk-at-plaza-de-espana-in-sevilla-spain-for-cercle": "mochakk",
  "folamour-at-cathedrale-saint-pierre-in-geneva-switzerland-for-cercle":
    "folamour",
  "best-of-2023-mixtape": "insomniac",
};

const MEGA_MIX =
  /\bmega[-\s]?mix\b|\bfestival\s+\d{4}\b.*\bmix\b|\bmix\s*$/i;
const PODCAST_EP =
  /\bpodcast\b|\bdownload\s+now\b|\bnight\s*owl\s*radio\b/i;

function looksLikeSetTitleDj(name: string, slug: string): boolean {
  if (EXPLICIT_ALIAS[slug]) return true;
  if (MEGA_MIX.test(name) || /mega-mix/.test(slug)) return true;
  if (PODCAST_EP.test(name)) return true;
  if (/\s+\/\/\s+/.test(name) || /⠶/.test(name)) return true;
  if (/\s+at\s+/i.test(name)) return true;
  if (/\bwarm\s*up\b/i.test(name)) return true;
  if (/\b(live|tour\s*mix)\s*$/i.test(name)) return true;
  if (/\(\s*live/i.test(name)) return true;
  if (looksLikeEventOrSeriesCredit(name)) return true;
  if (isJunkArtistName(name)) return true;
  return false;
}

function resolveFromTitleText(
  text: string,
  currentSlug: string,
): { slug: string; name: string } | null {
  const credit = tidyPerformingCredit(performingCreditFromTitle(text));
  const cleaned = sanitizeArtistName(credit);
  if (!cleaned) return null;
  const s = canonicalDjSlug(slugify(cleaned));
  if (!s || s === currentSlug) return null;
  return { slug: s, name: cleaned };
}

/**
 * Infer the real artist slug for a bogus DJ name.
 * Night Owl / festival mega-mixes → insomniac (series host).
 * Prefer parsing owned set titles when the Dj.name itself is an event.
 */
export function resolveCanonicalFromSetTitleDj(
  name: string,
  slug: string,
  setTitles: string[] = [],
): { slug: string; name: string } | null {
  if (EXPLICIT_ALIAS[slug]) {
    const target = EXPLICIT_ALIAS[slug]!;
    return { slug: target, name: displayNameForSlug(target, name) };
  }

  // Prefer artist parsed from the actual set title(s).
  for (const title of setTitles) {
    const fromTitle = resolveFromTitleText(title, slug);
    if (fromTitle) return fromTitle;
  }

  // Festival mega-mix / Night Owl episode crumbs are series content.
  if (
    MEGA_MIX.test(name) ||
    /mega-mix/.test(slug) ||
    /night\s*owl/i.test(name) ||
    setTitles.some((t) => /night\s*owl\s*radio/i.test(t))
  ) {
    if (
      !/\b(dom\s*dolla|odd\s*mob|charlotte|fisher|cloonee|guetta)\b/i.test(name)
    ) {
      return { slug: "insomniac", name: "INSOMNIAC" };
    }
  }

  if (
    (PODCAST_EP.test(name) || setTitles.some((t) => PODCAST_EP.test(t))) &&
    /\bdom\s*dolla\b/i.test([name, ...setTitles].join(" "))
  ) {
    return { slug: "dom-dolla", name: "Dom Dolla" };
  }

  const fromName = resolveFromTitleText(name, slug);
  if (fromName) return fromName;

  // Last resort: left of // or "at"
  const credit = tidyPerformingCredit(
    performingCreditFromTitle(stripDecor(name)),
  );
  const left =
    credit.split(/\s+\/\/\s+/)[0]?.trim() ||
    credit.split(/\s+at\s+/i)[0]?.trim() ||
    credit;
  const fallback = sanitizeArtistName(
    left.replace(/\s+\(?\s*live\b.*$/i, "").trim(),
  );
  if (!fallback) return null;
  const s = canonicalDjSlug(slugify(fallback));
  if (s === slug) return null;
  return { slug: s, name: fallback };
}

function stripDecor(name: string): string {
  return name
    .replace(/[⠶✦★☆●◆]/g, " ")
    .replace(/\*+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayNameForSlug(slug: string, fallbackName: string): string {
  const known: Record<string, string> = {
    "dom-dolla": "Dom Dolla",
    "odd-mob": "Odd Mob",
    insomniac: "INSOMNIAC",
    "james-hype": "James Hype",
    "sara-landry": "Sara Landry",
    "tape-b": "Tape B",
    "ann-clue": "Ann Clue",
    argy: "Argy",
    "charlotte-de-witte": "Charlotte de Witte",
    "indira-paganotto": "Indira Paganotto",
    mochakk: "Mochakk",
    folamour: "Folamour",
  };
  return known[slug] ?? fallbackName;
}

async function ensureDj(
  prisma: PrismaClient,
  slug: string,
  name: string,
): Promise<{ id: string; created: boolean }> {
  const existing = await prisma.dj.findUnique({ where: { slug } });
  if (existing) {
    // Never overwrite a good short name with set-title leftovers.
    if (
      existing.name.length > name.length + 4 &&
      /at |\/\/|mix|live|festival/i.test(existing.name)
    ) {
      await prisma.dj.update({
        where: { id: existing.id },
        data: { name },
      });
    }
    return { id: existing.id, created: false };
  }
  const created = await prisma.dj.create({
    data: {
      slug,
      name,
      accent: "#888888",
    },
  });
  return { id: created.id, created: true };
}

async function relinkSetPrimary(
  prisma: PrismaClient,
  setId: string,
  canonicalId: string,
  junkId: string,
): Promise<boolean> {
  const links = await prisma.setArtist.findMany({
    where: { setId },
    select: { djId: true, isPrimary: true },
  });
  const hasCanon = links.some((l) => l.djId === canonicalId);
  if (!hasCanon) {
    for (const link of links) {
      if (!link.isPrimary) continue;
      await prisma.setArtist.update({
        where: { setId_djId: { setId, djId: link.djId } },
        data: { isPrimary: false },
      });
    }
    await prisma.setArtist.create({
      data: { setId, djId: canonicalId, isPrimary: true },
    });
  } else {
    const canon = links.find((l) => l.djId === canonicalId)!;
    if (!canon.isPrimary) {
      for (const link of links) {
        if (link.djId === canonicalId || !link.isPrimary) continue;
        await prisma.setArtist.update({
          where: { setId_djId: { setId, djId: link.djId } },
          data: { isPrimary: false },
        });
      }
      await prisma.setArtist.update({
        where: { setId_djId: { setId, djId: canonicalId } },
        data: { isPrimary: true },
      });
    }
  }

  const still = await prisma.setArtist.findUnique({
    where: { setId_djId: { setId, djId: junkId } },
  });
  if (still) {
    await prisma.setArtist.delete({
      where: { setId_djId: { setId, djId: junkId } },
    });
  }
  return true;
}

/**
 * Scan Dj rows that look like set titles / festivals and fold them onto artists.
 */
export async function mergeSetTitleDjs(
  prisma: PrismaClient,
): Promise<MergeSetTitleStats> {
  let scanned = 0;
  let setsRelinked = 0;
  let junkRemoved = 0;
  let ensured = 0;

  const candidates = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { sets: true } },
    },
  });

  for (const dj of candidates) {
    if (!looksLikeSetTitleDj(dj.name, dj.slug)) continue;
    // Never merge away a curated/pinned short slug that is already canonical.
    if (
      ["dom-dolla", "odd-mob", "insomniac", "james-hype", "sara-landry"].includes(
        dj.slug,
      )
    ) {
      continue;
    }

    scanned += 1;

    const owned = await prisma.set.findMany({
      where: { artists: { some: { djId: dj.id } } },
      select: { title: true },
    });
    const setTitles = owned.map((s) => s.title);

    const target = resolveCanonicalFromSetTitleDj(
      dj.name,
      dj.slug,
      setTitles,
    );
    if (!target || target.slug === dj.slug) {
      // Empty junk with no resolvable artist — delete if no sets.
      if (dj._count.sets === 0) {
        await prisma.dj.delete({ where: { id: dj.id } }).catch(() => null);
        junkRemoved += 1;
      }
      continue;
    }

    const { id: canonicalId, created } = await ensureDj(
      prisma,
      target.slug,
      target.name,
    );
    if (created) ensured += 1;

    const links = await prisma.setArtist.findMany({
      where: { djId: dj.id },
      select: { setId: true },
    });
    for (const { setId } of links) {
      await relinkSetPrimary(prisma, setId, canonicalId, dj.id);
      setsRelinked += 1;
    }

    // Series FK can block delete — reassign first.
    await prisma.series.updateMany({
      where: { djId: dj.id },
      data: { djId: canonicalId },
    });

    const remaining = await prisma.setArtist.count({ where: { djId: dj.id } });
    const remainingSeries = await prisma.series.count({
      where: { djId: dj.id },
    });
    if (remaining === 0 && remainingSeries === 0) {
      await prisma.dj.delete({ where: { id: dj.id } }).catch(() => null);
      junkRemoved += 1;
    }
  }

  return { scanned, setsRelinked, junkRemoved, ensured };
}
