import assert from "node:assert/strict";
import {
  FINGERPRINT_ONLY_WATCH,
  fingerprintIdProbes,
  isFingerprintOnlyVideoId,
  isFingerprintOnlyWatchUrl,
} from "./fingerprintWatch";

assert.equal(isFingerprintOnlyVideoId("6DC3xoQF4Zs"), true);
assert.equal(isFingerprintOnlyVideoId("dQw4w9wgGcQ"), false);
assert.equal(
  isFingerprintOnlyWatchUrl("https://youtu.be/6DC3xoQF4Zs"),
  true,
);
assert.equal(
  isFingerprintOnlyWatchUrl("https://www.youtube.com/watch?v=6DC3xoQF4Zs"),
  true,
);

const probes = fingerprintIdProbes();
assert.equal(probes.length, 2);
assert.equal(probes[0]!.offsetSec, 17 * 60 + 15);
assert.equal(probes[1]!.offsetSec, 1 * 3600 + 11 * 60 + 28);
assert.equal(probes[0]!.videoId, "6DC3xoQF4Zs");
assert.equal(FINGERPRINT_ONLY_WATCH[0]!.official, false);
assert.match(FINGERPRINT_ONLY_WATCH[0]!.note, /never Relive/i);

console.log("identify/fingerprintWatch.test.ts ok");
