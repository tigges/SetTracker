import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferFestivalEvent } from "../events";
import {
  inferDjMagClubEvent,
  loadDjMagTopClubs,
  resolveDjMagClubByName,
} from "./djmagClubs";

const seed = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/venue-seeds/djmag-top100-clubs-2026.json"),
    "utf8",
  ),
) as { clubs: Array<{ rank: number; slug: string; name: string }> };

assert.equal(seed.clubs.length, 100);
assert.equal(seed.clubs[0]?.slug, "unvrs");
assert.equal(seed.clubs[2]?.name.includes("Ushua"), true);

// Warm seed cache without network by resolving from seed file
assert.equal(resolveDjMagClubByName("Berghain")?.slug, "berghain");
assert.equal(resolveDjMagClubByName("Hï Ibiza")?.slug, "hi-ibiza");
assert.equal(
  inferDjMagClubEvent("Amelie Lens at Bootshaus Cologne")?.slug,
  "bootshaus",
);
assert.equal(
  inferFestivalEvent("Chris Lake live at Ushuaïa Ibiza")?.slug,
  "ushuaia-ibiza",
);
// Ambiguous short names must not match
assert.equal(inferDjMagClubEvent("Lost in Sound Vol 3"), null);

loadDjMagTopClubs().then((clubs) => {
  assert.ok(clubs.length >= 100, `expected 100+ clubs, got ${clubs.length}`);
  console.log("djmagClubs.test.ts ok", clubs.length);
});
