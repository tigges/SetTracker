import assert from "node:assert/strict";
import { DJ_SOCIAL_PINS } from "./djSocialPins";

const bySlug = Object.fromEntries(DJ_SOCIAL_PINS.map((p) => [p.slug, p]));

for (const slug of [
  "biscits",
  "david-guetta",
  "fisher",
  "artbat",
  "ac-slater",
  "solomun",
  "odd-mob",
  "westend",
  "sara-landry",
  "lilly-palmer",
  "tape-b",
  "hntr",
]) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.soundcloud, /^https:\/\/soundcloud\.com\//);
  assert.match(bySlug[slug]!.website, /^https?:\/\//);
  if (bySlug[slug]!.instagram) {
    assert.match(bySlug[slug]!.instagram!, /instagram\.com\//);
  }
}

assert.match(bySlug.biscits!.instagram!, /itsbiscits/);
assert.match(bySlug.fisher!.instagram!, /followthefishtv/);
assert.match(bySlug["david-guetta"]!.twitter!, /davidguetta/);
assert.match(bySlug.artbat!.soundcloud, /artbatmusic/);
assert.match(bySlug["ac-slater"]!.website, /djacslater\.com/);
assert.match(bySlug["ac-slater"]!.instagram!, /djacslater/);
assert.match(bySlug.solomun!.website, /solomun\.org/);
assert.match(bySlug.westend!.soundcloud, /itsthewestend/);
assert.match(bySlug.hntr!.soundcloud, /hntrnet/);
assert.match(bySlug["tape-b"]!.soundcloud, /tape-b-official/);
assert.match(bySlug["sara-landry"]!.soundcloud, /sara-landry-dj/);
assert.match(bySlug["sara-landry"]!.instagram!, /saralandrydj/);
assert.match(bySlug["lilly-palmer"]!.instagram!, /lilly_palmerdj/);
assert.equal(bySlug.westend!.instagram, null);
assert.equal(bySlug["tape-b"]!.instagram, null);

console.log("djSocialPins.test.ts ok");
