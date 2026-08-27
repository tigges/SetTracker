/**
 * Append one Suggest ID issue snippet to data/resolutions.json.
 *
 * Used by .github/workflows/suggest-id-pr.yml. Prints a one-line JSON
 * result ({status, setSlug, position, timestamp}) for the workflow.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  isSuggestIdIssueTitle,
  mergeSuggestIdRow,
  parseSuggestIdIssueBody,
} from "../src/lib/suggestIdIssue";
import type { ResolutionRow } from "../src/lib/ingest/resolutions";

const file = join(process.cwd(), "data/resolutions.json");
const title = process.env.ISSUE_TITLE || "";
const body = process.env.ISSUE_BODY_FILE
  ? readFileSync(process.env.ISSUE_BODY_FILE, "utf8")
  : process.env.ISSUE_BODY || "";

function emit(payload: Record<string, unknown>): never {
  console.log(JSON.stringify(payload));
  process.exit(0);
}

if (!isSuggestIdIssueTitle(title)) {
  emit({ status: "skip", reason: "title is not an ID suggest issue" });
}

const incoming = parseSuggestIdIssueBody(body);
if (!incoming) {
  emit({ status: "invalid", reason: "issue body has no usable resolutions.json snippet" });
}

const rows = JSON.parse(readFileSync(file, "utf8")) as ResolutionRow[];
if (!Array.isArray(rows)) {
  emit({ status: "invalid", reason: "data/resolutions.json is not an array" });
}

const merged = mergeSuggestIdRow(rows, incoming);
if (merged.status === "duplicate") {
  emit({
    status: "duplicate",
    setSlug: incoming.setSlug,
    position: incoming.position,
    timestamp: incoming.timestamp,
  });
}

writeFileSync(file, `${JSON.stringify(merged.rows, null, 2)}\n`);
emit({
  status: "added",
  setSlug: incoming.setSlug,
  position: incoming.position,
  timestamp: incoming.timestamp,
  artistName: incoming.artistName,
  trackTitle: incoming.trackTitle,
});
