import { isTalkPlay } from "./publishPlays";

export type StripCue = number | { timestamp: number; until?: number | null };

/** One published play → one setgraph segment. Same order as the tracklist. */
export type SetgraphPlay = {
  id: string;
  timestamp: number;
  talkUntil?: number | null;
  segmentKind?: "track" | "talk" | null;
  detectionComment?: string | null;
};

export type SetgraphSegment = {
  id: string;
  timestamp: number;
  until: number | null;
  talk: boolean;
};

export function setgraphSegments(
  plays: readonly SetgraphPlay[],
): SetgraphSegment[] {
  return plays.map((p) => ({
    id: p.id,
    timestamp: p.timestamp,
    until: p.talkUntil ?? null,
    talk: isTalkPlay(p),
  }));
}

/** 0–1 along the mix, or null when we have no live clock. */
export function setgraphPlayheadRatio(
  nowSec: number | null | undefined,
  durationSec: number,
): number | null {
  if (nowSec == null || !Number.isFinite(nowSec) || durationSec <= 0) {
    return null;
  }
  return Math.min(1, Math.max(0, nowSec / durationSec));
}

/** Cue lengths for the set strip. Zero-length gaps become 1s so they still paint. */
export function playSpans(
  timestamps: StripCue[],
  durationSec: number,
): number[] {
  const end = Math.max(durationSec, 0);
  const cues = timestamps.map((t) =>
    typeof t === "number" ? { timestamp: t, until: null } : t,
  );
  return cues.map((cue, i) => {
    const next = i < cues.length - 1 ? cues[i + 1]!.timestamp : end;
    const hard = cue.until != null ? Math.min(cue.until, next) : next;
    return Math.max(hard - cue.timestamp, 1);
  });
}

/** Map a 0–1 x position along the strip to a cue index (same weights as flex-grow). */
export function cueIndexAtRatio(ratio: number, spans: number[]): number {
  if (spans.length === 0) return 0;
  const total = spans.reduce((n, s) => n + s, 0);
  if (total <= 0) return 0;
  const t = Math.min(1, Math.max(0, ratio)) * total;
  let acc = 0;
  for (let i = 0; i < spans.length; i++) {
    acc += spans[i];
    if (t <= acc) return i;
  }
  return spans.length - 1;
}

/** Tighten gaps once a 5px floor would overflow a phone card (~340px). */
export function stripIsDense(cueCount: number): boolean {
  return cueCount > 40;
}

/**
 * Mix map for every set page with published cues. Host (YT / SC) does
 * not matter. Playback clock follows the playhead — it is not a gate.
 */
export function setgraphVisible(playCount: number): boolean {
  return playCount > 0;
}
