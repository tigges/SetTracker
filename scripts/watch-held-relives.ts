/**
 * Report held 1001 seeds waiting on official Relives.
 * Usage: npx tsx scripts/watch-held-relives.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { buildHeldReliveWatch } from "../src/lib/ingest/nextCaptures";

function main() {
  const report = buildHeldReliveWatch();
  const outDir = join(process.cwd(), "data/crosscheck");
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, "held-relive-watch.json");
  writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
  console.log(`[held-relive] ${report.held.length} seeds waiting on official Relive`);
  for (const h of report.held) {
    console.log(`  - ${h.name} (${h.seed})`);
  }
  console.log(`wrote ${path}`);
}

main();
