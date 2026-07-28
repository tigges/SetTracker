import { isJunkArtistName } from "@/lib/artistName";
import { isBrowseReadyDj } from "@/lib/djBrowse";
import { prisma } from "@/lib/db";
import {
  expandGenres,
  normalizeGenre,
  normalizeGenreList,
} from "@/lib/genre";
import { CURATED_LABEL_SLUGS } from "@/lib/ingest/curatedLabels";
import {
  relatedSlugsFor,
  venueArtistSlugs,
} from "@/lib/ingest/discovery/relations";
import { isBrowseReadySet } from "@/lib/setBrowse";
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

/** Aggregate play status counts per set via SQL groupBy (no play-row payload). */
async function statusCountsBySetIds(
  setIds: string[],
): Promise<Map<string, { counts: StatusCounts; trackCount: number }>> {
  const out = new Map<string, { counts: StatusCounts; trackCount: number }>();
  if (setIds.length === 0) return out;

  const groups = await prisma.played.groupBy({
    by: ["setId", "idStatus"],
    where: { setId: { in: setIds } },
    _count: { _all: true },
  });

  for (const g of groups) {
    let entry = out.get(g.setId);
    if (!entry) {
      entry = { counts: emptyCounts(), trackCount: 0 };
      out.set(g.setId, entry);
    }
    entry.trackCount += g._count._all;
    if (g.idStatus in entry.counts) {
      entry.counts[g.idStatus as IdStatus] += g._count._all;
    }
  }
  return out;
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
    },
  });

  const tallies = await statusCountsBySetIds(sets.map((s) => s.id));

  return sets
    .map((s) => {
      const primary = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
      const tally = tallies.get(s.id);
      return {
        id: s.id,
        slug: s.slug,
        title: s.title,
        type: s.type,
        genre: normalizeGenre(s.genre),
        genres: expandGenres(s.genre),
        publishedAt: s.publishedAt,
        durationSec: s.durationSec,
        sourceName: s.sourceName,
        cover: s.cover,
        imageUrl: s.imageUrl,
        eventName: s.event?.name ?? null,
        seriesName: s.series?.name ?? null,
        primaryDj: primary
          ? {
              name: primary.dj.name,
              slug: primary.dj.slug,
              accent: primary.dj.accent,
              imageUrl: primary.dj.imageUrl,
            }
          : null,
        collaborators: s.artists
          .filter((a) => !a.isPrimary)
          .map((a) => ({ name: a.dj.name, slug: a.dj.slug })),
        trackCount: tally?.trackCount ?? 0,
        statusCounts: tally?.counts ?? emptyCounts(),
      };
    })
    .filter((s) =>
      isBrowseReadySet({
        imageUrl: s.imageUrl,
        primaryDjImageUrl: s.primaryDj?.imageUrl,
        primaryDjName: s.primaryDj?.name,
      }),
    );
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
    genre: normalizeGenre(set.genre),
    publishedAt: set.publishedAt,
    durationSec: set.durationSec,
    sourceName: set.sourceName,
    sourceUrl: set.sourceUrl,
    playbackUrl: set.playbackUrl ?? set.sourceUrl,
    cover: set.cover,
    imageUrl: set.imageUrl ?? primary?.dj.imageUrl ?? null,
    event: set.event,
    series: set.series,
    primaryDj: primary?.dj
      ? {
          id: primary.dj.id,
          name: primary.dj.name,
          slug: primary.dj.slug,
          accent: primary.dj.accent,
          imageUrl: primary.dj.imageUrl,
        }
      : null,
    artists: set.artists.map((a) => ({
      name: a.dj.name,
      slug: a.dj.slug,
      accent: a.dj.accent,
      imageUrl: a.dj.imageUrl,
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
      const track = p.track ?? resolved;
      return {
        id: p.id,
        position: p.position,
        timestamp: p.timestamp,
        idStatus: p.idStatus,
        provenance: p.provenance,
        rawText: p.rawText,
        title,
        artistName,
        imageUrl: track?.imageUrl ?? null,
        labelName: label?.name ?? null,
        labelSlug: label?.slug ?? null,
        labelColor: label?.color ?? null,
        labelImageUrl: label?.imageUrl ?? null,
        trackSlug: track?.slug ?? null,
        bpm: track?.bpm ?? null,
        musicalKey: track?.musicalKey ?? null,
        mixName: track?.mixName ?? null,
        remixerName: track?.remixerName ?? null,
        genre: normalizeGenre(track?.genre ?? null),
        trackDurationSec: track?.durationSec ?? null,
        beatportUrl: track?.beatportUrl ?? null,
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
        },
      },
    },
  });

  const sets = setArtists
    .map((sa) => sa.set)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const setIds = sets.map((s) => s.id);
  const recent = sets.slice(0, 8);

  const [tallies, provenanceGroups, trackTotal] = await Promise.all([
    statusCountsBySetIds(setIds),
    setIds.length
      ? prisma.played.groupBy({
          by: ["provenance"],
          where: { setId: { in: setIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    setIds.length
      ? prisma.played.count({ where: { setId: { in: setIds } } })
      : Promise.resolve(0),
  ]);

  const health = emptyCounts();
  for (const id of setIds) {
    const t = tallies.get(id);
    if (!t) continue;
    for (const k of Object.keys(health) as IdStatus[]) {
      health[k] += t.counts[k];
    }
  }

  const provenance: Record<string, number> = {};
  for (const g of provenanceGroups) {
    provenance[g.provenance] = g._count._all;
  }

  const recentSets = recent.map((s) => {
    const primary = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
    const tally = tallies.get(s.id);
    return {
      slug: s.slug,
      title: s.title,
      type: s.type,
      publishedAt: s.publishedAt,
      durationSec: s.durationSec,
      cover: s.cover,
      imageUrl: s.imageUrl ?? primary?.dj.imageUrl ?? null,
      eventName: s.event?.name ?? null,
      seriesName: s.series?.name ?? null,
      trackCount: tally?.trackCount ?? 0,
      statusCounts: tally?.counts ?? emptyCounts(),
      isPrimary: primary?.dj.id === dj.id,
    };
  });

  // most-played tracks (identified + community-resolved carry a trackId)
  let mostPlayed: {
    slug: string;
    title: string;
    artistName: string;
    count: number;
    imageUrl: string | null;
  }[] = [];
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
      select: {
        id: true,
        slug: true,
        title: true,
        artistName: true,
        imageUrl: true,
      },
    });
    const byId = new Map(trackRecords.map((t) => [t.id, t]));
    mostPlayed = grouped
      .map((g) => {
        const t = byId.get(g.trackId!);
        return t
          ? {
              slug: t.slug,
              title: t.title,
              artistName: t.artistName,
              count: g._count.trackId,
              imageUrl: t.imageUrl,
            }
          : null;
      })
      .filter(
        (x): x is {
          slug: string;
          title: string;
          artistName: string;
          count: number;
          imageUrl: string | null;
        } => !!x,
      );
  }

  // collaborators (DJs sharing a set with this DJ)
  const collabRows = setIds.length
    ? await prisma.setArtist.findMany({
        where: { setId: { in: setIds }, djId: { not: dj.id } },
        include: {
          dj: { select: { id: true, name: true, slug: true, accent: true } },
        },
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

  // Soft graph from press/lineup discovery — fills gaps before shared sets exist.
  const collabSlugs = new Set(collaborators.map((c) => c.slug));
  const relatedRaw = relatedSlugsFor(dj.slug, 16);
  const relatedIds = relatedRaw.map((r) => r.slug).filter((s) => !collabSlugs.has(s));
  const relatedRows = relatedIds.length
    ? await prisma.dj.findMany({
        where: { slug: { in: relatedIds } },
        select: { slug: true, name: true, accent: true },
      })
    : [];
  const relatedBySlug = new Map(relatedRows.map((r) => [r.slug, r]));
  const related = relatedRaw
    .map((r) => {
      const row = relatedBySlug.get(r.slug);
      if (!row) return null;
      return {
        slug: row.slug,
        name: row.name,
        accent: row.accent,
        reason: r.reason,
      };
    })
    .filter((x): x is { slug: string; name: string; accent: string; reason: string } => !!x);

  return {
    id: dj.id,
    slug: dj.slug,
    name: dj.name,
    homeCity: dj.homeCity,
    bio: dj.bio,
    accent: dj.accent,
    imageUrl: dj.imageUrl,
    socials: {
      soundcloud: dj.soundcloud,
      youtube: dj.youtube,
      instagram: dj.instagram,
      twitter: dj.twitter,
      website: dj.website,
    },
    series: dj.series.map((s) => ({
      slug: s.slug,
      name: s.name,
      setCount: s._count.sets,
    })),
    totals: {
      sets: sets.length,
      tracks: trackTotal,
    },
    recentSets,
    mostPlayed,
    collaborators,
    related,
    health,
    provenance,
  };
}

export type DjProfile = NonNullable<Awaited<ReturnType<typeof getDjBySlug>>>;

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------
export type DjListItem = {
  id: string;
  slug: string;
  name: string;
  homeCity: string | null;
  accent: string;
  imageUrl: string | null;
  soundcloud: string | null;
  youtube: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  setCount: number;
  playCount: number;
  identifiedPlayCount: number;
  hasHandle: boolean;
  isJunk: boolean;
  /** Default directory visibility (store everything; hide thin profiles). */
  isBrowseReady: boolean;
};

type DjPlayAggRow = {
  djId: string;
  playCount: number | bigint;
  identifiedPlayCount: number | bigint;
};

async function djPlayAggregates(): Promise<
  Map<string, { playCount: number; identifiedPlayCount: number }>
> {
  const rows = await prisma.$queryRaw<DjPlayAggRow[]>`
    SELECT
      sa.djId AS djId,
      COUNT(p.id) AS playCount,
      SUM(
        CASE
          WHEN p.idStatus IN ('identified', 'community_resolved') THEN 1
          ELSE 0
        END
      ) AS identifiedPlayCount
    FROM SetArtist sa
    LEFT JOIN Played p ON p.setId = sa.setId
    GROUP BY sa.djId
  `;
  const map = new Map<string, { playCount: number; identifiedPlayCount: number }>();
  for (const r of rows) {
    map.set(r.djId, {
      playCount: Number(r.playCount ?? 0),
      identifiedPlayCount: Number(r.identifiedPlayCount ?? 0),
    });
  }
  return map;
}

export async function getDjList(): Promise<DjListItem[]> {
  const [rows, playAgg] = await Promise.all([
    prisma.dj.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        homeCity: true,
        accent: true,
        imageUrl: true,
        soundcloud: true,
        youtube: true,
        instagram: true,
        twitter: true,
        website: true,
        _count: { select: { sets: true } },
      },
    }),
    djPlayAggregates(),
  ]);

  return rows.map((d) => {
    const hasHandle = Boolean(
      d.soundcloud || d.youtube || d.instagram || d.twitter || d.website,
    );
    const isJunk =
      isJunkArtistName(d.name) ||
      /^view-artist-details-for-/.test(d.slug);
    const plays = playAgg.get(d.id) ?? {
      playCount: 0,
      identifiedPlayCount: 0,
    };
    const item = {
      id: d.id,
      slug: d.slug,
      name: d.name,
      homeCity: d.homeCity,
      accent: d.accent,
      imageUrl: d.imageUrl,
      soundcloud: d.soundcloud,
      youtube: d.youtube,
      instagram: d.instagram,
      twitter: d.twitter,
      website: d.website,
      setCount: d._count.sets,
      playCount: plays.playCount,
      identifiedPlayCount: plays.identifiedPlayCount,
      hasHandle,
      isJunk,
      isBrowseReady: false,
    };
    item.isBrowseReady = isBrowseReadyDj(item);
    return item;
  });
}

