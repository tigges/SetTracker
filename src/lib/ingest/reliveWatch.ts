/**
 * Tomorrowland Relive playlist watchers.
 *
 * Polls curated YouTube playlists whose seriesName is "Tomorrowland Relive",
 * matches held 1001 seeds that are waiting on official uploads, and queues
 * Top 100 official playbacks that are not yet curated / 1001-mapped.
 * Never follows fan clips. Elsewhere say playback — Relive is this series only.
 */

import type { PrismaClient } from "@prisma/client";
import {
  HELD_PLAYBACK_WATCH,
  search1001,
  type CapturePreset,
} from "./nextCaptures";
import type { SetSourceRemap } from "./sourceRemaps";
import { slugify } from "./types";
import { officialRelivePlaylists } from "./youtube/playlists";
import {
  extractVideoId,
  fetchPlaylistEntries,
  type YtPlaylistEntry,
} from "./youtube/client";
import { top100DjNames } from "./topDjs";

export type HeldReliveHit = {
  name: string;
  seed: string;
  searchUrl: string;
  status: "waiting" | "candidate";
  note: string;
  youtubeUrl?: string;
  videoId?: string;
  title?: string;
};

export type ReliveWatchReport = {
  generatedAt: string;
  playlists: { id: string; seriesName: string; videos: number }[];
  held: HeldReliveHit[];
  unwiredOfficial: CapturePreset[];
};

export function reliveEditionToken(title: string): string | null {
  if (!/tomorrowland/i.test(title)) return null;
  const we =
    title.match(/\bWE\s*([12])\b/i)?.[1] ||
    title.match(/\bweekend\s*([12])\b/i)?.[1];
  return we ? `tml-we${we}` : null;
}

/** `artist-slug|tml-we1` — same DJ + same TML weekend, any video id. */
export function reliveDedupeKey(
  title: string,
  artistSlug: string,
): string | null {
  const ed = reliveEditionToken(title);
  if (!ed || !artistSlug) return null;
  return `${artistSlug}|${ed}`;
}

export function isRedundantRelive(
  title: string,
  artistSlug: string,
  existing: { title: string; artistSlug: string }[],
): boolean {
  const key = reliveDedupeKey(title, artistSlug);
  if (!key) return false;
  return existing.some(
    (e) => reliveDedupeKey(e.title, e.artistSlug) === key,
  );
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function weekendFromHeldName(name: string): "1" | "2" | null {
  const m = name.match(/WE\s*([12])/i);
  return m ? (m[1] as "1" | "2") : null;
}

function tlNameFromLabel(label: string): string {
  return (
    "TL_" +
    label
      .replace(/[·|@]/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .toUpperCase()
  );
}

/** Longest Top 100 name that the Tomorrowland series title starts with. */
export function artistFromReliveTitle(
  title: string,
  names: string[] = top100DjNames(),
): string | null {
  const t = title.trim();
  let best: string | null = null;
  for (const name of names) {
    if (name.length < 3) continue;
    const re = new RegExp(`^${escapeRe(name)}\\b`, "i");
    if (re.test(t) && (!best || name.length > best.length)) best = name;
  }
  return best;
}

/**
 * When a curated Tomorrowland playback seed moves to a new video id
 * (private → re-upload), emit a slug remap for the retired `yt-{oldId}` row.
 */
export function remapsFromCuratedRelives(
  dbSets: { slug: string; title: string; artistSlug: string }[],
  curated: { videoId: string; title: string; artistSlug: string }[],
): SetSourceRemap[] {
  const curatedByKey = new Map<string, { videoId: string; title: string }>();
  for (const c of curated) {
    const key = reliveDedupeKey(c.title, c.artistSlug);
    if (!key) continue;
    curatedByKey.set(key, { videoId: c.videoId, title: c.title });
  }
  const out: SetSourceRemap[] = [];
  const seen = new Set<string>();
  for (const s of dbSets) {
    if (!s.slug.startsWith("yt-")) continue;
    const oldId = s.slug.slice(3);
    const key = reliveDedupeKey(s.title, s.artistSlug);
    if (!key) continue;
    const next = curatedByKey.get(key);
    if (!next || next.videoId === oldId) continue;
    const fromSlug = `yt-${oldId}`;
    const toSlug = `yt-${next.videoId}`;
    const k = `${fromSlug}→${toSlug}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({
      fromSlug,
      toSlug,
      sourceUrl: `https://www.youtube.com/watch?v=${next.videoId}`,
      playbackUrl: `https://www.youtube.com/watch?v=${next.videoId}`,
      note: `Curated playback replaced ${oldId} (${s.title}).`,
    });
  }
  return out;
}

