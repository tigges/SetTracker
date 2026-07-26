import assert from "node:assert/strict";
import { beatportSearchUrl, parseTrackTitle } from "./trackMeta";

const remix = parseTrackTitle("Pressure (Marten Horger Remix)");
assert.equal(remix.remixerName, "Marten Horger");
assert.equal(remix.mixName, "Marten Horger Remix");

const ext = parseTrackTitle("Night Ride (Extended Mix)");
assert.equal(ext.mixName, "Extended Mix");
assert.equal(ext.remixerName, null);

const trail = parseTrackTitle("Bassline - Original Mix");
assert.equal(trail.mixName, "Original Mix");

const plain = parseTrackTitle("Just A Title");
assert.equal(plain.mixName, null);
assert.equal(plain.remixerName, null);

const bp = beatportSearchUrl("Pressure", "AC Slater");
assert.ok(bp.includes("beatport.com/search"));
assert.ok(bp.includes("AC"));

console.log("trackMeta.test.ts ok");
