import assert from "node:assert/strict";
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

console.log("soundcloud/tracks.test.ts ok");
