import Link from "next/link";
import { notFound } from "next/navigation";
import { SetCard } from "@/components/SetCard";
import { SocialLinks } from "@/components/SocialLinks";
import { getAllVenueSlugs, getVenueBySlug } from "@/lib/queries";

export async function generateStaticParams() {
  const slugs = await getAllVenueSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  return (
    <div>
      <Link
        href="/venues"
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        ← Venues
      </Link>

      <div className="mt-4 mb-8">
        <p className="eyebrow">Venue</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {venue.name}
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          <span className="mono">{venue.setCount}</span> sets
          {venue.location ? ` · ${venue.location}` : ""}
          {venue.kind ? ` · ${venue.kind}` : ""}
        </p>
        <div className="mt-3">
          <SocialLinks links={venue.socials} />
        </div>
      </div>

      {venue.lineupArtists.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            Lineup artists
          </h2>
          <div className="flex flex-wrap gap-2">
            {venue.lineupArtists.map((a) => (
              <Link
                key={a.slug}
                href={`/djs/${a.slug}`}
                className="rounded-full border border-line bg-panel px-3 py-1 text-[12px] transition-colors hover:border-[color:var(--muted2)]"
                style={{ color: a.accent }}
              >
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {venue.sets.length === 0 ? (
        <p className="text-[14px] text-muted">
          No sets linked yet — check back after the next deep catalog refresh.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venue.sets.map((s) => (
            <SetCard key={s.id} set={s} />
          ))}
        </div>
      )}
    </div>
  );
}
