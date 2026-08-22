import { isJunkArtistName } from "@/lib/artistName";
import { playablePlaybackUrl } from "@/lib/playback";
import { isBrandHostSlug } from "@/lib/brandHosts";
import { isProducerHiddenSlug } from "@/lib/ingest/producerDjReview.data";
import { isCatalogWorkDj, isTop100DjSlug } from "@/lib/djCatalog";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import { isBrowseReadyDj } from "@/lib/djBrowse";
import { prisma } from "@/lib/db";
import {
  expandGenres,
  modeGenre,
  normalizeGenre,
  normalizeGenreList,
} from "@/lib/genre";
import {
  catalogArtistIndex,
  matchLineupName,
  nightHeadliner,
  nightMentionsDj,
} from "@/lib/lineupMatch";
import { CURATED_LABEL_SLUGS } from "@/lib/ingest/curatedLabels";
import {
  canonicalBeatportArtistUrl,
  resolveDjBeatport,
} from "@/lib/beatportArtist";
import {
  canonicalBeatportUrl,
  resolveBeatportUrl,
  trackIdentityKey,
} from "@/lib/trackMeta";
import { relatedSlugsFor } from "@/lib/ingest/discovery/relations";
import { resolveSetSlug } from "@/lib/ingest/sourceRemaps";
import { collapseConsecutivePlays, playCollapseKey } from "@/lib/playCollapse";
import { canonicalDjSlug, DJ_SLUG_ALIASES } from "@/lib/ingest/djSlugAliases";
import { sortEventSets, resolvedIdCount } from "@/lib/feedPriority";
import { listableSets } from "@/lib/setList";
import {
  consumerIdNote,
  isConfirmedProvenance,
  isConsumerHiddenPlay,
} from "@/lib/status";
import { staticSetPageSlugs } from "@/lib/setPages";
import { resolveFeedRanks } from "@/lib/feedPriorityResolve";
import {
  loadAtlasDjs,
  loadAtlasVenues,
} from "@/lib/atlas/seed";
import { daysCoveredByEditions, isoUTC } from "@/lib/calendarGrid";
import { sortPlaceNights } from "@/lib/placeTimeline";
import { rankTrackChart, type TrackChartAgg } from "@/lib/trackChart";
import {
  bucketVenueNight,
  parseJsonStringList,
  type VenueNightCalendarRow,
} from "@/lib/ingest/discovery/venueCalendars/board";
import {
  editionBrandLabel,
  editionCalendar,
  editionGapReport,
} from "@/lib/ingest/festivalDrops";
import { pickRelatedSets } from "@/lib/relatedSets";
import { isBrowseReadySet } from "@/lib/setBrowse";
import { isBrowseReadyVenue, isVenueListed } from "@/lib/venueBrowse";
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

/** Canonical Beatport /track URLs already stored on a same-title+artist row. */
async function siblingBeatportMap(
  rows: { title: string; artistName: string | null }[],
): Promise<Map<string, string>> {
  const uniqueTitles = [
    ...new Set(rows.filter((r) => r.artistName).map((r) => r.title)),
  ];
  if (uniqueTitles.length === 0) return new Map();

  const found = await prisma.track.findMany({
    where: { beatportUrl: { not: null }, title: { in: uniqueTitles } },
    select: { title: true, artistName: true, beatportUrl: true },
  });
  const map = new Map<string, string>();
  for (const t of found) {
    const url = canonicalBeatportUrl(t.beatportUrl);
    if (!url) continue;
    const key = trackIdentityKey(t.title, t.artistName);
    if (!map.has(key)) map.set(key, url);
  }
  return map;
}

/** Aggregate play status counts per set via SQL groupBy (no play-row payload). */
async function statusCountsBySetIds(
  setIds: string[],
): Promise<
  Map<
    string,
    {
      counts: StatusCounts;
      trackCount: number;
      provenance: string | null;
      confirmedCount: number;
    }
  >
