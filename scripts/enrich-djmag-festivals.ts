/**
 * Fill official festival websites for DJ Mag Top 100 Festivals
 * (KNOWN_EVENTS aliases + Wikidata P856) and persist the seed.
 *
 *   npm run enrich:djmag-festivals
 */

import { enrichDjMagFestivalWebsites } from "../src/lib/ingest/discovery/djmagFestivals";

async function main() {
  const limit = process.env.DJMAG_OFFICIAL_LIMIT
    ? Number(process.env.DJMAG_OFFICIAL_LIMIT)
    : undefined;
  const { fetched, found } = await enrichDjMagFestivalWebsites({
    missingOnly: process.env.DJMAG_REFRESH_ALL !== "1",
    limit,
    persistSeed: true,
  });
  console.log(`[enrich-djmag-festivals] fetched=${fetched} found=${found}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
