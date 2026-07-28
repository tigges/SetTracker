/**
 * For catalog DJs that have a SoundCloud profile but still miss YouTube (or
 * other socials), scrape the SC bio / website field and fill-null Dj socials.
 *
 * Catches plain-text patterns like `YouTube: @handle` that are not HTML links.
 */

import type { PrismaClient } from "@prisma/client";
import { youtubeChannelUrl } from "../../social";
import { sleep } from "../soundcloud/client";
import {
  extractYoutubeChannelIdFromUrl,
  extractYoutubeHandleFromUrl,
  extractYoutubeVanityFromUrl,
  resolveYoutubeHandle,
} from "../youtube/client";
import { expandAllLinkHubs } from "./linkHubs";
import { fetchSoundcloudProfileLinks } from "./scProfileLinks";
import { buildSocialMatrix } from "./socialMatrix";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";

export type CatalogScSocialStats = {
  scanned: number;
  profileHits: number;
  djsUpdated: number;
  youtubeFilled: number;
  promoted: number;
};

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

async function resolveYoutubeFromLinks(links: string[]): Promise<string | null> {
  for (const l of links) {
    const h = extractYoutubeHandleFromUrl(l);
    if (h) return h;
  }
  for (const l of links) {
    const channelId = extractYoutubeChannelIdFromUrl(l);
    const vanity = extractYoutubeVanityFromUrl(l);
    const target = channelId || vanity;
    if (!target) continue;
    try {
      const h = await resolveYoutubeHandle(target);
      await sleep(120);
      if (h) return h;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Scan catalog DJs with SoundCloud that still miss YouTube / other socials.
 * Env: CATALOG_SC_SOCIALS_LIMIT (default 40), CATALOG_SC_SOCIALS=0 to skip.
 */
export async function runCatalogScSocials(
  prisma: PrismaClient,
): Promise<CatalogScSocialStats> {
  const stats: CatalogScSocialStats = {
    scanned: 0,
    profileHits: 0,
    djsUpdated: 0,
    youtubeFilled: 0,
    promoted: 0,
  };

  if (process.env.CATALOG_SC_SOCIALS === "0") {
    console.log("[catalog-sc-socials] skipped (CATALOG_SC_SOCIALS=0)");
    return stats;
  }

  const limit = Math.max(
    1,
    Number(process.env.CATALOG_SC_SOCIALS_LIMIT || 40),
  );

  const djs = await prisma.dj.findMany({
    where: {
      soundcloud: { not: null },
      OR: [
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
    },
    take: limit * 3,
  });

  const file = loadCandidates();
  let touched = 0;

  for (const dj of djs) {
    if (touched >= limit) break;
    const permalink = extractSoundcloudPermalink(dj.soundcloud || "");
    if (!permalink) continue;

    stats.scanned += 1;
    touched += 1;

    let discovered: string[] = [];
    try {
      discovered = await fetchSoundcloudProfileLinks(permalink);
      await sleep(120);
    } catch (err) {
      console.warn(
        `[catalog-sc-socials] profile failed ${permalink}:`,
        err instanceof Error ? err.message : err,
      );
      continue;
    }
    if (discovered.length) stats.profileHits += 1;

    const uniq = await expandAllLinkHubs(discovered);
    let ytHandle =
      (!dj.youtube ? await resolveYoutubeFromLinks(uniq) : null) || null;

    const matrix = buildSocialMatrix({
      youtubeHandle: ytHandle,
      soundcloudPermalink: permalink,
      website: dj.website,
      links: uniq,
    });

    if (!ytHandle && matrix.youtube) {
      ytHandle = extractYoutubeHandleFromUrl(matrix.youtube);
    }

    const data: {
      youtube?: string;
      instagram?: string;
      twitter?: string;
      website?: string;
    } = {};

    if (!dj.youtube) {
      const yt =
        (ytHandle ? youtubeChannelUrl(ytHandle) : null) ||
        (matrix.youtube ? youtubeChannelUrl(matrix.youtube) : null);
      if (yt) {
        data.youtube = yt;
        stats.youtubeFilled += 1;
      }
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
        `[catalog-sc-socials] ${dj.slug} +${Object.keys(data).join(",")}` +
          (ytHandle ? ` via ${ytHandle}` : ""),
      );
    }

    if (ytHandle || permalink) {
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
            detail: "catalog sc profile description socials",
            weight: 30,
          },
          ...(ytHandle
            ? [
                {
                  kind: "manual" as const,
                  detail: `yt:${ytHandle}`,
                  weight: 10,
                },
              ]
            : []),
          {
            kind: "manual" as const,
            detail: `sc:${permalink}`,
            weight: 10,
          },
        ],
        youtubeHandle: ytHandle || undefined,
        soundcloudPermalink: permalink,
      });
      if (!before || before.status !== "promoted") stats.promoted += 1;
    }
  }

  saveCandidates(file);
  console.log(
    `[catalog-sc-socials] scanned=${stats.scanned} updated=${stats.djsUpdated} ` +
      `ytFilled=${stats.youtubeFilled} profileHits=${stats.profileHits} ` +
      `promoted=${stats.promoted}`,
  );
  return stats;
}
