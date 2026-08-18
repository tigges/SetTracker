import assert from "node:assert/strict";
import {
  EVENT_OFFICIAL_SITES,
  KNOWN_EVENT_IMAGES,
  officialEventPages,
} from "./eventImages";

assert.ok(officialEventPages("amnesia-ibiza").includes("https://www.amnesia.es/"));
assert.ok(
  officialEventPages("warehouse-project").includes(
    "https://thewarehouseproject.com/",
  ),
);
assert.equal(officialEventPages("no-such-club", "https://djmag.com/top-100-clubs").length, 0);
assert.ok(officialEventPages("elrow", "https://elrow.com/").includes("https://elrow.com/"));

assert.ok(KNOWN_EVENT_IMAGES["pacha-ibiza"]);
assert.ok(KNOWN_EVENT_IMAGES["warehouse-project"]);
assert.ok(KNOWN_EVENT_IMAGES["concourse-project"]);
assert.ok(EVENT_OFFICIAL_SITES["avalon-hollywood"]);
assert.ok(EVENT_OFFICIAL_SITES["silo-dallas"]);

for (const [slug, url] of Object.entries(KNOWN_EVENT_IMAGES)) {
  assert.match(slug, /^[a-z0-9-]+$/);
  assert.match(url, /^https?:\/\//);
}

console.log("eventImages.test.ts ok");
