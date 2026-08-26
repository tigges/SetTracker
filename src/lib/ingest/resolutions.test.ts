import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ResolutionRow } from "./resolutions";

const rows = JSON.parse(
  readFileSync(join(process.cwd(), "data/resolutions.json"), "utf8"),
) as ResolutionRow[];

assert.ok(Array.isArray(rows), "data/resolutions.json must be an array");

for (const row of rows) {
  // applyResolutions counts a bad slug or position as "missing" and moves on, so
  // a typo publishes nothing and reports no error. Fail here instead.
  assert.ok(row.setSlug, "row needs a setSlug");
  assert.match(
    row.setSlug,
    /^(yt|sc)-[A-Za-z0-9._-]+$/,
    `suspicious setSlug ${row.setSlug} — must be the catalog slug`,
  );
  assert.ok(
    !row.setSlug.startsWith("example"),
    "example rows are placeholders and must not ship",
  );
  assert.ok(
    Number.isInteger(row.position) && row.position > 0,
    `row ${row.setSlug} needs a positive integer position`,
  );
  assert.ok(row.trackTitle?.trim(), `row ${row.setSlug} needs a trackTitle`);
  assert.ok(row.artistName?.trim(), `row ${row.setSlug} needs an artistName`);
}

// One resolution per play. Two rows for the same position would leave the second
// silently counted as "skipped" once the first flipped the row.
const seen = new Map<string, number>();
for (const row of rows) {
  const key = `${row.setSlug}#${row.position}`;
  seen.set(key, (seen.get(key) ?? 0) + 1);
}
for (const [key, n] of seen) {
  assert.equal(n, 1, `${key} is resolved ${n}× — keep one row per play`);
}

console.log("ingest/resolutions.test.ts ok", rows.length);
