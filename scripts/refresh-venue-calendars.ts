/**
 * Fetch official club calendars and write data/venue-calendars/*.json.
 * Used to refresh committed seeds after a live scrape.
 *
 *   npx tsx scripts/refresh-venue-calendars.ts
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  scanVenueCalendars,
  writeVenueCalendarSeed,
} from "../src/lib/ingest/discovery/venueCalendars/scan";

async function main() {
  mkdirSync(join(process.cwd(), "data", "venue-calendars"), { recursive: true });
  const parsed = await scanVenueCalendars({ persistSeed: true });
  let nights = 0;
  for (const row of parsed) {
    nights += row.nights.length;
    if (row.detail !== "live" && row.nights.length) {
      writeVenueCalendarSeed(row.source, row.nights);
    }
    console.log(
      `  ${row.source.venueSlug}: ${row.nights.length} (${row.detail})`,
    );
  }
  console.log(`[venue-calendar] wrote ${nights} nights across ${parsed.length} venues`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
