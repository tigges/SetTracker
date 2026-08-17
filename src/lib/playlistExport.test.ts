import assert from "node:assert/strict";
import {
  buildBeatportUrlList,
  buildTracklistCsv,
  buildTracklistM3u,
  buildTracklistPlain,
  exportTimestamp,
  exportablePlays,
  spotifySearchUrl,
  trackDisplayLine,
} from "./playlistExport";

const plays = [
  {
    position: 1,
    timestamp: 0,
    title: "Pressure",
    artistName: "AC Slater",
    bpm: 128,
    musicalKey: "A min",
    trackDurationSec: 360,
    beatportUrl: "https://www.beatport.com/track/pressure/1",
    idStatus: "identified",
  },
  {
    position: 2,
    timestamp: 125,
    title: "ID",
    artistName: null,
    bpm: null,
    musicalKey: null,
    trackDurationSec: null,
    beatportUrl: null,
    idStatus: "unresolved_id",
  },
  {
    position: 3,
    timestamp: 400,
    title: "Rave",
    artistName: "Biscits",
    bpm: null,
    musicalKey: null,
    trackDurationSec: null,
    beatportUrl: null,
    idStatus: "community_resolved",
  },
];

assert.equal(exportTimestamp(125), "02:05");
assert.equal(trackDisplayLine(plays[0]), "AC Slater - Pressure");
assert.equal(exportablePlays(plays).length, 2);

const plain = buildTracklistPlain(plays);
assert.ok(plain.includes("AC Slater - Pressure"));
assert.ok(plain.includes("Biscits - Rave"));
assert.ok(!plain.includes("\nID\n"));

const csv = buildTracklistCsv(plays, { title: "Test Set", slug: "test-set" });
assert.ok(csv.startsWith("position,cue,artist,title"));
assert.ok(csv.includes("AC Slater"));
assert.ok(csv.includes("00:00"));
assert.ok(csv.includes(spotifySearchUrl("Pressure", "AC Slater")));

const m3u = buildTracklistM3u(plays, {
  title: "Test Set",
  slug: "test-set",
  artistLine: "AC Slater",
});
assert.ok(m3u.includes("#EXTM3U"));
assert.ok(m3u.includes("#EXTINF:360,AC Slater - Pressure"));
assert.ok(m3u.includes("# setradar-cue:00:00"));

const bp = buildBeatportUrlList(plays);
assert.ok(bp.includes("https://www.beatport.com/track/pressure/1"));
assert.ok(bp.includes("beatport.com/search/tracks?q="));

assert.ok(
  spotifySearchUrl("Pressure", "AC Slater").startsWith(
    "https://open.spotify.com/search/",
  ),
);

console.log("playlistExport.test.ts ok");
