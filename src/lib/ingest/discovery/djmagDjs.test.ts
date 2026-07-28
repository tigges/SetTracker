import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadDjMagTopDjs } from "./djmagDjs";

const seed = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/artist-seeds/djmag-top100-djs-2025.json"),
    "utf8",
  ),
) as { djs: Array<{ rank: number; slug: string; name: string }> };

assert.equal(seed.djs.length, 100);
assert.equal(seed.djs[0]?.slug, "david-guetta");
assert.equal(seed.djs[4]?.slug, "armin-van-buuren");
assert.ok(seed.djs.some((d) => d.slug === "black-coffee"));
assert.ok(seed.djs.some((d) => d.slug === "fisher"));

loadDjMagTopDjs().then((djs) => {
  assert.ok(djs.length >= 100, `expected 100 djs, got ${djs.length}`);
  console.log("djmagDjs.test.ts ok", djs.length);
});
