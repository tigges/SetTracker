/**
 * CLI: ACRCloud File Scanning enrich for sparse YouTube sets.
 * Usage: npm run enrich:filescan
 *
 * Server-side YouTube fingerprinting (no yt-dlp / cookies / bot walls).
 * Safe no-op unless ACRCLOUD_FS_TOKEN + ACRCLOUD_FS_CONTAINER_ID are set.
 */
import { appendFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { enrichYoutubeSetsWithFileScan } from "../src/lib/ingest/enrich/acrFileScan";

const prisma = new PrismaClient();

async function main() {
  const stats = await enrichYoutubeSetsWithFileScan(prisma);
  console.log("[acr-fs] done", stats);
  if (!stats.enabled) {
    console.log(`[acr-fs] skipped: ${stats.skipped}`);
    console.log(
      "::notice::ACRCloud File Scanning not configured — set ACRCLOUD_FS_TOKEN + ACRCLOUD_FS_CONTAINER_ID",
    );
  }
  const gh = process.env.GITHUB_STEP_SUMMARY;
  if (gh) {
    appendFileSync(
      gh,
      [
        "## ACRCloud File Scanning (YouTube)",
        "",
        `| Field | Value |`,
        `| --- | --- |`,
        `| enabled | ${stats.enabled} |`,
        `| scanned | ${stats.scanned} |`,
        `| identified | ${stats.identified} |`,
        `| skipped | ${stats.skipped || "—"} |`,
        "",
      ].join("\n"),
    );
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
