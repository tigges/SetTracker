import assert from "node:assert/strict";
import {
  aliasSlugsFor,
  previousSlugsFor,
  resolveSetSlug,
  SET_SOURCE_REMAPS,
} from "./sourceRemaps";

const fisher = SET_SOURCE_REMAPS.find((r) => r.fromSlug === "yt-mVB-gqggrCQ");
assert.ok(fisher);
assert.equal(fisher!.toSlug, "yt-Uq1WP8v3U4o");
assert.match(fisher!.sourceUrl, /Uq1WP8v3U4o/);

assert.equal(resolveSetSlug("yt-mVB-gqggrCQ"), "yt-Uq1WP8v3U4o");
assert.equal(resolveSetSlug("yt-Uq1WP8v3U4o"), "yt-Uq1WP8v3U4o");
assert.equal(resolveSetSlug("yt-other"), "yt-other");

assert.deepEqual(previousSlugsFor("yt-Uq1WP8v3U4o"), ["yt-mVB-gqggrCQ"]);
assert.deepEqual(previousSlugsFor("yt-missing"), []);

const aliased = aliasSlugsFor(["yt-Uq1WP8v3U4o", "yt-other"]);
assert.ok(aliased.includes("yt-mVB-gqggrCQ"));
assert.ok(aliased.includes("yt-Uq1WP8v3U4o"));
assert.ok(aliased.includes("yt-other"));

const colynSc = SET_SOURCE_REMAPS.find(
  (r) => r.fromSlug === "sc-innellea-colyn-b2b-innella-at-ultra",
);
assert.ok(colynSc);
assert.equal(colynSc!.toSlug, "yt-2BPWWYAgUE4");
assert.match(colynSc!.sourceUrl, /2BPWWYAgUE4/);
assert.equal(
  resolveSetSlug("sc-innellea-colyn-b2b-innella-at-ultra"),
  "yt-2BPWWYAgUE4",
);
assert.deepEqual(previousSlugsFor("yt-2BPWWYAgUE4"), [
  "sc-innellea-colyn-b2b-innella-at-ultra",
]);
const colynAliased = aliasSlugsFor(["yt-2BPWWYAgUE4"]);
assert.ok(colynAliased.includes("sc-innellea-colyn-b2b-innella-at-ultra"));

console.log("sourceRemaps.test.ts ok");
