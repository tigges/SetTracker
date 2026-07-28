/**
 * Probe stored social / website URLs and clear dead guesses.
 * Runs after ingest (and can run standalone via prisma/verify-urls.ts).
 *
 * A URL is kept when HEAD/GET returns < 400 (or a soft block like 401/403
 * on a host that still resolves — those stay, since login walls ≠ wrong page).
 * Cleared on SSL errors, DNS failures, and hard 404/410.
 */

import type { PrismaClient } from "@prisma/client";
import { ensureClubListVenues } from "./discovery/clubLists";
import { ensureDjMagVenues } from "./discovery/djmagClubs";
import { ensureDjMagTopDjs } from "./discovery/djmagDjs";
import { ensureDjMagFestivals } from "./discovery/djmagFestivals";
import { ensureDiscoveredDjs } from "./discovery/ensureDjs";
import { applyCuratedEventImages } from "../thumbs/eventImages";
import { applyDjSocialPins } from "./djSocialPins";
import { KNOWN_EVENTS } from "./events";

export type VerifyStats = {
  checked: number;
  cleared: number;
  kept: number;
};

const TIMEOUT_MS = 8_000;

async function probe(url: string): Promise<"ok" | "dead" | "soft"> {
  if (!/^https?:\/\//i.test(url)) return "dead";
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent": "SetRadar/0.1 (+https://setradar.ai; url-verify)",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404 || res.status === 410) return "dead";
    if (res.status === 405 || res.status === 501) {
      // Some hosts reject HEAD — retry GET
      const get = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "SetRadar/0.1 (+https://setradar.ai; url-verify)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (get.status === 404 || get.status === 410) return "dead";
      if (get.status >= 500) return "soft";
      return get.status < 400 || get.status === 401 || get.status === 403
        ? "ok"
        : "soft";
    }
    if (res.status >= 500) return "soft";
    if (res.status === 401 || res.status === 403) return "ok"; // gated ≠ wrong
    return res.status < 400 ? "ok" : "soft";
  } catch {
    return "dead";
  }
}

async function scrubField(
  prisma: PrismaClient,
  kind: "dj" | "label" | "event",
  id: string,
  field: string,
  url: string | null | undefined,
  stats: VerifyStats,
): Promise<void> {
  if (!url) return;
  stats.checked += 1;
  const result = await probe(url);
  if (result === "dead") {
    stats.cleared += 1;
    if (kind === "dj") {
      await prisma.dj.update({
        where: { id },
        data: { [field]: null },
      });
    } else if (kind === "event") {
      await prisma.event.update({
        where: { id },
        data: { [field]: null },
      });
    } else {
      await prisma.label.update({
        where: { id },
        data: { [field]: null },
      });
    }
    console.log(`  ✗ clear ${kind}.${field} ${url}`);
  } else {
    stats.kept += 1;
  }
}

/** Apply curated corrections that name-guessing gets wrong. */
export async function applyKnownUrlFixes(prisma: PrismaClient): Promise<number> {
  let n = 0;
  // Divided Souls label — never dividedsouls.com (SSL broken)
  const divided = await prisma.label.findUnique({ where: { slug: "divided" } });
  if (divided) {
    await prisma.label.update({
      where: { id: divided.id },
      data: {
        website: "https://www.dividedsoulsrecords.com/",
        soundcloud: "https://soundcloud.com/dividedsoulsrecords",
        instagram: "https://instagram.com/dividedsoulsrec",
      },
    });
    n += 1;
  }

  // Brand DJ social pins (BISCITS, Guetta, FISHER, ARTBAT, …).
  n += await applyDjSocialPins(prisma);

  // Curated venue / festival share images (Ultra, EDC, Tomorrowland, …).
  n += await applyCuratedEventImages(prisma);

  // Curated venue / festival websites (EDC Las Vegas etc.)
  for (const ev of Object.values(KNOWN_EVENTS)) {
    const existing = await prisma.event.findUnique({ where: { slug: ev.slug } });
    if (!existing) {
      await prisma.event.create({
        data: {
          slug: ev.slug,
          name: ev.name,
          kind: ev.kind,
          location: ev.location ?? null,
          website: ev.website ?? null,
          soundcloud: ev.soundcloud ?? null,
          instagram: ev.instagram ?? null,
          twitter: ev.twitter ?? null,
        },
      });
      n += 1;
      continue;
    }
    await prisma.event.update({
      where: { id: existing.id },
      data: {
        website: ev.website ?? existing.website,
        soundcloud: ev.soundcloud ?? existing.soundcloud,
        instagram: ev.instagram ?? existing.instagram,
        twitter: ev.twitter ?? existing.twitter,
        location: existing.location ?? ev.location ?? null,
      },
    });
    n += 1;
  }

  // Merge accidental edc-las-vegas fork into canonical edc-lv.
  const fork = await prisma.event.findUnique({
    where: { slug: "edc-las-vegas" },
    include: { sets: { select: { id: true } } },
  });
  const canon = await prisma.event.findUnique({ where: { slug: "edc-lv" } });
  if (fork && canon && fork.id !== canon.id) {
    for (const s of fork.sets) {
      await prisma.set.update({
        where: { id: s.id },
        data: { eventId: canon.id },
      });
    }
    await prisma.event.delete({ where: { id: fork.id } });
    n += 1;
  }

  // Persist roster + high-signal discovered artists as Dj rows (Guetta, etc.).
  await ensureDiscoveredDjs(prisma);

  // Industry context: DJ Mag Top 100 Clubs / Festivals / DJs + club listicles.
  // Mixmag.net is not crawled (Mixmag = YouTube venue only).
  const clubs = await ensureDjMagVenues(prisma);
  n += clubs.created + clubs.updated;
  const fests = await ensureDjMagFestivals(prisma);
  n += fests.created + fests.updated;
  const topDjs = await ensureDjMagTopDjs(prisma);
  n += topDjs.created + topDjs.updated;
  const lists = await ensureClubListVenues(prisma);
  n += lists.created + lists.updated;

  // Re-home sets whose titles clearly say EDC onto the curated venue
  // (covers Insomniac-channel crawls that previously used event=Insomniac).
  if (canon) {
    const orphans = await prisma.set.findMany({
      where: {
        OR: [
          { eventId: null },
          { event: { slug: { not: "edc-lv" } } },
        ],
        title: { contains: "EDC" },
      },
      select: { id: true, title: true, eventId: true },
    });
    for (const s of orphans) {
      if (!/\bedc\b/i.test(s.title)) continue;
      if (/\bedc\s*(mexico|orlando|china)\b/i.test(s.title)) continue;
      await prisma.set.update({
        where: { id: s.id },
        data: { eventId: canon.id },
      });
      n += 1;
    }
  }

  return n;
}

export async function verifyStoredSocialUrls(
  prisma: PrismaClient,
): Promise<VerifyStats> {
  const stats: VerifyStats = { checked: 0, cleared: 0, kept: 0 };
  const fixes = await applyKnownUrlFixes(prisma);
  if (fixes) console.log(`[verify-urls] applied ${fixes} curated entity fixes`);

  const djs = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      soundcloud: true,
      youtube: true,
      instagram: true,
      twitter: true,
      website: true,
    },
  });
  for (const d of djs) {
    await scrubField(prisma, "dj", d.id, "soundcloud", d.soundcloud, stats);
    await scrubField(prisma, "dj", d.id, "youtube", d.youtube, stats);
    await scrubField(prisma, "dj", d.id, "instagram", d.instagram, stats);
    await scrubField(prisma, "dj", d.id, "twitter", d.twitter, stats);
    await scrubField(prisma, "dj", d.id, "website", d.website, stats);
  }

  const labels = await prisma.label.findMany({
    select: {
      id: true,
      slug: true,
      soundcloud: true,
      instagram: true,
      website: true,
    },
  });
  for (const l of labels) {
    await scrubField(prisma, "label", l.id, "soundcloud", l.soundcloud, stats);
    await scrubField(prisma, "label", l.id, "instagram", l.instagram, stats);
    await scrubField(prisma, "label", l.id, "website", l.website, stats);
  }

  const events = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      soundcloud: true,
      instagram: true,
      twitter: true,
      website: true,
    },
  });
  for (const e of events) {
    await scrubField(prisma, "event", e.id, "soundcloud", e.soundcloud, stats);
    await scrubField(prisma, "event", e.id, "instagram", e.instagram, stats);
    await scrubField(prisma, "event", e.id, "twitter", e.twitter, stats);
    await scrubField(prisma, "event", e.id, "website", e.website, stats);
  }

  console.log(
    `[verify-urls] checked=${stats.checked} kept=${stats.kept} cleared=${stats.cleared}`,
  );
  return stats;
}
