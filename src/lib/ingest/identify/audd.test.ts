import assert from "node:assert/strict";
import { evaluateAuddHit, parseAuddLyricRow } from "./audd";

const parsed = parseAuddLyricRow({
  artist: "Zedd",
  title: "Beautiful Now",
  media: JSON.stringify([
    { provider: "spotify", url: "http://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL" },
    { provider: "youtube", url: "https://www.youtube.com/watch?v=nRt46mdx8oY" },
  ]),
});
assert.ok(parsed);
assert.equal(
  parsed!.platforms.spotify,
  "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
);
assert.equal(
  parsed!.platforms.youtube,
  "https://www.youtube.com/watch?v=nRt46mdx8oY",
);

assert.equal(
  evaluateAuddHit("Zedd ft. Jon Bellion", "Beautiful Now", {
    artist: "Zedd",
    title: "Beautiful Now",
  }),
  true,
);
assert.equal(
  evaluateAuddHit("Zedd", "Beautiful Now", {
    artist: "Zedd",
    title: "Beautiful Now [Twysted & Jellix bootleg]",
  }),
  false,
);
assert.equal(
  evaluateAuddHit("Zedd", "Beautiful Now", {
    artist: "Coldplay",
    title: "Beautiful Now",
  }),
  false,
);
assert.equal(parseAuddLyricRow({ title: "Only Title" }), null);

console.log("identify/audd.test.ts ok");
