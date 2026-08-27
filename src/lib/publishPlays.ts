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

import { clocksLookInterpolated } from "./clockHonesty";
import {
  collapseConsecutivePlays,
  isPlaceholderTitle,
  playCollapseKey,
} from "./playCollapse";
import { expectedPlayCount, expectedPlaySec } from "./setDensity";
import {
  classifySourceComment,
  collapseHostCommentTimes,
  extractQuotedTitle,
  isHostCommentProvenance,
  isRadioTalkWindow,
  radioTalkRegions,
  type SourceCommentKind,
} from "./sourceComments";
import type { IdStatus } from "./status";

export const COMMENT_NOT_DETECTED = "Not detected";
export const COMMENT_LOW_CONFIDENCE = "Auto track detection with low confidence";
export const COMMENT_LIKELY_TALK = "Likely talk";
/** Per-row title when the cue has no name yet. */
export const UNKNOWN_TRACK_TITLE = "Unknown track";
export const TALK_COLOR = "var(--slate)";

/** Listener-facing title. Maps leftover "Unknown" rows to the same copy. */
export function displayPlayTitle(title: string | null | undefined): string {
  const t = (title ?? "").trim();
  if (!t || isPlaceholderTitle(t)) return UNKNOWN_TRACK_TITLE;
  return t;
}

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
  title?: string | null;
};

export type PublishablePlay = {
  id: string;
  position: number;
  /**
   * Played.position as stored. numberPublished rewrites `position` for display,
   * so anything that has to address the row in the database — Suggest ID, and
   * therefore data/resolutions.json — must carry this instead.
   */
  sourcePosition?: number;
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
  segmentKind?: "track" | "talk" | null;
  talkUntil?: number | null;
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
      /weak score\s+\d+\s*:\s*(.+?)\s+[-–—]\s+(.+?)(?:\s*[·|]\s*ISRC\s+\S+)?$/i,
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

export function isTalkPlay(
  play: Pick<PublishablePlay, "segmentKind" | "detectionComment">,
): boolean {
  return play.segmentKind === "talk" || play.detectionComment === COMMENT_LIKELY_TALK;
}

export function segmentColor(
  play: Pick<PublishablePlay, "idStatus" | "segmentKind" | "detectionComment">,
): string {
  if (isTalkPlay(play)) return TALK_COLOR;
  if (play.idStatus === "identified") return "var(--amber)";
  if (play.idStatus === "community_resolved") return "var(--teal)";
  if (play.idStatus === "unresolved_id") return "var(--magenta)";
  return "var(--grey)";
}

export function publicStatusLabel(
  play: Pick<PublishablePlay, "idStatus" | "detectionComment" | "segmentKind">,
): string {
  if (isTalkPlay(play)) return COMMENT_LIKELY_TALK;
  if (play.detectionComment === COMMENT_NOT_DETECTED) return COMMENT_NOT_DETECTED;
  if (play.detectionComment === COMMENT_LOW_CONFIDENCE) return "Low confidence";
  if (play.idStatus === "unparsed") return COMMENT_NOT_DETECTED;
  if (play.idStatus === "unresolved_id") return UNKNOWN_TRACK_TITLE;
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
  idAskCount?: number;
  droppedChat?: boolean;
  interpolatedSpine?: boolean;
  genre?: string | null;
  type?: string | null;
  title?: string | null;
}): boolean {
  if (input.durationSec < 10 * 60) return false;
  const expected = expectedPlayCount(input.durationSec, input);
  if (expected <= 0) return false;
  if (input.namedCount >= Math.ceil(expected * 0.6)) return false;
  if (input.interpolatedSpine) return false;
  const idAsks = input.idAskCount ?? 0;
  if (input.spineCount >= 5 && input.placeholderCount < 3 && idAsks === 0) {
    return false;
  }
  if (input.placeholderCount >= 3) return true;
  if (idAsks > 0) return true;
  if (input.droppedChat && input.durationSec >= 30 * 60) return true;
  return false;
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
    // Do not inherit the template's stored position — there is no Played row.
    sourcePosition: undefined,
    timestamp,
    idStatus: "unparsed" as const,
    provenance: "community",
    rawText: null,
    title: UNKNOWN_TRACK_TITLE,
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
    segmentKind: "track" as const,
    talkUntil: null,
  };
  if (!template) return base as unknown as PublishedPlay<T>;
  return {
    ...template,
    ...base,
  } as unknown as PublishedPlay<T>;
}

