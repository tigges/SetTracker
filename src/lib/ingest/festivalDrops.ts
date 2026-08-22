/**
 * Official festival drop sources + curated edition windows.
 *
 * Phase 0–1: YT official playback playlists / SC venue accounts / deeper channel polls.
 * Phase 2: edition calendar (Events page).
 * Phase 3: post-weekend poll + Festival season rail boost.
 * Phase 4: gap reporting → /stats#capture-1001 scoring.
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
  // Parookaville 2024 — official weekend 19–21 Jul.
  {
    eventSlug: "parookaville",
    slug: "parookaville-2024",
    year: 2024,
    label: "Germany",
    startsAt: "2024-07-19",
    endsAt: "2024-07-21",
  },
  // Parookaville 2025 — official weekend 18–20 Jul (set 2025-07-20).
  {
    eventSlug: "parookaville",
    slug: "parookaville-2025",
    year: 2025,
    label: "Germany",
    startsAt: "2025-07-18",
    endsAt: "2025-07-20",
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
  {
    eventSlug: "dreamstate",
    slug: "dreamstate-2026",
    year: 2026,
    label: "SoCal",
    startsAt: "2026-11-20",
    endsAt: "2026-11-22",
  },
  // Insomniac SoCal classics — curated weekend windows.
  {
    eventSlug: "nocturnal-wonderland",
    slug: "nocturnal-wonderland-2025",
    year: 2025,
    label: "SoCal",
    startsAt: "2025-09-13",
    endsAt: "2025-09-14",
  },
  {
    eventSlug: "beyond-wonderland",
    slug: "beyond-wonderland-2026",
    year: 2026,
    label: "SoCal",
    startsAt: "2026-03-20",
    endsAt: "2026-03-21",
  },
  {
    eventSlug: "beyond-wonderland",
    slug: "beyond-wonderland-2025",
    year: 2025,
    label: "SoCal",
    startsAt: "2025-03-21",
    endsAt: "2025-03-22",
  },
  {
    eventSlug: "escape-halloween",
    slug: "escape-halloween-2025",
    year: 2025,
    label: "SoCal",
    startsAt: "2025-10-24",
    endsAt: "2025-10-25",
  },
  {
    eventSlug: "countdown-nye",
    slug: "countdown-nye-2025",
    year: 2025,
    label: "SoCal",
    startsAt: "2025-12-30",
    endsAt: "2026-01-01",
  },
  // Lollapalooza Chicago.
  {
    eventSlug: "lollapalooza",
    slug: "lollapalooza-2026",
    year: 2026,
    label: "Chicago",
    startsAt: "2026-07-30",
    endsAt: "2026-08-02",
  },
  {
    eventSlug: "lollapalooza",
    slug: "lollapalooza-2025",
    year: 2025,
    label: "Chicago",
    startsAt: "2025-07-31",
    endsAt: "2025-08-03",
  },
  // Chart-heavy European / UK festivals — official playback dumps.
  {
    eventSlug: "untold",
    slug: "untold-2026",
    year: 2026,
    label: "Cluj-Napoca",
    startsAt: "2026-08-06",
    endsAt: "2026-08-09",
  },
  {
    eventSlug: "untold",
    slug: "untold-2025",
    year: 2025,
    label: "Cluj-Napoca",
    startsAt: "2025-08-07",
    endsAt: "2025-08-10",
  },
  {
    eventSlug: "creamfields",
    slug: "creamfields-2026",
    year: 2026,
    label: "Daresbury",
    startsAt: "2026-08-20",
    endsAt: "2026-08-23",
  },
  {
    eventSlug: "creamfields",
    slug: "creamfields-2025",
    year: 2025,
    label: "Daresbury",
    startsAt: "2025-08-21",
    endsAt: "2025-08-24",
  },
  {
    eventSlug: "defqon1",
    slug: "defqon1-2026",
    year: 2026,
    label: "Biddinghuizen",
    startsAt: "2026-06-25",
    endsAt: "2026-06-28",
  },
  {
    eventSlug: "defqon1",
    slug: "defqon1-2025",
    year: 2025,
    label: "Biddinghuizen",
    startsAt: "2025-06-26",
    endsAt: "2025-06-29",
  },
  {
    eventSlug: "mysteryland",
    slug: "mysteryland-2026",
    year: 2026,
    label: "Haarlemmermeer",
    startsAt: "2026-07-04",
    endsAt: "2026-07-05",
  },
  {
    eventSlug: "mysteryland",
    slug: "mysteryland-2025",
    year: 2025,
    label: "Haarlemmermeer",
    startsAt: "2025-07-05",
    endsAt: "2025-07-06",
  },
  {
    eventSlug: "electric-love",
    slug: "electric-love-2026",
    year: 2026,
    label: "Salzburg",
    startsAt: "2026-07-09",
    endsAt: "2026-07-11",
  },
  {
    eventSlug: "electric-love",
    slug: "electric-love-2025",
    year: 2025,
    label: "Salzburg",
    startsAt: "2025-07-10",
    endsAt: "2025-07-12",
  },
  {
    eventSlug: "time-warp",
    slug: "time-warp-2026",
    year: 2026,
    label: "Mannheim",
    startsAt: "2026-04-03",
    endsAt: "2026-04-05",
  },
  {
    eventSlug: "awakenings",
    slug: "awakenings-2026",
    year: 2026,
    label: "Spaarnwoude",
    startsAt: "2026-07-11",
    endsAt: "2026-07-12",
  },
  {
    eventSlug: "parklife",
    slug: "parklife-2026",
    year: 2026,
    label: "Manchester",
    startsAt: "2026-06-06",
    endsAt: "2026-06-07",
  },
  {
    eventSlug: "parklife",
    slug: "parklife-2025",
    year: 2025,
    label: "Manchester",
    startsAt: "2025-06-07",
    endsAt: "2025-06-08",
  },
  {
    eventSlug: "street-parade",
    slug: "street-parade-2025",
    year: 2025,
    label: "Zürich",
    startsAt: "2025-08-09",
    endsAt: "2025-08-09",
  },
  {
    eventSlug: "nature-one",
    slug: "nature-one-2025",
    year: 2025,
    label: "Germany",
    startsAt: "2025-08-01",
    endsAt: "2025-08-03",
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
 * Insomniac brand channel covers multiple festival editions — boost when
 * any of these are in the post-weekend drop window.
 */
