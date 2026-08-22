import assert from "node:assert/strict";
import {
  beatportBuyability,
  beatportCoverage,
  beatportSearchUrl,
  beatportTrackHref,
  bandcampSearchUrl,
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  discogsSearchUrl,
  isLikelyUnbuyable,
  normalizeIsrc,
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

assert.equal(normalizeIsrc("gb-xxx-00-00001"), "GBXXX0000001");
assert.equal(normalizeIsrc("GBXXX0000001"), "GBXXX0000001");
assert.equal(normalizeIsrc("not-an-isrc"), null);
assert.equal(normalizeIsrc(""), null);

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
  canonicalBeatportUrl("https://www.beatport.com/artist/ac-slater/1"),
  null,
);

assert.equal(
  canonicalSpotifyUrl("https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL?si=x"),
  "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
);
assert.equal(canonicalSpotifyUrl("https://open.spotify.com/search/Pressure"), null);
assert.ok(discogsSearchUrl("Pressure", "AC Slater").includes("discogs.com/search"));
assert.ok(bandcampSearchUrl("Pressure", "AC Slater").includes("bandcamp.com/search"));

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

assert.equal(isLikelyUnbuyable("Mash-Up Universe", "DJs From Mars"), true);
assert.equal(isLikelyUnbuyable("Pressure", "AC Slater"), false);

assert.equal(
  beatportBuyability({
    idStatus: "identified",
    title: "Mashup Bootleg",
    beatportUrl: "https://www.beatport.com/track/pressure/1",
  }),
  "buy",
);
assert.equal(
  beatportBuyability({
    idStatus: "identified",
    title: "Pressure",
    artistName: "AC Slater",
  }),
  "search",
);
assert.equal(
  beatportBuyability({
    idStatus: "identified",
    title: "VIP Mashup",
    artistName: "Someone",
  }),
  "unavailable",
);
assert.equal(
  beatportBuyability({
    idStatus: "unresolved_id",
    title: "ID",
  }),
  "unavailable",
);

const coverage = beatportCoverage([
  {
    idStatus: "identified",
    title: "Pressure",
    beatportUrl: "https://www.beatport.com/track/pressure/1",
  },
  { idStatus: "identified", title: "Rave" },
  { idStatus: "unresolved_id", title: "ID" },
  {
    idStatus: "community_resolved",
    title: "Freed from Desire",
    beatportUrl: "https://www.beatport.com/track/freed/2",
  },
]);
assert.equal(coverage.identified, 3);
assert.equal(coverage.buyable, 2);

console.log("trackMeta.test.ts ok");
