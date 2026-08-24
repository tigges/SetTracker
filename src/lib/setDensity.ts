/**
 * Tracklist density cross-check.
 *
 * Club/festival DJ sets almost never average 10+ minutes per logged track —
 * house/tech-house typically land ~8–15 tracks/hour (≈3–5 min played each).
 * A ~60m set with only ~6 plays is almost certainly an incomplete parse
 * (thin YouTube Music credits, empty SC description, etc.), not a real set.
 *
 * Songkick / Songstats are not scraped — density is computed from our catalog.
 */

import { familyIdForGenre } from "./genreFamilies";
import { normalizeGenre } from "./genre";

export type DensitySeverity = "ok" | "thin" | "severe";

export type SetCadenceInput = {
  genre?: string | null;
  type?: string | null;
};

export type SetDensityInput = {
  durationSec: number;
  /** Logged plays on the timeline (any status). */
  playCount: number;
} & SetCadenceInput;

export type SetDensity = {
  durationSec: number;
  playCount: number;
  /** Seconds of set per logged play (∞ when playCount=0). */
  avgSecPerPlay: number;
  /** Logged plays per hour of audio. */
  tracksPerHour: number;
  /**
   * Expected plays if each occupied ~EXPECTED_PLAY_SEC of the set
   * (standard club mixing, not full-track playthrough).
   */
  expectedPlays: number;
  /** playCount / expectedPlays (0 when expected is 0). */
  coverage: number;
  severity: DensitySeverity;
  reason: string | null;
};

/** Typical audible time per track in a house/tech-house DJ set. */
export const EXPECTED_PLAY_SEC = 3.5 * 60;

/** Hard ceiling — a miss grid is not 40+ real IDs per hour. */
export const MAX_TRACKS_PER_HOUR = 24;

/** Only flag sets at least this long (short uploads are noisy). */
export const DENSITY_MIN_DURATION_SEC = 30 * 60;

/**
 * Genre / set-type cadence. Evolves from confirmed catalog mixes, not
 * fingerprint miss grids. Radio house runs a bit longer (talk); peak
 * techno and bass are shorter on deck.
 */
export function expectedPlaySec(input: SetCadenceInput = {}): number {
  const family = familyIdForGenre(normalizeGenre(input.genre));
  if (family === "bass") return Math.round(2.75 * 60);
  if (family === "techno") return Math.round(3.25 * 60);
  if (input.type === "radio" && family === "house") return 4 * 60;
  return EXPECTED_PLAY_SEC;
}

/** Likely track count for a published mix graph. */
export function expectedPlayCount(
  durationSec: number,
  input: SetCadenceInput = {},
): number {
  const duration = Math.max(0, durationSec || 0);
  if (duration <= 0) return 0;
  const raw = Math.max(1, Math.round(duration / expectedPlaySec(input)));
  const cap = Math.max(1, Math.round((duration / 3600) * MAX_TRACKS_PER_HOUR));
  return Math.min(raw, cap);
}

/**
 * Severe: avg ≥ 10 min/play OR < 5 tracks/hour.
 * Thin:    avg ≥ 8 min/play  OR < 7 tracks/hour.
 */
export function assessSetDensity(input: SetDensityInput): SetDensity {
  const durationSec = Math.max(0, input.durationSec || 0);
  const playCount = Math.max(0, input.playCount || 0);
  const hours = durationSec / 3600;
  const tracksPerHour = hours > 0 ? playCount / hours : 0;
  const avgSecPerPlay = playCount > 0 ? durationSec / playCount : Number.POSITIVE_INFINITY;
  const expectedPlays = expectedPlayCount(durationSec, input);
  const coverage = expectedPlays > 0 ? playCount / expectedPlays : 0;

  if (durationSec < DENSITY_MIN_DURATION_SEC) {
    return {
      durationSec,
      playCount,
      avgSecPerPlay,
      tracksPerHour,
      expectedPlays,
      coverage,
      severity: "ok",
      reason: null,
    };
  }

  if (playCount === 0) {
    return {
      durationSec,
      playCount,
      avgSecPerPlay,
      tracksPerHour,
      expectedPlays,
      coverage,
      severity: "severe",
      reason: "empty tracklist",
    };
  }

  const avgMin = avgSecPerPlay / 60;
  if (avgSecPerPlay >= 10 * 60 || tracksPerHour < 5) {
    return {
      durationSec,
      playCount,
      avgSecPerPlay,
      tracksPerHour,
      expectedPlays,
      coverage,
      severity: "severe",
      reason: `${playCount} plays / ${fmtHours(durationSec)} (avg ${avgMin.toFixed(1)}m · ${tracksPerHour.toFixed(1)}/h)`,
    };
  }
  if (avgSecPerPlay >= 8 * 60 || tracksPerHour < 7) {
    return {
      durationSec,
      playCount,
      avgSecPerPlay,
      tracksPerHour,
      expectedPlays,
      coverage,
      severity: "thin",
      reason: `${playCount} plays / ${fmtHours(durationSec)} (avg ${avgMin.toFixed(1)}m · ${tracksPerHour.toFixed(1)}/h)`,
    };
  }

  return {
    durationSec,
    playCount,
    avgSecPerPlay,
    tracksPerHour,
    expectedPlays,
    coverage,
    severity: "ok",
    reason: null,
  };
}

function fmtHours(sec: number): string {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

export function isThinTracklist(input: SetDensityInput): boolean {
  const d = assessSetDensity(input);
  return d.severity === "thin" || d.severity === "severe";
}
