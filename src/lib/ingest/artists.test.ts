import assert from "node:assert/strict";
import {
  artistsForSet,
  performingCreditFromTitle,
  splitArtistCredit,
  splitArtistsFromSetTitle,
  tidyPerformingCredit,
} from "./artists";

assert.equal(
  performingCreditFromTitle(
    "James Hype B2B Tita Lau live @ Cafe Mambo, Ibiza 2026",
  ),
  "James Hype B2B Tita Lau",
);

assert.equal(
  performingCreditFromTitle("Biscits DJ Set - EDC Vegas 2025"),
  "Biscits",
);
assert.equal(
  tidyPerformingCredit("Biscits Tech House DJ Set"),
  "Biscits",
);
assert.equal(
  performingCreditFromTitle(
    "Biscits for Insomniac Records Livestream (August 26, 2020)",
  ),
  "Biscits",
);

const biscitsPreferred = artistsForSet(
  "Biscits DJ Set - Academy, Los Angeles",
  { name: "BISCITS", slug: "biscits", accent: "#ef476f" },
);
assert.equal(biscitsPreferred.primary.slug, "biscits");
assert.equal(biscitsPreferred.collaborators.length, 0);

const loopCollab = artistsForSet(
  "Goodboys x Biscits x Max Mylo: In The Loop at Academy, Los Angeles",
  { name: "BISCITS", slug: "biscits", accent: "#ef476f" },
);
assert.equal(loopCollab.primary.slug, "biscits");
assert.deepEqual(
  loopCollab.collaborators.map((c) => c.name),
  ["Goodboys", "Max Mylo"],
);

const hype = splitArtistsFromSetTitle(
  "James Hype B2B Tita Lau live @ Cafe Mambo, Ibiza 2026",
  { accent: "#ff3d6e" },
);
assert.equal(hype.primary.name, "James Hype");
assert.equal(hype.primary.accent, "#ff3d6e");
assert.equal(hype.collaborators.length, 1);
assert.equal(hype.collaborators[0].name, "Tita Lau");
assert.equal(hype.collaborators[0].slug, "tita-lau");

const feat = splitArtistCredit("Cloonee feat PAWSA");
assert.equal(feat.primary.name, "Cloonee");
assert.equal(feat.collaborators[0].name, "PAWSA");

const triple = splitArtistCredit("Alpha b2b Beta x Gamma");
assert.equal(triple.primary.name, "Alpha");
assert.deepEqual(
  triple.collaborators.map((c) => c.name),
  ["Beta", "Gamma"],
);

const venue = splitArtistsFromSetTitle("Kyle Starkey | Mixmag Lab London");
assert.equal(venue.primary.name, "Kyle Starkey");
assert.equal(venue.collaborators.length, 0);

const preferred = artistsForSet(
  "James Hype B2B Tita Lau live @ Cafe Mambo",
  { name: "James Hype", slug: "james-hype", accent: "#ff3d6e" },
);
assert.equal(preferred.primary.name, "James Hype");
assert.equal(preferred.collaborators[0].name, "Tita Lau");

const noToken = artistsForSet("EDC Las Vegas 2026", {
  name: "Cloonee",
  slug: "cloonee",
});
assert.equal(noToken.primary.name, "Cloonee");
assert.equal(noToken.collaborators.length, 0);

console.log("artists.test.ts ok");
