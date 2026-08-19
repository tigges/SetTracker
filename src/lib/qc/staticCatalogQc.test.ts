import assert from "node:assert/strict";
import {
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

console.log("qc/staticCatalogQc.test.ts ok", report.pins, report.counts);
