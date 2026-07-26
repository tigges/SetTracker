import assert from "node:assert/strict";
import {
  acrSignature,
  mapAcrMusicHit,
  planGapProbes,
  rankPlaybackHost,
} from "./acrcloud";

// --- signature ---
const sig = acrSignature("key", "secret", "1710000000");
assert.equal(typeof sig, "string");
assert.ok(sig.length > 10);
// deterministic
assert.equal(acrSignature("key", "secret", "1710000000"), sig);
assert.notEqual(acrSignature("key", "other", "1710000000"), sig);

// --- map hit ---
const hit = mapAcrMusicHit({
  title: "Hello",
  score: 92,
  label: "XL",
  artists: [{ name: "Adele" }],
  external_ids: { isrc: "GBXXXX000000" },
});
assert.ok(hit);
assert.equal(hit!.artist, "Adele");
assert.equal(hit!.title, "Hello");
assert.equal(hit!.score, 92);
assert.equal(hit!.isrc, "GBXXXX000000");

assert.equal(mapAcrMusicHit({ title: "x" }), null);
assert.equal(mapAcrMusicHit(null), null);

// junk artist rejected
assert.equal(
  mapAcrMusicHit({ title: "Track", artists: [{ name: "Click here" }], score: 99 }),
  null,
);

// --- host ranking ---
assert.equal(rankPlaybackHost("soundcloud", false), 0);
assert.equal(rankPlaybackHost("hearthis", false), 1);
assert.equal(rankPlaybackHost("youtube", false), null);
assert.equal(rankPlaybackHost("youtube", true), 2);
assert.equal(rankPlaybackHost(null, true), null);

// --- gap probes ---
const plans = planGapProbes(
  600,
  [
    { timestamp: 90, provenance: "soundcloud", idStatus: "identified" },
    { timestamp: 360, provenance: "fingerprint", idStatus: "identified" },
  ],
  90,
  12,
);
assert.ok(plans.length >= 4);
assert.deepEqual(
  plans.map((p) => p.offsetSec).slice(0, 4),
  [90, 180, 270, 360],
);
assert.equal(plans[0]!.isGap, false, "SC play blocks 90s probe");
assert.equal(plans[1]!.isGap, true, "open slot at 180s");
assert.equal(plans[3]!.isGap, false, "fingerprint play blocks 360s");

// strong provenance blocks even when status is unparsed
const open = planGapProbes(
  400,
  [{ timestamp: 90, provenance: "soundcloud", idStatus: "unparsed" }],
  90,
  12,
);
const at90 = open.find((p) => p.offsetSec === 90);
assert.ok(at90);
assert.equal(at90!.isGap, false);

console.log("acrcloud.test.ts ok");
