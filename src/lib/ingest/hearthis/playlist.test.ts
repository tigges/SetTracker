import assert from "node:assert/strict";
import {
  formatHearthisCue,
  playlistEntriesToPlays,
} from "./playlist";
import type { HtPlaylistEntry } from "./client";

assert.equal(formatHearthisCue(0), "0:00");
assert.equal(formatHearthisCue(270), "4:30");
assert.equal(formatHearthisCue(4740), "1:19:00");
assert.equal(formatHearthisCue(18960), "5:16:00");

// Fixture shaped like Sunday Moods / Cafe ZOOM (smmcz260726): empty gap,
// out-of-order first track at start=0/end=0, then timed cues.
const sundayMoods: HtPlaylistEntry[] = [
  { id: "g0", start: 0, end: 270, text: "" },
  { id: "15759485", start: 270, end: 660, text: "Dan Kye - Raro" },
  { id: "15759486", start: 660, end: 1320, text: "Axel Boman - Purple Drank" },
  {
    id: "15759487",
    start: 1320,
    end: 2370,
    text: "Frits Wentink - Rarely Pure, Never Simple",
  },
  {
    id: "15759509",
    start: 15300,
    end: 15900,
    text: "Contours - Returning - Original Mix",
  },
  {
    id: "15759514",
    start: 18960,
    end: 18960,
    text: "Adham Zahran - Planet X (Original Mix)",
  },
  {
    id: "15759484",
    start: 0,
    end: 0,
    text: "Mike Grant - Rest in Peace My Brother",
  },
];

const plays = playlistEntriesToPlays(sundayMoods, 19566);
assert.equal(plays.length, 6);
assert.equal(plays[0]!.artistName, "Mike Grant");
assert.equal(plays[0]!.trackTitle, "Rest in Peace My Brother");
assert.equal(plays[0]!.timestamp, 0);
assert.equal(plays[0]!.provenance, "hearthis");
assert.equal(plays[0]!.idStatus, "identified");
assert.equal(plays[1]!.artistName, "Dan Kye");
assert.equal(plays[1]!.timestamp, 270);
assert.equal(plays[2]!.artistName, "Axel Boman");
assert.equal(plays[3]!.artistName, "Frits Wentink");
assert.equal(plays[4]!.artistName, "Contours");
assert.equal(plays[4]!.trackTitle, "Returning - Original Mix");
assert.equal(plays[4]!.timestamp, 15300);
assert.equal(plays[5]!.artistName, "Adham Zahran");
assert.equal(plays[5]!.timestamp, 18960);

assert.equal(playlistEntriesToPlays([], 3600).length, 0);
assert.equal(
  playlistEntriesToPlays([{ start: 0, end: 60, text: "   " }], 3600).length,
  0,
);

console.log("hearthis/playlist.test.ts ok");
