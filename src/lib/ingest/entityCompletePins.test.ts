import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  decodeMojibake,
  evaluateEntityCompleteRow,
  isFallbackWebsiteHub,
  mergeEntityCompletePins,
  nameOverlapsHandle,
  parseEntityCompleteCsv,
  pinsFromAudit,
} from "./entityCompletePins";

assert.equal(decodeMojibake("\u00C3\u2020ON:MODE"), "ÆON:MODE");
assert.equal(decodeMojibake("\u00C3\u201Clafur Arnalds"), "Ólafur Arnalds");
assert.equal(decodeMojibake("Mal\u00C3\u00B3ne"), "Malóne");
assert.equal(nameOverlapsHandle("Coco María", "https://cocomaria.net/"), true);
assert.equal(nameOverlapsHandle("Noizu", "https://www.youtube.com/@NoizuSound"), true);
assert.equal(
  nameOverlapsHandle("Third Party", "https://www.youtube.com/@thirdpartychannel"),
  true,
);
assert.equal(
  nameOverlapsHandle("Fantasm", "https://www.instagram.com/fantasm_techno/"),
  false,
);
assert.equal(nameOverlapsHandle("Matroda", "https://www.youtube.com/@MATRODAMUSIC"), true);
assert.equal(nameOverlapsHandle("AC Slater", "https://x.com/djacslater"), true);
assert.equal(nameOverlapsHandle("Dr. Fresch", "https://www.youtube.com/@DrFreschTV"), true);
assert.equal(nameOverlapsHandle("elrow", "https://elrow.com/"), true);
assert.equal(nameOverlapsHandle("Westend", "https://www.itsthewestend.com/"), true);
assert.equal(nameOverlapsHandle("PLS&TY", "https://plsandty.com/"), true);
assert.equal(nameOverlapsHandle("Lucas", "https://www.lucasandsteve.com/"), false);
assert.equal(
  nameOverlapsHandle("I Hate Models", "https://www.ihatemodelsmusic.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Marnik", "https://www.marnikofficial.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Fantasm", "https://technomusicworld.com/artist/fantasm/about"),
  false,
);
assert.equal(
  nameOverlapsHandle("Lucas & Steve", "https://www.lucasandsteve.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("4444 OF A KIND", "https://www.youtube.com/@4444fourofakind"),
  true,
);
assert.equal(
  nameOverlapsHandle("4444 OF A KIND", "https://www.instagram.com/4444fourofakind/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Adrián Mills", "https://soundcloud.com/adrianxmills"),
  true,
);
assert.equal(
  nameOverlapsHandle("Adrian Mills", "https://www.instagram.com/adrianxmills/"),
  true,
);
assert.equal(nameOverlapsHandle("Joris Voorn", "https://soundcloud.com/korolovadj"), false);
assert.equal(nameOverlapsHandle("Ferry Corsten", "https://www.instagram.com/someoneelse/"), false);

assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "kyle-walker",
    name: "Kyle Walker",
    field: "",
    value: "",
    evidence: "@KyleWalker6ix has no published links — cannot confirm it is the DJ",
  }).drop,
  "cannot confirm",
);

assert.equal(
  evaluateEntityCompleteRow({
    kind: "festival",
    slug: "tomorrowland",
    name: "Tomorrowland",
    field: "youtube",
    value: "https://www.youtube.com/@tomorrowland",
    evidence: "official channel @tomorrowland",
  }).drop,
  "event has no youtube column",
);

assert.equal(
  evaluateEntityCompleteRow({
    kind: "club",
    slug: "elrow",
    name: "elrow",
    field: "website",
    value: "https://djmag.com/top-100-clubs/elrow",
    evidence: "listicle",
  }).drop,
  "weak or invalid website",
);

const ok = evaluateEntityCompleteRow({
  kind: "dj",
  slug: "malaa",
  name: "Malaa",
  field: "instagram",
  value: "https://www.instagram.com/malaamusic/",
  evidence: "official channel Malaa",
});
assert.equal(ok.field, "instagram");
assert.match(ok.value ?? "", /malaamusic/);

