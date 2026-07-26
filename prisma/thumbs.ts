/**
 * Resolve artwork URLs for DJs, labels, tracks and sets via Deezer (+ iTunes
 * for track covers). Wired into the GitHub Pages workflow after seed + ingest.
 *
 * Behaviour:
 * - Labels: fill when imageUrl is null
 * - DJs: always re-resolve (cheap; fixes wrong artist matches after matcher upgrades)
 * - Tracks: fill nulls, and re-resolve rows that only have an artist portrait so
 *   we can upgrade to release cover art when available; also fill durationSec /
 *   mixName / remixerName from matched provider titles when sparse
 * - Sets: fill nulls; refresh when primary DJ image changed
 *
 * Usage: npm run thumbs
 */
import { PrismaClient } from "@prisma/client";
import { parseTrackTitle } from "../src/lib/trackMeta";
import { rewriteStoredGenres } from "../src/lib/genre";
import { ensureTrackSlugs } from "../src/lib/tracks/ensureSlugs";
import { slugify } from "../src/lib/ingest/types";
import {
  isArtistArtUrl,
  resolveArtistImage,
  resolveLabelImage,
  resolveSetImage,
  resolveTrackImage,
  sleep,
} from "../src/lib/thumbs/deezer";
import { resolveTrackMetaMusicBrainz } from "../src/lib/thumbs/musicbrainz";

const prisma = new PrismaClient();

