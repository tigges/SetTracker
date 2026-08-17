import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpandableChipRow } from "@/components/ExpandableChipRow";
import { SetCard } from "@/components/SetCard";
import { SocialLinks } from "@/components/SocialLinks";
import { VenueNightCard } from "@/components/VenueNightCard";
import { ATLAS_YEAR, lookupAtlasVenue } from "@/lib/atlas/seed";
import { chartKicker } from "@/lib/atlas/mapMath";
import { getAllVenueSlugs, getVenueBySlug } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

/** Keep the first viewport light — expand for the rest. */
const ARTIST_CHIP_PREVIEW = 12;

export async function generateStaticParams() {
  const slugs = await getAllVenueSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getVenueBySlug(slug);
  if (!event) return { title: "Event" };
  const chart = lookupAtlasVenue(event.slug);
  const place = chart?.loc || event.location;
  return pageMeta({
    title: event.name,
    description: [place, event.kind, `${event.setCount} sets`]
      .filter(Boolean)
      .join(" · "),
    path: `/events/${event.slug}`,
  });
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

      {event.nights.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Upcoming nights
            </h2>
            {event.socials.website ? (
              <a
                href={event.socials.website}
                target="_blank"
                rel="noreferrer"
                className="mono text-[12px] text-brand hover:text-brandstrong"
              >
                Official site →
              </a>
            ) : null}
          </div>
          <ul className="space-y-3">
            {event.nights.slice(0, 12).map((n) => (
              <VenueNightCard key={n.slug} night={n} />
            ))}
          </ul>
          {event.nights.some(
            (n) => n.headliner?.slug || n.artists.some((a) => a.slug),
          ) ? (
            <p className="mt-3 text-[11px] text-muted2">
              Accent chips and titles link to catalog DJs; muted chips are on
              the bill only.
            </p>
          ) : null}
        </section>
      )}

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
          {event.nights.length > 0
            ? "No Relives linked yet — nights above are from the official calendar."
            : "No sets linked yet — check back after the next deep catalog refresh."}
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
