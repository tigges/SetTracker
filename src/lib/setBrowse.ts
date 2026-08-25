/**
 * Display policy for set cards / home feed.
 * Ingest may store sets before artwork resolves; browse hides monogram-only tiles
 * and sets whose primary credit is a mix-title / junk "DJ".
 * Brand hosts (Insomniac, Defected TV, …) are series/event content — not junk
 * blockers when series/event art (or set cover) is present.
 */

import { isJunkArtistName } from "./artistName";
import { isBrandHostSlug } from "./brandHosts";
import { isGenreTagName } from "./genre";
import { playablePlaybackUrl } from "./playback";

export type SetBrowseSignals = {
  /** Set cover URL (preferred). */
  imageUrl: string | null | undefined;
  /** Primary DJ portrait — acceptable fallback for the card thumb. */
  primaryDjImageUrl?: string | null | undefined;
  /** Venue / event artwork fallback for brand-hosted sets. */
  eventImageUrl?: string | null | undefined;
  /** Primary DJ display name — reject mix-channel titles as artists. */
  primaryDjName?: string | null | undefined;
  /** Primary DJ slug — brand hosts are allowed when host art exists. */
  primaryDjSlug?: string | null | undefined;
  title?: string | null | undefined;
  trackCount?: number | null | undefined;
  durationSec?: number | null | undefined;
  playbackUrl?: string | null | undefined;
  sourceUrl?: string | null | undefined;
  type?: string | null | undefined;
  eventKind?: string | null | undefined;
};

/** Album previews and unparsed shells — hide from browse / search / feed. */
export function isEmptyOrPreviewSet(s: {
  title?: string | null;
  trackCount?: number | null;
  durationSec?: number | null;
}): boolean {
  if (s.trackCount != null && s.trackCount <= 0) return true;
  const title = s.title ?? "";
  if (/\[preview\]|\(preview\)/i.test(title)) return true;
  const dur = s.durationSec ?? 0;
  if (/\bpreview\b/i.test(title) && dur > 0 && dur <= 12 * 60) return true;
  if (isNonCatalogSet({ title, durationSec: s.durationSec })) return true;
  return false;
}

/** YouTube Shorts, produce-a-track tutorials — never a catalog set. */
export function isNonCatalogSet(s: {
  title?: string | null;
  durationSec?: number | null;
}): boolean {
  const title = (s.title ?? "").replace(/\s+/g, " ").trim();
  if (!title) return false;
  if (isGenreTagName(title)) return true;
  if (/\b(radio\s*)?shorts?\b/i.test(title)) return true;
  if (/\bfrom scratch\b/i.test(title)) return true;
  if (/\bmakes a\b/i.test(title) && /\btrack\b/i.test(title)) return true;
  if (
    /\b(tutorial|how\s+to\s+(make|produce|build)|training\s+session)\b/i.test(
      title,
    )
  ) {
    return true;
  }
  const dur = s.durationSec ?? 0;
  if (dur > 0 && dur <= 90 && /\bshort\b/i.test(title)) return true;
  return false;
}

/** Effective thumbnail used by SetCard (set cover, else DJ, else event). */
export function setDisplayThumb(s: SetBrowseSignals): string | null {
  const cover = s.imageUrl?.trim() || null;
  if (cover) return cover;
  const dj = s.primaryDjImageUrl?.trim() || null;
  if (dj) return dj;
  return s.eventImageUrl?.trim() || null;
}

/**
 * Official playable festival/club set with no clocks yet.
 * Hidden from home/search; shown on DJ / event pages as list pending.
 */
export function isListPendingOfficialSet(s: {
  title?: string | null;
  trackCount?: number | null;
  durationSec?: number | null;
  playbackUrl?: string | null;
  sourceUrl?: string | null;
  type?: string | null;
  eventKind?: string | null;
}): boolean {
  if ((s.trackCount ?? 0) > 0) return false;
  if (isNonCatalogSet({ title: s.title, durationSec: s.durationSec })) {
    return false;
  }
  const title = s.title ?? "";
  if (/\[preview\]|\(preview\)/i.test(title)) return false;
  const dur = s.durationSec ?? 0;
  if (/\bpreview\b/i.test(title) && dur > 0 && dur <= 12 * 60) return false;
  if (!playablePlaybackUrl(s.playbackUrl, s.sourceUrl)) return false;
  return (
    s.eventKind === "festival" ||
    s.eventKind === "club" ||
    s.type === "festival" ||
    s.type === "club"
  );
}

/** DJ / event lists — clocks or official empty playback. Not junk/preview. */
export function isProfileVisibleSet(s: SetBrowseSignals): boolean {
  if (isNonCatalogSet({ title: s.title, durationSec: s.durationSec })) {
    return false;
  }
  const title = s.title ?? "";
  if (/\[preview\]|\(preview\)/i.test(title)) return false;
  const dur = s.durationSec ?? 0;
  if (/\bpreview\b/i.test(title) && dur > 0 && dur <= 12 * 60) return false;
  if (
    !isBrandHostSlug(s.primaryDjSlug) &&
    s.primaryDjName &&
    isJunkArtistName(s.primaryDjName)
  ) {
    return false;
  }
  if (isListPendingOfficialSet(s)) return true;
  if (isEmptyOrPreviewSet(s)) return false;
  return true;
}

/** Ready for the home feed / set grids — must have a real image URL. */
export function isBrowseReadySet(s: SetBrowseSignals): boolean {
  const brandHost = isBrandHostSlug(s.primaryDjSlug);
  if (
    !brandHost &&
    s.primaryDjName &&
    isJunkArtistName(s.primaryDjName)
  ) {
    return false;
  }
  if (isEmptyOrPreviewSet(s)) return false;
  return setDisplayThumb(s) != null;
}
