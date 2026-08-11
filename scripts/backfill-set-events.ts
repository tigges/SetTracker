/**
 * Soft-attach Event rows to sets with null eventId via title inference.
 * Usage: npx tsx scripts/backfill-set-events.ts
 */
import { PrismaClient } from "@prisma/client";
import { backfillSetEventsFromTitles } from "../src/lib/ingest/backfillSetEvents";

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await backfillSetEventsFromTitles(prisma);
    console.log(
      `[event-backfill] attached=${result.attached} of ${result.scanned} null-event sets`,
    );
    const top = Object.entries(result.byEvent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
    for (const [slug, n] of top) console.log(`  ${slug}: ${n}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
