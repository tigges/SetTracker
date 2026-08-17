import type { LineupName } from "@/lib/lineupMatch";
import type { EditionCalendarBucket } from "../../festivalDrops";

const DAY_MS = 24 * 60 * 60 * 1000;

export type VenueNightCalendarRow = {
  slug: string;
  eventSlug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  bucket: EditionCalendarBucket;
  sourceUrl: string;
  ticketsUrl: string | null;
  artists: string[];
  lineup?: LineupName[];
  headliner?: LineupName | null;
};

export function bucketVenueNight(
  startsAt: string,
  endsAt: string,
  nowMs: number,
  opts?: { upcomingDays?: number; recentDays?: number },
): EditionCalendarBucket {
  const upcomingDays = opts?.upcomingDays ?? 180;
  const recentDays = opts?.recentDays ?? 45;
  const start = Date.parse(`${startsAt}T00:00:00Z`);
  const end = Date.parse(`${endsAt}T23:59:59Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "past";
  if (nowMs >= start && nowMs <= end) return "current";
  if (nowMs < start && start - nowMs <= upcomingDays * DAY_MS) return "upcoming";
  if (nowMs > end && nowMs - end <= recentDays * DAY_MS) return "recent";
  return "past";
}

export function parseJsonStringList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
