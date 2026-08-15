import type { Metadata } from "next";
import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { ExpandableCardGrid } from "@/components/ExpandableCardGrid";
import { atlasVenueBySlug } from "@/lib/atlas/seed";
import { editionLabel } from "@/lib/ingest/festivalDrops";
import { getFestivalEditionBoard, getVenues } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Events",
  description:
    "Festivals, clubs, and livestream channels with DJ sets in the catalog.",
  path: "/events",
});

/** Default Directory preview — ~4 rows on a 3-col desktop grid. */
const DIRECTORY_PREVIEW = 12;

const SECTIONS: Array<{
  id: string;
  title: string;
  blurb: string;
  kinds: string[];
}> = [
  {
    id: "festivals",
    title: "Festivals",
    blurb: "Festival brands with linked sets in the catalog.",
    kinds: ["festival"],
  },
  {
    id: "clubs",
    title: "Clubs",
    blurb: "DJ Mag Top 100 and other club rooms with sets.",
    kinds: ["club"],
  },
  {
    id: "livestreams",
    title: "Livestreams & media",
    blurb: "Boiler Room, Cercle, Mixmag and similar channels with sets.",
    kinds: ["livestream", "radio", "event"],
  },
];

type EventRow = Awaited<ReturnType<typeof getVenues>>[number];

function EventCard({
  v,
  rank,
}: {
  v: EventRow;
  rank?: number | null;
}) {
  return (
    <Link
      href={`/events/${v.slug}`}
      className="card flex items-center gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
    >
      <EntityThumb
        src={v.imageUrl}
        label={v.name}
        accent={v.accent}
        size={44}
        radius={12}
        monogram={v.name.slice(0, 2).toUpperCase()}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-ink">
          {v.name}
        </div>
        <div className="mono text-[12px] text-muted2">
          {rank != null ? `#${rank} · ` : ""}
          {v.setCount} sets
          {v.location ? ` · ${v.location}` : ""}
          {v.website ? " · www" : ""}
        </div>
      </div>
    </Link>
  );
}

function bucketByKind(events: EventRow[]) {
  const used = new Set<string>();
  const buckets = SECTIONS.map((section) => {
    const items = events.filter((v) => section.kinds.includes(v.kind));
    for (const v of items) used.add(v.id);
    return { ...section, items };
  });
  const leftover = events.filter((v) => !used.has(v.id));
  if (leftover.length) {
    buckets.push({
      id: "other",
      title: "Other",
      blurb: "Events that don’t fit the buckets above.",
      kinds: [],
      items: leftover,
    });
  }
  return buckets;
}

const BUCKET_COPY: Record<string, string> = {
  current: "On now",
  upcoming: "Upcoming",
  recent: "Just ended",
};

export default async function EventsPage() {
  const [events, board] = await Promise.all([
    getVenues(),
    getFestivalEditionBoard(),
  ]);
  const chart = atlasVenueBySlug();
  const withSets = events.filter((v) => v.isBrowseReady);
  const directory = events.filter((v) => !v.isBrowseReady);
  const buckets = bucketByKind(withSets);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Places &amp; platforms</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Events</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Festivals, clubs, and livestream channels with sets in the catalog.
          Directory stubs without sets stay below.
        </p>
        {board.calendar.length > 0 ? (
          <section className="mt-6 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Festival editions
                </h2>
                <p className="mt-0.5 text-[13px] text-muted2">
                  Curated weekend windows — Relive dumps land after the close.
                </p>
              </div>
              <span className="mono text-[12px] text-muted2">
                {board.calendar.length}
              </span>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {board.calendar.map((e) => {
                const gap = board.gaps.find((g) => g.edition.slug === e.slug);
                const name = board.names.get(e.eventSlug);
                return (
                  <li
                    key={e.slug}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <span>
                      <Link
                        href={`/events/${e.eventSlug}`}
                        className="font-semibold text-ink hover:underline"
                      >
                        {name ?? editionLabel(e)}
                      </Link>
                      {name ? (
                        <span className="text-muted">
                          {" "}
                          · {e.year}
                          {e.label ? ` ${e.label}` : ""}
                        </span>
                      ) : null}
                      <span className="mono ml-2 text-[11px] text-muted2">
                        {BUCKET_COPY[e.bucket] ?? e.bucket}
                      </span>
                    </span>
                    <span className="mono text-[12px] text-muted2">
                      {e.startsAt} – {e.endsAt}
                      {gap ? (
                        <>
                          {" · "}
                          <Link
                            href={`/capture-1001?q=${encodeURIComponent(name ?? editionLabel(e))}`}
                            className="text-brand hover:underline"
                          >
                            capture gap
                          </Link>
                        </>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <Link
          href="/atlas"
          className="card mt-5 flex items-center justify-between gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
        >
          <span>
            <span className="eyebrow">DJ Mag charts</span>
            <span className="mt-1 block text-[16px] font-semibold text-ink">
              Map the Top 100
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              Clubs, festivals, and DJs — search from the header.
            </span>
          </span>
          <span className="text-[13px] text-brand">Atlas →</span>
        </Link>
      </div>

      <div className="space-y-10">
        {buckets.map((section) =>
          section.items.length === 0 ? null : (
            <section key={section.id} id={section.id}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-muted2">{section.blurb}</p>
                </div>
                <span className="mono text-[12px] text-muted2">
                  {section.items.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((v) => (
                  <EventCard
                    key={v.id}
                    v={v}
                    rank={chart.get(v.slug)?.rank}
                  />
                ))}
              </div>
            </section>
          ),
        )}

        {directory.length > 0 ? (
          <section id="directory">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Directory · no sets yet
                </h2>
                <p className="mt-0.5 text-[13px] text-muted2">
                  Curated clubs and festivals with an official site — waiting
                  for ingest to attach sets. Detail pages stay live.
                </p>
              </div>
              <span className="mono text-[12px] text-muted2">
                {directory.length}
              </span>
            </div>
            <ExpandableCardGrid
              previewCount={DIRECTORY_PREVIEW}
              moreLabel="events"
              items={directory.map((v) => (
                <EventCard
                  key={v.id}
                  v={v}
                  rank={chart.get(v.slug)?.rank}
                />
              ))}
            />
          </section>
        ) : null}
      </div>

      {withSets.length === 0 && directory.length === 0 && (
        <p className="py-16 text-center text-[14px] text-muted2">
          No events with sets yet — they appear after a deep ingest.
        </p>
      )}
    </div>
  );
}
