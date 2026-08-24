/**
 * Insomniac /music/mixes/ adapter (Metronome + festival/artist mixes).
 *
 * Tracklists use the same accordion as NOR but often `<strong>` tags.
 * Playback prefers SoundCloud track embeds; falls back to YouTube embeds
 * (many older festival mixes are YT-only).
 */

import { inferFestivalEvent } from "../events";
import { hashRawSetContent } from "../hash";
import { scGet, sleep, type ScTrack } from "../soundcloud/client";
import { slugify, type RawArtist, type RawSet, type SourceAdapter } from "../types";
import {
  INSOMNIAC_ACCENT,
  fetchInsomniacHtml,
  fetchMusicSectionSlugs,
  insomniacMusicUrl,
  mixcloudUrlFromHtml,
  publishedAtFromInsomniacHtml,
  soundcloudTrackUrlFromHtml,
  titleFromInsomniacHtml,
  youtubeWatchFromHtml,
} from "./client";
import { parseInsomniacTrackRows, rowsToPlays } from "./parseTracklist";

const ACCENT = INSOMNIAC_ACCENT;

export function mixesMax(): number {
  return Math.max(1, Number(process.env.INSOMNIAC_MIXES_MAX || 30));
}

export function mixesListPages(): number {
  return Math.max(1, Number(process.env.INSOMNIAC_MIXES_LIST_PAGES || 4));
}

/** Prefer dense Metronome / known festival mixes first. */
export const INSOMNIAC_MIX_PRIORITY_SLUGS = [
  "metronome-169-mihalis-safras",
  "metronome-160-noizu",
  "san-holo-showcases-his-stunning-melodic-sensibilities-with-euphoric-edc-mexico-2019-mix",
  "deorro-lets-the-music-do-the-talking-with-blistering-beyond-wonderland-socal-2019-mix",
  "redlight-slaps-his-anything-goes-house-style-all-over-his-edc-mexico-2019-mix",
];

