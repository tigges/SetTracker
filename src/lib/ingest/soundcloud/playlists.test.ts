import assert from "node:assert/strict";
import {
  isScPlaylistSetCandidate,
  SOUNDCLOUD_PLAYLISTS,
} from "./playlists";

assert.ok(SOUNDCLOUD_PLAYLISTS.length >= 2);

const lift = SOUNDCLOUD_PLAYLISTS.find((p) =>
  p.playlist.includes("lift-sets"),
)!;
assert.ok(lift);
assert.equal(lift.seriesName, "Lift Sets");
assert.equal(
  isScPlaylistSetCandidate(
    "Dom Dolla Live @ Drumsheds London, 2024",
    6840,
    lift,
  ),
  true,
);
assert.equal(
  isScPlaylistSetCandidate("Odd Mob - Take You There (Extended)", 255, lift),
  false,
);

const official = SOUNDCLOUD_PLAYLISTS.find((p) =>
  p.playlist.includes("sets-n-thangs"),
)!;
assert.ok(official);
assert.equal(official.seriesName, "Dom Dolla Live");

console.log("soundcloud/playlists.test.ts ok");
