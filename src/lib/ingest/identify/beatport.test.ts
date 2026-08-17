import assert from "node:assert/strict";
import {
  acceptBeatportTrackUrl,
  canonicalBeatportUrl,
  isBeatportHost,
} from "./beatport";

assert.equal(
  acceptBeatportTrackUrl("https://www.beatport.com/track/beautiful-now/123?ref=mb"),
  "https://www.beatport.com/track/beautiful-now/123",
);
assert.equal(
  acceptBeatportTrackUrl("https://www.beatport.com/search?q=beautiful+now"),
  undefined,
);
assert.equal(
  acceptBeatportTrackUrl("https://www.beatport.com/artist/zedd/123"),
  undefined,
);
assert.equal(canonicalBeatportUrl("https://api.beatport.com/v4/catalog/tracks/1"), null);
assert.equal(isBeatportHost("https://www.beatport.com/track/x/1"), true);
assert.equal(isBeatportHost("https://api.beatport.com/v4/catalog/tracks/1"), true);
assert.equal(isBeatportHost("https://musicbrainz.org/recording/1"), false);

console.log("identify/beatport.test.ts ok");