const csv = readFileSync(
  join(process.cwd(), "data/crosscheck/entity-complete-audit.csv"),
  "utf8",
);
const { pins, dropped } = pinsFromAudit(parseEntityCompleteCsv(csv));
assert.ok(pins.some((p) => p.slug === "elrow" && p.website === "https://elrow.com"));
assert.ok(pins.some((p) => p.slug === "matroda" && p.youtube));
assert.ok(dropped.some((d) => d.slug === "kyle-walker"));
assert.ok(
  dropped.some(
    (d) => d.slug === "tomorrowland" && d.field === "youtube",
  ),
);
assert.equal(
  pins.some((p) => p.slug === "kyle-walker"),
  false,
);

assert.equal(isFallbackWebsiteHub("https://linktr.ee/hannahlaingdj"), true);
assert.equal(isFallbackWebsiteHub("https://space92.komi.io/"), true);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "hannah-laing",
    name: "Hannah Laing",
    field: "website",
    value: "https://linktr.ee/hannahlaingdj",
    evidence: "hub fallback",
  }).value,
  "https://linktr.ee/hannahlaingdj",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "space-92",
    name: "Space 92",
    field: "website",
    value: "https://space92.komi.io/",
    evidence: "hub fallback",
  }).value,
  "https://space92.komi.io",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "angelphroot",
    name: "Angelphroot",
    field: "website",
    value: "https://linktr.ee/angieloopi",
    evidence: "hub fallback",
  }).value,
  "https://linktr.ee/angieloopi",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "ahee",
    name: "AHEE",
    field: "website",
    value: "https://linktr.ee/",
    evidence: "empty hub",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "eli-brown",
    name: "Eli Brown",
    field: "website",
    value: "https://elibrownbeats.com/",
    evidence: "official",
  }).value,
  "https://elibrownbeats.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "coco-maria",
    name: "Coco María",
    field: "website",
    value: "https://cocomaria.net/",
    evidence: "official",
  }).value,
  "https://cocomaria.net",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "imanu",
    name: "IMANU",
    field: "website",
    value: "https://www.imanu.nu/",
    evidence: "official",
  }).value,
  "https://imanu.nu",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "rules",
    name: "Rules",
    field: "website",
    value: "https://thisisrules.com/",
    evidence: "official",
  }).value,
  "https://thisisrules.com",
);
assert.equal(
  nameOverlapsHandle("Chase", "https://chaseandstatus.co.uk/"),
  false,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "vini-vici",
    name: "Vini Vici",
    field: "website",
    value: "https://djmag.com/top100djs/2025/32/vini-vici",
    evidence: "listicle",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "i-hate-models",
    name: "I Hate Models",
    field: "website",
    value: "https://en.wikipedia.org/wiki/I_Hate_Models",
    evidence: "encyclopedia",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "fantasm",
    name: "Fantasm",
    field: "website",
    value: "https://technomusicworld.com/artist/fantasm/about",
    evidence: "third-party bio",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "i-hate-models",
    name: "I Hate Models",
    field: "website",
    value: "https://www.ihatemodelsmusic.com/",
    evidence: "official",
  }).value,
  "https://ihatemodelsmusic.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "cloonee",
    name: "Cloonee",
    field: "bio",
    value:
      "Cloonee is a London, UK-based DJ, producer or electronic artist whose work centers on tech house / house, with a focus on club-ready releases and live sets.",
    evidence: "template",
  }).drop,
  "template bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "atlantis",
    name: "Atlantis",
    field: "bio",
    value:
      "Atlantis is a DJ, producer or electronic artist whose work centers on melodic house & techno, with a focus on club-ready releases and live sets.",
    evidence: "template",
  }).drop,
  "template bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mau-p",
    name: "Mau P",
    field: "bio",
    value:
      "Dutch DJ and producer whose punchy, techno-leaning house records have made him a major contemporary club and festival act.",
    evidence: "producer",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "4444-of-a-kind",
    name: "4444 OF A KIND",
    field: "youtube",
    value: "https://www.youtube.com/@4444fourofakind",
    evidence: "official channel About",
  }).value,
  "https://www.youtube.com/@4444fourofakind",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "4444-of-a-kind",
    name: "4444 OF A KIND",
    field: "instagram",
    value: "https://www.instagram.com/4444fourofakind/",
    evidence: "official profile",
  }).value,
  "https://instagram.com/4444fourofakind",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "4444-of-a-kind",
    name: "4444 OF A KIND",
    field: "bio",
    value:
      "Exclusive live act of D-Block & S-te-Fan and Sub Zero Project. First release Waiting 4 is on Tomorrowland Music.",
    evidence: "official YouTube About",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "soundcloud",
    value: "https://soundcloud.com/adrianxmills",
    evidence: "official profile",
  }).value,
  "https://soundcloud.com/adrianxmills",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "instagram",
    value: "https://www.instagram.com/adrianxmills/",
    evidence: "official profile",
  }).value,
  "https://instagram.com/adrianxmills",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "website",
    value: "https://ra.co/dj/adrianmills",
    evidence: "RA profile",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "genre",
    value: "Techno",
    evidence: "official Facebook",
  }).value,
  "Techno",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mau-p",
    name: "Mau P",
    field: "homeCity",
    value: "Amsterdam, Netherlands",
    evidence: "producer",
  }).value,
  "Amsterdam, Netherlands",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "max-styler",
    name: "Max Styler",
    field: "homeCity",
    value: "Not found",
    evidence: "export placeholder",
  }).drop,
  "placeholder city",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mau-p",
    name: "Mau P",
    field: "genre",
    value: "Tech House / House",
    evidence: "producer",
  }).value,
  "Tech House",
);

