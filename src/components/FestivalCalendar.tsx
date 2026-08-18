import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import {
  CALENDAR_WEEKDAYS,
  editionsInMonth,
  monthGrid,
  monthTitle,
  monthsForEditions,
} from "@/lib/calendarGrid";
import {
  calendarPillClass,
  dedupeDayPills,
  groupMonthLocations,
  nextClubNight,
  occurrencesOnDay,
  toCalendarOccurrences,
} from "@/lib/calendarLocations";
import type { EditionCalendarRow } from "@/lib/ingest/festivalDrops";
import type { VenueNightCalendarRow } from "@/lib/ingest/discovery/venueCalendars/board";

const BUCKET_COPY: Record<string, string> = {
  current: "On now",
  upcoming: "Upcoming",
  recent: "Just ended",
};

export type CalendarEdition = EditionCalendarRow & {
  name: string;
  imageUrl: string | null;
};

export type CalendarNight = VenueNightCalendarRow & {
  name: string;
  imageUrl: string | null;
};

function dateRange(startsAt: string, endsAt: string): string {
  return endsAt !== startsAt ? `${startsAt} – ${endsAt}` : startsAt;
}

function PlaceTeaser({
  href,
  name,
  imageUrl,
  accent,
  meta,
  relives,
  next,
}: {
  href: string;
  name: string;
  imageUrl: string | null;
  accent: string;
  meta: string;
  relives: number;
  next?: { startsAt: string; title: string } | null;
}) {
  return (
    <li className="card flex flex-col gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]">
      <div className="flex items-start gap-3">
        <Link href={href} className="flex-none">
          <EntityThumb
            src={imageUrl}
            label={name}
            accent={accent}
            size={44}
            radius={12}
            monogram={name.slice(0, 2).toUpperCase()}
          />
        </Link>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-ink">
            <Link href={href} className="transition-colors hover:text-brand">
              {name}
            </Link>
          </span>
          <span className="mono block text-[12px] text-muted2">{meta}</span>
          {relives > 0 ? (
            <span className="mono block text-[12px] text-muted2">
              {relives} {relives === 1 ? "Relive" : "Relives"}
            </span>
          ) : null}
          {next ? (
            <span className="mt-1 block truncate text-[13px] text-ink">
              <span className="text-muted2">Next</span>
              {`  ${next.startsAt} · ${next.title}`}
            </span>
          ) : null}
        </span>
      </div>
      <Link
        href={href}
        className="mono text-[12px] text-brand hover:text-brandstrong"
      >
        Open event →
      </Link>
    </li>
  );
}

export function FestivalCalendar({
  editions,
  nights = [],
  setCounts = {},
  nowMs,
}: {
  editions: CalendarEdition[];
  nights?: CalendarNight[];
  setCounts?: Record<string, number>;
  nowMs: number;
}) {
  const dated = [...editions, ...nights];
  const months = monthsForEditions(dated, nowMs);
  const occurrences = toCalendarOccurrences(editions, nights);

  if (dated.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] text-muted2">
        No festival weekends or club nights in this window.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted2">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full bg-amber" />
          Fests
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full bg-teal" />
          Clubs
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full ring-1 ring-inset ring-brand" />
          On now
        </span>
      </p>
      {months.map(({ year, month }) => {
        const cells = monthGrid(year, month, nowMs);
        const monthEds = editionsInMonth(editions, year, month);
        const monthNights = editionsInMonth(nights, year, month);
        const locations = groupMonthLocations(monthEds, monthNights);
        const monthOcc = editionsInMonth(occurrences, year, month);
        return (
          <section key={`${year}-${month}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold tracking-tight">
                {monthTitle(year, month)}
              </h2>
              <span className="mono text-[12px] text-muted2">
                {locations.length}
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
                  const hits = dedupeDayPills(occurrencesOnDay(monthOcc, c.iso));
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
                              : "text-muted2"
                        }`}
                      >
                        {c.day}
                      </span>
                      <ul className="mt-1 space-y-0.5">
                        {hits.slice(0, 2).map((e) => (
                          <li key={e.groupKey}>
                            <Link
                              href={e.href}
                              className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight ${calendarPillClass(e.accent, e.bucket)}`}
                              title={`${e.tooltip}${BUCKET_COPY[e.bucket] ? ` · ${BUCKET_COPY[e.bucket]}` : ""}`}
                            >
                              {e.name}
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
            {locations.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {locations.map((loc) => {
                  if (loc.kind === "festival") {
                    const e = loc.edition;
                    const bits = [
                      dateRange(e.startsAt, e.endsAt),
                      e.label,
                      BUCKET_COPY[e.bucket] ?? e.bucket,
                    ].filter(Boolean);
                    return (
                      <PlaceTeaser
                        key={loc.key}
                        href={`/events/${e.eventSlug}`}
                        name={e.name}
                        imageUrl={e.imageUrl}
                        accent="var(--amber)"
                        meta={bits.join(" · ")}
                        relives={setCounts[e.eventSlug] ?? 0}
                      />
                    );
                  }

                  const next = nextClubNight(loc.nights);
                  const bits = [
                    dateRange(loc.startsAt, loc.endsAt),
                    BUCKET_COPY[loc.bucket] ?? loc.bucket,
                    `${loc.nights.length} ${loc.nights.length === 1 ? "night" : "nights"}`,
                  ];
                  return (
                    <PlaceTeaser
                      key={loc.key}
                      href={`/events/${loc.eventSlug}`}
                      name={loc.name}
                      imageUrl={loc.imageUrl}
                        accent="var(--teal)"
                      meta={bits.join(" · ")}
                      relives={setCounts[loc.eventSlug] ?? 0}
                      next={
                        next &&
                        (next.bucket === "current" || next.bucket === "upcoming")
                          ? { startsAt: next.startsAt, title: next.title }
                          : null
                      }
                    />
                  );
                })}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
