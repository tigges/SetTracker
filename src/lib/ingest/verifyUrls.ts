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
import { applyCuratedDjImages } from "../thumbs/djImages";
import { applyCuratedEventImages, fillEventImages } from "../thumbs/eventImages";
import { applyCuratedSetImages } from "../thumbs/setImages";
import { mergeSplitAtomicActs } from "./mergeAtomicActs";
import { resolveJunkDjs } from "./junkDj";
import { resolveLowSignalDjs } from "./lowSignalDj";
import { attachInferredFilmSeries } from "./filmSeries";
import { applyProducerDjReview } from "./producerDjReview";
import { mergeSetTitleDjs } from "./mergeSetTitleDjs";
import { repairInsomniacMixPlayback } from "./insomniac/repairMixPlayback";
import { applyDjSocialPins } from "./djSocialPins";
import { applyTrackIdPins } from "./identify/trackIdPins";
import { applyEntityCompletePins } from "./entityCompletePins";
import {
  curatedEventSocialPatch,
  eventSocialCleanupPatch,
  loadArtistSocialKeys,
} from "./eventSocials";
import { KNOWN_EVENTS } from "./events";
import { backfillPerformedAt } from "./backfillPerformedAt";
import { backfillSetEditions } from "./setEditions";
import { fillDjHandlesFromKnown, fillDjWebsitesFromWikidata } from "./discovery/fillDjHandles";
import { isRejectedWebsiteHost } from "./discovery/wikidataOfficial";
import { discoverCuratedReliveRemaps } from "./reliveWatch";
import { applySetSourceRemaps } from "./sourceRemaps";
import { ensureCuratedLabels } from "./curatedLabels";
import { ensureVenueCalendarNights } from "./discovery/venueCalendars";

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
  const labels = await ensureCuratedLabels(prisma);
  n += labels.created + labels.updated;

  const keinemusik = await prisma.label.findUnique({
    where: { slug: "keinemusik" },
  });
  if (keinemusik) {
    await prisma.label.update({
      where: { id: keinemusik.id },
      data: {
        website: keinemusik.website || "https://keinemusik.com/",
        soundcloud:
          keinemusik.soundcloud || "https://soundcloud.com/keinemusik",
        instagram:
          keinemusik.instagram || "https://instagram.com/keinemusikcrue",
      },
    });
    n += 1;
  }

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

  const trackIds = await applyTrackIdPins(prisma);
  n += trackIds.beatport + trackIds.isrc;
  if (trackIds.beatport || trackIds.isrc) {
    console.log(
      `[verify-urls] track id pins matched=${trackIds.matched} beatport=${trackIds.beatport} isrc=${trackIds.isrc}`,
    );
  }

  // Operator: therealdjbdk.com is a casino / click-through, not BDK.
  const rejectedSites = await prisma.dj.findMany({
    where: { website: { not: null } },
    select: { id: true, website: true },
  });
  for (const row of rejectedSites) {
    if (!row.website || !isRejectedWebsiteHost(row.website)) continue;
    await prisma.dj.update({
      where: { id: row.id },
      data: { website: null },
    });
    n += 1;
    console.log(`[verify-urls] cleared rejected website ${row.website}`);
  }

  // Retired Tomorrowland Relive (private Fisher WE2 → public re-upload).
  const discovered = await discoverCuratedReliveRemaps(prisma);
  const remaps = await applySetSourceRemaps(prisma, discovered);
  n += remaps;
  if (remaps) {
    console.log(`[verify-urls] set source remaps: ${remaps}`);
  }

  // Walker & Royce etc. — fold false b2b half-name Dj rows onto the duo.
  const atomic = await mergeSplitAtomicActs(prisma);
  n += atomic.setsRelinked + atomic.junkRemoved;
  if (atomic.setsRelinked || atomic.junkRemoved) {
    console.log(
      `[verify-urls] atomic duos relinked=${atomic.setsRelinked} junkRemoved=${atomic.junkRemoved}`,
    );
  }

  // Set-title accidents ("Odd Mob at Seismic…", "Dom Dolla // …", mega-mixes).
  const setTitle = await mergeSetTitleDjs(prisma);
  n +=
    setTitle.setsRelinked +
    setTitle.junkRemoved +
    setTitle.brandHostsStripped;
  if (
    setTitle.setsRelinked ||
    setTitle.junkRemoved ||
    setTitle.ensured ||
    setTitle.brandHostsStripped
  ) {
    console.log(
      `[verify-urls] set-title DJs scanned=${setTitle.scanned} relinked=${setTitle.setsRelinked} removed=${setTitle.junkRemoved} ensured=${setTitle.ensured} brandHosts=${setTitle.brandHostsStripped}`,
    );
  }

  const review = await applyProducerDjReview(prisma);
  n += review.rematched + review.dropped + review.pinned;
  if (review.rematched || review.dropped || review.pinned) {
    console.log(
      `[verify-urls] producer review rematched=${review.rematched} dropped=${review.dropped} pinned=${review.pinned}`,
    );
  }

  const films = await attachInferredFilmSeries(prisma);
  n += films;
  if (films) {
    console.log(`[verify-urls] film series attached=${films}`);
  }

  const junk = await resolveJunkDjs(prisma);
  n += junk.setsDeleted + junk.setsMoved + junk.djsRemoved;
  if (junk.scanned) {
    console.log(
      `[verify-urls] junk DJs scanned=${junk.scanned} deletedSets=${junk.setsDeleted} moved=${junk.setsMoved} removed=${junk.djsRemoved} events=${junk.eventsEnsured}`,
    );
  }

  const low = await resolveLowSignalDjs(prisma);
  n += low.setsDeleted + low.djsRemoved;
  if (low.scanned) {
    console.log(
      `[verify-urls] low-signal DJs scanned=${low.scanned} deletedSets=${low.setsDeleted} removed=${low.djsRemoved}`,
    );
  }

  // hearthis.at is tracklist provenance — never leave its app embed as audio.
  const htPlayback = await prisma.set.updateMany({
    where: { playbackUrl: { contains: "hearthis.at" } },
    data: { playbackUrl: null },
  });
  n += htPlayback.count;
  if (htPlayback.count) {
    console.log(
      `[verify-urls] cleared hearthis playbackUrl rows=${htPlayback.count}`,
    );
  }

  // Insomniac mixes: replace chrome YouTube trailers with Mixcloud/SC; fix crawl dates.
  const mixRepair = await repairInsomniacMixPlayback(prisma);
  n += mixRepair.playbackFixed + mixRepair.dateFixed;
  if (mixRepair.playbackFixed || mixRepair.dateFixed) {
    console.log(
      `[verify-urls] insomniac mixes scanned=${mixRepair.scanned} playback=${mixRepair.playbackFixed} dates=${mixRepair.dateFixed}`,
    );
  }

  // Link festival sets to curated EventEdition windows (TML / Ultra / EDC).
  try {
    const editions = await backfillSetEditions(prisma);
    n += editions;
    if (editions) {
      console.log(`[verify-urls] set editions linked: ${editions}`);
    }
  } catch (err) {
    console.warn(
      "[verify-urls] set editions:",
      err instanceof Error ? err.message : err,
    );
  }

  // Printed night (title / curated 1001 URL) — not ingest time.
  try {
    const nights = await backfillPerformedAt(prisma);
    n += nights;
    if (nights) {
      console.log(`[verify-urls] performedAt filled: ${nights}`);
    }
  } catch (err) {
    console.warn(
      "[verify-urls] performedAt:",
      err instanceof Error ? err.message : err,
    );
  }

  // Force curated DJ logos (Gentlemen's Groove, …) over broken hearthis covers.
  const curatedDjs = await applyCuratedDjImages(prisma);
  n += curatedDjs.djs + curatedDjs.sets + curatedDjs.merged;

  // Curated venue / festival share images (Ultra, EDC, Tomorrowland, …).
  n += await applyCuratedEventImages(prisma);

  // Habit: every Pages / verify pass fills remaining club & festival thumbs
  // from official OG, then Wikipedia, then latest set art. Null-only.
  try {
    const eventThumbs = await fillEventImages(prisma, {
      delayMs: Number(process.env.EVENT_THUMBS_DELAY_MS ?? 60),
    });
    n += eventThumbs.filled;
    if (eventThumbs.filled || eventThumbs.missed) {
      console.log(
        `[verify-urls] event thumbs filled=${eventThumbs.filled} og=${eventThumbs.og} wiki=${eventThumbs.wiki} missed=${eventThumbs.missed}`,
      );
    }
  } catch (err) {
    console.warn(
      "[verify-urls] event thumbs:",
      err instanceof Error ? err.message : err,
    );
  }

  // Meantime set covers when the official YouTube still is gone.
  n += await applyCuratedSetImages(prisma);

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
          ...curatedEventSocialPatch(ev),
        },
      });
      n += 1;
      continue;
    }
    await prisma.event.update({
      where: { id: existing.id },
      data: {
        ...curatedEventSocialPatch(ev),
        location: existing.location ?? ev.location ?? null,
      },
    });
    n += 1;
  }

  // Drop lineup-artist socials scraped onto Event rows (Street Parade ← Adam Beyer, …).
  const artistKeys = await loadArtistSocialKeys(prisma);
  const eventRows = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      soundcloud: true,
      instagram: true,
      twitter: true,
    },
  });
  for (const e of eventRows) {
    const patch = eventSocialCleanupPatch(
      e,
      artistKeys,
      KNOWN_EVENTS[e.slug],
    );
    if (Object.keys(patch).length === 0) continue;
    await prisma.event.update({ where: { id: e.id }, data: patch });
    n += 1;
  }

  const entities = await applyEntityCompletePins(prisma);
  n += entities.filled;
  if (entities.filled) {
    console.log(
      `[verify-urls] entity complete pins matched=${entities.matched} filled=${entities.filled}`,
    );
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
  // Also drops handle-less / set-less lineup stubs so /djs stays browseable.
  const ensured = await ensureDiscoveredDjs(prisma);
  n += ensured.created + ensured.updated + ensured.purged;
  n += await fillDjHandlesFromKnown(prisma);
  if (process.env.VERIFY_URLS_CURATED_ONLY !== "1") {
    n += await fillDjWebsitesFromWikidata(prisma, { limit: 20 });
  }

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
  const nights = await ensureVenueCalendarNights(prisma);
  n += nights.created + nights.updated;

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
      beatport: true,
    },
  });
  for (const d of djs) {
    await scrubField(prisma, "dj", d.id, "soundcloud", d.soundcloud, stats);
    await scrubField(prisma, "dj", d.id, "youtube", d.youtube, stats);
    await scrubField(prisma, "dj", d.id, "instagram", d.instagram, stats);
    await scrubField(prisma, "dj", d.id, "twitter", d.twitter, stats);
    await scrubField(prisma, "dj", d.id, "website", d.website, stats);
    await scrubField(prisma, "dj", d.id, "beatport", d.beatport, stats);
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
