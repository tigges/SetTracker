import assert from "node:assert/strict";
import {
  artistsForSet,
  guestFromSeriesByTitle,
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

// Walker & Royce is one NYC duo — never Walker b2b Royce.
const wr = splitArtistsFromSetTitle("Walker & Royce | Fresh Start SF 2026");
assert.equal(wr.primary.name, "Walker & Royce");
assert.equal(wr.primary.slug, "walker-royce");
assert.equal(wr.collaborators.length, 0);

const wrAnd = splitArtistCredit("Walker and Royce");
assert.equal(wrAnd.primary.name, "Walker & Royce");
assert.equal(wrAnd.collaborators.length, 0);

const wrGuest = splitArtistsFromSetTitle(
  "Walker & Royce b2b VNSSA at Elrow",
);
assert.equal(wrGuest.primary.name, "Walker & Royce");
assert.equal(wrGuest.primary.slug, "walker-royce");
assert.equal(wrGuest.collaborators.length, 1);
assert.equal(wrGuest.collaborators[0]?.name, "VNSSA");

const chapter = splitArtistCredit("Chapter & Verse");
assert.equal(chapter.primary.slug, "chapter-verse");
assert.equal(chapter.collaborators.length, 0);

// Set-title accidents must resolve to the artist, not the venue/series.
assert.equal(
  performingCreditFromTitle(
    "Odd Mob at Seismic Dance Event 8.0 | Full Set (Volcano Stage)",
  ),
  "Odd Mob",
);
assert.equal(
  performingCreditFromTitle("Dom Dolla // Dancefloor Currency"),
  "Dom Dolla",
);
assert.equal(
  performingCreditFromTitle(
    "Dom Dolla Warm Up @ Pete Tong's Ibiza Classics [3/11/2017]",
  ),
  "Dom Dolla",
);
assert.equal(
  performingCreditFromTitle("⠶ DOM DOLLA // YOU ⠶ TOUR MIX ⠶"),
  "DOM DOLLA",
);
assert.equal(
  performingCreditFromTitle(
    "Charlotte de Witte at AMF Festival 2023",
  ),
  "Charlotte de Witte",
);
assert.equal(
  performingCreditFromTitle("Defected Virtual Festival 4.0 - Dom Dolla"),
  "Dom Dolla",
);
assert.equal(
  performingCreditFromTitle(
    "Defected TV - MIAMI WMC 2010 presented by Erick Morillo",
  ),
  "Erick Morillo",
);
assert.equal(
  performingCreditFromTitle("Sunk Afinity Sessions by Japhet Be"),
  "Japhet Be",
);
assert.equal(
  performingCreditFromTitle(
    "Keinemusik Radio Show by Lara Bee 17.07.2026",
  ),
  "Lara Bee",
);
assert.equal(
  guestFromSeriesByTitle("Keinemusik Radio Show by Lazarusman 03.07.2026"),
  "Lazarusman",
);
const kmRadio = artistsForSet(
  "Keinemusik Radio Show by Lara Bee 17.07.2026",
  { name: "Keinemusik", slug: "keinemusik", accent: "#e8c547" },
);
assert.equal(kmRadio.primary.slug, "lara-bee");
assert.equal(kmRadio.primary.name, "Lara Bee");

assert.equal(
  performingCreditFromTitle("Armin van Buuren WE2 | Tomorrowland 2026"),
  "Armin van Buuren",
);
assert.equal(
  performingCreditFromTitle("Odd Mob WE2 | Tomorrowland 2026"),
  "Odd Mob",
);
assert.equal(
  performingCreditFromTitle("Fisher Mainstage WE1 | Tomorrowland 2026"),
  "Fisher",
);
assert.equal(
  performingCreditFromTitle(
    "Tomorrowland Friendship Mix with Steve Aoki - August, 2026",
  ),
  "Steve Aoki",
);
assert.notEqual(
  performingCreditFromTitle("Tomorrowland Friendship Mix - June, 2026"),
  "June, 2026",
);

assert.equal(
  performingCreditFromTitle("Full Moon with Timmy Trumpet"),
  "Timmy Trumpet",
);
assert.equal(
  performingCreditFromTitle(
    "Group Therapy 674 with Above & Beyond and Max Graham",
  ),
  "Above & Beyond and Max Graham",
);

const gt = splitArtistsFromSetTitle(
  "Group Therapy 674 with Above & Beyond and Max Graham",
);
assert.equal(gt.primary.name, "Above & Beyond");
assert.equal(gt.primary.slug, "above-beyond");
assert.deepEqual(
  gt.collaborators.map((c) => c.name),
  ["Max Graham"],
);

const moon = splitArtistsFromSetTitle("Full Moon with Timmy Trumpet");
assert.equal(moon.primary.name, "Timmy Trumpet");
assert.equal(moon.collaborators.length, 0);

assert.equal(
  performingCreditFromTitle("Goodboys Present — Club Mix"),
  "Goodboys",
);

assert.equal(
  performingCreditFromTitle(
    "David Guetta & Marten Horger pres. Men Machine - 1001Tracklists Exclusive Mix 2026-06-22",
  ),
  "David Guetta & Marten Horger",
);
const menMachineSet = artistsForSet(
  "David Guetta & Marten Horger pres. Men Machine - 1001Tracklists Exclusive Mix 2026-06-22",
  { name: "Men Machine", slug: "men-machine", accent: "#ff4d6d" },
);
assert.equal(menMachineSet.primary.slug, "men-machine");
assert.deepEqual(
  menMachineSet.collaborators.map((c) => c.slug),
  ["david-guetta", "marten-horger"],
);

const asot1290Set = artistsForSet(
  "Armin van Buuren & Giuseppe Ottaviani - A State Of Trance 1290 2026-08-13",
  { name: "Armin van Buuren", slug: "armin-van-buuren", accent: "#0077b6" },
);
assert.equal(asot1290Set.primary.slug, "armin-van-buuren");
assert.deepEqual(
  asot1290Set.collaborators.map((c) => c.slug),
  ["giuseppe-ottaviani"],
);

console.log("artists.test.ts ok");
