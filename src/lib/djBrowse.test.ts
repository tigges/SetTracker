import assert from "node:assert/strict";
import { isBrowseReadyDj, isSearchableDj } from "./djBrowse";

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
assert.equal(
  isBrowseReadyDj({
    ...base,
    imageUrl:
      "https://cdn-images.dzcdn.net/images/artist/d8315de10c16736f16b43549fb360448/250x250-000000-80-0-0.jpg",
  }),
  false,
);

assert.equal(isSearchableDj(base), true);
assert.equal(isSearchableDj({ ...base, isJunk: true }), false);
assert.equal(isSearchableDj({ ...base, isLowSignal: true }), false);
assert.equal(
  isSearchableDj({
    ...base,
    hasHandle: true,
    setCount: 0,
    playCount: 0,
    imageUrl: null,
  }),
  true,
);
assert.equal(
  isSearchableDj({
    ...base,
    hasHandle: false,
    setCount: 1,
    playCount: 0,
    imageUrl: null,
  }),
  true,
);
assert.equal(
  isSearchableDj({
    ...base,
    hasHandle: false,
    setCount: 0,
    playCount: 0,
    imageUrl: null,
  }),
  false,
);

console.log("djBrowse.test.ts ok");
