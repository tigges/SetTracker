import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { getLabels } from "@/lib/queries";

export default async function LabelsPage() {
  const labels = await getLabels();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Imprints</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Labels</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          {labels.length} labels represented across the tracklists — sorted by
          how many sets feature their releases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map((l) => {
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
      </div>
    </div>
  );
}
