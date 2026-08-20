/**
 * Fill-null Set.performedAt from a printed calendar day (title or curated
 * 1001 URL). Year-only titles stay null — July 1 is not a real night.
 */

import type { PrismaClient } from "@prisma/client";
import { derivePerformedAt } from "./derivePerformedAt";
import { curated1001UrlBySourceSlug } from "./youtube/videos";

export { derivePerformedAt };

export async function backfillPerformedAt(
  prisma: PrismaClient,
  nowMs = Date.now(),
): Promise<number> {
  const urlBySlug = curated1001UrlBySourceSlug();
  const rows = await prisma.set.findMany({
    where: { performedAt: null },
    select: { id: true, slug: true, title: true },
  });
  let n = 0;
  for (const row of rows) {
    const when = derivePerformedAt(row.title, row.slug, urlBySlug, nowMs);
    if (!when) continue;
    await prisma.set.update({
      where: { id: row.id },
      data: { performedAt: when },
    });
    n += 1;
  }
  return n;
}
