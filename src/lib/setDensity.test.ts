import assert from "node:assert/strict";
import { assessSetDensity, isThinTracklist } from "./setDensity";

// Healthy ~1h house set (~15 plays).
const ok = assessSetDensity({ durationSec: 3600, playCount: 15 });
assert.equal(ok.severity, "ok");
assert.ok(ok.tracksPerHour > 10);

// User report shape: ~1h / 6 songs → severe.
const westendish = assessSetDensity({ durationSec: 56 * 60, playCount: 5 });
assert.equal(westendish.severity, "severe");
assert.ok(westendish.avgSecPerPlay >= 10 * 60);

const sixOnHour = assessSetDensity({ durationSec: 3600, playCount: 6 });
assert.equal(sixOnHour.severity, "severe");

// Borderline thin: 7 tracks / hour → ~8.6 min avg.
const thin = assessSetDensity({ durationSec: 3600, playCount: 7 });
assert.equal(thin.severity, "thin");

// Short upload — do not flag.
const short = assessSetDensity({ durationSec: 12 * 60, playCount: 1 });
assert.equal(short.severity, "ok");

assert.equal(isThinTracklist({ durationSec: 3600, playCount: 6 }), true);
assert.equal(isThinTracklist({ durationSec: 3600, playCount: 18 }), false);

console.log("setDensity.test.ts ok");
