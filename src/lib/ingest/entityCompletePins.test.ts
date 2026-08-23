import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  evaluateEntityCompleteRow,
  mergeEntityCompletePins,
  nameOverlapsHandle,
  parseEntityCompleteCsv,
  pinsFromAudit,
} from "./entityCompletePins";

assert.equal(nameOverlapsHandle("Matroda", "https://www.youtube.com/@MATRODAMUSIC"), true);
assert.equal(nameOverlapsHandle("AC Slater", "https://x.com/djacslater"), true);
assert.equal(nameOverlapsHandle("Dr. Fresch", "https://www.youtube.com/@DrFreschTV"), true);
assert.equal(nameOverlapsHandle("elrow", "https://elrow.com/"), true);
assert.equal(nameOverlapsHandle("Westend", "https://www.itsthewestend.com/"), true);
assert.equal(nameOverlapsHandle("PLS&TY", "https://plsandty.com/"), true);
assert.equal(nameOverlapsHandle("Lucas", "https://www.lucasandsteve.com/"), false);
assert.equal(
  nameOverlapsHandle("Lucas & Steve", "https://www.lucasandsteve.com/"),
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

assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "hannah-laing",
    name: "Hannah Laing",
    field: "website",
    value: "https://linktr.ee/hannahlaingdj",
    evidence: "hub",
  }).drop,
  "weak or invalid website",
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
assert.equal(duoPin.website, "https://www.lucasandsteve.com/");
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

console.log("entityCompletePins.test.ts ok");
