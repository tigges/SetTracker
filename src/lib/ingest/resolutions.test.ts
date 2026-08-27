import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { curatedLabelSlugByName } from "./curatedLabels";
import { planResolution, type ResolutionRow } from "./resolutions";
import { slugify } from "./types";

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
  // Set pages renumber plays for display (numberPublished), so the position in
  // a Suggest ID issue is an index, not Played.position. Position-only matching
  // does not just miss — it can land on a different real cue and mislabel it.
  // Every committed row carries the timestamp the issue printed.
  assert.ok(
    Number.isInteger(row.timestamp) && (row.timestamp as number) >= 0,
    `row ${row.setSlug}#${row.position} needs the issue's timestamp — position alone can resolve the wrong cue`,
  );
}

// One resolution per play. Two rows for the same position or timestamp would
// leave the second silently counted as "skipped" once the first flipped the row.
const seen = new Map<string, number>();
const seenTs = new Map<string, number>();
for (const row of rows) {
  const key = `${row.setSlug}#${row.position}`;
  seen.set(key, (seen.get(key) ?? 0) + 1);
  const tsKey = `${row.setSlug}@${row.timestamp}`;
  seenTs.set(tsKey, (seenTs.get(tsKey) ?? 0) + 1);
}
for (const [key, n] of seen) {
  assert.equal(n, 1, `${key} is resolved ${n}× — keep one row per play`);
}
for (const [key, n] of seenTs) {
  assert.equal(n, 1, `${key} is resolved ${n}× — keep one row per clock`);
}

// Labels must land on the curated row, not a slugify twin. "Black Book Records"
// is pinned to `blackbook`, so slugify would mint `black-book-records` and split
// the imprint's releases across two pages — the catalog already carries one such
// duplicate from an earlier path.
assert.equal(curatedLabelSlugByName("Black Book Records"), "blackbook");
assert.notEqual(slugify("Black Book Records"), "blackbook");
assert.equal(curatedLabelSlugByName("Night Bass"), "nightbass");
assert.equal(curatedLabelSlugByName("Some Imprint That Is Not Curated"), null);

for (const row of rows) {
  if (!row.label) continue;
  const curated = curatedLabelSlugByName(row.label);
  const resolved = curated ?? slugify(row.label);
  assert.ok(resolved, `label ${row.label} resolves to no slug`);
  if (curated) {
    assert.equal(
      resolved,
      curated,
      `label ${row.label} must attach to the curated slug ${curated}`,
    );
  }
}

// Timestamp present + no Played row → insert. Falling back to position here
// is how a synthetic expected-slot suggestion mislabels a real cue.
const catalog = [
  { position: 1, timestamp: 90 },
  { position: 2, timestamp: 600 },
];
assert.deepEqual(
  planResolution({ position: 8, timestamp: 1972 }, catalog),
  { kind: "insert", timestamp: 1972 },
);
assert.deepEqual(
  planResolution({ position: 2, timestamp: 600 }, catalog),
  { kind: "update", by: "timestamp" },
);
assert.deepEqual(
  planResolution({ position: 2 }, catalog),
  { kind: "update", by: "position" },
);
assert.deepEqual(
  planResolution({ position: 8 }, catalog),
  { kind: "missing" },
);
// Display index 1 exists as a real play at 90s. A synthetic suggestion for
// play 1 / 348s must insert at 348, not update position 1.
assert.deepEqual(
  planResolution({ position: 1, timestamp: 348 }, catalog),
  { kind: "insert", timestamp: 348 },
);

console.log("ingest/resolutions.test.ts ok", rows.length);
