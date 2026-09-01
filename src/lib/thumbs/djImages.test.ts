import assert from "node:assert/strict";
import { KNOWN_DJ_IMAGES } from "./djImages";

assert.ok(KNOWN_DJ_IMAGES["gentlemens-groove"]);
assert.equal(
  KNOWN_DJ_IMAGES["gentlemens-groove"],
  "/artists/gentlemens-groove.png",
);
assert.equal(
  KNOWN_DJ_IMAGES["gentlemen-s-groove"],
  "/artists/gentlemens-groove.png",
);
assert.equal(KNOWN_DJ_IMAGES["1788-l"], "/artists/1788-l.jpg");
assert.equal(KNOWN_DJ_IMAGES.bdk, "/artists/bdk.jpg");
assert.equal(KNOWN_DJ_IMAGES.bexxie, "/artists/bexxie.jpg");

for (const [slug, url] of Object.entries(KNOWN_DJ_IMAGES)) {
  assert.match(slug, /^[a-z0-9-]+$/);
  assert.ok(
    url.startsWith("/") || /^https?:\/\//i.test(url),
    `${slug} image must be root-relative or absolute`,
  );
}

console.log("djImages.test.ts ok");
