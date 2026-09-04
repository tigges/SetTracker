#!/usr/bin/env tsx
/**
 * CI helper: print `run=0|1` and `reason=...` for deploy-pages.yml.
 *
 *   npx tsx scripts/pages-need-curated-ingest.ts \
 *     --event push --ingest auto --changed-file-list /tmp/changed.txt
 */
import { readFileSync } from "node:fs";
import { decideCuratedIngest } from "../src/lib/pages/needCuratedIngest";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function flag(name: string): boolean {
  return process.argv.includes(name);
}

const eventName = arg("--event") || process.env.GITHUB_EVENT_NAME || "push";
const mode = arg("--ingest") || process.env.PAGES_INGEST || "auto";
const listPath = arg("--changed-file-list");
const noPrevious = flag("--no-previous-sha");

let changedFiles: string[] = [];
if (listPath) {
  changedFiles = readFileSync(listPath, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

const decision = decideCuratedIngest({
  eventName,
  mode,
  changedFiles,
  hasPreviousSha: noPrevious ? false : undefined,
});

console.log(`run=${decision.run ? "1" : "0"}`);
console.log(`reason=${decision.reason}`);
if (decision.warn) {
  console.log(`::warning::${decision.warn}`);
}
