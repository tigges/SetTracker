/**
 * Fold set-title / episode / festival Dj rows onto real artists.
 *
 * Examples:
 *   "Odd Mob at Seismic…" → odd-mob
 *   "Dom Dolla // Dancefloor Currency" → dom-dolla
 *   "Defected Virtual Festival 4.0" (set: … - Dom Dolla) → dom-dolla
 *   "Day Trip Festival 2024 Mega-Mix" (Night Owl) → series/event only
 *
 * Never invents social URLs — only relinks SetArtist + deletes empty junk.
 * Brand hosts (INSOMNIAC, …) are stripped from SetArtist; attribution stays
 * on Series / Event.
 */

import type { PrismaClient } from "@prisma/client";
import {
  extraArtistsFromCombinedName,
  isJunkArtistName,
  isMonthYearArtistName,
  parseShowWithGuestCredit,
  sanitizeArtistName,
} from "../artistName";
import {
  BRAND_HOST_SLUGS,
  BRAND_SERIES_SLUGS,
  isBrandHostSlug,
} from "../brandHosts";
import {
  guestFromSeriesByTitle,
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
  brandHostsStripped: number;
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
  "laidback-luke-selects": "laidback-luke",
};

const MEGA_MIX =
  /\bmega[-\s]?mix\b|\bfestival\s+\d{4}\b.*\bmix\b|\bmix\s*$/i;
const PODCAST_EP =
  /\bpodcast\b|\bdownload\s+now\b|\bnight\s*owl\s*radio\b/i;

/** Mega-mix / NOR crumbs with no performing artist → unlink, keep series/event. */
function isSeriesOnlyHostCrumb(
  name: string,
  slug: string,
  setTitles: string[],
): boolean {
  if (
    MEGA_MIX.test(name) ||
    /mega-mix/.test(slug) ||
    /night\s*owl/i.test(name) ||
    setTitles.some((t) => /night\s*owl\s*radio/i.test(t))
  ) {
    if (
      !/\b(dom\s*dolla|odd\s*mob|charlotte|fisher|cloonee|guetta)\b/i.test(name)
    ) {
      return true;
    }
  }
  return false;
}

