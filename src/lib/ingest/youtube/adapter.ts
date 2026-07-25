/**
 * YouTube source adapter for curated DJ sets / lives + venue channels.
 *
 * Tracklist signals (honest, no invented titles):
 * 1) Timed / numbered lines in the video description
 * 2) YouTube Music "songs in this video" credits (videoAttributeViewModel)
 *
 * Music credits usually lack cue times — we keep order and place them
 * evenly across the set duration (same as unstamped SC/hearthis lines).
 */

import { hashRawSetContent } from "../hash";
import { parseDescriptionTracklist } from "../soundcloud/parseTracklist";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import {
  fetchChannelVideoIds,
  fetchWatchMeta,
  sleep,
  type YtMusicCredit,
  type YtWatchMeta,
} from "./client";
import { YOUTUBE_SETS, type YoutubeSetSource } from "./videos";
import {
  artistFromVenueTitle,
  isVenueSetCandidate,
  YOUTUBE_VENUES,
  type YoutubeVenueChannel,
} from "./venues";

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

  // Description (often timed) wins; add Music credits that aren't duplicates.
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

async function curatedToRawSet(src: YoutubeSetSource): Promise<RawSet | null> {
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
  const artist = src.primaryArtist;

  const raw: RawSet = {
    sourceSlug,
    title,
    type: src.type ?? "soundcloud",
    genre: src.genre,
    primaryArtist: {
      ...artist,
      slug: artist.slug || slugify(artist.name),
    },
    seriesName: src.seriesName,
    eventName: src.eventName,
    publishedAt: meta.publishedAt ?? new Date(),
    durationSec,
    sourceName: "YouTube",
    sourceUrl: meta.watchUrl,
    cover: artist.accent ?? "#ff7a45",
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` curated; ${durationSec}s)`,
  );
  return raw;
}

async function venueVideoToRawSet(
  videoId: string,
  venue: YoutubeVenueChannel,
): Promise<RawSet | null> {
  const meta = await fetchWatchMeta(videoId);
  if (!isVenueSetCandidate(meta.title, meta.durationSec, venue)) {
    return null;
  }

  const artistName = artistFromVenueTitle(meta.title);
  const plays = playsFromMeta(meta);
  const sourceSlug = `yt-${meta.videoId}`.slice(0, 120);

  const raw: RawSet = {
    sourceSlug,
    title: meta.title.trim(),
    type: "festival",
    genre: venue.genre,
    primaryArtist: {
      name: artistName,
      slug: slugify(artistName),
      accent: venue.accent,
    },
    seriesName: venue.seriesName,
    eventName: venue.seriesName,
    publishedAt: meta.publishedAt ?? new Date(),
    durationSec: meta.durationSec,
    sourceName: "YouTube",
    sourceUrl: meta.watchUrl,
    cover: venue.accent,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` ${venue.seriesName}; ${meta.durationSec}s)`,
  );
  return raw;
}

export function createYoutubeAdapter(
  videos: YoutubeSetSource[] = YOUTUBE_SETS,
  venues: YoutubeVenueChannel[] = YOUTUBE_VENUES,
): SourceAdapter {
  return {
    id: "youtube",
    label: "YouTube",
    async fetchRecent(): Promise<RawSet[]> {
      const out: RawSet[] = [];
      const seen = new Set<string>();

      for (const src of videos) {
        try {
          const raw = await curatedToRawSet(src);
          await sleep(250);
          if (!raw || seen.has(raw.sourceSlug)) continue;
          seen.add(raw.sourceSlug);
          out.push(raw);
        } catch (err) {
          console.warn(
            `[youtube] skip ${src.video}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      for (const venue of venues) {
        const limit = venue.limit ?? 8;
        let ids: string[] = [];
        try {
          ids = await fetchChannelVideoIds(venue.channel, limit);
          await sleep(300);
        } catch (err) {
          console.warn(
            `[youtube] channel ${venue.channel}:`,
            err instanceof Error ? err.message : err,
          );
          continue;
        }

        for (const id of ids) {
          if (seen.has(`yt-${id}`)) continue;
          try {
            const raw = await venueVideoToRawSet(id, venue);
            await sleep(250);
            if (!raw || seen.has(raw.sourceSlug)) continue;
            seen.add(raw.sourceSlug);
            out.push(raw);
          } catch (err) {
            console.warn(
              `[youtube] skip venue ${id}:`,
              err instanceof Error ? err.message : err,
            );
          }
        }
      }

      return out;
    },
  };
}

export const youtubeAdapter = createYoutubeAdapter();
