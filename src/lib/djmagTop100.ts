/**
 * DJ Mag Top 100 DJs (seeded chart year) — shared by enrich demand proxy
 * and transparent home-feed spotlight ordering.
 *
 * Uses a static JSON import (not node:fs) so server modules stay NFT-safe
 * and nothing in this graph can leak into the client bundle via accident.
 */

import raw from "../../data/artist-seeds/djmag-top100-djs-2025.json";
import { canonicalDjSlug, DJ_SLUG_ALIASES } from "./ingest/djSlugAliases";

/** DJ Mag Top 100 slug → chart rank (1 = #1). Includes alias slugs. */
export function loadDjMagTop100RankBySlug(): Map<string, number> {
  const byCanonical = new Map<string, number>();
  const djs = (raw as { djs?: Array<{ slug?: string; rank?: number }> }).djs ?? [];
  for (const d of djs) {
    if (d.slug && typeof d.rank === "number") {
      byCanonical.set(d.slug, d.rank);
      byCanonical.set(canonicalDjSlug(d.slug), d.rank);
    }
  }
  const out = new Map(byCanonical);
  for (const [alias, canonical] of Object.entries(DJ_SLUG_ALIASES)) {
    const rank = byCanonical.get(canonical);
    if (rank != null) out.set(alias, rank);
  }
  return out;
}

export function djMagTop100RankForSlug(
  slug: string,
  ranks = loadDjMagTop100RankBySlug(),
): number | undefined {
  return ranks.get(slug) ?? ranks.get(canonicalDjSlug(slug));
}
