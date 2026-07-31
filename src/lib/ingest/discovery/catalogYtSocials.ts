/**
 * For catalog DJs that already have a YouTube set, scrape the uploading
 * channel's About (+ description "Connect with…" links) and fill-null socials
 * on Dj. Promotes SC/YT handles into artist-candidates for the next crawl.
 *
 * Skips known venue / festival channels (Boiler Room, Tomorrowland, …) unless
 * the channel title/handle roughly matches the DJ name (artist-owned upload).
 */

import type { PrismaClient } from "@prisma/client";
import { youtubeChannelUrl } from "../../social";
import { expandAllLinkHubs } from "./linkHubs";
import { buildSocialMatrix } from "./socialMatrix";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";
import { sleep } from "../soundcloud/client";
import {
  extractSocialLinksFromText,
  extractVideoId,
  fetchChannelSocialLinks,
  fetchWatchMeta,
  resolveYoutubeHandle,
} from "../youtube/client";
import { YOUTUBE_VENUES } from "../youtube/venues";

export type CatalogYtSocialStats = {
  scanned: number;
  skippedVenue: number;
  skippedNoChannel: number;
  aboutHits: number;
  djsUpdated: number;
  promoted: number;
};

const EXTRA_VENUE_HANDLES = [
  "@umftv",
  "@ultramusicfestival",
  "@parookaville",
  "@edc_lasvegas",
  "@edclv",
  "@awakenings",
  "@creamfields",
  "@mysteryland",
  "@untold",
  "@untoldfestival",
  "@defqon1",
  "@electriclove",
  "@electric_zoo",
  "@coachella",
  "@bbc",
  "@bbcradio1",
  "@nme",
  "@rollingstone",
];

function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[øØ]/g, "o")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

/** Venue / media channels we must not treat as the DJ's own profile. */
export function venueYoutubeHandles(): Set<string> {
  const out = new Set<string>();
  for (const v of YOUTUBE_VENUES) {
    const h = v.channel.trim();
    if (h.startsWith("@")) out.add(h.toLowerCase());
    else {
      const m = h.match(/@([\w.-]+)/);
      if (m) out.add(`@${m[1].toLowerCase()}`);
    }
  }
  for (const h of EXTRA_VENUE_HANDLES) out.add(h.toLowerCase());
  return out;
}

/**
 * True when the upload channel looks artist-owned (name/handle ≈ DJ),
 * not a festival/media brand hosting the set.
 */
export function isArtistOwnedChannel(opts: {
  djName: string;
  djSlug: string;
  channelName: string;
  channelHandle: string | null;
}): boolean {
  const venues = venueYoutubeHandles();
  const handle = opts.channelHandle?.toLowerCase() || null;
  if (handle && venues.has(handle)) return false;

  const dj = normName(opts.djName);
  const slug = normName(opts.djSlug.replace(/-/g, ""));
  const ch = normName(opts.channelName);
  if (!dj || !ch) return false;

  if (ch === dj || ch.includes(dj) || dj.includes(ch)) return true;
  if (slug && (ch === slug || ch.includes(slug) || slug.includes(ch))) {
    return true;
  }
  if (handle) {
    const h = normName(handle.replace(/^@/, ""));
    if (h && (h === dj || h === slug || dj.includes(h) || h.includes(dj))) {
      return true;
    }
  }
  return false;
}

function extractSoundcloudPermalink(url: string): string | null {
  const m = url.match(/soundcloud\.com\/([A-Za-z0-9_-]+)/i);
  if (!m) return null;
  const p = m[1].toLowerCase();
  if (["you", "discover", "pages", "sets", "search", "tracks"].includes(p)) {
    return null;
  }
  return m[1];
}

function absSocial(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/\//, "")}`;
}

/**
 * Scan catalog DJs with YouTube sets that still miss social fields.
 * Env: CATALOG_YT_SOCIALS_LIMIT (default 20), CATALOG_YT_SOCIALS=0 to skip.
 */
