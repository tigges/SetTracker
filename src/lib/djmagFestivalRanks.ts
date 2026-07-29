/**
 * DJ Mag Top 100 Festivals ranks for feed ordering (sync, seed-only).
 * Chart slug and curated Event aliases both map to the same rank.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Chart slug → KNOWN_EVENTS / Event.slug used in the catalog. */
const CHART_TO_EVENT_SLUG: Record<string, string> = {
  tomorrowland: "tomorrowland",
  "edc-las-vegas": "edc-lv",
  "edc-lv": "edc-lv",
  "ultra-music-festival": "ultra-miami",
  ultra: "ultra-miami",
  "coachella-valley-music-and-arts-festival": "coachella",
  coachella: "coachella",
  lollapalooza: "lollapalooza",
  "hard-summer": "hard-summer",
  "burning-man": "burning-man",
  dreamstate: "dreamstate",
  "nocturnal-wonderland": "nocturnal-wonderland",
  "beyond-wonderland": "beyond-wonderland",
  "escape-halloween": "escape-halloween",
  "countdown-nye": "countdown-nye",
};

/** Event / chart slug → festival chart rank (1 = #1). */
export function loadDjMagFestivalRankBySlug(): Map<string, number> {
  const path = join(
    process.cwd(),
    "data",
    "venue-seeds",
    "djmag-top100-festivals-2026.json",
  );
  const out = new Map<string, number>();
  if (!existsSync(path)) return out;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      festivals?: Array<{ slug?: string; rank?: number }>;
    };
    for (const f of raw.festivals ?? []) {
      if (!f.slug || typeof f.rank !== "number") continue;
      out.set(f.slug, f.rank);
      const alias = CHART_TO_EVENT_SLUG[f.slug];
      if (alias) {
        const prev = out.get(alias);
        if (prev == null || f.rank < prev) out.set(alias, f.rank);
      }
    }
    // Reverse aliases (edc-lv → chart rank already set via edc-las-vegas).
    for (const [chart, eventSlug] of Object.entries(CHART_TO_EVENT_SLUG)) {
      const rank = out.get(chart) ?? out.get(eventSlug);
      if (rank != null) {
        out.set(chart, rank);
        out.set(eventSlug, rank);
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}
