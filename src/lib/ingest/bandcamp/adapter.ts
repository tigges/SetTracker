/**
 * Bandcamp curated release adapter.
 *
 * Emits one RawSet per curated track/album URL. Album track order becomes
 * the play list with cumulative cue times from track durations.
 */

import { hashRawSetContent } from "../hash";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import { fetchBandcampRelease } from "./client";
import { BANDCAMP_RELEASES, type BandcampReleaseSource } from "./releases";

function splitArtistTitle(
  title: string,
  fallbackArtist: string,
): { artistName: string; trackTitle: string } {
  const parts = title.split(/\s[-–—]\s/);
  if (parts.length >= 2) {
    const artistName = parts[0].trim();
    const trackTitle = parts.slice(1).join(" - ").trim();
    if (artistName && trackTitle) return { artistName, trackTitle };
  }
  return { artistName: fallbackArtist, trackTitle: title };
}

function tracksToPlays(
  tracks: { title: string; durationSec: number }[],
  releaseArtist: string,
): RawPlay[] {
  let cursor = 0;
  return tracks.map((t, i) => {
    const { artistName, trackTitle } = splitArtistTitle(t.title, releaseArtist);
    const play: RawPlay = {
      position: i + 1,
      timestamp: cursor,
      provenance: "bandcamp",
      idStatus: "identified",
      trackTitle,
      artistName,
      durationSec: t.durationSec || undefined,
    };
    cursor += Math.max(t.durationSec, 1);
    return play;
  });
}

async function releaseToRawSet(
  src: BandcampReleaseSource,
): Promise<RawSet | null> {
  const rel = await fetchBandcampRelease(src.url);
  const durationSec = rel.tracks.reduce((s, t) => s + t.durationSec, 0);
  if (durationSec <= 0) return null;

  const artistName = src.primaryArtist?.name || rel.artist;
  const artist = {
    name: artistName,
    slug: src.primaryArtist?.slug || slugify(artistName),
    accent: src.primaryArtist?.accent ?? "#c4a35a",
    homeCity: src.primaryArtist?.homeCity,
  };

  const plays = tracksToPlays(rel.tracks, rel.artist || artistName);
  const sourceSlug = `bc-${rel.bandSlug}-${rel.itemSlug}`.slice(0, 120);

  const raw: RawSet = {
    sourceSlug,
    title: rel.title,
    type: src.type ?? "soundcloud",
    genre: src.genre,
    primaryArtist: artist,
    publishedAt: rel.publishedAt ?? new Date(),
    durationSec,
    sourceName: "Bandcamp",
    sourceUrl: rel.url,
    cover: artist.accent ?? "#c4a35a",
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);

  console.log(
    `[bandcamp] + ${sourceSlug} (${plays.length} plays; ${durationSec}s)`,
  );
  return raw;
}

export function createBandcampAdapter(
  releases: BandcampReleaseSource[] = BANDCAMP_RELEASES,
): SourceAdapter {
  return {
    id: "bandcamp",
    label: "Bandcamp",
    async fetchRecent(): Promise<RawSet[]> {
      const out: RawSet[] = [];
      const seen = new Set<string>();
      for (const src of releases) {
        try {
          const raw = await releaseToRawSet(src);
          if (!raw || seen.has(raw.sourceSlug)) continue;
          seen.add(raw.sourceSlug);
          out.push(raw);
        } catch (err) {
          console.warn(
            `[bandcamp] skip ${src.url}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const bandcampAdapter = createBandcampAdapter();
