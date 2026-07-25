/**
 * YouTube source adapter for curated DJ sets / lives.
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
import { fetchWatchMeta, sleep, type YtMusicCredit } from "./client";
import { YOUTUBE_SETS, type YoutubeSetSource } from "./videos";

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

async function videoToRawSet(src: YoutubeSetSource): Promise<RawSet | null> {
  const meta = await fetchWatchMeta(src.video);
  const durationSec = meta.durationSec;
  if (durationSec < 10 * 60) {
    console.warn(
      `[youtube] skip ${meta.videoId}: duration ${durationSec}s too short`,
    );
    return null;
  }

  const fromDescription = parseDescriptionTracklist(
    meta.description,
    durationSec,
    "youtube",
  );
  const fromMusic = musicCreditsToPlays(meta.musicCredits, durationSec);
  const plays = mergeDescriptionAndCredits(fromDescription, fromMusic);

  // Still ingest the set even with 0 plays — honest empty state.
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
      ` desc=${fromDescription.length}, music=${fromMusic.length}; ${durationSec}s)`,
  );
  return raw;
}

export function createYoutubeAdapter(
  videos: YoutubeSetSource[] = YOUTUBE_SETS,
): SourceAdapter {
  return {
    id: "youtube",
    label: "YouTube",
    async fetchRecent(): Promise<RawSet[]> {
      const out: RawSet[] = [];
      const seen = new Set<string>();
      for (const src of videos) {
        try {
          const raw = await videoToRawSet(src);
          await sleep(250);
          if (!raw) continue;
          if (seen.has(raw.sourceSlug)) continue;
          seen.add(raw.sourceSlug);
          out.push(raw);
        } catch (err) {
          console.warn(
            `[youtube] skip ${src.video}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const youtubeAdapter = createYoutubeAdapter();
