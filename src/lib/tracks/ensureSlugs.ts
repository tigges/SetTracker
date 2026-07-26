/**
 * Ensure every Track has a stable artist-title slug (not a bare cuid).
 * Safe to call repeatedly — only rewrites rows whose slug is missing or equals id.
 */

import type { PrismaClient } from "@prisma/client";
import { allocateTrackSlug, trackSlugBase } from "./slug";

export async function ensureTrackSlugs(prisma: PrismaClient): Promise<number> {
  const rows = await prisma.track.findMany({
    select: { id: true, slug: true, title: true, artistName: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) return 0;

  const taken = new Set(rows.map((r) => r.slug).filter(Boolean));
  let updated = 0;

  for (const row of rows) {
    const needsRewrite = !row.slug || row.slug === row.id;
    if (!needsRewrite) continue;

    // Free current placeholder so allocate can reuse the natural base.
    if (row.slug) taken.delete(row.slug);

    const slug = await allocateTrackSlug(
      row.artistName,
      row.title,
      async (candidate) => taken.has(candidate),
      trackSlugBase(row.artistName, row.title),
    );
    taken.add(slug);
    if (slug !== row.slug) {
      await prisma.track.update({ where: { id: row.id }, data: { slug } });
      updated += 1;
    }
  }

  return updated;
}