function talkSlot<T extends PublishablePlay>(
  startSec: number,
  endSec: number,
  template: T | null,
): PublishedPlay<T> {
  const base = {
    id: `talk:${startSec}`,
    position: 0,
    sourcePosition: undefined,
    timestamp: startSec,
    idStatus: "unparsed" as const,
    provenance: "community",
    rawText: null,
    title: "Talk",
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
    detectionComment: COMMENT_LIKELY_TALK,
    suggestedArtist: null,
    suggestedTitle: null,
    segmentKind: "talk" as const,
    talkUntil: endSec,
  };
  if (!template) return base as unknown as PublishedPlay<T>;
  return {
    ...template,
    ...base,
  } as unknown as PublishedPlay<T>;
}

function attachTalkRegions<T extends PublishablePlay>(
  plays: PublishedPlay<T>[],
  meta: PublishPlayMeta,
  template: T | null,
): PublishedPlay<T>[] {
  const regions = radioTalkRegions(meta.durationSec, meta);
  if (regions.length === 0) {
    return numberPublished(plays);
  }
  const extras: PublishedPlay<T>[] = [];
  for (const region of regions) {
    const blocked = plays.some(
      (p) =>
        !isTalkPlay(p) &&
        p.timestamp >= region.startSec &&
        p.timestamp < region.endSec,
    );
    if (blocked) continue;
    extras.push(talkSlot(region.startSec, region.endSec, template));
  }
  return numberPublished(
    [...plays, ...extras].sort((a, b) => a.timestamp - b.timestamp),
  );
}

function numberPublished<T extends PublishablePlay>(
  plays: PublishedPlay<T>[],
): PublishedPlay<T>[] {
  let n = 0;
  return plays.map((p) => {
    // Keep the stored position before overwriting it, so callers that address
    // the DB row (Suggest ID) are not handed a display index.
    // 0 is emptySlot/talkSlot's placeholder, not a stored Played.position.
    const sourcePosition =
      p.sourcePosition && p.sourcePosition > 0 ? p.sourcePosition : undefined;
    if (isTalkPlay(p)) return { ...p, sourcePosition, position: 0 };
    n += 1;
    return { ...p, sourcePosition, position: n };
  });
}

function commentText(play: Pick<PublishablePlay, "title" | "rawText" | "idNote">): string {
  return [play.idNote, play.rawText, play.title].filter(Boolean).join(" \n ");
}

function sourceCommentKind(play: PublishablePlay): SourceCommentKind {
  return classifySourceComment(commentText(play));
}

function isNamedPlay(play: PublishablePlay): boolean {
  return (
    !!playCollapseKey(play) ||
    isConfirmedId(play.idStatus) ||
    sourceCommentKind(play) === "named"
  );
}

function isHostIdAsk(play: PublishablePlay): boolean {
  if (!isHostCommentProvenance(play.provenance)) return false;
  if (isNamedPlay(play) && sourceCommentKind(play) === "named") return false;
  if (sourceCommentKind(play) === "id-ask") return true;
  const title = (play.title ?? "").trim();
  return /^id\s*[-–—]\s*id$/i.test(title) || isPlaceholderTitle(title);
}

function isHostChatPlay(play: PublishablePlay): boolean {
  if (!isHostCommentProvenance(play.provenance)) return false;
  if (isConfirmedId(play.idStatus)) return false;
  if (playCollapseKey(play)) return false;
  const kind = sourceCommentKind(play);
  if (kind === "named" || kind === "id-ask") return false;
  const title = (play.title ?? "").trim();
  if (
    title &&
    !isPlaceholderTitle(title.toLowerCase()) &&
    !/^id\s*[-–—]\s*id$/i.test(title) &&
    !/[?]/.test(title) &&
    !hasVendorDetectionCopy(title)
  ) {
    return false;
  }
  return true;
}

