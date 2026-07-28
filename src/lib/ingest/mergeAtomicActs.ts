/**
 * Fold accidental half-name Dj rows (walker / royce) onto canonical duo acts
 * and repair SetArtist links so sets show one primary — not fake b2b.
 */

import type { PrismaClient } from "@prisma/client";
import { ATOMIC_ACTS, atomicActPattern } from "./atomicActs";

export type MergeAtomicStats = {
  ensured: number;
  setsRelinked: number;
  junkRemoved: number;
};

/** Distinctive title needles (avoid matching unrelated sets). */
function titleNeedles(name: string): string[] {
  const amp = name.replace(/\s*&\s*/g, " & ");
  const and = name.replace(/\s*&\s*/g, " and ");
  return [...new Set([name, amp, and, name.toUpperCase()])];
}

async function ensureCanonical(
  prisma: PrismaClient,
  slug: string,
  name: string,
): Promise<string> {
  const existing = await prisma.dj.findUnique({ where: { slug } });
  if (existing) {
    if (existing.name !== name) {
      await prisma.dj.update({
        where: { id: existing.id },
        data: { name },
      });
    }
    if (
      slug === "walker-royce" &&
      existing.website !== "https://www.walkerandroyce.com/"
    ) {
      await prisma.dj.update({
        where: { id: existing.id },
        data: {
          website: "https://www.walkerandroyce.com/",
          homeCity: existing.homeCity ?? "New York, US",
        },
      });
    }
    return existing.id;
  }
  const created = await prisma.dj.create({
    data: {
      slug,
      name,
      accent: slug === "walker-royce" ? "#9ef01a" : "#f77f00",
      homeCity: slug === "walker-royce" ? "New York, US" : null,
      website:
        slug === "walker-royce" ? "https://www.walkerandroyce.com/" : null,
      bio:
        slug === "walker-royce"
          ? "Tech House. NYC duo (Sam Walker & Gavin Royce)."
          : null,
    },
  });
  return created.id;
}

/**
 * Relink sets that wrongly list duo halves as primary/collaborator onto the
 * canonical act; delete empty junk Dj rows.
 */
export async function mergeSplitAtomicActs(
  prisma: PrismaClient,
): Promise<MergeAtomicStats> {
  let ensured = 0;
  let setsRelinked = 0;
  let junkRemoved = 0;

  for (const act of ATOMIC_ACTS) {
    const canonicalId = await ensureCanonical(prisma, act.slug, act.name);
    ensured += 1;
    const titleRe = atomicActPattern(act.name);

    const junkIds: string[] = [];
    for (const junkSlug of act.junkSlugs) {
      const junk = await prisma.dj.findUnique({ where: { slug: junkSlug } });
      if (junk) junkIds.push(junk.id);
    }

    const setIds = new Set<string>();
    for (const needle of titleNeedles(act.name)) {
      const rows = await prisma.set.findMany({
        where: { title: { contains: needle } },
        select: { id: true, title: true },
      });
      for (const s of rows) {
        if (titleRe.test(s.title)) setIds.add(s.id);
        titleRe.lastIndex = 0;
      }
    }

    // Classic false b2b: both half-name DJs linked on the same set.
    if (junkIds.length >= 2) {
      const withJunk = await prisma.set.findMany({
        where: { artists: { some: { djId: { in: junkIds } } } },
        select: {
          id: true,
          artists: { select: { djId: true } },
        },
      });
      for (const s of withJunk) {
        const n = s.artists.filter((a) => junkIds.includes(a.djId)).length;
        if (n >= 2) setIds.add(s.id);
      }
    }

    for (const setId of setIds) {
      const set = await prisma.set.findUnique({
        where: { id: setId },
        select: {
          id: true,
          artists: { select: { djId: true, isPrimary: true } },
        },
      });
      if (!set) continue;

      const existingCanon = set.artists.find((a) => a.djId === canonicalId);
      if (!existingCanon) {
        for (const link of set.artists) {
          if (!link.isPrimary) continue;
          await prisma.setArtist.update({
            where: { setId_djId: { setId: set.id, djId: link.djId } },
            data: { isPrimary: false },
          });
        }
        await prisma.setArtist.create({
          data: { setId: set.id, djId: canonicalId, isPrimary: true },
        });
      } else if (!existingCanon.isPrimary) {
        for (const link of set.artists) {
          if (link.djId === canonicalId || !link.isPrimary) continue;
          await prisma.setArtist.update({
            where: { setId_djId: { setId: set.id, djId: link.djId } },
            data: { isPrimary: false },
          });
        }
        await prisma.setArtist.update({
          where: { setId_djId: { setId: set.id, djId: canonicalId } },
          data: { isPrimary: true },
        });
      }

      for (const link of set.artists) {
        if (!junkIds.includes(link.djId)) continue;
        await prisma.setArtist.delete({
          where: { setId_djId: { setId: set.id, djId: link.djId } },
        });
      }

      setsRelinked += 1;
    }

    for (const junkId of junkIds) {
      const remaining = await prisma.setArtist.count({
        where: { djId: junkId },
      });
      if (remaining > 0) continue;
      await prisma.dj.delete({ where: { id: junkId } });
      junkRemoved += 1;
    }
  }

  return { ensured, setsRelinked, junkRemoved };
}
