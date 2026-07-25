/**
 * YouTube source adapter:
 * - curated watch URLs
 * - venue channels (Boiler Room / Cercle / Mixmag)
 * - artist channels that publish tracklists (James Hype pattern)
 * - promoted discovery candidates (runtime)
 */

import { artistsForSet } from "../artists";
import { promotedYoutubeChannels } from "../discovery/run";
import { hashRawSetContent } from "../hash";
import { parseDescriptionTracklist } from "../soundcloud/parseTracklist";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import {
  YOUTUBE_ARTIST_CHANNELS,
  isArtistChannelSetCandidate,
  type YoutubeArtistChannel,
} from "./artists";
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
    cover: primary.accent ?? "#ff7a45",
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` curated; ${durationSec}s` +
      (collaborators.length ? `; +${collaborators.length} collab` : "") +
      `)`,
  );
  return raw;
}

async function venueVideoToRawSet(
  videoId: string,
  venue: YoutubeVenueChannel,
): Promise<RawSet | null> {
  const meta = await fetchWatchMeta(videoId);
  if (!isVenueSetCandidate(meta.title, meta.durationSec, venue)) return null;

  const credit = artistFromVenueTitle(meta.title);
  const { primary, collaborators } = artistsForSet(meta.title, undefined, {
    accent: venue.accent,
  });
  // Prefer venue title parse when artistsForSet kept a long credit as one name
  if (!collaborators.length && primary.name === meta.title.trim()) {
    primary.name = credit;
    primary.slug = slugify(credit);
  }

  const plays = playsFromMeta(meta);
  const sourceSlug = `yt-${meta.videoId}`.slice(0, 120);

  const raw: RawSet = {
    sourceSlug,
    title: meta.title.trim(),
    type: "festival",
    genre: venue.genre,
    primaryArtist: primary,
    collaborators,
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

async function artistChannelVideoToRawSet(
  videoId: string,
  ch: YoutubeArtistChannel,
): Promise<RawSet | null> {
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
  // Skip empty-signal shorts that slipped through (promo dumps)
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
    cover: ch.accent,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[youtube] + ${sourceSlug} (${plays.length} plays;` +
      ` ${ch.primaryName}; ${meta.durationSec}s` +
      (collaborators.length ? `; +${collaborators.length} collab` : "") +
      `)`,
  );
  return raw;
}

async function pollChannelVideos(
  label: string,
  channel: string,
  limit: number,
  seen: Set<string>,
  handler: (id: string) => Promise<RawSet | null>,
  out: RawSet[],
): Promise<void> {
  let ids: string[] = [];
  try {
    ids = await fetchChannelVideoIds(channel, limit);
    await sleep(300);
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
      const raw = await handler(id);
      await sleep(250);
      if (!raw || seen.has(raw.sourceSlug)) continue;
      seen.add(raw.sourceSlug);
      out.push(raw);
    } catch (err) {
      console.warn(
        `[youtube] skip ${label} ${id}:`,
        err instanceof Error ? err.message : err,
      );
    }
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
        await pollChannelVideos(
          venue.seriesName,
          venue.channel,
          venue.limit ?? 8,
          seen,
          (id) => venueVideoToRawSet(id, venue),
          out,
        );
      }

      const channels = mergeArtistChannels(artistChannels);
      for (const ch of channels) {
        await pollChannelVideos(
          ch.primaryName,
          ch.channel,
          ch.limit ?? 5,
          seen,
          (id) => artistChannelVideoToRawSet(id, ch),
          out,
        );
      }

      return out;
    },
  };
}

export const youtubeAdapter = createYoutubeAdapter();
