/**
 * Stats "incomplete tracklists" is not a dump of every thin parse.
 * Operator action: capture a 1001 page already linked from the source
 * (or findable via search). Never invent 1001 URLs.
 *
 * Weekly radio stubs (1 cue on a 60m show) are source-complete.
 * Empty shells have no set page (static export skips 0-play sets).
 */

import {
  isCuratedCatalogSlug,
  isFestivalOrClubSet,
  isHearthisSource,
} from "./djCatalog";
import { isArchiveTitledSet, setPerformanceYear } from "./feedPriority";
import { isFestivalSeasonSet } from "./ingest/festivalDrops";
import {
  isEmptyOrPreviewSet,
  isListPendingOfficialSet,
  isNonCatalogSet,
} from "./setBrowse";
import { assessSetDensity, DENSITY_MIN_DURATION_SEC } from "./setDensity";

export type TracklistGapFields = {
  title: string;
  playCount: number;
  durationSec: number;
  type?: string | null;
  eventKind?: string | null;
  eventSlug?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  playbackUrl?: string | null;
  primaryDjSlug?: string | null;
  top100Rank?: number | null;
  festivalRank?: number | null;
  clubRank?: number | null;
  publishedAt: Date | string;
  performedAt?: Date | string | null;
  editionYear?: number | null;
  editionStartsAt?: Date | string | null;
  editionEndsAt?: Date | string | null;
};

const WEEKLY_RADIO =
  /\b(radio\s*(show|ep\.?|#)?|on air|captive soul|selects|clapcast|desire radio|resonation|dharma|spannung|group therapy|a state of trance|\basot\b|gdwb|gdjb|hot robot|steve radio|smash the house radio|night owl radio|core radio|night service|protocol radio|prismatic|spectrum radio|purified|dijon\s*fm)\b/i;

/** Weekly / numbered studio series — not a festival or club night. */
export function looksLikeWeeklyRadioSeries(title: string): boolean {
  return WEEKLY_RADIO.test(title);
}

const LIVESTREAM_HUB =
  /\b(livestream|live\s*stream|one world radio)\b/i;

/** Source published one cue on a ~hour radio episode — not a parse fail. */
export function isSourceCompleteRadioStub(s: {
  title: string;
  type?: string | null;
  playCount: number;
  durationSec: number;
  eventKind?: string | null;
  festivalRank?: number | null;
}): boolean {
  if (s.festivalRank != null) return false;
  if (/\byearmix\b/i.test(s.title)) return false;
  // Title wins over a mis-typed "festival" Smash The House episode.
  // Weekly series stay out of Tracklist capture even with 4–7 description cues.
  if (WEEKLY_RADIO.test(s.title)) return true;
  if (s.playCount > 3) return false;
  if (s.eventKind === "festival" || s.eventKind === "club") return false;
  return s.type === "radio";
}

/** Stage-feed / live hub videos, not a DJ playback to capture. */
export function isLivestreamHubTitle(title: string): boolean {
  if (/\blive\s+(at|from|@)\b/i.test(title)) return false;
  if (LIVESTREAM_HUB.test(title)) return true;
  return /\bLIVE\b/.test(title) && /\b(mainstage|freedom stage|core stage)\b/i.test(title);
}

/**
 * Bare stage / radio-hub feeds only. "Artist | Freedom Stage … LIVE"
 * stays a DJ set.
 */
export function isLivestreamHubFeedTitle(title: string): boolean {
  if (!isLivestreamHubTitle(title)) return false;
  if (/^[A-Z0-9][\w$.''*-]{1,40}(?:\s+[A-Z0-9][\w$.''*-]{1,30}){0,4}\s*[|·]\s+/.test(title)) {
    return false;
  }
  return true;
}

/** Static export only builds set pages for non-empty, non-preview slugs. */
export function setPageIsPublished(s: {
  title: string;
  playCount: number;
  durationSec: number;
  playbackUrl?: string | null;
  sourceUrl?: string | null;
  type?: string | null;
  eventKind?: string | null;
}): boolean {
  if (
    isListPendingOfficialSet({
      title: s.title,
      trackCount: s.playCount,
      durationSec: s.durationSec,
      playbackUrl: s.playbackUrl,
      sourceUrl: s.sourceUrl,
      type: s.type,
      eventKind: s.eventKind,
    })
  ) {
    return true;
  }
  return !isEmptyOrPreviewSet({
    title: s.title,
    trackCount: s.playCount,
    durationSec: s.durationSec,
  });
}

export function tracklistGapReason(s: TracklistGapFields): string {
  if (s.playCount <= 0) {
    return "empty timeline · find 1001 on the source page";
  }
  const d = assessSetDensity({
    durationSec: s.durationSec,
    playCount: s.playCount,
    type: s.type,
  });
  return `${d.severity} · ${s.playCount} cues / ${Math.round(s.durationSec / 60)}m · capture 1001`;
}

/**
 * Worth a Stats row: this-year (or last-year chart festival) playback
 * whose duration does not match the cue count.
 */
export function isActionableTracklistGap(
  s: TracklistGapFields,
  nowMs = Date.now(),
): boolean {
  if (isNonCatalogSet({ title: s.title, durationSec: s.durationSec })) {
    return false;
  }
  if (isLivestreamHubTitle(s.title)) return false;
  if (
    s.playCount > 0 &&
    isEmptyOrPreviewSet({
      title: s.title,
      trackCount: s.playCount,
      durationSec: s.durationSec,
    })
  ) {
    return false;
  }
  if (s.durationSec > 0 && s.durationSec < DENSITY_MIN_DURATION_SEC) {
    return false;
  }
  if (isSourceCompleteRadioStub(s)) return false;
  if (isArchiveTitledSet(s.title, nowMs)) return false;

  const hearthisLeak =
    isHearthisSource(s) &&
    !isFestivalOrClubSet(s) &&
    !isCuratedCatalogSlug(s.primaryDjSlug ?? "") &&
    s.top100Rank == null;
  if (hearthisLeak) return false;

  const year = setPerformanceYear(s, nowMs);
  const nowYear = new Date(nowMs).getUTCFullYear();
  const inSeason = isFestivalSeasonSet(
    {
      eventSlug: s.eventSlug,
      editionStartsAt: s.editionStartsAt,
      editionEndsAt: s.editionEndsAt,
      publishedAt: s.publishedAt,
      type: s.type ?? undefined,
    },
    45,
    nowMs,
  );
  if (year < nowYear - 1 && !inSeason) return false;

  const chart =
    s.top100Rank != null || s.festivalRank != null || s.clubRank != null;
  const festival = isFestivalOrClubSet(s);
  if (!chart && !festival) return false;
  if (year < nowYear && !inSeason && !chart) return false;

  if (s.playCount <= 0) return true;
  const density = assessSetDensity({
    durationSec: s.durationSec,
    playCount: s.playCount,
    type: s.type,
  });
  return density.severity === "thin" || density.severity === "severe";
}

export function compareTracklistGaps(
  a: TracklistGapFields,
  b: TracklistGapFields,
  nowMs = Date.now(),
): number {
  const ya = setPerformanceYear(a, nowMs);
  const yb = setPerformanceYear(b, nowMs);
  if (ya !== yb) return yb - ya;
  const ta = a.top100Rank ?? 999;
  const tb = b.top100Rank ?? 999;
  if (ta !== tb) return ta - tb;
  const fa = a.festivalRank ?? 999;
  const fb = b.festivalRank ?? 999;
  if (fa !== fb) return fa - fb;
  if (a.playCount !== b.playCount) return a.playCount - b.playCount;
  return b.durationSec - a.durationSec;
}
