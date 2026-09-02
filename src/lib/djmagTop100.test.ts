import assert from "node:assert/strict";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import { isTop100DjSlug } from "./djCatalog";

const ranks = loadDjMagTop100RankBySlug();
assert.equal(ranks.get("david-guetta"), 1);
assert.equal(ranks.get("fisher"), 7);
assert.equal(ranks.get("dom-dolla"), 41);
assert.equal(ranks.get("mau-p"), 77);
assert.equal(ranks.get("meduza"), 92);
assert.equal(ranks.get("chris-lake"), 95);
assert.equal(ranks.get("jauz"), undefined);
assert.equal(ranks.get("dimitri-vegas-mike"), 4);
assert.equal(
  ranks.get("dimitri-vegas-like-mike"),
  4,
  "catalog atomic-act slug must carry the DJ Mag #4 label",
);
assert.equal(isTop100DjSlug("dimitri-vegas-like-mike"), true);
assert.equal(isTop100DjSlug("dimitri-vegas-mike"), true);

console.log("djmagTop100.test.ts ok");
