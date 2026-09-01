/**
 * Resolve artwork URLs for DJs, labels, tracks, sets, and venues via Deezer
 * (+ iTunes for track covers, OG/curated for events, SC avatar fallback for DJs).
 * Wired into the GitHub Pages workflow after seed + ingest.
 *
 * Behaviour:
 * - Labels: fill when imageUrl is null (Deezer, then website OG)
 * - DJs: always re-resolve (cheap; fixes wrong artist matches after matcher upgrades)
 *   with SoundCloud avatar fallback when Deezer misses
 * - Events/venues: curated festival art → website OG → latest set art
 * - Tracks: fill nulls, and re-resolve rows that only have an artist portrait so
 *   we can upgrade to release cover art when available; also fill durationSec /
 *   mixName / remixerName from matched provider titles when sparse
 * - Sets: fill nulls; refresh when primary DJ image changed; YT thumb from watch URL;
 *   curated KNOWN_SET_IMAGES win last (dead / private official YouTube stills)
 *
 * Usage: npm run thumbs
 */
import { PrismaClient } from "@prisma/client";
import {
  canonicalBeatportUrl,
  normalizeIsrc,
  parseTrackTitle,
  trackIdentityKey,
} from "../src/lib/trackMeta";
import { fillMissingGenres, rewriteStoredGenres } from "../src/lib/genre";
import { ensureTrackSlugs } from "../src/lib/tracks/ensureSlugs";
import { slugify } from "../src/lib/ingest/types";
import {
  isArtistArtUrl,
  resolveArtistImage,
  resolveLabelImage,
  resolveSetImage,
  resolveTrackImage,
  sleep,
  usableImageUrl,
} from "../src/lib/thumbs/deezer";
import {
  applyCuratedDjImages,
  KNOWN_DJ_IMAGES,
} from "../src/lib/thumbs/djImages";
import {
  applyCuratedEventImages,
  fillEventImages,
} from "../src/lib/thumbs/eventImages";
import { applyCuratedSetImages } from "../src/lib/thumbs/setImages";
import {
  resolveHearthisTrackImage,
  resolveHearthisUserImage,
} from "../src/lib/thumbs/hearthis";
import { resolveTrackMetaMusicBrainzPreferred } from "../src/lib/thumbs/musicbrainz";
import { resolveOgImage } from "../src/lib/thumbs/ogImage";
import { resolveSoundcloudAvatar } from "../src/lib/thumbs/soundcloudAvatar";
import {
  pickYoutubeThumbnail,
  youtubeVideoId,
} from "../src/lib/thumbs/youtubeThumb";
import { parseHearthisUrl } from "../src/lib/ingest/hearthis/client";
import { ensureCuratedLabels } from "../src/lib/ingest/curatedLabels";
import { labelSocials } from "../src/lib/social";

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
  events: {
    scanned: number;
    filled: number;
    missed: number;
    curated: number;
    og: number;
    wiki: number;
    fromSet: number;
  };
  tracks: {
    scanned: number;
    filled: number;
    missed: number;
    covers: number;
    artistFallback: number;
    upgraded: number;
    meta: number;
    musicbrainz: number;
    beatport: number;
    isrc: number;
  };
  sets: { scanned: number; filled: number; missed: number; updated: number };
  slugs: number;
};

