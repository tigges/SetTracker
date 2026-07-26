import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { getVenues } from "@/lib/queries";

export default async function VenuesPage() {
  const venues = await getVenues();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Places &amp; platforms</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Venues</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Festivals, clubs and livestream channels that host sets — separate from
          DJs, labels and radio series.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => (
          <Link
            key={v.id}
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
                {v.kind ? ` · ${v.kind}` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {venues.length === 0 && (
        <p className="py-16 text-center text-[14px] text-muted2">
          No venues with sets yet — they appear after a deep ingest.
        </p>
      )}
    </div>
  );
}
