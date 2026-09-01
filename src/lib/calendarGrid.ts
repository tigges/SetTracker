/**
 * Month-grid helpers for the festival edition calendar.
 * Client-safe (no Prisma / Node fs). Dates are UTC (seed ISO days).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type CalendarDay = {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function isoUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function parseIsoDay(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function monthTitle(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Sunday-start month grid, padded to full weeks. */
export function monthGrid(
  year: number,
  month: number,
  nowMs = Date.now(),
): CalendarDay[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startDow = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prevMonthLast = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  const todayIso = isoUTC(new Date(nowMs));
  const cells: CalendarDay[] = [];

  for (let i = 0; i < startDow; i++) {
    const day = prevMonthLast - startDow + 1 + i;
    const dt = new Date(Date.UTC(year, month - 2, day));
    const iso = isoUTC(dt);
    cells.push({ iso, day, inMonth: false, isToday: iso === todayIso });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${pad2(month)}-${pad2(day)}`;
    cells.push({ iso, day, inMonth: true, isToday: iso === todayIso });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    const dt = new Date(Date.UTC(year, month, next));
    const iso = isoUTC(dt);
    cells.push({ iso, day: next, inMonth: false, isToday: iso === todayIso });
    next += 1;
  }
  return cells;
}

export function editionCoversDay(
  e: { startsAt: string; endsAt: string },
  iso: string,
): boolean {
  return e.startsAt <= iso && iso <= e.endsAt;
}

export type YearMonth = { year: number; month: number };

function ymKey(y: number, m: number): string {
  return `${y}-${pad2(m)}`;
}

function addMonthRange(into: Set<string>, startIso: string, endIso: string) {
  const start = parseIsoDay(startIso);
  const end = parseIsoDay(endIso);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return;
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cursor <= last) {
    into.add(ymKey(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
}

/** Current month plus every month that hosts an edition window. */
export function monthsForEditions(
  editions: { startsAt: string; endsAt: string }[],
  nowMs = Date.now(),
): YearMonth[] {
  const keys = new Set<string>();
  const now = new Date(nowMs);
  keys.add(ymKey(now.getUTCFullYear(), now.getUTCMonth() + 1));
  for (const e of editions) addMonthRange(keys, e.startsAt, e.endsAt);
  return [...keys]
    .map((k) => {
      const [ys, ms] = k.split("-");
      return { year: Number(ys), month: Number(ms) };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

/** Current month first, then upcoming, then earlier months for a fold. */
export function partitionCalendarMonths(
  months: YearMonth[],
  nowMs = Date.now(),
): {
  current: YearMonth | null;
  upcoming: YearMonth[];
  earlier: YearMonth[];
} {
  const now = new Date(nowMs);
  const cy = now.getUTCFullYear();
  const cm = now.getUTCMonth() + 1;
  const current = months.find((m) => m.year === cy && m.month === cm) ?? null;
  const upcoming = months.filter(
    (m) => m.year > cy || (m.year === cy && m.month > cm),
  );
  const earlier = months.filter(
    (m) => m.year < cy || (m.year === cy && m.month < cm),
  );
  return { current, upcoming, earlier };
}

export function monthSectionId(year: number, month: number): string {
  return `cal-${year}-${pad2(month)}`;
}

export function editionsInMonth<T extends { startsAt: string; endsAt: string }>(
  editions: T[],
  year: number,
  month: number,
): T[] {
  const start = `${year}-${pad2(month)}-01`;
  const end = isoUTC(new Date(Date.UTC(year, month, 0)));
  return editions.filter((e) => e.startsAt <= end && e.endsAt >= start);
}

export function daysCoveredByEditions(
  editions: { startsAt: string; endsAt: string }[],
): Set<string> {
  const out = new Set<string>();
  for (const e of editions) {
    const start = parseIsoDay(e.startsAt);
    const end = parseIsoDay(e.endsAt);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) continue;
    for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
      out.add(isoUTC(new Date(t)));
    }
  }
  return out;
}