async function main() {
  const stats: Stats = {
    djs: { scanned: 0, filled: 0, missed: 0, updated: 0 },
    labels: { scanned: 0, filled: 0, missed: 0 },
    events: {
      scanned: 0,
      filled: 0,
      missed: 0,
      curated: 0,
      og: 0,
      wiki: 0,
      fromSet: 0,
    },
    tracks: {
      scanned: 0,
      filled: 0,
      missed: 0,
      covers: 0,
      artistFallback: 0,
      upgraded: 0,
      meta: 0,
      musicbrainz: 0,
      beatport: 0,
      isrc: 0,
    },
    sets: { scanned: 0, filled: 0, missed: 0, updated: 0 },
    slugs: 0,
  };

  console.log("[thumbs] ensuring track slugs…");
  stats.slugs = await ensureTrackSlugs(prisma);

  console.log("[thumbs] normalizing genres…");
  const genreStats = await rewriteStoredGenres(prisma);
  const genreFill = await fillMissingGenres(prisma);
  console.log(
    `  rewritten sets=${genreStats.sets} tracks=${genreStats.tracks}; filled sets=${genreFill.sets} tracks=${genreFill.tracks}`,
  );

  console.log("[thumbs] ensuring curated labels…");
  const curatedLabels = await ensureCuratedLabels(prisma);
  console.log(
    `  curated labels created=${curatedLabels.created} updated=${curatedLabels.updated}`,
  );

  console.log("[thumbs] resolving label artwork…");
  // Fast Pages deploys skip art for trackless curated stubs (monogram UI).
  const labels = await prisma.label.findMany({
    where: { imageUrl: null },
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      soundcloud: true,
      _count: { select: { tracks: true } },
    },
    orderBy: { name: "asc" },
  });
  for (const l of labels) {
    if (NULL_ONLY && l._count.tracks === 0) {
      continue;
    }
    stats.labels.scanned += 1;
    let url = await resolveLabelImage(l.name);
    await sleep(DELAY_MS);
    if (!url && l.soundcloud) {
      url = await resolveSoundcloudAvatar(l.soundcloud);
      await sleep(DELAY_MS);
      if (url) console.log(`  ✓ label ${l.slug} (soundcloud)`);
    }
    if (!url && l.website) {
      url = await resolveOgImage(l.website);
      await sleep(DELAY_MS);
      if (url) console.log(`  ✓ label ${l.slug} (og)`);
    }
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
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      soundcloud: true,
    },
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
  // hearthis user permalinks from sets — used as Deezer fallback for DJ portraits
  const hearthisUserByDjId = new Map<string, string>();
  const htSets = await prisma.set.findMany({
    where: {
      OR: [
        { sourceName: "hearthis.at" },
        { sourceUrl: { contains: "hearthis.at" } },
      ],
    },
    select: {
      sourceUrl: true,
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { djId: true },
      },
    },
  });
  for (const s of htSets) {
    const djId = s.artists[0]?.djId;
    if (!djId || !s.sourceUrl || hearthisUserByDjId.has(djId)) continue;
    const parsed = parseHearthisUrl(s.sourceUrl);
    if (parsed?.user) hearthisUserByDjId.set(djId, parsed.user);
  }

  for (const d of djs) {
    stats.djs.scanned += 1;
    // Curated brand logos win — do not replace with Deezer/hearthis/SC.
    const curated = KNOWN_DJ_IMAGES[d.slug];
    if (curated) {
      if (d.imageUrl !== curated) {
        await prisma.dj.update({
          where: { id: d.id },
          data: { imageUrl: curated },
        });
        stats.djs.updated += 1;
        console.log(`  ✓ dj ${d.slug} (curated)`);
      } else {
        console.log(`  = dj ${d.slug} (curated)`);
      }
      djImageById.set(d.id, curated);
      stats.djs.filled += 1;
      continue;
    }
    let url = await resolveArtistImage(d.name);
    await sleep(DELAY_MS);
    if (!url) {
      const htUser = hearthisUserByDjId.get(d.id);
      if (htUser) {
        url = await resolveHearthisUserImage(htUser);
        await sleep(DELAY_MS);
        if (url) console.log(`  ✓ dj ${d.slug} (hearthis)`);
      }
    }
    if (!url && d.soundcloud) {
      url = await resolveSoundcloudAvatar(d.soundcloud);
      await sleep(DELAY_MS);
      if (url) console.log(`  ✓ dj ${d.slug} (soundcloud)`);
    }
    if (url) {
      if (d.imageUrl !== url) {
        await prisma.dj.update({ where: { id: d.id }, data: { imageUrl: url } });
        stats.djs.updated += 1;
        if (!hearthisUserByDjId.get(d.id) || d.imageUrl) {
          console.log(`  ✓ dj ${d.slug}${d.imageUrl ? " (updated)" : ""}`);
        }
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

  async function copySiblingStoreIds(): Promise<{ beatport: number; isrc: number }> {
    const withStore = await prisma.track.findMany({
      where: { OR: [{ beatportUrl: { not: null } }, { isrc: { not: null } }] },
      select: { title: true, artistName: true, beatportUrl: true, isrc: true },
    });
    const bpByKey = new Map<string, string>();
    const isrcByKey = new Map<string, string>();
    for (const t of withStore) {
      const key = trackIdentityKey(t.title, t.artistName);
      const bp = canonicalBeatportUrl(t.beatportUrl);
      const isrc = normalizeIsrc(t.isrc);
      if (bp && !bpByKey.has(key)) bpByKey.set(key, bp);
      if (isrc && !isrcByKey.has(key)) isrcByKey.set(key, isrc);
    }
    if (bpByKey.size === 0 && isrcByKey.size === 0) {
      return { beatport: 0, isrc: 0 };
    }

    const missing = await prisma.track.findMany({
      where: { OR: [{ beatportUrl: null }, { isrc: null }] },
      select: { id: true, title: true, artistName: true, beatportUrl: true, isrc: true },
    });
    let beatport = 0;
    let isrc = 0;
    for (const t of missing) {
      const key = trackIdentityKey(t.title, t.artistName);
      const data: { beatportUrl?: string; isrc?: string } = {};
      if (!canonicalBeatportUrl(t.beatportUrl)) {
        const url = bpByKey.get(key);
        if (url) data.beatportUrl = url;
      }
      if (!normalizeIsrc(t.isrc)) {
        const code = isrcByKey.get(key);
        if (code) data.isrc = code;
      }
      if (Object.keys(data).length === 0) continue;
      await prisma.track.update({ where: { id: t.id }, data });
      if (data.beatportUrl) beatport += 1;
      if (data.isrc) isrc += 1;
    }
    return { beatport, isrc };
  }

  console.log(
    NULL_ONLY
      ? "[thumbs] resolving track artwork (null only, capped)…"
      : "[thumbs] resolving track artwork + light meta…",
  );
  const copied = await copySiblingStoreIds();
  stats.tracks.beatport += copied.beatport;
  stats.tracks.isrc += copied.isrc;

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
      beatportUrl: true,
      isrc: true,
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
      (!NULL_ONLY && t.mixName == null) ||
      (!NULL_ONLY && !canonicalBeatportUrl(t.beatportUrl)) ||
      (!NULL_ONLY && !normalizeIsrc(t.isrc)),
  );
  let mbCalls = 0;

  async function upsertLabelByName(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const slug = slugify(trimmed);
    const existing = await prisma.label.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const socials = labelSocials(trimmed);
    const created = await prisma.label.create({
      data: { slug, name: trimmed, ...socials },
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
      (t.labelId == null ||
        t.releaseDate == null ||
        needsDuration ||
        !canonicalBeatportUrl(t.beatportUrl));
    // Skip network when only mix is sparse and the title already encodes it.
    const canLocalMix =
      !t.mixName &&
      !!fromTitle.mixName &&
      !needsArt &&
      !needsDuration &&
      !needsMb &&
      !!normalizeIsrc(t.isrc);

    const data: {
      imageUrl?: string;
      durationSec?: number;
      mixName?: string;
      remixerName?: string;
      labelId?: string;
      releaseDate?: Date;
      beatportUrl?: string;
      isrc?: string;
    } = {};

    let result: Awaited<ReturnType<typeof resolveTrackImage>> = null;
    if (canLocalMix) {
      data.mixName = fromTitle.mixName!;
      if (fromTitle.remixerName && !t.remixerName) {
        data.remixerName = fromTitle.remixerName;
      }
    } else {
      if (needsArt || needsDuration || !t.mixName || !normalizeIsrc(t.isrc)) {
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
        const isrc = normalizeIsrc(result?.isrc);
        if (isrc && !normalizeIsrc(t.isrc)) {
          data.isrc = isrc;
          stats.tracks.isrc += 1;
        }
      }

      if (needsMb) {
        mbCalls += 1;
        const knownIsrc = normalizeIsrc(t.isrc) || normalizeIsrc(result?.isrc);
        const mb = await resolveTrackMetaMusicBrainzPreferred(
          t.title,
          t.artistName,
          knownIsrc,
        );
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
          if (!canonicalBeatportUrl(t.beatportUrl) && mb.beatportUrl) {
            data.beatportUrl = mb.beatportUrl;
            stats.tracks.beatport += 1;
          }
          if (
            mb.durationSec != null ||
            mb.releaseDate ||
            mb.labelName ||
            mb.beatportUrl
          ) {
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
        data.releaseDate ||
        data.beatportUrl ||
        data.isrc
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
          ` (covers ${stats.tracks.covers}, artist-fallback ${stats.tracks.artistFallback}, upgraded ${stats.tracks.upgraded}, meta ${stats.tracks.meta}, mb ${stats.tracks.musicbrainz}, bp ${stats.tracks.beatport}, isrc ${stats.tracks.isrc})`,
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
      sourceUrl: true,
      sourceName: true,
      playbackUrl: true,
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

    // Refresh when empty, placeholder, or set art still points at a stale DJ portrait.
    const needsWork =
      !usableImageUrl(s.imageUrl) ||
      (djUrl && isArtistArtUrl(s.imageUrl) && s.imageUrl !== djUrl);

    if (!needsWork) continue;
    stats.sets.scanned += 1;

    let url: string | null = null;
    // Prefer native hearthis cover when the set was discovered there.
    if (
      s.sourceUrl &&
      (s.sourceName === "hearthis.at" || /hearthis\.at/i.test(s.sourceUrl))
    ) {
      const ht = await resolveHearthisTrackImage(s.sourceUrl);
      await sleep(DELAY_MS);
      url = ht.setImage;
      if (
        ht.artistImage &&
        primary &&
        !primary.imageUrl &&
        !djImageById.get(primary.id)
      ) {
        await prisma.dj.update({
          where: { id: primary.id },
          data: { imageUrl: ht.artistImage },
        });
        djImageById.set(primary.id, ht.artistImage);
      }
      if (url) console.log(`  ✓ set ${s.slug} (hearthis)`);
    }
    // YouTube watch / playlist links → iytimg thumb
    if (!url) {
      const ytId =
        youtubeVideoId(s.playbackUrl || "") ||
        youtubeVideoId(s.sourceUrl || "");
      if (ytId) {
        url = pickYoutubeThumbnail(ytId);
        console.log(`  ✓ set ${s.slug} (youtube)`);
      }
    }
    if (!url) url = usableImageUrl(djUrl);
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

  console.log("[thumbs] applying curated DJ images…");
  const curatedDjs = await applyCuratedDjImages(prisma);
  console.log(
    `  curated dj pins=${curatedDjs.djs} set pins=${curatedDjs.sets} merged=${curatedDjs.merged}`,
  );

  console.log("[thumbs] applying curated set images…");
  const curatedSets = await applyCuratedSetImages(prisma);
  console.log(`  curated set pins=${curatedSets}`);

  console.log("[thumbs] applying curated venue images…");
  const curatedEvents = await applyCuratedEventImages(prisma);
  console.log(`  curated event pins=${curatedEvents}`);

  console.log("[thumbs] resolving venue / event artwork…");
  const eventStats = await fillEventImages(prisma, {
    delayMs: DELAY_MS,
    sleep,
  });
  stats.events = eventStats;

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
