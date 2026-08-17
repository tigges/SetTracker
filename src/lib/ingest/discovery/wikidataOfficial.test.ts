import assert from "node:assert/strict";
import {
  isRejectedWebsiteHost,
  normalizeOfficialWebsite,
  websiteHostMatchesDj,
} from "./wikidataOfficial";

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
assert.equal(normalizeOfficialWebsite("https://www.therealdjbdk.com/"), null);
assert.equal(isRejectedWebsiteHost("https://www.therealdjbdk.com/"), true);
assert.equal(isRejectedWebsiteHost("therealdjbdk.com"), true);
assert.equal(websiteHostMatchesDj("BDK", "therealdjbdk.com"), false);
assert.equal(websiteHostMatchesDj("BDK", "https://www.therealdjbdk.com/"), false);
assert.equal(websiteHostMatchesDj("BDK", "bdk.com"), true);
assert.equal(websiteHostMatchesDj("BDK", "djbdk.com"), true);
assert.equal(websiteHostMatchesDj("David Guetta", "davidguetta.com"), true);
assert.equal(websiteHostMatchesDj("David Guetta", "therealdjbdk.com"), false);

console.log("wikidataOfficial.test.ts ok");
