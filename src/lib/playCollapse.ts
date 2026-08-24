/**
 * Collapse consecutive same-song cues.
 *
 * Fingerprint / ACR probes often re-ID the same playing track every minute.
 * Keep the first cue. A later non-adjacent replay (opener + closer) stays.
 */

export type PlayCollapseFields = {
  trackSlug?: string | null;
  artistName?: string | null;
  title?: string | null;
  trackTitle?: string | null;
};

function norm(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function isPlaceholderTitle(title: string): boolean {
  if (!title || title === "unknown") return true;
  if (/^id\s*@/i.test(title)) return true;
  if (/^acr-miss\b/i.test(title)) return true;
  return false;
}

/** Stable identity, or null when the row is not a real song cue. */
export function playCollapseKey(p: PlayCollapseFields): string | null {
  if (p.trackSlug?.trim()) return `slug:${p.trackSlug.trim().toLowerCase()}`;
  const artist = norm(p.artistName);
  const title = norm(p.title ?? p.trackTitle);
  if (!artist || isPlaceholderTitle(title)) return null;
  return `name:${artist}::${title}`;
}

/** Drop consecutive rows that resolve to the same song. */
export function collapseConsecutivePlays<T>(
  plays: T[],
  keyOf: (play: T) => string | null = (play) =>
    playCollapseKey(play as PlayCollapseFields),
): T[] {
  const out: T[] = [];
  let lastKey: string | null = null;
  for (const play of plays) {
    const key = keyOf(play);
    if (key && key === lastKey) continue;
    out.push(play);
    if (key) lastKey = key;
  }
  return out;
}
