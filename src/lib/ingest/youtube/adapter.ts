/**
 * YouTube source adapter:
 * - curated watch URLs
 * - venue channels (Boiler Room / Cercle / Mixmag)
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
import { hashRawSetContent } from "../hash";
import { parseDescriptionTracklist } from "../soundcloud/parseTracklist";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import {
  YOUTUBE_ARTIST_CHANNELS,
  isArtistChannelSetCandidate,
  type YoutubeArtistChannel,
} from "./artists";
import {
  fetchChannelShelfDiscovery,
  fetchChannelVideoIdsDeep,
  fetchWatchMeta,
  sleep,
  type YtMusicCredit,
  type YtRelatedVideo,
  type YtWatchMeta,
} from "./client";
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

function musicCreditsToPlays(
  credits: YtMusicCredit[],
  durationSec: number,
): RawPlay[] {
  if (credits.length === 0) return [];
  const n = credits.length;
  return credits.map((c, i) => ({
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

  const plays = playsFromMeta(meta);
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
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` curated; ${durationSec}s` +
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
  const { primary, collaborators } = artistsForSet(meta.title, undefined, {
    accent: venue.accent,
  });
  if (!collaborators.length && primary.name === meta.title.trim()) {
    primary.name = credit;
    primary.slug = slugify(credit);
  }

  const plays = playsFromMeta(meta);
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
  const plays = playsFromMeta(meta);
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
  const plays = playsFromMeta(meta);
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

export function createYoutubeAdapter(
  videos: YoutubeSetSource[] = YOUTUBE_SETS,
  venues: YoutubeVenueChannel[] = YOUTUBE_VENUES,
  artistChannels: YoutubeArtistChannel[] = YOUTUBE_ARTIST_CHANNELS,
): SourceAdapter {
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
