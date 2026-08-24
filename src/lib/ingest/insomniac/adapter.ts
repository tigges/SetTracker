/**
 * Insomniac Night Owl Radio adapter.
 *
 * Tracklists: Insomniac.com music pages (`Artist "Title"` accordion).
 * Audio: SoundCloud embed on those pages (original host) → playbackUrl.
 *
 * Discovery prefers the Insomniac NOR listing (pages that actually publish
 * tracklists). SoundCloud @insomniacevents fills duration / newer slugs when
 * the matching Insomniac page exists.
 *
 * Festival mega-mix episodes (Nocturnal / Escape / HARD / Dreamstate / …)
 * are the primary “festival tracklist” source on Insomniac — video pages are
 * mostly aftermovies without cue sheets.
 */

import { splitArtistCredit } from "../artists";
import { inferFestivalEvent } from "../events";
import { hashRawSetContent } from "../hash";
import {
  resolveUser,
  scGet,
  sleep,
  type ScCollection,
  type ScTrack,
} from "../soundcloud/client";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
} from "../soundcloud/parseTracklist";
import { slugify, type RawArtist, type RawSet, type SourceAdapter } from "../types";
import {
  INSOMNIAC_ACCENT,
  fetchInsomniacHtml,
  fetchMusicSectionSlugs,
  insomniacMusicUrl,
  mixcloudUrlFromHtml,
  publishedAtFromInsomniacHtml,
  titleFromInsomniacHtml,
  youtubeWatchFromHtml,
} from "./client";
import { parseInsomniacTrackRows, rowsToPlays } from "./parseTracklist";

const ACCENT = INSOMNIAC_ACCENT;
const SC_USER = "insomniacevents";

/** Max NOR sets per ingest run (Pages build budget). */
export function norMax(): number {
  return Math.max(1, Number(process.env.INSOMNIAC_NOR_MAX || 60));
}
/** How many Load More pages to pull beyond the first listing (~24 eps each). */
export function norListPages(): number {
  return Math.max(1, Number(process.env.INSOMNIAC_NOR_LIST_PAGES || 8));
}

/**
 * High-signal episodes to always try first (mega-mixes / dense tracklists).
 * Full Insomniac archive is much larger — listing pagination fills the rest.
 */
export const INSOMNIAC_NOR_PRIORITY_SLUGS = [
  "night-owl-radio-482-ft-dreamstate-socal-2024-mega-mix",
  "night-owl-radio-475-ft-loofy-and-d-o-d",
  "night-owl-radio-470-ft-nocturnal-wonderland-2024-mega-mix",
  "night-owl-radio-481-ft-countdown-nye-2024-mega-mix",
  "night-owl-radio-469-ft-escape-halloween-2024-mega-mix",
  "night-owl-radio-464-ft-hard-summer-2024-mega-mix",
  "night-owl-radio-395-ft-beyond-wonderland-socal-2023-mega-mix",
];

function durationSecOf(track: ScTrack): number {
  const ms = track.full_duration || track.duration || 0;
  return Math.max(0, Math.round(ms / 1000));
}

function isNightOwlTrack(track: ScTrack): boolean {
  const perm = track.permalink || "";
  const title = track.title || "";
  return /night-owl-radio/i.test(perm) || /night\s*owl\s*radio/i.test(title);
}

function guestsFromTitle(title: string): {
  primary: RawArtist | null;
  collaborators: RawArtist[];
} {
  const ft = title.match(/\bft\.?\s+(.+)$/i)?.[1]?.trim();
  // No guest / festival mega-mix → series + event host only (not a fake Dj).
  if (!ft) {
    return { primary: null, collaborators: [] };
  }
  if (/\bmega[-\s]?mix\b/i.test(ft) || /\bfestival\b.*\b\d{4}\b/i.test(ft)) {
    return { primary: null, collaborators: [] };
  }
  const parts = ft
    .split(/\s+and\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const primary = {
      name: parts[0]!,
      slug: slugify(parts[0]!),
      accent: ACCENT,
    };
    const collaborators = parts.slice(1).map((name) => ({
      name,
      slug: slugify(name),
      accent: ACCENT,
    }));
    return { primary, collaborators };
  }
  return splitArtistCredit(parts[0] || ft, { accent: ACCENT });
}

