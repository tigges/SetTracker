import assert from "node:assert/strict";
import {
  FINGERPRINT_ONLY_WATCH,
  fingerprintIdProbes,
  isFingerprintOnlyVideoId,
  isFingerprintOnlyWatchUrl,
} from "./fingerprintWatch";

assert.equal(isFingerprintOnlyVideoId("6DC3xoQF4Zs"), true);
assert.equal(isFingerprintOnlyVideoId("b8o4lj_sEpQ"), true); // pragma: allowlist secret
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
assert.match(FINGERPRINT_ONLY_WATCH[0]!.note, /never official playback/i);
const lorenzoEdcMx = FINGERPRINT_ONLY_WATCH.find(
  (w) => w.videoId === "b8o4lj_sEpQ", // pragma: allowlist secret
);
assert.ok(lorenzoEdcMx);
assert.equal(lorenzoEdcMx.official, false);
assert.equal(lorenzoEdcMx.channel, "Toñito Digital");
assert.equal(lorenzoEdcMx.idOffsetsSec.length, 0);
assert.match(lorenzoEdcMx.note, /never official playback/i);

console.log("identify/fingerprintWatch.test.ts ok");
