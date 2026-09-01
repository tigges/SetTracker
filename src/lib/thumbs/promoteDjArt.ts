/**
 * Pages / verify-urls: replace Deezer silhouettes with a real set cover
 * or YouTube still. Thumbs is skipped on most deploys, so this has to
 * run here or the silhouette stays stored as if it were a portrait.
 */

import type { PrismaClient } from "@prisma/client";
import { djDisplayThumb, setDisplayThumb } from "../setBrowse";
import { usableImageUrl } from "./usableImage";

export async function promoteDjArtFromSets(
  prisma: PrismaClient,
): Promise<{ djs: number; sets: number }> {
  let djs = 0;
  let sets = 0;
  const rows = await prisma.dj.findMany({
    select: {
      id: true,
      imageUrl: true,
      sets: {
        where: { isPrimary: true },
        select: {
          set: {
            select: {
              id: true,
              imageUrl: true,
              playbackUrl: true,
              sourceUrl: true,
              publishedAt: true,
            },
          },
        },
      },
    },
  });

  for (const dj of rows) {
    const catalog = [...dj.sets]
      .map((link) => link.set)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    for (const set of catalog) {
      if (usableImageUrl(set.imageUrl)) continue;
      const next = setDisplayThumb({
        imageUrl: set.imageUrl,
        playbackUrl: set.playbackUrl,
        sourceUrl: set.sourceUrl,
      });
      if (!next || next === set.imageUrl) continue;
      await prisma.set.update({
        where: { id: set.id },
        data: { imageUrl: next },
      });
      set.imageUrl = next;
      sets += 1;
    }

    const nextDj = djDisplayThumb({
      imageUrl: dj.imageUrl,
      sets: catalog,
    });
    if (!nextDj || nextDj === dj.imageUrl) continue;
    await prisma.dj.update({
      where: { id: dj.id },
      data: { imageUrl: nextDj },
    });
    djs += 1;
  }

  return { djs, sets };
}
