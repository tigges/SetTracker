import assert from "node:assert/strict";
import { editionPerformedAtForSet } from "./setEditions";

const weekend = new Date("2026-07-26T23:59:59Z");

assert.equal(editionPerformedAtForSet("festival", weekend), weekend);
assert.equal(editionPerformedAtForSet("club", weekend), weekend);
assert.equal(editionPerformedAtForSet("mix", weekend), null);
assert.equal(editionPerformedAtForSet("radio", weekend), null);
assert.equal(editionPerformedAtForSet("mix", null), null);

console.log("setEditions.test.ts ok");
