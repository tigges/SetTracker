import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { ExpandableCardGrid } from "@/components/ExpandableCardGrid";
import { getLabels, getVenues } from "@/lib/queries";

/** Default Labels / Directory preview — ~4 rows on a 3-col desktop grid. */
const LABELS_PREVIEW = 12;
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

function EventCard({ v }: { v: EventRow }) {
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
  const [events, labels] = await Promise.all([getVenues(), getLabels()]);
  const withSets = events.filter((v) => v.isBrowseReady);
  const directory = events.filter((v) => !v.isBrowseReady);
  const buckets = bucketByKind(withSets);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Places &amp; platforms</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Events</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Festivals, clubs, and livestream channels with sets first — curated
          directory stubs without sets stay below.
        </p>
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
                  <EventCard key={v.id} v={v} />
                ))}
              </div>
            </section>
          ),
        )}

        <section id="labels">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Labels</h2>
              <p className="mt-0.5 text-[13px] text-muted2">
                Curated dance imprints plus labels from tracklists — sorted by
                how many sets feature their releases.
              </p>
            </div>
            <span className="mono text-[12px] text-muted2">{labels.length}</span>
          </div>
          {labels.length === 0 ? (
            <p className="text-[13px] text-muted2">No labels yet.</p>
          ) : (
            <ExpandableCardGrid
              previewCount={LABELS_PREVIEW}
              moreLabel="labels"
              items={labels.map((l) => {
                const color = l.color ?? "var(--brand)";
                return (
                  <Link
                    key={l.id}
                    href={`/labels/${l.slug}`}
                    className="card flex items-center gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
                  >
                    <EntityThumb
                      src={l.imageUrl}
                      label={l.name}
                      accent={color}
                      size={44}
                      radius={12}
                      monogram={l.name.slice(0, 2).toUpperCase()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-ink">
                        {l.name}
                      </div>
                      <div className="mono text-[12px] text-muted2">
                        {l.trackCount} tracks · {l.setCount} sets
                      </div>
                    </div>
                  </Link>
                );
              })}
            />
          )}
        </section>

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
                <EventCard key={v.id} v={v} />
              ))}
            />
          </section>
        ) : null}
      </div>

      {withSets.length === 0 && labels.length === 0 && directory.length === 0 && (
        <p className="py-16 text-center text-[14px] text-muted2">
          No events with sets yet — they appear after a deep ingest.
        </p>
      )}
    </div>
  );
}
