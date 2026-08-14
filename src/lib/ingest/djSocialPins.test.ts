import assert from "node:assert/strict";
import { hintForName } from "./discovery/knownHandles";
import { DJ_SOCIAL_PINS } from "./djSocialPins";
import { slugify } from "./types";

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
assert.match(bySlug.biscits!.youtube!, /youtube\.com\/@Biscits/i);
assert.match(
  bySlug["dimitri-vegas-like-mike"]!.soundcloud!,
  /dimitrivegasandlikemike/,
);
assert.match(bySlug.msendy!.website, /mixcloud\.com\/Msendy/i);

for (const slug of [
  "fred-again",
  "swedish-house-mafia",
  "joel-corry",
  "dj-snake",
  "atb",
  "nico-moreno",
  "gordo",
  "le-twins",
  "mariana-bo",
  "fantasm",
]) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.soundcloud!, /^https:\/\/soundcloud\.com\//);
  assert.match(bySlug[slug]!.youtube!, /youtube\.com\//);
}
assert.match(bySlug["fred-again"]!.youtube!, /@Fredagainagain/i);
assert.match(bySlug["fred-again"]!.soundcloud!, /fredagain/);
assert.match(bySlug["swedish-house-mafia"]!.soundcloud!, /officialswedishhousemafia/);
assert.match(bySlug["joel-corry"]!.soundcloud!, /joelcorry/);
assert.match(bySlug["dj-snake"]!.soundcloud!, /soundcloud\.com\/djsnake/);
assert.match(bySlug.atb!.soundcloud!, /atb-music/);
assert.match(bySlug.atb!.youtube!, /@atb/i);
assert.match(bySlug["nico-moreno"]!.soundcloud!, /nicomorenomusic/);
assert.match(bySlug["nico-moreno"]!.youtube!, /@nicomoreno_music/i);
assert.match(bySlug.gordo!.youtube!, /@gordoszn/i);
assert.match(bySlug.gordo!.soundcloud!, /gordoszn/);
assert.match(bySlug["le-twins"]!.youtube!, /@letwinsdjs/i);
assert.match(bySlug["mariana-bo"]!.soundcloud!, /borrego-s/);
assert.match(bySlug.fantasm!.soundcloud!, /kenzo-meservey/);

assert.ok(bySlug.maddix);
assert.match(bySlug.maddix!.soundcloud!, /maddixmusic/);
assert.match(bySlug.maddix!.youtube!, /@maddixmusic/i);
assert.ok(bySlug["lost-frequencies"]);
assert.match(bySlug["lost-frequencies"]!.soundcloud!, /lo-freq-1/);
assert.match(bySlug["lost-frequencies"]!.youtube!, /@LostFrequencies/i);

const offRoster13 = [
  ["martin-garrix", /martingarrix/, /@MartinGarrix/i],
  ["don-diablo", /dondiablo/, /@DonDiablo/i],
  ["steve-aoki", /steveaoki/, /@SteveAoki/i],
  ["hardwell", /hardwell/, /@hardwell/i],
  ["carl-cox", /carl-cox/, /@CarlCoxofficialTV/i],
  ["eric-prydz", /eric-prydz/, /@ericprydz/i],
  ["amelie-lens", /amelielens/, /@AmelieLens/i],
  ["paul-van-dyk", /paulvandykofficial/, /@PaulvanDyk/i],
  ["korolova", /korolovadj/, /@KOROLOVADJ/i],
  ["kolsch", /kolsch/, /@KolschOfficial/i],
  ["miss-monique", /alesia-arkusha/, /@djmissmonique/i],
  ["ferry-corsten", /ferry-corsten/, /@FerryCorsten/i],
  ["topic", /topicmusic/, /@topicmusictv/i],
] as const;
for (const [slug, sc, yt] of offRoster13) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.soundcloud!, sc);
  assert.match(bySlug[slug]!.youtube!, yt);
}

assert.ok(bySlug["1788-l"], "missing pin 1788-l");
assert.equal(bySlug["1788-l"]!.name, "1788-L");
assert.equal(bySlug["1788-l"]!.soundcloud, null);
assert.match(bySlug["1788-l"]!.youtube!, /youtube\.com\/@1788L/);
assert.match(bySlug["1788-l"]!.instagram!, /instagram\.com\/1788_l/);
assert.match(bySlug["1788-l"]!.twitter!, /(?:twitter|x)\.com\/l_1788/);
assert.match(bySlug["1788-l"]!.website, /1788-l\.com/);
assert.equal(slugify("1788-L"), "1788-l");
assert.equal(hintForName("1788-L")?.youtubeHandle, "@1788L");
assert.equal(hintForName("1788-l")?.youtubeHandle, "@1788L");

console.log("djSocialPins.test.ts ok");
