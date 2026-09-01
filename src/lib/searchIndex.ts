import { prisma } from "@/lib/db";
import { atlasSearchItems } from "@/lib/atlas/searchItems";
import { atlasVenueBySlug } from "@/lib/atlas/seed";
import { normalizeGenre } from "@/lib/genre";
import { isSearchableDj } from "@/lib/djBrowse";
import { getDjList } from "@/lib/queries";
import { nearDuplicateKey } from "@/lib/feedPriority";
import { isBrowseReadySet } from "@/lib/setBrowse";
import { displayCity } from "@/lib/displayCity";
import { ensureTrackSlugs } from "@/lib/tracks/ensureSlugs";

export type SearchIndexItem = {
  kind: "set" | "dj" | "venue" | "label" | "track" | "atlas" | "series";
  title: string;
  subtitle?: string | null;
  href: string;
  keywords?: string;
};

/** Build-time index for static-export client search. */
export async function getSearchIndex(): Promise<SearchIndexItem[]> {
  await ensureTrackSlugs(prisma);

  const [sets, djs, venues, labels, trackPlays, series] = await Promise.all([
    prisma.set.findMany({
      select: {
        slug: true,
        title: true,
        genre: true,
        imageUrl: true,
        playbackUrl: true,
        sourceUrl: true,
        durationSec: true,
        event: { select: { name: true } },
        series: { select: { name: true } },
        artists: {
          where: { isPrimary: true },
          take: 1,
          include: { dj: { select: { name: true, slug: true, imageUrl: true } } },
        },
        _count: { select: { plays: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    getDjList(),
    prisma.event.findMany({
      select: {
        slug: true,
        name: true,
        location: true,
        kind: true,
        website: true,
        _count: { select: { sets: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.label.findMany({
      select: {
        slug: true,
        name: true,
        website: true,
        _count: { select: { tracks: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.played.groupBy({
      by: ["trackId"],
      where: { trackId: { not: null } },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 400,
    }),
    prisma.series.findMany({
      select: {
        slug: true,
        name: true,
        dj: { select: { name: true } },
        _count: { select: { sets: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const trackIds = trackPlays.map((t) => t.trackId!).filter(Boolean);
  const tracks = trackIds.length
    ? await prisma.track.findMany({
        where: { id: { in: trackIds } },
        select: {
          id: true,
          slug: true,
          title: true,
          artistName: true,
          genre: true,
        },
      })
    : [];

  const items: SearchIndexItem[] = [
    {
      kind: "set",
      title: "Sets",
      subtitle: "Festival and club tracklists",
      href: "/sets",
      keywords: "browse sets feed catalog tracklists",
    },
    {
      kind: "atlas",
      title: "Top 100 Atlas",
      subtitle: "DJ Mag clubs & festivals 2026, DJs 2025",
      href: "/atlas",
      keywords: "map dj mag top 100 clubs festivals djs atlas",
    },
    {
      kind: "venue",
      title: "Calendar",
      subtitle: "Festival weekends and official club nights",
      href: "/events/calendar",
      keywords: "calendar festival editions club nights weekends upcoming unvrs hi amnesia cap dagde",
    },
    ...atlasSearchItems(),
  ];

  const seenSetKeys = new Set<string>();
  for (const s of sets) {
    const primary = s.artists[0]?.dj;
    if (
      !isBrowseReadySet({
        imageUrl: s.imageUrl,
        primaryDjImageUrl: primary?.imageUrl,
        primaryDjName: primary?.name,
        title: s.title,
        trackCount: s._count.plays,
        durationSec: s.durationSec,
        playbackUrl: s.playbackUrl,
        sourceUrl: s.sourceUrl,
      })
    ) {
      continue;
    }
    const dupeKey = nearDuplicateKey(s.title, primary?.slug);
    if (seenSetKeys.has(dupeKey)) continue;
    seenSetKeys.add(dupeKey);
    const dj = primary?.name;
    const genre = normalizeGenre(s.genre);
    items.push({
      kind: "set",
      title: s.title,
      subtitle: [dj, s.event?.name ?? s.series?.name, genre]
        .filter(Boolean)
        .join(" · "),
      href: `/sets/${s.slug}`,
      keywords: [dj, s.event?.name, s.series?.name, genre]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const d of djs) {
    // Directory stays browse-ready; search includes handle- or set-backed DJs.
    if (!isSearchableDj(d)) continue;
    items.push({
      kind: "dj",
      title: d.name,
      subtitle: [displayCity(d.homeCity), `${d.setCount} sets`].filter(Boolean).join(" · "),
      href: `/djs/${d.slug}`,
      keywords: d.website ?? undefined,
    });
  }

  for (const s of series) {
    if (s._count.sets < 1) continue;
    items.push({
      kind: "series",
      title: s.name,
      subtitle: [s.dj?.name, `${s._count.sets} sets`].filter(Boolean).join(" · "),
      href: `/series/${s.slug}`,
      keywords: s.dj?.name ?? undefined,
    });
  }

  const chart = atlasVenueBySlug();
  for (const v of venues) {
    // Keep curated venues (e.g. EDC with website) searchable even if crawl
    // hasn't re-attached sets yet.
    if (v._count.sets === 0 && !v.website) continue;
    const atlas = chart.get(v.slug);
    items.push({
      kind: "venue",
      title: v.name,
      subtitle: [v.location, v.kind, v._count.sets ? `${v._count.sets} sets` : null]
        .filter(Boolean)
        .join(" · "),
      href: `/events/${v.slug}`,
      keywords: [
        v.website,
        "edc",
        atlas ? `top 100 #${atlas.rank} ${atlas.kind} ${atlas.city} ${atlas.country}` : null,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const l of labels) {
    items.push({
      kind: "label",
      title: l.name,
      subtitle: `${l._count.tracks} tracks`,
      href: `/labels/${l.slug}`,
      keywords: l.website ?? undefined,
    });
  }

  for (const t of tracks) {
    items.push({
      kind: "track",
      title: t.title,
      subtitle: t.artistName,
      href: `/tracks/${t.slug}`,
      keywords: [t.artistName, normalizeGenre(t.genre)].filter(Boolean).join(" "),
    });
  }

  return items;
}