> {
  const out = new Map<
    string,
    {
      counts: StatusCounts;
      trackCount: number;
      provenance: string | null;
      confirmedCount: number;
    }
  >();
  if (setIds.length === 0) return out;

  const [groups, provGroups] = await Promise.all([
    prisma.played.groupBy({
      by: ["setId", "idStatus"],
      where: { setId: { in: setIds } },
      _count: { _all: true },
    }),
    prisma.played.groupBy({
      by: ["setId", "provenance"],
      where: { setId: { in: setIds } },
      _count: { _all: true },
    }),
  ]);

  for (const g of groups) {
    let entry = out.get(g.setId);
    if (!entry) {
      entry = {
        counts: emptyCounts(),
        trackCount: 0,
        provenance: null,
        confirmedCount: 0,
      };
      out.set(g.setId, entry);
    }
    entry.trackCount += g._count._all;
    if (g.idStatus in entry.counts) {
      entry.counts[g.idStatus as IdStatus] += g._count._all;
    }
  }
  const provBest = new Map<string, { provenance: string; n: number }>();
  for (const g of provGroups) {
    const prev = provBest.get(g.setId);
    if (g.provenance === "1001tl") {
      provBest.set(g.setId, { provenance: "1001tl", n: g._count._all + 10_000 });
      continue;
    }
    if (!prev || g._count._all > prev.n) {
      provBest.set(g.setId, { provenance: g.provenance, n: g._count._all });
    }
  }
  for (const g of provGroups) {
    let entry = out.get(g.setId);
    if (!entry) {
      entry = {
        counts: emptyCounts(),
        trackCount: 0,
        provenance: null,
        confirmedCount: 0,
      };
      out.set(g.setId, entry);
    }
    if (isConfirmedProvenance(g.provenance)) {
      entry.confirmedCount += g._count._all;
    }
  }
  for (const [id, row] of out) {
    row.provenance = provBest.get(id)?.provenance ?? null;
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
      edition: true,
      series: true,
    },
  });

  const tallies = await statusCountsBySetIds(sets.map((s) => s.id));

  const mapped = sets
    .map((s) => {
      const primary = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
      const tally = tallies.get(s.id);
      const trackCount = tally?.trackCount ?? 0;
      const ranks = resolveFeedRanks({
        primaryDjSlug: primary?.dj.slug,
        eventSlug: s.event?.slug,
        eventKind: s.event?.kind,
        setType: s.type,
        durationSec: s.durationSec,
        trackCount,
      });
      return {
        id: s.id,
        slug: s.slug,
        title: s.title,
        type: s.type,
        genre: normalizeGenre(s.genre),
        genres: expandGenres(s.genre),
        publishedAt: s.publishedAt,
        performedAt: s.performedAt,
        durationSec: s.durationSec,
        sourceName: s.sourceName,
        sourceUrl: s.sourceUrl,
        playbackUrl: playablePlaybackUrl(s.playbackUrl, s.sourceUrl),
        cover: s.cover,
        imageUrl: s.imageUrl,
        eventName: s.event?.name ?? null,
        eventSlug: s.event?.slug ?? null,
        eventKind: s.event?.kind ?? null,
        eventImageUrl: s.event?.imageUrl ?? null,
        editionSlug: s.edition?.slug ?? null,
        editionYear: s.edition?.year ?? null,
        editionLabel: s.edition?.label ?? null,
        editionEndsAt: s.edition?.endsAt ?? null,
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
          .filter((a) => !a.isPrimary && !isBrandHostSlug(a.dj.slug))
          .map((a) => ({ name: a.dj.name, slug: a.dj.slug })),
        trackCount,
        statusCounts: tally?.counts ?? emptyCounts(),
        /** Transparent feed ranks — see `feedPriority.ts`. */
        spotlight: ranks.spotlight,
        top100Rank: ranks.top100Rank,
        festivalRank: ranks.festivalRank,
        clubRank: ranks.clubRank,
        venueTier: ranks.venueTier,
        densitySeverity: ranks.densitySeverity,
        dominantProvenance: tally?.provenance ?? null,
        confirmedCount: tally?.confirmedCount ?? 0,
      };
    })
    .filter((s) =>
      isBrowseReadySet({
        imageUrl: s.imageUrl,
        primaryDjImageUrl: s.primaryDj?.imageUrl,
        eventImageUrl: s.eventImageUrl,
        primaryDjName: s.primaryDj?.name,
        primaryDjSlug: s.primaryDj?.slug,
        title: s.title,
        trackCount: s.trackCount,
        durationSec: s.durationSec,
      }),
    );
  return listableSets(mapped);
}

export type FeedItem = Awaited<ReturnType<typeof getFeed>>[number];

// ---------------------------------------------------------------------------
// Set detail
// ---------------------------------------------------------------------------
const SET_DETAIL_INCLUDE = {
  artists: { include: { dj: true }, orderBy: { isPrimary: "desc" as const } },
  event: true,
  series: true,
  plays: {
    orderBy: { position: "asc" as const },
    include: {
      track: { include: { label: true } },
      idTrack: { include: { resolvedTrack: { include: { label: true } } } },
    },
  },
} as const;

