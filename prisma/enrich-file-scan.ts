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
import {
  ACR_IDENTIFY_VARIABLES_LABEL,
  formatAcrHitRate,
  formatAcrTrackMessage,
} from "../src/lib/ingest/enrich/acrProbeRecord";
import {
  githubEnrichContext,
  mergeEnrichRunReport,
} from "../src/lib/ingest/enrich/enrichRunReport";

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
        formatAcrTrackMessage({
          probed: stats.ready,
          identified: stats.identified,
          partial: stats.partial,
          missed: stats.missed,
        }),
        "",
        `| Field | Value |`,
        `| --- | --- |`,
        `| tracks | ${ACR_IDENTIFY_VARIABLES_LABEL} |`,
        `| enabled | ${stats.enabled} |`,
        `| submitted (new, billed) | ${stats.submitted} |`,
        `| reused (same YouTube, no re-POST) | ${stats.reused} |`,
        `| ready | ${stats.ready} |`,
        `| identified | ${stats.identified} |`,
        `| hit rate | ${formatAcrHitRate(stats.identified, stats.ready)} |`,
        `| partial parked | ${stats.partial} |`,
        `| no-match | ${stats.missed} |`,
        `| skipped | ${stats.skipped || "—"} |`,
        "",
      ].join("\n"),
    );
  }
  try {
    await mergeEnrichRunReport(prisma, {
      github: githubEnrichContext(),
      filescan: {
        enabled: stats.enabled,
        submitted: stats.submitted,
        reused: stats.reused,
        ready: stats.ready,
        identified: stats.identified,
        partial: stats.partial,
        missed: stats.missed,
        variables: ACR_IDENTIFY_VARIABLES_LABEL,
        hitRate: formatAcrHitRate(stats.identified, stats.ready),
        skipped: stats.skipped,
      },
    });
  } catch (err) {
    console.warn("[acr-fs] enrich report write failed (non-fatal):", err);
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
