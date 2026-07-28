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
assert.equal(isJunkArtistName("Afro House Late Evening MIX"), true);
assert.equal(
  sanitizeArtistName("Afro House Late Evening MIX"),
  null,
);
assert.equal(isJunkArtistName("Tech House Vibes Session"), true);
assert.equal(isJunkArtistName("(DJ) 18.04.2025"), true);
assert.equal(isJunkArtistName("18.04.2025"), true);
assert.equal(isJunkArtistName("Djoon"), true);
assert.equal(isJunkArtistName("DJøøn"), true);
assert.equal(isJunkArtistName("DIJON"), false);
assert.equal(isJunkArtistName("Black Coffee"), false);
assert.equal(isJunkArtistName("Keinemusik"), false);
assert.equal(isJunkArtistName("Freedom Stage"), true);
assert.equal(isJunkArtistName("Mainstage"), true);
assert.equal(isJunkArtistName("Main Stage"), true);
assert.equal(sanitizeArtistName("Freedom Stage"), null);
assert.equal(isJunkArtistName("Afro House"), true);
assert.equal(isJunkArtistName("Tech House"), true);
assert.equal(sanitizeArtistName("Afro House"), null);
assert.equal(isJunkArtistName("House"), true);

console.log("artistName.test.ts ok");
