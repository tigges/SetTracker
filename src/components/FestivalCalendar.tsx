import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { LineupArtistChips } from "@/components/LineupArtistChips";
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

export type CalendarEdition = EditionCalendarRow & {
  name: string;
  imageUrl: string | null;
};

export type CalendarNight = VenueNightCalendarRow & {
  name: string;
  imageUrl: string | null;
};

type CalendarItem = {
  slug: string;
  eventSlug: string;
  name: string;
  imageUrl: string | null;
  year: number;
  label?: string;
  startsAt: string;
  endsAt: string;
  bucket: string;
  kind: "festival" | "club";
  nightTitle?: string;
  lineup?: CalendarNight["lineup"];
  headliner?: CalendarNight["headliner"];
};

function shortName(e: CalendarItem): string {
  if (e.kind === "club") {
    return e.name.replace(/\s+(ibiza|phuket|london)$/i, "");
  }
  return e.name.replace(/\s+(music festival|festival|weekend)$/i, "");
}

function toItems(
  editions: CalendarEdition[],
  nights: CalendarNight[],
): CalendarItem[] {
  return [
    ...editions.map((e) => ({
      slug: e.slug,
      eventSlug: e.eventSlug,
      name: e.name,
      imageUrl: e.imageUrl,
      year: e.year,
      label: e.label,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      bucket: e.bucket,
      kind: "festival" as const,
    })),
    ...nights.map((n) => ({
      slug: n.slug,
      eventSlug: n.eventSlug,
      name: n.name,
      imageUrl: n.imageUrl,
      year: Number(n.startsAt.slice(0, 4)),
      label: n.title,
      startsAt: n.startsAt,
      endsAt: n.endsAt,
      bucket: n.bucket,
      kind: "club" as const,
      nightTitle: n.title,
      lineup: n.lineup,
      headliner: n.headliner,
    })),
  ];
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
  const items = toItems(editions, nights);
  const months = monthsForEditions(items, nowMs);
  if (items.length === 0) {
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
        const monthEds = editionsInMonth(items, year, month);
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
                                e.kind === "club"
                                  ? (CLUB_TONE[e.bucket] ?? "bg-brand/15 text-brand")
                                  : (BUCKET_TONE[e.bucket] ?? "bg-panel2 text-muted")
                              }`}
                              title={
                                e.kind === "club"
                                  ? `${e.name} · ${e.nightTitle}`
                                  : editionLabel(e)
                              }
                            >
                              {e.kind === "club"
                                ? `${shortName(e)}${e.nightTitle ? ` · ${e.nightTitle}` : ""}`
                                : shortName(e)}
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
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {monthEds.map((e) => {
                  const club = e.kind === "club";
                  const head = e.headliner;
                  const title = club && e.nightTitle ? e.nightTitle : e.name;
                  const thumbHref =
                    club && head?.slug ? `/djs/${head.slug}` : `/events/${e.eventSlug}`;
                  return (
                    <li
                      key={e.slug}
                      className="card flex flex-col gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
                    >
                      <div className="flex items-start gap-3">
                        <Link href={thumbHref} className="flex-none">
                          <EntityThumb
                            src={club ? (head?.imageUrl ?? e.imageUrl) : e.imageUrl}
                            label={title}
                            accent={
                              club
                                ? head?.accent || "var(--brand)"
                                : "var(--amber)"
                            }
                            size={44}
                            radius={12}
                            monogram={title.slice(0, 2).toUpperCase()}
                          />
                        </Link>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-ink">
                            {club && head?.slug ? (
                              <Link
                                href={`/djs/${head.slug}`}
                                className="transition-colors hover:text-brand"
                                title="In catalog"
                              >
                                {title}
                              </Link>
                            ) : (
                              <Link
                                href={`/events/${e.eventSlug}`}
                                className="transition-colors hover:text-brand"
                              >
                                {title}
                              </Link>
                            )}
                            <span className="font-normal text-muted">
                              {club ? (
                                <>
                                  {" · "}
                                  <Link
                                    href={`/events/${e.eventSlug}`}
                                    className="transition-colors hover:text-ink"
                                  >
                                    {e.name}
                                  </Link>
                                </>
                              ) : (
                                ` · ${e.year}${e.label ? ` ${e.label}` : ""}`
                              )}
                            </span>
                          </span>
                          <span className="mono text-[12px] text-muted2">
                            {e.startsAt}
                            {e.endsAt !== e.startsAt ? ` – ${e.endsAt}` : ""}
                            {" · "}
                            {BUCKET_COPY[e.bucket] ?? e.bucket}
                          </span>
                          {club && e.lineup?.length ? (
                            <div className="mt-2">
                              <LineupArtistChips
                                artists={e.lineup}
                                previewCount={4}
                                compact
                              />
                            </div>
                          ) : null}
                        </span>
                      </div>
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
