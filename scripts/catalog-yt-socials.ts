/**
 * Standalone: scrape YT About / description socials for catalog DJs.
 * Usage: npx tsx scripts/catalog-yt-socials.ts
 * Env: CATALOG_YT_SOCIALS_LIMIT=20
 */
import { PrismaClient } from "@prisma/client";
import { runCatalogYtSocials } from "../src/lib/ingest/discovery/catalogYtSocials";

const prisma = new PrismaClient();

async function main() {
  const stats = await runCatalogYtSocials(prisma);
  console.log(stats);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