/** Delay between API calls to stay polite. */
const DELAY_MS = Number(process.env.THUMBS_DELAY_MS ?? 120);
/** Optional cap for tracks (0 = all). Useful for local smoke tests. */
const TRACK_LIMIT = Number(process.env.THUMBS_TRACK_LIMIT ?? 0);
/** Fast path: only fill null artwork — skip DJ refresh / track upgrades. */
const NULL_ONLY = process.env.THUMBS_NULL_ONLY === "1";
/** Cap MusicBrainz lookups per thumbs run (0 = skip). */
const MB_LIMIT = Number(process.env.THUMBS_MB_LIMIT ?? (NULL_ONLY ? 0 : 60));

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
    meta: number;
    musicbrainz: number;
  };
  sets: { scanned: number; filled: number; missed: number; updated: number };
  slugs: number;
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
      meta: 0,
      musicbrainz: 0,
    },
    sets: { scanned: 0, filled: 0, missed: 0, updated: 0 },
    slugs: 0,
  };

  console.log("[thumbs] ensuring track slugs…");
  stats.slugs = await ensureTrackSlugs(prisma);

  console.log("[thumbs] normalizing genres…");
  const genreStats = await rewriteStoredGenres(prisma);
  console.log(
    `  rewritten sets=${genreStats.sets} tracks=${genreStats.tracks}`,
  );

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

  console.log(
    NULL_ONLY
      ? "[thumbs] resolving DJ artwork (null only)…"
      : "[thumbs] resolving DJ artwork (refresh all)…",
  );
  const djs = await prisma.dj.findMany({
    where: NULL_ONLY ? { imageUrl: null } : undefined,
    select: { id: true, name: true, slug: true, imageUrl: true },
    orderBy: { name: "asc" },
  });
  const djImageById = new Map<string, string>();
  // Prefill cache from existing images so set copy works in null-only mode
  if (NULL_ONLY) {
    const withImg = await prisma.dj.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, imageUrl: true },
    });
    for (const d of withImg) {
      if (d.imageUrl) djImageById.set(d.id, d.imageUrl);
    }
  }
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

  console.log(
    NULL_ONLY
      ? "[thumbs] resolving track artwork (null only, capped)…"
      : "[thumbs] resolving track artwork + light meta…",
  );
  const tracks = await prisma.track.findMany({
    where: NULL_ONLY ? { imageUrl: null } : undefined,
    select: {
      id: true,
      title: true,
      artistName: true,
      imageUrl: true,
      durationSec: true,
      mixName: true,
      remixerName: true,
      labelId: true,
      releaseDate: true,
    },
    orderBy: { title: "asc" },
    ...(TRACK_LIMIT > 0 || NULL_ONLY
      ? { take: TRACK_LIMIT > 0 ? TRACK_LIMIT : 80 }
      : {}),
  });
  // Network for missing/upgradeable art, or sparse duration/mix meta.
  const trackQueue = tracks.filter(
    (t) =>
      !t.imageUrl ||
      (!NULL_ONLY && isArtistArtUrl(t.imageUrl)) ||
      (!NULL_ONLY && t.durationSec == null) ||
      (!NULL_ONLY && t.mixName == null),
  );
  let mbCalls = 0;

  async function upsertLabelByName(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const slug = slugify(trimmed);
    const existing = await prisma.label.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await prisma.label.create({
      data: { slug, name: trimmed },
    });
    return created.id;
  }

  for (const t of trackQueue) {
    stats.tracks.scanned += 1;
    const prev = t.imageUrl;
    const fromTitle = parseTrackTitle(t.title);
    const needsArt = !t.imageUrl || isArtistArtUrl(t.imageUrl);
    const needsDuration = t.durationSec == null;
    const needsMb =
      MB_LIMIT > 0 &&
      mbCalls < MB_LIMIT &&
      (t.labelId == null || t.releaseDate == null || needsDuration);
    // Skip network when only mix is sparse and the title already encodes it.
    const canLocalMix =
      !t.mixName &&
      !!fromTitle.mixName &&
      !needsArt &&
      !needsDuration &&
      !needsMb;

    const data: {
      imageUrl?: string;
      durationSec?: number;
      mixName?: string;
      remixerName?: string;
      labelId?: string;
      releaseDate?: Date;
    } = {};

    let result: Awaited<ReturnType<typeof resolveTrackImage>> = null;
    if (canLocalMix) {
      data.mixName = fromTitle.mixName!;
      if (fromTitle.remixerName && !t.remixerName) {
        data.remixerName = fromTitle.remixerName;
      }
    } else {
      if (needsArt || needsDuration || !t.mixName) {
        result = await resolveTrackImage(t.title, t.artistName);
        await sleep(DELAY_MS);

        if (result?.url && result.url !== prev) {
          data.imageUrl = result.url;
          if (prev && result.kind === "cover") stats.tracks.upgraded += 1;
        }

        const matchedParsed = result?.matchedTitle
          ? parseTrackTitle(result.matchedTitle)
          : null;
        const mixName = t.mixName ?? matchedParsed?.mixName ?? fromTitle.mixName;
        const remixerName =
          t.remixerName ?? matchedParsed?.remixerName ?? fromTitle.remixerName;
        if (mixName && !t.mixName) data.mixName = mixName;
        if (remixerName && !t.remixerName) data.remixerName = remixerName;
        if (needsDuration && result?.durationSec != null) {
          data.durationSec = result.durationSec;
        }
      }

      if (needsMb) {
        mbCalls += 1;
        const mb = await resolveTrackMetaMusicBrainz(t.title, t.artistName);
        // MusicBrainz asks for ~1 req/sec
        await sleep(Math.max(DELAY_MS, 1100));
        if (mb) {
          if (needsDuration && data.durationSec == null && mb.durationSec != null) {
            data.durationSec = mb.durationSec;
          }
          if (!t.releaseDate && mb.releaseDate) {
            const d = new Date(mb.releaseDate);
            if (!Number.isNaN(d.getTime())) data.releaseDate = d;
          }
          if (!t.labelId && mb.labelName) {
            const labelId = await upsertLabelByName(mb.labelName);
            if (labelId) data.labelId = labelId;
          }
          if (mb.durationSec != null || mb.releaseDate || mb.labelName) {
            stats.tracks.musicbrainz += 1;
          }
        }
      }
    }

    if (Object.keys(data).length > 0) {
      await prisma.track.update({ where: { id: t.id }, data });
      if (
        data.mixName ||
        data.remixerName ||
        data.durationSec != null ||
        data.labelId ||
        data.releaseDate
      ) {
        stats.tracks.meta += 1;
      }
    }

    if (result?.url) {
      stats.tracks.filled += 1;
      if (result.kind === "cover") stats.tracks.covers += 1;
      else if (result.kind === "artist") stats.tracks.artistFallback += 1;
    } else if (Object.keys(data).length === 0) {
      stats.tracks.missed += 1;
    }

    if (stats.tracks.scanned % 25 === 0) {
      console.log(
        `  … tracks ${stats.tracks.scanned}/${trackQueue.length}` +
          ` (covers ${stats.tracks.covers}, artist-fallback ${stats.tracks.artistFallback}, upgraded ${stats.tracks.upgraded}, meta ${stats.tracks.meta}, mb ${stats.tracks.musicbrainz})`,
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
