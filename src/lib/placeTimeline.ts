/**
 * Place-page clock: from today, future goes forward, past goes backward.
 * Client-safe (no Prisma / Node fs).
 */

export type PlaceTimeLane = "current" | "upcoming" | "recent";

const LANE_RANK: Record<PlaceTimeLane, number> = {
  current: 0,
  upcoming: 1,
  recent: 2,
};

export function utcDayMs(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function placeNightsHeading(
  nights: { bucket: string }[],
): "On now" | "Upcoming nights" | "Just ended" {
  if (nights.some((n) => n.bucket === "current")) return "On now";
  if (nights.some((n) => n.bucket === "upcoming")) return "Upcoming nights";
  return "Just ended";
}

/** On now → upcoming (soonest first) → just ended (latest first). */
export function comparePlaceNights<
  T extends { startsAt: string; bucket: string },
>(a: T, b: T): number {
  const ra = LANE_RANK[a.bucket as PlaceTimeLane] ?? 9;
  const rb = LANE_RANK[b.bucket as PlaceTimeLane] ?? 9;
  if (ra !== rb) return ra - rb;
  if (a.bucket === "recent") return b.startsAt.localeCompare(a.startsAt);
  return a.startsAt.localeCompare(b.startsAt);
}

export function sortPlaceNights<T extends { startsAt: string; bucket: string }>(
  nights: T[],
): T[] {
  return [...nights].sort(comparePlaceNights);
}

export type PlaceSetTimeFields = {
  publishedAt: Date | string;
  performedAt?: Date | string | null;
};

function setTimeMs(s: PlaceSetTimeFields): number {
  if (s.performedAt) {
    const t = new Date(s.performedAt).getTime();
    if (Number.isFinite(t)) return t;
  }
  const t = new Date(s.publishedAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

/**
 * Today first, then future soonest-first, then past latest-first.
 * `quality` is only a same-day tie-break (lower wins).
 */
export function comparePlaceSetTimes(
  a: PlaceSetTimeFields,
  b: PlaceSetTimeFields,
  nowMs: number,
  quality = 0,
): number {
  const today = utcDayMs(nowMs);
  const aDay = utcDayMs(setTimeMs(a));
  const bDay = utcDayMs(setTimeMs(b));
  const lane = (day: number) => (day === today ? 0 : day > today ? 1 : 2);
  const la = lane(aDay);
  const lb = lane(bDay);
  if (la !== lb) return la - lb;
  if (la === 1 && aDay !== bDay) return aDay - bDay;
  if (la === 2 && aDay !== bDay) return bDay - aDay;
  return quality;
}
