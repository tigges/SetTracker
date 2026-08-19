import assert from "node:assert/strict";
import { PRESS_SEEDS } from "./pressSeeds";

assert.ok(PRESS_SEEDS.length >= 8);

const tour = PRESS_SEEDS.filter((s) => s.kind === "tour");
assert.ok(tour.length >= 6);
for (const s of tour) {
  assert.equal(s.skipFetch, true, `${s.title} should skipFetch`);
  assert.ok(s.artists.length >= 1);
  assert.match(s.url, /ra\.co\//);
}

const guetta = PRESS_SEEDS.find((s) =>
  s.artists.some((a) => /guetta/i.test(a)),
);
assert.ok(guetta);

const korolova = PRESS_SEEDS.find((s) =>
  s.artists.some((a) => /korolova/i.test(a)),
);
assert.ok(korolova);
assert.match(korolova!.url, /ra\.co\/dj\/korolova/);
assert.equal(korolova!.skipFetch, true);

console.log("pressSeeds.test.ts ok");