function looksLikeSetTitleDj(name: string, slug: string): boolean {
  if (EXPLICIT_ALIAS[slug]) return true;
  if (MEGA_MIX.test(name) || /mega-mix/.test(slug)) return true;
  if (PODCAST_EP.test(name)) return true;
  if (/\s+\/\/\s+/.test(name) || /⠶/.test(name)) return true;
  if (/\s+at\s+/i.test(name)) return true;
  if (/\bwarm\s*up\b/i.test(name)) return true;
  if (/\b(live|tour\s*mix)\s*$/i.test(name)) return true;
  if (/\(\s*live/i.test(name)) return true;
  if (/\s+WE\s*[12]\s*$/i.test(name) || /\s+weekend\s*[12]\s*$/i.test(name)) {
    return true;
  }
  if (
    isMonthYearArtistName(name) ||
    /^(january|february|march|april|may|june|july|august|september|october|november|december)-20\d{2}$/i.test(
      slug,
    )
  ) {
    return true;
  }
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
 * Night Owl / festival mega-mixes with no guest → null (series/event only).
 * Prefer parsing owned set titles when the Dj.name itself is an event.
 */
export function resolveCanonicalFromSetTitleDj(
  name: string,
  slug: string,
  setTitles: string[] = [],
): { slug: string; name: string } | null {
  if (EXPLICIT_ALIAS[slug]) {
    const target = EXPLICIT_ALIAS[slug]!;
    if (isBrandHostSlug(target)) return null;
    return { slug: target, name: displayNameForSlug(target, name) };
  }

  // Combined Dj.name ("Show with Artist", "Goodboys Present") wins over a
  // noisy owned title that can flip to a leftover ("Club Mix").
  if (parseShowWithGuestCredit(name) || /\bpresents?\s*$/i.test(name)) {
    const fromOwn = resolveFromTitleText(name, slug);
    if (fromOwn && !isBrandHostSlug(fromOwn.slug)) return fromOwn;
  }

  // Prefer artist parsed from the actual set title(s).
  for (const title of setTitles) {
    const fromTitle = resolveFromTitleText(title, slug);
    if (fromTitle && !isBrandHostSlug(fromTitle.slug)) return fromTitle;
  }

  // Festival mega-mix / Night Owl crumbs → no Dj primary.
  if (isSeriesOnlyHostCrumb(name, slug, setTitles)) {
    return null;
  }

  if (
    (PODCAST_EP.test(name) || setTitles.some((t) => PODCAST_EP.test(t))) &&
    /\bdom\s*dolla\b/i.test([name, ...setTitles].join(" "))
  ) {
    return { slug: "dom-dolla", name: "Dom Dolla" };
  }

  const fromName = resolveFromTitleText(name, slug);
  if (fromName && !isBrandHostSlug(fromName.slug)) return fromName;

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
  if (s === slug || isBrandHostSlug(s)) return null;
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
    "laidback-luke": "Laidback Luke",
    "odd-mob": "Odd Mob",
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

/** Drop SetArtist links to brand hosts; clear series ownership on those DJs. */
async function stripBrandHostPrimaries(
  prisma: PrismaClient,
): Promise<number> {
  // Brand shows must not appear on a guest DJ's profile as "their" series.
  await prisma.series.updateMany({
    where: { slug: { in: [...BRAND_SERIES_SLUGS] } },
    data: { djId: null },
  });

  const hosts = await prisma.dj.findMany({
    where: { slug: { in: [...BRAND_HOST_SLUGS] } },
    select: { id: true, slug: true },
  });
  let stripped = 0;
  for (const host of hosts) {
    const deleted = await prisma.setArtist.deleteMany({
      where: { djId: host.id },
    });
    stripped += deleted.count;
    await prisma.series.updateMany({
      where: { djId: host.id },
      data: { djId: null },
    });
    const remainingLinks = await prisma.setArtist.count({
      where: { djId: host.id },
    });
    const remainingSeries = await prisma.series.count({
      where: { djId: host.id },
    });
    if (remainingLinks === 0 && remainingSeries === 0) {
      await prisma.dj.delete({ where: { id: host.id } }).catch(() => null);
    }
  }
  return stripped;
}

/**
 * "Keinemusik Radio Show by Lara Bee" — primary is the guest, not the imprint.
 * Keinemusik stays a Label + DJ Mag collective; it is not the performing DJ.
 */
async function relinkSeriesByGuests(
  prisma: PrismaClient,
): Promise<{ relinked: number; ensured: number }> {
  const sets = await prisma.set.findMany({
    where: { title: { contains: "Radio Show" } },
    select: {
      id: true,
      title: true,
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { djId: true, dj: { select: { slug: true } } },
      },
    },
  });
  let relinked = 0;
  let ensured = 0;
  for (const set of sets) {
    const guest = guestFromSeriesByTitle(set.title);
    if (!guest) continue;
    const guestSlug = canonicalDjSlug(slugify(guest));
    if (!guestSlug || isBrandHostSlug(guestSlug)) continue;
    const current = set.artists[0];
    if (current?.dj.slug === guestSlug) continue;
    const { id: guestId, created } = await ensureDj(prisma, guestSlug, guest);
    if (created) ensured += 1;
    const junkId = current?.djId;
    if (junkId && junkId !== guestId) {
      await relinkSetPrimary(prisma, set.id, guestId, junkId);
    } else if (!junkId) {
      await prisma.setArtist.create({
        data: { setId: set.id, djId: guestId, isPrimary: true },
      });
    }
    relinked += 1;
  }
  return { relinked, ensured };
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

  const brandHostsStripped = await stripBrandHostPrimaries(prisma);
  const seriesGuests = await relinkSeriesByGuests(prisma);
  setsRelinked += seriesGuests.relinked;
  ensured += seriesGuests.ensured;

  const candidates = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { sets: true } },
    },
  });

  for (const dj of candidates) {
    if (isBrandHostSlug(dj.slug)) continue;
    if (!looksLikeSetTitleDj(dj.name, dj.slug)) continue;
    // Never merge away a curated/pinned short slug that is already canonical.
    if (
      ["dom-dolla", "odd-mob", "james-hype", "sara-landry"].includes(dj.slug)
    ) {
      continue;
    }

    scanned += 1;

    const owned = await prisma.set.findMany({
      where: { artists: { some: { djId: dj.id } } },
      select: { id: true, title: true },
    });
    const setTitles = owned.map((s) => s.title);

    const target = resolveCanonicalFromSetTitleDj(
      dj.name,
      dj.slug,
      setTitles,
    );
    if (!target || target.slug === dj.slug) {
      // Series-only crumbs / calendar names: drop SetArtist links, keep series/event.
      if (
        isSeriesOnlyHostCrumb(dj.name, dj.slug, setTitles) ||
        isMonthYearArtistName(dj.name)
      ) {
        const n = await prisma.setArtist.deleteMany({
          where: { djId: dj.id },
        });
        setsRelinked += n.count;
        await prisma.series.updateMany({
          where: { djId: dj.id },
          data: { djId: null },
        });
        const remaining = await prisma.setArtist.count({
          where: { djId: dj.id },
        });
        const remainingSeries = await prisma.series.count({
          where: { djId: dj.id },
        });
        if (remaining === 0 && remainingSeries === 0) {
          await prisma.dj.delete({ where: { id: dj.id } }).catch(() => null);
          junkRemoved += 1;
        }
        continue;
      }
      // Empty junk with no resolvable artist — delete if no sets.
      if (dj._count.sets === 0) {
        await prisma.dj.delete({ where: { id: dj.id } }).catch(() => null);
        junkRemoved += 1;
      }
      continue;
    }

    if (isBrandHostSlug(target.slug)) {
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
      for (const extra of extraArtistsFromCombinedName(dj.name)) {
        const extraName = sanitizeArtistName(extra) ?? extra.trim();
        const extraSlug = canonicalDjSlug(slugify(extraName));
        if (!extraSlug || extraSlug === target.slug || isBrandHostSlug(extraSlug)) {
          continue;
        }
        const extraDj = await ensureDj(prisma, extraSlug, extraName);
        if (extraDj.created) ensured += 1;
        const existing = await prisma.setArtist.findUnique({
          where: { setId_djId: { setId, djId: extraDj.id } },
        });
        if (!existing) {
          await prisma.setArtist.create({
            data: { setId, djId: extraDj.id, isPrimary: false },
          });
        }
      }
      setsRelinked += 1;
    }

    // Series FK can block delete — reassign first (or clear for brand series).
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

  return { scanned, setsRelinked, junkRemoved, ensured, brandHostsStripped };
}
