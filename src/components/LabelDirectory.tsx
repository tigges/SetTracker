"use client";

import { useMemo } from "react";
import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { groupByLetter } from "@/lib/alphaIndex";

export type LabelDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  imageUrl: string | null;
  trackCount: number;
  setCount: number;
};

export function LabelDirectory({ labels }: { labels: LabelDirectoryItem[] }) {
  const groups = useMemo(
    () => groupByLetter(labels, (l) => l.name),
    [labels],
  );
  if (labels.length === 0) {
    return (
      <p className="py-16 text-center text-[14px] text-muted2">No labels yet.</p>
    );
  }

  return (
    <div>
      <nav
        aria-label="Jump to letter"
        className="sticky top-14 z-20 -mx-1 mb-4 flex flex-wrap gap-0.5 rounded-lg border border-line bg-bg/90 px-1.5 py-1.5 backdrop-blur-md"
      >
        {groups.map((g) => (
          <a
            key={g.letter}
            href={`#label-${g.letter}`}
            className="mono min-w-7 rounded-md px-1.5 py-1 text-center text-[12px] font-semibold text-muted hover:bg-panel hover:text-ink"
          >
            {g.letter}
            <span className="sr-only"> ({g.items.length})</span>
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <section
          key={g.letter}
          id={`label-${g.letter}`}
          className="scroll-mt-28"
        >
          <h2 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted first:mt-0">
            {g.letter}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {g.items.map((l) => {
              const color = l.color ?? "var(--brand)";
              return (
                <Link
                  key={l.id}
                  href={`/labels/${l.slug}`}
                  className="card flex h-[64px] items-center gap-2.5 px-3 transition-colors hover:border-[color:var(--muted2)]"
                >
                  <EntityThumb
                    src={l.imageUrl}
                    label={l.name}
                    accent={color}
                    size={40}
                    radius={10}
                    monogram={l.name.slice(0, 2).toUpperCase()}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate leading-5 text-[15px] font-semibold text-ink">
                      {l.name}
                    </div>
                    <div className="truncate leading-4 text-[12px] text-muted2">
                      {l.trackCount} {l.trackCount === 1 ? "track" : "tracks"} ·{" "}
                      {l.setCount} {l.setCount === 1 ? "set" : "sets"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