export async function getSetBySlug(slug: string) {
  let set = await prisma.set.findUnique({
    where: { slug },
    include: SET_DETAIL_INCLUDE,
  });
  if (!set) {
    const mapped = resolveSetSlug(slug);
    if (mapped !== slug) {
      set = await prisma.set.findUnique({
        where: { slug: mapped },
        include: SET_DETAIL_INCLUDE,
      });
    }
  }
  if (!set) return null;

  const primary = set.artists.find((a) => a.isPrimary) ?? set.artists[0];

  const mappedPlays = set.plays
    .filter(
      (p) =>
        !isConsumerHiddenPlay({
          rawText: p.rawText,
          idNote: p.idTrack?.note,
          trackId: p.trackId,
          artistName: p.track?.artistName ?? p.idTrack?.suspectedArtist,
        }),
    )
    .map((p) => {
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
      hasTrackPage: false,
      isrc: track?.isrc ?? null,
      idNote: consumerIdNote(p.idTrack?.note),
      resolvedTitle: resolved
        ? `${resolved.artistName} – ${resolved.title}`
        : null,
    };
  });
  let plays = collapseConsecutivePlays(mappedPlays, (p) =>
    playCollapseKey({
      trackSlug: p.trackSlug,
      artistName: p.artistName,
      title: p.title,
    }),
  ).map((p, i) => ({ ...p, position: i + 1 }));
  const missing = plays.filter(
    (p) => !canonicalBeatportUrl(p.beatportUrl) && p.artistName,
  );
  if (missing.length > 0) {
    const catalog = await siblingBeatportMap(missing);
    if (catalog.size > 0) {
      plays = plays.map((p) => ({
        ...p,
        beatportUrl: resolveBeatportUrl(
          p.beatportUrl,
          p.title,
          p.artistName,
          catalog,
        ),
      }));
    }
  }
  const exportedTrackSlugs = new Set(await getAllTrackSlugs());
  plays = plays.map((p) => ({
    ...p,
    hasTrackPage: Boolean(p.trackSlug && exportedTrackSlugs.has(p.trackSlug)),
  }));

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
    playbackUrl: playablePlaybackUrl(set.playbackUrl, set.sourceUrl),
    cover: set.cover,
    imageUrl:
      set.imageUrl ??
      (primary && !isBrandHostSlug(primary.dj.slug)
        ? primary.dj.imageUrl
        : null) ??
      set.event?.imageUrl ??
      null,
    event: set.event,
    series: set.series,
    primaryDj:
      primary?.dj && !isBrandHostSlug(primary.dj.slug)
        ? {
            id: primary.dj.id,
            name: primary.dj.name,
            slug: primary.dj.slug,
            accent: primary.dj.accent,
            imageUrl: primary.dj.imageUrl,
          }
        : null,
    artists: set.artists
      .filter((a) => !isBrandHostSlug(a.dj.slug))
      .map((a) => ({
        name: a.dj.name,
        slug: a.dj.slug,
        accent: a.dj.accent,
        imageUrl: a.dj.imageUrl,
        isPrimary: a.isPrimary,
      })),
    statusCounts: tallyStatuses(plays),
    plays,
  };
}

export type SetDetail = NonNullable<Awaited<ReturnType<typeof getSetBySlug>>>;
export type PlayRow = SetDetail["plays"][number];

const RELATED_REASON = {
  event: "Same event",
  series: "Same series",
  dj: "Same DJ",
} as const;

/** Nearby sets on the same event, series, or primary DJ. */
export async function getRelatedSets(slug: string, limit = 6) {
  const set = await prisma.set.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      eventId: true,
      seriesId: true,
      event: { select: { slug: true } },
      series: { select: { slug: true } },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true } } },
      },
    },
  });
  if (!set) return [];

  const primaryDjSlug = set.artists[0]?.dj.slug ?? null;
  const or = [
    set.eventId ? { eventId: set.eventId } : null,
    set.seriesId ? { seriesId: set.seriesId } : null,
    primaryDjSlug
      ? { artists: { some: { isPrimary: true, dj: { slug: primaryDjSlug } } } }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x != null);
  if (!or.length) return [];

  const candidates = await prisma.set.findMany({
    where: { id: { not: set.id }, OR: or },
    take: 40,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      publishedAt: true,
      durationSec: true,
      _count: { select: { plays: true } },
      event: { select: { slug: true, name: true } },
      series: { select: { slug: true, name: true } },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true, name: true, accent: true } } },
      },
    },
  });

  const listed = listableSets(
    candidates.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      publishedAt: c.publishedAt,
      durationSec: c.durationSec,
      trackCount: c._count.plays,
      eventSlug: c.event?.slug,
      seriesSlug: c.series?.slug,
      primaryDjSlug: c.artists[0]?.dj.slug ?? null,
    })),
  );

  const picked = pickRelatedSets(
    {
      slug: set.slug,
      eventSlug: set.event?.slug,
      seriesSlug: set.series?.slug,
      primaryDjSlug,
    },
    listed,
    limit,
  );

  return picked.map(({ item, reason }) => {
    const raw = candidates.find((c) => c.slug === item.slug)!;
    const dj = raw.artists[0]?.dj ?? null;
    return {
      slug: raw.slug,
      title: raw.title,
      publishedAt: raw.publishedAt,
      durationSec: raw.durationSec,
      trackCount: raw._count.plays,
      reason,
      reasonLabel: RELATED_REASON[reason],
      eventName: raw.event?.name ?? null,
      seriesName: raw.series?.name ?? null,
      primaryDj: dj
        ? { slug: dj.slug, name: dj.name, accent: dj.accent }
        : null,
    };
  });
}

export type RelatedSetItem = Awaited<ReturnType<typeof getRelatedSets>>[number];

