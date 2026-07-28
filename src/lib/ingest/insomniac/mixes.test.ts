import assert from "node:assert/strict";
import { artistFromMixPage } from "./mixes";

assert.equal(
  artistFromMixPage("Metronome #169: Mihalis Safras", "metronome-169-mihalis-safras")
    .slug,
  "mihalis-safras",
);
assert.equal(
  artistFromMixPage(
    "San Holo Showcases His Stunning Melodic Sensibilities With Euphoric EDC Mexico 2019 Mix",
    "san-holo-showcases-his-stunning-melodic-sensibilities-with-euphoric-edc-mexico-2019-mix",
  ).name,
  "San Holo",
);

console.log("insomniac/mixes.test.ts ok");
