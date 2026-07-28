/**
 * Real SoundCloud source adapter for setradar.ai.
 *
 * Pipeline per curated show:
 * 1) adaptive poll (hot shows fetched deeper / first)
 * 2) keep long-form sets / radio / live mixes
 * 3) parse description tracklist + timed comments
 * 4) emit RawSet with stable sourceSlug + sourceHash
 *
 * Plus curated playlists (SOUNDCLOUD_PLAYLISTS) — multi-artist festival
 * lives attributed from titles (YouTube playlist parallel).
 */

import { normalizeGenre } from "../../genre";
import { artistsForSet } from "../artists";
import { promotedSoundcloudPermalinks } from "../discovery/run";
import { inferFestivalEvent } from "../events";
import { hashRawSetContent } from "../hash";
import { slugify, type RawSet, type SourceAdapter } from "../types";
import {
  fetchPlaylistTracks,
  fetchTrackComments,
  fetchUserTracks,
  resolveUser,
  sleep,
  type ScTrack,
} from "./client";
import { applyTracklist1001Seed } from "../tracklists1001/seeds";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
  parseTimedComments,
} from "./parseTracklist";
import {
  isScPlaylistSetCandidate,
  SOUNDCLOUD_PLAYLISTS,
  type SoundCloudPlaylistSource,
} from "./playlists";
import {
  adaptiveLimit,
  loadPollState,
  savePollState,
  sortShowsByHeat,
  summarizeTracksForState,
  type PollStateFile,
} from "./pollState";
import {
  allSoundcloudShows,
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
  return show.primaryArtist.accent ?? ACCENT_FALLBACK;
}