/** Curated festival edition windows + catalog gaps for the Events page. */
export async function getFestivalEditionBoard(nowMs = Date.now()) {
  const calendar = editionCalendar(nowMs).filter((e) => e.bucket !== "past");
  const slugs = [...new Set(calendar.map((e) => e.eventSlug))];
  const [events, sets] = slugs.length
    ? await Promise.all([
        prisma.event.findMany({
          where: { slug: { in: slugs } },
          select: { slug: true, name: true, imageUrl: true },
        }),
        prisma.set.findMany({
          where: { event: { slug: { in: slugs } } },
          select: {
            publishedAt: true,
            durationSec: true,
            event: { select: { slug: true } },
            _count: { select: { plays: true } },
          },
        }),
      ])
    : [[], []];
  const names = new Map(events.map((e) => [e.slug, e.name]));
  const images = new Map(events.map((e) => [e.slug, e.imageUrl]));
  const gaps = editionGapReport(
    sets.map((s) => ({
      eventSlug: s.event?.slug,
      publishedAt: s.publishedAt,
      trackCount: s._count.plays,
      durationSec: s.durationSec,
    })),
    nowMs,
  );

  const [nightRows, catalogRows] = await Promise.all([
    prisma.venueNight.findMany({
      include: { event: { select: { slug: true, name: true, imageUrl: true } } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.dj.findMany({
      select: { slug: true, name: true, imageUrl: true, accent: true },
    }),
  ]);
  const catalog = catalogArtistIndex(catalogRows);
  const nights: VenueNightCalendarRow[] = [];
  for (const row of nightRows) {
    const startsAt = isoUTC(row.startsAt);
    const endsAt = row.endsAt ? isoUTC(row.endsAt) : startsAt;
    const bucket = bucketVenueNight(startsAt, endsAt, nowMs);
    if (bucket === "past") continue;
    names.set(row.event.slug, row.event.name);
    if (row.event.imageUrl && !images.has(row.event.slug)) {
      images.set(row.event.slug, row.event.imageUrl);
    }
    const billed = parseJsonStringList(row.artistsJson);
    const lineup = billed.map((name) => matchLineupName(name, catalog));
    nights.push({
      slug: row.slug,
      eventSlug: row.event.slug,
      title: row.title,
      startsAt,
      endsAt,
      bucket,
      sourceUrl: row.sourceUrl,
      ticketsUrl: row.ticketsUrl,
      artists: billed,
      lineup,
      headliner: nightHeadliner(row.title, lineup, catalog),
    });
  }

  const countSlugs = [
    ...new Set([
      ...calendar.map((e) => e.eventSlug),
      ...nights.map((n) => n.eventSlug),
    ]),
  ];
  const extraSlugs = countSlugs.filter((s) => !slugs.includes(s));
  const extraSets = extraSlugs.length
    ? await prisma.set.findMany({
        where: { event: { slug: { in: extraSlugs } } },
        select: { event: { select: { slug: true } } },
      })
    : [];
  const setCounts: Record<string, number> = {};
  for (const s of [...sets, ...extraSets]) {
    const slug = s.event?.slug;
    if (!slug) continue;
    setCounts[slug] = (setCounts[slug] ?? 0) + 1;
  }

  return { calendar, nights, gaps, names, images, setCounts, nowMs };
}

export type TeaserFaceRow = {
  slug: string;
  name: string;
  imageUrl: string | null;
  accent: string;
};

/** Rank-1 festival, club, and DJ faces for the Atlas teaser. */
export async function getAtlasTeaserFaces(): Promise<TeaserFaceRow[]> {
  const fest = loadAtlasVenues().find((v) => v.kind === "festival" && v.rank === 1);
  const club = loadAtlasVenues().find((v) => v.kind === "club" && v.rank === 1);
  const dj = loadAtlasDjs().find((d) => d.rank === 1);
  const eventSlugs = [fest?.slug, club?.slug].filter((s): s is string => Boolean(s));
  const [eventRows, djRow] = await Promise.all([
    eventSlugs.length
      ? prisma.event.findMany({
          where: { slug: { in: eventSlugs } },
          select: { slug: true, name: true, imageUrl: true },
        })
      : Promise.resolve([]),
    dj
      ? prisma.dj.findUnique({
          where: { slug: dj.slug },
          select: { slug: true, name: true, imageUrl: true, accent: true },
        })
      : Promise.resolve(null),
  ]);
  const bySlug = new Map(eventRows.map((e) => [e.slug, e]));
  const faces: TeaserFaceRow[] = [];
  if (fest) {
    const row = bySlug.get(fest.slug);
    faces.push({
      slug: fest.slug,
      name: row?.name ?? fest.name,
      imageUrl: row?.imageUrl ?? null,
      accent: "var(--amber)",
    });
  }
  if (club) {
    const row = bySlug.get(club.slug);
    faces.push({
      slug: club.slug,
      name: row?.name ?? club.name,
      imageUrl: row?.imageUrl ?? null,
      accent: "var(--teal)",
    });
  }
  if (dj) {
    faces.push({
      slug: dj.slug,
      name: djRow?.name ?? dj.name,
      imageUrl: djRow?.imageUrl ?? null,
      accent: djRow?.accent ?? "var(--violet)",
    });
  }
  return faces;
}

export function calendarTeaserFaces(
  board: Awaited<ReturnType<typeof getFestivalEditionBoard>>,
): TeaserFaceRow[] {
  const seen = new Set<string>();
  const faces: TeaserFaceRow[] = [];
  for (const e of board.calendar) {
    if (seen.has(e.eventSlug)) continue;
    seen.add(e.eventSlug);
    faces.push({
      slug: e.eventSlug,
      name: board.names.get(e.eventSlug) ?? editionBrandLabel(e.eventSlug),
      imageUrl: board.images.get(e.eventSlug) ?? null,
      accent: "var(--amber)",
    });
    if (faces.length >= 3) break;
  }
  return faces;
}

export function calendarMarkedDays(
  board: Awaited<ReturnType<typeof getFestivalEditionBoard>>,
): Set<string> {
  return daysCoveredByEditions([
    ...board.calendar,
    ...board.nights.map((n) => ({ startsAt: n.startsAt, endsAt: n.endsAt })),
  ]);
}

// ---------------------------------------------------------------------------
// DJ profile hub
// ---------------------------------------------------------------------------
export type DjRecentSet = {
  slug: string;
  title: string;
  type: string;
  publishedAt: Date;
  durationSec: number;
  cover: string | null;
  imageUrl: string | null;
  eventName: string | null;
  seriesName: string | null;
  trackCount: number;
  statusCounts: StatusCounts;
  isPrimary: boolean;
};

export type DjPlayedTrack = {
  slug: string;
  title: string;
  artistName: string;
  count: number;
  imageUrl: string | null;
  beatportUrl: string | null;
};

export type DjCollaborator = {
  name: string;
  slug: string;
  accent: string;
  count: number;
};

export type DjRelated = {
  slug: string;
  name: string;
  accent: string;
  reason: string;
};

export type DjUpcomingNight = {
  slug: string;
  title: string;
  startsAt: string;
  eventSlug: string;
  eventName: string;
  sourceUrl: string;
  ticketsUrl: string | null;
};

export type DjProfile = {
  id: string;
  slug: string;
  name: string;
  homeCity: string | null;
  bio: string | null;
  accent: string;
  imageUrl: string | null;
  socials: {
    soundcloud: string | null;
    youtube: string | null;
    instagram: string | null;
    twitter: string | null;
    website: string | null;
    beatport: string | null;
  };
  series: Array<{ slug: string; name: string; setCount: number }>;
  genre: string | null;
  upcomingNights: DjUpcomingNight[];
  totals: { sets: number; tracks: number };
  recentSets: DjRecentSet[];
  mostPlayed: DjPlayedTrack[];
  collaborators: DjCollaborator[];
  related: DjRelated[];
  health: StatusCounts;
  provenance: Record<string, number>;
};

export async function getDjBySlug(slug: string): Promise<DjProfile | null> {
  const mapped = canonicalDjSlug(slug);
  const dj = await prisma.dj.findUnique({
    where: { slug: mapped },
    include: { series: { include: { _count: { select: { sets: true } } } } },
  });
  if (!dj) return null;
  // Festival / stage / radio-series / brand hosts must not render as DJ profiles.
  if (
    isBrandHostSlug(dj.slug) ||
    isProducerHiddenSlug(dj.slug) ||
    isJunkArtistName(dj.name) ||
    isJunkArtistName(dj.slug.replace(/-/g, " ")) ||
    /^view-artist-details-for-/.test(dj.slug)
  ) {
    return null;
  }

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
  if (
    !isCatalogWorkDj({
      slug: dj.slug,
      isTop100: isTop100DjSlug(dj.slug),
      sets: sets.map((s) => ({
        sourceName: s.sourceName,
        sourceUrl: s.sourceUrl,
        type: s.type,
        eventKind: s.event?.kind ?? null,
      })),
    })
  ) {
    return null;
  }
  const setIds = sets.map((s) => s.id);
  const recent = listableSets(
    sets.map((s) => ({
      ...s,
      primaryDjSlug:
        (s.artists.find((a) => a.isPrimary) ?? s.artists[0])?.dj.slug ?? null,
      eventSlug: s.event?.slug ?? null,
      durationSec: s.durationSec,
    })),
  ).slice(0, 8);

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
    beatportUrl: string | null;
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
        beatportUrl: true,
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
              beatportUrl: t.beatportUrl,
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
          beatportUrl: string | null;
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
      website: canonicalBeatportArtistUrl(dj.website) ? null : dj.website,
      beatport: resolveDjBeatport({
        beatport: dj.beatport,
        website: dj.website,
        bio: dj.bio,
      }),
    },
    series: dj.series.map((s) => ({
      slug: s.slug,
      name: s.name,
      setCount: s._count.sets,
    })),
    genre: modeGenre(sets.map((s) => s.genre)),
    upcomingNights: await upcomingNightsForDj({
      slug: dj.slug,
      name: dj.name,
    }),
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

async function upcomingNightsForDj(
  dj: { slug: string; name: string },
  limit = 3,
) {
  const nightRows = await prisma.venueNight.findMany({
    include: { event: { select: { slug: true, name: true } } },
    orderBy: { startsAt: "asc" },
  });
  const nowMs = Date.now();
  const out: Array<{
    slug: string;
    title: string;
    startsAt: string;
    bucket: string;
    eventSlug: string;
    eventName: string;
    sourceUrl: string;
    ticketsUrl: string | null;
  }> = [];
  for (const row of nightRows) {
    const startsAt = isoUTC(row.startsAt);
    const endsAt = row.endsAt ? isoUTC(row.endsAt) : startsAt;
    const bucket = bucketVenueNight(startsAt, endsAt, nowMs);
    if (bucket === "past") continue;
    if (!nightMentionsDj(parseJsonStringList(row.artistsJson), dj, row.title)) {
      continue;
    }
    out.push({
      slug: row.slug,
      title: row.title,
      startsAt,
      bucket,
      eventSlug: row.event.slug,
      eventName: row.event.name,
      sourceUrl: row.sourceUrl,
      ticketsUrl: row.ticketsUrl,
    });
  }
  return sortPlaceNights(out)
    .slice(0, limit)
    .map(({ bucket: _bucket, ...rest }) => rest);
}

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
  beatport: string | null;
  setCount: number;
  playCount: number;
  identifiedPlayCount: number;
  hasHandle: boolean;
  isJunk: boolean;
  /** Hearthis-crawl hobbyist — not operator work, not a public profile. */
  isLowSignal: boolean;
  /** Default directory visibility (store everything; hide thin profiles). */
  isBrowseReady: boolean;
  /** DJ Mag Top 100 rank when listed; omit from the A–Z directory card otherwise. */
  top100Rank: number | null;
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
  const ranks = loadDjMagTop100RankBySlug();
  const [rows, playAgg, setLinks] = await Promise.all([
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
        beatport: true,
        _count: { select: { sets: true } },
      },
    }),
    djPlayAggregates(),
    prisma.setArtist.findMany({
      select: {
        djId: true,
        set: {
          select: {
            sourceName: true,
            sourceUrl: true,
            type: true,
            event: { select: { kind: true } },
          },
        },
      },
    }),
  ]);

  const setsByDj = new Map<
    string,
    Array<{
      sourceName: string | null;
      sourceUrl: string | null;
      type: string;
      eventKind: string | null;
    }>
  >();
  for (const row of setLinks) {
    const list = setsByDj.get(row.djId) ?? [];
    list.push({
      sourceName: row.set.sourceName,
      sourceUrl: row.set.sourceUrl,
      type: row.set.type,
      eventKind: row.set.event?.kind ?? null,
    });
    setsByDj.set(row.djId, list);
  }

  return rows.map((d) => {
    const hasHandle = Boolean(
      d.soundcloud ||
        d.youtube ||
        d.instagram ||
        d.twitter ||
        d.website ||
        d.beatport,
    );
    const isJunk =
      isBrandHostSlug(d.slug) ||
      isProducerHiddenSlug(d.slug) ||
      isJunkArtistName(d.name) ||
      isJunkArtistName(d.slug.replace(/-/g, " ")) ||
      /^view-artist-details-for-/.test(d.slug);
    const plays = playAgg.get(d.id) ?? {
      playCount: 0,
      identifiedPlayCount: 0,
    };
    const sets = setsByDj.get(d.id) ?? [];
    const isLowSignal =
      !isJunk &&
      !isCatalogWorkDj({
        slug: d.slug,
        isTop100: isTop100DjSlug(d.slug),
        sets,
      });
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
      beatport: d.beatport,
      setCount: d._count.sets,
      playCount: plays.playCount,
      identifiedPlayCount: plays.identifiedPlayCount,
      hasHandle,
      isJunk,
      isLowSignal,
      isBrowseReady: false,
      top100Rank: ranks.get(canonicalDjSlug(d.slug)) ?? ranks.get(d.slug) ?? null,
    };
    item.isBrowseReady = isBrowseReadyDj(item) && !isLowSignal;
    return item;
  });
}

