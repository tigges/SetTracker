import assert from "node:assert/strict";
import { isJunkArtistName, sanitizeArtistName } from "./artistName";

assert.equal(
  sanitizeArtistName("view artist details for Dead X"),
  "Dead X",
);
assert.equal(
  sanitizeArtistName("View Artist Details for John Summit"),
  "John Summit",
);
assert.equal(sanitizeArtistName("FISHER"), "FISHER");
assert.equal(sanitizeArtistName("Marten Hörger"), "Marten Horger");

assert.equal(sanitizeArtistName("Enter your email address"), null);
assert.equal(sanitizeArtistName("view artist details for"), null);
assert.equal(sanitizeArtistName("Click here"), null);
assert.equal(sanitizeArtistName("2026 Recorded Sets navigation menu"), null);

assert.equal(isJunkArtistName("view artist details for Dead X"), true);
assert.equal(isJunkArtistName("Dead X"), false);
assert.equal(isJunkArtistName("Enter your email address"), true);
assert.equal(isJunkArtistName("view-artist-details-for-fisher"), true);
assert.equal(isJunkArtistName("AC Slater DJ Mix"), true);
assert.equal(isJunkArtistName("AC Slater"), false);
assert.equal(isJunkArtistName("(DJ) 18.04.2025"), true);
assert.equal(isJunkArtistName("18.04.2025"), true);

console.log("artistName.test.ts ok");
