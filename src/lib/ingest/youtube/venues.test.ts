import assert from "node:assert/strict";
import {
  artistFromVenueTitle,
  isVenueSetCandidate,
  YOUTUBE_VENUES,
} from "./venues";

assert.equal(
  artistFromVenueTitle("Kyle Starkey | Mixmag Lab London"),
  "Kyle Starkey",
);
assert.equal(
  artistFromVenueTitle("Max Richter live at Cercle Odyssey, Paris, France"),
  "Max Richter",
);
assert.equal(
  artistFromVenueTitle("Artist One b2b Artist Two @ Boiler Room NYC"),
  "Artist One b2b Artist Two",
);

const mixmag = YOUTUBE_VENUES.find((v) => v.seriesName === "Mixmag")!;
assert.equal(isVenueSetCandidate("Kyle Starkey | Mixmag Lab London", 3600, mixmag), true);
assert.equal(isVenueSetCandidate("Festival Aftermovie 2026", 3600, mixmag), false);
assert.equal(isVenueSetCandidate("Quick teaser", 120, mixmag), false);

console.log("venues.test.ts ok");
