/**
 * Detect even-spaced / interpolated clocks so the public setgraph
 * does not treat a named list as precise cue times.
 */

/** True when timestamps look like duration * (i+1) / (n+1) or i * duration / n. */
export function clocksLookInterpolated(
  timestamps: number[],
  durationSec: number,
): boolean {
  const n = timestamps.length;
  if (n < 6 || durationSec < 10 * 60) return false;
  const sorted = [...timestamps].sort((a, b) => a - b);
  const dur = Math.max(1, durationSec);
  const slack = Math.max(8, Math.round(dur / (n * 4)));
  const fits = (at: (i: number) => number) =>
    sorted.filter((ts, i) => Math.abs(ts - at(i)) <= slack).length >=
    Math.ceil(n * 0.8);
  return (
    fits((i) => Math.round((dur * (i + 1)) / (n + 1))) ||
    fits((i) => Math.round((dur * i) / n)) ||
    fits((i) => Math.round((dur * (i + 0.5)) / n))
  );
}
