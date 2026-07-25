import assert from "node:assert/strict";
import { parseDescriptionTracklist } from "./parseTracklist";

const timed = `
Set vibes
[0:00] Artist One - Track A
[6:12] Artist Two - Track B
[12:30] Artist Three - ID
Follow me on Instagram
`;
const timedPlays = parseDescriptionTracklist(timed, 3600);
assert.equal(timedPlays.length, 3);
assert.equal(timedPlays[0].timestamp, 0);
assert.equal(timedPlays[1].timestamp, 6 * 60 + 12);
assert.equal(timedPlays[2].idStatus, "unresolved_id");

const untimed = `
Artist One - Track A
Artist Two - Track B
https://soundcloud.com/foo
`;
const untimedPlays = parseDescriptionTracklist(untimed, 3600);
assert.equal(untimedPlays.length, 2);
assert.equal(untimedPlays[0].trackTitle, "Track A");

const empty = parseDescriptionTracklist("Just a vibe dump with no tracklist", 3600);
assert.equal(empty.length, 0);

const numbered = parseDescriptionTracklist(
  `01 | Intro - berlin city
02 | Thomas Tonfeld - Die Straßen
03 | Jonny Bee - Flowers And Flawors (Original Mix)`,
  3600,
  "hearthis",
);
assert.equal(numbered.length, 3);
assert.equal(numbered[1].artistName, "Thomas Tonfeld");
assert.equal(numbered[0].provenance, "hearthis");

const cercle = parseDescriptionTracklist(
  `Max Richter live
TRACKLIST
00:00:00 They Will Shade Us With Their Wings
00:09:41 Life Study 1
00:10:19 A Colour Field (Holocene)
JOIN THE CERCLE COMMUNITY
➤ Website: https://cercle.io`,
  3600,
  "youtube",
);
assert.equal(cercle.length, 3);
assert.equal(cercle[0].trackTitle, "They Will Shade Us With Their Wings");
assert.equal(cercle[0].timestamp, 0);
assert.equal(cercle[1].timestamp, 9 * 60 + 41);
assert.equal(cercle[0].provenance, "youtube");

const james = parseDescriptionTracklist(
  `Tracklist:
0:00 Technotronic - Pump Up The Jam
2:05 James Hype, Tita Lau - Mama Said
4:53 DJ Chus - That Feeling`,
  2700,
  "youtube",
);
assert.equal(james.length, 3);
assert.equal(james[0].artistName, "Technotronic");
assert.equal(james[1].timestamp, 2 * 60 + 5);

console.log("parseTracklist.test.ts ok");
