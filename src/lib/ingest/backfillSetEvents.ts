/**
 * Soft-attach Event to sets with null eventId when the title names a festival.
 */
import type { PrismaClient } from "@prisma/client";
import { inferFestivalEvent } from "./events";
import { slugify } from "./types";

export async function backfillSetEventsFromTitles(
  prisma: PrismaClient,
  opts: { limit?: number; dry?: boolean } = {},
): Promise<{ attached: number; scanned: number; byEvent: Record<string, number> }> {
  const limit = opts.limit ?? Number(process.env.EVENT_BACKFILL_LIMIT || 800);
  const dry = opts.dry ?? process.env.EVENT_BACKFILL_DRY === "1";

  const sets = await prisma.set.findMany({
    where: { eventId: null },
    select: { id: true, title: true, sourceName: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  let attached = 0;
  const byEvent: Record<string, number> = {};

  for (const s of sets) {
    const fest =
      inferFestivalEvent(s.title) ||
      (s.sourceName ? inferFestivalEvent(s.sourceName) : null);
    if (!fest) continue;

    byEvent[fest.slug] = (byEvent[fest.slug] ?? 0) + 1;
    if (dry) {
      attached++;
      continue;
    }

    let event = await prisma.event.findUnique({ where: { slug: fest.slug } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          slug: fest.slug || slugify(fest.name),
          name: fest.name,
          kind: fest.kind,
          location: fest.location ?? null,
          website: fest.website ?? null,
          instagram: fest.instagram ?? null,
          twitter: fest.twitter ?? null,
        },
      });
    }

    await prisma.set.update({
      where: { id: s.id },
      data: { eventId: event.id },
    });
    attached++;
  }

  return { attached, scanned: sets.length, byEvent };
}
