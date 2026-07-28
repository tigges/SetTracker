import assert from "node:assert/strict";
import {
  isBrowseReadyVenue,
  isDirectoryVenue,
  isVenueListed,
} from "./venueBrowse";

assert.equal(
  isBrowseReadyVenue({ setCount: 3, website: null }),
  true,
);
assert.equal(
  isBrowseReadyVenue({ setCount: 0, website: "https://edc.com" }),
  false,
);

assert.equal(
  isDirectoryVenue({ setCount: 0, website: "https://edc.com" }),
  true,
);
assert.equal(
  isDirectoryVenue({ setCount: 0, website: null }),
  false,
);
assert.equal(
  isDirectoryVenue({ setCount: 2, website: "https://edc.com" }),
  false,
);

assert.equal(isVenueListed({ setCount: 1, website: null }), true);
assert.equal(
  isVenueListed({ setCount: 0, website: "https://example.com" }),
  true,
);
assert.equal(isVenueListed({ setCount: 0, website: null }), false);

console.log("venueBrowse.test.ts ok");