function soundcloudPermalinkFromHtml(html: string): string | null {
  const m =
    html.match(
      /soundcloud\.com\/insomniacevents\/(night-owl-radio-[a-z0-9\-]+)/i,
    ) || html.match(/api\.soundcloud\.com\/tracks\/(\d+)/i);
  if (!m) return null;
  if (m[0].includes("tracks/")) return null;
  return m[1]!.toLowerCase();
}

function soundcloudTrackIdFromHtml(html: string): number | null {
  const m = html.match(/api\.soundcloud\.com\/tracks\/(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

async function fetchNorSoundCloudTracks(need: number): Promise<ScTrack[]> {
  const user = await resolveUser(SC_USER);
  if (!user.id) throw new Error("insomniacevents user id missing");
  const out: ScTrack[] = [];
  let path: string | null =
    `/users/${user.id}/tracks?limit=50&linked_partitioning=1`;
  let pages = 0;
  while (path && out.length < need && pages < 10) {
    pages += 1;
    const data: ScCollection<ScTrack> =
      await scGet<ScCollection<ScTrack>>(path);
    for (const t of data.collection ?? []) {
      if (isNightOwlTrack(t)) out.push(t);
    }
    path = data.next_href ?? null;
    if (path) await sleep(120);
  }
  return out;
}

async function resolveScTrack(
  permalink: string | null,
  trackId: number | null,
  cache: Map<string, ScTrack>,
): Promise<ScTrack | null> {
  if (permalink && cache.has(permalink)) return cache.get(permalink)!;
  try {
    if (permalink) {
      const url = `https://soundcloud.com/${SC_USER}/${permalink}`;
      const track = await scGet<ScTrack>(
        `/resolve?url=${encodeURIComponent(url)}`,
      );
      if (track.permalink) cache.set(track.permalink.toLowerCase(), track);
      await sleep(100);
      return track;
    }
    if (trackId != null) {
      const track = await scGet<ScTrack>(`/tracks/${trackId}`);
      if (track.permalink) cache.set(track.permalink.toLowerCase(), track);
      await sleep(100);
      return track;
    }
  } catch {
    return null;
  }
  return null;
}

async function episodeToRawSet(
  slug: string,
  scCache: Map<string, ScTrack>,
): Promise<RawSet | null> {
  const sourceUrl = insomniacMusicUrl(slug);
  const html = await fetchInsomniacHtml(sourceUrl);
  await sleep(150);
  if (!html) return null;

  const rows = parseInsomniacTrackRows(html);
  if (rows.length < 3) return null;

  const scPermalink =
    soundcloudPermalinkFromHtml(html) || (scCache.has(slug) ? slug : null);
  const scId = soundcloudTrackIdFromHtml(html);
  const scTrack = await resolveScTrack(scPermalink, scId, scCache);

  const durationSec = scTrack
    ? durationSecOf(scTrack)
    : Math.max(60 * 60, rows.length * 150);
  if (durationSec < 20 * 60) return null;

  let plays = rowsToPlays(rows, durationSec);
  if (scTrack?.description && plays.length < 5) {
    plays = mergeTracklistSignals(
      plays,
      parseDescriptionTracklist(scTrack.description, durationSec, "soundcloud"),
    );
  }

  const title = (scTrack?.title || titleFromInsomniacHtml(html, slug)).trim();
  const { primary, collaborators } = guestsFromTitle(title);
  // Guest episodes keep a performing primary; mega-mixes attribute via series/event.
  const playbackUrl =
    scTrack?.permalink_url ||
    (scPermalink
      ? `https://soundcloud.com/${SC_USER}/${scPermalink}`
      : scId != null
        ? `https://api.soundcloud.com/tracks/${scId}`
        : undefined);
  if (!playbackUrl) return null;

  const fromSc =
    scTrack?.display_date || scTrack?.created_at
      ? new Date(scTrack.display_date || scTrack.created_at || "")
      : null;
  const publishedAt =
    (fromSc && !Number.isNaN(fromSc.getTime()) ? fromSc : null) ||
    publishedAtFromInsomniacHtml(html);
  // Never invent ingest-time "now" — archive episodes would rank as New.
  if (!publishedAt) return null;

  const festival = inferFestivalEvent(title);

  const raw: RawSet = {
    sourceSlug: `nor-${slug}`.slice(0, 120),
    title,
    type: "radio",
    genre: /\b(trance|dreamstate)\b/i.test(title)
      ? "Trance"
      : /\b(bass|dubstep|riddim)\b/i.test(title)
        ? "Bass House"
        : "House",
    primaryArtist: primary
      ? { ...primary, accent: primary.accent || ACCENT }
      : null,
    collaborators,
    seriesName: "Night Owl Radio",
    eventName: festival?.name ?? "Insomniac",
    eventKind: festival?.kind ?? (festival ? "festival" : "livestream"),
    eventLocation: festival?.location ?? undefined,
    publishedAt,
    durationSec,
    sourceName: "Insomniac",
    sourceUrl,
    playbackUrl,
    description: scTrack?.description,
    soundcloudUrl: scTrack?.permalink_url ?? playbackUrl,
    mixcloudUrl: mixcloudUrlFromHtml(html),
    youtubeUrl: youtubeWatchFromHtml(html),
    cover: ACCENT,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createInsomniacNorAdapter(): SourceAdapter {
  return {
    id: "insomniac-nor",
    label: "Insomniac Night Owl Radio",
    async fetchRecent(): Promise<RawSet[]> {
      const need = norMax();
      console.log(`[insomniac-nor] poll listing + SC @${SC_USER} (max ${need})`);

      const listingSlugs = await fetchMusicSectionSlugs(
        {
          label: "insomniac-nor",
          listingUrl: "https://www.insomniac.com/music/night-owl-radio/",
          term: "night-owl-radio",
          slugPattern: /\/music\/(night-owl-radio-\d+[a-z0-9\-]*)\/?/gi,
          maxPages: norListPages(),
        },
        sleep,
      );
      const scTracks = await fetchNorSoundCloudTracks(Math.max(need * 3, 80));
      const scCache = new Map<string, ScTrack>();
      for (const t of scTracks) {
        if (t.permalink) scCache.set(t.permalink.toLowerCase(), t);
      }

      const ordered: string[] = [];
      const seen = new Set<string>();
      for (const s of INSOMNIAC_NOR_PRIORITY_SLUGS) {
        if (seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }
      for (const s of listingSlugs) {
        if (seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }
      for (const t of scTracks) {
        const s = t.permalink?.toLowerCase();
        if (!s || seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }

      console.log(
        `[insomniac-nor] listing=${listingSlugs.length} scNor=${scTracks.length} queue=${ordered.length}`,
      );

      const out: RawSet[] = [];
      for (const slug of ordered) {
        if (out.length >= need) break;
        try {
          const raw = await episodeToRawSet(slug, scCache);
          if (!raw) {
            console.log(`[insomniac-nor] skip ${slug}: no Insomniac tracklist`);
            continue;
          }
          out.push(raw);
          console.log(
            `[insomniac-nor] + ${raw.sourceSlug} (${raw.plays.length} plays, ${raw.durationSec}s)`,
          );
        } catch (err) {
          console.warn(
            `[insomniac-nor] skip ${slug}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const insomniacNorAdapter = createInsomniacNorAdapter();