export async function getAllSetSlugs(): Promise<string[]> {
  const rows = await prisma.set.findMany({ select: { slug: true } });
  return staticSetPageSlugs(rows.map((r) => r.slug));
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

export async function getAllLabelSlugs(): Promise<string[]> {
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
      return {
        ...t,
        imageUrl: full?.imageUrl ?? null,
        beatportUrl: full?.beatportUrl ?? null,
      };
    }),
    artists,
  };
}

export type LabelProfile = NonNullable<Awaited<ReturnType<typeof getLabelBySlug>>>;

export async function getAllDjSlugs(): Promise<string[]> {
  // Same hide rules as the directory / profile: no junk or hearthis-only leaks.
  const djs = await getDjList();
  const slugs = djs
    .filter((d) => !d.isJunk && !d.isLowSignal)
    .map((d) => d.slug);
  const have = new Set(slugs);
  const aliases = Object.entries(DJ_SLUG_ALIASES)
    .filter(([, canon]) => have.has(canon))
    .map(([alias]) => alias);
  return [...slugs, ...aliases.filter((a) => !have.has(a))];
}

// ---------------------------------------------------------------------------
// Events directory (Prisma Event — festivals, clubs, livestream channels)
// Kept separate from DJs / Labels / DJ Series.
// ---------------------------------------------------------------------------
export type VenueListItem = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  location: string | null;
  website: string | null;
  setCount: number;
  isBrowseReady: boolean;
  imageUrl: string | null;
  accent: string;
};

