import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadDjMagTopDjs, parseHomeFromDjHtml } from "./djmagDjs";

const seed = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/artist-seeds/djmag-top100-djs-2025.json"),
    "utf8",
  ),
) as {
  djs: Array<{
    rank: number;
    slug: string;
    name: string;
    website?: string;
    homeCity?: string;
  }>;
};

assert.equal(seed.djs.length, 100);
assert.equal(seed.djs[0]?.slug, "david-guetta");
assert.equal(seed.djs[4]?.slug, "armin-van-buuren");
assert.ok(seed.djs.some((d) => d.slug === "black-coffee"));
assert.ok(seed.djs.some((d) => d.slug === "fisher"));
assert.ok(
  seed.djs.filter((d) => d.website && !/djmag\.com/i.test(d.website)).length >=
    70,
  "expected most Top 100 DJs to have official websites",
);
assert.equal(
  seed.djs.find((d) => d.slug === "david-guetta")?.website,
  "https://davidguetta.com/",
);
assert.equal(
  seed.djs.find((d) => d.slug === "fred-again")?.website,
  "https://www.fredagain.com/",
);
assert.equal(
  seed.djs.find((d) => d.slug === "i-hate-models")?.website,
  "https://www.ihatemodelsmusic.com/",
);
assert.equal(
  seed.djs.find((d) => d.slug === "marnik")?.website,
  "https://www.marnikofficial.com/",
);

assert.equal(
  parseHomeFromDjHtml(
    `<p><strong>From:</strong> Paris, France</p><p><strong>DJ style:</strong> House</p>`,
  ),
  "Paris, France",
);

loadDjMagTopDjs().then((djs) => {
  assert.ok(djs.length >= 100, `expected 100 djs, got ${djs.length}`);
  console.log("djmagDjs.test.ts ok", djs.length);
});
