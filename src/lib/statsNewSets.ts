/**
 * /stats "new sets" — catalog intake by createdAt (row birth), not the
 * night they played (publishedAt / performedAt).
 *
 * Last few catalog days stay as a one-line summary; the set list and
 * older days sit in <details>.
 */

import type { PrismaClient } from "@prisma/client";
import { isoUTC } from "./calendarGrid";
import { prisma } from "./db";

export const NEW_SETS_SUMMARY_DAYS = 3;
export const NEW_SETS_DAY_LIMIT = 8;
export const NEW_SETS_QUERY_CAP = 200;
export const NEW_SETS_NAME_PREVIEW = 3;
export const NEW_SETS_LIST_PREVIEW = 8;

export type NewSetRow = {
  slug: string;
  title: string;
  type: string;
  createdAt: string;
  primaryDj: string | null;
  primaryDjSlug: string | null;
};

export type NewSetDay = {
  iso: string;
  count: number;
  names: string[];
  sets: NewSetRow[];
};

export function catalogDayKey(createdAt: Date | string): string {
  return isoUTC(typeof createdAt === "string" ? new Date(createdAt) : createdAt);
}

export function formatCatalogDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function groupNewSetsByCreatedDay(
  rows: NewSetRow[],
  dayLimit = NEW_SETS_DAY_LIMIT,
): NewSetDay[] {
  const by = new Map<string, NewSetRow[]>();
  const order: string[] = [];
  for (const row of rows) {
    const iso = catalogDayKey(row.createdAt);
    const list = by.get(iso);
    if (list) {
      list.push(row);
      continue;
    }
    by.set(iso, [row]);
    order.push(iso);
  }
  return order.slice(0, dayLimit).map((iso) => {
    const sets = by.get(iso) ?? [];
    const names: string[] = [];
    const seen = new Set<string>();
    for (const set of sets) {
      const name = set.primaryDj?.trim() || set.title.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
      if (names.length >= NEW_SETS_NAME_PREVIEW) break;
    }
    return { iso, count: sets.length, names, sets };
  });
}

export function newSetsHeadline(
  days: NewSetDay[],
  nowMs = Date.now(),
): string {
  if (days.length === 0) return "No new sets in this export";
  const latest = days[0]!;
  const today = isoUTC(new Date(nowMs));
  const yesterday = isoUTC(new Date(nowMs - 24 * 60 * 60 * 1000));
  const when =
    latest.iso === today
      ? "today"
      : latest.iso === yesterday
        ? "yesterday"
        : `on ${formatCatalogDay(latest.iso)}`;
  const lead = `${latest.count.toLocaleString()} ${when}`;
  if (days.length === 1) return lead;
  const total = days.reduce((n, d) => n + d.count, 0);
  return `${lead} · ${total.toLocaleString()} in ${days.length} catalog days`;
}

export async function getStatsNewSets(
  db: PrismaClient = prisma,
): Promise<NewSetDay[]> {
  const rows = await db.set.findMany({
    orderBy: { createdAt: "desc" },
    take: NEW_SETS_QUERY_CAP,
    select: {
      slug: true,
      title: true,
      type: true,
      createdAt: true,
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { name: true, slug: true } } },
      },
    },
  });
  return groupNewSetsByCreatedDay(
    rows.map((s) => ({
      slug: s.slug,
      title: s.title,
      type: s.type,
      createdAt: s.createdAt.toISOString(),
      primaryDj: s.artists[0]?.dj.name ?? null,
      primaryDjSlug: s.artists[0]?.dj.slug ?? null,
    })),
  );
}
