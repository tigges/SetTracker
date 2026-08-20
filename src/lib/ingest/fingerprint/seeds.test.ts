import assert from "node:assert/strict";
import {
  fingerprintRowsToPlays,
  FP_JAMES_HYPE_GET_CLOSER_LONDON,
  FP_JAMES_HYPE_GET_CLOSER_LONDON_2,
  FP_KEINEMUSIK_RADIO_FIFI_20260807,
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

const fifi = fingerprintRowsToPlays(FP_KEINEMUSIK_RADIO_FIFI_20260807);
assert.equal(fifi.length, 11);
assert.equal(fifi[0]!.provenance, "fingerprint");
assert.equal(fifi[0]!.timestamp, 30);
assert.equal(fifi[0]!.trackTitle, "Someone Gotta Found Love (feat. Kim Mazelle) (Alone Mix)");
assert.equal(fifi[10]!.trackTitle, "Se Eu Cantar");
assert.equal(fifi[10]!.timestamp, 56 * 60);
for (let i = 1; i < fifi.length; i++) {
  assert.ok(
    (fifi[i]!.timestamp ?? 0) > (fifi[i - 1]!.timestamp ?? 0),
    `FIFI ACR clocks must increase at index ${i}`,
  );
}

// consecutive dup drop — including minutes-apart fingerprint re-hits
const deduped = fingerprintRowsToPlays([
  { at: "01:00", artist: "A", title: "T" },
  { at: "01:10", artist: "A", title: "T" },
  { at: "05:00", artist: "A", title: "T" },
  { at: "06:00", artist: "B", title: "U" },
  { at: "55:00", artist: "A", title: "T" },
]);
assert.equal(deduped.length, 3);
assert.equal(deduped[0]!.timestamp, 60);
assert.equal(deduped[1]!.trackTitle, "U");
assert.equal(deduped[2]!.timestamp, 55 * 60);

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
