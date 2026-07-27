import { getDjList, type DjListItem } from "@/lib/queries";
import { prisma } from "@/lib/db";
import {
  PROVENANCE_META,
  STATUS_META,
  STATUS_ORDER,
  type IdStatus,
  type Provenance,
} from "@/lib/status";

export type NamedCount = { key: string; label: string; count: number };

export type StatsDjRow = {
  id: string;
  slug: string;
  name: string;
  setCount: number;
  playCount: number;
  identifiedPlayCount: number;
  hasHandle: boolean;
  imageUrl: string | null;
};

export type CatalogStats = {
  totals: {
    sets: number;
    djs: number;
    tracks: number;
    labels: number;
    venues: number;
    plays: number;
  };
  sets: {
    withPlays: number;
    empty: number;
    withImage: number;
    withPlayback: number;
    byType: NamedCount[];
    bySource: NamedCount[];
  };
  plays: {
    byStatus: NamedCount[];
    byProvenance: NamedCount[];
  };
  tracks: {
    withImage: number;
    withBeatport: number;
    withBpm: number;
  };
  djs: {
    browseReady: number;
    withHandle: number;
    noHandle: number;
    withSets: number;
    noSets: number;
    emptyTracklists: number;
    noThumb: number;
    junk: number;
    /** Has sets but no social/web handle — highest-value pin work. */
    missingHandleWithSets: StatsDjRow[];
    /** Handle present, zero linked sets. */
    handleNoSets: StatsDjRow[];
    /** Sets exist but timeline is empty. */
    emptySetProfiles: StatsDjRow[];
    /** No artwork, non-junk, has at least one set. */
    noThumbWithSets: StatsDjRow[];
    junkNames: StatsDjRow[];
  };
  emptySets: Array<{
    id: string;
    slug: string;
    title: string;
    sourceName: string | null;
    type: string;
  }>;
};

function toStatsRow(d: DjListItem): StatsDjRow {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    setCount: d.setCount,
    playCount: d.playCount,
    identifiedPlayCount: d.identifiedPlayCount,
    hasHandle: d.hasHandle,
    imageUrl: d.imageUrl,
  };
}

function sortBySetsThenName(a: StatsDjRow, b: StatsDjRow): number {
  if (b.setCount !== a.setCount) return b.setCount - a.setCount;
  return a.name.localeCompare(b.name);
}

function namedFromGroup(
  rows: Array<{ key: string | null; count: number }>,
  labelFor: (key: string) => string,
): NamedCount[] {
  return rows
    .filter((r) => r.key)
    .map((r) => ({
      key: r.key!,
      label: labelFor(r.key!),
      count: r.count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Build-time catalog health snapshot for the public /stats page. */
export async function getCatalogStats(): Promise<CatalogStats> {
  const [
    djs,
    setCount,
    trackCount,
    labelCount,
    venueCount,
    playCount,
    setsWithPlays,
    setsWithImage,
    setsWithPlayback,
    tracksWithImage,
    tracksWithBeatport,
    tracksWithBpm,
    setTypeGroups,
    setSourceGroups,
    playStatusGroups,
    playProvGroups,
    emptySetRows,
  ] = await Promise.all([
    getDjList(),
    prisma.set.count(),
    prisma.track.count(),
    prisma.label.count(),
    prisma.event.count(),
    prisma.played.count(),
    prisma.set.count({ where: { plays: { some: {} } } }),
    prisma.set.count({ where: { imageUrl: { not: null } } }),
    prisma.set.count({ where: { playbackUrl: { not: null } } }),
    prisma.track.count({ where: { imageUrl: { not: null } } }),
    prisma.track.count({ where: { beatportUrl: { not: null } } }),
    prisma.track.count({ where: { bpm: { not: null } } }),
    prisma.set.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.set.groupBy({
      by: ["sourceName"],
      _count: { _all: true },
    }),
    prisma.played.groupBy({
      by: ["idStatus"],
      _count: { _all: true },
    }),
    prisma.played.groupBy({
      by: ["provenance"],
      _count: { _all: true },
    }),
    prisma.set.findMany({
      where: { plays: { none: {} } },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: {
        id: true,
        slug: true,
        title: true,
        sourceName: true,
        type: true,
      },
    }),
  ]);

  const nonJunk = djs.filter((d) => !d.isJunk);
  const missingHandleWithSets = nonJunk
    .filter((d) => !d.hasHandle && d.setCount > 0)
    .map(toStatsRow)
    .sort(sortBySetsThenName);
  const handleNoSets = nonJunk
    .filter((d) => d.hasHandle && d.setCount === 0)
    .map(toStatsRow)
    .sort((a, b) => a.name.localeCompare(b.name));
  const emptySetProfiles = nonJunk
    .filter((d) => d.setCount > 0 && d.playCount === 0)
    .map(toStatsRow)
    .sort(sortBySetsThenName);
  const noThumbWithSets = nonJunk
    .filter((d) => !d.imageUrl && d.setCount > 0)
    .map(toStatsRow)
    .sort(sortBySetsThenName);
  const junkNames = djs
    .filter((d) => d.isJunk)
    .map(toStatsRow)
    .sort(sortBySetsThenName);

  const statusMap = new Map(
    playStatusGroups.map((g) => [g.idStatus, g._count._all]),
  );
  const byStatus: NamedCount[] = STATUS_ORDER.map((status) => ({
    key: status,
    label: STATUS_META[status as IdStatus].label,
    count: statusMap.get(status) ?? 0,
  }));

  return {
    totals: {
      sets: setCount,
      djs: djs.length,
      tracks: trackCount,
      labels: labelCount,
      venues: venueCount,
      plays: playCount,
    },
    sets: {
      withPlays: setsWithPlays,
      empty: setCount - setsWithPlays,
      withImage: setsWithImage,
      withPlayback: setsWithPlayback,
      byType: namedFromGroup(
        setTypeGroups.map((g) => ({ key: g.type, count: g._count._all })),
        (k) => k,
      ),
      bySource: namedFromGroup(
        setSourceGroups.map((g) => ({
          key: g.sourceName,
          count: g._count._all,
        })),
        (k) => k,
      ),
    },
    plays: {
      byStatus,
      byProvenance: namedFromGroup(
        playProvGroups.map((g) => ({
          key: g.provenance,
          count: g._count._all,
        })),
        (k) => PROVENANCE_META[k as Provenance]?.label ?? k,
      ),
    },
    tracks: {
      withImage: tracksWithImage,
      withBeatport: tracksWithBeatport,
      withBpm: tracksWithBpm,
    },
    djs: {
      browseReady: djs.filter((d) => d.isBrowseReady).length,
      withHandle: nonJunk.filter((d) => d.hasHandle).length,
      noHandle: nonJunk.filter((d) => !d.hasHandle).length,
      withSets: nonJunk.filter((d) => d.setCount > 0).length,
      noSets: nonJunk.filter((d) => d.setCount === 0).length,
      emptyTracklists: emptySetProfiles.length,
      noThumb: nonJunk.filter((d) => !d.imageUrl).length,
      junk: junkNames.length,
      missingHandleWithSets,
      handleNoSets,
      emptySetProfiles,
      noThumbWithSets,
      junkNames,
    },
    emptySets: emptySetRows,
  };
}
