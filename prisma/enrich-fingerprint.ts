/**
 * CLI: ACRCloud fingerprint enrich for sparse sets.
 * Usage: npm run enrich:fingerprint
 *
 * Requires ACRCLOUD_ENABLED=1 + ACRCLOUD_* credentials.
 * Safe no-op when disabled or credentials missing.
 */
import { PrismaClient } from "@prisma/client";
import { enrichSparseSetsWithAcrCloud } from "../src/lib/ingest/enrich/acrcloud";

const prisma = new PrismaClient();

async function main() {
  const stats = await enrichSparseSetsWithAcrCloud(prisma);
  console.log("[acrcloud] done", stats);
  if (!stats.enabled && stats.skipped) {
    console.log(`[acrcloud] skipped: ${stats.skipped}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
