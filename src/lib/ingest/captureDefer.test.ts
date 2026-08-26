import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  activeDeferSlugs,
  captureDeferUntil,
  deferNoteBySlug,
  isDeferRowActive,
  withDeferRow,
  type CaptureDeferFile,
} from "./captureDefer";

const now = Date.parse("2026-08-26T12:00:00Z");

// A YYYY-MM-DD park covers the whole named day, so "today" is still parked.
assert.equal(
  isDeferRowActive({ slug: "a", until: "2026-08-26" }, now),
  true,
  "the until day itself is still parked",
);
assert.equal(isDeferRowActive({ slug: "a", until: "2026-08-25" }, now), false);
assert.equal(isDeferRowActive({ slug: "a", until: "2026-09-25" }, now), true);
assert.equal(
  isDeferRowActive({ slug: "a", until: "2026-08-27T06:00:00Z" }, now),
  true,
);
assert.equal(isDeferRowActive({ slug: "a", until: "" }, now), false);
assert.equal(isDeferRowActive({ slug: "a", until: "whenever" }, now), false);

const file: CaptureDeferFile = {
  rows: [
    { slug: "yt-parked", until: "2026-09-25", note: "no 1001 yet" },
    { slug: "yt-expired", until: "2026-08-01" },
    { slug: "yt-bad", until: "nope" },
    { slug: "", until: "2026-09-25" },
  ],
};
const active = activeDeferSlugs(file, now);
assert.deepEqual([...active], ["yt-parked"], "expired and junk rows come back");
assert.deepEqual([...activeDeferSlugs(null, now)], []);
assert.deepEqual([...activeDeferSlugs({}, now)], []);
assert.equal(deferNoteBySlug(file).get("yt-parked"), "no 1001 yet");

// Re-parking a slug replaces its row rather than duplicating it.
const merged = withDeferRow(file, { slug: "yt-parked", until: "2026-12-01" });
assert.equal(merged.rows?.filter((r) => r.slug === "yt-parked").length, 1);
assert.equal(
  merged.rows?.find((r) => r.slug === "yt-parked")?.until,
  "2026-12-01",
);
assert.equal(merged.rows?.length, file.rows?.length);

const until = captureDeferUntil(30, now);
assert.equal(until, "2026-09-25");
assert.equal(isDeferRowActive({ slug: "a", until }, now), true);

// The committed file must stay parseable — /stats imports it at build time.
const committed = JSON.parse(
  readFileSync(join(process.cwd(), "data/capture-defer.json"), "utf8"),
) as CaptureDeferFile;
assert.ok(Array.isArray(committed.rows), "capture-defer.json needs rows[]");
for (const row of committed.rows ?? []) {
  assert.ok(row.slug, "every defer row needs a slug");
  assert.ok(
    /^\d{4}-\d{2}-\d{2}/.test(row.until),
    `defer row ${row.slug} needs an ISO until`,
  );
}

console.log("captureDefer.test.ts ok");
