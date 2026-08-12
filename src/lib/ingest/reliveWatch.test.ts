import assert from "node:assert/strict";
import {
  artistFromReliveTitle,
  isRedundantRelive,
  matchHeldRelives,
  matchUnwiredOfficialRelives,
  reliveDedupeKey,
  reliveEditionToken,
} from "./reliveWatch";
import { HELD_RELIVE_WATCH } from "./nextCaptures";

assert.equal(reliveEditionToken("Fisher WE2 | Tomorrowland 2026"), "tml-we2");
assert.equal(
  reliveEditionToken("FISHER LIVE FROM TOMORROWLAND FREEDOM STAGE WEEKEND 2"),
  "tml-we2",
);
assert.equal(reliveEditionToken("Fisher WE 1 | Tomorrowland 2026"), "tml-we1");
assert.equal(reliveEditionToken("HoneyLuv Street Parade"), null);

assert.equal(
  reliveDedupeKey("Fisher WE2 | Tomorrowland 2026", "fisher"),
  "fisher|tml-we2",
);

assert.equal(
  isRedundantRelive("Fisher WE2 | Tomorrowland 2026", "fisher", [
    {
      title: "FISHER LIVE FROM TOMORROWLAND FREEDOM STAGE WEEKEND 2",
      artistSlug: "fisher",
    },
  ]),
  true,
);
assert.equal(
  isRedundantRelive("Fisher WE1 | Tomorrowland 2026", "fisher", [
    {
      title: "Fisher WE2 | Tomorrowland 2026",
      artistSlug: "fisher",
    },
  ]),
  false,
);

assert.equal(
  artistFromReliveTitle("Martin Garrix WE2 | Tomorrowland 2026"),
  "Martin Garrix",
);
assert.equal(
  artistFromReliveTitle("The Chainsmokers WE1 | Tomorrowland 2026"),
  "The Chainsmokers",
);
assert.equal(
  artistFromReliveTitle("ILLENIUM WE1 | Tomorrowland 2026"),
  "Illenium",
);
assert.equal(artistFromReliveTitle("KUKO WE1 | Tomorrowland 2026"), null);

const entries = [
  {
    videoId: "BUsCIK_kh_A",
    title: "Martin Garrix WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
  {
    videoId: "DuXXMZLfAkQ",
    title: "Fisher WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
  {
    videoId: "CALVINOFFCL",
    title: "Calvin Harris WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
  {
    videoId: "VABm0tIRn2U",
    title: "Dyen b2b Maddix WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
];

const held = matchHeldRelives(entries, HELD_RELIVE_WATCH);
const calvin = held.find((h) => /calvin/i.test(h.name));
assert.ok(calvin);
assert.equal(calvin!.status, "candidate");
assert.equal(calvin!.videoId, "CALVINOFFCL");
assert.match(calvin!.note, /wire/i);

const dyzen = held.find((h) => /dyzen/i.test(h.name));
assert.ok(dyzen);
assert.equal(dyzen!.status, "waiting");
assert.equal(dyzen!.videoId, undefined);

const sonny = held.find((h) => /sonny/i.test(h.name));
assert.equal(sonny!.status, "waiting");

const unwired = matchUnwiredOfficialRelives(entries, {
  curatedVideoIds: new Set(["DuXXMZLfAkQ"]),
  mappedSlugs: new Set(),
  existingKeys: new Set(["fisher|tml-we2"]),
});
assert.ok(unwired.some((p) => p.slug === "yt-BUsCIK_kh_A"));
assert.equal(
  unwired.find((p) => p.slug === "yt-BUsCIK_kh_A")!.name,
  "TL_MARTIN_GARRIX_TML_WE2",
);
assert.ok(!unwired.some((p) => p.slug === "yt-DuXXMZLfAkQ"));
assert.ok(unwired.every((p) => p.reason === "relive:official-unwired"));

console.log("reliveWatch.test.ts ok");
