import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpandableChipRow } from "@/components/ExpandableChipRow";
import { SetCard } from "@/components/SetCard";
import { SocialLinks } from "@/components/SocialLinks";
import { ATLAS_YEAR, lookupAtlasVenue } from "@/lib/atlas/seed";
import { chartKicker } from "@/lib/atlas/mapMath";
import { getAllVenueSlugs, getVenueBySlug } from "@/lib/queries";

/** Keep the first viewport light — expand for the rest. */
const ARTIST_CHIP_PREVIEW = 12;

export async function generateStaticParams() {
  const slugs = await getAllVenueSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getVenueBySlug(slug);
  if (!event) notFound();
  const chart = lookupAtlasVenue(event.slug);
  const place = chart?.loc || event.location;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/events"
          className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
        >
          ← Events
        </Link>
        {chart ? (
          <Link
            href={`/atlas#${chart.slug}`}
            className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
          >
            Atlas
          </Link>
        ) : null}
      </div>

      <div className="mt-4 mb-8">
        <p className="eyebrow">Event</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {event.name}
        </h1>
        {chart ? (
          <p className="mt-1 text-[13px] text-muted">
            DJ Mag Top 100 {chartKicker(chart.kind, chart.rank)} {ATLAS_YEAR}
            {" · "}
            {chart.change} vs {ATLAS_YEAR - 1}
          </p>
        ) : null}
        <p className="mt-2 text-[14px] text-muted">
          <span className="mono">{event.setCount}</span> sets
          {place ? ` · ${place}` : ""}
          {event.kind ? ` · ${event.kind}` : ""}
        </p>
        <div className="mt-3">
          <SocialLinks links={event.socials} />
        </div>
      </div>

      {event.lineupArtists.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            Artists with IDs
          </h2>
          <ExpandableChipRow
            previewCount={ARTIST_CHIP_PREVIEW}
            moreLabel="artists"
            items={event.lineupArtists.map((a) => (
              <Link
                key={a.slug}
                href={`/djs/${a.slug}`}
                className="rounded-full border border-line bg-panel px-3 py-1 text-[12px] transition-colors hover:border-[color:var(--muted2)]"
                style={{ color: a.accent }}
              >
                {a.name}
              </Link>
            ))}
          />
        </section>
      )}

      {event.sets.length === 0 ? (
        <p className="text-[14px] text-muted">
          No sets linked yet — check back after the next deep catalog refresh.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.sets.map((s) => (
            <SetCard key={s.id} set={s} />
          ))}
        </div>
      )}
    </div>
  );
}
