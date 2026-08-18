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
  title?: string | null;
};

export type PlaceSetYearBand<T> = {
  year: number;
  current: boolean;
  sets: T[];
};

/** Event year printed in the set title (`TML 2018`, `Ultra Miami 2023`). */
export function yearFromSetTitle(
  title: string | null | undefined,
  nowMs = Date.now(),
): number | null {
  if (!title) return null;
  const max = new Date(nowMs).getUTCFullYear() + 1;
  const years = [...title.matchAll(/\b(20\d{2})\b/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= 2005 && n <= max);
  if (!years.length) return null;
  return years[years.length - 1]!;
}

/**
 * Place-page year band. Last 20xx in the title, else performedAt year,
 * else upload year. Never a remapped edition year.
 */
export function setBandYear(
  s: PlaceSetTimeFields,
  nowMs = Date.now(),
): number {
  const titled = yearFromSetTitle(s.title, nowMs);
  if (titled != null) return titled;
  if (s.performedAt) {
    const y = new Date(s.performedAt).getUTCFullYear();
    if (Number.isFinite(y)) return y;
  }
  const y = new Date(s.publishedAt).getUTCFullYear();
  return Number.isFinite(y) ? y : new Date(nowMs).getUTCFullYear();
}

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

/**
 * This year: from-today clock. Older bands: date descending.
 * `quality` is only a same-day tie-break (lower wins).
 */
export function comparePlaceSetInBand(
  a: PlaceSetTimeFields,
  b: PlaceSetTimeFields,
  nowMs: number,
  currentYear: boolean,
  quality = 0,
): number {
  if (currentYear) return comparePlaceSetTimes(a, b, nowMs, quality);
  const aDay = utcDayMs(setTimeMs(a));
  const bDay = utcDayMs(setTimeMs(b));
  if (aDay !== bDay) return bDay - aDay;
  return quality;
}

/** Newest year first. Used to order the seamless grid — not as UI headings. */
export function groupPlaceSetsByYear<T extends PlaceSetTimeFields>(
  sets: T[],
  nowMs: number,
  qualityOf: (s: T) => number = () => 0,
): PlaceSetYearBand<T>[] {
  const currentYear = new Date(nowMs).getUTCFullYear();
  const buckets = new Map<number, T[]>();
  for (const s of sets) {
    const year = setBandYear(s, nowMs);
    const list = buckets.get(year);
    if (list) list.push(s);
    else buckets.set(year, [s]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => {
      const current = year === currentYear;
      return {
        year,
        current,
        sets: [...items].sort((a, b) =>
          comparePlaceSetInBand(
            a,
            b,
            nowMs,
            current,
            qualityOf(a) - qualityOf(b),
          ),
        ),
      };
    });
}

/** This year (from-today clock), then older years date-descending. */
export function sortPlaceSets<T extends PlaceSetTimeFields>(
  sets: T[],
  nowMs: number,
  qualityOf: (s: T) => number = () => 0,
): T[] {
  return groupPlaceSetsByYear(sets, nowMs, qualityOf).flatMap((b) => b.sets);
}
