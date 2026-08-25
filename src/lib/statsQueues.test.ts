import assert from "node:assert/strict";
import {
  mergeDjCompleteQueue,
  mergePlaceGapQueue,
  queueFollowUpHint,
  queueFollowUpLabel,
  workbenchLaneFollowUp,
} from "./statsQueues";

assert.equal(queueFollowUpLabel("auto"), "Automatic");
assert.equal(queueFollowUpLabel("operator"), "Operator");
assert.equal(queueFollowUpLabel("both"), "Automatic + operator");
assert.match(queueFollowUpHint("auto"), /Deep \/ enrich \/ Pages/);
assert.match(queueFollowUpHint("operator"), /You link or paste/);
assert.equal(workbenchLaneFollowUp("first_party"), "auto");
assert.equal(workbenchLaneFollowUp("fingerprint"), "auto");
assert.equal(workbenchLaneFollowUp("track_id"), "auto");
assert.equal(workbenchLaneFollowUp("capture_1001"), "operator");

const djs = mergeDjCompleteQueue(
  [{ slug: "beyer", name: "Adam Beyer", setCount: 2, playCount: 40 }],
  [
    { slug: "beyer", name: "Adam Beyer", setCount: 2, playCount: 40 },
    { slug: "fisher", name: "FISHER", setCount: 1, playCount: 8 },
  ],
  (slug) => (slug === "fisher" ? 0 : 1),
);
assert.equal(djs.length, 2);
assert.equal(djs[0]?.slug, "fisher");
assert.deepEqual(
  [djs[0]?.needsHandle, djs[0]?.needsArt],
  [false, true],
);
assert.deepEqual(
  [djs[1]?.needsHandle, djs[1]?.needsArt],
  [true, true],
);

const places = mergePlaceGapQueue(
  [
    { slug: "ultra", name: "Ultra", onChart: true },
    { slug: "local-fest", name: "Local Fest", onChart: false },
  ],
  [{ slug: "hi", name: "Hï Ibiza", onChart: true }],
);
assert.deepEqual(
  places.map((p) => `${p.kind}:${p.slug}`),
  ["festival:ultra", "club:hi", "festival:local-fest"],
);

console.log("statsQueues.test.ts ok");
