import assert from "node:assert/strict";
import {
  extraArtistsFromCombinedName,
  isJunkArtistName,
  sanitizeArtistName,
} from "./artistName";

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
assert.equal(isJunkArtistName("House, Tech"), true);
assert.equal(isJunkArtistName("House / Tech"), true);
assert.equal(isJunkArtistName("House, Tech & Minimal"), true);
assert.equal(isJunkArtistName("House, Tech & Minimal: 12.03.22"), true);
assert.equal(isJunkArtistName("Minimal"), true);
assert.equal(isJunkArtistName("Minimal Techno"), true);
assert.equal(sanitizeArtistName("House, Tech"), null);
assert.equal(sanitizeArtistName("House, Tech & Minimal: 12.03.22"), null);
assert.equal(sanitizeArtistName("Minimal"), null);
assert.equal(isJunkArtistName("Soweto Punk"), true);
assert.equal(isJunkArtistName("Soweto: Soweto Punk"), true);
assert.equal(sanitizeArtistName("Soweto Punk"), null);
assert.equal(sanitizeArtistName("Soweto: Soweto Punk"), null);
assert.equal(isJunkArtistName("House of Yes"), false);
assert.equal(isJunkArtistName("Fisher House"), false);
assert.equal(isJunkArtistName("Kaskade"), false);
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
assert.equal(
  isJunkArtistName("Pegassi Makes A Trance Track From Scratch"),
  true,
);
assert.equal(isJunkArtistName("Daybreak Sessions channel by One"), true);
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

assert.equal(isJunkArtistName("Full Moon with Timmy Trumpet"), true);
assert.equal(isJunkArtistName("Timmy Trumpet"), false);
assert.equal(
  isJunkArtistName(
    "Group Therapy 674 with Above & Beyond and Max Graham",
  ),
  true,
);
assert.equal(isJunkArtistName("Above & Beyond"), false);
assert.equal(isJunkArtistName("Max Graham"), false);
assert.equal(isJunkArtistName("Goodboys Present"), true);
assert.equal(isJunkArtistName("Goodboys"), false);
assert.equal(isJunkArtistName("Ginger)"), true);
assert.equal(isJunkArtistName("Gaydio Mixes"), true);
assert.equal(isJunkArtistName("Gqom"), true);

assert.equal(
  sanitizeArtistName("Full Moon with Timmy Trumpet"),
  "Timmy Trumpet",
);
assert.equal(
  sanitizeArtistName(
    "Group Therapy 674 with Above & Beyond and Max Graham",
  ),
  "Above & Beyond",
);
assert.equal(sanitizeArtistName("Goodboys Present"), "Goodboys");
assert.equal(sanitizeArtistName("Ginger)"), "Ginger");
assert.equal(sanitizeArtistName("Gaydio Mixes"), null);
assert.equal(sanitizeArtistName("Gqom"), null);
assert.deepEqual(
  extraArtistsFromCombinedName(
    "Group Therapy 674 with Above & Beyond and Max Graham",
  ),
  ["Max Graham"],
);
assert.deepEqual(
  extraArtistsFromCombinedName("Full Moon with Timmy Trumpet"),
  [],
);

console.log("artistName.test.ts ok");
