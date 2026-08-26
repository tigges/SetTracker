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
  captureQueueView,
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

// Parking a row must promote its replacement, not leave a hole. The server
// ships spares past the display limit for exactly this reason.
const rows = Array.from({ length: 45 }, (_, i) => ({ slug: `yt-${i}` }));
const none = captureQueueView(rows, new Set<string>(), 40);
assert.equal(none.open.length, 40);
assert.equal(none.parked.length, 0);
assert.equal(none.reserve, 5);
assert.equal(none.open[39]?.slug, "yt-39");

// Park three of the visible rows: still 40 open, and the next spares moved up.
const parked3 = captureQueueView(rows, new Set(["yt-0", "yt-1", "yt-2"]), 40);
assert.equal(parked3.open.length, 40, "queue refills to the display limit");
assert.equal(parked3.parked.length, 3);
assert.equal(parked3.reserve, 2);
assert.ok(!parked3.open.some((r) => r.slug === "yt-0"));
assert.equal(parked3.open[0]?.slug, "yt-3");
assert.equal(parked3.open[39]?.slug, "yt-42", "spares promoted into view");

// Once the reserve runs out the queue shrinks rather than inventing rows.
const parkedMany = captureQueueView(
  rows,
  new Set(rows.slice(0, 10).map((r) => r.slug)),
  40,
);
assert.equal(parkedMany.open.length, 35);
assert.equal(parkedMany.reserve, 0);

console.log("captureDefer.test.ts ok");