export async function getAllSetSlugs() {
  const rows = await prisma.set.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getGenres() {
  const rows = await prisma.set.findMany({
    where: { genre: { not: null } },
    select: { genre: true },
    distinct: ["genre"],
    orderBy: { genre: "asc" },
  });
  return normalizeGenreList(rows.map((r) => r.genre!).filter(Boolean));
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------
export async function getLabels() {
  const labels = await prisma.label.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tracks: true } } },
  });

  // Distinct set cardinality per label without loading every play row into JS.
  const setCounts = await prisma.$queryRaw<{ labelId: string; setCount: number }[]>`
    SELECT t.labelId AS labelId, COUNT(DISTINCT p.setId) AS setCount
    FROM Played p
    INNER JOIN Track t ON t.id = p.trackId
    WHERE t.labelId IS NOT NULL
    GROUP BY t.labelId
  `;
  const setsByLabel = new Map(
    setCounts.map((r) => [r.labelId, Number(r.setCount)]),
  );

  return labels
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      name: l.name,
      color: l.color,
      imageUrl: l.imageUrl,
      trackCount: l._count.tracks,
      setCount: setsByLabel.get(l.id) ?? 0,
    }))
    // Curated imprints stay visible before tracklists attach them.
    .filter((l) => l.trackCount > 0 || CURATED_LABEL_SLUGS.has(l.slug))
    .sort((a, b) => b.setCount - a.setCount || b.trackCount - a.trackCount || a.name.localeCompare(b.name));
}

