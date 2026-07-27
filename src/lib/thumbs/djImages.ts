/**
 * Curated DJ artwork that must win over Deezer / hearthis / SoundCloud avatars.
 *
 * Paths under /artists/… are served from public/ (basePath-prefixed at render).
 */

import type { PrismaClient } from "@prisma/client";

/** Hand-picked brand logos / official art keyed by Dj.slug. */
export const KNOWN_DJ_IMAGES: Record<string, string> = {
  "gentlemens-groove": "/artists/gentlemens-groove.png",
};

/**
 * Force curated images onto matching Dj rows and sets where they are primary.
 * Brand mix series keep the logo on set tiles (not the hearthis photo cover).
 */
export async function applyCuratedDjImages(
  prisma: PrismaClient,
): Promise<{ djs: number; sets: number }> {
  let djs = 0;
  let sets = 0;

  for (const [slug, imageUrl] of Object.entries(KNOWN_DJ_IMAGES)) {
    const dj = await prisma.dj.findUnique({ where: { slug } });
    if (!dj) continue;

    if (dj.imageUrl !== imageUrl) {
      await prisma.dj.update({
        where: { id: dj.id },
        data: { imageUrl },
      });
      djs += 1;
    }

    const linked = await prisma.set.findMany({
      where: { artists: { some: { djId: dj.id, isPrimary: true } } },
      select: { id: true, imageUrl: true },
    });
    for (const s of linked) {
      if (s.imageUrl === imageUrl) continue;
      await prisma.set.update({
        where: { id: s.id },
        data: { imageUrl },
      });
      sets += 1;
    }
  }

  return { djs, sets };
}
