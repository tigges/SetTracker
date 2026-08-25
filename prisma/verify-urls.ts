import { PrismaClient } from "@prisma/client";
import {
  applyKnownUrlFixes,
  verifyStoredSocialUrls,
} from "../src/lib/ingest/verifyUrls";

const prisma = new PrismaClient();

const curatedOnly = process.env.VERIFY_URLS_CURATED_ONLY === "1";

(curatedOnly
  ? applyKnownUrlFixes(prisma).then((n) => {
      console.log(`[verify-urls] curated fixes: ${n}`);
      return { checked: 0, cleared: 0, kept: 0, skipped: 0 };
    })
  : verifyStoredSocialUrls(prisma)
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
