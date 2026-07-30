/**
 * Persist curated EventEdition rows and link Sets by title/year.
 */

import type { PrismaClient } from "@prisma/client";
import { KNOWN_EVENTS } from "./events";
import {
  FESTIVAL_EDITION_SEEDS,
  matchEditionSeed,
} from "./festivalDrops";

export async function ensureFestivalEditions(
  prisma: PrismaClient,
): Promise<number> {
  let n = 0;
  for (const seed of FESTIVAL_EDITION_SEEDS) {
    let event = await prisma.event.findUnique({
      where: { slug: seed.eventSlug },
    });
    // Ops brain: create curated festival brands before any set lands.
    if (!event) {
      const canon = KNOWN_EVENTS[seed.eventSlug];
      if (!canon) continue;
      event = await prisma.event.create({
        data: {
          slug: canon.slug,
          name: canon.name,
          kind: canon.kind,
          location: canon.location ?? null,
          website: canon.website ?? null,
          soundcloud: canon.soundcloud ?? null,
          instagram: canon.instagram ?? null,
          twitter: canon.twitter ?? null,
        },
      });
    }
    const existing = await prisma.eventEdition.findUnique({
      where: { slug: seed.slug },
    });
    if (existing) continue;
    await prisma.eventEdition.create({
      data: {
        slug: seed.slug,
        eventId: event.id,
        year: seed.year,
        label: seed.label ?? null,
        startsAt: new Date(`${seed.startsAt}T12:00:00Z`),
        endsAt: new Date(`${seed.endsAt}T23:59:59Z`),
      },
    });
    n += 1;
  }
  return n;
}

/** Attach EventEdition to existing festival sets from title/year + event brand. */
export async function backfillSetEditions(
  prisma: PrismaClient,
): Promise<number> {
  await ensureFestivalEditions(prisma);
  const sets = await prisma.set.findMany({
    where: {
      editionId: null,
      eventId: { not: null },
      event: { kind: "festival" },
    },
    select: {
      id: true,
      title: true,
      publishedAt: true,
      event: { select: { slug: true } },
    },
    take: 500,
  });
  let n = 0;
  for (const s of sets) {
    const slug = s.event?.slug;
    if (!slug) continue;
    const seed = matchEditionSeed(slug, s.title, s.publishedAt);
    if (!seed) continue;
    const ed = await prisma.eventEdition.findUnique({
      where: { slug: seed.slug },
    });
    if (!ed) continue;
    await prisma.set.update({
      where: { id: s.id },
      data: {
        editionId: ed.id,
        performedAt: ed.endsAt ?? s.publishedAt,
      },
    });
    n += 1;
  }
  return n;
}
