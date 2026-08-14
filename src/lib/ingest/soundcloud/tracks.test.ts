import assert from "node:assert/strict";
import { slugify } from "../types";
import { SOUNDCLOUD_TRACK_SEEDS } from "./tracks";

assert.ok(SOUNDCLOUD_TRACK_SEEDS.length >= 2);

const chapter = SOUNDCLOUD_TRACK_SEEDS.filter(
  (s) => s.primaryArtist.name === "Chapter & Verse",
);
assert.equal(chapter.length, 2);
for (const s of chapter) {
  assert.ok(s.url.startsWith("https://soundcloud.com/"));
  assert.ok((s.minDurationSec ?? 0) >= 15 * 60);
}

const sidepiece = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/sidepiece/sidepiece-lollapalooza-perry",
);
assert.ok(sidepiece);
assert.equal(sidepiece.primaryArtist.name, "SIDEPIECE");
assert.equal(sidepiece.type, "festival");
assert.equal(
  `sc-sidepiece-${slugify("sidepiece-lollapalooza-perry")}`,
  "sc-sidepiece-sidepiece-lollapalooza-perry",
);

console.log("soundcloud/tracks.test.ts ok");
