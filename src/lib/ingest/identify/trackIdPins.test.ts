import assert from "node:assert/strict";
import { canonicalBeatportUrl, normalizeIsrc } from "../../trackMeta";
import {
  beatportSlugMatchesTitle,
  deezerConfirmsProposal,
  evaluateTrackIdPin,
  isJunkTrackPin,
  loadTrackIdPins,
  mergeTrackIdPins,
  pinCoversNeed,
  slugMatchesLive,
} from "./trackIdPins";

assert.equal(isJunkTrackPin({ slug: "youtube-biscits", artist: "Youtube", title: "@Biscits" }), true);
assert.equal(isJunkTrackPin({ slug: "convex-id", artist: "Convex", title: "ID" }), true);
assert.equal(
  isJunkTrackPin({
    slug: "00-00-05-30-makebo-na-zare-05-30-09-30-sis-tura",
    artist: "Makebo",
    title: "Na Zare",
  }),
  true,
);
assert.equal(
  isJunkTrackPin({
    slug: "ferry-corsten-connect-intro-edit-flashover",
    artist: "Ferry Corsten",
    title: "Connect (Intro Edit) [Flashover]",
  }),
  false,
);

assert.equal(
  beatportSlugMatchesTitle(
    "https://www.beatport.com/track/connect/17595139",
    "Connect (Intro Edit) [Flashover]",
  ),
  true,
);
assert.equal(
  beatportSlugMatchesTitle(
    "https://www.beatport.com/track/9-pm-till-i-come/18448254",
    "9PM (Till I Come) (James Hype Edit)",
  ),
  true,
);
assert.equal(
  beatportSlugMatchesTitle(
    "https://www.beatport.com/track/you-and-me/18975299",
    "You & Me (Flume Remix / Westend & Local Singles Edit)",
  ),
  true,
);
assert.equal(
  beatportSlugMatchesTitle(
    "https://www.beatport.com/track/move-feat-malachiii/1",
    "Move (Jezza & Jod Edit)",
  ),
  true,
);
assert.equal(
  beatportSlugMatchesTitle(
    "https://www.beatport.com/track/let-this-last-forever-feat-gary-go/1",
    "GO (It's Time To Go If You Don't Dig Techno Acappella)",
  ),
  false,
);
assert.equal(
  beatportSlugMatchesTitle(
    "https://www.beatport.com/track/unrelated-song/1",
    "Connect",
  ),
  false,
);
assert.equal(
  beatportSlugMatchesTitle("https://www.beatport.com/search?q=connect", "Connect"),
  false,
);

assert.equal(
  deezerConfirmsProposal(
    { artist: "Steve Aoki", title: "Weirder Things (Lucas & Steve Remix)", isrc: "USA2P2570495" },
    { artist: "Steve Aoki", title: "Weirder Things", isrc: "USA2P2570495" },
  ),
  true,
);
assert.equal(
  deezerConfirmsProposal(
    { artist: "Steve Aoki", title: "Weirder Things", isrc: "USA2P2570495" },
    { artist: "Steve Aoki", title: "Weirder Things", isrc: "USUM70000000" },
  ),
  false,
);

const ok = evaluateTrackIdPin(
  {
    slug: "steve-aoki-weirder-things-lucas-steve-remix",
    artist: "Steve Aoki",
    title: "Weirder Things (Lucas & Steve Remix)",
    isrc: "USA2P2570495",
    beatportUrl: "https://www.beatport.com/track/weirder-things/26745003",
  },
  { artist: "Steve Aoki", title: "Weirder Things", isrc: "USA2P2570495" },
);
assert.equal(ok.ok, true);
assert.equal(ok.pin?.beatportUrl, "https://www.beatport.com/track/weirder-things/26745003");
assert.equal(ok.pin?.isrc, "USA2P2570495");

const withSpotify = evaluateTrackIdPin(
  {
    slug: "steve-aoki-weirder-things-lucas-steve-remix",
    artist: "Steve Aoki",
    title: "Weirder Things (Lucas & Steve Remix)",
    isrc: "USA2P2570495",
    spotifyUrl: "https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P",
  },
  { artist: "Steve Aoki", title: "Weirder Things", isrc: "USA2P2570495" },
);
assert.equal(
  withSpotify.pin?.spotifyUrl,
  "https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P",
);

assert.equal(
  evaluateTrackIdPin(
    {
      slug: "ferry-corsten-connect-intro-edit-flashover",
      artist: "Ferry Corsten",
      title: "Connect (Intro Edit) [Flashover]",
      isrc: "NLQ882300006",
      beatportUrl: "https://www.beatport.com/track/connect/17595139",
    },
    null,
  ).ok,
  false,
);

assert.equal(
  slugMatchesLive("ferry-corsten-connect-intro-edit-flashover", {
    artist: "Ferry Corsten",
    title: "Connect",
  }),
  true,
);
assert.equal(
  slugMatchesLive("ferry-corsten-connect-intro-edit-flashover", {
    artist: "Tiësto",
    title: "Adagio for Strings",
  }),
  false,
);

const slugOnly = evaluateTrackIdPin(
  {
    slug: "da-hool-meet-her-at-the-love-parade",
    artist: "",
    title: "",
    isrc: "DEB569701001",
  },
  { artist: "Da Hool", title: "Meet Her At The Love Parade", isrc: "DEB569701001" },
);
assert.equal(slugOnly.ok, true);
assert.equal(slugOnly.pin?.isrc, "DEB569701001");

const pins = loadTrackIdPins();
assert.ok(pins.length >= 200);
for (const pin of pins) {
  if (pin.beatportUrl) {
    assert.equal(canonicalBeatportUrl(pin.beatportUrl), pin.beatportUrl);
  }
  if (pin.isrc) {
    assert.equal(normalizeIsrc(pin.isrc), pin.isrc);
  }
}
assert.equal(
  pins.some((p) => p.beatportUrl === "https://www.beatport.com/track/bayside/24369290"),
  false,
);

const merged = mergeTrackIdPins(
  [{ slug: "artist-song", isrc: "USUM70000000" }],
  [
    {
      slug: "artist-song",
      beatportUrl: "https://www.beatport.com/track/song/1",
    },
    { slug: "artist-song", isrc: "GBAAA0000000" },
  ],
);
assert.equal(merged.length, 1);
assert.equal(merged[0]!.isrc, "USUM70000000");
assert.equal(merged[0]!.beatportUrl, "https://www.beatport.com/track/song/1");
assert.equal(
  pinCoversNeed(merged[0], { wantIsrc: true, wantBeatport: true }),
  true,
);
assert.equal(
  pinCoversNeed({ slug: "artist-song", isrc: "USUM70000000" }, { wantBeatport: true }),
  false,
);
