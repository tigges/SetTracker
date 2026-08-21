import assert from "node:assert/strict";
import { trackPublicHref } from "./trackHref";

const exported = new Set(["losing-it", "pressure"]);

assert.deepEqual(trackPublicHref("losing-it", { exportedSlugs: exported }), {
  kind: "page",
  href: "/tracks/losing-it",
});

assert.deepEqual(
  trackPublicHref("not-your-friend", {
    exportedSlugs: exported,
    beatportUrl: "https://www.beatport.com/track/not-your-friend/12345",
  }),
  {
    kind: "beatport",
    href: "https://www.beatport.com/track/not-your-friend/12345",
  },
);

assert.deepEqual(
  trackPublicHref("not-your-friend", {
    exportedSlugs: exported,
    beatportUrl: "https://www.beatport.com/search?q=Not+Your+Friend",
  }),
  { kind: "none" },
);

assert.deepEqual(
  trackPublicHref("not-your-friend", { exportedSlugs: exported }),
  { kind: "none" },
);

assert.deepEqual(
  trackPublicHref("losing-it", {
    exportedSlugs: ["losing-it"],
    beatportUrl: "https://www.beatport.com/track/losing-it/1",
  }),
  { kind: "page", href: "/tracks/losing-it" },
);

console.log("trackHref.test.ts ok");
