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

// No thumb: need both set depth and identified plays
assert.equal(
  isBrowseReadyDj({
    ...base,
    imageUrl: null,
    setCount: 4,
    identifiedPlayCount: 50,
  }),
  false,
);
assert.equal(
  isBrowseReadyDj({
    ...base,
    imageUrl: null,
    setCount: 5,
    identifiedPlayCount: 19,
  }),
  false,
);
assert.equal(
  isBrowseReadyDj({
    ...base,
    imageUrl: null,
    setCount: 5,
    identifiedPlayCount: 20,
  }),
  true,
);

console.log("djBrowse.test.ts ok");
