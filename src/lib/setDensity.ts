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

export type DensitySeverity = "ok" | "thin" | "severe";

export type SetDensityInput = {
  durationSec: number;
  /** Logged plays on the timeline (any status). */
  playCount: number;
};

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

/** Only flag sets at least this long (short uploads are noisy). */
export const DENSITY_MIN_DURATION_SEC = 30 * 60;

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
  const expectedPlays =
    durationSec > 0 ? Math.max(1, Math.round(durationSec / EXPECTED_PLAY_SEC)) : 0;
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
