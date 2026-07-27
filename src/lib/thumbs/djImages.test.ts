import assert from "node:assert/strict";
import { KNOWN_DJ_IMAGES } from "./djImages";

assert.ok(KNOWN_DJ_IMAGES["gentlemens-groove"]);
assert.equal(
  KNOWN_DJ_IMAGES["gentlemens-groove"],
  "/artists/gentlemens-groove.png",
);

for (const [slug, url] of Object.entries(KNOWN_DJ_IMAGES)) {
  assert.match(slug, /^[a-z0-9-]+$/);
  assert.ok(
    url.startsWith("/") || /^https?:\/\//i.test(url),
    `${slug} image must be root-relative or absolute`,
  );
}

console.log("djImages.test.ts ok");
