/**
 * Real SoundCloud source adapter for setradar.ai.
 *
 * Pipeline per curated show:
 * 1) list recent public uploads (api-v2)
 * 2) keep long-form sets / radio / live mixes
 * 3) parse description tracklist + timed comments
 * 4) emit RawSet with stable sourceSlug = soundcloud permalink
 */

import { slugify, type RawSet, type SourceAdapter } from "../types";
import {
  fetchTrackComments,
  fetchUserTracks,
  sleep,
  type ScTrack,
} from "./client";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
  parseTimedComments,
} from "./parseTracklist";
import {
  SOUNDCLOUD_SHOWS,
  inferSeriesName,
  isSetCandidate,
  type SoundCloudShow,
} from "./shows";

const ACCENT_FALLBACK = "#00f0a0";

function durationSecOf(track: ScTrack): number {
  const ms = track.full_duration ?? track.duration ?? 0;
  return Math.max(0, Math.round(ms / 1000));
}

function publishedAtOf(track: ScTrack): Date {
  const raw = track.display_date || track.created_at;
  const d = raw ? new Date(raw) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function coverOf(track: ScTrack, show: SoundCloudShow): string {
  // Keep hex cover seed for UI fallbacks; artwork URL is resolved later by thumbs.
  return show.primaryArtist.accent ?? ACCENT_FALLBACK;
}

function setTypeFor(track: ScTrack, show: SoundCloudShow): RawSet["type"] {
  const title = track.title || "";
  if (/\b(festival|edc|ultra|parookaville|boiler\s*room)\b/i.test(title)) {
    return "festival";
  }
  if (show.type === "radio" || /\bradio\b/i.test(title)) return "radio";
  return "soundcloud";
}

async function trackToRawSet(
  track: ScTrack,
  show: SoundCloudShow,
): Promise<RawSet | null> {
  const durationSec = durationSecOf(track);
  const title = (track.title || "").trim();
  if (!title || !isSetCandidate(title, durationSec, show)) return null;

  const permalink = track.permalink || String(track.id);
  const sourceSlug = `sc-${show.permalink}-${slugify(permalink)}`.slice(0, 120);
  const sourceUrl =
    track.permalink_url ||
    `https://soundcloud.com/${show.permalink}/${permalink}`;

  const fromDescription = parseDescriptionTracklist(
    track.description,
    durationSec,
  );

  let fromComments = parseTimedComments([], durationSec);
  // Timed comments: only fetch when the upload looks interactive / long-form.
  if ((track.comment_count ?? 0) > 0 && durationSec >= 15 * 60) {
    try {
      const comments = await fetchTrackComments(track.id, 80);
      fromComments = parseTimedComments(comments, durationSec);
      await sleep(120);
    } catch (err) {
      console.warn(
        `[soundcloud] comments failed for ${sourceUrl}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const plays = mergeTracklistSignals(fromDescription, fromComments);

  return {
    sourceSlug,
    title,
    type: setTypeFor(track, show),
    genre: track.genre?.trim() || show.genre,
    primaryArtist: show.primaryArtist,
    seriesName: inferSeriesName(title, show),
    publishedAt: publishedAtOf(track),
    durationSec,
    sourceName: "SoundCloud",
    sourceUrl,
    cover: coverOf(track, show),
    plays,
  };
}

export function createSoundCloudAdapter(
  shows: SoundCloudShow[] = SOUNDCLOUD_SHOWS,
): SourceAdapter {
  return {
    id: "soundcloud",
    label: "SoundCloud",
    async fetchRecent(): Promise<RawSet[]> {
      const out: RawSet[] = [];
      const seen = new Set<string>();

      for (const show of shows) {
        let tracks: ScTrack[] = [];
        try {
          tracks = await fetchUserTracks(show.userId, show.limit ?? 12);
          await sleep(150);
        } catch (err) {
          console.error(
            `[soundcloud] fetch tracks failed for ${show.permalink}:`,
            err instanceof Error ? err.message : err,
          );
          continue;
        }

        for (const track of tracks) {
          try {
            const raw = await trackToRawSet(track, show);
            if (!raw) continue;
            if (seen.has(raw.sourceSlug)) continue;
            seen.add(raw.sourceSlug);
            out.push(raw);
            console.log(
              `[soundcloud] + ${raw.sourceSlug} (${raw.plays.length} plays, ${raw.durationSec}s)`,
            );
          } catch (err) {
            console.warn(
              `[soundcloud] skip track ${track.id}:`,
              err instanceof Error ? err.message : err,
            );
          }
        }
      }

      return out;
    },
  };
}

export const soundcloudAdapter = createSoundCloudAdapter();
