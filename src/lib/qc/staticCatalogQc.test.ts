import assert from "node:assert/strict";
import {
  auditCuratedTracklistAgreement,
  auditFingerprintOnlyWatches,
  dropJunkTrackIdPins,
  runStaticCatalogQc,
} from "./staticCatalogQc";

const report = runStaticCatalogQc();
assert.ok(report.pins > 3000, `expected shipped pins, got ${report.pins}`);
assert.ok(report.events > 20);
const errors = report.issues.filter((i) => i.severity === "error");
assert.equal(
  errors.length,
  0,
  errors.map((e) => `${e.area} ${e.slug ?? ""} ${e.detail}`).join("; "),
);

const cleaned = dropJunkTrackIdPins([
  { slug: "real-track", isrc: "USUM71502634" },
  { slug: "youtube-biscits" },
]);
assert.equal(cleaned.next.length, 1);
assert.equal(cleaned.dropped[0], "youtube-biscits");

// Fan watch URLs are Identify-only: never a wired tracklist key, never a
// curated set (which would make them sourceUrl/playbackUrl). The shipped list
// is clean, so feed synthetic entries to prove the guard actually fires.
assert.equal(auditFingerprintOnlyWatches().length, 0);
const curatedFan = auditFingerprintOnlyWatches(
  [{ videoId: "6DC3xoQF4Zs", channel: "DerekD2" }],
  ["https://www.youtube.com/watch?v=6DC3xoQF4Zs"],
);
assert.equal(curatedFan.length, 1);
assert.equal(curatedFan[0]?.severity, "error");
assert.match(curatedFan[0]!.detail, /curated in YOUTUBE_SETS/);
// A slug that is genuinely wired, standing in for a fan re-upload.
const wiredFan = auditFingerprintOnlyWatches(
  [{ videoId: "loD-whuR5zc", channel: "PyroMan" }],
  [],
);
assert.equal(wiredFan.length, 1);
assert.match(wiredFan[0]!.detail, /never a tracklist key/);

// Curated entry vs slug map: silence is fine, disagreement is not.
assert.equal(auditCuratedTracklistAgreement().length, 0);
const seedA = [{ at: "0:00", title: "a" }];
const seedB = [{ at: "0:00", title: "a" }];
assert.equal(
  auditCuratedTracklistAgreement(
    [{ video: "https://www.youtube.com/watch?v=aaaaaaaaaaa" }],
    { "yt-aaaaaaaaaaa": seedA },
  ).length,
  0,
  "an entry with no tracklist1001 still gets cues from the map",
);
const split = auditCuratedTracklistAgreement(
  [{ video: "https://www.youtube.com/watch?v=aaaaaaaaaaa", tracklist1001: seedB }],
  { "yt-aaaaaaaaaaa": seedA },
);
assert.equal(split.length, 1);
assert.equal(split[0]?.severity, "error");
assert.match(split[0]!.detail, /different array/);
// Equal-looking copies must still fail: host twins group on array identity.
assert.deepEqual(seedA, seedB);

console.log("qc/staticCatalogQc.test.ts ok", report.pins, report.counts);
