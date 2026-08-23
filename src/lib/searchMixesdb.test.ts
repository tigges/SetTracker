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

assert.deepEqual(
  mixesdbPlayerQuery(
    "https://music.apple.com/us/album/ministry-of-sound-ibiza-boat-party-dj-mix/6779843676?at=1000l5EX",
  ),
  {
    host: "applemusic",
    search: "music.apple.com/album/6779843676",
    insource: "6779843676",
  },
);
assert.ok(
  searchMixesdbByPlayerUrl(
    "https://music.apple.com/us/album/ministry-of-sound-ibiza-boat-party-dj-mix/6779843676",
  )?.includes("6779843676"),
);
assert.deepEqual(
  mixesdbPlayerQuery(
    "https://music.apple.com/us/album/tomorrowland-belgium-2026-maddix-at-mainstage-weekend/6802795931",
  ),
  {
    host: "applemusic",
    search: "music.apple.com/album/6802795931",
    insource: "6802795931",
  },
);

assert.equal(mixesdbPlayerQuery("Korolova Captive Soul"), null);
assert.equal(mixesdbPlayerQuery("https://www.mixesdb.com/w/Category:2026"), null);
assert.equal(mixesdbPlayerQuery("https://soundcloud.com/search?q=korolova"), null);
assert.equal(searchMixesdbByPlayerUrl(""), null);

console.log("searchMixesdb.test.ts ok");
