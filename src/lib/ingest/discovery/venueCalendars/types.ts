/** Official club-calendar night — scraped, never invented. */

export type VenueNightRoom = {
  name: string;
  artists: string[];
};

export type VenueNightSeed = {
  title: string;
  /** UTC calendar day YYYY-MM-DD */
  startsAt: string;
  endsAt?: string;
  sourceUrl: string;
  ticketsUrl?: string;
  rooms?: VenueNightRoom[];
  artists: string[];
};

export type VenueCalendarFile = {
  venueSlug: string;
  venueName: string;
  sourceUrl: string;
  fetchedAt: string;
  nights: VenueNightSeed[];
};

export type VenueCalendarParser =
  | "jsonld"
  | "amnesia"
  | "savaya"
  | "warehouse-project"
  | "pacha"
  | "fabric"
  | "illuzion"
  | "bootshaus"
  | "berghain";

export type VenueCalendarSource = {
  venueSlug: string;
  venueName: string;
  location?: string;
  website: string;
  calendarUrl: string;
  /** Extra fetch (ICS) merged with HTML. */
  icsUrl?: string;
  parser: VenueCalendarParser;
  seedFile: string;
  /** Used when the page omits a year (WHP / Bootshaus day-month). */
  defaultYear?: number;
  weight?: number;
};

export type ParsedVenueCalendar = {
  source: VenueCalendarSource;
  nights: VenueNightSeed[];
  detail: "live" | "seed" | "live+seed";
};
