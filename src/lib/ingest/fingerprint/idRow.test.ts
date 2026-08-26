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

// Herrlich's real paste: 15 rows, every gap exactly 237s.
const evenSpaced = [
  "0:20","4:17","8:14","12:11","16:08","20:05","24:02","27:59","31:56",
  "35:53","39:50","43:47","47:44","51:41","55:38",
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

// A long uniform *run* inside a mixed list is still generated, not observed:
// NERVO's paste was 195s x 10 then ~50s x 32 (an even division that rounds).
import { longestUniformClockRun } from "./seeds";

const nervoish = [
  "0:00","3:15","6:30","9:45","13:00","16:15","19:30","22:45","26:00","29:15",
  "32:30","33:21","34:12","35:03","35:54","36:45","37:36","38:27","39:18",
  "40:09","40:59","41:50","42:40","43:31","44:21",
].map((at, i) => ({ at, artist: `A${i}`, title: `T${i}` }));
assert.equal(hasEvenlySpacedClocks(nervoish), true, "uniform run is generated");
assert.ok(longestUniformClockRun(nervoish).run >= 9);

// 50/51 alternation counts as uniform — rounding, not observation.
const rounded = ["0:00","0:50","1:41","2:31","3:22","4:12","5:03","5:53","6:44"]
  .map((at, i) => ({ at, artist: `A${i}`, title: `T${i}` }));
assert.equal(hasEvenlySpacedClocks(rounded), true, "±1s is still even spacing");

// A short mashup cluster must not trip it — HI-LO opens with 5 equal gaps.
const mashupCluster = [
  "0:12","0:56","1:41","2:25","3:10","3:54","7:27","11:00","15:20","19:40",
  "24:00","28:29","29:24","30:18","31:13",
].map((at, i) => ({ at, artist: `A${i}`, title: `T${i}` }));
assert.equal(
  hasEvenlySpacedClocks(mashupCluster),
  false,
  "a real mix with a short equal run stays clean",
);

console.log("uniformRun checks ok");
