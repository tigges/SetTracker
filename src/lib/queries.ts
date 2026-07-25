import { prisma } from "@/lib/db";
import type { IdStatus } from "@/lib/status";

export type StatusCounts = Record<IdStatus, number>;

function emptyCounts(): StatusCounts {
  return {
    identified: 0,
    unresolved_id: 0,
    community_resolved: 0,
    unparsed: 0,
  };
}

function tallyStatuses(plays: { idStatus: string }[]): StatusCounts {
  const c = emptyCounts();
  for (const p of plays) {
    if (p.idStatus in c) c[p.idStatus as IdStatus] += 1;
  }
  return c;
}

// ---------------------------------------------------------------------------
// Sets feed
// ---------------------------------------------------------------------------
export async function getFeed() {
  const sets = await prisma.set.findMany({
    orderBy: { publishedAt: "desc" },
    include: {
      artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } },
      event: true,
      series: true,
      plays: { select: { idStatus: true } },
    },
  });

  return sets.map((s) => {
    const primary = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      type: s.type,
      publishedAt: s.publishedAt,
      durationSec: s.durationSec,
      sourceName: s.sourceName,
      cover: s.cover,
      eventName: s.event?.name ?? null,
      seriesName: s.series?.name ?? null,
      primaryDj: primary
        ? { name: primary.dj.name, slug: primary.dj.slug, accent: primary.dj.accent }
        : null,
      collaborators: s.artists
        .filter((a) => !a.isPrimary)
        .map((a) => ({ name: a.dj.name, slug: a.dj.slug })),
      trackCount: s.plays.length,
      statusCounts: tallyStatuses(s.plays),
    };
  });
}

export type FeedItem = Awaited<ReturnType<typeof getFeed>>[number];

// ---------------------------------------------------------------------------
// Set detail
// ---------------------------------------------------------------------------
export async function getSetBySlug(slug: string) {
  const set = await prisma.set.findUnique({
    where: { slug },
    include: {
      artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } },
      event: true,
      series: true,
      plays: {
        orderBy: { position: "asc" },
        include: {
          track: { include: { label: true } },
          idTrack: { include: { resolvedTrack: { include: { label: true } } } },
        },
      },
    },
  });
  if (!set) return null;

  const primary = set.artists.find((a) => a.isPrimary) ?? set.artists[0];

  return {
    id: set.id,
    slug: set.slug,
    title: set.title,
    type: set.type,
    publishedAt: set.publishedAt,
    durationSec: set.durationSec,
    sourceName: set.sourceName,
    sourceUrl: set.sourceUrl,
    cover: set.cover,
    event: set.event,
    series: set.series,
    primaryDj: primary?.dj ?? null,
    artists: set.artists.map((a) => ({
      name: a.dj.name,
      slug: a.dj.slug,
      accent: a.dj.accent,
      isPrimary: a.isPrimary,
    })),
    statusCounts: tallyStatuses(set.plays),
    plays: set.plays.map((p) => {
      const resolved = p.idTrack?.resolvedTrack ?? null;
      const title =
        p.track?.title ??
        resolved?.title ??
        p.idTrack?.label ??
        p.rawText ??
        "Unknown";
      const artistName =
        p.track?.artistName ??
        resolved?.artistName ??
        p.idTrack?.suspectedArtist ??
        null;
      const label = p.track?.label ?? resolved?.label ?? null;
      return {
        id: p.id,
        position: p.position,
        timestamp: p.timestamp,
        idStatus: p.idStatus,
        provenance: p.provenance,
        rawText: p.rawText,
        title,
        artistName,
        labelName: label?.name ?? null,
        labelColor: label?.color ?? null,
        bpm: p.track?.bpm ?? resolved?.bpm ?? null,
        idNote: p.idTrack?.note ?? null,
        resolvedTitle: resolved ? `${resolved.artistName} – ${resolved.title}` : null,
      };
    }),
  };
}

