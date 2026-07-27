import { prisma } from "@/lib/db";
import { normalizeGenre } from "@/lib/genre";
import { getDjList } from "@/lib/queries";
import { ensureTrackSlugs } from "@/lib/tracks/ensureSlugs";

export type SearchIndexItem = {
  kind: "set" | "dj" | "venue" | "label" | "track";
  title: string;
  subtitle?: string | null;
  href: string;
  keywords?: string;
};

/** Build-time index for static-export client search. */
export async function getSearchIndex(): Promise<SearchIndexItem[]> {
  await ensureTrackSlugs(prisma);

  const [sets, djs, venues, labels, trackPlays] = await Promise.all([
    prisma.set.findMany({
      select: {
        slug: true,
        title: true,
        genre: true,
        event: { select: { name: true } },
        series: { select: { name: true } },
        artists: {
          where: { isPrimary: true },
          take: 1,
          include: { dj: { select: { name: true } } },
        },
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

  const items: SearchIndexItem[] = [];

  for (const s of sets) {
    const dj = s.artists[0]?.dj?.name;
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
    // Match DJs directory Browse: store thin rows, don't surface in search.
    if (!d.isBrowseReady) continue;
    items.push({
      kind: "dj",
      title: d.name,
      subtitle: [d.homeCity, `${d.setCount} sets`].filter(Boolean).join(" · "),
      href: `/djs/${d.slug}`,
      keywords: d.website ?? undefined,
    });
  }

  for (const v of venues) {
    // Keep curated venues (e.g. EDC with website) searchable even if crawl
    // hasn't re-attached sets yet.
    if (v._count.sets === 0 && !v.website) continue;
    items.push({
      kind: "venue",
      title: v.name,
      subtitle: [v.location, v.kind, v._count.sets ? `${v._count.sets} sets` : null]
        .filter(Boolean)
        .join(" · "),
      href: `/venues/${v.slug}`,
      keywords: [v.website, "edc"].filter(Boolean).join(" "),
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
