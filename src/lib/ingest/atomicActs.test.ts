import assert from "node:assert/strict";
import { ATOMIC_ACTS, atomicActPattern, shieldAtomicActs } from "./atomicActs";

assert.ok(ATOMIC_ACTS.some((a) => a.slug === "walker-royce"));

const re = atomicActPattern("Walker & Royce");
assert.ok(re.test("Walker & Royce | Fresh Start SF 2026"));
re.lastIndex = 0;
assert.ok(re.test("WALKER AND ROYCE - Live @ EDC Orlando 2025"));
re.lastIndex = 0;
assert.equal(re.test("Kyle Walker Live"), false);

const { text, restore } = shieldAtomicActs(
  "Walker & Royce b2b VNSSA and Chapter & Verse",
);
assert.ok(!/Walker\s*&\s*Royce/.test(text));
assert.ok(text.includes("__ATOMIC_"));
assert.equal(
  restore(text.replace(/\s+and\s+/g, " b2b ")),
  "Walker & Royce b2b VNSSA b2b Chapter & Verse",
);

console.log("atomicActs.test.ts ok");
