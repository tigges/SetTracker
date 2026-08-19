import assert from "node:assert/strict";
import { extractSetlistFmUrls, isSetlistFmListingUrl } from "./parse";

const page =
  "https://www.setlist.fm/setlist/giuseppe-ottaviani/2026/leeds-warehouse-leeds-england-abc123.html";
assert.deepEqual(
  extractSetlistFmUrls(`Tracklist: ${page}`),
  [page],
);
assert.deepEqual(
  extractSetlistFmUrls(
    `Also www.setlist.fm/setlist/marnik/2016/nameless-festival-lecco-italy-xyz.html`,
  ),
  [
    "https://www.setlist.fm/setlist/marnik/2016/nameless-festival-lecco-italy-xyz.html",
  ],
);

assert.deepEqual(extractSetlistFmUrls("https://www.setlist.fm/setlists/"), []);
assert.deepEqual(
  extractSetlistFmUrls("https://www.setlist.fm/setlists/marnik-13d6bd01.html"),
  [],
);
assert.deepEqual(extractSetlistFmUrls("no setlist here"), []);
assert.equal(isSetlistFmListingUrl("https://www.setlist.fm/setlists/"), true);
assert.equal(
  isSetlistFmListingUrl("https://www.setlist.fm/setlists/marnik-13d6bd01.html"),
  true,
);
assert.equal(isSetlistFmListingUrl(page), false);

console.log("setlistfm/parse.test.ts ok");
