import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { getDjList } from "@/lib/queries";

export default async function DjsPage() {
  const djs = await getDjList();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Artists</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">DJs</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          {djs.length} bass house artists tracked across radio, festival and
          SoundCloud sets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {djs.map((dj) => (
          <Link
            key={dj.id}
            href={`/djs/${dj.slug}`}
            className="card flex items-center gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
          >
            <EntityThumb
              src={dj.imageUrl}
              label={dj.name}
              accent={dj.accent}
              size={44}
              radius={12}
            />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-ink">
                {dj.name}
              </div>
              <div className="truncate text-[12px] text-muted2">
                {dj.homeCity}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
