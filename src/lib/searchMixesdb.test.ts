import assert from "node:assert/strict";
import { mixesdbPlayerQuery, searchMixesdbByPlayerUrl } from "./searchMixesdb";

assert.deepEqual(mixesdbPlayerQuery("youtube.com/watch?v=ViNSjYircPs"), {
  host: "youtube",
  search: "youtube.com/watch?v=ViNSjYircPs",
  insource: "ViNSjYircPs",
});
assert.deepEqual(mixesdbPlayerQuery("https://youtu.be/ViNSjYircPs"), {
  host: "youtube",
  search: "youtube.com/watch?v=ViNSjYircPs",
  insource: "ViNSjYircPs",
});
assert.equal(
  searchMixesdbByPlayerUrl("https://www.youtube.com/watch?v=ViNSjYircPs"),
  "https://www.mixesdb.com/w/index.php?title=Special:Search&go=Go&search=" +
    encodeURIComponent("youtube.com/watch?v=ViNSjYircPs"),
);

assert.deepEqual(
  mixesdbPlayerQuery("https://soundcloud.com/korolovadj/captive-soul-098"),
  {
    host: "soundcloud",
    search: "soundcloud.com/korolovadj/captive-soul-098",
    insource: "soundcloud.com/korolovadj/captive-soul-098",
  },
);
assert.deepEqual(
  mixesdbPlayerQuery("https://hearthis.at/some-dj/weekly-001/"),
  {
    host: "hearthis",
    search: "hearthis.at/some-dj/weekly-001",
    insource: "hearthis.at/some-dj/weekly-001",
  },
);

assert.equal(mixesdbPlayerQuery("Korolova Captive Soul"), null);
assert.equal(mixesdbPlayerQuery("https://www.mixesdb.com/w/Category:2026"), null);
assert.equal(mixesdbPlayerQuery("https://soundcloud.com/search?q=korolova"), null);
assert.equal(searchMixesdbByPlayerUrl(""), null);

console.log("searchMixesdb.test.ts ok");
