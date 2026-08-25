import assert from "node:assert/strict";
import {
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

console.log("statsQueues.test.ts ok");
