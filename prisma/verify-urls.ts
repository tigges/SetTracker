import { PrismaClient } from "@prisma/client";
import { applyResolutions } from "../src/lib/ingest/resolutions";
import {
  applyKnownUrlFixes,
  verifyStoredSocialUrls,
} from "../src/lib/ingest/verifyUrls";

const prisma = new PrismaClient();

const curatedOnly = process.env.VERIFY_URLS_CURATED_ONLY === "1";

/**
 * Community ID resolutions are an overlay on existing plays, so they belong
 * here rather than only inside the ingest poll. Pages runs verify-urls on every
 * deploy but gates the poll on curated source changes, so a commit that only
 * adds to data/resolutions.json never reached applyResolutions and the
 * suggestion stayed unpublished. Idempotent: rows already identified or
 * community_resolved are skipped.
 */
async function overlayResolutions(): Promise<void> {
  const stats = await applyResolutions(prisma);
  console.log(`[verify-urls] resolutions:`, stats);
}

(curatedOnly
  ? applyKnownUrlFixes(prisma).then(async (n) => {
      console.log(`[verify-urls] curated fixes: ${n}`);
      await overlayResolutions();
      return { checked: 0, cleared: 0, kept: 0, skipped: 0 };
    })
  : verifyStoredSocialUrls(prisma).then(async (stats) => {
      await overlayResolutions();
      return stats;
    })
)
  .then(async (stats) => {
    console.log("Done:", stats);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
