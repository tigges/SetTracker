/**
 * DJ Mag Top 100 Clubs ranks (sync, seed-only).
 * Static JSON import — no node:fs (keeps Next static export / client graphs clean).
 */

import raw from "../../data/venue-seeds/djmag-top100-clubs-2026.json";

/** Event / chart slug → club chart rank (1 = #1). */
export function loadDjMagClubRankBySlug(): Map<string, number> {
  const out = new Map<string, number>();
  const clubs =
    (raw as { clubs?: Array<{ slug?: string; rank?: number }> }).clubs ?? [];
  for (const c of clubs) {
    if (c.slug && typeof c.rank === "number") out.set(c.slug, c.rank);
  }
  return out;
}
