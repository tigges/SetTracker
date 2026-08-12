import assert from "node:assert/strict";
import {
  PRIORITY_CAPTURES,
  buildHeldReliveWatch,
  buildNextCaptures,
  search1001,
} from "./nextCaptures";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";

assert.ok(PRIORITY_CAPTURES.length >= 6);
assert.ok(PRIORITY_CAPTURES.length <= 12);
assert.ok(search1001("fisher").includes("1001tracklists.com"));

const presets = buildNextCaptures({ limit: 10 });
assert.ok(presets.length >= 6);
assert.ok(presets.length <= 10);

// Already-wired Dom Dolla / Prydz / Zamna must not appear.
assert.ok(!presets.some((p) => p.slug === "yt-4Lqyh7cWRxQ"));
assert.ok(!presets.some((p) => p.slug === "yt-hU-z3iV0LOg"));
assert.ok(!presets.some((p) => p.slug === "yt-1Mp9Pl6YgDM"));

for (const p of PRIORITY_CAPTURES) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(TRACKLIST_1001_BY_SOURCE_SLUG, p.slug),
    false,
    `wired slug still in PRIORITY_CAPTURES: ${p.slug}`,
  );
}

for (const p of presets) {
  assert.ok(p.slug.startsWith("yt-"), p.slug);
  assert.ok(p.name.startsWith("TL_"), p.name);
  assert.equal(
    Object.prototype.hasOwnProperty.call(TRACKLIST_1001_BY_SOURCE_SLUG, p.slug),
    false,
    `mapped slug leaked into queue: ${p.slug}`,
  );
}

const held = buildHeldReliveWatch();
assert.ok(held.held.length >= 5);
assert.ok(held.held.every((h) => h.status === "waiting"));

console.log("nextCaptures.test.ts ok");
