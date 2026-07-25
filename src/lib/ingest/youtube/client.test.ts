import assert from "node:assert/strict";
import { extractVideoId, fetchWatchMeta } from "./client";

assert.equal(extractVideoId("9AfzWCT7bac"), "9AfzWCT7bac");
assert.equal(
  extractVideoId("https://www.youtube.com/watch?v=9AfzWCT7bac"),
  "9AfzWCT7bac",
);
assert.equal(extractVideoId("https://youtu.be/9AfzWCT7bac"), "9AfzWCT7bac");

async function main() {
  const meta = await fetchWatchMeta("9AfzWCT7bac");
  assert.ok(meta.title.toLowerCase().includes("rave"));
  assert.ok(meta.durationSec > 600);
  assert.ok(
    meta.musicCredits.length >= 5,
    `expected Music credits, got ${meta.musicCredits.length}`,
  );
  console.log(
    "youtube client ok:",
    meta.musicCredits.length,
    "credits,",
    meta.durationSec,
    "s",
  );
  for (const c of meta.musicCredits.slice(0, 3)) {
    console.log(" ", c.artistName, "-", c.title);
  }
}

main();
