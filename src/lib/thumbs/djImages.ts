/**
 * Curated DJ artwork that must win over Deezer / hearthis / SoundCloud avatars.
 *
 * Paths under /artists/… are served from public/ (basePath-prefixed at render).
 */

import type { PrismaClient } from "@prisma/client";
import { DJ_SLUG_ALIASES } from "../ingest/djSlugAliases";

/** Hand-picked brand logos / official art keyed by Dj.slug. */
export const KNOWN_DJ_IMAGES: Record<string, string> = {
  "gentlemens-groove": "/artists/gentlemens-groove.png",
  // Accidental slugify("Gentlemen's Groove") variant — pin logo until merge.
  "gentlemen-s-groove": "/artists/gentlemens-groove.png",
  // Official Deezer artist portrait (id 14043917).
  "1788-l": "/artists/1788-l.jpg",
  // Spotify artist portrait (oembed from open.spotify.com/artist/3YiM6gLNY4UzJPcsnJBWQJ).
  // Deezer "Bdk" 4574796 is a different act (BDK RIDERS graphic).
  bdk: "/artists/bdk.jpg",
  // Homepage hero on bexxiemusic.com (Exchange LA, Nov 2024). Deezer is a
  // blank silhouette placeholder.
  bexxie: "/artists/bexxie.jpg",
};

/**
 * Force curated images onto matching Dj rows and sets where they are primary.
 * Brand mix series keep the logo on set tiles (not the hearthis photo cover).
 * Also folds alias DJ rows onto the canonical slug when both exist.
 */
export async function applyCuratedDjImages(
  prisma: PrismaClient,
): Promise<{ djs: number; sets: number; merged: number }> {
  let djs = 0;
  let sets = 0;
  let merged = 0;

  for (const [alias, canonical] of Object.entries(DJ_SLUG_ALIASES)) {
    const from = await prisma.dj.findUnique({ where: { slug: alias } });
    const to = await prisma.dj.findUnique({ where: { slug: canonical } });
    if (!from || !to || from.id === to.id) continue;
    const links = await prisma.setArtist.findMany({
      where: { djId: from.id },
      select: { setId: true, isPrimary: true },
    });
    for (const link of links) {
      const already = await prisma.setArtist.findFirst({
        where: { setId: link.setId, djId: to.id },
      });
      if (already) {
        await prisma.setArtist.delete({
          where: {
            setId_djId: { setId: link.setId, djId: from.id },
          },
        });
      } else {
        await prisma.setArtist.update({
          where: {
            setId_djId: { setId: link.setId, djId: from.id },
          },
          data: { djId: to.id },
        });
      }
    }
    // Series also FK to Dj — reassign before delete (P2003 otherwise).
    await prisma.series.updateMany({
      where: { djId: from.id },
      data: { djId: to.id },
    });
    const remainingLinks = await prisma.setArtist.count({
      where: { djId: from.id },
    });
    const remainingSeries = await prisma.series.count({
      where: { djId: from.id },
    });
    if (remainingLinks === 0 && remainingSeries === 0) {
      await prisma.dj.delete({ where: { id: from.id } });
      merged += 1;
    }
  }

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

  return { djs, sets, merged };
}
