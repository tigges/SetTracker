/**
 * Fill-null Dj socials from SoundCloud profile descriptions.
 *
 *   npm run catalog-sc-socials
 */
import { PrismaClient } from "@prisma/client";
import { runCatalogScSocials } from "../src/lib/ingest/discovery/catalogScSocials";

const prisma = new PrismaClient();

async function main() {
  const stats = await runCatalogScSocials(prisma);
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
