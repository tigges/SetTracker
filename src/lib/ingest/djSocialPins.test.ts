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
  "marten-horger",
  "gentlemens-groove",
  "charlotte-de-witte",
  "black-coffee",
  "chapter-verse",
  "walker-royce",
  "vintage-culture",
  "bleu-clair",
  "hot-since-82",
  "adam-beyer",
  "dijon",
  "dom-dolla",
  "chris-lorenzo",
  "hannah-wants",
  "dimitri-vegas-like-mike",
  "msendy",
]) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.website, /^https?:\/\//);
  if (bySlug[slug]!.soundcloud) {
    assert.match(bySlug[slug]!.soundcloud!, /^https:\/\/soundcloud\.com\//);
  }
  if (bySlug[slug]!.instagram) {
    assert.match(bySlug[slug]!.instagram!, /instagram\.com\//);
  }
}

assert.match(bySlug.biscits!.instagram!, /itsbiscits/);
assert.match(bySlug.fisher!.instagram!, /followthefishtv/);
assert.match(bySlug["david-guetta"]!.twitter!, /davidguetta/);
assert.match(bySlug.artbat!.soundcloud!, /artbatmusic/);
assert.match(bySlug["ac-slater"]!.website, /djacslater\.com/);
assert.match(bySlug["ac-slater"]!.instagram!, /djacslater/);
assert.match(bySlug.solomun!.website, /solomun\.org/);
assert.match(bySlug.westend!.soundcloud!, /itsthewestend/);
assert.match(bySlug.hntr!.soundcloud!, /hntrnet/);
assert.match(bySlug["tape-b"]!.soundcloud!, /tape-b-official/);
assert.match(bySlug["sara-landry"]!.soundcloud!, /sara-landry-dj/);
assert.match(bySlug["sara-landry"]!.instagram!, /saralandrydj/);
assert.match(bySlug["lilly-palmer"]!.instagram!, /lilly_palmerdj/);
assert.equal(bySlug.westend!.instagram, null);
assert.equal(bySlug["tape-b"]!.instagram, null);
assert.match(bySlug["marten-horger"]!.soundcloud!, /marten-horger/);
assert.match(bySlug["marten-horger"]!.instagram!, /marten_horger/);
assert.match(bySlug["marten-horger"]!.website, /martenhorger\.com/);
assert.match(
  bySlug["gentlemens-groove"]!.soundcloud!,
  /gentlemens-groove-records/,
);
assert.match(
  bySlug["gentlemens-groove"]!.website,
  /facebook\.com\/Gentlemensgroove/i,
);
assert.match(bySlug["charlotte-de-witte"]!.soundcloud!, /charlottedewittemusic/);
assert.match(bySlug["charlotte-de-witte"]!.instagram!, /charlottedewittemusic/);
assert.match(bySlug["charlotte-de-witte"]!.twitter!, /charlottedwitte/);
assert.match(bySlug["charlotte-de-witte"]!.website, /charlottedewittemusic\.com/);

assert.match(bySlug["black-coffee"]!.instagram!, /realblackcoffee/);
assert.match(bySlug["black-coffee"]!.twitter!, /RealBlackCoffee/);
assert.match(bySlug["black-coffee"]!.website, /music\.apple\.com/);
assert.equal(bySlug["chapter-verse"]!.instagram, null);
assert.match(bySlug["chapter-verse"]!.soundcloud!, /chapterandverseofficial/);
assert.match(bySlug["walker-royce"]!.instagram!, /walkerandroyce/);
assert.match(bySlug["walker-royce"]!.twitter!, /WalkerAndRoyce/);
assert.match(bySlug["vintage-culture"]!.website, /vintageculture\.com/);
assert.match(bySlug["vintage-culture"]!.instagram!, /vintageculture/);
assert.match(bySlug["bleu-clair"]!.instagram!, /bleuclairmusic/);
assert.match(bySlug["bleu-clair"]!.soundcloud!, /bleuclair/);
assert.match(bySlug["bleu-clair"]!.twitter!, /bleuclair/);
assert.match(bySlug["hot-since-82"]!.soundcloud!, /hotsince-82/);
assert.match(bySlug["adam-beyer"]!.instagram!, /realadambeyer/);
assert.equal(bySlug["adam-beyer"]!.soundcloud, null);
assert.match(bySlug.dijon!.website, /dijondijon\.com/);
assert.equal(bySlug.dijon!.soundcloud, null);
assert.match(bySlug["dom-dolla"]!.website, /domdolla\.com\.au/);
assert.match(bySlug["chris-lorenzo"]!.soundcloud!, /chris-lorenzo-1/);
assert.match(
  bySlug["dimitri-vegas-like-mike"]!.soundcloud!,
  /dimitrivegasandlikemike/,
);
assert.match(bySlug.msendy!.website, /mixcloud\.com\/Msendy/i);

console.log("djSocialPins.test.ts ok");
