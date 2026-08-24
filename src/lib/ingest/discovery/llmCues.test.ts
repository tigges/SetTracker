import assert from "node:assert/strict";
import {
  clockStringInText,
  compareCueQueueSeeds,
  cueQueueHostRank,
  filterProposedCues,
  firstPartyTextHasClocks,
  isCueRadioSet,
  isCueStub,
  looksLikeCueRadioTitle,
  mergeClockedPlays,
  cuePlaysForWrite,
  parseClockToSec,
} from "./llmCues";
import { parseClockedTracklist } from "../soundcloud/parseTracklist";

const text = `
Tracklist
33:38 The Drill
42:50 Thunderbolt
41:07 Eric Prydz - Pjanoo
Don't interpolate this untimed Artist - Title
`;

assert.equal(clockStringInText("33:38", text), true);
assert.equal(clockStringInText("39:40", text), false);
assert.equal(parseClockToSec("33:38"), 33 * 60 + 38);
assert.equal(parseClockToSec("1:02:03"), 3723);
assert.equal(parseClockToSec("nope"), null);

const clocked = parseClockedTracklist(text, 3600, "youtube");
assert.equal(clocked.length, 3);
assert.equal(clocked.some((p) => p.trackTitle === "Title"), false);

const interpolated = `
Artist One - Track A
Artist Two - Track B
Artist Three - Track C
`;
assert.equal(parseClockedTracklist(interpolated, 3600).length, 0);

assert.equal(
  filterProposedCues(
    [{ at: "1:37:25", artist: null, title: "Duration:" }],
    "1:37:25 Duration:\nSizz Da Hood",
    5845,
    "hearthis",
  ).length,
  0,
);

const kept = filterProposedCues(
  [
    { at: "33:38", artist: null, title: "The Drill" },
    { at: "39:40", artist: "Eric Prydz", title: "Pjanoo" },
    { at: "42:50", artist: null, title: "Invented" },
  ],
  text,
  3600,
  "youtube",
);
assert.equal(kept.length, 1);
assert.equal(kept[0]!.timestamp, 33 * 60 + 38);
assert.equal(kept[0]!.trackTitle, "The Drill");

const merged = mergeClockedPlays(clocked, kept);
assert.equal(merged.filter((p) => p.timestamp === 33 * 60 + 38).length, 1);

const parserOnly = cuePlaysForWrite(clocked, kept, false);
assert.equal(parserOnly.length, clocked.length);
assert.equal(
  parserOnly.some((p) => p.trackTitle === "The Drill" && p.artistName == null),
  true,
);
const withLlm = cuePlaysForWrite(
  [{ ...clocked[0]!, timestamp: 10 }],
  kept,
  true,
);
assert.ok(withLlm.some((p) => p.trackTitle === "The Drill"));
assert.equal(cuePlaysForWrite(clocked, kept, false).length, clocked.length);

assert.equal(isCueStub([]), true);
assert.equal(
  isCueStub([
    { provenance: "youtube" },
    { provenance: "youtube" },
  ]),
  true,
);
assert.equal(
  isCueStub([{ provenance: "1001tl" }, { provenance: "youtube" }]),
  false,
);
assert.equal(
  isCueStub([
    { provenance: "fingerprint" },
    { provenance: "youtube" },
    { provenance: "youtube" },
    { provenance: "youtube" },
    { provenance: "youtube" },
    { provenance: "youtube" },
  ]),
  false,
);

assert.equal(looksLikeCueRadioTitle("Smash The House Radio ep. 690"), true);
assert.equal(looksLikeCueRadioTitle("Clapcast 576", "sc-claptone-clapcast-576"), true);
assert.equal(
  looksLikeCueRadioTitle("Bizarrap & Skrillex | Ultra Music Festival Miami"),
  false,
);
assert.equal(
  isCueRadioSet({
    title: "Friendship Mix with Topic",
    type: "festival",
    seriesName: "Tomorrowland Radio",
  }),
  true,
);
assert.equal(
  isCueRadioSet({
    title: "Bizarrap & Skrillex | Mainstage, Ultra Music Festival Miami",
    type: "festival",
    eventKind: "festival",
  }),
  false,
);

assert.equal(
  cueQueueHostRank("https://www.youtube.com/watch?v=0psLTNmJM38"),
  0,
);
assert.equal(
  cueQueueHostRank("https://soundcloud.com/claptone/clapcast-576"),
  2,
);

const ranked = [
  {
    title: "Smash The House Radio ep. 690",
    type: "radio",
    playbackUrl: "https://soundcloud.com/x/radio",
    publishedAt: new Date("2026-08-20"),
  },
  {
    title: "Bizarrap & Skrillex Ultra Mainstage",
    type: "festival",
    playbackUrl: "https://www.youtube.com/watch?v=0psLTNmJM38",
    publishedAt: new Date("2026-03-27"),
  },
  {
    title: "Space 92 Tomorrowland 2026",
    type: "festival",
    playbackUrl: "https://soundcloud.com/space92/tml",
    publishedAt: new Date("2026-08-01"),
  },
].sort(compareCueQueueSeeds);
assert.equal(ranked[0]!.title, "Bizarrap & Skrillex Ultra Mainstage");
assert.equal(ranked[1]!.title, "Space 92 Tomorrowland 2026");
assert.equal(ranked[2]!.title, "Smash The House Radio ep. 690");

assert.equal(
  firstPartyTextHasClocks("0:00 Intro\n45:50 b2b w/ skrillex"),
  true,
);
assert.equal(firstPartyTextHasClocks("1. Artist - Title\n2. Other - Song"), false);

console.log("llmCues.test.ts ok");
