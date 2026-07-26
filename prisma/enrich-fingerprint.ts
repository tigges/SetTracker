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

const prisma = new PrismaClient();

function writeStepSummary(stats: {
  enabled: boolean;
  candidates: number;
  probed: number;
  identified: number;
  unresolved: number;
  skipped: string;
}): void {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  const lines = [
    "## ACRCloud fingerprint enrich",
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| enabled | ${stats.enabled} |`,
    `| candidates | ${stats.candidates} |`,
    `| probed | ${stats.probed} |`,
    `| identified | ${stats.identified} |`,
    `| unresolved | ${stats.unresolved} |`,
    `| skipped | ${stats.skipped || "—"} |`,
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
      `[acrcloud] identified=${stats.identified} unresolved=${stats.unresolved} probed=${stats.probed}`,
    );
  }
  writeStepSummary(stats);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