function titleCaseWords(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Performing artist when parseable; null → series/event host only. */
export function artistFromMixPage(
  title: string,
  slug: string,
): RawArtist | null {
  // Compilations / brand mixtapes — no performing primary.
  if (
    /\bbest\s+of\b/i.test(title) ||
    /\bmixtape\b/i.test(title) ||
    /\bmega[-\s]?mix\b/i.test(title) ||
    /^best-of-/i.test(slug)
  ) {
    return null;
  }
  const metro = title.match(/Metronome\s*#?\s*\d+\s*[:\-–—]\s*(.+)$/i);
  if (metro?.[1]) {
    const name = metro[1].trim();
    return { name, slug: slugify(name), accent: ACCENT };
  }
  const verbSplit = title.split(
    /\s+(Showcases|Brings|Rinses|Sends|Lets|Combines|Closes|Rumbl)/i,
  );
  // Only trust verb-split when a verb actually matched (length > 1).
  if (
    verbSplit.length > 1 &&
    verbSplit[0] &&
    verbSplit[0].length >= 2 &&
    verbSplit[0].length <= 48
  ) {
    const name = verbSplit[0].trim();
    return { name, slug: slugify(name), accent: ACCENT };
  }
  const m = slug.match(/^metronome-\d+-(.+)$/i);
  if (m?.[1]) {
    const name = titleCaseWords(m[1].replace(/-/g, " "));
    return { name, slug: slugify(name), accent: ACCENT };
  }
  return null;
}

function durationSecOf(track: ScTrack | null, rows: number): number {
  if (track) {
    const ms = track.full_duration || track.duration || 0;
    const sec = Math.round(ms / 1000);
    if (sec >= 15 * 60) return sec;
  }
  return Math.max(45 * 60, rows * 180);
}

async function resolvePlayback(
  html: string,
): Promise<{ playbackUrl: string; scTrack: ScTrack | null }> {
  // Prefer the music-embed host (Mixcloud / SC). Never scrape site-chrome YouTube.
  const mixcloud = mixcloudUrlFromHtml(html);
  if (mixcloud) return { playbackUrl: mixcloud, scTrack: null };

  const scUrl = soundcloudTrackUrlFromHtml(html);
  if (scUrl && !/soundcloud\.com\/[a-z0-9_-]+\/?$/i.test(scUrl)) {
    try {
      const track = await scGet<ScTrack>(
        `/resolve?url=${encodeURIComponent(scUrl)}`,
      );
      await sleep(100);
      if (track?.permalink_url) {
        return { playbackUrl: track.permalink_url, scTrack: track };
      }
    } catch {
      /* fall through */
    }
  }
  const yt = youtubeWatchFromHtml(html);
  if (yt) return { playbackUrl: yt, scTrack: null };
  return { playbackUrl: "", scTrack: null };
}

/** Last-resort publish date from a year in the title — never "now". */
function publishedAtFromTitleYear(title: string): Date | null {
  const y = title.match(/\b(20\d{2})\b/)?.[1];
  if (!y) return null;
  const year = Number(y);
  if (year < 2005 || year > new Date().getUTCFullYear() + 1) return null;
  return new Date(Date.UTC(year, 0, 15, 12));
}

async function mixToRawSet(slug: string): Promise<RawSet | null> {
  const sourceUrl = insomniacMusicUrl(slug);
  const html = await fetchInsomniacHtml(sourceUrl);
  await sleep(150);
  if (!html) return null;

  const rows = parseInsomniacTrackRows(html);
  if (rows.length < 3) return null;

  const { playbackUrl, scTrack } = await resolvePlayback(html);
  if (!playbackUrl) return null;

  const title = titleFromInsomniacHtml(html, slug).trim();
  const primary = artistFromMixPage(title, slug);
  const durationSec = durationSecOf(scTrack, rows.length);
  if (durationSec < 15 * 60) return null;

  const plays = rowsToPlays(rows, durationSec);
  const festival = inferFestivalEvent(title);
  const fromPage = publishedAtFromInsomniacHtml(html);
  const fromSc =
    scTrack?.display_date || scTrack?.created_at
      ? new Date(scTrack.display_date || scTrack.created_at || "")
      : null;
  const publishedAt =
    fromPage ||
    (fromSc && !Number.isNaN(fromSc.getTime()) ? fromSc : null) ||
    publishedAtFromTitleYear(title);
  // Never invent "now" — that falsely ranks archive mixes as New this week.
  if (!publishedAt) return null;

  const seriesName = /^metronome-/i.test(slug)
    ? "Metronome"
    : "Insomniac Mixes";

  const raw: RawSet = {
    sourceSlug: `insm-mix-${slug}`.slice(0, 120),
    title,
    type: /mixcloud\.com/i.test(playbackUrl)
      ? "mix"
      : /soundcloud\.com/i.test(playbackUrl)
        ? "soundcloud"
        : "festival",
    genre: /\b(trance|dreamstate)\b/i.test(title)
      ? "Trance"
      : /\b(bass|dubstep|riddim)\b/i.test(title)
        ? "Bass House"
        : "House",
    primaryArtist: primary,
    collaborators: [],
    seriesName,
    eventName: festival?.name ?? "Insomniac",
    eventKind: festival?.kind ?? "livestream",
    eventLocation: festival?.location,
    publishedAt,
    durationSec,
    sourceName: "Insomniac",
    sourceUrl,
    playbackUrl,
    mixcloudUrl: mixcloudUrlFromHtml(html),
    soundcloudUrl: soundcloudTrackUrlFromHtml(html),
    youtubeUrl: youtubeWatchFromHtml(html),
    cover: ACCENT,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createInsomniacMixesAdapter(): SourceAdapter {
  return {
    id: "insomniac-mixes",
    label: "Insomniac Mixes",
    async fetchRecent(): Promise<RawSet[]> {
      const need = mixesMax();
      console.log(`[insomniac-mixes] poll /music/mixes/ (max ${need})`);

      const listingSlugs = await fetchMusicSectionSlugs(
        {
          label: "insomniac-mixes",
          listingUrl: "https://www.insomniac.com/music/mixes/",
          term: "mixes",
          slugPattern: /\/music\/([a-z0-9][a-z0-9\-]{2,})\/?/gi,
          maxPages: mixesListPages(),
        },
        sleep,
      );

      // Drop section hubs that aren't mix posts.
      const skip = new Set([
        "mixes",
        "night-owl-radio",
        "artists",
        "playlists",
        "feed",
        "discovery-project",
        "from-the-crates",
        "track-of-the-day",
        "wide-awake-stories",
        "insomniac-radio",
        "insomniac-records",
      ]);
      const filtered = listingSlugs.filter(
        (s) =>
          !skip.has(s) &&
          !s.startsWith("night-owl-radio-") &&
          !s.startsWith("cut-from-the-catalog"),
      );

      const ordered: string[] = [];
      const seen = new Set<string>();
      for (const s of INSOMNIAC_MIX_PRIORITY_SLUGS) {
        if (seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }
      for (const s of filtered) {
        if (seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }

      console.log(
        `[insomniac-mixes] listing=${filtered.length} queue=${ordered.length}`,
      );

      const out: RawSet[] = [];
      for (const slug of ordered) {
        if (out.length >= need) break;
        try {
          const raw = await mixToRawSet(slug);
          if (!raw) {
            console.log(`[insomniac-mixes] skip ${slug}: no tracklist/playback`);
            continue;
          }
          out.push(raw);
          console.log(
            `[insomniac-mixes] + ${raw.sourceSlug} (${raw.plays.length} plays)`,
          );
        } catch (err) {
          console.warn(
            `[insomniac-mixes] skip ${slug}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const insomniacMixesAdapter = createInsomniacMixesAdapter();
