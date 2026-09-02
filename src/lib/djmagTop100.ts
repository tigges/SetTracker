/**
 * DJ Mag Top 100 DJs (seeded chart year) — shared by enrich demand proxy
 * and transparent home-feed spotlight ordering.
 *
 * Uses a static JSON import (not node:fs) so server modules stay NFT-safe
 * and nothing in this graph can leak into the client bundle via accident.
 */

import raw from "../../data/artist-seeds/djmag-top100-djs-2025.json";

/**
 * DJ Mag list permalinks that are not the catalog Dj.slug.
 * Chart writes "Dimitri Vegas & Mike"; catalog is the atomic act
 * "Dimitri Vegas & Like Mike".
 */
const CHART_SLUG_TO_CATALOG: Record<string, string> = {
  "dimitri-vegas-mike": "dimitri-vegas-like-mike",
};

/** DJ Mag Top 100 slug → chart rank (1 = #1). Catalog aliases included. */
export function loadDjMagTop100RankBySlug(): Map<string, number> {
  const out = new Map<string, number>();
  const djs = (raw as { djs?: Array<{ slug?: string; rank?: number }> }).djs ?? [];
  for (const d of djs) {
    if (d.slug && typeof d.rank === "number") {
      out.set(d.slug, d.rank);
      const catalog = CHART_SLUG_TO_CATALOG[d.slug];
      if (catalog) out.set(catalog, d.rank);
    }
  }
  return out;
}
