/**
 * Deep-link a set page to an on-site cue (`?t=` seconds).
 * Static export still reads the query on the client.
 */

export function setCueHref(
  slug: string,
  timestampSec?: number | null,
): string {
  const base = `/sets/${slug}`;
  if (timestampSec == null || !Number.isFinite(timestampSec)) return base;
  const sec = Math.max(0, Math.floor(timestampSec));
  return `${base}?t=${sec}`;
}

/**
 * Parse `?t=` / `#t=` values: `93`, `93s`, `1m33s`, `1:33`, `1:02:03`.
 */
export function parseCueSeconds(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s);
  const yt = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)$/i);
  if (yt && (yt[1] || yt[2] || yt[3])) {
    return (
      Number(yt[1] ?? 0) * 3600 +
      Number(yt[2] ?? 0) * 60 +
      Number(yt[3] ?? 0)
    );
  }
  const clock = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if (clock) {
    const a = Number(clock[1]);
    const b = Number(clock[2]);
    if (clock[3] != null) return a * 3600 + b * 60 + Number(clock[3]);
    return a * 60 + b;
  }
  return null;
}

export function cueSecondsFromLocation(
  search: string,
  hash = "",
): number | null {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const fromQuery = parseCueSeconds(new URLSearchParams(q).get("t"));
  if (fromQuery != null) return fromQuery;
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  if (h.startsWith("t=")) return parseCueSeconds(h.slice(2));
  return null;
}

export function nearestPlayByCue<T extends { timestamp: number }>(
  plays: T[],
  cueSec: number,
): T | null {
  if (plays.length === 0) return null;
  let best = plays[0]!;
  let bestDelta = Math.abs(best.timestamp - cueSec);
  for (let i = 1; i < plays.length; i++) {
    const play = plays[i]!;
    const delta = Math.abs(play.timestamp - cueSec);
    if (delta < bestDelta) {
      best = play;
      bestDelta = delta;
    }
  }
  return best;
}
