/**
 * Resolve missing artwork URLs for DJs, labels, tracks and sets via Deezer.
 * Idempotent: skips rows that already have imageUrl.
 *
 * Usage: npm run thumbs
 * Wired into the GitHub Pages workflow after seed + ingest.
 */
import { PrismaClient } from "@prisma/client";
import {
  resolveArtistImage,
  resolveLabelImage,
  resolveSetImage,
  resolveTrackImage,
  sleep,
} from "../src/lib/thumbs/deezer";

const prisma = new PrismaClient();

/** Delay between Deezer calls to stay polite. */
const DELAY_MS = Number(process.env.THUMBS_DELAY_MS ?? 120);
/** Optional cap for tracks (0 = all). Useful for local smoke tests. */
const TRACK_LIMIT = Number(process.env.THUMBS_TRACK_LIMIT ?? 0);

type Stats = {
  djs: { scanned: number; filled: number; missed: number };
  labels: { scanned: number; filled: number; missed: number };
  tracks: { scanned: number; filled: number; missed: number };
  sets: { scanned: number; filled: number; missed: number };
};

async function main() {
  const stats: Stats = {
    djs: { scanned: 0, filled: 0, missed: 0 },
    labels: { scanned: 0, filled: 0, missed: 0 },
    tracks: { scanned: 0, filled: 0, missed: 0 },
    sets: { scanned: 0, filled: 0, missed: 0 },
  };

  console.log("[thumbs] resolving label artwork…");
  const labels = await prisma.label.findMany({
    where: { imageUrl: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  for (const l of labels) {
    stats.labels.scanned += 1;
    const url = await resolveLabelImage(l.name);
    await sleep(DELAY_MS);
    if (url) {
      await prisma.label.update({ where: { id: l.id }, data: { imageUrl: url } });
      stats.labels.filled += 1;
      console.log(`  ✓ label ${l.slug}`);
    } else {
      stats.labels.missed += 1;
      console.log(`  · label ${l.slug} (no match)`);
    }
  }

  console.log("[thumbs] resolving DJ artwork…");
  const djs = await prisma.dj.findMany({
    where: { imageUrl: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  const djImageById = new Map<string, string>();
  for (const d of djs) {
    stats.djs.scanned += 1;
    const url = await resolveArtistImage(d.name);
    await sleep(DELAY_MS);
    if (url) {
      await prisma.dj.update({ where: { id: d.id }, data: { imageUrl: url } });
      djImageById.set(d.id, url);
      stats.djs.filled += 1;
      console.log(`  ✓ dj ${d.slug}`);
    } else {
      stats.djs.missed += 1;
      console.log(`  · dj ${d.slug} (no match)`);
    }
  }
  // Also load already-filled DJ images for set fallback.
  const withImages = await prisma.dj.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  for (const d of withImages) {
    if (d.imageUrl) djImageById.set(d.id, d.imageUrl);
  }

  console.log("[thumbs] resolving track artwork…");
  const tracks = await prisma.track.findMany({
    where: { imageUrl: null },
    select: { id: true, title: true, artistName: true },
    orderBy: { title: "asc" },
    ...(TRACK_LIMIT > 0 ? { take: TRACK_LIMIT } : {}),
  });
  for (const t of tracks) {
    stats.tracks.scanned += 1;
    const url = await resolveTrackImage(t.title, t.artistName);
    await sleep(DELAY_MS);
    if (url) {
      await prisma.track.update({ where: { id: t.id }, data: { imageUrl: url } });
      stats.tracks.filled += 1;
    } else {
      stats.tracks.missed += 1;
    }
    if (stats.tracks.scanned % 25 === 0) {
      console.log(
        `  … tracks ${stats.tracks.scanned}/${tracks.length} (filled ${stats.tracks.filled})`,
      );
    }
  }

  console.log("[thumbs] resolving set artwork…");
  const sets = await prisma.set.findMany({
    where: { imageUrl: null },
    select: {
      id: true,
      title: true,
      slug: true,
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
    orderBy: { publishedAt: "desc" },
  });
  for (const s of sets) {
    stats.sets.scanned += 1;
    const primary = s.artists[0]?.dj;
    // Prefer already-resolved primary DJ image (no extra API call).
    let url = primary?.imageUrl ?? (primary ? djImageById.get(primary.id) : null) ?? null;
    if (!url) {
      url = await resolveSetImage(s.title, primary?.name ?? null);
      await sleep(DELAY_MS);
    }
    if (url) {
      await prisma.set.update({ where: { id: s.id }, data: { imageUrl: url } });
      stats.sets.filled += 1;
    } else {
      stats.sets.missed += 1;
    }
  }

  console.log("[thumbs] done:", JSON.stringify(stats, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
