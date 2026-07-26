import assert from "node:assert/strict";
import {
  fingerprintRowsToPlays,
  FP_JAMES_HYPE_GET_CLOSER_LONDON,
  FP_JAMES_HYPE_GET_CLOSER_LONDON_2,
  mergeFingerprintPlays,
  parseClockToSec,
} from "./seeds";
import type { RawPlay } from "../types";

assert.equal(parseClockToSec("00:31"), 31);
assert.equal(parseClockToSec("12:44"), 12 * 60 + 44);
assert.equal(parseClockToSec("1:02:03"), 3723);
assert.equal(parseClockToSec("bad"), null);

const plays = fingerprintRowsToPlays(FP_JAMES_HYPE_GET_CLOSER_LONDON);
assert.ok(plays.length >= 20);
assert.equal(plays[0]!.provenance, "fingerprint");
assert.equal(plays[0]!.idStatus, "identified");
assert.equal(plays[0]!.timestamp, 31);
assert.ok(plays.some((p) => /Lose Control/i.test(p.trackTitle || "")));
assert.ok(plays.some((p) => /Dom Dolla Remix/i.test(p.trackTitle || "")));

const plays2 = fingerprintRowsToPlays(FP_JAMES_HYPE_GET_CLOSER_LONDON_2);
assert.ok(plays2.length >= 15);
assert.equal(plays2[0]!.timestamp, 60);
assert.ok(plays2.some((p) => /Drums/i.test(p.trackTitle || "")));
assert.ok(plays2.some((p) => p.trackTitle === "Wild"));
assert.ok(!plays2.some((p) => /getting rich/i.test(p.trackTitle || "")));
assert.ok(!plays2.some((p) => /Jatt Tera/i.test(p.trackTitle || "")));

// consecutive dup drop
const deduped = fingerprintRowsToPlays([
  { at: "01:00", artist: "A", title: "T" },
  { at: "01:10", artist: "A", title: "T" },
  { at: "02:00", artist: "B", title: "U" },
]);
assert.equal(deduped.length, 2);

const sparse: RawPlay[] = [
  {
    position: 1,
    timestamp: 0,
    idStatus: "unparsed",
    provenance: "youtube",
    rawText: "promo",
  },
];
const merged = mergeFingerprintPlays(sparse, plays);
assert.ok(merged.length >= 20);
assert.ok(merged.every((p) => p.position >= 1));

console.log("fingerprint/seeds.test.ts ok");
