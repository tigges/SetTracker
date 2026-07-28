import assert from "node:assert/strict";
import { normalizeOfficialWebsite } from "./wikidataOfficial";

assert.equal(
  normalizeOfficialWebsite("http://www.arminvanbuuren.com/"),
  "https://www.arminvanbuuren.com/",
);
assert.equal(
  normalizeOfficialWebsite("https://www.tomorrowland.com"),
  "https://www.tomorrowland.com/",
);
assert.equal(normalizeOfficialWebsite("https://instagram.com/foo"), null);
assert.equal(normalizeOfficialWebsite("https://www.djmag.com/x"), null);

console.log("wikidataOfficial.test.ts ok");
