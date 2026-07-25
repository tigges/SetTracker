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

console.log("parseTracklist.test.ts ok");
