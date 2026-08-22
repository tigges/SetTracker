import assert from "node:assert/strict";
import { canonicalSpotifyUrl } from "../../trackMeta";
import { evaluateSpotifyHit, spotifyConfigured } from "./spotify";

assert.equal(
  canonicalSpotifyUrl("https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL"),
  "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
);
assert.equal(
  canonicalSpotifyUrl(
    "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL?si=abc",
  ),
  "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
);
assert.equal(
  canonicalSpotifyUrl("https://open.spotify.com/search/Pressure"),
  null,
);
assert.equal(
  canonicalSpotifyUrl("https://open.spotify.com/album/3DIHvKefIFuwaeUrbqGO1F"),
  null,
);
assert.equal(
  canonicalSpotifyUrl("https://open.spotify.com/track/short"),
  null,
);

assert.equal(
  evaluateSpotifyHit(
    { artist: "Zedd ft. Jon Bellion", title: "Beautiful Now", isrc: "USUM71502634" },
    { artist: "Zedd", title: "Beautiful Now", isrc: "USUM71502634" },
  ),
  true,
);
assert.equal(
  evaluateSpotifyHit(
    { artist: "Zedd", title: "Beautiful Now", isrc: "USUM71502634" },
    { artist: "Zedd", title: "Beautiful Now", isrc: "GBAAA0000000" },
  ),
  false,
);
assert.equal(
  evaluateSpotifyHit(
    { artist: "Zedd", title: "Beautiful Now" },
    { artist: "Coldplay", title: "Beautiful Now" },
  ),
  false,
);
assert.equal(
  evaluateSpotifyHit(
    { artist: "Zedd", title: "Beautiful Now" },
    { artist: "Zedd", title: "Beautiful Now" },
  ),
  true,
);

assert.equal(spotifyConfigured({ SPOTIFY: "0", SPOTIFY_CLIENT_ID: "x", SPOTIFY_CLIENT_SECRET: "y" }), false);
assert.equal(spotifyConfigured({ SPOTIFY_CLIENT_ID: "x", SPOTIFY_CLIENT_SECRET: "y" }), true);
assert.equal(spotifyConfigured({}), false);

console.log("identify/spotify.test.ts ok");
