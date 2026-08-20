"use client";

import { useMemo } from "react";
import { DjList } from "@/components/DjList";
import { groupDjsByLetter } from "@/lib/djDirectory";
import type { DjListItem } from "@/lib/queries";

export function DjDirectory({ djs }: { djs: DjListItem[] }) {
  const groups = useMemo(() => groupDjsByLetter(djs), [djs]);
  if (djs.length === 0) {
    return <p className="text-[14px] text-muted">No DJs in the directory yet.</p>;
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
            href={`#dj-${g.letter}`}
            className="mono min-w-7 rounded-md px-1.5 py-1 text-center text-[12px] font-semibold text-muted hover:bg-panel hover:text-ink"
          >
            {g.letter}
            <span className="sr-only"> ({g.djs.length})</span>
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <section
          key={g.letter}
          id={`dj-${g.letter}`}
          className="scroll-mt-28"
        >
          <h2 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted first:mt-0">
            {g.letter}
          </h2>
          <DjList djs={g.djs} />
        </section>
      ))}
    </div>
  );
}
