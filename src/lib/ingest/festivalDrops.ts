/**
 * Official festival drop sources + curated edition windows.
 *
 * Phase 0–1: YT Relive playlists / SC venue accounts / deeper channel polls.
 * Phase 2–4: edition calendar, post-weekend boost, gap reporting.
 */

export type FestivalEditionSeed = {
  /** KNOWN_EVENTS slug */
  eventSlug: string;
  /** Unique edition slug, e.g. tomorrowland-2026-belgium */
  slug: string;
  year: number;
  label?: string;
  startsAt: string; // ISO date
  endsAt: string;
};

/** Curated edition windows — hand-maintained, never scraped. */
export const FESTIVAL_EDITION_SEEDS: FestivalEditionSeed[] = [
  {
    eventSlug: "tomorrowland",
    slug: "tomorrowland-2026-belgium",
    year: 2026,
    label: "Belgium",
    startsAt: "2026-07-17",
    endsAt: "2026-07-26",
  },
  {
    eventSlug: "tomorrowland",
    slug: "tomorrowland-2025-belgium",
    year: 2025,
    label: "Belgium",
    startsAt: "2025-07-18",
    endsAt: "2025-07-27",
  },
  {
    eventSlug: "tomorrowland",
    slug: "tomorrowland-2026-winter",
    year: 2026,
    label: "Winter",
    startsAt: "2026-03-14",
    endsAt: "2026-03-21",
  },
  {
    eventSlug: "ultra-miami",
    slug: "ultra-miami-2026",
    year: 2026,
    label: "Miami",
    startsAt: "2026-03-27",
    endsAt: "2026-03-29",
  },
  {
    eventSlug: "ultra-miami",
    slug: "ultra-miami-2025",
    year: 2025,
    label: "Miami",
    startsAt: "2025-03-28",
    endsAt: "2025-03-30",
  },
  {
    eventSlug: "edc-lv",
    slug: "edc-lv-2026",
    year: 2026,
    label: "Las Vegas",
    startsAt: "2026-05-15",
    endsAt: "2026-05-17",
  },
  {
    eventSlug: "edc-lv",
    slug: "edc-lv-2025",
    year: 2025,
    label: "Las Vegas",
    startsAt: "2025-05-16",
    endsAt: "2025-05-18",
  },
  // Parookaville 2026 — set dates in tracklists1001/festival2026.ts (2026-07-19).
  {
    eventSlug: "parookaville",
    slug: "parookaville-2026",
    year: 2026,
    label: "Germany",
    startsAt: "2026-07-17",
    endsAt: "2026-07-19",
  },
  // Coachella two-weekend windows (Indio).
  {
    eventSlug: "coachella",
    slug: "coachella-2026",
    year: 2026,
    label: "Indio",
    startsAt: "2026-04-10",
    endsAt: "2026-04-19",
  },
  {
    eventSlug: "coachella",
    slug: "coachella-2025",
    year: 2025,
    label: "Indio",
    startsAt: "2025-04-11",
    endsAt: "2025-04-20",
  },
  // HARD Summer — Hollywood Park weekends.
  {
    eventSlug: "hard-summer",
    slug: "hard-summer-2026",
    year: 2026,
    label: "Los Angeles",
    startsAt: "2026-08-01",
    endsAt: "2026-08-02",
  },
  {
    eventSlug: "hard-summer",
    slug: "hard-summer-2025",
    year: 2025,
    label: "Los Angeles",
    startsAt: "2025-08-02",
    endsAt: "2025-08-03",
  },
  // Burning Man — Black Rock City (Labor Day week).
  {
    eventSlug: "burning-man",
    slug: "burning-man-2026",
    year: 2026,
    label: "Black Rock City",
    startsAt: "2026-08-30",
    endsAt: "2026-09-07",
  },
  {
    eventSlug: "burning-man",
    slug: "burning-man-2025",
    year: 2025,
    label: "Black Rock City",
    startsAt: "2025-08-24",
    endsAt: "2025-09-01",
  },
  // Dreamstate SoCal — NOS Events Center weekend.
  {
    eventSlug: "dreamstate",
    slug: "dreamstate-2025",
    year: 2025,
    label: "SoCal",
    startsAt: "2025-11-21",
    endsAt: "2025-11-23",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Default deeper poll when an edition is in the post-weekend drop window. */
export const FESTIVAL_DROP_YT_LIMIT = Number(
  process.env.FESTIVAL_DROP_YT_LIMIT || 100,
);
export const FESTIVAL_DROP_SC_LIMIT = Number(
  process.env.FESTIVAL_DROP_SC_LIMIT || 100,
);

/** Editions whose weekend ended in the last `withinDays` (set-drop window). */
export function recentlyEndedEditions(
  withinDays = 21,
  nowMs = Date.now(),
): FestivalEditionSeed[] {
  return FESTIVAL_EDITION_SEEDS.filter((e) => {
    const end = Date.parse(`${e.endsAt}T23:59:59Z`);
    if (!Number.isFinite(end)) return false;
    const age = nowMs - end;
    return age >= 0 && age <= withinDays * DAY_MS;
  });
}

/** True when any tracked edition is in the post-weekend discovery boost window. */
export function festivalDropBoostActive(nowMs = Date.now()): boolean {
  return recentlyEndedEditions(21, nowMs).length > 0;
}

/** True when this event brand has an edition in the drop window. */
export function eventInDropWindow(
  eventSlug: string,
  withinDays = 21,
  nowMs = Date.now(),
): boolean {
  return recentlyEndedEditions(withinDays, nowMs).some(
    (e) => e.eventSlug === eventSlug,
  );
}

/**
 * Raise poll depth for sources tied to a festival currently in its
 * post-weekend Relive / upload dump window. Base limit otherwise.
 */
export function festivalSourcePollLimit(
  eventSlug: string | undefined | null,
  baseLimit: number,
  boostLimit: number = FESTIVAL_DROP_YT_LIMIT,
  withinDays = 21,
  nowMs = Date.now(),
): number {
  if (!eventSlug || !eventInDropWindow(eventSlug, withinDays, nowMs)) {
    return baseLimit;
  }
  return Math.max(baseLimit, boostLimit);
}

/**
 * Infer edition year (+ optional winter/belgium hint) from a set title.
 */
export function editionHintsFromTitle(title: string): {
  year: number | null;
  labelHint: string | null;
} {
  const yearMatch = title.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  let labelHint: string | null = null;
  if (/\bwinter\b/i.test(title)) labelHint = "Winter";
  else if (/\bbelgium\b|\bboom\b/i.test(title)) labelHint = "Belgium";
  else if (/\bmiami\b/i.test(title)) labelHint = "Miami";
  else if (/\blas\s*vegas\b|\bedc\s*lv\b/i.test(title)) labelHint = "Las Vegas";
  else if (/\borlando\b/i.test(title)) labelHint = "Orlando";
  else if (/\bindio\b/i.test(title)) labelHint = "Indio";
  else if (/\bsocal\b|\bsan\s*bernardino\b/i.test(title)) labelHint = "SoCal";
  else if (/\bgermany\b|\bweeze\b/i.test(title)) labelHint = "Germany";
  return {
    year:
      year != null && year >= 2005 && year <= new Date().getUTCFullYear() + 1
        ? year
        : null,
    labelHint,
  };
}

/** Pick best matching curated edition for an event + title hints. */
export function matchEditionSeed(
  eventSlug: string,
  title: string,
  publishedAt?: Date | null,
): FestivalEditionSeed | null {
  const { year, labelHint } = editionHintsFromTitle(title);
  const candidates = FESTIVAL_EDITION_SEEDS.filter(
    (e) => e.eventSlug === eventSlug,
  );
  if (!candidates.length) return null;

  const byYear = year
    ? candidates.filter((e) => e.year === year)
    : candidates;

  if (labelHint) {
    const labeled = byYear.filter(
      (e) => e.label?.toLowerCase() === labelHint.toLowerCase(),
    );
    if (labeled[0]) return labeled[0]!;
  }

  if (byYear[0]) return byYear[0]!;

  // Fall back: edition whose window contains publishedAt, else latest year.
  if (publishedAt) {
    const t = publishedAt.getTime();
    const inWindow = candidates.find((e) => {
      const a = Date.parse(`${e.startsAt}T00:00:00Z`);
      const b = Date.parse(`${e.endsAt}T23:59:59Z`);
      return t >= a && t <= b + 45 * DAY_MS; // allow set-drop lag after weekend
    });
    if (inWindow) return inWindow;
  }

  return [...candidates].sort((a, b) => b.year - a.year)[0] ?? null;
}

/** Sets whose edition ended recently — for homepage Festival season rail. */
export function isFestivalSeasonSet(
  s: {
    eventSlug?: string | null;
    editionEndsAt?: Date | string | null;
    publishedAt: Date | string;
    type?: string;
  },
  withinDays = 21,
  nowMs = Date.now(),
): boolean {
  if (s.editionEndsAt) {
    const end = new Date(s.editionEndsAt).getTime();
    if (Number.isFinite(end)) {
      const age = nowMs - end;
      return age >= -2 * DAY_MS && age <= withinDays * DAY_MS;
    }
  }
  // Fallback without edition: festival-type + known brand + recent publish
  // in a post-weekend boost window for that brand.
  if (!s.eventSlug || s.type !== "festival") return false;
  const boost = recentlyEndedEditions(withinDays, nowMs).some(
    (e) => e.eventSlug === s.eventSlug,
  );
  if (!boost) return false;
  return nowMs - new Date(s.publishedAt).getTime() < withinDays * DAY_MS;
}
