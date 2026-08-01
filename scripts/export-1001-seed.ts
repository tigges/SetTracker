/**
 * Turn a saved 1001Tracklists HTML page into a TS seed you can paste into
 * src/lib/ingest/tracklists1001/festival2026.ts.
 *
 * How to get the HTML (when CI is Cloudflare-blocked):
 *   1. Open the tracklist in your browser
 *   2. File → Save Page As… → "Webpage, Complete" (or "HTML Only")
 *   3. Run:
 *        npx tsx scripts/export-1001-seed.ts ~/Downloads/westend.html \
 *          --slug yt-jQLWYc2UrFY --duration 3552 --name TL_WESTEND_EDC_LV_2026
 *
 * Prefer the console capture script when possible (live DOM, fewer save quirks):
 *   scripts/capture-1001tl.console.js
 */
import { readFileSync } from "node:fs";
import { parse1001TracklistHtml } from "../src/lib/ingest/tracklists1001/parse";
import {
  formatSeedTs,
  playsToCaptureRows,
  captureRowsToSeedRows,
} from "../src/lib/ingest/tracklists1001/toSeed";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i < 0) return undefined;
  return process.argv[i + 1];
}

function usage(): never {
  console.error(`Usage:
  npx tsx scripts/export-1001-seed.ts <saved.html> [options]

Options:
  --slug <sourceSlug>     e.g. yt-yXHoHK_jQvc or sc-itsthewestend-…
  --name <CONST_NAME>     e.g. TL_AHEE_LIQUID_STRANGER_EDC_LV_2026
  --duration <sec>        set length (default 3600); used if cues are sparse
  --json                  also print JSON rows to stderr summary only on stdout TS
`);
  process.exit(1);
}

const file = process.argv[2];
if (!file || file.startsWith("-")) usage();

const html = readFileSync(file!, "utf8");
const durationSec = Number(arg("--duration") || 3600);
const slug = arg("--slug");
const name = arg("--name") || "TL_CAPTURED";
const asJson = process.argv.includes("--json");

const plays = parse1001TracklistHtml(html, durationSec);
const capture = playsToCaptureRows(plays);
const seed = captureRowsToSeedRows(capture, {
  evenlySpaceDurationSec: durationSec,
});

if (!seed.length) {
  console.error(
    "No tracks parsed. Tip: save the page after it fully loads, or use scripts/capture-1001tl.console.js in DevTools on the live page.",
  );
  process.exit(2);
}

console.error(
  `[export-1001] ${seed.length} rows from ${file} (plays=${plays.length})`,
);
if (asJson) {
  console.log(JSON.stringify(seed, null, 2));
} else {
  console.log(
    formatSeedTs(seed, {
      constName: name,
      sourceSlug: slug,
      sourceUrl: file,
    }),
  );
}
