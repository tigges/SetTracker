import assert from "node:assert/strict";
import { isBrowseReadyDj } from "./djBrowse";

const base = {
  isJunk: false,
  hasHandle: true,
  setCount: 3,
  playCount: 40,
  identifiedPlayCount: 20,
  imageUrl: "https://example.com/a.jpg",
};

assert.equal(isBrowseReadyDj(base), true);
assert.equal(isBrowseReadyDj({ ...base, isJunk: true }), false);
assert.equal(isBrowseReadyDj({ ...base, hasHandle: false }), false);
assert.equal(isBrowseReadyDj({ ...base, setCount: 0 }), false);
assert.equal(isBrowseReadyDj({ ...base, playCount: 0 }), false);

// No monogram-only DJs — artwork required regardless of catalog weight.
assert.equal(
  isBrowseReadyDj({
    ...base,
    imageUrl: null,
    setCount: 50,
    identifiedPlayCount: 200,
  }),
  false,
);
assert.equal(
  isBrowseReadyDj({
    ...base,
    imageUrl: "  ",
  }),
  false,
);

console.log("djBrowse.test.ts ok");
