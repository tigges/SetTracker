import assert from "node:assert/strict";
import raw from "../../data/artist-seeds/djmag-top100-djs-2025.json";
import { isTop100DjSlug } from "./djCatalog";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import { ATOMIC_ACTS } from "./ingest/atomicActs";
import { DJ_SOCIAL_PINS } from "./ingest/djSocialPins.data";
import { slugify } from "./ingest/types";

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
assert.equal(ranks.get("ww"), 18);
assert.equal(ranks.get("w-w"), 18);
assert.equal(ranks.get("martinez-brothers"), 43);
assert.equal(ranks.get("the-martinez-brothers"), 43);
assert.equal(ranks.get("chainsmokers"), 70);
assert.equal(ranks.get("the-chainsmokers"), 70);
assert.equal(isTop100DjSlug("dimitri-vegas-like-mike"), true);
assert.equal(isTop100DjSlug("dimitri-vegas-mike"), true);
assert.equal(isTop100DjSlug("w-w"), true);
assert.equal(isTop100DjSlug("the-martinez-brothers"), true);
assert.equal(isTop100DjSlug("the-chainsmokers"), true);

function foldName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const chart = (
  raw as { djs: Array<{ slug: string; rank: number; name: string }> }
).djs;
const missing: string[] = [];
for (const d of chart) {
  const nameSlug = slugify(d.name);
  const atomic = ATOMIC_ACTS.find((a) => foldName(a.name) === foldName(d.name));
  const pin = DJ_SOCIAL_PINS.find(
    (p) =>
      p.slug === d.slug ||
      p.slug === nameSlug ||
      (atomic && p.slug === atomic.slug) ||
      foldName(p.name ?? "") === foldName(d.name),
  );
  const catalogSlug = pin?.slug ?? atomic?.slug ?? nameSlug;
  if (ranks.get(catalogSlug) !== d.rank) {
    missing.push(
      `#${d.rank} ${d.name} chart=${d.slug} catalog=${catalogSlug}`,
    );
  }
}
assert.deepEqual(
  missing,
  [],
  `Top 100 catalog slugs missing a rank label:\n${missing.join("\n")}`,
);

console.log("djmagTop100.test.ts ok");
