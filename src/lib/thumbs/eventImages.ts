/**
 * Venue / festival artwork.
 *
 * Events never went through Deezer — fill from:
 * 1) curated KNOWN_EVENT_IMAGES (stable official share art)
 * 2) official-site / Event.website Open Graph image
 * 3) latest set image already linked to the event
 */

import type { PrismaClient } from "@prisma/client";
import { KNOWN_EVENTS } from "../ingest/events";
import { VENUE_CALENDAR_SOURCES } from "../ingest/discovery/venueCalendars/sources";
import { isWeakOfficialUrl } from "../officialUrls";
import { resolveOgImage } from "./ogImage";
import { resolveWikipediaImage } from "./wikipediaImage";

/** Hand-picked official share images for flagship venues/festivals. */
export const KNOWN_EVENT_IMAGES: Record<string, string> = {
  "ultra-miami":
    "https://ultramusicfestival.com/wp-content/uploads/2025/03/ULTRA_MIAMI_26TH_SHARE-IMAGE-TICKETS-ON-SALE-NOW.jpg",
  "edc-lv":
    "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/sites/21/2026/05/19195123/edclv_2027_mk_te_twoweekend_fest_site_seo_1200x630_r01.jpg",
  tomorrowland:
    "https://www.tomorrowland.com/home/media/GkfYvqthei1CQ_kr_1784285411289_2bf2ab4e-c423-4f42-9573-3eb426e231bb.jpg_0_554559390070347944.jpg?auto=format,compress&w=1200",
  "burning-man":
    "https://burningman.org/wp-content/themes/firebird-master/assets/images/BMP-socialCard-Rawlinson_2024.jpg",
  coachella:
    "https://media.coachella.com/content/seo_images/795/EBn21kXwRGMWDHIFsOpxoc2DgUFFdcZ0IknKjGSS.jpg",
  lollapalooza:
    "https://cdn.prod.website-files.com/67c1632e86f99390b0516ac5/69a72058b2fcf74831ebedf8_LOL26_Open.Graph.png",
  "hard-summer":
    "https://dm3381rcqf07k.cloudfront.net/multisite4/wp-content/uploads/sites/4/2019/01/30162440/tablet.png",
  insomniac:
    "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2017/12/22204323/insomniac.com-social-share.jpg",
  "boiler-room": "https://misc.boilerroom.tv/globe_fallback.jpg",
  fabric:
    "https://cdn.prod.website-files.com/61a73f071afaf5b4541c53a9/61b05c95ff609564706fd9df_red.jpg",
  "hi-ibiza":
    "https://hiibiza.b-cdn.net/assets/47ab92b2-8b20-4bbe-8ccd-b8423c2c1b14--20260425_Hi_Opening_0003_5000x4000px_.jpg",
  berghain: "https://www.berghain.berlin/static/berghain/og-image.jpg",
  bootshaus:
    "https://s3.eu-central-1.amazonaws.com/cdn.pixend.de/CQYDNRZ9Q8QSS8D/page/7473735279880154760691698_8442842038482936781826548.jpeg",
  defected:
    "https://i1.sndcdn.com/avatars-GfSV64ElhmP62JHx-rWi82Q-t500x500.jpg",
  nitsa:
    "https://s3-eu-west-1.amazonaws.com/nitsa.test/social/facebook_web_nitsa.png",
  razzmatazz:
    "https://img.atom.com/story_images/visual_images/logo-image-76469-razzmatazz.jpg?class=show",
  "o-beach-ibiza":
    "https://obeachibiza.com/wp-content/uploads/2018/10/ob-og-image.png",
  unvrs: "https://unvrs.b-cdn.net/images/2025_UNVRS_WEBSITE_2400x1440px.jpg",
  "es-paradis":
    "https://www.esparadis.com/wp-content/uploads/2022/01/LOGO-ES-PARADIS.png",
  eden: "https://www.edenibiza.com/wp-content/uploads/2025/02/cropped-favicon_eden_black.png",
  "club-space":
    "https://static1.squarespace.com/static/699f454ee72b0109a8d7807e/t/69bc77873ef5d72654173a5f/1773959047114/cslogo.jpg?format=1500w",
  /** STEREOHYPE Bucharest live still (channel art often blocked). */
  stereohype: "https://i.ytimg.com/vi/i9cNYaOOdwA/hqdefault.jpg",
  /** Ushuaïa — official experience still used as brand mark. */
  "ushuaia-ibiza":
    "https://i.ytimg.com/vi/rLTCLSsqrXY/hqdefault.jpg",
  /** Cercle — recent channel upload thumb as brand mark. */
  cercle: "https://i.ytimg.com/vi/7bTlKxH3CgI/hqdefault.jpg",
  mixmag: "https://i.ytimg.com/vi/X8s7EKuVtBI/hqdefault.jpg",
  /** DJ Mag Live Sets — recent channel upload thumb as brand mark. */
  "dj-mag": "https://i.ytimg.com/vi/-HyyZo8sXgE/hqdefault.jpg",
  "ministry-of-sound":
    "https://ministryofsound.com/wp-content/uploads/2025/12/home-page-banner-1-1024x582.png",
  dreamstate:
    "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2025/11/26203958/dssc1.jpg",
  "warehouse-project":
    "https://thewarehouseproject.com/wp-content/uploads/2026/05/WHP-2026-ograph-image.jpg",
  "amnesia-ibiza":
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Amnesia_ibiza.jpeg",
  "pacha-ibiza":
    "https://upload.wikimedia.org/wikipedia/en/f/f1/Pacha_Logo_New.png",
  "silo-dallas": "https://silodallas.com/og-image.png",
  "concourse-project":
    "https://concourseproject.com/wp-content/uploads/2026/02/13_1920x900-Crop-1.webp",
  "the-concourse-project":
    "https://concourseproject.com/wp-content/uploads/2026/02/13_1920x900-Crop-1.webp",
  "avalon-hollywood":
    "https://avalonhollywood.com/wp-content/uploads/2024/06/041224_Excision_Avalon_TroyAcevedo_photos-57.jpg",
};

