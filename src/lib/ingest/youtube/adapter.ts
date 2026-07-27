/**
 * YouTube source adapter:
 * - curated watch URLs
 * - curated set playlists (e.g. STEREOHYPE guest mixes / Bucharest lives)
 * - venue channels (Boiler Room / Cercle / Mixmag / STEREOHYPE)
 * - artist channels that publish tracklists (James Hype pattern)
 * - promoted discovery candidates (runtime)
 * - related / "other tracks" follow-ups from accepted watch pages
 * - channel-home Fans also like + Spotlight shelves
 */

import { artistsForSet } from "../artists";
import {
  promotedYoutubeChannels,
  queueYoutubeSimilarChannels,
} from "../discovery/run";
import { inferFestivalEvent, KNOWN_EVENTS } from "../events";
import {
  fingerprintRowsToPlays,
  mergeFingerprintPlays,
  type FingerprintSeedRow,
} from "../fingerprint/seeds";
import { hashRawSetContent } from "../hash";
import { parseDescriptionTracklist } from "../soundcloud/parseTracklist";
import { playsFromDescription1001Links } from "../tracklists1001/client";
import {
  merge1001Plays,
  tracklist1001RowsToPlays,
} from "../tracklists1001/seeds";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import {
  YOUTUBE_ARTIST_CHANNELS,
  isArtistChannelSetCandidate,
  type YoutubeArtistChannel,
} from "./artists";
import {
  fetchChannelShelfDiscovery,
  fetchChannelVideoIdsDeep,
  fetchPlaylistVideoIds,
  fetchWatchMeta,
  sleep,
  type YtMusicCredit,
  type YtRelatedVideo,
  type YtWatchMeta,
} from "./client";
import {
  playlistAsVenue,
  YOUTUBE_PLAYLISTS,
  type YoutubePlaylistSource,
} from "./playlists";
import { YOUTUBE_SETS, type YoutubeSetSource } from "./videos";
import {
  artistFromVenueTitle,
  isVenueSetCandidate,
  YOUTUBE_VENUES,
  type YoutubeVenueChannel,
} from "./venues";

const RELATED_PER_VIDEO = Number(process.env.YOUTUBE_RELATED_PER_VIDEO || 4);
const RELATED_GLOBAL_CAP = Number(process.env.YOUTUBE_RELATED_GLOBAL_CAP || 48);
const SHELF_VIDEO_CAP = Number(process.env.YOUTUBE_SHELF_VIDEO_CAP || 12);
const SIMILAR_CHANNEL_CAP = Number(process.env.YOUTUBE_SIMILAR_CHANNEL_CAP || 24);

type YtHit = {
  raw: RawSet;
  related: YtRelatedVideo[];
};

