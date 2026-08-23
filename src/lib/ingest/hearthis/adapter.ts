/**
 * hearthis.at source adapter — house-family categories from the public api-v2.
 *
 * Pipeline:
 * 1) pull recent uploads from curated house categories
 * 2) keep long-form mixes (≥25m)
 * 3) prefer uploads with description / timed-comment tracklist signals
 * 4) fetch structured `/{user}/{track}/playlist/` cues (primary tracklist)
 * 5) parse description + timed comments as fallback / gap-fill
 * 6) merge → RawPlay[] (provenance: hearthis)
 */

import { artistsForSet } from "../artists";
import { hashRawSetContent } from "../hash";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
  parseTimedComments,
} from "../soundcloud/parseTracklist";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import { withDescriptionSocials } from "../youtube/client";
import {
  HEARTHIS_ARTISTS,
  type HearthisArtistSource,
} from "./artists";
import { HEARTHIS_TRACKS, type HearthisTrackSource } from "./tracks";
import {
  HEARTHIS_HOUSE_CATEGORIES,
  HEARTHIS_MAX_SETS,
  HEARTHIS_MIN_DURATION_SEC,
  type HearthisCategory,
} from "./categories";
import type { RawArtist } from "../types";
import {
  asInt,
  fetchTrackComments,
  fetchTrackDetail,
  fetchTrackPlaylist,
  fetchUserTracks,
  parseHearthisUrl,
  pickHearthisImage,
  sleep,
  type HtTrack,
} from "./client";
import {
  preferredExternalPlaybackFromText,
  resolveSoundCloudTrackUrl,
} from "./playback";
import { playlistEntriesToPlays } from "./playlist";
import {
  playsFromDescriptionMixesdbLinks,
  playsFromAnyPlayerMixesdbLookup,
} from "../mixesdb/client";
import { playerUrlsForSet } from "../setHostUrls";
import { applyTracklist1001Seed, merge1001Plays } from "../tracklists1001/seeds";

const ACCENTS = [
  "#ff7a45",
  "#4fb0e0",
  "#ff7096",
  "#b0d24e",
  "#ffd24d",
  "#5cc7d6",
  "#c56cff",
  "#ff6f5e",
];

function pickAccent(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

function durationSecOf(track: HtTrack): number {
  return Math.max(0, asInt(track.duration));
}

async function hearthisMixesdbPlays(
  description: string,
  playbackUrl: string,
  durationSec: number,
  sourceSlug?: string,
): Promise<RawPlay[]> {
  let from = await playsFromDescriptionMixesdbLinks(description, durationSec);
  if (from.length < 5) {
    const lookup = await playsFromAnyPlayerMixesdbLookup(
      playerUrlsForSet({ slug: sourceSlug, playbackUrl }),
      durationSec,
    );
    if (lookup.length > from.length) from = lookup;
  }
  return from;
}

function publishedAtOf(track: HtTrack): Date {
  const raw = track.release_date || track.created_at;
  if (!raw) return new Date();
  // hearthis often uses "YYYY-MM-DD HH:mm:ss"
  const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function hasTracklistSignal(description: string | null | undefined): boolean {
  if (!description?.trim()) return false;
  const text = description.replace(/<[^>]+>/g, "\n");
  if (/\d{1,2}:\d{2}/.test(text)) return true;
  const dashLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /\s[-–—]\s/.test(l) || /^\d{1,3}\s*[.)|]/.test(l));
  return dashLines.length >= 3;
}

