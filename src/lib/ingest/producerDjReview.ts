/**
 * Apply the producer handle-research review on verify-urls.
 * Rematch discarded set-title DJs, drop junk / non-DJ rows, fill-null keeps.
 */

import type { PrismaClient } from "@prisma/client";
import { isCuratedCatalogSlug, isTop100DjSlug } from "../djCatalog";
import {
  PRODUCER_ALIAS_EXTRAS,
  PRODUCER_DISCARD_SLUGS,
  PRODUCER_DJ_ALIASES,
  PRODUCER_DROP_SLUGS,
  PRODUCER_KEEP,
  type ProducerSocials,
} from "./producerDjReview.data";
import { slugify } from "./types";

export type ProducerReviewStats = {
  rematched: number;
  dropped: number;
  pinned: number;
};

const SOCIAL_FIELDS = [
  "instagram",
  "twitter",
  "youtube",
  "soundcloud",
  "website",
] as const;

async function rosterSlugs(): Promise<Set<string>> {
  const { ARTIST_ROSTER } = await import("./roster");
  return new Set(ARTIST_ROSTER.map((a) => slugify(a.name)));
}

function isProtectedSlug(slug: string, roster: Set<string>): boolean {
  if (isCuratedCatalogSlug(slug) || roster.has(slug)) return true;
  if (isTop100DjSlug(slug)) return true;
  return false;
}

async function ensureDj(
  prisma: PrismaClient,
  slug: string,
  name: string,
): Promise<string> {
  const existing = await prisma.dj.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.dj.create({
    data: { slug, name, accent: "#888888" },
  });
  return created.id;
}

async function relinkSet(
  prisma: PrismaClient,
  setId: string,
  canonicalId: string,
  junkId: string,
): Promise<void> {
  const links = await prisma.setArtist.findMany({
    where: { setId },
    select: { djId: true, isPrimary: true },
  });
  const hasCanon = links.some((l) => l.djId === canonicalId);
  if (!hasCanon) {
    for (const link of links) {
      if (!link.isPrimary) continue;
      await prisma.setArtist.update({
        where: { setId_djId: { setId, djId: link.djId } },
        data: { isPrimary: false },
      });
    }
    await prisma.setArtist.create({
      data: { setId, djId: canonicalId, isPrimary: true },
    });
  } else {
    const canon = links.find((l) => l.djId === canonicalId)!;
    if (!canon.isPrimary) {
      for (const link of links) {
        if (link.djId === canonicalId || !link.isPrimary) continue;
        await prisma.setArtist.update({
          where: { setId_djId: { setId, djId: link.djId } },
          data: { isPrimary: false },
        });
      }
      await prisma.setArtist.update({
        where: { setId_djId: { setId, djId: canonicalId } },
        data: { isPrimary: true },
      });
    }
  }
  const still = await prisma.setArtist.findUnique({
    where: { setId_djId: { setId, djId: junkId } },
  });
  if (still) {
    await prisma.setArtist.delete({
      where: { setId_djId: { setId, djId: junkId } },
    });
  }
}

async function removeDjRow(prisma: PrismaClient, djId: string): Promise<boolean> {
  await prisma.setArtist.deleteMany({ where: { djId } });
  await prisma.series.updateMany({ where: { djId }, data: { djId: null } });
  const remaining = await prisma.setArtist.count({ where: { djId } });
  const remainingSeries = await prisma.series.count({ where: { djId } });
  if (remaining > 0 || remainingSeries > 0) return false;
  await prisma.dj.delete({ where: { id: djId } }).catch(() => null);
  return true;
}

async function rematchDiscard(
  prisma: PrismaClient,
  junkId: string,
  targetSlug: string,
  extras: string[],
): Promise<number> {
  const name = targetSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const canonicalId = await ensureDj(prisma, targetSlug, name);
  const links = await prisma.setArtist.findMany({
    where: { djId: junkId },
    select: { setId: true },
  });
  let n = 0;
  for (const { setId } of links) {
    await relinkSet(prisma, setId, canonicalId, junkId);
    for (const extraSlug of extras) {
      if (!extraSlug || extraSlug === targetSlug) continue;
      const extraName = extraSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      const extraId = await ensureDj(prisma, extraSlug, extraName);
      const existing = await prisma.setArtist.findUnique({
        where: { setId_djId: { setId, djId: extraId } },
      });
      if (!existing) {
        await prisma.setArtist.create({
          data: { setId, djId: extraId, isPrimary: false },
        });
      }
    }
    n += 1;
  }
  await prisma.series.updateMany({
    where: { djId: junkId },
    data: { djId: canonicalId },
  });
  await removeDjRow(prisma, junkId);
  return n;
}

function pinPatch(
  existing: {
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    soundcloud: string | null;
    website: string | null;
  },
  socials: ProducerSocials,
): Record<string, string> {
  const data: Record<string, string> = {};
  for (const field of SOCIAL_FIELDS) {
    const next = socials[field]?.trim();
    if (!next) continue;
    if (existing[field]) continue;
    data[field] = next;
  }
  return data;
}

export async function applyProducerDjReview(
  prisma: PrismaClient,
): Promise<ProducerReviewStats> {
  const stats: ProducerReviewStats = { rematched: 0, dropped: 0, pinned: 0 };
  const roster = await rosterSlugs();

  for (const slug of PRODUCER_DISCARD_SLUGS) {
    const dj = await prisma.dj.findUnique({ where: { slug } });
    if (!dj) continue;
    if (isProtectedSlug(slug, roster)) continue;
    const target = PRODUCER_DJ_ALIASES[slug];
    if (target && target !== slug) {
      stats.rematched += await rematchDiscard(
        prisma,
        dj.id,
        target,
        PRODUCER_ALIAS_EXTRAS[slug] ?? [],
      );
      continue;
    }
    if (await removeDjRow(prisma, dj.id)) stats.dropped += 1;
  }

  for (const slug of PRODUCER_DROP_SLUGS) {
    const dj = await prisma.dj.findUnique({ where: { slug } });
    if (!dj) continue;
    if (isProtectedSlug(slug, roster)) continue;
    if (await removeDjRow(prisma, dj.id)) stats.dropped += 1;
  }

  for (const keep of PRODUCER_KEEP) {
    const dj = await prisma.dj.findUnique({ where: { slug: keep.slug } });
    if (!dj) continue;
    const data = pinPatch(dj, keep.socials);
    if (Object.keys(data).length === 0) continue;
    await prisma.dj.update({ where: { id: dj.id }, data });
    stats.pinned += 1;
  }

  return stats;
}
