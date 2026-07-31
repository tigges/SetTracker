/**
 * DJ Mag Top 100 Festivals ranks for feed ordering (sync, seed-only).
 * Chart slug and curated Event aliases both map to the same rank.
 *
 * Static JSON import — no node:fs (keeps Next static export / client graphs clean).
 */

import raw from "../../data/venue-seeds/djmag-top100-festivals-2026.json";

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
  "untold-festival": "untold",
  untold: "untold",
  creamfields: "creamfields",
  defqon1: "defqon1",
  "electric-love": "electric-love",
  parklife: "parklife",
  "time-warp": "time-warp",
  mysteryland: "mysteryland",
  "awakenings-festival": "awakenings",
  awakenings: "awakenings",
  parookaville: "parookaville",
};

/** Event / chart slug → festival chart rank (1 = #1). */
export function loadDjMagFestivalRankBySlug(): Map<string, number> {
  const out = new Map<string, number>();
  const festivals =
    (raw as { festivals?: Array<{ slug?: string; rank?: number }> }).festivals ??
    [];
  for (const f of festivals) {
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
  return out;
}