export const INSOMNIAC_FESTIVAL_EVENT_SLUGS = [
  "edc-lv",
  "hard-summer",
  "nocturnal-wonderland",
  "beyond-wonderland",
  "escape-halloween",
  "countdown-nye",
  "dreamstate",
] as const;

/**
 * Raise poll depth for sources tied to a festival currently in its
 * post-weekend playback / upload dump window. Base limit otherwise.
 * Pass multiple slugs for brand channels (e.g. Insomniac).
 */
export function festivalSourcePollLimit(
  eventSlug: string | readonly string[] | undefined | null,
  baseLimit: number,
  boostLimit: number = FESTIVAL_DROP_YT_LIMIT,
  withinDays = 21,
  nowMs = Date.now(),
): number {
  const slugs = Array.isArray(eventSlug)
    ? eventSlug
    : eventSlug
      ? [eventSlug]
      : [];
  if (!slugs.some((s) => eventInDropWindow(s, withinDays, nowMs))) {
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
  else if (/\bchicago\b|\bgrant\s*park\b/i.test(title)) labelHint = "Chicago";
  else if (/\bcluj\b|\btransylvania\b/i.test(title)) labelHint = "Cluj-Napoca";
  else if (/\bdaresbury\b|\bwarrington\b/i.test(title)) labelHint = "Daresbury";
  else if (/\bbiddinghuizen\b/i.test(title)) labelHint = "Biddinghuizen";
  else if (/\bmannheim\b/i.test(title)) labelHint = "Mannheim";
  else if (/\bsalzburg\b|\bplainfeld\b/i.test(title)) labelHint = "Salzburg";
  else if (/\bmanchester\b|\bheaton\b/i.test(title)) labelHint = "Manchester";
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
      const inWindow = age >= -2 * DAY_MS && age <= withinDays * DAY_MS;
      if (!inWindow) return false;
      // Don't promote archive uploads remapped onto this edition.
      return nowMs - new Date(s.publishedAt).getTime() < 45 * DAY_MS;
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

const EVENT_BRAND_LABEL: Record<string, string> = {
  tomorrowland: "Tomorrowland",
  "ultra-miami": "Ultra Miami",
  "edc-lv": "EDC Las Vegas",
  parookaville: "Parookaville",
  coachella: "Coachella",
  "hard-summer": "HARD Summer",
  "burning-man": "Burning Man",
  dreamstate: "Dreamstate",
  "nocturnal-wonderland": "Nocturnal Wonderland",
  "beyond-wonderland": "Beyond Wonderland",
  "escape-halloween": "Escape Halloween",
  "countdown-nye": "Countdown NYE",
  lollapalooza: "Lollapalooza",
  untold: "Untold",
  creamfields: "Creamfields",
  defqon1: "Defqon.1",
  mysteryland: "Mysteryland",
  "electric-love": "Electric Love",
  "time-warp": "Time Warp",
  awakenings: "Awakenings",
  parklife: "Parklife",
  "street-parade": "Street Parade",
  "nature-one": "Nature One",
};

export function editionBrandLabel(eventSlug: string): string {
  if (EVENT_BRAND_LABEL[eventSlug]) return EVENT_BRAND_LABEL[eventSlug]!;
  return eventSlug
    .split("-")
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function editionLabel(e: FestivalEditionSeed): string {
  return [editionBrandLabel(e.eventSlug), String(e.year), e.label]
    .filter(Boolean)
    .join(" · ");
}

export type EditionCalendarBucket = "current" | "upcoming" | "recent" | "past";

export type EditionCalendarRow = FestivalEditionSeed & {
  bucket: EditionCalendarBucket;
};

/** Bucket curated editions relative to now (upcoming = next `upcomingDays`). */
export function editionCalendar(
  nowMs = Date.now(),
  opts?: { upcomingDays?: number; recentDays?: number },
): EditionCalendarRow[] {
  const upcomingDays = opts?.upcomingDays ?? 180;
  const recentDays = opts?.recentDays ?? 45;
  return FESTIVAL_EDITION_SEEDS.map((e) => {
    const start = Date.parse(`${e.startsAt}T00:00:00Z`);
    const end = Date.parse(`${e.endsAt}T23:59:59Z`);
    let bucket: EditionCalendarBucket = "past";
    if (Number.isFinite(start) && Number.isFinite(end)) {
      if (nowMs >= start && nowMs <= end) bucket = "current";
      else if (nowMs < start && start - nowMs <= upcomingDays * DAY_MS) {
        bucket = "upcoming";
      } else if (nowMs > end && nowMs - end <= recentDays * DAY_MS) {
        bucket = "recent";
      }
    }
    return { ...e, bucket };
  }).sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );
}

export type EditionCatalogSet = {
  eventSlug?: string | null;
  publishedAt: Date | string;
  trackCount: number;
  durationSec: number;
};

export type EditionGapRow = {
  edition: FestivalEditionSeed;
  setCount: number;
  completeCount: number;
  gap: boolean;
};

/**
 * Editions that have started (or just ended) with fewer than `minComplete`
 * dense tracklists in the catalog — feed capture scoring / Events UI.
 */
export function editionGapReport(
  catalog: EditionCatalogSet[],
  nowMs = Date.now(),
  opts?: { recentDays?: number; minComplete?: number },
): EditionGapRow[] {
  const recentDays = opts?.recentDays ?? 45;
  const minComplete = opts?.minComplete ?? 3;
  const windowed = FESTIVAL_EDITION_SEEDS.filter((e) => {
    const start = Date.parse(`${e.startsAt}T00:00:00Z`);
    const end = Date.parse(`${e.endsAt}T23:59:59Z`);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return nowMs >= start && nowMs - end <= recentDays * DAY_MS;
  });
  return windowed
    .map((edition) => {
      const start = Date.parse(`${edition.startsAt}T00:00:00Z`);
      const end = Date.parse(`${edition.endsAt}T23:59:59Z`) + 45 * DAY_MS;
      const sets = catalog.filter((s) => {
        if (s.eventSlug !== edition.eventSlug) return false;
        const t = new Date(s.publishedAt).getTime();
        return t >= start && t <= end;
      });
      const completeCount = sets.filter(
        (s) => s.trackCount >= 12 && s.durationSec >= 20 * 60,
      ).length;
      return {
        edition,
        setCount: sets.length,
        completeCount,
        gap: completeCount < minComplete,
      };
    })
    .filter((r) => r.gap);
}

export function editionGapEventSlugs(
  catalog: EditionCatalogSet[],
  nowMs = Date.now(),
): Set<string> {
  return new Set(
    editionGapReport(catalog, nowMs).map((r) => r.edition.eventSlug),
  );
}
