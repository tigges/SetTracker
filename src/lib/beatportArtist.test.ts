import assert from "node:assert/strict";
import {
  canonicalBeatportArtistUrl,
  extractBeatportArtistUrl,
  resolveDjBeatport,
} from "./beatportArtist";

assert.equal(
  canonicalBeatportArtistUrl(
    "https://www.beatport.com/artist/ac-slater/52351?foo=1",
  ),
  "https://www.beatport.com/artist/ac-slater/52351",
);
assert.equal(
  canonicalBeatportArtistUrl("https://www.beatport.com/track/connect/1"),
  null,
);
assert.equal(
  canonicalBeatportArtistUrl("https://www.beatport.com/search?q=ac"),
  null,
);

assert.equal(
  extractBeatportArtistUrl("Bass House. Beatport artist/ac-slater/52351."),
  "https://www.beatport.com/artist/ac-slater/52351",
);
assert.equal(
  extractBeatportArtistUrl("https://www.beatport.com/artist/biscits/591990"),
  "https://www.beatport.com/artist/biscits/591990",
);

assert.equal(
  resolveDjBeatport({
    website: "https://www.beatport.com/artist/biscits/591990",
  }),
  "https://www.beatport.com/artist/biscits/591990",
);
assert.equal(
  resolveDjBeatport({
    beatport: "https://www.beatport.com/artist/bart-skils/16211",
    website: "https://linktr.ee/bartskils",
  }),
  "https://www.beatport.com/artist/bart-skils/16211",
);
assert.equal(
  resolveDjBeatport({
    beatport: "https://www.beatport.com/artist/bullet-tooth/1146765",
    website: null,
  }),
  "https://www.beatport.com/artist/bullet-tooth/1146765",
);
assert.equal(
  resolveDjBeatport({
    bio: "Bass House. Beatport artist/ac-slater/52351.",
    website: "https://www.djacslater.com/",
  }),
  "https://www.beatport.com/artist/ac-slater/52351",
);