function nearestWithin<T extends { timestamp: number }>(
  ts: number,
  rows: T[],
  maxSec: number,
): T | null {
  let best: T | null = null;
  let bestDist = maxSec;
  for (const row of rows) {
    const d = Math.abs(row.timestamp - ts);
    if (d <= bestDist) {
      best = row;
      bestDist = d;
    }
  }
  return best;
}

function normalizeHostAsk<T extends PublishablePlay>(play: PublishedPlay<T>): PublishedPlay<T> {
  if (!isHostCommentProvenance(play.provenance)) return play;
  if (isNamedPlay(play) && sourceCommentKind(play) === "named") {
    const quoted = extractQuotedTitle(commentText(play));
    if (quoted && isPlaceholderTitle((play.title ?? "").toLowerCase())) {
      return {
        ...play,
        title: quoted,
        suggestedTitle: play.suggestedTitle ?? quoted,
        idStatus: play.idStatus === "unparsed" ? "unresolved_id" : play.idStatus,
      };
    }
    return play;
  }
  if (!isHostIdAsk(play)) return play;
  const quoted = extractQuotedTitle(commentText(play));
  const note = [play.idNote, play.rawText].find(
    (t) => t && classifySourceComment(t) !== "chat" && !hasVendorDetectionCopy(t),
  ) ?? null;
  return {
    ...play,
    title: quoted ?? UNKNOWN_TRACK_TITLE,
    artistName: play.artistName,
    suggestedTitle: play.suggestedTitle ?? quoted,
    idStatus: "unresolved_id",
    idNote: note,
    rawText: note,
    detectionComment: null,
  };
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
    title:
      !suggestedTitle && isPlaceholderTitle(play.title ?? "")
        ? UNKNOWN_TRACK_TITLE
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
 * Host comment times outrank cadence / fingerprint grids.
 * Never drops a confirmed / overlay named cue.
 */
export function publishSetPlays<T extends PublishablePlay>(
  plays: T[],
  meta: PublishPlayMeta,
): PublishedPlay<T>[] {
  const annotated = plays.map((p) => annotatePlay(p));
  const placeholders = annotated.filter((p) => isFingerprintPlaceholder(p));
  const droppedChat = annotated.some(
    (p) => !isFingerprintPlaceholder(p) && isHostChatPlay(p),
  );
  const withoutChat = annotated
    .filter((p) => !isFingerprintPlaceholder(p) && !isHostChatPlay(p))
    .map((p) => normalizeHostAsk(p));

  const hostAsks = withoutChat.filter(
    (p) => isHostCommentProvenance(p.provenance) && !isNamedPlay(p),
  );
  const rest = withoutChat.filter((p) => !hostAsks.includes(p));
  const collapsedAsks = collapseHostCommentTimes(hostAsks, sourceCommentKind);
  let kept = collapseConsecutivePlays([...rest, ...collapsedAsks]);

  const half = expectedPlaySec(meta) / 2;
  const hostTimes = kept.filter(
    (p) => isHostCommentProvenance(p.provenance) || p.provenance === "1001tl",
  );
  const fpHits = kept.filter(
    (p) => p.provenance === "fingerprint" && !isFingerprintPlaceholder(p),
  );
  const other = kept.filter((p) => !hostTimes.includes(p) && !fpHits.includes(p));
  const mergedHosts = hostTimes.map((h) => ({ ...h }));
  const unsnapped: PublishedPlay<T>[] = [];
  for (const fp of fpHits) {
    const host = nearestWithin(fp.timestamp, mergedHosts, half);
    if (!host) {
      unsnapped.push(fp);
      continue;
    }
    const idx = mergedHosts.indexOf(host);
    mergedHosts[idx] = {
      ...host,
      title: playCollapseKey(fp) ? fp.title : host.title,
      artistName: fp.artistName ?? host.artistName,
      suggestedArtist: fp.suggestedArtist ?? host.suggestedArtist,
      suggestedTitle: fp.suggestedTitle ?? host.suggestedTitle,
      idStatus: isConfirmedId(fp.idStatus) ? fp.idStatus : host.idStatus,
      trackSlug: fp.trackSlug ?? host.trackSlug,
      detectionComment: fp.detectionComment ?? host.detectionComment,
      timestamp: host.timestamp,
    };
  }
  kept = collapseConsecutivePlays([...mergedHosts, ...other, ...unsnapped]);

  const named = kept.filter((p) => isNamedPlay(p));
  const idAsks = kept.filter((p) => isHostIdAsk(p) && !isNamedPlay(p));
  const spineCount = kept.filter(
    (p) =>
      isPublishSpineProvenance(p.provenance) &&
      isNamedPlay(p) &&
      p.provenance !== "fingerprint",
  ).length;
  const interpolatedSpine = clocksLookInterpolated(
    named.map((p) => p.timestamp),
    meta.durationSec,
  );
  const fill = shouldFillExpectedSlots({
    durationSec: meta.durationSec,
    namedCount: named.length,
    placeholderCount: placeholders.length,
    spineCount,
    idAskCount: idAsks.length,
    droppedChat,
    interpolatedSpine,
    genre: meta.genre,
    type: meta.type,
    title: meta.title,
  });

  const sorted = [...kept].sort((a, b) => a.timestamp - b.timestamp);
  const template = sorted[0] ?? annotated[0] ?? null;
  if (!fill) {
    return attachTalkRegions(sorted, meta, template);
  }

  const expected = expectedPlayCount(meta.durationSec, meta);
  const need = Math.max(0, expected - sorted.length);
  if (need === 0) {
    return attachTalkRegions(sorted, meta, template);
  }

  const existingTs = sorted.map((p) => p.timestamp);
  const candidates = cadenceTimestamps(meta.durationSec, expected).filter((ts) => {
    if (nearestDistance(ts, existingTs) <= half) return false;
    if (isRadioTalkWindow(ts, meta.durationSec, meta)) return false;
    return true;
  });
  const extras = candidates
    .slice(0, need)
    .map((ts, i) => emptySlot(ts, i, template));

  return attachTalkRegions(
    [...sorted, ...extras].sort((a, b) => a.timestamp - b.timestamp),
    meta,
    template,
  );
}

export type StatusCounts = Record<IdStatus, number>;

export type RawPlayTally = {
  counts: StatusCounts;
  trackCount: number;
  fingerprintUnparsed: number;
  spineCount: number;
  hostUnparsed?: number;
  hostUnresolved?: number;
};

/** Card / feed counts: hide miss-grid rows; fill expected slots when needed. */
export function publishListTally(
  raw: RawPlayTally,
  meta: PublishPlayMeta,
): { counts: StatusCounts; trackCount: number } {
  const fpUnparsed = Math.max(0, raw.fingerprintUnparsed);
  const hostUnparsed = Math.max(0, raw.hostUnparsed ?? 0);
  const idAsks = Math.max(0, raw.hostUnresolved ?? 0);
  const named = Math.max(0, raw.trackCount - fpUnparsed - hostUnparsed);
  const counts: StatusCounts = {
    identified: raw.counts.identified,
    community_resolved: raw.counts.community_resolved,
    unresolved_id: raw.counts.unresolved_id,
    unparsed: Math.max(0, raw.counts.unparsed - fpUnparsed - hostUnparsed),
  };
  const fill = shouldFillExpectedSlots({
    durationSec: meta.durationSec,
    namedCount: Math.max(0, named - idAsks),
    placeholderCount: fpUnparsed,
    spineCount: raw.spineCount,
    idAskCount: idAsks,
    droppedChat: hostUnparsed > 0,
    genre: meta.genre,
    type: meta.type,
    title: meta.title,
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
