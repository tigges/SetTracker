/**
 * Drop hearthis-category hobbyists that are not catalog acts.
 * Runs from verify-urls so Pages cleans Harlemoverdrive-style leaks.
 */

import type { PrismaClient } from "@prisma/client";
import {
  isCatalogWorkDj,
  isCuratedCatalogSlug,
  isTop100DjSlug,
} from "../djCatalog";
import { slugify } from "./types";

export type ResolveLowSignalStats = {
  scanned: number;
  setsDeleted: number;
  djsRemoved: number;
};

async function deleteSet(prisma: PrismaClient, setId: string): Promise<void> {
  await prisma.played.deleteMany({ where: { setId } });
  await prisma.setArtist.deleteMany({ where: { setId } });
  await prisma.set.delete({ where: { id: setId } });
}

async function rosterSlugs(): Promise<Set<string>> {
  const { ARTIST_ROSTER } = await import("./roster");
  return new Set(ARTIST_ROSTER.map((a) => slugify(a.name)));
}

export async function resolveLowSignalDjs(
  prisma: PrismaClient,
): Promise<ResolveLowSignalStats> {
  const stats: ResolveLowSignalStats = {
    scanned: 0,
    setsDeleted: 0,
    djsRemoved: 0,
  };
  const roster = await rosterSlugs();
  const djs = await prisma.dj.findMany({
    select: { id: true, slug: true },
  });

  for (const dj of djs) {
    if (isCuratedCatalogSlug(dj.slug) || roster.has(dj.slug)) continue;
    if (isTop100DjSlug(dj.slug)) continue;

    const owned = await prisma.setArtist.findMany({
      where: { djId: dj.id },
      select: {
        set: {
          select: {
            id: true,
            sourceName: true,
            sourceUrl: true,
            type: true,
            event: { select: { kind: true } },
          },
        },
      },
    });
    const sets = owned.map((o) => ({
      sourceName: o.set.sourceName,
      sourceUrl: o.set.sourceUrl,
      type: o.set.type,
      eventKind: o.set.event?.kind ?? null,
    }));
    if (
      isCatalogWorkDj({
        slug: dj.slug,
        isTop100: false,
        sets,
      })
    ) {
      continue;
    }
    stats.scanned += 1;

    const setIds = [...new Set(owned.map((o) => o.set.id))];
    for (const setId of setIds) {
      const others = await prisma.setArtist.count({
        where: { setId, djId: { not: dj.id } },
      });
      if (others === 0) {
        await deleteSet(prisma, setId);
        stats.setsDeleted += 1;
      } else {
        await prisma.setArtist.deleteMany({
          where: { setId, djId: dj.id },
        });
      }
    }
    await prisma.series.updateMany({
      where: { djId: dj.id },
      data: { djId: null },
    });
    const remaining = await prisma.setArtist.count({ where: { djId: dj.id } });
    if (remaining === 0) {
      await prisma.dj.delete({ where: { id: dj.id } }).catch(() => null);
      stats.djsRemoved += 1;
    }
  }

  return stats;
}
