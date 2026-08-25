/**
 * DJ Mag Live Sets → RawSet.
 *
 * Discovery: https://djmag.com/livesets (paginated YouTube embeds).
 * Tracklists: YouTube description + Music credits + MixesDB / 1001.tl
 * follow-links (editorial /watch pages do not embed cue sheets).
 *
 * Dedupes with the @DJMag YouTube venue via sourceSlug `yt-{videoId}`.
 */

import { inferSetType } from "../../setType";
import { artistsForSet } from "../artists";
import { inferFestivalEvent, KNOWN_EVENTS } from "../events";
import { hashRawSetContent } from "../hash";
import { parseDescriptionTracklist } from "../soundcloud/parseTracklist";
import {
  playsFromDescriptionMixesdbLinks,
  playsFromAnyPlayerMixesdbLookup,
} from "../mixesdb/client";
import { playsFromDescription1001Links } from "../tracklists1001/client";
import { playerUrlsForSet } from "../setHostUrls";
import { merge1001Plays } from "../tracklists1001/seeds";
import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "../types";
import {
  fetchWatchMeta,
  sleep,
  type YtMusicCredit,
  type YtWatchMeta,
} from "../youtube/client";
import { artistFromVenueTitle } from "../youtube/venues";
import {
  fetchLivesetsTeasers,
  type DjMagLivesetTeaser,
} from "./client";

const ACCENT = "#000000";
const CHANNEL_EVENT = KNOWN_EVENTS["dj-mag"];

export function livesetsMax(): number {
  return Math.max(1, Number(process.env.DJMAG_LIVESETS_MAX || 40));
}

export function livesetsPages(): number {
  return Math.max(1, Number(process.env.DJMAG_LIVESETS_PAGES || 3));
}

export function livesetsMinDurationSec(): number {
  return Math.max(
    10 * 60,
    Number(process.env.DJMAG_LIVESETS_MIN_DURATION_SEC || 20 * 60),
  );
}

