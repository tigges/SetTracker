import assert from "node:assert/strict";
import {
  clockStringInText,
  filterProposedCues,
  isCueStub,
  mergeClockedPlays,
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

console.log("llmCues.test.ts ok");