/** Prefer larger SC artwork variants when the API returns -large. */
function scImageUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  return url
    .replace("-large.", "-t500x500.")
    .replace("-t200x200.", "-t500x500.")
    .replace("-badge.", "-t500x500.");
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
  // Pull timed comments for long-form sets — often the only tracklist signal
  // when the description is promo-only (lives, radio shows).
  if ((track.comment_count ?? 0) > 0 && durationSec >= 15 * 60) {
    try {
      const comments = await fetchTrackComments(track.id, 200);
      fromComments = parseTimedComments(comments, durationSec);
      await sleep(120);
    } catch (err) {
      console.warn(
        `[soundcloud] comments failed for ${sourceUrl}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const plays = applyTracklist1001Seed(
    sourceSlug,
    mergeTracklistSignals(fromDescription, fromComments),
  );
  const artistImage = scImageUrl(track.user?.avatar_url);
  const setImage =
    scImageUrl(track.artwork_url) ||
    artistImage ||
    show.primaryArtist.imageUrl;
  const preferredPrimary = {
    ...show.primaryArtist,
    imageUrl: show.primaryArtist.imageUrl || artistImage,
  };
  const { primary, collaborators } = artistsForSet(title, preferredPrimary);
  const festival = inferFestivalEvent(title);
  const raw: RawSet = {
    sourceSlug,
    title,
    type: setTypeFor(track, show),
    // Prefer curated show genre when SC tags are format noise (guestmix, etc.).
    genre: normalizeGenre(track.genre) ?? show.genre,
    primaryArtist: primary,
    collaborators,
    seriesName: inferSeriesName(title, show),
    eventName: festival?.name,
    eventKind: festival?.kind,
    eventLocation: festival?.location,
    publishedAt: publishedAtOf(track),
    durationSec,
    sourceName: "SoundCloud",
    sourceUrl,
    playbackUrl: sourceUrl,
    cover: coverOf(track, show),
    imageUrl: setImage,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

function durationSecOfTrack(track: ScTrack): number {
  const ms = track.full_duration ?? track.duration ?? 0;
  return Math.max(0, Math.round(ms / 1000));
}

function setTypeFromTitle(title: string): RawSet["type"] {
  if (/\b(festival|edc|ultra|parookaville|boiler\s*room|tomorrowland)\b/i.test(title)) {
    return "festival";
  }
  if (/\bradio\b/i.test(title)) return "radio";
  return "soundcloud";
}

/**
 * Playlist track → RawSet. Primary/collabs from title (not playlist owner).
 * sourceSlug uses the uploader permalink so it dedupes against show polls.
 */
async function playlistTrackToRawSet(
  track: ScTrack,
  pl: SoundCloudPlaylistSource,
): Promise<RawSet | null> {
  const durationSec = durationSecOfTrack(track);
  const title = (track.title || "").trim();
  if (!title || !isScPlaylistSetCandidate(title, durationSec, pl)) return null;

  const uploader = track.user?.permalink || "unknown";
  const permalink = track.permalink || String(track.id);
  const sourceSlug = `sc-${uploader}-${slugify(permalink)}`.slice(0, 120);
  const sourceUrl =
    track.permalink_url ||
    `https://soundcloud.com/${uploader}/${permalink}`;

  const fromDescription = parseDescriptionTracklist(
    track.description,
    durationSec,
  );

  let fromComments = parseTimedComments([], durationSec);
  if ((track.comment_count ?? 0) > 0 && durationSec >= 15 * 60) {
    try {
      const comments = await fetchTrackComments(track.id, 200);
      fromComments = parseTimedComments(comments, durationSec);
      await sleep(120);
    } catch (err) {
      console.warn(
        `[soundcloud] playlist comments failed for ${sourceUrl}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const plays = mergeTracklistSignals(fromDescription, fromComments);
  const artistImage = scImageUrl(track.user?.avatar_url);
  const setImage = scImageUrl(track.artwork_url) || artistImage;
  const { primary, collaborators } = artistsForSet(title, undefined, {
    accent: pl.accent,
    imageUrl: artistImage,
  });
  const festival = inferFestivalEvent(title);
  const raw: RawSet = {
    sourceSlug,
    title,
    type: setTypeFromTitle(title),
    genre: normalizeGenre(track.genre) ?? pl.genre,
    primaryArtist: primary,
    collaborators,
    seriesName: pl.seriesName,
    eventName: festival?.name,
    eventKind: festival?.kind,
    eventLocation: festival?.location,
    publishedAt: publishedAtOf(track),
    durationSec,
    sourceName: "SoundCloud",
    sourceUrl,
    playbackUrl: sourceUrl,
    cover: pl.accent,
    imageUrl: setImage,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

async function pollPlaylistTracks(
  pl: SoundCloudPlaylistSource,
  seen: Set<string>,
  out: RawSet[],
): Promise<void> {
  let tracks: ScTrack[] = [];
  try {
    tracks = await fetchPlaylistTracks(pl.playlist, pl.limit ?? 80);
    console.log(
      `[soundcloud] playlist ${pl.seriesName}: ${tracks.length} tracks`,
    );
    await sleep(150);
  } catch (err) {
    console.warn(
      `[soundcloud] playlist ${pl.seriesName}:`,
      err instanceof Error ? err.message : err,
    );
    return;
  }

  for (const track of tracks) {
    try {
      const raw = await playlistTrackToRawSet(track, pl);
      if (!raw) continue;
      if (seen.has(raw.sourceSlug)) continue;
      seen.add(raw.sourceSlug);
      out.push(raw);
      console.log(
        `[soundcloud] +pl ${raw.sourceSlug} (${raw.plays.length} plays, ${raw.durationSec}s)`,
      );
    } catch (err) {
      console.warn(
        `[soundcloud] skip playlist track ${track.id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

async function withPromotedShows(
  base: SoundCloudShow[],
): Promise<SoundCloudShow[]> {
  if (process.env.SOUNDCLOUD_PROMOTE_SHOWS === "0") return base;
  const promoted = promotedSoundcloudPermalinks();
  if (promoted.length === 0) return base;
  const seen = new Set(base.map((s) => s.permalink.toLowerCase()));
  const out = [...base];
  for (const p of promoted) {
    const key = p.permalink.toLowerCase();
    if (seen.has(key)) continue;
    try {
      const user = await resolveUser(p.permalink);
      await sleep(120);
      if (!user.id) continue;
      seen.add(key);
      out.push({
        permalink: user.permalink || p.permalink,
        userId: user.id,
        label: p.name,
        primaryArtist: {
          name: p.name,
          slug: slugify(p.name),
          accent: p.accent,
        },
        genre: p.genre,
        type: "soundcloud",
        minDurationSec: 25 * 60,
        titleMatch: /\b(live|mix|set|b2b|radio|session)\b/i,
        limit: 12,
      });
      console.log(`[soundcloud] + promoted show ${p.permalink} (${user.id})`);
    } catch (err) {
      console.warn(
        `[soundcloud] promote resolve failed ${p.permalink}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return out;
}

export function createSoundCloudAdapter(
  shows: SoundCloudShow[] = allSoundcloudShows(),
  playlists: SoundCloudPlaylistSource[] = SOUNDCLOUD_PLAYLISTS,
): SourceAdapter {
  /** Fast deploy: curated playlists only (skip per-user show polls). */
  const curatedOnly = process.env.SOUNDCLOUD_CURATED_ONLY === "1";
  /** Playlists on by default for deep + curated-only; set =0 to disable. */
  const includePlaylists = process.env.SOUNDCLOUD_CURATED_PLAYLISTS !== "0";

  return {
    id: "soundcloud",
    label: "SoundCloud",
    async fetchRecent(): Promise<RawSet[]> {
      const out: RawSet[] = [];
      const seen = new Set<string>();

      if (includePlaylists) {
        for (const pl of playlists) {
          await pollPlaylistTracks(pl, seen, out);
        }
      }

      if (curatedOnly) {
        console.log(
          `[soundcloud] curated-only: ${out.length} sets (skipped show polls)`,
        );
        return out;
      }

      const state = loadPollState();
      const nextState: PollStateFile = {
        updatedAt: new Date().toISOString(),
        shows: { ...state.shows },
      };
      const allShows = await withPromotedShows(shows);
      const ordered = sortShowsByHeat(allShows, state);

      for (const show of ordered) {
        const baseline = show.limit ?? 12;
        const limit = adaptiveLimit(show.permalink, baseline, state);
        let tracks: ScTrack[] = [];
        try {
          console.log(
            `[soundcloud] poll ${show.permalink} limit=${limit}` +
              (state.shows[show.permalink]
                ? ` (recent=${state.shows[show.permalink].recentUploadCount})`
                : ""),
          );
          tracks = await fetchUserTracks(show.userId, limit);
          nextState.shows[show.permalink] = summarizeTracksForState(tracks, limit);
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

      try {
        savePollState(nextState);
      } catch (err) {
        console.warn(
          "[soundcloud] could not persist poll state:",
          err instanceof Error ? err.message : err,
        );
      }

      return out;
    },
  };
}

export const soundcloudAdapter = createSoundCloudAdapter();
