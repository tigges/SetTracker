/**
 * Resolve artwork URLs for DJs, labels, tracks and sets via Deezer (+ iTunes
 * for track covers). Wired into the GitHub Pages workflow after seed + ingest.
 *
 * Behaviour:
 * - Labels: fill when imageUrl is null
 * - DJs: always re-resolve (cheap; fixes wrong artist matches after matcher upgrades)
 * - Tracks: fill nulls, and re-resolve rows that only have an artist portrait so
 *   we can upgrade to release cover art when available
 * - Sets: fill nulls; refresh when primary DJ image changed
 *
 * Usage: npm run thumbs
 */
import { PrismaClient } from "@prisma/client";
import {
  isArtistArtUrl,
  resolveArtistImage,
  resolveLabelImage,
  resolveSetImage,
  resolveTrackImage,
  sleep,
} from "../src/lib/thumbs/deezer";

const prisma = new PrismaClient();

/** Delay between API calls to stay polite. */
const DELAY_MS = Number(process.env.THUMBS_DELAY_MS ?? 120);
/** Optional cap for tracks (0 = all). Useful for local smoke tests. */
const TRACK_LIMIT = Number(process.env.THUMBS_TRACK_LIMIT ?? 0);

type Stats = {
  djs: { scanned: number; filled: number; missed: number; updated: number };
  labels: { scanned: number; filled: number; missed: number };
  tracks: {
    scanned: number;
    filled: number;
    missed: number;
    covers: number;
    artistFallback: number;
    upgraded: number;
  };
  sets: { scanned: number; filled: number; missed: number; updated: number };
};

async function main() {
  const stats: Stats = {
    djs: { scanned: 0, filled: 0, missed: 0, updated: 0 },
    labels: { scanned: 0, filled: 0, missed: 0 },
    tracks: {
      scanned: 0,
      filled: 0,
      missed: 0,
      covers: 0,
      artistFallback: 0,
      upgraded: 0,
    },
    sets: { scanned: 0, filled: 0, missed: 0, updated: 0 },
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

  console.log("[thumbs] resolving DJ artwork (refresh all)…");
  const djs = await prisma.dj.findMany({
    select: { id: true, name: true, slug: true, imageUrl: true },
    orderBy: { name: "asc" },
  });
  const djImageById = new Map<string, string>();
  for (const d of djs) {
    stats.djs.scanned += 1;
    const url = await resolveArtistImage(d.name);
    await sleep(DELAY_MS);
    if (url) {
      if (d.imageUrl !== url) {
        await prisma.dj.update({ where: { id: d.id }, data: { imageUrl: url } });
        stats.djs.updated += 1;
        console.log(`  ✓ dj ${d.slug}${d.imageUrl ? " (updated)" : ""}`);
      } else {
        console.log(`  = dj ${d.slug}`);
      }
      djImageById.set(d.id, url);
      stats.djs.filled += 1;
    } else {
      stats.djs.missed += 1;
      console.log(`  · dj ${d.slug} (no match)`);
    }
  }

  console.log("[thumbs] resolving track artwork (covers preferred)…");
  const tracks = await prisma.track.findMany({
    select: { id: true, title: true, artistName: true, imageUrl: true },
    orderBy: { title: "asc" },
    ...(TRACK_LIMIT > 0 ? { take: TRACK_LIMIT } : {}),
  });
  // Only hit the network for missing art or artist-portrait fallbacks we can upgrade.
  const trackQueue = tracks.filter((t) => !t.imageUrl || isArtistArtUrl(t.imageUrl));
  for (const t of trackQueue) {
    stats.tracks.scanned += 1;
    const prev = t.imageUrl;
    const result = await resolveTrackImage(t.title, t.artistName);
    await sleep(DELAY_MS);
    if (result) {
      if (prev !== result.url) {
        await prisma.track.update({
          where: { id: t.id },
          data: { imageUrl: result.url },
        });
        if (prev && result.kind === "cover") stats.tracks.upgraded += 1;
      }
      stats.tracks.filled += 1;
      if (result.kind === "cover") stats.tracks.covers += 1;
      else stats.tracks.artistFallback += 1;
    } else {
      stats.tracks.missed += 1;
    }
    if (stats.tracks.scanned % 25 === 0) {
      console.log(
        `  … tracks ${stats.tracks.scanned}/${trackQueue.length}` +
          ` (covers ${stats.tracks.covers}, artist-fallback ${stats.tracks.artistFallback}, upgraded ${stats.tracks.upgraded})`,
      );
    }
  }

  console.log("[thumbs] resolving set artwork…");
  const sets = await prisma.set.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
    orderBy: { publishedAt: "desc" },
  });
  for (const s of sets) {
    const primary = s.artists[0]?.dj;
    const djUrl =
      primary?.imageUrl ?? (primary ? djImageById.get(primary.id) : null) ?? null;

    // Refresh when empty, or when set art still points at a stale DJ portrait.
    const needsWork =
      !s.imageUrl ||
      (djUrl && isArtistArtUrl(s.imageUrl) && s.imageUrl !== djUrl);

    if (!needsWork) continue;
    stats.sets.scanned += 1;

    let url = djUrl;
    if (!url) {
      url = await resolveSetImage(s.title, primary?.name ?? null);
      await sleep(DELAY_MS);
    }
    if (url) {
      if (s.imageUrl !== url) {
        await prisma.set.update({ where: { id: s.id }, data: { imageUrl: url } });
        stats.sets.updated += 1;
      }
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
