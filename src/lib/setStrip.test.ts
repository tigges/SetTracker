import assert from "node:assert/strict";
import { cueIndexAtRatio, playSpans, stripIsDense } from "./setStrip";

const spans = playSpans([0, 10, 30], 60);
assert.deepEqual(spans, [10, 20, 30]);
assert.deepEqual(playSpans([5, 5, 20], 40), [1, 15, 20]);

assert.equal(cueIndexAtRatio(0, spans), 0);
assert.equal(cueIndexAtRatio(0.1, spans), 0);
assert.equal(cueIndexAtRatio(0.2, spans), 1);
assert.equal(cueIndexAtRatio(0.5, spans), 1);
assert.equal(cueIndexAtRatio(0.51, spans), 2);
assert.equal(cueIndexAtRatio(1, spans), 2);
assert.equal(cueIndexAtRatio(-1, spans), 0);
assert.equal(cueIndexAtRatio(2, [1]), 0);
assert.equal(cueIndexAtRatio(0.5, []), 0);

assert.equal(stripIsDense(22), false);
assert.equal(stripIsDense(40), false);
assert.equal(stripIsDense(63), true);
assert.equal(stripIsDense(74), true);
