/**
 * Scan DJ Mag Top 100 DJ profiles for From: + fill official websites
 * (roster/pins + Wikidata P856) and persist the seed.
 *
 *   npm run enrich:djmag-djs
 */

import { enrichDjMagDjWebsites } from "../src/lib/ingest/discovery/djmagDjs";

async function main() {
  const limit = process.env.DJMAG_OFFICIAL_LIMIT
    ? Number(process.env.DJMAG_OFFICIAL_LIMIT)
    : undefined;
  const { fetched, found } = await enrichDjMagDjWebsites({
    missingOnly: process.env.DJMAG_REFRESH_ALL !== "1",
    limit,
    persistSeed: true,
  });
  console.log(`[enrich-djmag-djs] fetched=${fetched} found=${found}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
