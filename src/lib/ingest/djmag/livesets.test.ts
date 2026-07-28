import assert from "node:assert/strict";
import { isDjMagLivesetCandidate } from "./livesets";

assert.equal(
  isDjMagLivesetCandidate(
    "Shimza Live From Camden Roundhouse, London",
    3600,
  ),
  true,
);
assert.equal(
  isDjMagLivesetCandidate(
    "Deborah De Luca Techno Set From Pyramid at Amnesia Ibiza",
    45 * 60,
  ),
  true,
);
assert.equal(
  isDjMagLivesetCandidate("DJ Mag Awards Aftermovie 2025", 3600),
  false,
);
assert.equal(isDjMagLivesetCandidate("Quick teaser clip", 90), false);

console.log("djmag/livesets.test.ts ok");