type VenueQueryRow = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  location: string | null;
  website: string | null;
  imageUrl: string | null;
  _count: { sets: number };
  sets: Array<{
    imageUrl: string | null;
    artists: Array<{
      dj: { imageUrl: string | null; accent: string | null };
    }>;
  }>;
};

export async function getVenues(): Promise<VenueListItem[]> {
  const events: VenueQueryRow[] = await prisma.event.findMany({
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
    // re-attached sets yet — e.g. EDC Las Vegas. Listed in Directory below.
    .filter((e) =>
      isVenueListed({ setCount: e._count.sets, website: e.website }),
    )
    .map((e) => {
      const latest = e.sets[0];
      const prim = latest?.artists[0]?.dj;
      const setCount = e._count.sets;
      return {
        id: e.id,
        slug: e.slug,
        name: e.name,
        kind: e.kind,
        location: e.location,
        website: e.website,
        setCount,
        isBrowseReady: isBrowseReadyVenue({ setCount, website: e.website }),
        imageUrl: e.imageUrl ?? latest?.imageUrl ?? prim?.imageUrl ?? null,
        accent: prim?.accent ?? "var(--brand)",
      };
    })
    .sort((a, b) => b.setCount - a.setCount || a.name.localeCompare(b.name));
}

export async function getAllVenueSlugs(): Promise<string[]> {
  const rows = await prisma.event.findMany({
    where: {
      OR: [{ sets: { some: {} } }, { website: { not: null } }],
    },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getAllSeriesSlugs(): Promise<string[]> {
  const rows = await prisma.series.findMany({
    where: { sets: { some: {} } },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getSeriesBySlug(slug: string) {
  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      dj: {
        select: { slug: true, name: true, accent: true, imageUrl: true },
      },
      sets: {
        orderBy: { publishedAt: "desc" },
        include: {
          artists: { include: { dj: true }, orderBy: { isPrimary: "desc" } },
          event: true,
        },
      },
    },
  });
  if (!series) return null;

  const tallies = await statusCountsBySetIds(series.sets.map((s) => s.id));
  return {
    slug: series.slug,
    name: series.name,
    host: series.dj
      ? {
          slug: series.dj.slug,
          name: series.dj.name,
          accent: series.dj.accent,
          imageUrl: series.dj.imageUrl,
        }
      : null,
    sets: listableSets(
      series.sets.map((s) => {
        const primary = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
        const tally = tallies.get(s.id);
        return {
          id: s.id,
          slug: s.slug,
          title: s.title,
          type: s.type,
          publishedAt: s.publishedAt,
          durationSec: s.durationSec,
          imageUrl: s.imageUrl ?? primary?.dj.imageUrl ?? null,
          eventName: s.event?.name ?? null,
          eventSlug: s.event?.slug ?? null,
          primaryDjSlug: primary?.dj.slug ?? null,
          trackCount: tally?.trackCount ?? 0,
          statusCounts: tally?.counts ?? emptyCounts(),
        };
      }),
    ),
  };
}

export type SeriesProfile = NonNullable<Awaited<ReturnType<typeof getSeriesBySlug>>>;

export async function getVenueBySlug(slug: string, nowMs = Date.now()) {
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

  // Artists who have at least one set here with identified / community IDs —
  // not empty shells or all-pink unresolved tracklists.
  const lineupBySlug = new Map<
    string,
    {
      slug: string;
      name: string;
      accent: string;
      imageUrl: string | null;
      top100Rank: number | null;
    }
  >();
  for (const s of event.sets) {
    const counts = tallies.get(s.id)?.counts;
    if (resolvedIdCount(counts) < 1) continue;
    for (const a of s.artists) {
      const dj = a.dj;
      if (lineupBySlug.has(dj.slug)) continue;
      if (isJunkArtistName(dj.name)) continue;
      if (isProducerHiddenSlug(dj.slug)) continue;
      if (/^view-artist-details-for-/.test(dj.slug)) continue;
      if (isBrandHostSlug(dj.slug)) continue;
      const ranks = resolveFeedRanks({
        primaryDjSlug: dj.slug,
        eventSlug: event.slug,
        eventKind: event.kind,
        setType: s.type,
        durationSec: s.durationSec,
        trackCount: tallies.get(s.id)?.trackCount ?? 0,
      });
      lineupBySlug.set(dj.slug, {
        slug: dj.slug,
        name: dj.name,
        accent: dj.accent,
        imageUrl: dj.imageUrl,
        top100Rank: ranks.top100Rank,
      });
    }
  }
  const lineupArtists = [...lineupBySlug.values()].sort(
    (a, b) =>
      (a.top100Rank ?? 999) - (b.top100Rank ?? 999) ||
      a.name.localeCompare(b.name),
  );

  const [nightRows, catalogRows] = await Promise.all([
    prisma.venueNight.findMany({
      where: { eventId: event.id },
      orderBy: { startsAt: "asc" },
    }),
    prisma.dj.findMany({
      select: { slug: true, name: true, imageUrl: true, accent: true },
    }),
  ]);
  const catalog = catalogArtistIndex(catalogRows);
  const unsortedNights = nightRows
    .map((row) => {
      const startsAt = isoUTC(row.startsAt);
      const endsAt = row.endsAt ? isoUTC(row.endsAt) : startsAt;
      const artists = parseJsonStringList(row.artistsJson).map((name) =>
        matchLineupName(name, catalog),
      );
      return {
        slug: row.slug,
        title: row.title,
        startsAt,
        endsAt,
        bucket: bucketVenueNight(startsAt, endsAt, nowMs),
        sourceUrl: row.sourceUrl,
        ticketsUrl: row.ticketsUrl,
        artists,
        headliner: nightHeadliner(row.title, artists, catalog),
      };
    })
    .filter((n) => n.bucket !== "past");
  const nights = sortPlaceNights(unsortedNights);

  const sets = event.sets
    .map((s) => {
      const prim = s.artists.find((a) => a.isPrimary) ?? s.artists[0];
      const tally = tallies.get(s.id);
      const trackCount = tally?.trackCount ?? 0;
      const ranks = resolveFeedRanks({
        primaryDjSlug: prim?.dj.slug,
        eventSlug: event.slug,
        eventKind: event.kind,
        setType: s.type,
        durationSec: s.durationSec,
        trackCount,
      });
      return {
        id: s.id,
        slug: s.slug,
        title: s.title,
        type: s.type,
        genre: normalizeGenre(s.genre),
        genres: expandGenres(s.genre),
        publishedAt: s.publishedAt,
        performedAt: s.performedAt,
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
        trackCount,
        statusCounts: tally?.counts ?? emptyCounts(),
        sourceName: s.sourceName,
        sourceUrl: s.sourceUrl,
        playbackUrl: playablePlaybackUrl(s.playbackUrl, s.sourceUrl),
        cover: s.cover,
        eventName: event.name,
        eventSlug: event.slug,
        eventKind: event.kind,
        eventImageUrl: event.imageUrl ?? null,
        editionSlug: null,
        editionYear: null,
        editionLabel: null,
        editionEndsAt: null,
        seriesName: null,
        spotlight: ranks.spotlight,
        dominantProvenance: tally?.provenance ?? null,
        top100Rank: ranks.top100Rank,
        festivalRank: ranks.festivalRank,
        clubRank: ranks.clubRank,
        venueTier: ranks.venueTier,
        densitySeverity: ranks.densitySeverity,
        confirmedCount: tally?.confirmedCount ?? 0,
      } satisfies FeedItem;
    });

  const listed = listableSets(sets);

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
    setCount: listed.length,
    sets: sortEventSets(listed, nowMs),
    nights,
  };
}

export type VenueProfile = NonNullable<Awaited<ReturnType<typeof getVenueBySlug>>>;

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------
type TrackChartSqlRow = {
  trackId: string;
  playCount: number | bigint;
  setCount: number | bigint;
  djCount: number | bigint;
  eventCount: number | bigint;
};

export async function getTracks(limit = 120) {
  const grouped = await prisma.$queryRaw<TrackChartSqlRow[]>`
    SELECT
      p.trackId AS trackId,
      COUNT(p.id) AS playCount,
      COUNT(DISTINCT p.setId) AS setCount,
      COUNT(DISTINCT sa.djId) AS djCount,
      COUNT(DISTINCT s.eventId) AS eventCount
    FROM Played p
    INNER JOIN "Set" s ON s.id = p.setId
    INNER JOIN SetArtist sa ON sa.setId = p.setId AND sa.isPrimary = 1
    WHERE p.trackId IS NOT NULL
    GROUP BY p.trackId
  `;
  const ranked = rankTrackChart(
    grouped.map(
      (g): TrackChartAgg => ({
        trackId: g.trackId,
        playCount: Number(g.playCount ?? 0),
        setCount: Number(g.setCount ?? 0),
        djCount: Number(g.djCount ?? 0),
        eventCount: Number(g.eventCount ?? 0),
      }),
    ),
    limit,
  );
  const ids = ranked.map((g) => g.trackId);
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
  const statsBy = new Map(ranked.map((g) => [g.trackId, g]));
  return ids
    .map((id) => {
      const t = byId.get(id);
      const stats = statsBy.get(id);
      if (!t || !stats) return null;
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
        playCount: stats.playCount,
        setCount: stats.setCount,
        djCount: stats.djCount,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
}

/** Cap static track pages so GitHub Pages stays under the 10GB unpack limit. */
const TRACK_STATIC_EXPORT_CAP = Number(
  process.env.TRACK_STATIC_EXPORT_CAP || 400,
);

let exportedTrackSlugCache: string[] | null = null;

export async function getAllTrackSlugs(): Promise<string[]> {
  if (exportedTrackSlugCache) return exportedTrackSlugCache;
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
  exportedTrackSlugCache = rows.map((r) => r.slug);
  return exportedTrackSlugCache;
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

  const beatportCatalog = canonicalBeatportUrl(track.beatportUrl)
    ? new Map<string, string>()
    : await siblingBeatportMap([
        { title: track.title, artistName: track.artistName },
      ]);
  const beatportUrl = resolveBeatportUrl(
    track.beatportUrl,
    track.title,
    track.artistName,
    beatportCatalog,
  );

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
    beatportUrl,
    isrc: track.isrc,
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
