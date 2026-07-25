import assert from "node:assert/strict";
import { fetchBandcampRelease } from "./client";

async function main() {
  const rel = await fetchBandcampRelease(
    "https://aizoclutch.bandcamp.com/track/ezel-ft-mike-city-already-knew-aizo-clutch-rebass-2",
  );
  assert.equal(rel.artist, "Aizo Clutch");
  assert.ok(rel.title.toLowerCase().includes("already knew"));
  assert.equal(rel.tracks.length, 1);
  assert.ok(rel.tracks[0].durationSec > 60);
  assert.equal(rel.bandSlug, "aizoclutch");
  console.log("bandcamp client ok:", rel.title, rel.tracks[0].durationSec, "s");
}

main();
