import assert from "node:assert/strict";
import { beatportUrlFromMbRelations } from "./musicbrainz";

assert.equal(
  beatportUrlFromMbRelations([
    { type: "streaming", url: { resource: "https://open.spotify.com/track/1" } },
    {
      type: "purchase for download",
      url: { resource: "https://www.beatport.com/track/utopia/20451234" },
    },
  ]),
  "https://www.beatport.com/track/utopia/20451234",
);

assert.equal(
  beatportUrlFromMbRelations([
    { url: { resource: "https://www.beatport.com/search?q=utopia" } },
  ]),
  null,
);

assert.equal(beatportUrlFromMbRelations([]), null);
assert.equal(beatportUrlFromMbRelations(undefined), null);

console.log("musicbrainz.test.ts ok");