export type SetDetail = NonNullable<Awaited<ReturnType<typeof getSetBySlug>>>;
export type PlayRow = SetDetail["plays"][number];

// ---------------------------------------------------------------------------
// DJ profile hub
// ---------------------------------------------------------------------------
export async function getDjBySlug(slug: string) {
  const dj = await prisma.dj.findUnique({
    where: { slug },
    include: { series: { include: { _count: { select: { sets: true } } } } },
  });
  if (!dj) return null;

  const setArtists = await prisma.setArtist.findMany({
    where: { djId: dj.id },
    include: {
      set: {
        include: {
          artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } },
          event: true,
          series: true,
          plays: { select: { idStatus: true, provenance: true } },
        },
      },
    },
  });

  const sets = setArtists
    .map((sa) => sa.set)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const setIds = sets.map((s) => s.id);

  // recent sets
  const recentSets = sets.slice(0, 8).map((s) => {
    const primary = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
    return {
      slug: s.slug,
      title: s.title,
      type: s.type,
      publishedAt: s.publishedAt,
      durationSec: s.durationSec,
      cover: s.cover,
      eventName: s.event?.name ?? null,
      seriesName: s.series?.name ?? null,
      trackCount: s.plays.length,
      statusCounts: tallyStatuses(s.plays),
      isPrimary: primary?.dj.id === dj.id,
    };
  });

  // source health across all this DJ's sets
  const allPlays = sets.flatMap((s) => s.plays);
  const health = tallyStatuses(allPlays);
  const provenance: Record<string, number> = {};
  for (const p of allPlays) provenance[p.provenance] = (provenance[p.provenance] ?? 0) + 1;

  // most-played tracks (identified + community-resolved carry a trackId)
  let mostPlayed: { title: string; artistName: string; count: number }[] = [];
  if (setIds.length) {
    const grouped = await prisma.played.groupBy({
      by: ["trackId"],
      where: { setId: { in: setIds }, trackId: { not: null } },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 8,
    });
    const trackIds = grouped.map((g) => g.trackId!).filter(Boolean);
    const trackRecords = await prisma.track.findMany({
      where: { id: { in: trackIds } },
    });
    const byId = new Map(trackRecords.map((t) => [t.id, t]));
    mostPlayed = grouped
      .map((g) => {
        const t = byId.get(g.trackId!);
        return t
          ? { title: t.title, artistName: t.artistName, count: g._count.trackId }
          : null;
      })
      .filter((x): x is { title: string; artistName: string; count: number } => !!x);
  }

  // collaborators (DJs sharing a set with this DJ)
  const collabRows = setIds.length
    ? await prisma.setArtist.findMany({
        where: { setId: { in: setIds }, djId: { not: dj.id } },
        include: { dj: true },
      })
    : [];
  const collabMap = new Map<
    string,
    { name: string; slug: string; accent: string; count: number }
  >();
  for (const r of collabRows) {
    const cur = collabMap.get(r.djId);
    if (cur) cur.count += 1;
    else
      collabMap.set(r.djId, {
        name: r.dj.name,
        slug: r.dj.slug,
        accent: r.dj.accent,
        count: 1,
      });
  }
  const collaborators = [...collabMap.values()].sort((a, b) => b.count - a.count);

  return {
    id: dj.id,
    slug: dj.slug,
    name: dj.name,
    homeCity: dj.homeCity,
    bio: dj.bio,
    accent: dj.accent,
    series: dj.series.map((s) => ({
      slug: s.slug,
      name: s.name,
      setCount: s._count.sets,
    })),
    totals: {
      sets: sets.length,
      tracks: allPlays.length,
    },
    recentSets,
    mostPlayed,
    collaborators,
    health,
    provenance,
  };
}

export type DjProfile = NonNullable<Awaited<ReturnType<typeof getDjBySlug>>>;

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------
export async function getDjList() {
  return prisma.dj.findMany({ orderBy: { name: "asc" } });
}
