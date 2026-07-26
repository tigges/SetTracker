/**
 * hearthis.at source adapter — house-family categories from the public api-v2.
 *
 * Pipeline:
 * 1) pull recent uploads from curated house categories
 * 2) keep long-form mixes (≥25m)
 * 3) prefer uploads with description / timed-comment tracklist signals
 * 4) parse with shared tracklist helpers (provenance: hearthis)
 */

import { artistsForSet } from "../artists";
import { hashRawSetContent } from "../hash";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
  parseTimedComments,
} from "../soundcloud/parseTracklist";
import { slugify, type RawSet, type SourceAdapter } from "../types";
import {
  HEARTHIS_HOUSE_CATEGORIES,
  HEARTHIS_MAX_SETS,
  HEARTHIS_MIN_DURATION_SEC,
  type HearthisCategory,
} from "./categories";
import {
  asInt,
  fetchCategoryTracks,
  fetchTrackComments,
  fetchTrackDetail,
  pickHearthisImage,
  sleep,
  type HtTrack,
} from "./client";

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

function setTypeFor(title: string): RawSet["type"] {
  if (/\b(festival|open air|boiler|creamfields|ultra|edc)\b/i.test(title)) {
    return "festival";
  }
  if (/\b(radio|broadcast|show\s*#?\d+)\b/i.test(title)) return "radio";
  return "soundcloud";
}

type Candidate = {
  track: HtTrack;
  category: HearthisCategory;
  score: number;
};

async function trackToRawSet(
  track: HtTrack,
  category: HearthisCategory,
): Promise<RawSet | null> {
  const userPermalink = track.user?.permalink;
  const trackPermalink = track.permalink;
  if (!userPermalink || !trackPermalink) return null;

  const durationSec = durationSecOf(track);
  if (durationSec < HEARTHIS_MIN_DURATION_SEC) return null;

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

  const plays = mergeTracklistSignals(fromDescription, fromComments);
  const artistName =
    detail.user?.username?.trim() ||
    track.user?.username?.trim() ||
    userPermalink;
  const artistSlug = slugify(artistName);
  const sourceSlug = `ht-${userPermalink}-${slugify(trackPermalink)}`.slice(0, 120);
  const sourceUrl =
    detail.permalink_url ||
    track.permalink_url ||
    `https://hearthis.at/${userPermalink}/${trackPermalink}/`;

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

  const { primary, collaborators } = artistsForSet(title, {
    name: artistName,
    slug: artistSlug,
    accent: pickAccent(artistSlug),
    imageUrl: artistImage ?? undefined,
  });

  const raw: RawSet = {
    sourceSlug,
    title,
    type: setTypeFor(title),
    genre: (detail.genre || track.genre || category.genre || "House").trim(),
    primaryArtist: primary,
    collaborators,
    publishedAt: publishedAtOf(detail),
    durationSec,
    sourceName: "hearthis.at",
    sourceUrl,
    cover: pickAccent(sourceSlug),
    imageUrl: setImage ?? undefined,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createHearthisAdapter(
  categories: HearthisCategory[] = HEARTHIS_HOUSE_CATEGORIES,
): SourceAdapter {
  return {
    id: "hearthis",
    label: "hearthis.at",
    async fetchRecent(): Promise<RawSet[]> {
      const byId = new Map<string, Candidate>();

      for (const category of categories) {
        try {
          console.log(`[hearthis] poll category=${category.id}`);
          const tracks = await fetchCategoryTracks(category.id, 1, 25);
          await sleep(120);
          for (const track of tracks) {
            const id = String(track.id);
            if (byId.has(id)) continue;
            const dur = durationSecOf(track);
            if (dur < HEARTHIS_MIN_DURATION_SEC) continue;
            const desc = track.description || "";
            const tl = hasTracklistSignal(desc) ? 1000 : 0;
            const plays = asInt(track.playback_count);
            const favs = asInt(track.favoritings_count);
            byId.set(id, {
              track,
              category,
              score: tl + Math.min(plays, 500) + Math.min(favs, 200) + Math.min(dur / 60, 120),
            });
          }
        } catch (err) {
          console.error(
            `[hearthis] category ${category.id} failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      const ranked = [...byId.values()].sort((a, b) => b.score - a.score);
      // Always keep tracklist-bearing uploads first, then fill to max.
      const withTl = ranked.filter((c) =>
        hasTracklistSignal(c.track.description),
      );
      const withoutTl = ranked.filter(
        (c) => !hasTracklistSignal(c.track.description),
      );
      const selected = [...withTl, ...withoutTl].slice(0, HEARTHIS_MAX_SETS);

      const out: RawSet[] = [];
      const seen = new Set<string>();
      for (const c of selected) {
        try {
          const raw = await trackToRawSet(c.track, c.category);
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
