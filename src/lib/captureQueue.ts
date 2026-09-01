/**
 * Live /stats#capture-1001 queue from the catalog DB (Pages build time).
 */
import { prisma } from "@/lib/db";
import { isLiveVenueSet, isLivestreamSet } from "@/lib/setType";
import { loadDjMagFestivalRankBySlug } from "@/lib/djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import {
  editionGapEventSlugs,
  isFestivalSeasonSet,
} from "@/lib/ingest/festivalDrops";
import {
  CAPTURE_QUEUE_LIMIT,
  CAPTURE_QUEUE_RESERVE,
  buildCaptureQueueFromNeeds,
  extrasFromCaptureSnapshot,
  extrasFromHeldReliveWatch,
  type CaptureNeedRow,
  type CapturePreset,
  isStrongIdentifiedPlay,
  watchUrlForSlug,
} from "@/lib/ingest/nextCaptures";
import { curated1001UrlBySourceSlug } from "@/lib/ingest/youtube/videos";
import { activeDeferSlugs } from "@/lib/ingest/captureDefer";
import { assessSetDensity } from "@/lib/setDensity";
import nextCaptures from "../../data/crosscheck/next-captures.json";
import captureDefer from "../../data/capture-defer.json";

export type CaptureQueue = {
  generatedAt: string;
  presets: CapturePreset[];
};

export async function getCaptureQueue(
  limit = CAPTURE_QUEUE_LIMIT,
  extra: CapturePreset[] = [],
): Promise<CaptureQueue> {
  const top100 = loadDjMagTop100RankBySlug();
  const festivalRank = loadDjMagFestivalRankBySlug();
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
      performedAt: true,
      durationSec: true,
      playbackUrl: true,
      event: { select: { slug: true, kind: true, name: true } },
      edition: { select: { startsAt: true, endsAt: true, year: true } },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true, name: true } } },
      },
      plays: { select: { provenance: true, idStatus: true } },
    },
  });

  const gapEvents = editionGapEventSlugs(
    sets.map((s) => ({
      eventSlug: s.event?.slug,
      publishedAt: s.publishedAt,
      trackCount: s.plays.length,
      durationSec: s.durationSec,
    })),
    nowMs,
  );

  const rows: CaptureNeedRow[] = sets.map((s) => {
    const playCount = s.plays.length;
    const plays1001 = s.plays.filter(
      (p) =>
        p.provenance === "1001tl" ||
        p.provenance === "mixesdb" ||
        p.provenance === "applemusic",
    ).length;
    const identifiedStrong = s.plays.filter(isStrongIdentifiedPlay).length;
    const primary = s.artists[0]?.dj;
    const liveSignals = {
      type: s.type,
      eventKind: s.event?.kind,
      title: s.title,
    };
    const isFestival = isLiveVenueSet(liveSignals);
    const isLivestream = isLivestreamSet(liveSignals);
    return {
      slug: s.slug,
      title: s.title,
      primaryDj: primary?.name || s.title,
      primaryDjSlug: primary?.slug,
      type: s.type,
      eventSlug: s.event?.slug,
      eventName: s.event?.name,
      publishedAt: s.publishedAt,
      performedAt: s.performedAt,
      editionYear: s.edition?.year ?? null,
      durationSec: s.durationSec,
      playCount,
      plays1001,
      identifiedStrong,
      top100Rank: primary?.slug ? (top100.get(primary.slug) ?? null) : null,
      eventRank: s.event?.slug ? (festivalRank.get(s.event.slug) ?? null) : null,
      isFestival,
      isLivestream,
      editionGap: Boolean(s.event?.slug && gapEvents.has(s.event.slug)),
      festivalSeason: isFestivalSeasonSet(
        {
          eventSlug: s.event?.slug,
          editionStartsAt: s.edition?.startsAt ?? null,
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
        type: s.type,
      }).severity,
      watchUrl: watchUrlForSlug(s.slug, s.playbackUrl),
      tracklistUrl: known1001[s.slug],
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    presets: buildCaptureQueueFromNeeds(rows, {
      limit,
      extra,
      nowMs,
      deferred: activeDeferSlugs(captureDefer, nowMs),
    }),
  };
}

/**
 * Stats workbench: live catalog rank, else official-playback extras / committed
 * snapshot.
 *
 * Builds CAPTURE_QUEUE_RESERVE rows past the display limit. The page is a static
 * export, so a row parked in the browser cannot ask the server for a
 * replacement — the spares have to already be in the HTML.
 */
export async function loadOperatorCaptureQueue(
  limit = CAPTURE_QUEUE_LIMIT + CAPTURE_QUEUE_RESERVE,
): Promise<CaptureQueue> {
  const extras = [
    ...extrasFromHeldReliveWatch(),
    ...extrasFromCaptureSnapshot(
      nextCaptures as { presets?: CapturePreset[] },
    ),
  ];
  const presets: CapturePreset[] = extras.slice(0, limit);
  const generatedAt = String(nextCaptures.generatedAt ?? "");
  try {
    const queue = await getCaptureQueue(limit, extras);
    if (queue.presets.length) return queue;
  } catch {
    /* no catalog DB — keep playback extras / committed snapshot */
  }
  return { generatedAt, presets };
}
