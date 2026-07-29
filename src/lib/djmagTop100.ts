/**
 * DJ Mag Top 100 DJs (seeded chart year) — shared by enrich demand proxy
 * and transparent home-feed spotlight ordering.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** DJ Mag Top 100 slug → chart rank (1 = #1). */
export function loadDjMagTop100RankBySlug(): Map<string, number> {
  const path = join(
    process.cwd(),
    "data",
    "artist-seeds",
    "djmag-top100-djs-2025.json",
  );
  const out = new Map<string, number>();
  if (!existsSync(path)) return out;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      djs?: Array<{ slug?: string; rank?: number }>;
    };
    for (const d of raw.djs ?? []) {
      if (d.slug && typeof d.rank === "number") out.set(d.slug, d.rank);
    }
  } catch {
    /* ignore */
  }
  return out;
}
