/**
 * Rehome stage / radio "DJs" onto Event rows and drop non-set uploads.
 * Runs from verify-urls so Pages + deep ingest clean the catalog automatically.
 */

import type { PrismaClient } from "@prisma/client";
import {
  isJunkArtistName,
  isNonSetCredit,
  isRadioArtistName,
  isStageArtistName,
} from "../artistName";
import { isBrandHostSlug } from "../brandHosts";
import { isNonCatalogSet } from "../setBrowse";
import { curatedEventSocialPatch } from "./eventSocials";
import {
  inferFestivalEvent,
  KNOWN_EVENTS,
  resolveEvent,
  type CanonicalEvent,
} from "./events";
import { slugify } from "./types";

export type JunkDjKind = "stage" | "radio" | "nonset" | "other";

export type ResolveJunkDjStats = {
  scanned: number;
  setsDeleted: number;
  setsMoved: number;
  djsRemoved: number;
  eventsEnsured: number;
};

export function classifyJunkDj(name: string, slug = ""): JunkDjKind | null {
  const n = name.replace(/\s+/g, " ").trim();
  if (isNonSetCredit(n) || isNonSetCredit(slug.replace(/-/g, " "))) {
    return "nonset";
  }
  if (isStageArtistName(n)) return "stage";
  if (isRadioArtistName(n)) return "radio";
  if (isJunkArtistName(n) || /^view-artist-details-for-/.test(slug)) {
    return "other";
  }
  return null;
}

function tidyHostName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+channel\s+by\s+.+$/i, "")
    .replace(/#/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Festival for a stage credit, or a radio/livestream Event for a station. */
export function inferJunkHostEvent(
  name: string,
  titles: string[] = [],
): CanonicalEvent | null {
  const tidy = tidyHostName(name);
  const hay = [tidy, ...titles].join(" ");
  const fest = inferFestivalEvent(hay);
  const kind = classifyJunkDj(tidy, slugify(tidy));

  if (kind === "stage") {
    if (fest) return fest;
    // Freedom Stage is Tomorrowland-only; generic "Mainstage" needs a title hint.
    if (/^freedom\s*stage$/i.test(tidy)) return KNOWN_EVENTS.tomorrowland;
    return null;
  }

  if (kind === "radio") {
    if (/\bone\s*world\s*radio\b/i.test(hay)) {
      return KNOWN_EVENTS["one-world-radio"] ?? null;
    }
    if (fest && /\btomorrowland\b/i.test(hay)) return fest;
    return resolveEvent(tidy, { kind: "radio" });
  }

  return fest;
}

async function deleteSet(prisma: PrismaClient, setId: string): Promise<void> {
  await prisma.played.deleteMany({ where: { setId } });
  await prisma.setArtist.deleteMany({ where: { setId } });
  await prisma.set.delete({ where: { id: setId } });
}

async function ensureEvent(
  prisma: PrismaClient,
  canon: CanonicalEvent,
): Promise<{ id: string; created: boolean }> {
  const existing = await prisma.event.findUnique({ where: { slug: canon.slug } });
  if (existing) {
    const curated = KNOWN_EVENTS[canon.slug];
    if (curated && existing.kind === "event") {
      await prisma.event.update({
        where: { id: existing.id },
        data: { kind: curated.kind, name: existing.name || curated.name },
      });
    }
    return { id: existing.id, created: false };
  }
  const curated = KNOWN_EVENTS[canon.slug];
  const created = await prisma.event.create({
    data: {
      slug: canon.slug,
      name: canon.name,
      kind: canon.kind,
      location: canon.location ?? null,
      ...(curated ? curatedEventSocialPatch(curated) : {}),
    },
  });
  return { id: created.id, created: true };
}

async function tryDeleteDj(prisma: PrismaClient, djId: string): Promise<boolean> {
  const remaining = await prisma.setArtist.count({ where: { djId } });
  const remainingSeries = await prisma.series.count({ where: { djId } });
  if (remaining > 0 || remainingSeries > 0) return false;
  await prisma.dj.delete({ where: { id: djId } }).catch(() => null);
  return true;
}

/**
 * Fold leftover junk Dj rows (stages, radios, Shorts, tutorials) off /djs.
 */
export async function resolveJunkDjs(
  prisma: PrismaClient,
): Promise<ResolveJunkDjStats> {
  const stats: ResolveJunkDjStats = {
    scanned: 0,
    setsDeleted: 0,
    setsMoved: 0,
    djsRemoved: 0,
    eventsEnsured: 0,
  };

  const rows = await prisma.dj.findMany({
    select: { id: true, slug: true, name: true },
  });

  for (const dj of rows) {
    if (isBrandHostSlug(dj.slug)) continue;
    const kind = classifyJunkDj(dj.name, dj.slug);
    if (!kind) continue;
    stats.scanned += 1;

    const owned = await prisma.set.findMany({
      where: { artists: { some: { djId: dj.id } } },
      select: {
        id: true,
        title: true,
        durationSec: true,
        eventId: true,
      },
    });

    const keep: typeof owned = [];
    for (const set of owned) {
      const drop =
        kind === "nonset" ||
        isNonCatalogSet({ title: set.title, durationSec: set.durationSec });
      if (drop) {
        await deleteSet(prisma, set.id);
        stats.setsDeleted += 1;
      } else {
        keep.push(set);
      }
    }

    if (kind === "nonset") {
      await prisma.series.updateMany({
        where: { djId: dj.id },
        data: { djId: null },
      });
      if (await tryDeleteDj(prisma, dj.id)) stats.djsRemoved += 1;
      continue;
    }

    const titles = keep.map((s) => s.title);
    const host = inferJunkHostEvent(dj.name, titles);

    if (host && (kind === "stage" || kind === "radio" || kind === "other")) {
      const ev = await ensureEvent(prisma, host);
      if (ev.created) stats.eventsEnsured += 1;
      for (const set of keep) {
        if (!set.eventId) {
          await prisma.set.update({
            where: { id: set.id },
            data: { eventId: ev.id },
          });
        }
        await prisma.setArtist.deleteMany({
          where: { setId: set.id, djId: dj.id },
        });
        stats.setsMoved += 1;
      }
    } else if (kind === "stage" || kind === "radio") {
      for (const set of keep) {
        await prisma.setArtist.deleteMany({
          where: { setId: set.id, djId: dj.id },
        });
        stats.setsMoved += 1;
      }
    }

    await prisma.series.updateMany({
      where: { djId: dj.id },
      data: { djId: null },
    });
    if (await tryDeleteDj(prisma, dj.id)) stats.djsRemoved += 1;
  }

  return stats;
}
