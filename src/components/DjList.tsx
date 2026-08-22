import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { djCardSubtitle } from "@/lib/djDirectory";
import type { DjListItem } from "@/lib/queries";

/** Browse-ready DJ directory. Catalog QA queues live on /stats. */
export function DjList({ djs }: { djs: DjListItem[] }) {
  if (djs.length === 0) {
    return <p className="text-[14px] text-muted">No DJs in the directory yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {djs.map((dj) => (
        <Link
          key={dj.id}
          href={`/djs/${dj.slug}`}
          className="card flex h-[64px] items-center gap-2.5 px-3 transition-colors hover:border-[color:var(--muted2)]"
        >
          <EntityThumb
            src={dj.imageUrl}
            label={dj.name}
            accent={dj.accent}
            size={40}
            radius={10}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate leading-5 text-[15px] font-semibold text-ink">
              {dj.name}
            </div>
            <div className="truncate leading-4 text-[12px] text-muted2">
              {djCardSubtitle(dj.homeCity, dj.setCount, dj.top100Rank)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