export async function getAllLabelSlugs() {
  const rows = await prisma.label.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getLabelBySlug(slug: string) {
  const label = await prisma.label.findUnique({
    where: { slug },
    include: { tracks: true },
  });
  if (!label) return null;

  const trackIds = label.tracks.map((t) => t.id);
  const plays = trackIds.length
    ? await prisma.played.findMany({
        where: { trackId: { in: trackIds } },
        include: {
          set: { include: { artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } } } },
          track: true,
        },
      })
    : [];

  const setMap = new Map<string, (typeof plays)[number]["set"]>();
  for (const p of plays) if (!setMap.has(p.setId)) setMap.set(p.setId, p.set);
  const sets = [...setMap.values()].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );

  const playCount = new Map<string, number>();
  for (const p of plays)
    if (p.trackId) playCount.set(p.trackId, (playCount.get(p.trackId) ?? 0) + 1);
  const topTracks = label.tracks
    .map((t) => ({
      slug: t.slug,
      title: t.title,
      artistName: t.artistName,
      count: playCount.get(t.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const artistMap = new Map<string, { name: string; slug: string; accent: string; count: number }>();
  for (const p of plays) {
    const prim = p.set.artists.find((a) => a.isPrimary) ?? p.set.artists[0];
    if (!prim) continue;
    const cur = artistMap.get(prim.dj.id);
    if (cur) cur.count += 1;
    else artistMap.set(prim.dj.id, { name: prim.dj.name, slug: prim.dj.slug, accent: prim.dj.accent, count: 1 });
  }
  const artists = [...artistMap.values()].sort((a, b) => b.count - a.count);

  return {
    slug: label.slug,
    name: label.name,
    color: label.color,
    imageUrl: label.imageUrl,
    socials: {
      soundcloud: label.soundcloud,
      instagram: label.instagram,
      website: label.website,
    },
    trackCount: label.tracks.length,
    setCount: sets.length,
    sets: sets.map((s) => {
      const prim = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
      return {
        slug: s.slug,
        title: s.title,
        type: s.type,
        genre: normalizeGenre(s.genre),
        publishedAt: s.publishedAt,
        durationSec: s.durationSec,
        imageUrl: s.imageUrl ?? prim?.dj.imageUrl ?? null,
        primaryDjName: prim?.dj.name ?? null,
        primaryDjSlug: prim?.dj.slug ?? null,
      };
    }),
    topTracks: topTracks.map((t) => {
      const full = label.tracks.find((x) => x.slug === t.slug);
      return { ...t, imageUrl: full?.imageUrl ?? null };
    }),
    artists,
  };
}

export type LabelProfile = NonNullable<Awaited<ReturnType<typeof getLabelBySlug>>>;

export async function getAllDjSlugs() {
  // Pages export size cliff (~1–2GB): skip discovery stub DJs with no sets.
  // Always keep social-pinned brand DJs even before their first set lands.
  const { DJ_SOCIAL_PINS } = await import("@/lib/ingest/djSocialPins");
  const pinned = DJ_SOCIAL_PINS.map((p) => p.slug);
  const rows = await prisma.dj.findMany({
    where: {
      OR: [{ sets: { some: {} } }, { slug: { in: pinned } }],
    },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

// ---------------------------------------------------------------------------
// Venues (Event entities — festivals, clubs, livestream channels)
// Kept separate from DJs / Labels / DJ Series.
// ---------------------------------------------------------------------------
export async function getVenues() {
  const events = await prisma.event.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { sets: true } },
      sets: {
        orderBy: { publishedAt: "desc" },
        take: 1,
        include: {
          artists: {
            where: { isPrimary: true },
            include: { dj: true },
            take: 1,
          },
        },
      },
    },
  });

  return events
    // Keep curated festival pages (website set) even when crawl hasn't
    // re-attached sets yet — e.g. EDC Las Vegas.
    .filter((e) => e._count.sets > 0 || !!e.website)
    .map((e) => {
      const latest = e.sets[0];
      const prim = latest?.artists[0]?.dj;
      return {
        id: e.id,
        slug: e.slug,
        name: e.name,
        kind: e.kind,
        location: e.location,
        website: e.website,
        setCount: e._count.sets,
        imageUrl: e.imageUrl ?? latest?.imageUrl ?? prim?.imageUrl ?? null,
        accent: prim?.accent ?? "var(--brand)",
      };
    })
    .sort((a, b) => b.setCount - a.setCount || a.name.localeCompare(b.name));
}

export async function getAllVenueSlugs() {
  const rows = await prisma.event.findMany({
    where: {
      OR: [{ sets: { some: {} } }, { website: { not: null } }],
    },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getVenueBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      sets: {
        orderBy: { publishedAt: "desc" },
        include: {
          artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } },
        },
      },
    },
  });
  if (!event) return null;

  const tallies = await statusCountsBySetIds(event.sets.map((s) => s.id));

  const lineupSlugs = venueArtistSlugs(event.slug);
  const lineupRows = lineupSlugs.length
    ? await prisma.dj.findMany({
        where: { slug: { in: lineupSlugs } },
        select: { slug: true, name: true, accent: true, imageUrl: true },
      })
    : [];
  const lineupOrder = new Map(lineupSlugs.map((s, i) => [s, i]));
  const lineupArtists = lineupRows
    .filter(
      (a) =>
        !isJunkArtistName(a.name) &&
        !/^view-artist-details-for-/.test(a.slug),
    )
    .sort(
      (a, b) => (lineupOrder.get(a.slug) ?? 99) - (lineupOrder.get(b.slug) ?? 99),
    );

  return {
    slug: event.slug,
    name: event.name,
    kind: event.kind,
    location: event.location,
    socials: {
      website: event.website,
      soundcloud: event.soundcloud,
      instagram: event.instagram,
      twitter: event.twitter,
    },
    lineupArtists,
    setCount: event.sets.length,
    sets: event.sets.map((s) => {
      const prim = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
      const tally = tallies.get(s.id);
      return {
        id: s.id,
        slug: s.slug,
        title: s.title,
        type: s.type,
        genre: normalizeGenre(s.genre),
        genres: expandGenres(s.genre),
        publishedAt: s.publishedAt,
        durationSec: s.durationSec,
        imageUrl: s.imageUrl ?? prim?.dj.imageUrl ?? null,
        primaryDj: prim
          ? {
              name: prim.dj.name,
              slug: prim.dj.slug,
              accent: prim.dj.accent,
              imageUrl: prim.dj.imageUrl,
            }
          : null,
        collaborators: s.artists
          .filter((a) => !a.isPrimary)
          .map((a) => ({ name: a.dj.name, slug: a.dj.slug })),
        trackCount: tally?.trackCount ?? 0,
        statusCounts: tally?.counts ?? emptyCounts(),
        sourceName: s.sourceName,
        cover: s.cover,
        eventName: event.name,
        seriesName: null,
      } satisfies FeedItem;
    }),
  };
}

