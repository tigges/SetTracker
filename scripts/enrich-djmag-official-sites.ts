/**
 * Scrape official club websites from DJ Mag Top 100 profile pages and
 * persist them into data/venue-seeds/djmag-top100-clubs-2026.json.
 *
 *   npx tsx scripts/enrich-djmag-official-sites.ts
 *   DJMAG_OFFICIAL_LIMIT=10 npx tsx scripts/enrich-djmag-official-sites.ts
 */

import { enrichDjMagOfficialWebsites } from "../src/lib/ingest/discovery/djmagClubs";

async function main() {
  const limit = process.env.DJMAG_OFFICIAL_LIMIT
    ? Number(process.env.DJMAG_OFFICIAL_LIMIT)
    : undefined;
  const { fetched, found } = await enrichDjMagOfficialWebsites({
    missingOnly: process.env.DJMAG_REFRESH_ALL !== "1",
    limit,
    persistSeed: true,
  });
  console.log(`[enrich-djmag] fetched=${fetched} found=${found}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
