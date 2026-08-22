import assert from "node:assert/strict";
import { nearDuplicateKey } from "./feedPriority";
import { staticSetPageSlugs } from "./setPages";

const guettaUltra = [
  { slug: "yt-_oSRGlOQVL0", title: "David Guetta | Miami Ultra Music Festival 2024" },
  { slug: "yt-Unwj6ILhOc8", title: "David Guetta | Miami Ultra Music Festival 2023" },
  { slug: "yt-P2x3-b6JEj8", title: "David Guetta | Miami Ultra Music Festival 2014" },
];

assert.equal(
  nearDuplicateKey(guettaUltra[0]!.title, "david-guetta"),
  nearDuplicateKey(guettaUltra[2]!.title, "david-guetta"),
  "year-stripped titles collide — that must not drop static pages",
);

const pages = staticSetPageSlugs(guettaUltra.map((s) => s.slug));
assert.equal(pages.length, 3);
assert.ok(pages.includes("yt-_oSRGlOQVL0"));
assert.ok(pages.includes("yt-Unwj6ILhOc8"));
assert.ok(pages.includes("yt-P2x3-b6JEj8"));

assert.deepEqual(staticSetPageSlugs(["yt-a", "yt-a"]), ["yt-a"]);

console.log("setPages.test.ts ok");
