/**
 * 1001 writes "ID" in the artist column when the artist is unknown but the
 * title is not. That must never become an act called ID, and must never be
 * called identified.
 */
import assert from "node:assert/strict";
import { fingerprintRowsToPlays } from "./seeds";

const plays = fingerprintRowsToPlays([
  { at: "0:12", artist: "Reinier Zonneveld", title: "Acid Incident" },
  { at: "46:00", artist: "ID", title: "Feels Like Holiday" },
  { at: "47:25", artist: "id", title: "Lowercase Marker" },
  { at: "48:50", artist: "IDLES", title: "Not A Marker" },
  { at: "50:00", artist: "Skrillex", title: "Rumble (ID Remix)" },
]);

assert.equal(plays.length, 5);

const known = plays[0]!;
assert.equal(known.idStatus, "identified");
assert.equal(known.artistName, "Reinier Zonneveld");

for (const p of [plays[1]!, plays[2]!]) {
  assert.equal(p.idStatus, "unresolved_id", "a bare ID artist is not identified");
  assert.equal(p.artistName, undefined, "never store an act called ID");
  assert.ok(p.trackTitle, "the known title is kept");
}
assert.equal(plays[1]!.trackTitle, "Feels Like Holiday");
// rawText keeps the original paste so the capture stays auditable.
assert.equal(plays[1]!.rawText, "ID - Feels Like Holiday");

// A real act whose name merely contains "ID" is untouched.
assert.equal(plays[3]!.idStatus, "identified");
assert.equal(plays[3]!.artistName, "IDLES");
// "(ID Remix)" in a title is an unknown remixer, not an unknown artist.
assert.equal(plays[4]!.idStatus, "identified");
assert.equal(plays[4]!.artistName, "Skrillex");

// Two consecutive unknown-artist rows with the same title still collapse.
const dupes = fingerprintRowsToPlays([
  { at: "1:00", artist: "ID", title: "Same Title" },
  { at: "2:00", artist: "ID", title: "Same Title" },
]);
assert.equal(dupes.length, 1, "consecutive duplicates collapse as before");

console.log("idRow.test.ts ok");

// Even-spaced clocks are `evenlySpaceRows` output: order real, times not.
import { hasEvenlySpacedClocks } from "./seeds";

const evenSpaced = [
  "0:20","4:17","8:14","12:11","16:08","20:05","24:02","27:59",
].map((at, i) => ({ at, artist: `A${i}`, title: `T${i}` }));
assert.equal(hasEvenlySpacedClocks(evenSpaced), true, "237s apart every time");

const realMix = [
  "0:12","0:48","1:24","2:00","12:34","15:41","18:47","23:37","29:14",
].map((at, i) => ({ at, artist: `A${i}`, title: `T${i}` }));
assert.equal(hasEvenlySpacedClocks(realMix), false, "a real mix varies");

// Too short to judge, and non-monotonic clocks, are both left alone.
assert.equal(
  hasEvenlySpacedClocks(
    ["0:20", "4:17", "8:14"].map((at, i) => ({ at, artist: "A", title: `T${i}` })),
  ),
  false,
);
assert.equal(
  hasEvenlySpacedClocks(
    ["0:20", "0:20", "4:17", "8:14", "12:11", "16:08", "20:05", "24:02"].map(
      (at, i) => ({ at, artist: "A", title: `T${i}` }),
    ),
  ),
  false,
  "a repeated clock is not even spacing",
);

console.log("evenSpacing checks ok");
