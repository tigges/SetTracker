import assert from "node:assert/strict";
import { clocksLookInterpolated } from "./clockHonesty";

const dur = 3600;
const even = Array.from({ length: 12 }, (_, i) =>
  Math.round((dur * (i + 1)) / 13),
);
assert.equal(clocksLookInterpolated(even, dur), true);

const real = [0, 187, 412, 901, 1400, 1888, 2401, 2900, 3310];
assert.equal(clocksLookInterpolated(real, dur), false);

assert.equal(clocksLookInterpolated(even.slice(0, 4), dur), false);
assert.equal(clocksLookInterpolated(even, 60), false);

console.log("clockHonesty.test.ts ok");
