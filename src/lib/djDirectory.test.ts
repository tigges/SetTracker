import assert from "node:assert/strict";
import { djIndexLetter, groupDjsByLetter } from "./djDirectory";
import type { DjListItem } from "./queries";

function dj(name: string, slug = name.toLowerCase()): DjListItem {
  return {
    id: slug,
    slug,
    name,
    homeCity: null,
    accent: "#fff",
    imageUrl: "x",
    soundcloud: null,
    youtube: null,
    instagram: null,
    twitter: null,
    website: null,
    beatport: null,
    setCount: 1,
    playCount: 1,
    identifiedPlayCount: 1,
    hasHandle: true,
    isJunk: false,
    isLowSignal: false,
    isBrowseReady: true,
  };
}

assert.equal(djIndexLetter("Chris Lake"), "C");
assert.equal(djIndexLetter("above & beyond"), "A");
assert.equal(djIndexLetter("12th Planet"), "#");

const groups = groupDjsByLetter([
  dj("Chris Lake", "chris-lake"),
  dj("Carl Cox", "carl-cox"),
  dj("Amelie Lens", "amelie-lens"),
]);
assert.deepEqual(
  groups.map((g) => g.letter),
  ["A", "C"],
);
assert.equal(groups[1]!.djs.length, 2);

console.log("djDirectory.test.ts ok");
