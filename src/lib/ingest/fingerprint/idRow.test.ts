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
