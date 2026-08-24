/**
 * Public setgraph projection.
 *
 * Fingerprint probes stay in the DB (including per-minute misses). The
 * published timeline is a mix-shaped list: first-party / overlay clocks,
 * confirmed IDs, low-confidence hints to confirm, and — when a miss grid
 * is all we have — expected-cadence slots that ask for an ID.
 *
 * Users never see ACR Cloud / acr-miss / vendor miss wording.
 */

import {
  collapseConsecutivePlays,
  isPlaceholderTitle,
  playCollapseKey,
} from "./playCollapse";
import { expectedPlayCount, expectedPlaySec } from "./setDensity";
import type { IdStatus } from "./status";

export const COMMENT_NOT_DETECTED = "Not detected";
export const COMMENT_LOW_CONFIDENCE = "Auto track detection with low confidence";

const SPINE_PROVENANCE = new Set([
  "1001tl",
  "mixesdb",
  "applemusic",
  "youtube",
  "soundcloud",
  "hearthis",
  "bandcamp",
  "insomniac",
  "community",
]);

const VENDOR_COPY =
  /acr-?miss|acrcloud|acr cloud|no acrcloud match|fingerprint weak/i;

export type PublishPlayMeta = {
  durationSec: number;
  genre?: string | null;
  type?: string | null;
};

export type PublishablePlay = {
  id: string;
  position: number;
  timestamp: number;
  idStatus: string;
  provenance: string;
  rawText?: string | null;
  title: string;
  artistName: string | null;
  idNote?: string | null;
  trackSlug?: string | null;
  detectionComment?: string | null;
  suggestedArtist?: string | null;
  suggestedTitle?: string | null;
};

export type PublishedPlay<T extends PublishablePlay = PublishablePlay> = T & {
  detectionComment: string | null;
  suggestedArtist: string | null;
  suggestedTitle: string | null;
};

export function hasVendorDetectionCopy(
  ...parts: Array<string | null | undefined>
): boolean {
  return parts.some((p) => !!p && VENDOR_COPY.test(p));
}

/** Artist / title from a stored weak-hit note. */
export function parseWeakFingerprintHint(
  ...parts: Array<string | null | undefined>
): { artist: string; title: string } | null {
  for (const part of parts) {
    if (!part) continue;
    const m = part.match(
      /weak score\s+\d+\s*:\s*(.+?)\s+[-–—]\s+(.+)$/i,
    );
    if (!m) continue;
    const artist = m[1]!.replace(/\s+/g, " ").trim();
    const title = m[2]!.replace(/\s+/g, " ").trim();
    if (artist && title && !isPlaceholderTitle(title)) {
      return { artist, title };
    }
  }
  return null;
}

export function publicDetectionComment(
  play: Pick<
    PublishablePlay,
    "idStatus" | "artistName" | "title" | "idNote" | "rawText" | "suggestedArtist"
  >,
): string | null {
  if (play.suggestedArtist || parseWeakFingerprintHint(play.idNote, play.rawText)) {
    return COMMENT_LOW_CONFIDENCE;
  }
  if (
    play.idStatus === "unparsed" &&
    !play.artistName &&
    isPlaceholderTitle((play.title ?? "").toLowerCase())
  ) {
    return COMMENT_NOT_DETECTED;
  }
  return null;
}

export function publicStatusLabel(
  play: Pick<PublishablePlay, "idStatus" | "detectionComment">,
): string {
  if (play.detectionComment === COMMENT_NOT_DETECTED) return COMMENT_NOT_DETECTED;
  if (play.detectionComment === COMMENT_LOW_CONFIDENCE) return "Low confidence";
  if (play.idStatus === "unparsed") return "Unparsed";
  if (play.idStatus === "unresolved_id") return "Unresolved ID";
  if (play.idStatus === "community_resolved") return "Community resolved";
  if (play.idStatus === "identified") return "Identified";
  return play.idStatus;
}

