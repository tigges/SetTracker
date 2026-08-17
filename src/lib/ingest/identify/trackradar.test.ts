import assert from "node:assert/strict";
import {
  evaluateTrackRadarHit,
  matchPublishedTrack,
  parseTrackRadarTrack,
  platformsFromUnknown,
  namesClose,
} from "./trackradar";
import { isFingerprintOnlyWatchUrl } from "./fingerprintWatch";

assert.equal(namesClose("Beautiful Now", "Beautiful Now"), true);
assert.equal(namesClose("Out Of Time", "Out of Time"), true);
assert.equal(namesClose("feel U luv Me", "Something Else"), false);

assert.equal(
  evaluateTrackRadarHit("Zedd ft. Jon Bellion", "Beautiful Now", {
    artist: "Zedd",
    title: "Beautiful Now",
  }).ok,
  true,
);
assert.equal(
  evaluateTrackRadarHit("Zedd ft. Jon Bellion", "Beautiful Now", {
    artist: "Coldplay",
    title: "Beautiful Now",
  }).ok,
  false,
);
assert.equal(
  evaluateTrackRadarHit("Knock2", "feel U luv Me", {
    artist: "Knock2",
    title: "Dashstar",
  }).ok,
  false,
);

const parsed = parseTrackRadarTrack({
  artist: "Zedd",
  title: "Beautiful Now",
  isrc: "USUM71505090",
  platforms: {
    spotify: "https://open.spotify.com/track/1",
    beatport: "https://www.beatport.com/track/beautiful-now/123",
    discogs: "https://www.discogs.com/search/?q=zedd",
  },
});
assert.ok(parsed);
assert.equal(parsed!.isrc, "USUM71505090");
assert.equal(
  parsed!.beatportUrl,
  "https://www.beatport.com/track/beautiful-now/123",
);
assert.equal(parsed!.platforms.spotify, "https://open.spotify.com/track/1");

assert.equal(
  platformsFromUnknown({ notAUrl: "Beautiful Now" }).spotify,
  undefined,
);
assert.equal(parseTrackRadarTrack({ title: "Only Title" }), null);

assert.equal(
  isFingerprintOnlyWatchUrl("https://www.youtube.com/watch?v=6DC3xoQF4Zs"),
  true,
);

const archiveHit = matchPublishedTrack("Zedd ft. Jon Bellion", "Beautiful Now", [
  {
    artist: "Zedd",
    title: "Beautiful Now",
    platforms: { spotify: "https://open.spotify.com/track/abc" },
  },
  {
    artist: "Knock2",
    title: "dashstar*",
    platforms: { spotify: "https://open.spotify.com/track/zzz" },
  },
]);
assert.equal(archiveHit?.platforms.spotify, "https://open.spotify.com/track/abc");
assert.equal(
  matchPublishedTrack("Zedd", "Clarity", [
    { artist: "Zedd", title: "Beautiful Now", platforms: {} },
  ]),
  null,
);

console.log("identify/trackradar.test.ts ok");
