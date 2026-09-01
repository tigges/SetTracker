import type { Metadata } from "next";
import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { ExpandableCardGrid } from "@/components/ExpandableCardGrid";
import { VisualTeaser } from "@/components/VisualTeaser";
import { atlasVenueBySlug } from "@/lib/atlas/seed";
import {
  calendarMarkedDays,
  calendarTeaserFaces,
  getAtlasTeaserFaces,
  getFestivalEditionBoard,
  getVenues,
} from "@/lib/queries";
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

export default async function EventsPage() {
  const [events, board, atlasFaces] = await Promise.all([
    getVenues(),
    getFestivalEditionBoard(),
    getAtlasTeaserFaces(),
  ]);
  const chart = atlasVenueBySlug();
  const withSets = events.filter((v) => v.isBrowseReady);
  const directory = events.filter((v) => !v.isBrowseReady);
  const buckets = bucketByKind(withSets);
  const calFaces = calendarTeaserFaces(board);
  const marked = calendarMarkedDays(board);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Places &amp; platforms</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Events</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Festivals, clubs, and livestream channels with sets in the catalog.
          Directory stubs without sets stay in a closed list at the bottom.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <VisualTeaser
            href="/atlas"
            eyebrow="DJ Mag charts"
            title="Map the Top 100"
            blurb="Clubs, festivals, and DJs — search from the header."
            cta="Atlas →"
            variant="atlas"
            faces={atlasFaces.map((f) => ({
              src: f.imageUrl,
              label: f.name,
              accent: f.accent,
            }))}
          />
          <VisualTeaser
            href="/events/calendar#cal-today"
            eyebrow="Festival editions & club nights"
            title="This season’s calendar"
            blurb="Curated weekends plus official club calendars."
            cta="Calendar →"
            variant="calendar"
            faces={calFaces.map((f) => ({
              src: f.imageUrl,
              label: f.name,
              accent: f.accent,
            }))}
            markedDays={marked}
            nowMs={board.nowMs}
          />
        </div>
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
          <details id="directory" className="rounded-lg border border-line px-4 py-3">
            <summary className="cursor-pointer text-[14px] font-semibold text-ink">
              Directory · no sets yet
              <span className="mono ml-2 text-[12px] font-normal text-muted2">
                {directory.length}
              </span>
            </summary>
            <p className="mt-2 text-[13px] text-muted2">
              Curated clubs and festivals with an official site — waiting
              for ingest to attach sets.
            </p>
            <div className="mt-3">
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
            </div>
          </details>
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
