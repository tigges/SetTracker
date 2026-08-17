import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { ExpandableList } from "@/components/ExpandableChipRow";
import { LineupArtistChips } from "@/components/LineupArtistChips";
import {
  CALENDAR_WEEKDAYS,
  editionsInMonth,
  monthGrid,
  monthTitle,
  monthsForEditions,
} from "@/lib/calendarGrid";
import {
  dedupeDayPills,
  groupMonthLocations,
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

const BUCKET_TONE: Record<string, string> = {
  current: "bg-brand/20 text-brand",
  upcoming: "bg-amber/15 text-amber",
  recent: "bg-teal/15 text-teal",
};

const CLUB_TONE: Record<string, string> = {
  current: "bg-brand/20 text-brand",
  upcoming: "bg-brand/15 text-brand",
  recent: "bg-panel2 text-muted",
};

const NIGHT_PREVIEW = 5;

export type CalendarEdition = EditionCalendarRow & {
  name: string;
  imageUrl: string | null;
};

export type CalendarNight = VenueNightCalendarRow & {
  name: string;
  imageUrl: string | null;
};

function ClubNightRow({ night }: { night: CalendarNight }) {
  const head = night.headliner;
  const official = night.ticketsUrl || night.sourceUrl;
  return (
    <li className="py-2 first:pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] text-ink">
            <span className="mono text-[12px] text-muted2">{night.startsAt}</span>
            {" · "}
            {head?.slug ? (
              <Link
                href={`/djs/${head.slug}`}
                className="font-medium transition-colors hover:text-brand"
                title="In catalog"
              >
                {night.title}
              </Link>
            ) : (
              <span className="font-medium">{night.title}</span>
            )}
          </p>
          {night.lineup?.length ? (
            <div className="mt-1.5">
              <LineupArtistChips
                artists={night.lineup}
                previewCount={4}
                compact
              />
            </div>
          ) : null}
        </div>
        <a
          href={official}
          target="_blank"
          rel="noreferrer"
          className="mono shrink-0 text-[12px] text-brand hover:text-brandstrong"
        >
          Official →
        </a>
      </div>
    </li>
  );
}

export function FestivalCalendar({
  editions,
  nights = [],
  nowMs,
}: {
  editions: CalendarEdition[];
  nights?: CalendarNight[];
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
                              className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight ${
                                e.accent === "brand"
                                  ? (CLUB_TONE[e.bucket] ?? "bg-brand/15 text-brand")
                                  : (BUCKET_TONE[e.bucket] ?? "bg-panel2 text-muted")
                              }`}
                              title={e.tooltip}
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
                    return (
                      <li
                        key={loc.key}
                        className="card flex flex-col gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
                      >
                        <div className="flex items-start gap-3">
                          <Link
                            href={`/events/${e.eventSlug}`}
                            className="flex-none"
                          >
                            <EntityThumb
                              src={e.imageUrl}
                              label={e.name}
                              accent="var(--amber)"
                              size={44}
                              radius={12}
                              monogram={e.name.slice(0, 2).toUpperCase()}
                            />
                          </Link>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-ink">
                              <Link
                                href={`/events/${e.eventSlug}`}
                                className="transition-colors hover:text-brand"
                              >
                                {e.name}
                              </Link>
                              <span className="font-normal text-muted">
                                {` · ${e.year}${e.label ? ` ${e.label}` : ""}`}
                              </span>
                            </span>
                            <span className="mono text-[12px] text-muted2">
                              {e.startsAt}
                              {e.endsAt !== e.startsAt ? ` – ${e.endsAt}` : ""}
                              {" · "}
                              {BUCKET_COPY[e.bucket] ?? e.bucket}
                            </span>
                          </span>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={loc.key}
                      className="card flex flex-col gap-1 p-4 transition-colors hover:border-[color:var(--muted2)]"
                    >
                      <div className="flex items-start gap-3">
                        <Link
                          href={`/events/${loc.eventSlug}`}
                          className="flex-none"
                        >
                          <EntityThumb
                            src={loc.imageUrl}
                            label={loc.name}
                            accent="var(--brand)"
                            size={44}
                            radius={12}
                            monogram={loc.name.slice(0, 2).toUpperCase()}
                          />
                        </Link>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-ink">
                            <Link
                              href={`/events/${loc.eventSlug}`}
                              className="transition-colors hover:text-brand"
                            >
                              {loc.name}
                            </Link>
                          </span>
                          <span className="mono text-[12px] text-muted2">
                            {loc.startsAt}
                            {loc.endsAt !== loc.startsAt
                              ? ` – ${loc.endsAt}`
                              : ""}
                            {" · "}
                            {BUCKET_COPY[loc.bucket] ?? loc.bucket}
                            {" · "}
                            {loc.nights.length}{" "}
                            {loc.nights.length === 1 ? "night" : "nights"}
                          </span>
                        </span>
                      </div>
                      <ExpandableList
                        items={loc.nights.map((n) => (
                          <ClubNightRow key={n.slug} night={n} />
                        ))}
                        previewCount={NIGHT_PREVIEW}
                        moreLabel="nights"
                      />
                    </li>
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
