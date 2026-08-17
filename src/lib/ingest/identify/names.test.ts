import assert from "node:assert/strict";
import { catalogQueryTitle, namesClose, primaryArtist, titleRank } from "./names";

assert.equal(namesClose("Beautiful Now", "Beautiful Now"), true);
assert.equal(namesClose("feel U luv Me", "feel u luv me"), true);
assert.equal(namesClose("Clarity", "Spectrum"), false);

assert.equal(primaryArtist("Zedd ft. Jon Bellion"), "Zedd");
assert.equal(primaryArtist("Knock2 B2B Zedd"), "Knock2");

assert.equal(titleRank("Beautiful Now", "Beautiful Now"), 3);
assert.equal(titleRank("Beautiful Now", "Beautiful Now feat. Jon Bellion"), 2);
assert.equal(
  titleRank("Beautiful Now", "Beautiful Now [Twysted & Jellix bootleg]"),
  0,
);
assert.equal(titleRank("Clarity", "Clarity (Remix)"), 0);
assert.equal(titleRank("Clarity", "Spectrum"), 0);

assert.equal(catalogQueryTitle("Beautiful Now (Acappella)"), "Beautiful Now");
assert.equal(catalogQueryTitle("Beautiful Now (Knock2 Remix)"), "Beautiful Now (Knock2 Remix)");
assert.equal(catalogQueryTitle("ROOM202 Intro"), "ROOM202 Intro");

console.log("identify/names.test.ts ok");
