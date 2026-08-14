import assert from "node:assert/strict";
import { shouldPersistDjStub } from "./ensureDjs";

assert.equal(
  shouldPersistDjStub({
    soundcloud: "https://soundcloud.com/adambeyer",
  }),
  true,
);
assert.equal(shouldPersistDjStub({ isRoster: true }), true);
assert.equal(shouldPersistDjStub({ isPromoted: true }), true);
assert.equal(shouldPersistDjStub({}), false);
assert.equal(
  shouldPersistDjStub({
    website: null,
    soundcloud: null,
    youtube: null,
  }),
  false,
);

console.log("ensureDjs.test.ts ok");