const duoFromHalf = pinsFromAudit([
  {
    kind: "dj",
    slug: "lucas",
    name: "Lucas",
    field: "website",
    value: "https://www.lucasandsteve.com/",
    evidence: "official duo site",
  },
  {
    kind: "dj",
    slug: "lucas",
    name: "Lucas",
    field: "genre",
    value: "Trance / Psytrance",
    evidence: "half-name guess",
  },
]);
assert.equal(
  duoFromHalf.pins.some((p) => p.slug === "lucas"),
  false,
);
const duoPin = duoFromHalf.pins.find((p) => p.slug === "lucas-steve");
assert.ok(duoPin);
assert.equal(duoPin.website, "https://lucasandsteve.com");
assert.equal(duoPin.genre, undefined);
assert.ok(
  duoFromHalf.dropped.some(
    (d) => d.slug === "lucas" && d.reason === "atomic-act half genre",
  ),
);

const mergedHalf = mergeEntityCompletePins(
  [
    {
      kind: "dj",
      slug: "lucas",
      homeCity: "Maastricht, Netherlands",
    },
  ],
  [
    {
      kind: "dj",
      slug: "lucas-steve",
      website: "https://www.lucasandsteve.com/",
      genre: "House",
    },
  ],
);
assert.equal(mergedHalf.length, 1);
assert.equal(mergedHalf[0]?.slug, "lucas-steve");
assert.equal(mergedHalf[0]?.website, "https://www.lucasandsteve.com/");
assert.equal(mergedHalf[0]?.homeCity, "Maastricht, Netherlands");
assert.equal(mergedHalf[0]?.genre, "House");

const hubThenOfficial = mergeEntityCompletePins(
  [{ kind: "dj", slug: "green-velvet", website: "https://linktr.ee/officialgreenvelvet" }],
  [{ kind: "dj", slug: "green-velvet", website: "https://officialgreenvelvet.com" }],
);
assert.equal(hubThenOfficial[0]?.website, "https://officialgreenvelvet.com");
const officialThenHub = mergeEntityCompletePins(
  [{ kind: "dj", slug: "green-velvet", website: "https://officialgreenvelvet.com" }],
  [{ kind: "dj", slug: "green-velvet", website: "https://linktr.ee/officialgreenvelvet" }],
);
assert.equal(officialThenHub[0]?.website, "https://officialgreenvelvet.com");

console.log("entityCompletePins.test.ts ok");
