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

const djmag = YOUTUBE_VENUES.find((v) => v.seriesName === "DJ Mag")!;
assert.equal(djmag.eventSlug, "dj-mag");
assert.equal(
  isVenueSetCandidate(
    "Shimza Live From Camden Roundhouse, London",
    3600,
    djmag,
  ),
  true,
);
assert.equal(
  isVenueSetCandidate("DJ Mag Awards Aftermovie", 3600, djmag),
  false,
);
assert.equal(
  artistFromVenueTitle(
    "HoneyLuv B2B TSHA House Set Live From ANTS at Ushuaïa Ibiza",
  ),
  "HoneyLuv b2b TSHA",
);
assert.equal(
  artistFromVenueTitle(
    "Deborah De Luca Techno Set From Pyramid at Amnesia Ibiza",
  ),
  "Deborah De Luca",
);
assert.equal(
  artistFromVenueTitle(
    "Lee Ann Roberts Techno Set Live From DJ Mag HQ, powered by AlphaTheta",
  ),
  "Lee Ann Roberts",
);
assert.equal(
  artistFromVenueTitle("Armin van Buuren WE2 | Tomorrowland 2026"),
  "Armin van Buuren",
);
assert.equal(
  artistFromVenueTitle("Odd Mob WE2 | Tomorrowland 2026"),
  "Odd Mob",
);

// SECTION. — "Artist | Techno DJ Set | SECTION. | Month Year", sets ~55–65m.
const section = YOUTUBE_VENUES.find((v) => v.seriesName === "SECTION.")!;
assert.equal(section.eventSlug, "section");
assert.equal(section.genre, "Techno");
assert.equal(
  artistFromVenueTitle("SHDW | Techno DJ Set | SECTION. | January 2026"),
  "SHDW",
);
assert.equal(
  artistFromVenueTitle("Phil Berg | Techno DJ Set | SECTION. | August 2026"),
  "Phil Berg",
);
assert.equal(
  artistFromVenueTitle("Philippa Pacho | Techno DJ Set | SECTION. | June 2026"),
  "Philippa Pacho",
);
assert.equal(
  isVenueSetCandidate(
    "SHDW | Techno DJ Set | SECTION. | January 2026",
    5293,
    section,
  ),
  true,
);
// Shorter than 30m still qualifies on a title match (their sets run ~55m).
assert.equal(
  isVenueSetCandidate(
    "Chlär | Techno DJ Set | SECTION. | March 2026",
    3551,
    section,
  ),
  true,
);
assert.equal(
  isVenueSetCandidate("SECTION. Label Night Trailer", 3600, section),
  false,
);

const tml = YOUTUBE_VENUES.find((v) => v.seriesName === "Tomorrowland")!;
assert.equal(
  isVenueSetCandidate("Freedom Stage - Tomorrowland 2026 LIVE", 7200, tml),
  false,
);
assert.equal(
  isVenueSetCandidate("One World Radio Tomorrowland 2026 LIVE", 7200, tml),
  false,
);
assert.equal(
  isVenueSetCandidate("Amelie Lens | Freedom Stage | Tomorrowland 2026", 3600, tml),
  true,
);
assert.equal(
  isVenueSetCandidate(
    "Amelie Lens | Freedom Stage | Tomorrowland 2026 LIVE",
    3600,
    tml,
  ),
  true,
);

console.log("venues.test.ts ok");
