/**
 * Curated set covers that must win over a dead YouTube still.
 *
 * Paths under /sets/… are served from public/ (basePath-prefixed at render).
 * Drop a pin when the official watch URL is public again so iytimg can return.
 */

import type { PrismaClient } from "@prisma/client";

/** Hand-picked meantime covers keyed by Set.slug (YT ids are case-sensitive). */
export const KNOWN_SET_IMAGES: Record<string, string> = {
  // Official Crystal Garden WE2 watch (PlArfyuzuqo) is private; iytimg 404s.
  // Tomorrowland Belgium 2026 still from the official lineup article until
  // the full-set upload is public again.
  "yt-PlArfyuzuqo": "/sets/john-summit-tml-we2-2026.jpg",
};

export function curatedSetImage(slug: string): string | undefined {
  return KNOWN_SET_IMAGES[slug];
}

/**
 * Force curated covers onto matching Set rows (dead iytimg / DJ portrait).
 */
export async function applyCuratedSetImages(
  prisma: PrismaClient,
): Promise<number> {
  let n = 0;
  for (const [slug, imageUrl] of Object.entries(KNOWN_SET_IMAGES)) {
    const existing = await prisma.set.findUnique({
      where: { slug },
      select: { id: true, imageUrl: true },
    });
    if (!existing) continue;
    if (existing.imageUrl === imageUrl) continue;
    await prisma.set.update({
      where: { id: existing.id },
      data: { imageUrl },
    });
    n += 1;
  }
  return n;
}
