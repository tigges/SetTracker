import assert from "node:assert/strict";
import { extractSocialLinksFromText } from "../youtube/client";
import {
  isArtistOwnedChannel,
  venueYoutubeHandles,
} from "./catalogYtSocials";

const venues = venueYoutubeHandles();
assert.ok(venues.has("@boilerroom"));
assert.ok(venues.has("@tomorrowland"));
assert.ok(venues.has("@umftv"));

assert.equal(
  isArtistOwnedChannel({
    djName: "Afrojack",
    djSlug: "afrojack",
    channelName: "Afrojack",
    channelHandle: "@afrojack",
  }),
  true,
);

assert.equal(
  isArtistOwnedChannel({
    djName: "Martin Garrix",
    djSlug: "martin-garrix",
    channelName: "Tomorrowland",
    channelHandle: "@Tomorrowland",
  }),
  false,
);

assert.equal(
  isArtistOwnedChannel({
    djName: "Marten Horger",
    djSlug: "marten-horger",
    channelName: "PAROOKAVILLE",
    channelHandle: "@parookaville",
  }),
  false,
);

assert.equal(
  isArtistOwnedChannel({
    djName: "James Hype",
    djSlug: "james-hype",
    channelName: "James Hype",
    channelHandle: "@jameshype",
  }),
  true,
);

const links = extractSocialLinksFromText(`
AFROJACK LIVE @ ULTRA MUSIC FESTIVAL MIAMI 2026
Tracklist: https://1001.tl/22r0yk79
Connect with AFROJACK:
Website: https://www.afrojack.com
YouTube: /afrojacktv
Soundcloud: /afrojack
Instagram: @afrojack
Twitter: /afrojack
`);
assert.ok(links.some((l) => /afrojack\.com/i.test(l)));
assert.ok(links.some((l) => /soundcloud\.com\/afrojack/i.test(l)));
assert.ok(links.some((l) => /instagram\.com\/afrojack/i.test(l)));
assert.ok(links.some((l) => /x\.com\/afrojack|twitter\.com\/afrojack/i.test(l)));
assert.ok(links.some((l) => /youtube\.com\/@afrojacktv/i.test(l)));

// Plain @handle labels (previously only slash form worked for YT).
const atLabel = extractSocialLinksFromText(`
Connect:
YouTube: @westend
YT: @westendmusic
youtube.com/@itsthewestend
Find me YouTube @bonuschannel
`);
assert.ok(
  atLabel.some((l) => /youtube\.com\/@westend$/i.test(l.replace(/\/$/, ""))),
  `expected YouTube: @westend, got ${JSON.stringify(atLabel)}`,
);
assert.ok(
  atLabel.some((l) => /youtube\.com\/@westendmusic/i.test(l)),
  `expected YT: @westendmusic, got ${JSON.stringify(atLabel)}`,
);
assert.ok(
  atLabel.some((l) => /youtube\.com\/@itsthewestend/i.test(l)),
  `expected bare youtube.com/@…, got ${JSON.stringify(atLabel)}`,
);
assert.ok(
  atLabel.some((l) => /youtube\.com\/@bonuschannel/i.test(l)),
  `expected YouTube @bonuschannel, got ${JSON.stringify(atLabel)}`,
);

import { buildSocialMatrix } from "./socialMatrix";
const matrix = buildSocialMatrix({
  links: [
    "https://www.youtube.com/c/WestendOfficial",
    "https://www.youtube.com/user/oldvanity",
  ],
});
assert.equal(matrix.youtube, "https://www.youtube.com/c/WestendOfficial");

console.log("catalogYtSocials.test.ts ok");
