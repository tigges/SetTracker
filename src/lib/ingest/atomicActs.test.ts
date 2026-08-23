import assert from "node:assert/strict";
import {
  ATOMIC_ACTS,
  atomicActPattern,
  isAtomicActJunkSlug,
  remapAtomicActHalfSlug,
  remapAtomicActPin,
  shieldAtomicActs,
} from "./atomicActs";

assert.ok(ATOMIC_ACTS.some((a) => a.slug === "walker-royce"));
const lucasSteve = ATOMIC_ACTS.find((a) => a.slug === "lucas-steve");
assert.ok(lucasSteve);
assert.deepEqual(lucasSteve.junkSlugs, ["lucas"]);
assert.equal(lucasSteve.junkSlugs.includes("steve"), false);
assert.equal(lucasSteve.homeCity, "Maastricht, Netherlands");
assert.equal(isAtomicActJunkSlug("lucas"), true);
assert.equal(isAtomicActJunkSlug("steve"), false);
assert.equal(isAtomicActJunkSlug("steve-aoki"), false);
assert.equal(remapAtomicActHalfSlug("lucas"), "lucas-steve");
assert.equal(remapAtomicActHalfSlug("steve"), undefined);
assert.deepEqual(remapAtomicActPin("lucas", "Lucas"), {
  slug: "lucas-steve",
  name: "Lucas & Steve",
});
assert.deepEqual(remapAtomicActPin("lucas-steve", "Lucas & Steve"), {
  slug: "lucas-steve",
  name: "Lucas & Steve",
});

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

const ls = shieldAtomicActs(
  "Lucas & Steve B2B Mike Williams | Don't Let Daddy Know",
);
assert.ok(!/Lucas\s*&\s*Steve/.test(ls.text));
assert.equal(
  ls.restore(ls.text),
  "Lucas & Steve B2B Mike Williams | Don't Let Daddy Know",
);

console.log("atomicActs.test.ts ok");
