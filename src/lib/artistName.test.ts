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
assert.equal(isJunkArtistName("Day Trip Festival 2024 Mega-Mix"), true);
assert.equal(isJunkArtistName("OMNOM EDC Las Vegas 2024"), true);
assert.equal(isJunkArtistName("OMNOM"), false);
assert.equal(isJunkArtistName("Artist Tomorrowland 2026"), true);
assert.equal(isJunkArtistName("Dom Dolla // Dancefloor Currency"), true);
assert.equal(
  isJunkArtistName("Odd Mob at Seismic Dance Event 8.0"),
  true,
);
assert.equal(isJunkArtistName("Dom Dolla Warm Up"), true);
assert.equal(isJunkArtistName("Odd Mob"), false);
assert.equal(isJunkArtistName("Dom Dolla"), false);
assert.equal(isJunkArtistName("Defected Virtual Festival 4.0"), true);
assert.equal(isJunkArtistName("Mainstage Shorts"), true);
assert.equal(isJunkArtistName("One World Radio"), true);
assert.equal(isJunkArtistName("Defected TV"), true);
assert.equal(sanitizeArtistName("Defected Virtual Festival 4.0"), null);

assert.equal(isJunkArtistName("Armin van Buuren WE1"), true);
assert.equal(isJunkArtistName("Odd Mob WE2"), true);
assert.equal(isJunkArtistName("Armin van Buuren"), false);
assert.equal(isJunkArtistName("June, 2026"), true);
assert.equal(isJunkArtistName("April 2026"), true);
assert.equal(isJunkArtistName("May, 2026"), true);
assert.equal(sanitizeArtistName("Armin van Buuren WE1"), "Armin van Buuren");
assert.equal(sanitizeArtistName("David Guetta WE2"), "David Guetta");
assert.equal(sanitizeArtistName("Fisher Mainstage WE1"), "Fisher");
assert.equal(sanitizeArtistName("June, 2026"), null);
assert.equal(sanitizeArtistName("July, 2026"), null);

console.log("artistName.test.ts ok");
