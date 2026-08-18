import { ATLAS_DJ_YEAR, ATLAS_YEAR, loadAtlasVenues } from "@/lib/atlas/seed";
import { getDjList } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import { resolveFeedRanks } from "@/lib/feedPriorityResolve";
import { STATUS_META, STATUS_ORDER, type IdStatus } from "@/lib/status";
import { isVenueListed } from "@/lib/venueBrowse";
import {
  summarizeDjHealth,
  summarizePlaceHealth,
  summarizeSetHealth,
  type HealthSlice,
  type PlaceHealthInput,
} from "@/lib/statsHealth";

export type HealthAction = {
  href: string;
  label: string;
  count: number;
};

export type CueMixRow = {
  key: string;
  label: string;
  count: number;
  color: string;
};

export type StatsHealth = {
  chartNote: string;
  djs: {
    stored: number;
    total: number;
    onChart: number;
    slices: HealthSlice[];
    actions: HealthAction[];
  };
  festivals: {
    total: number;
    onChart: number;
    slices: HealthSlice[];
    actions: HealthAction[];
    gaps: Array<{ slug: string; name: string; onChart: boolean }>;
  };
  clubs: {
    total: number;
    onChart: number;
    slices: HealthSlice[];
    actions: HealthAction[];
    gaps: Array<{ slug: string; name: string; onChart: boolean }>;
  };
  sets: {
    total: number;
    onChart: number;
    slices: HealthSlice[];
    playback: HealthSlice[];
    identified: CueMixRow[];
    identifiedStarGap: number;
    actions: HealthAction[];
  };
  tracks: {
    total: number;
    slices: HealthSlice[];
    actions: HealthAction[];
  };
};

function mergePlaces(
  kind: "festival" | "club",
  catalog: Array<{
    slug: string;
    name: string;
    kind: string | null;
    website: string | null;
    setCount: number;
  }>,
): PlaceHealthInput[] {
  const atlas = loadAtlasVenues().filter((v) => v.kind === kind);
  const bySlug = new Map<string, PlaceHealthInput>();
  for (const e of catalog) {
    if (e.kind !== kind) continue;
    if (!isVenueListed({ setCount: e.setCount, website: e.website })) continue;
    bySlug.set(e.slug, {
      slug: e.slug,
      name: e.name,
      setCount: e.setCount,
      onChart: false,
    });
  }
  for (const v of atlas) {
    const cur = bySlug.get(v.slug);
    if (cur) {
      cur.onChart = true;
      if (!cur.name) cur.name = v.name;
    } else {
      bySlug.set(v.slug, {
        slug: v.slug,
        name: v.name,
        setCount: 0,
        onChart: true,
      });
    }
  }
  return [...bySlug.values()];
}

function placeGaps(places: PlaceHealthInput[]) {
  return places
    .filter((p) => p.setCount < 1)
    .sort((a, b) => Number(b.onChart) - Number(a.onChart) || (a.name ?? a.slug).localeCompare(b.name ?? b.slug))
    .map((p) => ({
      slug: p.slug,
      name: p.name ?? p.slug,
      onChart: p.onChart,
    }));
}

