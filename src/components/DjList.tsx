import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { displayCity } from "@/lib/displayCity";
import type { DjListItem } from "@/lib/queries";

function handleBits(d: DjListItem): string {
  const bits: string[] = [];
  if (d.soundcloud) bits.push("SC");
  if (d.youtube) bits.push("YT");
  if (d.instagram) bits.push("IG");
  if (d.twitter) bits.push("X");
  if (d.website) bits.push("Web");
  return bits.join(" · ");
}

/** Browse-ready DJ directory. Catalog QA queues live on /stats. */
export function DjList({ djs }: { djs: DjListItem[] }) {
  if (djs.length === 0) {
    return <p className="text-[14px] text-muted">No DJs in the directory yet.</p>;
  }

  return (
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
              {(() => {
                const city = displayCity(dj.homeCity);
                return city ? `${city} · ` : "";
              })()}
              {dj.setCount} {dj.setCount === 1 ? "set" : "sets"}
              {handleBits(dj) ? ` · ${handleBits(dj)}` : ""}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
