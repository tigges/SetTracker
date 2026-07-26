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