export async function runCatalogYtSocials(
  prisma: PrismaClient,
): Promise<CatalogYtSocialStats> {
  const stats: CatalogYtSocialStats = {
    scanned: 0,
    skippedVenue: 0,
    skippedNoChannel: 0,
    aboutHits: 0,
    djsUpdated: 0,
    promoted: 0,
  };

  if (process.env.CATALOG_YT_SOCIALS === "0") {
    console.log("[catalog-yt-socials] skipped (CATALOG_YT_SOCIALS=0)");
    return stats;
  }

  const limit = Math.max(
    1,
    Number(process.env.CATALOG_YT_SOCIALS_LIMIT || 20),
  );

  const djs = await prisma.dj.findMany({
    where: {
      sets: { some: { set: { sourceUrl: { contains: "youtube.com" } } } },
      OR: [
        { soundcloud: null },
        { youtube: null },
        { instagram: null },
        { twitter: null },
        { website: null },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      soundcloud: true,
      youtube: true,
      instagram: true,
      twitter: true,
      website: true,
      sets: {
        where: { set: { sourceUrl: { contains: "youtube.com" } } },
        take: 8,
        select: {
          set: {
            select: { sourceUrl: true, title: true, publishedAt: true },
          },
        },
      },
    },
    take: limit * 3,
  });

  const file = loadCandidates();
  let touched = 0;

  for (const dj of djs) {
    if (touched >= limit) break;
    stats.scanned += 1;

    const ytSets = [...dj.sets]
      .map((sa) => sa.set)
      .filter((s) => s.sourceUrl)
      .sort(
        (a, b) =>
          (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
      )
      .slice(0, 3);

    let meta: Awaited<ReturnType<typeof fetchWatchMeta>> | null = null;
    for (const set of ytSets) {
      const vid = extractVideoId(set.sourceUrl || "");
      if (!vid) continue;
      try {
        meta = await fetchWatchMeta(vid);
        await sleep(120);
        if (meta.channelId || meta.channelHandle || meta.channel) break;
      } catch (err) {
        console.warn(
          `[catalog-yt-socials] watch meta failed ${vid}:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
    if (!meta) {
      stats.skippedNoChannel += 1;
      continue;
    }

    let handle = meta.channelHandle;
    if (!handle && meta.channelId) {
      try {
        handle = await resolveYoutubeHandle(meta.channelId);
        await sleep(120);
      } catch {
        /* ignore */
      }
    }

    if (
      !isArtistOwnedChannel({
        djName: dj.name,
        djSlug: dj.slug,
        channelName: meta.channel,
        channelHandle: handle,
      })
    ) {
      stats.skippedVenue += 1;
      continue;
    }

    touched += 1;
    const discovered: string[] = [
      ...extractSocialLinksFromText(meta.description),
    ];

    if (handle) {
      try {
        const about = await fetchChannelSocialLinks(handle);
        await sleep(150);
        for (const l of about) discovered.push(l);
        if (about.length) stats.aboutHits += 1;
      } catch {
        /* ignore */
      }
    }

    const uniq = await expandAllLinkHubs(discovered);
    const matrix = buildSocialMatrix({
      youtubeHandle: handle,
      soundcloudPermalink: dj.soundcloud
        ? extractSoundcloudPermalink(dj.soundcloud)
        : null,
      website: dj.website,
      links: uniq,
    });

    const data: {
      soundcloud?: string;
      youtube?: string;
      instagram?: string;
      twitter?: string;
      website?: string;
    } = {};
    if (!dj.soundcloud && matrix.soundcloud) {
      data.soundcloud = absSocial(matrix.soundcloud);
    }
    // Prefer the uploading artist channel; else any YT channel URL found in
    // the description / About ("YouTube: @x", bare youtube.com/@x, …).
    if (!dj.youtube) {
      const yt =
        (handle ? youtubeChannelUrl(handle) : null) ||
        (matrix.youtube ? youtubeChannelUrl(matrix.youtube) : null);
      if (yt) data.youtube = yt;
    }
    if (!dj.instagram && matrix.instagram) {
      data.instagram = absSocial(matrix.instagram);
    }
    if (!dj.twitter && matrix.x) {
      data.twitter = absSocial(matrix.x);
    }
    if (!dj.website && matrix.website) {
      data.website = absSocial(matrix.website);
    }

    if (Object.keys(data).length) {
      await prisma.dj.update({ where: { id: dj.id }, data });
      stats.djsUpdated += 1;
      console.log(
        `[catalog-yt-socials] ${dj.slug} +${Object.keys(data).join(",")}` +
          (handle ? ` via ${handle}` : ""),
      );
    }

    const scPermalink =
      extractSoundcloudPermalink(data.soundcloud || dj.soundcloud || "") ||
      extractSoundcloudPermalink(matrix.soundcloud) ||
      null;

    if (handle || scPermalink) {
      const before = file.candidates.find((c) => c.slug === dj.slug);
      upsertCandidate(file, {
        name: dj.name,
        slug: dj.slug,
        score: 48,
        status: "promoted",
        promotedAt: new Date().toISOString(),
        evidence: [
          {
            kind: "manual",
            detail: "catalog yt about/description socials",
            weight: 30,
          },
          ...(handle
            ? [
                {
                  kind: "manual" as const,
                  detail: `yt:${handle}`,
                  weight: 10,
                },
              ]
            : []),
          ...(scPermalink
            ? [
                {
                  kind: "manual" as const,
                  detail: `sc:${scPermalink}`,
                  weight: 10,
                },
              ]
            : []),
        ],
        youtubeHandle: handle || undefined,
        soundcloudPermalink: scPermalink || undefined,
      });
      if (!before || before.status !== "promoted") stats.promoted += 1;
    }
  }

  saveCandidates(file);
  console.log(
    `[catalog-yt-socials] scanned=${stats.scanned} updated=${stats.djsUpdated} ` +
      `about=${stats.aboutHits} promoted=${stats.promoted} ` +
      `venueSkip=${stats.skippedVenue} noChannel=${stats.skippedNoChannel}`,
  );
  return stats;
}
