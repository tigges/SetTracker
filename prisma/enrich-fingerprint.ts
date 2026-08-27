/**
 * CLI: ACRCloud fingerprint enrich for sparse sets.
 * Usage: npm run enrich:fingerprint
 *
 * Requires ACRCLOUD_ENABLED=1 + ACRCLOUD_* credentials.
 * Safe no-op when disabled or credentials missing.
 */
import { appendFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { enrichSparseSetsWithAcrCloud } from "../src/lib/ingest/enrich/acrcloud";
import {
  ACR_IDENTIFY_VARIABLES_LABEL,
  formatAcrHitRate,
  formatAcrTrackMessage,
} from "../src/lib/ingest/enrich/acrProbeRecord";
import {
  githubEnrichContext,
  inspectCookiesFromEnv,
  mergeEnrichRunReport,
} from "../src/lib/ingest/enrich/enrichRunReport";

const prisma = new PrismaClient();

function writeStepSummary(stats: {
  enabled: boolean;
  candidates: number;
  probed: number;
  identified: number;
  unresolved: number;
  partial: number;
  missed: number;
  skipped: string;
  clipFails: number;
  setsProbed: number;
  youtubeBotWalls: number;
  youtubeSkipped: number;
}): void {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  const lines = [
    "",
    "## ACRCloud Identify totals",
    "",
    formatAcrTrackMessage(stats),
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| tracks | ${ACR_IDENTIFY_VARIABLES_LABEL} |`,
    `| enabled | ${stats.enabled} |`,
    `| candidates | ${stats.candidates} |`,
    `| sets probed | ${stats.setsProbed} |`,
    `| ACR probes | ${stats.probed} |`,
    `| identified | ${stats.identified} |`,
    `| hit rate | ${formatAcrHitRate(stats.identified, stats.probed)} |`,
    `| partial parked | ${stats.partial} |`,
    `| no-match | ${stats.missed} |`,
    `| unresolved / weak | ${stats.unresolved} |`,
    `| clip fails | ${stats.clipFails} |`,
    `| YouTube bot-walls | ${stats.youtubeBotWalls} |`,
    `| YouTube skipped | ${stats.youtubeSkipped} |`,
    `| skipped | ${stats.skipped || "—"} |`,
    "",
    "YouTube Identify from GitHub IPs is unreliable even with cookies. File Scanning (next step) is the CI path for YouTube. This step does **not** fail the job on bot-walls.",
    "",
  ];
  if (!stats.enabled && /missing ACRCLOUD/i.test(stats.skipped)) {
    lines.push(
      "> Add repo secrets `ACRCLOUD_HOST`, `ACRCLOUD_ACCESS_KEY`, `ACRCLOUD_ACCESS_SECRET`, then re-run **Catalog enrich**.",
      "",
    );
  }
  appendFileSync(path, lines.join("\n"));
}

async function main() {
  const stats = await enrichSparseSetsWithAcrCloud(prisma);
  console.log("[acrcloud] done", stats);
  if (!stats.enabled && stats.skipped) {
    console.log(`[acrcloud] skipped: ${stats.skipped}`);
    if (/missing ACRCLOUD/i.test(stats.skipped)) {
      console.log(
        "::warning::ACRCLOUD_* secrets missing — fingerprint enrich no-op",
      );
    }
  } else if (stats.enabled) {
    console.log(
      `[acrcloud] ${formatAcrTrackMessage(stats)} ` +
        `clipFails=${stats.clipFails} ytBotWalls=${stats.youtubeBotWalls} ytSkipped=${stats.youtubeSkipped}`,
    );
    if (stats.youtubeBotWalls > 0) {
      console.log(
        `::warning title=ACR Identify::${stats.youtubeBotWalls} YouTube bot-wall(s), ${stats.youtubeSkipped} YouTube set(s) skipped. File Scan still runs — this step did not fail.`,
      );
    } else {
      console.log(
        `::notice title=ACR Identify::${formatAcrTrackMessage(stats)} sets=${stats.setsProbed} clipFails=${stats.clipFails} ytSkipped=${stats.youtubeSkipped}`,
      );
    }
  }
  writeStepSummary(stats);
  try {
    await mergeEnrichRunReport(prisma, {
      github: githubEnrichContext(),
      cookies: inspectCookiesFromEnv(),
      identify: {
        enabled: stats.enabled,
        candidates: stats.candidates,
        setsProbed: stats.setsProbed,
        probed: stats.probed,
        identified: stats.identified,
        unresolved: stats.unresolved,
        partial: stats.partial,
        missed: stats.missed,
        variables: ACR_IDENTIFY_VARIABLES_LABEL,
        hitRate: formatAcrHitRate(stats.identified, stats.probed),
        clipFails: stats.clipFails,
        youtubeBotWalls: stats.youtubeBotWalls,
        youtubeSkipped: stats.youtubeSkipped,
        skipped: stats.skipped,
      },
    });
  } catch (err) {
    console.warn("[acrcloud] enrich report write failed (non-fatal):", err);
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
