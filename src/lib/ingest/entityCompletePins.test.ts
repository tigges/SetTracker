import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  evaluateEntityCompleteRow,
  nameOverlapsHandle,
  parseEntityCompleteCsv,
  pinsFromAudit,
} from "./entityCompletePins";

assert.equal(nameOverlapsHandle("Matroda", "https://www.youtube.com/@MATRODAMUSIC"), true);
assert.equal(nameOverlapsHandle("AC Slater", "https://x.com/djacslater"), true);
assert.equal(nameOverlapsHandle("Dr. Fresch", "https://www.youtube.com/@DrFreschTV"), true);
assert.equal(nameOverlapsHandle("elrow", "https://elrow.com/"), true);
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

console.log("entityCompletePins.test.ts ok");
