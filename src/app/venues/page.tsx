import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { getVenues } from "@/lib/queries";

const SECTIONS: Array<{
  id: string;
  title: string;
  blurb: string;
  kinds: string[];
}> = [
  {
    id: "festivals",
    title: "Festivals",
    blurb: "Named festival brands with sets or an official site.",
    kinds: ["festival"],
  },
  {
    id: "clubs",
    title: "Clubs",
    blurb: "DJ Mag Top 100 and other club rooms.",
    kinds: ["club"],
  },
  {
    id: "livestreams",
    title: "Livestreams & media",
    blurb: "Boiler Room, Cercle, Mixmag and similar channels.",
    kinds: ["livestream", "radio", "event"],
  },
];

function VenueCard({
  v,
}: {
  v: Awaited<ReturnType<typeof getVenues>>[number];
}) {
  return (
    <Link
      href={`/venues/${v.slug}`}
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

export default async function VenuesPage() {
  const venues = await getVenues();
  const used = new Set<string>();

  const buckets = SECTIONS.map((section) => {
    const items = venues.filter((v) => section.kinds.includes(v.kind));
    for (const v of items) used.add(v.id);
    return { ...section, items };
  });

  const leftover = venues.filter((v) => !used.has(v.id));
  if (leftover.length) {
    buckets.push({
      id: "other",
      title: "Other",
      blurb: "Venues that don’t fit the buckets above.",
      kinds: [],
      items: leftover,
    });
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Places &amp; platforms</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Venues</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Festivals, clubs, and livestream channels — separate from DJs, labels
          and radio series.
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
                  <VenueCard key={v.id} v={v} />
                ))}
              </div>
            </section>
          ),
        )}
      </div>

      {venues.length === 0 && (
        <p className="py-16 text-center text-[14px] text-muted2">
          No venues with sets yet — they appear after a deep ingest.
        </p>
      )}
    </div>
  );
}
