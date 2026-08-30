import assert from "node:assert/strict";
import { setCardStatusHint } from "./setCardStatusHint";

assert.equal(
  setCardStatusHint({ identified: 12, unresolved_id: 3, community_resolved: 1 }),
  "12 named · 3 unknown · 1 community",
);
assert.equal(setCardStatusHint({ identified: 8 }), "8 named");
assert.equal(setCardStatusHint({}), "");
assert.equal(setCardStatusHint({ unresolved_id: 4 }), "4 unknown");

console.log("setCardStatusHint.test.ts ok");
