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
assert.equal(
  artistFromVenueTitle("Boiler Room London: Tiffany Day"),
  "Tiffany Day",
);
assert.equal(
  artistFromVenueTitle(
    "Armin van Buuren | 08th June 2025 #Livestream at Ushuaïa Ibiza",
  ),
  "Armin van Buuren",
);

const ushuaia = YOUTUBE_VENUES.find((v) => v.seriesName === "Ushuaïa Ibiza")!;
assert.equal(
  isVenueSetCandidate(
    "KC Lights | Recorded Live at Ushuaïa Ibiza 2024 (Audio Mix)",
    4239,
    ushuaia,
  ),
  true,
);
assert.equal(
  isVenueSetCandidate("Ushuaïa Ibiza 2025 (Official Aftermovie)", 89, ushuaia),
  false,
);

const stereohype = YOUTUBE_VENUES.find((v) => v.seriesName === "STEREOHYPE")!;
assert.equal(
  isVenueSetCandidate(
    "R3WIRE - House & Tech Live on STEREOHYPE | 2nd December 2023",
    3702,
    stereohype,
  ),
  true,
);
assert.equal(
  isVenueSetCandidate("James Hype - Trigger Finger [STEREOHYPE]", 121, stereohype),
  false,
);
assert.equal(
  artistFromVenueTitle(
    "James Hype B2B Tita Lau live at STEREOHYPE Bucharest, Romania 2023",
  ),
  "James Hype b2b Tita Lau",
);

const mixmag = YOUTUBE_VENUES.find((v) => v.seriesName === "Mixmag")!;
assert.equal(isVenueSetCandidate("Kyle Starkey | Mixmag Lab London", 3600, mixmag), true);
assert.equal(isVenueSetCandidate("Festival Aftermovie 2026", 3600, mixmag), false);
assert.equal(isVenueSetCandidate("Quick teaser", 120, mixmag), false);

console.log("venues.test.ts ok");