/** Compare catalog `yt-*` rows to curated YOUTUBE_SETS (no network). */
export async function discoverCuratedReliveRemaps(
  prisma: PrismaClient,
): Promise<SetSourceRemap[]> {
  const { YOUTUBE_SETS } = await import("./youtube/videos");
  const curated = YOUTUBE_SETS.map((s) => ({
    videoId: extractVideoId(s.video) ?? "",
    title: s.title || s.primaryArtist.name,
    artistSlug: slugify(s.primaryArtist.name),
  })).filter((c) => c.videoId);
  const dbSets = await prisma.set.findMany({
    where: { slug: { startsWith: "yt-" } },
    select: {
      slug: true,
      title: true,
      artists: {
        where: { isPrimary: true },
        select: { dj: { select: { slug: true } } },
      },
    },
  });
  return remapsFromCuratedRelives(
    dbSets.map((s) => ({
      slug: s.slug,
      title: s.title,
      artistSlug: s.artists[0]?.dj.slug ?? "",
    })),
    curated,
  );
}

export function matchHeldRelives(
  entries: YtPlaylistEntry[],
  watches = HELD_PLAYBACK_WATCH,
): HeldReliveHit[] {
  return watches.map((h) => {
    const wantWe = weekendFromHeldName(h.name);
    const venue = h.venue ?? /tomorrowland/i;
    const waitNote =
      h.waitNote ??
      "Do not wire fan clips — wait for official playback.";
    const hits = entries.filter((e) => {
      if (!h.match.test(e.title)) return false;
      if (!venue.test(e.title)) return false;
      if (h.alsoMatch && !h.alsoMatch.test(e.title)) return false;
      if (wantWe) {
        // A held WE1/WE2 name must match an explicit same-weekend title —
        // an edition-less title (e.g. a Tomorrowland Winter upload) also
        // passes the bare /tomorrowland/i venue check but is a different
        // performance, so require the token rather than merely not
        // disagreeing with it.
        const got = reliveEditionToken(e.title);
        if (got !== `tml-we${wantWe}`) return false;
      }
      return true;
    });
    const hit = hits[0];
    if (!hit) {
      return {
        name: h.name,
        seed: h.seed,
        searchUrl: search1001(...h.search),
        status: "waiting" as const,
        note: waitNote,
      };
    }
    return {
      name: h.name,
      seed: h.seed,
      searchUrl: search1001(...h.search),
      status: "candidate" as const,
      note: `Official playback found — wire ${h.seed} to yt-${hit.videoId}.`,
      youtubeUrl: `https://www.youtube.com/watch?v=${hit.videoId}`,
      videoId: hit.videoId,
      title: hit.title,
    };
  });
}

export function matchUnwiredOfficialRelives(
  entries: YtPlaylistEntry[],
  opts: {
    curatedVideoIds: Set<string>;
    mappedSlugs: Set<string>;
    existingKeys: Set<string>;
    names?: string[];
    limit?: number;
  },
): CapturePreset[] {
  const names = opts.names ?? top100DjNames();
  const limit = opts.limit ?? 10;
  const out: CapturePreset[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    if (out.length >= limit) break;
    if (opts.curatedVideoIds.has(e.videoId)) continue;
    const slug = `yt-${e.videoId}`;
    if (opts.mappedSlugs.has(slug) || seen.has(slug)) continue;
    const artist = artistFromReliveTitle(e.title, names);
    if (!artist) continue;
    const key = reliveDedupeKey(e.title, slugify(artist));
    if (key && opts.existingKeys.has(key)) continue;
    seen.add(slug);
    const ed = reliveEditionToken(e.title);
    const seedName = ed
      ? `TL_${slugify(artist).replace(/-/g, "_").toUpperCase()}_${ed.replace(/-/g, "_").toUpperCase()}`
      : tlNameFromLabel(`${artist} ${e.title}`);
    out.push({
      label: e.title,
      slug,
      name: seedName,
      searchUrl: search1001(artist, "tomorrowland", "2026"),
      reason: "relive:official-unwired",
    });
  }
  return out;
}

export async function fetchOfficialReliveEntries(
  limit = 160,
): Promise<{ id: string; seriesName: string; entries: YtPlaylistEntry[] }[]> {
  const playlists = officialRelivePlaylists();
  const out: { id: string; seriesName: string; entries: YtPlaylistEntry[] }[] =
    [];
  for (const pl of playlists) {
    const cap = Math.max(pl.limit ?? limit, limit);
    try {
      const entries = await fetchPlaylistEntries(pl.playlist, cap);
      out.push({
        id: pl.playlist,
        seriesName: pl.seriesName,
        entries,
      });
    } catch (err) {
      console.warn(
        `[relive-watch] playlist ${pl.seriesName}:`,
        err instanceof Error ? err.message : err,
      );
      out.push({ id: pl.playlist, seriesName: pl.seriesName, entries: [] });
    }
  }
  return out;
}

export async function buildLiveReliveWatch(opts: {
  curatedVideoIds: Set<string>;
  mappedSlugs: Set<string>;
  existingKeys: Set<string>;
}): Promise<ReliveWatchReport> {
  const playlists = await fetchOfficialReliveEntries();
  const entries = playlists.flatMap((p) => p.entries);
  return {
    generatedAt: new Date().toISOString(),
    playlists: playlists.map((p) => ({
      id: p.id,
      seriesName: p.seriesName,
      videos: p.entries.length,
    })),
    held: matchHeldRelives(entries),
    unwiredOfficial: matchUnwiredOfficialRelives(entries, opts),
  };
}
