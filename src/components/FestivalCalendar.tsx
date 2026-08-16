import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import {
  CALENDAR_WEEKDAYS,
  editionCoversDay,
  editionsInMonth,
  monthGrid,
  monthTitle,
  monthsForEditions,
} from "@/lib/calendarGrid";
import { editionLabel } from "@/lib/ingest/festivalDrops";
import type { EditionCalendarRow } from "@/lib/ingest/festivalDrops";

const BUCKET_COPY: Record<string, string> = {
  current: "On now",
  upcoming: "Upcoming",
  recent: "Just ended",
};

const BUCKET_TONE: Record<string, string> = {
  current: "bg-brand/20 text-brand",
  upcoming: "bg-amber/15 text-amber",
  recent: "bg-teal/15 text-teal",
};

export type CalendarEdition = EditionCalendarRow & {
  name: string;
  imageUrl: string | null;
};

function shortName(e: CalendarEdition): string {
  return e.name.replace(/\s+(music festival|festival|weekend)$/i, "");
}

export function FestivalCalendar({
  editions,
  nowMs,
}: {
  editions: CalendarEdition[];
  nowMs: number;
}) {
  const months = monthsForEditions(editions, nowMs);
  if (editions.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] text-muted2">
        No curated festival weekends in this window.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {months.map(({ year, month }) => {
        const cells = monthGrid(year, month, nowMs);
        const monthEds = editionsInMonth(editions, year, month);
        return (
          <section key={`${year}-${month}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold tracking-tight">
                {monthTitle(year, month)}
              </h2>
              <span className="mono text-[12px] text-muted2">
                {monthEds.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <div
                className="grid min-w-[36rem] grid-cols-7 overflow-hidden rounded-xl border border-line bg-panel"
                role="grid"
                aria-label={monthTitle(year, month)}
              >
                {CALENDAR_WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="border-b border-line bg-panel2 px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-muted2"
                  >
                    {d}
                  </div>
                ))}
                {cells.map((c) => {
                  const hits = monthEds.filter((e) => editionCoversDay(e, c.iso));
                  return (
                    <div
                      key={c.iso}
                      role="gridcell"
                      className={`min-h-[5.5rem] border-t border-l border-line p-1.5 ${
                        c.inMonth ? "bg-panel" : "bg-bg/40"
                      } ${c.isToday ? "ring-1 ring-inset ring-brand/60" : ""}`}
                    >
                      <span
                        className={`mono text-[11px] ${
                          c.isToday
                            ? "font-semibold text-brand"
                            : c.inMonth
                              ? "text-muted"
                              : "text-muted2/50"
                        }`}
                      >
                        {c.day}
                      </span>
                      <ul className="mt-1 space-y-0.5">
                        {hits.slice(0, 2).map((e) => (
                          <li key={e.slug}>
                            <Link
                              href={`/events/${e.eventSlug}`}
                              className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight ${
                                BUCKET_TONE[e.bucket] ?? "bg-panel2 text-muted"
                              }`}
                              title={editionLabel(e)}
                            >
                              {shortName(e)}
                            </Link>
                          </li>
                        ))}
                        {hits.length > 2 ? (
                          <li className="px-1 text-[10px] text-muted2">
                            +{hits.length - 2}
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
            {monthEds.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {monthEds.map((e) => (
                  <li
                    key={e.slug}
                    className="card flex items-center gap-3 p-3"
                  >
                    <Link
                      href={`/events/${e.eventSlug}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <EntityThumb
                        src={e.imageUrl}
                        label={e.name}
                        accent="var(--amber)"
                        size={44}
                        radius={10}
                        monogram={e.name.slice(0, 2).toUpperCase()}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">
                          {e.name}
                          <span className="font-normal text-muted">
                            {" "}
                            · {e.year}
                            {e.label ? ` ${e.label}` : ""}
                          </span>
                        </span>
                        <span className="mono text-[12px] text-muted2">
                          {e.startsAt} – {e.endsAt}
                          {" · "}
                          {BUCKET_COPY[e.bucket] ?? e.bucket}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
