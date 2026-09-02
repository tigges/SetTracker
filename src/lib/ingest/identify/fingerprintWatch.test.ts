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
const vkRevelWatch = FINGERPRINT_ONLY_WATCH.find(
  (w) => w.videoId === "6ZN3aI2o2OY",
);
assert.ok(vkRevelWatch);
assert.equal(vkRevelWatch.official, false);
assert.equal(vkRevelWatch.channel, "Wine House Music TV");
assert.equal(vkRevelWatch.idOffsetsSec.length, 0);
assert.match(vkRevelWatch.note, /never official playback/i);
assert.equal(isFingerprintOnlyVideoId("6ZN3aI2o2OY"), true);
assert.equal(isFingerprintOnlyWatchUrl("https://youtu.be/6ZN3aI2o2OY"), true);

// Official @antiup Mojave Coachella 2024 — playback, not Identify-only.
assert.equal(isFingerprintOnlyVideoId("cZhNpGcYq_A"), false);
assert.equal(
  isFingerprintOnlyWatchUrl("https://youtu.be/cZhNpGcYq_A"),
  false,
);
assert.equal(
  FINGERPRINT_ONLY_WATCH.some((w) => w.videoId === "cZhNpGcYq_A"),
  false,
);

const jauzWatch = FINGERPRINT_ONLY_WATCH.find(
  (w) => w.videoId === "HeEW36GRsPQ",
);
assert.ok(jauzWatch);
assert.equal(jauzWatch.official, false);
assert.equal(jauzWatch.channel, "Crawford_RECAPS");
assert.equal(jauzWatch.idOffsetsSec.length, 0);
assert.match(jauzWatch.note, /never official playback/i);
assert.equal(isFingerprintOnlyVideoId("HeEW36GRsPQ"), true);
assert.equal(isFingerprintOnlyWatchUrl("https://youtu.be/HeEW36GRsPQ"), true);

const jauzHonoluluWatch = FINGERPRINT_ONLY_WATCH.find(
  (w) => w.videoId === "VWMrMUaONhk",
);
assert.ok(jauzHonoluluWatch);
assert.equal(jauzHonoluluWatch.official, false);
assert.equal(jauzHonoluluWatch.channel, "Lord nanakuli");
assert.equal(jauzHonoluluWatch.seed, "TL_JAUZ_REPUBLIK_HONOLULU_2025");
assert.equal(jauzHonoluluWatch.idOffsetsSec.length, 0);
assert.match(jauzHonoluluWatch.note, /never official playback/i);
assert.equal(isFingerprintOnlyVideoId("VWMrMUaONhk"), true);
assert.equal(isFingerprintOnlyWatchUrl("https://youtu.be/VWMrMUaONhk"), true);

console.log("identify/fingerprintWatch.test.ts ok");
