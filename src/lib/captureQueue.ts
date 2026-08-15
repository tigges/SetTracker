/**
 * Live /capture-1001 queue from the catalog DB (Pages build time).
 */
import { prisma } from "@/lib/db";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import { isFestivalSeasonSet } from "@/lib/ingest/festivalDrops";
import {
  buildCaptureQueueFromNeeds,
  type CaptureNeedRow,
  type CapturePreset,
  isStrongIdentifiedPlay,
  watchUrlForSlug,
} from "@/lib/ingest/nextCaptures";
import { curated1001UrlBySourceSlug } from "@/lib/ingest/youtube/videos";
import { assessSetDensity } from "@/lib/setDensity";

export type CaptureQueue = {
  generatedAt: string;
  presets: CapturePreset[];
};

export async function getCaptureQueue(
  limit = 20,
  extra: CapturePreset[] = [],
): Promise<CaptureQueue> {
  const top100 = loadDjMagTop100RankBySlug();
  const known1001 = curated1001UrlBySourceSlug();
  const nowMs = Date.now();

  const sets = await prisma.set.findMany({
    where: {
      durationSec: { gte: 20 * 60 },
      OR: [{ slug: { startsWith: "yt-" } }, { slug: { startsWith: "sc-" } }],
    },
    select: {
      slug: true,
      title: true,
      type: true,
      publishedAt: true,
      durationSec: true,
      playbackUrl: true,
      event: { select: { slug: true, kind: true } },
      edition: { select: { endsAt: true } },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true, name: true } } },
      },
      plays: { select: { provenance: true, idStatus: true } },
    },
  });

  const rows: CaptureNeedRow[] = sets.map((s) => {
    const playCount = s.plays.length;
    const plays1001 = s.plays.filter((p) => p.provenance === "1001tl").length;
    const identifiedStrong = s.plays.filter(isStrongIdentifiedPlay).length;
    const primary = s.artists[0]?.dj;
    const isFestival = s.type === "festival" || s.event?.kind === "festival";
    return {
      slug: s.slug,
      title: s.title,
      primaryDj: primary?.name || s.title,
      primaryDjSlug: primary?.slug,
      type: s.type,
      eventSlug: s.event?.slug,
      publishedAt: s.publishedAt,
      durationSec: s.durationSec,
      playCount,
      plays1001,
      identifiedStrong,
      top100Rank: primary?.slug ? (top100.get(primary.slug) ?? null) : null,
      isFestival,
      festivalSeason: isFestivalSeasonSet(
        {
          eventSlug: s.event?.slug,
          editionEndsAt: s.edition?.endsAt ?? null,
          publishedAt: s.publishedAt,
          type: s.type,
        },
        45,
        nowMs,
      ),
      density: assessSetDensity({
        durationSec: s.durationSec,
        playCount,
      }).severity,
      watchUrl: watchUrlForSlug(s.slug, s.playbackUrl),
      tracklistUrl: known1001[s.slug],
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    presets: buildCaptureQueueFromNeeds(rows, { limit, extra, nowMs }),
  };
}
