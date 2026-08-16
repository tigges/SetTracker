import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VENUE_CALENDAR_SOURCES } from "./sources";
import { calendarArtistHits, parseVenueCalendarHtml } from "./parse";
import type {
  ParsedVenueCalendar,
  VenueCalendarFile,
  VenueCalendarSource,
  VenueNightSeed,
} from "./types";

const TIMEOUT_MS = 18_000;
const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; venue-calendar)";

export type VenueCalendarHit = ReturnType<typeof calendarArtistHits>[number];

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,text/calendar,application/json,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function seedPath(source: VenueCalendarSource): string {
  return join(process.cwd(), "data", "venue-calendars", source.seedFile);
}

export function loadVenueCalendarSeed(
  source: VenueCalendarSource,
): VenueNightSeed[] {
  const path = seedPath(source);
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as VenueCalendarFile;
    return (raw.nights ?? []).filter((n) => n.title && n.startsAt);
  } catch {
    return [];
  }
}

export function writeVenueCalendarSeed(
  source: VenueCalendarSource,
  nights: VenueNightSeed[],
): void {
  const file: VenueCalendarFile = {
    venueSlug: source.venueSlug,
    venueName: source.venueName,
    sourceUrl: source.calendarUrl,
    fetchedAt: new Date().toISOString(),
    nights,
  };
  writeFileSync(seedPath(source), `${JSON.stringify(file, null, 2)}\n`);
}

export async function scrapeVenueCalendar(
  source: VenueCalendarSource,
): Promise<VenueNightSeed[]> {
  const html = await fetchText(source.calendarUrl);
  if (!html) return [];
  const ics = source.icsUrl ? await fetchText(source.icsUrl) : undefined;
  return parseVenueCalendarHtml(source, html, ics ? { ics } : undefined);
}

export async function scanVenueCalendars(opts?: {
  persistSeed?: boolean;
}): Promise<ParsedVenueCalendar[]> {
  const persist = opts?.persistSeed === true || process.env.VENUE_CALENDAR_PERSIST_SEED === "1";
  const out: ParsedVenueCalendar[] = [];
  for (const source of VENUE_CALENDAR_SOURCES) {
    let nights: VenueNightSeed[] = [];
    let detail: ParsedVenueCalendar["detail"] = "seed";
    try {
      nights = await scrapeVenueCalendar(source);
      if (nights.length) {
        detail = "live";
        if (persist) writeVenueCalendarSeed(source, nights);
      }
    } catch (err) {
      console.warn(
        `[venue-calendar] ${source.venueSlug} live failed:`,
        err instanceof Error ? err.message : err,
      );
    }
    if (!nights.length) {
      nights = loadVenueCalendarSeed(source);
      detail = nights.length ? "seed" : "seed";
    }
    console.log(
      `[venue-calendar] ${source.venueSlug}: ${nights.length} nights (${detail})`,
    );
    out.push({ source, nights, detail });
  }
  return out;
}

export function artistHitsFromCalendars(
  parsed: ParsedVenueCalendar[],
): VenueCalendarHit[] {
  return parsed.flatMap((p) => calendarArtistHits(p.source, p.nights));
}
