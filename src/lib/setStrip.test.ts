import assert from "node:assert/strict";
import { COMMENT_LIKELY_TALK } from "./publishPlays";
import {
  cueIndexAtRatio,
  playSpans,
  setgraphPlayheadRatio,
  setgraphSegments,
  setgraphVisible,
  stripIsDense,
} from "./setStrip";

const spans = playSpans([0, 10, 30], 60);
assert.deepEqual(spans, [10, 20, 30]);
assert.deepEqual(playSpans([5, 5, 20], 40), [1, 15, 20]);
assert.deepEqual(
  playSpans([{ timestamp: 0, until: 150 }, 804], 3441),
  [150, 3441 - 804],
);

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

assert.equal(setgraphVisible(0), false);
assert.equal(setgraphVisible(1), true);
assert.equal(setgraphVisible(11), true);

{
  const plays = [
    { id: "a", timestamp: 0 },
    {
      id: "talk",
      timestamp: 90,
      talkUntil: 150,
      segmentKind: "talk" as const,
      detectionComment: COMMENT_LIKELY_TALK,
    },
    { id: "b", timestamp: 150 },
  ];
  const segs = setgraphSegments(plays);
  assert.equal(segs.length, plays.length);
  assert.deepEqual(
    segs.map((s) => s.id),
    plays.map((p) => p.id),
  );
  assert.deepEqual(
    segs.map((s) => s.talk),
    [false, true, false],
  );
  assert.deepEqual(playSpans(segs, 300), [90, 60, 150]);
}

assert.equal(setgraphPlayheadRatio(null, 600), null);
assert.equal(setgraphPlayheadRatio(0, 0), null);
assert.equal(setgraphPlayheadRatio(30, 60), 0.5);
assert.equal(setgraphPlayheadRatio(-10, 60), 0);
assert.equal(setgraphPlayheadRatio(90, 60), 1);

console.log("setStrip.test.ts ok");