export type VenueProfile = NonNullable<Awaited<ReturnType<typeof getVenueBySlug>>>;

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------
export async function getTracks(limit = 120) {
  const grouped = await prisma.played.groupBy({
    by: ["trackId"],
    where: { trackId: { not: null } },
    _count: { trackId: true },
    orderBy: { _count: { trackId: "desc" } },
    take: limit,
  });
  const ids = grouped.map((g) => g.trackId!).filter(Boolean);
  if (ids.length === 0) return [];
  const rows = await prisma.track.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      slug: true,
      title: true,
      artistName: true,
      imageUrl: true,
      genre: true,
      bpm: true,
      mixName: true,
      label: { select: { name: true, slug: true, color: true } },
    },
  });
  const byId = new Map(rows.map((t) => [t.id, t]));
  const countBy = new Map(grouped.map((g) => [g.trackId!, g._count.trackId]));
  return ids
    .map((id) => {
      const t = byId.get(id);
      if (!t) return null;
      return {
        slug: t.slug,
        title: t.title,
        artistName: t.artistName,
        imageUrl: t.imageUrl,
        genre: normalizeGenre(t.genre),
        bpm: t.bpm,
        mixName: t.mixName,
        labelName: t.label?.name ?? null,
        labelSlug: t.label?.slug ?? null,
        labelColor: t.label?.color ?? null,
        playCount: countBy.get(id) ?? 0,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
}

/** Cap static track pages so GitHub Pages artifacts stay deployable. */
const TRACK_STATIC_EXPORT_CAP = Number(
  process.env.TRACK_STATIC_EXPORT_CAP || 1200,
);

export async function getAllTrackSlugs() {
  const { ensureTrackSlugs } = await import("@/lib/tracks/ensureSlugs");
  await ensureTrackSlugs(prisma);
  // Prefer frequently played tracks; Music-credit floods otherwise blow the
  // static export past GitHub Pages' practical ~1GB artifact limit.
  const rows = await prisma.track.findMany({
    where: { plays: { some: {} } },
    select: { slug: true },
    orderBy: { plays: { _count: "desc" } },
    take: Math.max(200, TRACK_STATIC_EXPORT_CAP),
  });
  return rows.map((r) => r.slug);
}

export async function getTrackBySlug(slug: string) {
  if (slug === "_placeholder") return null;
  const track = await prisma.track.findUnique({
    where: { slug },
    include: { label: true },
  });
  if (!track) return null;

  const plays = await prisma.played.findMany({
    where: { trackId: track.id },
    include: {
      set: {
        include: {
          artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } },
          event: true,
        },
      },
    },
    orderBy: { set: { publishedAt: "desc" } },
  });

  const setMap = new Map<string, (typeof plays)[number]["set"]>();
  for (const p of plays) {
    if (!setMap.has(p.setId)) setMap.set(p.setId, p.set);
  }
  const sets = [...setMap.values()];

  const djMap = new Map<
    string,
    { name: string; slug: string; accent: string; imageUrl: string | null; count: number }
  >();
  for (const s of sets) {
    const prim = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
    if (!prim) continue;
    const cur = djMap.get(prim.dj.id);
    if (cur) cur.count += 1;
    else
      djMap.set(prim.dj.id, {
        name: prim.dj.name,
        slug: prim.dj.slug,
        accent: prim.dj.accent,
        imageUrl: prim.dj.imageUrl,
        count: 1,
      });
  }

  return {
    slug: track.slug,
    title: track.title,
    artistName: track.artistName,
    mixName: track.mixName,
    remixerName: track.remixerName,
    genre: normalizeGenre(track.genre),
    bpm: track.bpm,
    musicalKey: track.musicalKey,
    durationSec: track.durationSec,
    releaseDate: track.releaseDate,
    imageUrl: track.imageUrl,
    beatportUrl: track.beatportUrl,
    label: track.label
      ? {
          name: track.label.name,
          slug: track.label.slug,
          color: track.label.color,
          imageUrl: track.label.imageUrl,
        }
      : null,
    playCount: plays.length,
    setCount: sets.length,
    djs: [...djMap.values()].sort((a, b) => b.count - a.count),
    sets: sets.map((s) => {
      const prim = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
      return {
        slug: s.slug,
        title: s.title,
        type: s.type,
        genre: normalizeGenre(s.genre),
        publishedAt: s.publishedAt,
        durationSec: s.durationSec,
        imageUrl: s.imageUrl ?? prim?.dj.imageUrl ?? null,
        primaryDjName: prim?.dj.name ?? null,
        primaryDjSlug: prim?.dj.slug ?? null,
        eventName: s.event?.name ?? null,
      };
    }),
  };
}

export type TrackProfile = NonNullable<Awaited<ReturnType<typeof getTrackBySlug>>>;
