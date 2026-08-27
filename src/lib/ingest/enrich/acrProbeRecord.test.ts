import assert from "node:assert/strict";
import {
  ACR_IDENTIFY_VARIABLES_LABEL,
  acrPartialHasNames,
  formatAcrHitRate,
  formatAcrPartialReason,
  formatAcrTrackMessage,
  isAcrProbedText,
  playAlreadyAcrProbed,
} from "./acrProbeRecord";

assert.equal(
  ACR_IDENTIFY_VARIABLES_LABEL,
  "artist, title, ISRC, score, offset",
);

assert.equal(formatAcrPartialReason(null), "no ACRCloud match");
assert.equal(
  formatAcrPartialReason(null, "ACR status 3003: timeout"),
  "ACR status 3003: timeout",
);
assert.equal(
  formatAcrPartialReason({ score: 48 }),
  "weak score 48",
);
assert.equal(
  formatAcrPartialReason({
    score: 48,
    artist: "Amelie Lens",
    title: "Exhale",
    isrc: "BE6F51700012",
  }),
  "weak score 48: Amelie Lens - Exhale · ISRC BE6F51700012",
);
assert.equal(
  formatAcrPartialReason({ artist: "Fallon", title: "No Panties" }),
  "Fallon - No Panties",
);
assert.equal(
  formatAcrPartialReason({ isrc: "GBXXXX000000", score: 41 }),
  "weak score 41: ISRC GBXXXX000000",
);

assert.equal(acrPartialHasNames({ score: 48 }), false);
assert.equal(acrPartialHasNames({ artist: "X", title: "Y" }), true);
assert.equal(acrPartialHasNames({ isrc: "GB1" }), true);

assert.equal(isAcrProbedText("acr-miss @ 12:00: no ACRCloud match"), true);
assert.equal(isAcrProbedText("acr-miss: weak score 48: Amelie Lens - Exhale"), true);
assert.equal(isAcrProbedText("ID @ 12:00 (comment)"), false);
assert.equal(isAcrProbedText(null), false);

assert.equal(
  playAlreadyAcrProbed({
    rawText: "ID @ 05:48",
    idTrack: { note: "acr-miss: weak score 48: Amelie Lens - Exhale" },
  }),
  true,
);
assert.equal(
  playAlreadyAcrProbed({
    rawText: "acr-miss @ 5:48: no ACRCloud match",
    idTrack: { note: null },
  }),
  true,
);
assert.equal(
  playAlreadyAcrProbed({ rawText: "ID @ 05:48", idNote: null }),
  false,
);

assert.equal(formatAcrHitRate(18, 240), "7.5%");
assert.equal(formatAcrHitRate(0, 0), "n/a");
assert.equal(formatAcrHitRate(3, 10), "30.0%");

assert.equal(
  formatAcrTrackMessage({
    probed: 240,
    identified: 18,
    partial: 42,
    missed: 180,
  }),
  "tracking artist, title, ISRC, score, offset — 240 probes, 18 hits (7.5%), 42 partial parked, 180 no-match",
);

console.log("acrProbeRecord.test.ts ok");
