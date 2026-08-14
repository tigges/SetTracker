/**
 * Curated festival / venue lineup pages to scan on every deep ingest.
 * Live HTML/CDN scrape first; lineup seed JSON is the fallback.
 */

export type LineupSource = {
  eventSlug: string;
  eventName: string;
  /** Human page (also used as Event.website when missing). */
  website: string;
  /** Prefer this URL for scraping when set. */
  lineupUrl?: string;
  /** Tomorrowland-style CDN event id (e.g. TL26BE). */
  cdnEventId?: string;
  cdnLang?: string;
  /** Fallback artist list under data/lineup-seeds/ */
  seedFile?: string;
  weight?: number;
};

export const LINEUP_SOURCES: LineupSource[] = [
  {
    eventSlug: "tomorrowland",
    eventName: "Tomorrowland",
    website: "https://www.tomorrowland.com/",
    lineupUrl: "https://belgium.tomorrowland.com/en/line-up/",
    cdnEventId: "TL26BE",
    cdnLang: "en",
    seedFile: "tomorrowland-belgium.json",
    weight: 36,
  },
  {
    eventSlug: "street-parade",
    eventName: "Street Parade",
    website: "https://www.streetparade.com/",
    lineupUrl: "https://www.streetparade.com/",
    weight: 28,
  },
  {
    eventSlug: "edc-lv",
    eventName: "EDC Las Vegas",
    website: "https://lasvegas.edc.com/",
    lineupUrl: "https://lasvegas.edc.com/lineup/",
    weight: 34,
  },
  {
    eventSlug: "ultra-miami",
    eventName: "Ultra Music Festival",
    website: "https://ultramusicfestival.com/",
    lineupUrl: "https://ultramusicfestival.com/lineup/",
    weight: 32,
  },
];
