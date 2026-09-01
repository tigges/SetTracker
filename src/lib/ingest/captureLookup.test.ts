import assert from "node:assert/strict";
import {
  lookupCapture,
  resolveCaptureSlug,
  tracklistId,
  type CaptureArchiveRow,
} from "./captureLookup";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";
import { loadKnown1001ArchiveRows } from "./known1001Archive";

// Slug resolution across the hosts an operator actually pastes.
assert.equal(resolveCaptureSlug("yt-3mOMDdX6miw").slug, "yt-3mOMDdX6miw");
assert.equal(resolveCaptureSlug("3mOMDdX6miw").slug, "yt-3mOMDdX6miw");
assert.equal(
  resolveCaptureSlug("https://youtu.be/3mOMDdX6miw").slug,
  "yt-3mOMDdX6miw",
);
assert.equal(
  resolveCaptureSlug("https://www.youtube.com/watch?v=3mOMDdX6miw").slug,
  "yt-3mOMDdX6miw",
);
// utm_* junk from the SoundCloud share widget must not leak into the slug.
assert.equal(
  resolveCaptureSlug(
    "https://soundcloud.com/maxstyler/lollaafters26?utm_source=clipboard&utm_campaign=wtshare",
  ).slug,
  "sc-maxstyler-lollaafters26",
);
assert.equal(resolveCaptureSlug("https://example.com/nope").slug, null);

// 1001 ids are compared on the id, not the drifting name slug.
assert.equal(
  tracklistId(
    "https://www.1001tracklists.com/tracklist/2gv88zkt/max-styler-lollapalooza-afters-radius-chicago-united-states-2026-08-01.html",
  ),
  "2gv88zkt",
);
assert.equal(
  tracklistId(
    "https://www.1001tracklists.com/tracklist/2gv88zkt/some-later-retitle.html",
  ),
  "2gv88zkt",
);
assert.equal(tracklistId("https://youtu.be/3mOMDdX6miw"), null);

// Against the shipped map: wired captures report their cue count and twins.
const shipped = lookupCapture("yt-AjQeohYmg3A", []);
assert.equal(shipped.alreadyOnFile, true);
assert.equal(shipped.wiredCues, 54);
assert.deepEqual(shipped.twins.sort(), [
  "sc-r3hab-r3hab-b2b-afrojack",
  "yt-lEIGnx7qLl0",
]);

// The Skrillex trap: a paste whose wire line names a slug that is NOT wired,
// while the 1001 page is on file under a different slug. Both halves must be
// reported, or the operator re-captures work that already exists.
const archive: CaptureArchiveRow[] = [
  {
    label: "Skrillex · Lollapalooza Chile",
    slug: "yt-loD-whuR5zc",
    name: "TL_SKRILLEX_BANCO_DE_CHILE_STAGE_LOLLAPALOOZA_CHILE_2026",
    tracklistUrl:
      "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-banco-de-chile-stage-lollapalooza-chile-2026-03-15.html",
    note: "Never yt-oGS0A_R9tag (different Chile upload).",
  },
];
const byTracklist = lookupCapture(
  "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-banco-de-chile-stage-lollapalooza-chile-2026-03-15.html",
  archive,
);
assert.equal(byTracklist.alreadyOnFile, true);
assert.equal(byTracklist.slug, "yt-loD-whuR5zc");
assert.ok(byTracklist.wiredCues && byTracklist.wiredCues > 70);
const byWireLine = lookupCapture("yt-oGS0A_R9tag", archive);
assert.equal(byWireLine.alreadyOnFile, false);
assert.equal(byWireLine.wiredCues, null);

// A genuinely new slug stays new — the check must not claim everything is done.
assert.equal(lookupCapture("yt-ZZZnotwiredZ", []).alreadyOnFile, false);

// Injected map keeps the twin logic honest without depending on the catalog.
const seed = [{ at: "0:00", title: "x" }];
const fake = { "yt-aaa": seed, "sc-b-c": seed, "yt-solo": [{ at: "0:00" }] };
assert.deepEqual(lookupCapture("yt-aaa", [], fake).twins, ["sc-b-c"]);
assert.deepEqual(lookupCapture("yt-solo", [], fake).twins, []);

// Official @antiup clip is on file as a hold, never wired as the Mojave set.
const shippedArchive = loadKnown1001ArchiveRows();
const antiUpClip = lookupCapture("https://youtu.be/cZhNpGcYq_A", shippedArchive);
assert.equal(antiUpClip.slug, "yt-cZhNpGcYq_A");
assert.equal(antiUpClip.alreadyOnFile, false);
assert.equal(antiUpClip.wiredCues, null);
assert.ok(
  antiUpClip.archive.some((h) => h.name === "TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024"),
  "clip URL must hit the held Coachella seed so re-paste shows the hold note",
);
const antiUp1001 = lookupCapture(
  "https://www.1001tracklists.com/tracklist/2mccm4u1/chris-lake-chris-lorenzo-pres.-anti-up-mojave-coachella-festival-weekend-2-united-states-2024-04-19.html",
  shippedArchive,
);
assert.equal(antiUp1001.tracklistId, "2mccm4u1");
assert.equal(antiUp1001.alreadyOnFile, true);
assert.equal(antiUp1001.slug, null);
assert.equal(antiUp1001.wiredCues, null);
assert.ok(
  antiUp1001.archive.some((h) => h.name === "TL_ANTI_UP_COACHELLA_WE2_MOJAVE_2024"),
);

// MORTEN & Malaa TML WE1 — 1001 on file as a hold; yt-unavailable_atm is not a video.
const mortenMalaa1001 = lookupCapture(
  "https://www.1001tracklists.com/tracklist/m7srdk1/morten-malaa-crystal-garden-stage-tomorrowland-weekend-1-belgium-2026-07-18.html",
  shippedArchive,
);
assert.equal(mortenMalaa1001.tracklistId, "m7srdk1");
assert.equal(mortenMalaa1001.alreadyOnFile, true);
assert.equal(mortenMalaa1001.slug, null);
assert.equal(mortenMalaa1001.wiredCues, null);
assert.ok(
  mortenMalaa1001.archive.some(
    (h) => h.name === "TL_MORTEN_MALAA_TML_WE1_CRYSTAL_2026",
  ),
);
const fakeUnavailable = lookupCapture("yt-unavailable_atm", shippedArchive);
assert.equal(fakeUnavailable.alreadyOnFile, false);
assert.equal(fakeUnavailable.wiredCues, null);

// MORTEN & Malaa TML Winter Mainstage — genuinely wired official YT.
const mortenMalaaWinter = lookupCapture(
  "https://youtu.be/vjI-Oc_pgag",
  shippedArchive,
);
assert.equal(mortenMalaaWinter.slug, "yt-vjI-Oc_pgag");
assert.equal(mortenMalaaWinter.alreadyOnFile, true);
assert.equal(mortenMalaaWinter.wiredCues, 28);

// Tchami & Malaa EDC LV circuitGROUNDS — official YT wired; fan hearthis
// archive from the same paste is not a resolvable host and stays unwired.
const tchamiMalaa = lookupCapture("https://youtu.be/k9pYsuLTL2o", shippedArchive);
assert.equal(tchamiMalaa.slug, "yt-k9pYsuLTL2o");
assert.equal(tchamiMalaa.alreadyOnFile, true);
assert.equal(tchamiMalaa.wiredCues, 35);

void TRACKLIST_1001_BY_SOURCE_SLUG;
console.log("ingest/captureLookup.test.ts ok");
