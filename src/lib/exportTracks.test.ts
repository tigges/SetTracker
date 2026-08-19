import assert from "node:assert/strict";
import {
  CLAUDE_TRACK_ID_PROMPT,
  csvEscape,
  needsBeatportOrIsrc,
  needsTrackId,
  parseTracksCsv,
  trackToClaudeJsonl,
  trackToCsvRow,
  tracksNeedEnrich,
  tracksNeedId,
  tracksToClaudeJsonl,
  tracksToCsv,
  type ExportTrackRow,
} from "./exportTracks";

assert.equal(csvEscape("ok"), "ok");
assert.equal(csvEscape('a "b"'), '"a ""b"""');
assert.equal(csvEscape("a,b"), '"a,b"');
assert.equal(csvEscape(null), "");
assert.equal(csvEscape(12), "12");

const identified: ExportTrackRow = {
  slug: "artist-song",
  artist: "Artist",
  title: "Song",
  mix: "Extended Mix",
  remixer: null,
  genre: "House",
  plays: 3,
  isrc: "USUM70000000",
  beatportUrl: "https://www.beatport.com/track/song/1",
};
const held: ExportTrackRow = {
  slug: "held-id",
  artist: "Held",
  title: "ID",
  mix: null,
  remixer: null,
  genre: null,
  plays: 9,
  isrc: null,
  beatportUrl: null,
};

assert.equal(needsTrackId(identified), false);
assert.equal(needsTrackId(held), true);
assert.equal(needsBeatportOrIsrc(identified), false);
assert.equal(needsBeatportOrIsrc({ ...identified, beatportUrl: null }), true);
assert.deepEqual(
  tracksNeedEnrich([
    identified,
    { ...identified, slug: "has-isrc", beatportUrl: null, plays: 4 },
    held,
  ]).map((r) => r.slug),
  ["held-id", "has-isrc"],
);
assert.equal(parseTracksCsv(tracksToCsv([identified, held])).length, 2);
assert.equal(parseTracksCsv(tracksToCsv([identified, held]))[1]!.slug, "held-id");
assert.deepEqual(tracksNeedId([identified, held]).map((r) => r.slug), [
  "held-id",
]);

const csv = tracksToCsv([identified]);
assert.match(csv, /^slug,artist,title/);
assert.match(csv, /Artist,Song,Extended Mix/);
assert.equal(trackToCsvRow(held).split(",")[7], "");

const line = trackToClaudeJsonl(held);
assert.equal(JSON.parse(line).slug, "held-id");
assert.equal(JSON.parse(line).plays, 9);
assert.equal("isrc" in JSON.parse(line), false);

const jsonl = tracksToClaudeJsonl([identified, held]);
assert.equal(jsonl.trim().split("\n").length, 1);

assert.match(CLAUDE_TRACK_ID_PROMPT, /Never invent an ISRC/);
assert.match(CLAUDE_TRACK_ID_PROMPT, /1001/);

console.log("exportTracks.test.ts ok");
