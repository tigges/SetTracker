import assert from "node:assert/strict";
import {
  isPlaylistSetCandidate,
  officialRelivePlaylists,
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

const biscitsLive = YOUTUBE_PLAYLISTS.find((p) =>
  p.playlist.includes("PLSAUtc6DBR34M6_c_4RlpMSG81OY5lu9p"),
)!;
assert.ok(biscitsLive);
assert.equal(biscitsLive.seriesName, "BISCITS");
assert.equal(biscitsLive.primaryArtist?.slug, "biscits");
assert.equal(
  isPlaylistSetCandidate(
    "Biscits DJ Set - EDC Vegas 2025",
    74 * 60,
    biscitsLive,
  ),
  true,
);
assert.equal(
  isPlaylistSetCandidate("Biscits - Crush (Live @ EDC Vegas)", 259, biscitsLive),
  false,
);

const tmlRelive = YOUTUBE_PLAYLISTS.find((p) =>
  /relive/i.test(p.seriesName),
)!;
assert.ok(tmlRelive);
assert.ok((tmlRelive.limit ?? 0) >= 120);
assert.equal(officialRelivePlaylists().length, 1);
assert.equal(officialRelivePlaylists()[0]!.playlist, tmlRelive.playlist);

console.log("playlists.test.ts ok");