/**
 * Real official sites for OG fetch when Event.website is a listicle
 * (6am / ClubTickets / DJ Mag profile).
 */
export const EVENT_OFFICIAL_SITES: Record<string, string> = {
  berghain: "https://www.berghain.berlin/en/",
  bootshaus: "https://www.bootshaus.tv/",
  fabric: "https://www.fabriclondon.com/",
  "hi-ibiza": "https://www.hiibiza.com/",
  nitsa: "https://www.nitsa.com/",
  razzmatazz: "https://razzmatazz.com/",
  "o-beach-ibiza": "https://www.obeachibiza.com/",
  unvrs: "https://www.unvrs.com/",
  "es-paradis": "https://www.esparadis.com/",
  eden: "https://www.edenibiza.com/",
  "club-space": "https://www.clubspace.com/",
  "ushuaia-ibiza": "https://www.theushuaiaexperience.com/en/club",
  defected: "https://defected.com/",
  "ministry-of-sound": "https://www.ministryofsound.com/",
  "amnesia-ibiza": "https://www.amnesia.es/en/",
  elrow: "https://elrow.com/",
  "pacha-ibiza": "https://www.pacha.com/",
  "cavo-paradiso": "https://www.cavoparadiso.gr/",
  "warehouse-project": "https://thewarehouseproject.com/",
  drumsheds: "https://drumsheds.com/",
  "dc-10": "https://www.dc10ibiza.com/",
  "academy-la": "https://www.academyla.com/",
  "exchange-la": "https://exchangela.com/",
  "silo-dallas": "https://www.silodallas.com/",
  "concourse-project": "https://www.concourseproject.com/",
  "the-concourse-project": "https://www.concourseproject.com/",
  "avalon-hollywood": "https://www.avalonhollywood.com/",
  "rex-club": "https://www.rexclub.com/",
  "sub-club": "https://www.subclub.co.uk/",
  "ultra-miami": "https://ultramusicfestival.com/",
  "edc-lv": "https://lasvegas.edc.com/",
  tomorrowland: "https://www.tomorrowland.com/",
  coachella: "https://www.coachella.com/",
  lollapalooza: "https://www.lollapalooza.com/",
  "hard-summer": "https://hardfest.com/",
  insomniac: "https://www.insomniac.com/",
  "nocturnal-wonderland": "https://nocturnalwonderland.com/",
  "beyond-wonderland": "https://beyondwonderland.com/",
  "escape-halloween": "https://escapepsychocircus.com/",
  dreamstate: "https://socal.dreamstateusa.com/",
  "countdown-nye": "https://countdownnye.com/",
  djoon: "https://djoon.com/",
  "boiler-room": "https://boilerroom.tv/",
  stereohype: "https://www.stereohype.com/",
  cercle: "https://www.cercle.io/",
  mixmag: "https://mixmag.net/",
  "nameless-festival": "https://www.namelessfestival.it/en/",
};