/** Share of Latin letters / digits (same filter as youtube/adapter). */
function latinRatio(s: string): number {
  const chars = s.replace(/\s+/g, "");
  if (!chars.length) return 0;
  const latin = (chars.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length;
  return latin / chars.length;
}

function isPlausibleMusicCredit(c: YtMusicCredit): boolean {
  const artist = (c.artistName ?? "").trim();
  const title = (c.title ?? "").trim();
  if (artist.length < 2 || title.length < 2) return false;
  return latinRatio(artist) >= 0.5 && latinRatio(title) >= 0.45;
}

function musicCreditsToPlays(
  credits: YtMusicCredit[],
  durationSec: number,
): RawPlay[] {
  const kept = credits.filter(isPlausibleMusicCredit);
  if (kept.length === 0) return [];
  const n = kept.length;
  return kept.map((c, i) => ({
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
  const fromChapters = (meta.chapters ?? []).map((chapter, i) => {
    const line = chapter.title.replace(/\s+/g, " ").trim();
    const split = line.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    return {
      position: i + 1,
      timestamp: chapter.startSec,
      provenance: "youtube" as const,
      idStatus: split ? ("identified" as const) : ("unparsed" as const),
      artistName: split?.[1]?.trim(),
      trackTitle: split?.[2]?.trim(),
      rawText: split ? undefined : line,
    };
  });
  if (fromChapters.length >= 2) {
    return mergeDescriptionAndCredits(fromDescription, fromChapters);
  }
  if (fromDescription.length >= 5) return fromDescription;
  const fromMusic = musicCreditsToPlays(meta.musicCredits, meta.durationSec);
  return mergeDescriptionAndCredits(fromDescription, fromMusic);
}

function genreFromTitle(title: string): string {
  if (/\b(trance|psytrance)\b/i.test(title)) return "Trance";
  if (/\b(techno|hard techno)\b/i.test(title)) return "Techno";
  if (/\b(drum\s*&\s*bass|dnb|ukg|dubstep|bassline|bass)\b/i.test(title)) {
    return "Bass House";
  }
  if (/\b(tech[\s-]?house)\b/i.test(title)) return "Tech House";
  return "House";
}

export function isDjMagLivesetCandidate(
  title: string,
  durationSec: number,
): boolean {
  if (durationSec < livesetsMinDurationSec()) return false;
  if (
    /\b(aftermovie|trailer|teaser|tickets?|announcement|#shorts|interview|podcast|vlog|lyric video|official video)\b/i.test(
      title,
    )
  ) {
    return false;
  }
  if (durationSec >= 25 * 60) return true;
  return /\b(live|mix|set|b2b|session|studio|hq)\b/i.test(title);
}

async function teaserToRawSet(
  teaser: DjMagLivesetTeaser,
): Promise<RawSet | null> {
  let meta: YtWatchMeta;
  try {
    meta = await fetchWatchMeta(teaser.videoId);
  } catch (err) {
    console.warn(
      `[djmag-livesets] yt meta ${teaser.videoId}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }

  const title = (meta.title || teaser.title).trim();
  if (!isDjMagLivesetCandidate(title, meta.durationSec)) return null;

  const credit = artistFromVenueTitle(title);
  const { primary, collaborators } = artistsForSet(title, undefined, {
    accent: ACCENT,
  });
  if (!collaborators.length && primary.name === title.trim()) {
    primary.name = credit;
    primary.slug = slugify(credit);
  }
  primary.accent = primary.accent || ACCENT;

  let plays = playsFromMeta(meta);
  let fromMixesdb = await playsFromDescriptionMixesdbLinks(
    meta.description,
    meta.durationSec,
  );
  if (fromMixesdb.length < 5) {
    const fromPlayer = await playsFromAnyPlayerMixesdbLookup(
      playerUrlsForSet({
        slug: `yt-${meta.videoId}`.slice(0, 120),
        playbackUrl: meta.watchUrl,
      }),
      meta.durationSec,
    );
    if (fromPlayer.length > fromMixesdb.length) fromMixesdb = fromPlayer;
  }
  plays = merge1001Plays(plays, fromMixesdb);
  const from1001 = await playsFromDescription1001Links(
    meta.description,
    meta.durationSec,
  );
  plays = merge1001Plays(plays, from1001);

  const festival = inferFestivalEvent(title);
  const publishedAt =
    meta.publishedAt ||
    (teaser.uploadDate ? new Date(teaser.uploadDate) : null) ||
    new Date();

  const raw: RawSet = {
    sourceSlug: `yt-${meta.videoId}`.slice(0, 120),
    title,
    type: inferSetType({
      title,
      eventKind: festival?.kind ?? CHANNEL_EVENT?.kind ?? "livestream",
      hintedType: "livestream",
      playbackHost: "youtube",
    }),
    genre: genreFromTitle(title),
    primaryArtist: primary,
    collaborators,
    seriesName: "DJ Mag",
    eventName: festival?.name ?? CHANNEL_EVENT?.name ?? "DJ Mag",
    eventKind: festival?.kind ?? CHANNEL_EVENT?.kind ?? "livestream",
    eventLocation: festival?.location ?? CHANNEL_EVENT?.location,
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    durationSec: meta.durationSec,
    sourceName: "DJ Mag",
    sourceUrl: teaser.watchUrl,
    playbackUrl: meta.watchUrl,
    cover: ACCENT,
    imageUrl: meta.imageUrl,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createDjMagLivesetsAdapter(): SourceAdapter {
  return {
    id: "djmag-livesets",
    label: "DJ Mag Live Sets",
    async fetchRecent(): Promise<RawSet[]> {
      const need = livesetsMax();
      const pages = livesetsPages();
      console.log(
        `[djmag-livesets] poll ${pages} listing page(s) (max ${need})`,
      );

      const teasers = await fetchLivesetsTeasers({ pages });
      if (teasers.length === 0) {
        console.warn("[djmag-livesets] no teasers from listing");
        return [];
      }

      const out: RawSet[] = [];
      for (const teaser of teasers) {
        if (out.length >= need) break;
        try {
          const raw = await teaserToRawSet(teaser);
          await sleep(220);
          if (!raw) {
            console.log(`[djmag-livesets] skip ${teaser.videoId}`);
            continue;
          }
          out.push(raw);
          console.log(
            `[djmag-livesets] + ${raw.sourceSlug} (${raw.plays.length} plays; ${raw.durationSec}s)`,
          );
        } catch (err) {
          console.warn(
            `[djmag-livesets] skip ${teaser.videoId}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const djmagLivesetsAdapter = createDjMagLivesetsAdapter();
