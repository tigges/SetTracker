import assert from "node:assert/strict";
import type { RawPlay } from "../types";
import { merge1001Plays, overlayHasRealClocks } from "./seeds";

function play(
  partial: Partial<RawPlay> & { timestamp: number },
): RawPlay {
  return {
    position: 1,
    idStatus: "identified",
    provenance: "1001tl",
    trackTitle: "Track",
    artistName: "Artist",
    ...partial,
  };
}

const untimedCredits: RawPlay[] = Array.from({ length: 8 }, (_, i) =>
  play({
    position: i + 1,
    timestamp: 0,
    provenance: "youtube",
    trackTitle: `Credit ${i + 1}`,
  }),
);

const realEight: RawPlay[] = [
  0, 187, 401, 612, 890, 1204, 1550, 1899,
].map((timestamp, i) =>
  play({
    position: i + 1,
    timestamp,
    trackTitle: `Cue ${i + 1}`,
  }),
);

const evenEight: RawPlay[] = Array.from({ length: 8 }, (_, i) =>
  play({
    position: i + 1,
    timestamp: i * 240,
    trackTitle: `Even ${i + 1}`,
  }),
);

assert.equal(overlayHasRealClocks(realEight), true);
assert.equal(overlayHasRealClocks(evenEight), false);
assert.equal(overlayHasRealClocks(untimedCredits), false);

const replaced = merge1001Plays(untimedCredits, realEight);
assert.equal(replaced.length, 8);
assert.equal(replaced[1]?.timestamp, 187);
assert.equal(replaced[1]?.provenance, "1001tl");

const filled = merge1001Plays(untimedCredits, evenEight);
assert.ok(
  filled.some((p) => p.provenance === "youtube"),
  "evenly spaced clocks do not replace a YouTube credit stub",
);

console.log("tracklists1001/seeds.merge.test.ts ok");