function setTypeFor(
  title: string,
  playbackHost?: "soundcloud" | "youtube",
): RawSet["type"] {
  if (/\b(festival|open air|boiler|creamfields|ultra|edc)\b/i.test(title)) {
    return "festival";
  }
  if (/\b(radio|broadcast|show\s*#?\d+)\b/i.test(title)) return "radio";
  // Only label SoundCloud when audio actually plays there — hearthis-native
  // uploads used to default to "soundcloud" and polluted the SC filter.
  if (playbackHost === "soundcloud") return "soundcloud";
  return "mix";
}

async function resolvePreferredPlayback(
  description: string,
  buyLink: string | null | undefined,
): Promise<{
  playbackUrl: string | undefined;
  host: "soundcloud" | "youtube" | undefined;
}> {
  const external = preferredExternalPlaybackFromText(description, buyLink);
  if (external?.host === "soundcloud") {
    const resolved = await resolveSoundCloudTrackUrl(external.playbackUrl);
    if (resolved) return { playbackUrl: resolved, host: "soundcloud" };
  }
  if (external?.host === "youtube") {
    return { playbackUrl: external.playbackUrl, host: "youtube" };
  }
  return { playbackUrl: undefined, host: undefined };
}

/** Build a RawSet from a hearthis track (+ category genre fallback). */
export async function trackToRawSet(
  track: HtTrack,
  category: HearthisCategory,
  preferredPrimary?: RawArtist,
  seriesName?: string,
  minDurationSec = HEARTHIS_MIN_DURATION_SEC,
): Promise<RawSet | null> {
  const userPermalink = track.user?.permalink;
  const trackPermalink = track.permalink;
  if (!userPermalink || !trackPermalink) return null;

  const durationSec = durationSecOf(track);
  if (durationSec < minDurationSec) return null;

  let detail = track;
  try {
    detail = await fetchTrackDetail(userPermalink, trackPermalink);
    await sleep(100);
  } catch (err) {
    console.warn(
      `[hearthis] detail failed ${userPermalink}/${trackPermalink}:`,
      err instanceof Error ? err.message : err,
    );
  }

  const title = (detail.title || track.title || "").trim();
  if (!title) return null;

  const description = detail.description ?? track.description ?? "";
  const fromDescription = parseDescriptionTracklist(
    description,
    durationSec,
    "hearthis",
  );

  // Structured cue table — often present when the description is promo-only.
  let fromPlaylist = playlistEntriesToPlays([], durationSec);
  try {
    const entries = await fetchTrackPlaylist(userPermalink, trackPermalink);
    fromPlaylist = playlistEntriesToPlays(entries, durationSec);
    await sleep(80);
  } catch (err) {
    console.warn(
      `[hearthis] playlist failed ${userPermalink}/${trackPermalink}:`,
      err instanceof Error ? err.message : err,
    );
  }

  let fromComments = parseTimedComments([], durationSec, 1, "hearthis");
  const commentCount = asInt(detail.comment_count ?? track.comment_count);
  if (commentCount > 0 && durationSec >= 20 * 60) {
    try {
      const comments = await fetchTrackComments(userPermalink, trackPermalink, 1, 80);
      fromComments = parseTimedComments(
        comments.map((c) => ({
          body: c.comment,
          // comment_position is already seconds → ms for shared parser
          timestamp:
            c.comment_position != null ? asInt(c.comment_position) * 1000 : null,
        })),
        durationSec,
        1,
        "hearthis",
      );
      await sleep(100);
    } catch (err) {
      console.warn(
        `[hearthis] comments failed ${userPermalink}/${trackPermalink}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Playlist cues win; description + comments fill gaps / add unresolved IDs.
  const plays = mergeTracklistSignals(
    fromPlaylist,
    mergeTracklistSignals(fromDescription, fromComments),
  );
  const artistName =
    detail.user?.username?.trim() ||
    track.user?.username?.trim() ||
    userPermalink;
  const artistSlug = slugify(artistName);
  const sourceSlug = hearthisSourceSlug(userPermalink, trackPermalink);
  const sourceUrl =
    detail.permalink_url ||
    track.permalink_url ||
    `https://hearthis.at/${userPermalink}/${trackPermalink}/`;
  // Prefer explicit SC/YT track links from description/buy_link.
  // Never store hearthis as playback — the app embed crashes mobile Safari.
  const { playbackUrl, host: playbackHost } = await resolvePreferredPlayback(
    description,
    detail.buy_link ?? track.buy_link,
  );

  const artistImage = pickHearthisImage(
    detail.user?.avatar_url_retina,
    detail.user?.avatar_url,
    track.user?.avatar_url_retina,
    track.user?.avatar_url,
  );
  const setImage = pickHearthisImage(
    detail.artwork_url_retina,
    detail.artwork_url,
    detail.thumb,
    track.artwork_url_retina,
    track.artwork_url,
    track.thumb,
    artistImage,
  );

  const seedPrimary = preferredPrimary
    ? {
        ...preferredPrimary,
        imageUrl: preferredPrimary.imageUrl || artistImage || undefined,
      }
    : {
        name: artistName,
        slug: artistSlug,
        accent: pickAccent(artistSlug),
        imageUrl: artistImage ?? undefined,
      };
  const { primary, collaborators } = artistsForSet(title, seedPrimary);

  const raw: RawSet = {
    sourceSlug,
    title,
    type: setTypeFor(title, playbackHost),
    genre: (detail.genre || track.genre || category.genre || "House").trim(),
    primaryArtist: withDescriptionSocials(primary, description),
    collaborators,
    seriesName,
    publishedAt: publishedAtOf(detail),
    durationSec,
    // Discovery / tracklist host stays hearthis even when audio is SC/YT.
    sourceName: "hearthis.at",
    sourceUrl,
    playbackUrl,
    cover: pickAccent(sourceSlug),
    imageUrl: setImage ?? undefined,
    plays: applyTracklist1001Seed(
      sourceSlug,
      merge1001Plays(
        plays,
        await hearthisMixesdbPlays(description, sourceUrl, durationSec, sourceSlug),
      ),
    ),
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

type Candidate = {
  track: HtTrack;
  category: HearthisCategory;
  score: number;
  preferredPrimary?: RawArtist;
  seriesName?: string;
  minDurationSec?: number;
};

export function hearthisSourceSlug(
  userPermalink: string,
  trackPermalink: string,
): string {
  return `ht-${userPermalink}-${slugify(trackPermalink)}`.slice(0, 120);
}

function applyTrackSeedMeta(
  raw: RawSet,
  seed: HearthisTrackSource,
): RawSet {
  if (seed.eventName) raw.eventName = seed.eventName;
  if (seed.eventKind) raw.eventKind = seed.eventKind;
  if (seed.eventLocation) raw.eventLocation = seed.eventLocation;
  if (seed.seriesName) raw.seriesName = seed.seriesName;
  if (seed.type) raw.type = seed.type;
  if (seed.performedOn) {
    const d = new Date(`${seed.performedOn}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) raw.publishedAt = d;
  }
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createHearthisAdapter(
  _categories: HearthisCategory[] = HEARTHIS_HOUSE_CATEGORIES,
  artists: HearthisArtistSource[] = HEARTHIS_ARTISTS,
  tracks: HearthisTrackSource[] = HEARTHIS_TRACKS,
): SourceAdapter {
  return {
    id: "hearthis",
    label: "hearthis.at",
    async fetchRecent(): Promise<RawSet[]> {
      const byId = new Map<string, Candidate>();
      const curated: RawSet[] = [];

      // Curated single-track seeds (always ingest — not subject to poll cap).
      for (const seed of tracks) {
        const parsed = parseHearthisUrl(seed.url);
        if (!parsed?.user || !parsed.track) {
          console.warn(`[hearthis] bad curated url ${seed.url}`);
          continue;
        }
        try {
          console.log(
            `[hearthis] curated track=${parsed.user}/${parsed.track}`,
          );
          const detail = await fetchTrackDetail(parsed.user, parsed.track);
          await sleep(100);
          const cat: HearthisCategory = {
            id: `track:${parsed.user}/${parsed.track}`,
            genre: seed.genre,
          };
          const raw = await trackToRawSet(
            detail,
            cat,
            seed.primaryArtist,
            seed.seriesName,
            seed.minDurationSec ?? HEARTHIS_MIN_DURATION_SEC,
          );
          if (raw) curated.push(applyTrackSeedMeta(raw, seed));
        } catch (err) {
          console.error(
            `[hearthis] curated ${parsed.user}/${parsed.track} failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      // Curated brand / artist accounts (e.g. Gentlemen's Groove mixes).
      for (const artist of artists) {
        try {
          const limit = artist.limit ?? 20;
          console.log(`[hearthis] poll artist=${artist.permalink} limit=${limit}`);
          const tracks = await fetchUserTracks(artist.permalink, 1, limit);
          await sleep(120);
          const minDur = artist.minDurationSec ?? HEARTHIS_MIN_DURATION_SEC;
          const cat: HearthisCategory = {
            id: `artist:${artist.permalink}`,
            genre: artist.genre,
          };
          for (const track of tracks) {
            const id = String(track.id);
            const dur = durationSecOf(track);
            if (dur < minDur) continue;
            const desc = track.description || "";
            const tl = hasTracklistSignal(desc) ? 1000 : 0;
            const plays = asInt(track.playback_count);
            const favs = asInt(track.favoritings_count);
            const score =
              2000 +
              tl +
              Math.min(plays, 500) +
              Math.min(favs, 200) +
              Math.min(dur / 60, 120);
            const prev = byId.get(id);
            if (prev && prev.score >= score && prev.preferredPrimary) continue;
            byId.set(id, {
              track: {
                ...track,
                user: track.user ?? {
                  permalink: artist.permalink,
                  username: artist.primaryArtist.name,
                },
              },
              category: cat,
              score,
              preferredPrimary: artist.primaryArtist,
              seriesName: artist.seriesName,
              minDurationSec: minDur,
            });
          }
        } catch (err) {
          console.error(
            `[hearthis] artist ${artist.permalink} failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      const ranked = [...byId.values()].sort((a, b) => b.score - a.score);
      // Prefer tracklist-bearing uploads. Category browse without a TL signal
      // is skipped (niche filler); curated artist accounts may still qualify.
      const withTl = ranked.filter((c) =>
        hasTracklistSignal(c.track.description),
      );
      const curatedNoTl = ranked.filter(
        (c) =>
          !hasTracklistSignal(c.track.description) && Boolean(c.preferredPrimary),
      );
      const selected = [...withTl, ...curatedNoTl].slice(0, HEARTHIS_MAX_SETS);

      const out: RawSet[] = [...curated];
      const seen = new Set<string>(curated.map((r) => r.sourceSlug));
      for (const c of selected) {
        try {
          const raw = await trackToRawSet(
            c.track,
            c.category,
            c.preferredPrimary,
            c.seriesName,
            c.minDurationSec,
          );
          if (!raw) continue;
          if (seen.has(raw.sourceSlug)) continue;
          seen.add(raw.sourceSlug);
          out.push(raw);
          console.log(
            `[hearthis] + ${raw.sourceSlug} (${raw.plays.length} plays, ${raw.durationSec}s)`,
          );
        } catch (err) {
          console.warn(
            `[hearthis] skip ${c.track.id}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const hearthisAdapter = createHearthisAdapter();
