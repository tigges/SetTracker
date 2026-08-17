import assert from "node:assert/strict";
import {
  beatportSearchUrl,
  beatportTrackHref,
  canonicalBeatportUrl,
  parseTrackTitle,
  resolveBeatportUrl,
  trackIdentityKey,
} from "./trackMeta";

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
assert.ok(bp.includes("beatport.com/search/tracks?q="));
assert.ok(bp.includes("AC"));

assert.equal(
  canonicalBeatportUrl("https://www.beatport.com/track/pressure/12345"),
  "https://www.beatport.com/track/pressure/12345",
);
assert.equal(
  canonicalBeatportUrl("https://beatport.com/track/pressure/12345?foo=1"),
  "https://www.beatport.com/track/pressure/12345",
);
assert.equal(
  canonicalBeatportUrl("https://www.beatport.com/search?q=Pressure"),
  null,
);
assert.equal(
  canonicalBeatportUrl("https://www.beatport.com/search/tracks?q=Pressure"),
  null,
);

assert.equal(
  beatportTrackHref(
    "Pressure",
    "AC Slater",
    "https://www.beatport.com/track/pressure/12345",
  ),
  "https://www.beatport.com/track/pressure/12345",
);
assert.ok(
  beatportTrackHref("Pressure", "AC Slater", null).includes("search/tracks"),
);

assert.equal(
  trackIdentityKey("Utopia", "Walker & Royce") ===
    trackIdentityKey("utopia", "walker & royce"),
  true,
);
const catalog = new Map([
  [
    trackIdentityKey("Utopia", "Walker & Royce"),
    "https://www.beatport.com/track/utopia/9",
  ],
]);
assert.equal(
  resolveBeatportUrl(null, "Utopia", "Walker & Royce", catalog),
  "https://www.beatport.com/track/utopia/9",
);

console.log("trackMeta.test.ts ok");
