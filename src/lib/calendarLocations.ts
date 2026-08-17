/**
 * Group festival editions + club nights into place-level month cards,
 * and collapse same-venue day pills on the month grid.
 * Client-safe (no Prisma / Node fs).
 */

import { editionCoversDay } from "@/lib/calendarGrid";
import { editionLabel } from "@/lib/ingest/festivalDrops";
import type { EditionCalendarBucket } from "@/lib/ingest/festivalDrops";

export type LocationBucket = Exclude<EditionCalendarBucket, "past">;

const BUCKET_RANK: Record<EditionCalendarBucket, number> = {
  current: 3,
  upcoming: 2,
  recent: 1,
  past: 0,
};

export function venueShortName(name: string): string {
  return name.replace(/\s+(ibiza|phuket|london)$/i, "");
}

export function festivalShortName(name: string): string {
  return name.replace(/\s+(music festival|festival|weekend)$/i, "");
}

/** Current wins, then upcoming, then recent. */
export function mergeLocationBucket(
  buckets: EditionCalendarBucket[],
): LocationBucket {
  let best: EditionCalendarBucket = "recent";
  for (const b of buckets) {
    if (BUCKET_RANK[b] > BUCKET_RANK[best]) best = b;
  }
  return best === "past" ? "recent" : best;
}

export type MonthFestivalLocation<E> = {
  kind: "festival";
  key: string;
  startsAt: string;
  endsAt: string;
  bucket: LocationBucket;
  edition: E;
};

export type MonthClubLocation<N> = {
  kind: "club";
  key: string;
  startsAt: string;
  endsAt: string;
  bucket: LocationBucket;
  eventSlug: string;
  name: string;
  imageUrl: string | null;
  nights: N[];
};

export type MonthLocation<E, N> =
  | MonthFestivalLocation<E>
  | MonthClubLocation<N>;

type DatedBucket = {
  slug: string;
  startsAt: string;
  endsAt: string;
  bucket: EditionCalendarBucket | string;
};

type ClubNightInput = DatedBucket & {
  eventSlug: string;
  name: string;
  imageUrl: string | null;
};

/**
 * One card per festival edition, one card per club venue in the month.
 * Club date range is min(startsAt)–max(endsAt) of that month’s nights.
 */
export function groupMonthLocations<
  E extends DatedBucket,
  N extends ClubNightInput,
>(editions: E[], nights: N[]): MonthLocation<E, N>[] {
  const clubs = new Map<string, N[]>();
  for (const n of nights) {
    const list = clubs.get(n.eventSlug) ?? [];
    list.push(n);
    clubs.set(n.eventSlug, list);
  }

  const out: MonthLocation<E, N>[] = [];
  for (const e of editions) {
    out.push({
      kind: "festival",
      key: `fest:${e.slug}`,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      bucket: (e.bucket === "past" ? "recent" : e.bucket) as LocationBucket,
      edition: e,
    });
  }
  for (const [eventSlug, group] of clubs) {
    const sorted = [...group].sort(
      (a, b) => a.startsAt.localeCompare(b.startsAt) || a.slug.localeCompare(b.slug),
    );
    const first = sorted[0]!;
    const startsAt = first.startsAt;
    const endsAt = sorted.reduce(
      (max, n) => (n.endsAt > max ? n.endsAt : max),
      first.endsAt,
    );
    out.push({
      kind: "club",
      key: `club:${eventSlug}`,
      startsAt,
      endsAt,
      bucket: mergeLocationBucket(
        sorted.map((n) => n.bucket as EditionCalendarBucket),
      ),
      eventSlug,
      name: first.name,
      imageUrl: first.imageUrl,
      nights: sorted,
    });
  }
  return out.sort(
    (a, b) => a.startsAt.localeCompare(b.startsAt) || a.key.localeCompare(b.key),
  );
}

export type CalendarOccurrence = {
  id: string;
  groupKey: string;
  name: string;
  tooltip: string;
  href: string;
  startsAt: string;
  endsAt: string;
  accent: "amber" | "brand";
  bucket: string;
};

export function toCalendarOccurrences(
  editions: Array<{
    slug: string;
    eventSlug: string;
    name: string;
    year: number;
    label?: string;
    startsAt: string;
    endsAt: string;
    bucket: string;
  }>,
  nights: Array<{
    slug: string;
    eventSlug: string;
    name: string;
    title: string;
    startsAt: string;
    endsAt: string;
    bucket: string;
  }>,
): CalendarOccurrence[] {
  return [
    ...editions.map((e) => ({
      id: e.slug,
      groupKey: `fest:${e.slug}`,
      name: festivalShortName(e.name),
      tooltip: editionLabel(e),
      href: `/events/${e.eventSlug}`,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      accent: "amber" as const,
      bucket: e.bucket,
    })),
    ...nights.map((n) => ({
      id: n.slug,
      groupKey: `club:${n.eventSlug}`,
      name: venueShortName(n.name),
      tooltip: n.title,
      href: `/events/${n.eventSlug}`,
      startsAt: n.startsAt,
      endsAt: n.endsAt,
      accent: "brand" as const,
      bucket: n.bucket,
    })),
  ];
}

/** Same venue (or same festival edition) on one day collapses to a single pill. */
export function dedupeDayPills(
  hits: CalendarOccurrence[],
): CalendarOccurrence[] {
  const seen = new Map<string, CalendarOccurrence>();
  for (const h of hits) {
    const existing = seen.get(h.groupKey);
    if (!existing) {
      seen.set(h.groupKey, h);
      continue;
    }
    if (h.tooltip && !existing.tooltip.includes(h.tooltip)) {
      seen.set(h.groupKey, {
        ...existing,
        tooltip: `${existing.tooltip}; ${h.tooltip}`,
      });
    }
  }
  return [...seen.values()];
}

export function occurrencesOnDay(
  items: CalendarOccurrence[],
  iso: string,
): CalendarOccurrence[] {
  return items.filter((e) => editionCoversDay(e, iso));
}

/** Soonest current/upcoming night; otherwise the earliest night in the month. */
export function nextClubNight<N extends { startsAt: string; bucket: string }>(
  nights: N[],
): N | null {
  if (nights.length === 0) return null;
  const live = nights.filter(
    (n) => n.bucket === "current" || n.bucket === "upcoming",
  );
  const pool = live.length > 0 ? live : nights;
  return (
    [...pool].sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null
  );
}