/** Share of Latin letters / digits in a credit field (ignores spaces). */
function latinRatio(s: string): number {
  const chars = s.replace(/\s+/g, "");
  if (!chars.length) return 0;
  const latin = (chars.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length;
  return latin / chars.length;
}

/**
 * Drop Content-ID junk (e.g. CJK false matches with a couple Latin digits).
 * Require both artist and title to be majority Latin/digit.
 */
function isPlausibleMusicCredit(c: YtMusicCredit): boolean {
  const artist = (c.artistName ?? "").trim();
  const title = (c.title ?? "").trim();
  if (artist.length < 2 || title.length < 2) return false;
  return latinRatio(artist) >= 0.5 && latinRatio(title) >= 0.45;
}

function musicCreditsToPlays(
  credits: YtMusicCredit[],
  durationSec: number,
): RawPlay[] {
  const kept = credits.filter(isPlausibleMusicCredit);
  if (kept.length === 0) return [];
  const n = kept.length;
  return kept.map((c, i) => ({
    position: i + 1,
    timestamp: Math.round((durationSec * (i + 1)) / (n + 1)),
    provenance: "youtube" as const,
    idStatus: "identified" as const,
    trackTitle: c.title,
    artistName: c.artistName,
  }));
}

function sameTrack(a: RawPlay, b: RawPlay): boolean {
  const at = (a.trackTitle || "").toLowerCase();
  const bt = (b.trackTitle || "").toLowerCase();
  const aa = (a.artistName || "").toLowerCase();
  const ba = (b.artistName || "").toLowerCase();
  return !!at && !!bt && at === bt && aa === ba;
}

function mergeDescriptionAndCredits(
  fromDescription: RawPlay[],
  fromMusic: RawPlay[],
): RawPlay[] {
  if (fromDescription.length === 0) return fromMusic;
  if (fromMusic.length === 0) return fromDescription;
  const merged = [...fromDescription];
  for (const m of fromMusic) {
    if (merged.some((p) => sameTrack(p, m))) continue;
    merged.push(m);
  }
  merged.sort((a, b) => a.timestamp - b.timestamp || a.position - b.position);
  return merged.map((p, i) => ({ ...p, position: i + 1 }));
}

function playsFromMeta(meta: YtWatchMeta): RawPlay[] {
  const fromDescription = parseDescriptionTracklist(
    meta.description,
    meta.durationSec,
    "youtube",
  );
  const fromMusic = musicCreditsToPlays(meta.musicCredits, meta.durationSec);
  return mergeDescriptionAndCredits(fromDescription, fromMusic);
}

/**
 * Follow 1001.tl links in the description; fall back to curated seed rows.
 * Dense 1001 lists replace thin Music-credit stubs.
 */
async function enrichWith1001Tracklist(
  meta: YtWatchMeta,
  base: RawPlay[],
  seed?: FingerprintSeedRow[],
): Promise<RawPlay[]> {
  let from1001 = await playsFromDescription1001Links(
    meta.description,
    meta.durationSec,
  );
  if (from1001.length < 5 && seed?.length) {
    from1001 = tracklist1001RowsToPlays(seed);
  }
  return merge1001Plays(base, from1001);
}

function mergeArtistChannels(
  curated: YoutubeArtistChannel[],
): YoutubeArtistChannel[] {
  const promoted = promotedYoutubeChannels();
  const seen = new Set(curated.map((c) => c.channel.toLowerCase()));
  const out = [...curated];
  for (const p of promoted) {
    const key = p.channel.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function relatedSeedIds(related: YtRelatedVideo[], limit: number): string[] {
  // Prefer shelf-tagged cards (fans also like / other tracks / spotlight).
  const ranked = [...related].sort((a, b) => {
    const as = a.shelf ? 0 : 1;
    const bs = b.shelf ? 0 : 1;
    return as - bs;
  });
  const out: string[] = [];
  const seen = new Set<string>();
  for (const r of ranked) {
    if (seen.has(r.videoId)) continue;
    seen.add(r.videoId);
    out.push(r.videoId);
    if (out.length >= limit) break;
  }
  return out;
}

async function curatedToHit(src: YoutubeSetSource): Promise<YtHit | null> {
  const meta = await fetchWatchMeta(src.video);
  const durationSec = meta.durationSec;
  if (durationSec < 10 * 60) {
    console.warn(
      `[youtube] skip ${meta.videoId}: duration ${durationSec}s too short`,
    );
    return null;
  }

  let plays = playsFromMeta(meta);
  plays = await enrichWith1001Tracklist(meta, plays, src.tracklist1001);
  if (src.fingerprintPlays?.length) {
    plays = mergeFingerprintPlays(
      plays,
      fingerprintRowsToPlays(src.fingerprintPlays),
    );
  }
  const title = (src.title || meta.title).trim();
  const sourceSlug = `yt-${meta.videoId}`.slice(0, 120);
  const { primary, collaborators } = artistsForSet(title, src.primaryArtist);

  const raw: RawSet = {
    sourceSlug,
    title,
    type: src.type ?? "soundcloud",
    genre: src.genre,
    primaryArtist: primary,
    collaborators,
    seriesName: src.seriesName,
    eventName: src.eventName,
    publishedAt: meta.publishedAt ?? new Date(),
    durationSec,
    sourceName: "YouTube",
    sourceUrl: meta.watchUrl,
    playbackUrl: meta.watchUrl,
    cover: primary.accent ?? "#ff7a45",
    imageUrl: meta.imageUrl,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  const from1001 = plays.filter((p) => p.provenance === "1001tl").length;
  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` curated; ${durationSec}s` +
      (from1001 ? `; 1001tl=${from1001}` : "") +
      (collaborators.length ? `; +${collaborators.length} collab` : "") +
      `; related=${meta.relatedVideos.length}` +
      `)`,
  );
  return { raw, related: meta.relatedVideos };
}

async function venueVideoToHit(
  videoId: string,
  venue: YoutubeVenueChannel,
): Promise<YtHit | null> {
  const meta = await fetchWatchMeta(videoId);
  if (!isVenueSetCandidate(meta.title, meta.durationSec, venue)) return null;

  const credit = artistFromVenueTitle(meta.title);
  const preferred = venue.primaryArtist
    ? {
        ...venue.primaryArtist,
        slug: venue.primaryArtist.slug || slugify(venue.primaryArtist.name),
        accent: venue.primaryArtist.accent ?? venue.accent,
      }
    : undefined;
  const { primary, collaborators } = artistsForSet(meta.title, preferred, {
    accent: venue.accent,
  });
  if (
    !preferred &&
    !collaborators.length &&
    primary.name === meta.title.trim()
  ) {
    primary.name = credit;
    primary.slug = slugify(credit);
  }

  const plays = await enrichWith1001Tracklist(meta, playsFromMeta(meta));
  const sourceSlug = `yt-${meta.videoId}`.slice(0, 120);

  const festival = inferFestivalEvent(meta.title);
  const channelEvent = venue.eventSlug
    ? KNOWN_EVENTS[venue.eventSlug]
    : undefined;
  const raw: RawSet = {
    sourceSlug,
    title: meta.title.trim(),
    type: "festival",
    genre: venue.genre,
    primaryArtist: primary,
    collaborators,
    seriesName: venue.seriesName,
    eventName: festival?.name ?? channelEvent?.name ?? venue.seriesName,
    eventKind: festival?.kind ?? channelEvent?.kind ?? "livestream",
    eventLocation: festival?.location ?? channelEvent?.location,
    publishedAt: meta.publishedAt ?? new Date(),
    durationSec: meta.durationSec,
    sourceName: "YouTube",
    sourceUrl: meta.watchUrl,
    playbackUrl: meta.watchUrl,
    cover: venue.accent,
    imageUrl: meta.imageUrl,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` ${venue.seriesName}; ${meta.durationSec}s; related=${meta.relatedVideos.length})`,
  );
  return { raw, related: meta.relatedVideos };
}

async function artistChannelVideoToHit(
  videoId: string,
  ch: YoutubeArtistChannel,
): Promise<YtHit | null> {
  const meta = await fetchWatchMeta(videoId);
  if (!isArtistChannelSetCandidate(meta.title, meta.durationSec, ch)) {
    return null;
  }

  const preferred = {
    name: ch.primaryName,
    slug: slugify(ch.primaryName),
    accent: ch.accent,
  };
  const { primary, collaborators } = artistsForSet(meta.title, preferred);
  const plays = await enrichWith1001Tracklist(meta, playsFromMeta(meta));
  if (plays.length === 0 && meta.durationSec < 25 * 60) return null;

  const sourceSlug = `yt-${meta.videoId}`.slice(0, 120);
  const raw: RawSet = {
    sourceSlug,
    title: meta.title.trim(),
    type: /\bradio\b|heldeep/i.test(meta.title) ? "radio" : "festival",
    genre: ch.genre,
    primaryArtist: primary,
    collaborators,
    seriesName: /\bheldeep\b/i.test(meta.title) ? "Heldeep Radio" : undefined,
    publishedAt: meta.publishedAt ?? new Date(),
    durationSec: meta.durationSec,
    sourceName: "YouTube",
    sourceUrl: meta.watchUrl,
    playbackUrl: meta.watchUrl,
    cover: ch.accent,
    imageUrl: meta.imageUrl,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` ${ch.primaryName}; ${meta.durationSec}s` +
      (collaborators.length ? `; +${collaborators.length} collab` : "") +
      `; related=${meta.relatedVideos.length}` +
      `)`,
  );
  return { raw, related: meta.relatedVideos };
}

/** Loose filter for related/spotlight follow-ups (no channel-specific titleMatch). */
function isRelatedSetCandidate(title: string, durationSec: number): boolean {
  if (durationSec < 15 * 60) return false;
  if (
    /\b(aftermovie|trailer|teaser|tickets?|announcement|#shorts|interview|podcast|vlog|lyric video|official video)\b/i.test(
      title,
    )
  ) {
    return false;
  }
  if (durationSec >= 30 * 60) return true;
  return /\b(live|mix|set|b2b|radio|session|open\s*to\s*close|boiler|cercle)\b/i.test(
    title,
  );
}

async function relatedVideoToHit(
  videoId: string,
  seed: { genre: string; accent: string; label: string },
): Promise<YtHit | null> {
  const meta = await fetchWatchMeta(videoId);
  if (!isRelatedSetCandidate(meta.title, meta.durationSec)) return null;

  const { primary, collaborators } = artistsForSet(meta.title, undefined, {
    accent: seed.accent,
  });
  const plays = await enrichWith1001Tracklist(meta, playsFromMeta(meta));
  if (plays.length === 0 && meta.durationSec < 25 * 60) return null;

  const festival = inferFestivalEvent(meta.title);
  const sourceSlug = `yt-${meta.videoId}`.slice(0, 120);
  const raw: RawSet = {
    sourceSlug,
    title: meta.title.trim(),
    type: festival ? "festival" : "soundcloud",
    genre: seed.genre,
    primaryArtist: primary,
    collaborators,
    eventName: festival?.name,
    eventKind: festival?.kind,
    eventLocation: festival?.location,
    publishedAt: meta.publishedAt ?? new Date(),
    durationSec: meta.durationSec,
    sourceName: "YouTube",
    sourceUrl: meta.watchUrl,
    playbackUrl: meta.watchUrl,
    cover: seed.accent,
    imageUrl: meta.imageUrl,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` related←${seed.label}; ${meta.durationSec}s)`,
  );
  return { raw, related: meta.relatedVideos };
}

async function pollChannelVideos(
  label: string,
  channel: string,
  limit: number,
  seen: Set<string>,
  handler: (id: string) => Promise<YtHit | null>,
  out: RawSet[],
  relatedQueue: string[],
): Promise<void> {
  let ids: string[] = [];
  try {
    ids = await fetchChannelVideoIdsDeep(channel, limit);
    console.log(`[youtube] deep-scan ${label}: ${ids.length} video ids`);
    await sleep(200);
  } catch (err) {
    console.warn(
      `[youtube] channel ${label}:`,
      err instanceof Error ? err.message : err,
    );
    return;
  }
  for (const id of ids) {
    if (seen.has(`yt-${id}`)) continue;
    try {
      const hit = await handler(id);
      await sleep(200);
      if (!hit || seen.has(hit.raw.sourceSlug)) continue;
      seen.add(hit.raw.sourceSlug);
      out.push(hit.raw);
      for (const rid of relatedSeedIds(hit.related, RELATED_PER_VIDEO)) {
        if (relatedQueue.length >= RELATED_GLOBAL_CAP) break;
        if (seen.has(`yt-${rid}`)) continue;
        relatedQueue.push(rid);
      }
    } catch (err) {
      console.warn(
        `[youtube] skip ${label} ${id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

async function scanChannelShelves(
  label: string,
  channel: string,
  seed: { genre: string; accent: string },
  seen: Set<string>,
  out: RawSet[],
  relatedQueue: string[],
): Promise<void> {
  try {
    const shelves = await fetchChannelShelfDiscovery(channel);
    await sleep(200);

    const similar = shelves.similarChannels.slice(0, SIMILAR_CHANNEL_CAP);
    if (similar.length) {
      const added = queueYoutubeSimilarChannels(similar, {
        sourceChannel: channel,
        genre: seed.genre,
        accent: seed.accent,
      });
      console.log(
        `[youtube] ${label} shelves: fans-also-like=${similar.length} queued+${added}`,
      );
    }

    const shelfIds = [
      ...shelves.spotlightVideoIds,
      ...shelves.relatedVideoIds,
    ].slice(0, SHELF_VIDEO_CAP);

    for (const id of shelfIds) {
      if (seen.has(`yt-${id}`)) continue;
      if (relatedQueue.length >= RELATED_GLOBAL_CAP) break;
      relatedQueue.push(id);
    }
  } catch (err) {
    console.warn(
      `[youtube] shelves ${label}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

async function pollPlaylistVideos(
  pl: YoutubePlaylistSource,
  seen: Set<string>,
  out: RawSet[],
  relatedQueue: string[],
): Promise<void> {
  const venue = playlistAsVenue(pl);
  let ids: string[] = [];
  try {
    ids = await fetchPlaylistVideoIds(pl.playlist, pl.limit ?? 30);
    console.log(
      `[youtube] playlist ${pl.seriesName}: ${ids.length} video ids`,
    );
    await sleep(200);
  } catch (err) {
    console.warn(
      `[youtube] playlist ${pl.seriesName}:`,
      err instanceof Error ? err.message : err,
    );
    return;
  }
  for (const id of ids) {
    if (seen.has(`yt-${id}`)) continue;
    try {
      const hit = await venueVideoToHit(id, venue);
      await sleep(200);
      if (!hit || seen.has(hit.raw.sourceSlug)) continue;
      seen.add(hit.raw.sourceSlug);
      out.push(hit.raw);
      for (const rid of relatedSeedIds(hit.related, RELATED_PER_VIDEO)) {
        if (relatedQueue.length >= RELATED_GLOBAL_CAP) break;
        if (seen.has(`yt-${rid}`)) continue;
        relatedQueue.push(rid);
      }
    } catch (err) {
      console.warn(
        `[youtube] skip playlist ${pl.seriesName} ${id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

export function createYoutubeAdapter(
  videos: YoutubeSetSource[] = YOUTUBE_SETS,
  venues: YoutubeVenueChannel[] = YOUTUBE_VENUES,
  artistChannels: YoutubeArtistChannel[] = YOUTUBE_ARTIST_CHANNELS,
  playlists: YoutubePlaylistSource[] = YOUTUBE_PLAYLISTS,
): SourceAdapter {
  /** Fast deploy: curated watch URLs (+ optional playlists) only. */
  const curatedOnly = process.env.YOUTUBE_CURATED_ONLY === "1";
  const includePlaylists =
    process.env.YOUTUBE_CURATED_PLAYLISTS === "1" || !curatedOnly;

  return {
    id: "youtube",
    label: "YouTube",
    async fetchRecent(): Promise<RawSet[]> {
      const out: RawSet[] = [];
      const seen = new Set<string>();
      const relatedQueue: string[] = [];

      for (const src of videos) {
        try {
          const hit = await curatedToHit(src);
          await sleep(250);
          if (!hit || seen.has(hit.raw.sourceSlug)) continue;
          seen.add(hit.raw.sourceSlug);
          out.push(hit.raw);
          if (curatedOnly) continue;
          for (const rid of relatedSeedIds(hit.related, RELATED_PER_VIDEO)) {
            if (relatedQueue.length >= RELATED_GLOBAL_CAP) break;
            if (seen.has(`yt-${rid}`)) continue;
            relatedQueue.push(rid);
          }
        } catch (err) {
          console.warn(
            `[youtube] skip ${src.video}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      if (includePlaylists) {
        for (const pl of playlists) {
          await pollPlaylistVideos(pl, seen, out, relatedQueue);
        }
      }

      if (curatedOnly) {
        console.log(
          `[youtube] curated-only: ${out.length} sets (skipped channels/related)`,
        );
        return out;
      }

      for (const venue of venues) {
        await pollChannelVideos(
          venue.seriesName,
          venue.channel,
          venue.limit ?? 8,
          seen,
          (id) => venueVideoToHit(id, venue),
          out,
          relatedQueue,
        );
        await scanChannelShelves(
          venue.seriesName,
          venue.channel,
          { genre: venue.genre, accent: venue.accent },
          seen,
          out,
          relatedQueue,
        );
      }

      const channels = mergeArtistChannels(artistChannels);
      for (const ch of channels) {
        await pollChannelVideos(
          ch.primaryName,
          ch.channel,
          ch.limit ?? 5,
          seen,
          (id) => artistChannelVideoToHit(id, ch),
          out,
          relatedQueue,
        );
        // Shelf scan only for curated/high-signal artists (skip promoted flood).
        if (
          artistChannels.some(
            (c) => c.channel.toLowerCase() === ch.channel.toLowerCase(),
          )
        ) {
          await scanChannelShelves(
            ch.primaryName,
            ch.channel,
            { genre: ch.genre, accent: ch.accent },
            seen,
            out,
            relatedQueue,
          );
        }
      }

      const relatedSeed = {
        genre: "House",
        accent: "#ff7a45",
        label: "related",
      };
      console.log(
        `[youtube] expanding related/spotlight queue=${relatedQueue.length}`,
      );
      for (const id of relatedQueue) {
        if (seen.has(`yt-${id}`)) continue;
        try {
          const hit = await relatedVideoToHit(id, relatedSeed);
          await sleep(200);
          if (!hit || seen.has(hit.raw.sourceSlug)) continue;
          seen.add(hit.raw.sourceSlug);
          out.push(hit.raw);
        } catch (err) {
          console.warn(
            `[youtube] skip related ${id}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      return out;
    },
  };
}

export const youtubeAdapter = createYoutubeAdapter();
