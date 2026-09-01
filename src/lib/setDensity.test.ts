import assert from "node:assert/strict";
import {
  assessSetDensity,
  expectedPlayCount,
  isThinTracklist,
} from "./setDensity";

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

// Afrojack Friendship Mix shape: 54:14 / 9 identified. Avg ~6m (~10/h)
// used to pass the old floor. Coverage vs ~15 expected must flag thin.
const friendship = assessSetDensity({
  durationSec: 54 * 60 + 14,
  playCount: 9,
  genre: "House",
  type: "mix",
});
assert.equal(friendship.severity, "thin");
assert.ok(friendship.expectedPlays >= 14);
assert.ok(friendship.coverage < 0.65);
assert.match(friendship.reason ?? "", /9 of ~/);

const friendshipFilled = assessSetDensity({
  durationSec: 54 * 60 + 14,
  playCount: 15,
  genre: "House",
  type: "mix",
});
assert.equal(friendshipFilled.severity, "ok");

// Genre cadence: techno ~18/hour, house default ~17, never a miss-grid 69.
assert.equal(expectedPlayCount(3600), 17);
assert.ok(expectedPlayCount(3600, { genre: "Techno" }) >= 16);
assert.ok(expectedPlayCount(3600, { genre: "Techno" }) <= 20);
assert.ok(expectedPlayCount(3600, { genre: "Techno" }) < 25);