export type EventImageStats = {
  scanned: number;
  filled: number;
  missed: number;
  curated: number;
  og: number;
  wiki: number;
  fromSet: number;
};

const CALENDAR_SITES: Record<string, string> = Object.fromEntries(
  VENUE_CALENDAR_SOURCES.map((s) => [s.venueSlug, s.website]),
);

/** Official pages to scrape for OG — curated maps, calendars, then Event.website. */
export function officialEventPages(
  slug: string,
  website?: string | null,
): string[] {
  const pages = [
    EVENT_OFFICIAL_SITES[slug],
    CALENDAR_SITES[slug],
    KNOWN_EVENTS[slug]?.website,
    website && !isWeakOfficialUrl(website) ? website : null,
  ];
  return [...new Set(pages.filter((u): u is string => Boolean(u)))];
}

export async function fillEventImages(
  prisma: PrismaClient,
  opts?: {
    delayMs?: number;
    sleep?: (ms: number) => Promise<void>;
    resolveOg?: typeof resolveOgImage;
    resolveWiki?: typeof resolveWikipediaImage;
    wikiLimit?: number;
  },
): Promise<EventImageStats> {
  const delay = opts?.delayMs ?? 80;
  const sleep =
    opts?.sleep ??
    ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const resolveOg = opts?.resolveOg ?? resolveOgImage;
  const resolveWiki = opts?.resolveWiki ?? resolveWikipediaImage;
  const wikiLimit = opts?.wikiLimit ?? Number(process.env.EVENT_WIKI_LIMIT ?? 40);

  const stats: EventImageStats = {
    scanned: 0,
    filled: 0,
    missed: 0,
    curated: 0,
    og: 0,
    wiki: 0,
    fromSet: 0,
  };

  const events = await prisma.event.findMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: "" }] },
    select: { id: true, slug: true, name: true, kind: true, website: true },
    orderBy: { name: "asc" },
  });

  let wikiLeft = wikiLimit;
  for (const ev of events) {
    stats.scanned += 1;
    let url: string | null = KNOWN_EVENT_IMAGES[ev.slug] ?? null;
    let source: "curated" | "og" | "wiki" | "set" | null = url ? "curated" : null;

    if (!url) {
      for (const page of officialEventPages(ev.slug, ev.website)) {
        url = await resolveOg(page);
        await sleep(delay);
        if (url) {
          source = "og";
          break;
        }
      }
    }

    if (!url && wikiLeft > 0 && (ev.kind === "club" || ev.kind === "festival")) {
      wikiLeft -= 1;
      url = await resolveWiki(ev.name, ev.kind);
      await sleep(delay);
      if (url) source = "wiki";
    }

    if (!url) {
      const setWithArt = await prisma.set.findFirst({
        where: {
          eventId: ev.id,
          imageUrl: { not: null },
        },
        orderBy: { publishedAt: "desc" },
        select: { imageUrl: true },
      });
      if (setWithArt?.imageUrl) {
        url = setWithArt.imageUrl;
        source = "set";
      }
    }

    if (url) {
      await prisma.event.update({
        where: { id: ev.id },
        data: { imageUrl: url },
      });
      stats.filled += 1;
      if (source === "curated") stats.curated += 1;
      else if (source === "og") stats.og += 1;
      else if (source === "wiki") stats.wiki += 1;
      else if (source === "set") stats.fromSet += 1;
      console.log(`  ✓ event ${ev.slug} (${source})`);
    } else {
      stats.missed += 1;
      console.log(`  · event ${ev.slug} (no image)`);
    }
  }

  return stats;
}

/** Force curated festival images onto matching Event rows. */
export async function applyCuratedEventImages(
  prisma: PrismaClient,
): Promise<number> {
  let n = 0;
  for (const [slug, imageUrl] of Object.entries(KNOWN_EVENT_IMAGES)) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (!existing) continue;
    if (existing.imageUrl === imageUrl) continue;
    await prisma.event.update({
      where: { id: existing.id },
      data: { imageUrl },
    });
    n += 1;
  }
  return n;
}
