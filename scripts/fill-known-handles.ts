/**
 * Apply roster / knownHandles fill-null, then Wikidata P856 websites.
 *
 *   npx tsx scripts/fill-known-handles.ts
 *   WIKIDATA_LIMIT=40 npx tsx scripts/fill-known-handles.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  fillDjHandlesFromKnown,
  fillDjWebsitesFromWikidata,
} from "../src/lib/ingest/discovery/fillDjHandles";

const prisma = new PrismaClient();

async function main() {
  const known = await fillDjHandlesFromKnown(prisma);
  const wikiLimit = Math.max(0, Number(process.env.WIKIDATA_LIMIT || 40));
  const wikidata =
    wikiLimit > 0
      ? await fillDjWebsitesFromWikidata(prisma, { limit: wikiLimit })
      : 0;
  console.log(JSON.stringify({ known, wikidata }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
