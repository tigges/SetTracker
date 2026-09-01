import assert from "node:assert/strict";
import {
  artistFromReliveTitle,
  isRedundantRelive,
  matchHeldRelives,
  matchUnwiredOfficialRelives,
  reliveDedupeKey,
  reliveEditionToken,
  remapsFromCuratedRelives,
} from "./reliveWatch";
import { HELD_PLAYBACK_WATCH } from "./nextCaptures";

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

const held = matchHeldRelives(entries, HELD_PLAYBACK_WATCH);
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

const knockWaiting = held.find((h) => /knock2/i.test(h.name));
assert.ok(knockWaiting);
assert.equal(knockWaiting!.status, "waiting");
assert.match(knockWaiting!.note, /DerekD2/);

const coleWaiting = held.find((h) => /cole/i.test(h.name));
assert.ok(coleWaiting);
assert.equal(coleWaiting!.status, "waiting");
assert.match(coleWaiting!.note, /HARD\/Insomniac/i);

const knockEntries = [
  {
    videoId: "KNOCKHARD01",
    title: "Knock2 B2B Zedd | HARD Summer 2026",
    channel: "HARD",
  },
  {
    videoId: "KNOCKSOLO01",
    title: "Knock2 | HARD Summer 2026",
    channel: "HARD",
  },
  {
    videoId: "KNOCKTMLFAKE",
    title: "Knock2 B2B Zedd WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
];
const knockHeld = matchHeldRelives(knockEntries, HELD_PLAYBACK_WATCH);
const knockHit = knockHeld.find((h) => /knock2/i.test(h.name));
assert.equal(knockHit!.status, "candidate");
assert.equal(knockHit!.videoId, "KNOCKHARD01");
assert.equal(
  knockHeld.find((h) => /calvin/i.test(h.name))!.status,
  "waiting",
);

const coleEntries = [
  {
    videoId: "COLEHARD001",
    title: "Cole Terrazas | HARD Summer 2026 Pink Stage",
    channel: "HARD",
  },
  {
    videoId: "COLETMLFAKE",
    title: "Cole Terrazas WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
];
const coleHeld = matchHeldRelives(coleEntries, HELD_PLAYBACK_WATCH);
const coleHit = coleHeld.find((h) => /cole/i.test(h.name));
assert.equal(coleHit!.status, "candidate");
assert.equal(coleHit!.videoId, "COLEHARD001");
assert.equal(
  coleHeld.find((h) => /calvin/i.test(h.name))!.status,
  "waiting",
);

const mortenMalaaWaiting = held.find((h) => /morten/i.test(h.name));
assert.ok(mortenMalaaWaiting);
assert.equal(mortenMalaaWaiting!.status, "waiting");
assert.match(mortenMalaaWaiting!.note, /yt-unavailable_atm/i);

const mortenEntries = [
  {
    videoId: "MORTENMAL01",
    title: "MORTEN B2B Malaa WE1 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
  {
    videoId: "MORTENSOLO01",
    title: "MORTEN WE1 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
  {
    videoId: "MALAASOLO01",
    title: "Malaa WE1 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
  {
    videoId: "MORTENWE2FAKE",
    title: "MORTEN B2B Malaa WE2 | Tomorrowland 2026",
    channel: "Tomorrowland",
  },
];
const mortenHeld = matchHeldRelives(mortenEntries, HELD_PLAYBACK_WATCH);
const mortenHit = mortenHeld.find((h) => /morten/i.test(h.name));
assert.equal(mortenHit!.status, "candidate");
assert.equal(mortenHit!.videoId, "MORTENMAL01");
assert.equal(
  mortenHeld.find((h) => /calvin/i.test(h.name))!.status,
  "waiting",
);

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

const fisherRemaps = remapsFromCuratedRelives(
  [
    {
      slug: "yt-mVB-gqggrCQ",
      title: "Fisher WE2 | Tomorrowland 2026",
      artistSlug: "fisher",
    },
  ],
  [
    {
      videoId: "Uq1WP8v3U4o",
      title: "FISHER LIVE FROM TOMORROWLAND FREEDOM STAGE WEEKEND 2",
      artistSlug: "fisher",
    },
  ],
);
assert.equal(fisherRemaps.length, 1);
assert.equal(fisherRemaps[0]!.fromSlug, "yt-mVB-gqggrCQ");
assert.equal(fisherRemaps[0]!.toSlug, "yt-Uq1WP8v3U4o");
assert.deepEqual(
  remapsFromCuratedRelives(
    [
      {
        slug: "yt-Uq1WP8v3U4o",
        title: "Fisher WE2 | Tomorrowland 2026",
        artistSlug: "fisher",
      },
    ],
    [
      {
        videoId: "Uq1WP8v3U4o",
        title: "FISHER LIVE FROM TOMORROWLAND FREEDOM STAGE WEEKEND 2",
        artistSlug: "fisher",
      },
    ],
  ),
  [],
);

console.log("reliveWatch.test.ts ok");
