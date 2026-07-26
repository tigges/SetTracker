import assert from "node:assert/strict";
import { DJ_SOCIAL_PINS } from "./djSocialPins";

const bySlug = Object.fromEntries(DJ_SOCIAL_PINS.map((p) => [p.slug, p]));

for (const slug of ["biscits", "david-guetta", "fisher", "artbat"]) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.soundcloud, /^https:\/\/soundcloud\.com\//);
  assert.match(bySlug[slug]!.instagram, /instagram\.com\//);
  assert.match(bySlug[slug]!.website, /^https?:\/\//);
}

assert.match(bySlug.biscits!.instagram, /itsbiscits/);
assert.match(bySlug.fisher!.instagram, /followthefishtv/);
assert.match(bySlug["david-guetta"]!.twitter!, /davidguetta/);
assert.match(bySlug.artbat!.soundcloud, /artbatmusic/);

console.log("djSocialPins.test.ts ok");
