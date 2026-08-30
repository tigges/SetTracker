import assert from "node:assert/strict";
import {
  beatportUrlFromMbRelations,
  mbRecordingLookupOrder,
  pickBestRecording,
  spotifyUrlFromMbRelations,
} from "./musicbrainz";

assert.equal(
  beatportUrlFromMbRelations([
    { type: "streaming", url: { resource: "https://open.spotify.com/track/1" } },
    {
      type: "purchase for download",
      url: { resource: "https://www.beatport.com/track/pressure/123?ref=mb" },
    },
  ]),
  "https://www.beatport.com/track/pressure/123",
);

assert.equal(
  beatportUrlFromMbRelations([
    { url: { resource: "https://www.beatport.com/search?q=pressure" } },
  ]),
  null,
);

assert.equal(beatportUrlFromMbRelations([]), null);
assert.equal(beatportUrlFromMbRelations(undefined), null);

assert.equal(
  spotifyUrlFromMbRelations([
    { type: "streaming", url: { resource: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL?si=x" } },
  ]),
  "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
);
assert.equal(
  spotifyUrlFromMbRelations([
    { url: { resource: "https://open.spotify.com/search/pressure" } },
  ]),
  null,
);

const best = pickBestRecording("Beautiful Now", "Zedd ft. Jon Bellion", [
  {
    id: "bootleg",
    title: "Beautiful Now [Twysted & Jellix bootleg]",
    "artist-credit": [{ name: "Zedd" }],
  },
  {
    id: "studio",
    title: "Beautiful Now",
    "artist-credit": [{ name: "Zedd" }],
  },
  {
    id: "other",
    title: "Clarity",
    "artist-credit": [{ name: "Zedd" }],
  },
]);
assert.equal(best?.id, "studio");

assert.equal(
  pickBestRecording("Beautiful Now", "Zedd", [
    {
      id: "wrong-artist",
      title: "Beautiful Now",
      "artist-credit": [{ name: "Coldplay" }],
    },
  ]),
  null,
);

assert.equal(
  beatportUrlFromMbRelations([
    { url: { resource: "https://www.beatport.com/release/pressure/99" } },
    { url: { resource: "https://www.beatport.com/track/pressure/123" } },
  ]),
  "https://www.beatport.com/track/pressure/123",
);

const ordered = mbRecordingLookupOrder(
  [
    {
      id: "bootleg",
      title: "Beautiful Now [Twysted & Jellix bootleg]",
      "artist-credit": [{ name: "Zedd" }],
    },
    {
      id: "studio",
      title: "Beautiful Now",
      "artist-credit": [{ name: "Zedd" }],
    },
    {
      id: "studio",
      title: "Beautiful Now (dup)",
      "artist-credit": [{ name: "Zedd" }],
    },
  ],
  "Beautiful Now",
  "Zedd",
);
assert.deepEqual(
  ordered.map((r) => r.id),
  ["studio", "bootleg"],
);

const firstWins = mbRecordingLookupOrder([
  { id: "a", title: "One" },
  { id: "b", title: "Two" },
]);
assert.deepEqual(
  firstWins.map((r) => r.id),
  ["a", "b"],
);

console.log("musicbrainz.test.ts ok");
