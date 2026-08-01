import assert from "node:assert/strict";
import {
  captureRowsToSeedRows,
  formatSeedTs,
  isBareIdRow,
  playsToCaptureRows,
  splitArtistTitle,
} from "./toSeed";
import type { RawPlay } from "../types";

assert.equal(isBareIdRow("ID", "ID"), true);
assert.equal(isBareIdRow("AHEE", "ID"), true);
assert.equal(isBareIdRow("AHEE", "Brain Rot (VIP)"), false);
assert.equal(isBareIdRow("GRiZ", "Griztronics (ID Remix)"), false);

assert.deepEqual(splitArtistTitle("Liquid Stranger & AHEE - Superstar [WAKAAN]"), {
  artist: "Liquid Stranger & AHEE",
  title: "Superstar",
});

const plays: RawPlay[] = [
  {
    position: 1,
    timestamp: 1259,
    idStatus: "identified",
    trackTitle: "Like You A Lot",
    artistName: "Vanrip",
    provenance: "1001tl",
  },
  {
    position: 2,
    timestamp: 0,
    idStatus: "unresolved_id",
    trackTitle: "ID",
    artistName: "Westend",
    provenance: "1001tl",
  },
];
const captured = playsToCaptureRows(plays);
assert.equal(captured.length, 1);
assert.equal(captured[0]!.at, "20:59");

const spaced = captureRowsToSeedRows(
  [
    { artist: "A", title: "One" },
    { artist: "B", title: "Two" },
  ],
  { evenlySpaceDurationSec: 120 },
);
assert.equal(spaced.length, 2);
assert.ok(spaced[0]!.at);

const ts = formatSeedTs(spaced, {
  constName: "TL_TEST",
  sourceSlug: "yt-abc",
  pageTitle: "Test set",
});
assert.match(ts, /export const TL_TEST/);
assert.match(ts, /yt-abc/);
assert.match(ts, /artist: "A"/);

console.log("tracklists1001/toSeed.test.ts ok");
