import assert from "node:assert/strict";
import { seedNeedsCatalogRefresh } from "./applyToCatalog";
import { applyTracklist1001Seed } from "./seeds";

assert.equal(seedNeedsCatalogRefresh(0, 18), true);
assert.equal(seedNeedsCatalogRefresh(18, 18), false);
assert.equal(seedNeedsCatalogRefresh(17, 18), true);
assert.equal(seedNeedsCatalogRefresh(0, 4), false);

const empty = applyTracklist1001Seed("yt-does-not-exist", []);
assert.equal(empty.length, 0);

const ab = applyTracklist1001Seed("yt-OI02QgEA1Zw", []);
assert.ok(ab.length >= 12);
assert.ok(ab.every((p) => p.provenance === "1001tl"));

console.log("applyToCatalog.test.ts ok");