export async function getStatsHealth(): Promise<StatsHealth> {
  const top100 = loadDjMagTop100RankBySlug();
  const [djs, events, sets, playStatus, trackTotal, tracksWithBeatport, tracksNoArt] =
    await Promise.all([
      getDjList(),
      prisma.event.findMany({
        select: {
          slug: true,
          name: true,
          kind: true,
          website: true,
          _count: { select: { sets: true } },
        },
      }),
      prisma.set.findMany({
        select: {
          durationSec: true,
          playbackUrl: true,
          type: true,
          _count: { select: { plays: true } },
          event: { select: { slug: true, kind: true } },
          artists: {
            where: { isPrimary: true },
            take: 1,
            select: { dj: { select: { slug: true } } },
          },
        },
      }),
      prisma.played.groupBy({
        by: ["idStatus"],
        _count: { _all: true },
      }),
      prisma.track.count(),
      prisma.track.count({ where: { beatportUrl: { not: null } } }),
      prisma.track.count({ where: { imageUrl: null } }),
    ]);

  const catalogEvents = events.map((e) => ({
    slug: e.slug,
    name: e.name,
    kind: e.kind,
    website: e.website,
    setCount: e._count.sets,
  }));

  const djBar = summarizeDjHealth(djs, (slug) => top100.has(slug));
  const noHandle = djBar.slices.find((s) => s.key === "no_handle")?.count ?? 0;
  const noArt = djBar.slices.find((s) => s.key === "no_art")?.count ?? 0;

  const festivalRows = mergePlaces("festival", catalogEvents);
  const clubRows = mergePlaces("club", catalogEvents);
  const festivals = summarizePlaceHealth(festivalRows);
  const clubs = summarizePlaceHealth(clubRows);

  const setInputs = sets.map((s) => {
    const ranks = resolveFeedRanks({
      primaryDjSlug: s.artists[0]?.dj.slug,
      eventSlug: s.event?.slug,
      eventKind: s.event?.kind,
      setType: s.type,
      durationSec: s.durationSec,
      trackCount: s._count.plays,
    });
    return {
      durationSec: s.durationSec,
      playCount: s._count.plays,
      playbackUrl: s.playbackUrl,
      top100Rank: ranks.top100Rank,
      festivalRank: ranks.festivalRank,
      clubRank: ranks.clubRank,
    };
  });
  const setBar = summarizeSetHealth(setInputs);

  const statusMap = new Map(playStatus.map((g) => [g.idStatus, g._count._all]));
  const identified: CueMixRow[] = STATUS_ORDER.map((status) => ({
    key: status,
    label: STATUS_META[status as IdStatus].label,
    count: statusMap.get(status) ?? 0,
    color: STATUS_META[status as IdStatus].color,
  }));

  const atlasSlugs = loadAtlasVenues().map((v) => v.slug);
  const identifiedStarGap = await prisma.played.count({
    where: {
      set: {
        OR: [
          {
            artists: {
              some: {
                isPrimary: true,
                dj: { slug: { in: [...top100.keys()] } },
              },
            },
          },
          { event: { slug: { in: atlasSlugs } } },
        ],
      },
      idStatus: { in: ["unresolved_id", "unparsed"] },
    },
  });

  const thin = setBar.slices.find((s) => s.key === "thin")?.count ?? 0;
  const unresolved =
    (statusMap.get("unresolved_id") ?? 0) + (statusMap.get("unparsed") ?? 0);

  return {
    chartNote: `★ current Top 100 · DJs ${ATLAS_DJ_YEAR} · clubs / fests ${ATLAS_YEAR}`,
    djs: {
      stored: djs.length,
      total: djBar.total,
      onChart: djBar.onChart,
      slices: djBar.slices,
      actions: [
        { href: "#dj-handles", label: "Pin handles", count: noHandle },
        { href: "#dj-art", label: "Fill artwork", count: noArt },
      ].filter((a) => a.count > 0),
    },
    festivals: {
      total: festivals.total,
      onChart: festivals.onChart,
      slices: festivals.slices,
      actions: [
        {
          href: "#festivals",
          label: "Link / capture a set",
          count: festivals.slices.find((s) => s.key === "no_set")?.count ?? 0,
        },
      ].filter((a) => a.count > 0),
      gaps: placeGaps(festivalRows),
    },
    clubs: {
      total: clubs.total,
      onChart: clubs.onChart,
      slices: clubs.slices,
      actions: [
        {
          href: "#clubs",
          label: "Link / capture a set",
          count: clubs.slices.find((s) => s.key === "no_set")?.count ?? 0,
        },
      ].filter((a) => a.count > 0),
      gaps: placeGaps(clubRows),
    },
    sets: {
      total: setBar.total,
      onChart: setBar.onChart,
      slices: setBar.slices,
      playback: setBar.playback,
      identified,
      identifiedStarGap,
      actions: [
        { href: "#lists", label: "Fill thin lists", count: thin },
        { href: "#cues", label: "ID cues", count: unresolved },
      ].filter((a) => a.count > 0),
    },
    tracks: {
      total: trackTotal,
      slices: [
        {
          key: "beatport",
          label: "on Beatport",
          count: tracksWithBeatport,
          color: "var(--brand)",
          star: 0,
        },
        {
          key: "other",
          label: "not on Beatport",
          count: Math.max(0, trackTotal - tracksWithBeatport),
          color: "var(--grey)",
          star: 0,
        },
      ],
      actions: [
        { href: "#tracks", label: "Fill artwork", count: tracksNoArt },
        {
          href: "#tracks",
          label: "Beatport / ISRC enrich",
          count: Math.max(0, trackTotal - tracksWithBeatport),
        },
      ].filter((a) => a.count > 0),
    },
  };
}
