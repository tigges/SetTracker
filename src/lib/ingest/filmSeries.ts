/**
 * Destination-film clusters (Hot Since 82 Pirate Ship, …).
 *
 * These are Series — recurring named films — never Dj rows.
 * One-off album films (Recovery balloon) stay as Sets on the artist.
 */

import type { PrismaClient } from "@prisma/client";
import { slugify } from "./types";

/** Recurring cinematic cluster from a set title, if any. */
export function inferFilmSeriesName(title: string): string | undefined {
  if (/\bpirate\s+ship\b/i.test(title)) return "Pirate Ship";
  return undefined;
}

/**
 * Soft-fill Series on existing sets whose titles are a known film cluster.
 * Does not overwrite an already-linked series.
 */
export async function attachInferredFilmSeries(
  prisma: PrismaClient,
): Promise<number> {
  const sets = await prisma.set.findMany({
    where: {
      seriesId: null,
      title: { contains: "Pirate" },
    },
    select: {
      id: true,
      title: true,
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { djId: true },
      },
    },
  });

  let attached = 0;
  for (const set of sets) {
    const name = inferFilmSeriesName(set.title);
    if (!name) continue;
    const slug = slugify(name);
    const hostId = set.artists[0]?.djId ?? null;
    let series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      series = await prisma.series.create({
        data: { slug, name, ...(hostId ? { djId: hostId } : {}) },
      });
    } else if (!series.djId && hostId) {
      series = await prisma.series.update({
        where: { id: series.id },
        data: { djId: hostId },
      });
    }
    await prisma.set.update({
      where: { id: set.id },
      data: { seriesId: series.id },
    });
    attached += 1;
  }
  return attached;
}
