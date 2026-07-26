import assert from "node:assert/strict";
import {
  isPlaylistSetCandidate,
  YOUTUBE_PLAYLISTS,
} from "./playlists";

const guest = YOUTUBE_PLAYLISTS.find((p) =>
  p.playlist.includes("gebplgzLYgaOkrdV5mEB6t2ub6"),
)!;
assert.ok(guest);

assert.equal(
  isPlaylistSetCandidate(
    "Martin Ikin @ Electric Brixton, London 15/10/2022 - Full Set",
    4224,
    guest,
  ),
  true,
);
assert.equal(
  isPlaylistSetCandidate("James Hype - Trigger Finger [STEREOHYPE]", 121, guest),
  false,
);

const ultraShows = YOUTUBE_PLAYLISTS.find((p) =>
  p.playlist.includes("PLBg1SJiXSxfJ6lee3le9qRtIFLkdFwd8E"),
)!;
assert.ok(ultraShows);
assert.equal(ultraShows.eventSlug, "ultra-miami");
assert.equal(
  isPlaylistSetCandidate(
    "BIZARRAP || LIVE @ ULTRA MIAMI MAIN STAGE 2026 (ft. Skrillex & Daddy Yankee)",
    50 * 60,
    ultraShows,
  ),
  true,
);

console.log("playlists.test.ts ok");