export function isPublishSpineProvenance(provenance: string): boolean {
  return SPINE_PROVENANCE.has(provenance);
}

function isConfirmedId(status: string): boolean {
  return status === "identified" || status === "community_resolved";
}

export function isFingerprintPlaceholder(
  play: Pick<
    PublishablePlay,
    "provenance" | "idStatus" | "title" | "artistName" | "rawText" | "idNote"
  >,
): boolean {
  if (parseWeakFingerprintHint(play.idNote, play.rawText)) return false;
  const title = (play.title ?? play.rawText ?? "").trim();
  if (play.artistName && !isPlaceholderTitle(title.toLowerCase())) return false;
  if (isPlaceholderTitle(title.toLowerCase())) {
    return play.provenance === "fingerprint" || hasVendorDetectionCopy(title, play.rawText, play.idNote);
  }
  return (
    play.provenance === "fingerprint" &&
    play.idStatus === "unparsed" &&
    !play.artistName
  );
}

export function shouldFillExpectedSlots(input: {
  durationSec: number;
  namedCount: number;
  placeholderCount: number;
  spineCount: number;
  genre?: string | null;
  type?: string | null;
}): boolean {
  if (input.durationSec < 10 * 60) return false;
  if (input.placeholderCount < 3) return false;
  if (input.spineCount >= 5) return false;
  const expected = expectedPlayCount(input.durationSec, input);
  if (expected <= 0) return false;
  return input.namedCount < Math.ceil(expected * 0.6);
}

function cadenceTimestamps(durationSec: number, count: number): number[] {
  if (count <= 0 || durationSec <= 0) return [];
  const step = durationSec / count;
  return Array.from({ length: count }, (_, i) =>
    Math.max(0, Math.round(step * (i + 0.5))),
  );
}

function nearestDistance(ts: number, others: number[]): number {
  if (others.length === 0) return Number.POSITIVE_INFINITY;
  let best = Number.POSITIVE_INFINITY;
  for (const other of others) {
    const d = Math.abs(other - ts);
    if (d < best) best = d;
  }
  return best;
}

function emptySlot<T extends PublishablePlay>(
  timestamp: number,
  index: number,
  template: T | null,
): PublishedPlay<T> {
  const base = {
    id: `expected:${timestamp}:${index}`,
    position: 0,
    timestamp,
    idStatus: "unparsed" as const,
    provenance: "community",
    rawText: null,
    title: "Unknown",
    artistName: null,
    idNote: null,
    trackSlug: null,
    imageUrl: null,
    labelName: null,
    labelSlug: null,
    labelColor: null,
    labelImageUrl: null,
    bpm: null,
    musicalKey: null,
    mixName: null,
    remixerName: null,
    genre: null,
    trackDurationSec: null,
    beatportUrl: null,
    spotifyUrl: null,
    hasTrackPage: false,
    isrc: null,
    resolvedTitle: null,
    detectionComment: COMMENT_NOT_DETECTED,
    suggestedArtist: null,
    suggestedTitle: null,
  };
  if (!template) return base as unknown as PublishedPlay<T>;
  return {
    ...template,
    ...base,
  } as unknown as PublishedPlay<T>;
}

function annotatePlay<T extends PublishablePlay>(play: T): PublishedPlay<T> {
  const hint = parseWeakFingerprintHint(play.idNote, play.rawText);
  const suggestedArtist = hint?.artist ?? play.suggestedArtist ?? null;
  const suggestedTitle = hint?.title ?? play.suggestedTitle ?? null;
  const title = suggestedTitle ?? play.title;
  const artistName = suggestedArtist ?? play.artistName;
  const vendor = hasVendorDetectionCopy(play.title, play.rawText, play.idNote);
  const idStatus =
    suggestedArtist && suggestedTitle && play.idStatus === "unparsed"
      ? "unresolved_id"
      : play.idStatus;
  const annotated = {
    ...play,
    title: vendor && !suggestedTitle && isPlaceholderTitle((play.title ?? "").toLowerCase())
      ? "Unknown"
      : title,
    artistName,
    idStatus,
    idNote: vendor ? null : (play.idNote ?? null),
    rawText: vendor ? null : (play.rawText ?? null),
    suggestedArtist,
    suggestedTitle,
    detectionComment: null as string | null,
  };
  annotated.detectionComment = publicDetectionComment(annotated);
  return annotated;
}

