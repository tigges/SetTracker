import assert from "node:assert/strict";
import { curatedSetImage, KNOWN_SET_IMAGES } from "./setImages";

assert.equal(
  KNOWN_SET_IMAGES["yt-PlArfyuzuqo"],
  "/sets/john-summit-tml-we2-2026.jpg",
);
assert.equal(
  curatedSetImage("yt-PlArfyuzuqo"),
  "/sets/john-summit-tml-we2-2026.jpg",
);
assert.equal(curatedSetImage("yt-missing"), undefined);

for (const [slug, url] of Object.entries(KNOWN_SET_IMAGES)) {
  assert.match(slug, /^yt-[\w-]{11}$/);
  assert.ok(
    url.startsWith("/") || /^https?:\/\//i.test(url),
    `${slug} image must be root-relative or absolute`,
  );
}

console.log("setImages.test.ts ok");