/**
 * Project stored plays onto the public setgraph.
 * Never drops a confirmed / first-party named cue.
 */
export function publishSetPlays<T extends PublishablePlay>(
  plays: T[],
  meta: PublishPlayMeta,
): PublishedPlay<T>[] {
  const annotated = plays.map((p) => annotatePlay(p));
  const placeholders = annotated.filter((p) => isFingerprintPlaceholder(p));
  const kept = collapseConsecutivePlays(
    annotated.filter((p) => !isFingerprintPlaceholder(p)),
  );
  const named = kept.filter(
    (p) =>
      !!playCollapseKey(p) ||
      isConfirmedId(p.idStatus) ||
      isPublishSpineProvenance(p.provenance),
  );
  const spineCount = kept.filter((p) => isPublishSpineProvenance(p.provenance)).length;
  const fill = shouldFillExpectedSlots({
    durationSec: meta.durationSec,
    namedCount: named.length,
    placeholderCount: placeholders.length,
    spineCount,
    genre: meta.genre,
    type: meta.type,
  });

  const sorted = [...kept].sort((a, b) => a.timestamp - b.timestamp);
  if (!fill) {
    return sorted.map((p, i) => ({ ...p, position: i + 1 }));
  }

  const expected = expectedPlayCount(meta.durationSec, meta);
  const need = Math.max(0, expected - sorted.length);
  if (need === 0) {
    return sorted.map((p, i) => ({ ...p, position: i + 1 }));
  }

  const existingTs = sorted.map((p) => p.timestamp);
  const half = expectedPlaySec(meta) / 2;
  const candidates = cadenceTimestamps(meta.durationSec, expected).filter(
    (ts) => nearestDistance(ts, existingTs) > half,
  );
  const template = sorted[0] ?? annotated[0] ?? null;
  const extras = candidates
    .slice(0, need)
    .map((ts, i) => emptySlot(ts, i, template));

  return [...sorted, ...extras]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((p, i) => ({ ...p, position: i + 1 }));
}

export type StatusCounts = Record<IdStatus, number>;

export type RawPlayTally = {
  counts: StatusCounts;
  trackCount: number;
  fingerprintUnparsed: number;
  spineCount: number;
};

/** Card / feed counts: hide miss-grid rows; fill expected slots when needed. */
export function publishListTally(
  raw: RawPlayTally,
  meta: PublishPlayMeta,
): { counts: StatusCounts; trackCount: number } {
  const fpUnparsed = Math.max(0, raw.fingerprintUnparsed);
  const named = Math.max(0, raw.trackCount - fpUnparsed);
  const counts: StatusCounts = {
    identified: raw.counts.identified,
    community_resolved: raw.counts.community_resolved,
    unresolved_id: raw.counts.unresolved_id,
    unparsed: Math.max(0, raw.counts.unparsed - fpUnparsed),
  };
  const fill = shouldFillExpectedSlots({
    durationSec: meta.durationSec,
    namedCount: named,
    placeholderCount: fpUnparsed,
    spineCount: raw.spineCount,
    genre: meta.genre,
    type: meta.type,
  });
  if (!fill) {
    return { counts, trackCount: named };
  }
  const expected = expectedPlayCount(meta.durationSec, meta);
  const extra = Math.max(0, expected - named);
  return {
    counts: {
      ...counts,
      unparsed: counts.unparsed + extra,
    },
    trackCount: named + extra,
  };
}
