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
  performingCreditFromTitle(
    "Chris Lake Full Set Live @ Outside Lands Festival 2024",
  ),
  "Chris Lake",
);
assert.equal(tidyPerformingCredit("Chris Lake Full"), "Chris Lake");
assert.equal(tidyPerformingCredit("James Hype Official"), "James Hype");
assert.equal(tidyPerformingCredit("James Hype Official Full Set HD"), "James Hype");
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

const lucasSteve = splitArtistsFromSetTitle(
  "Lucas & Steve B2B Mike Williams | Don't Let Daddy Know, Ziggo Dome 2026",
);
assert.equal(lucasSteve.primary.name, "Lucas & Steve");
assert.equal(lucasSteve.primary.slug, "lucas-steve");
assert.equal(lucasSteve.collaborators.length, 1);
assert.equal(lucasSteve.collaborators[0]?.name, "Mike Williams");
assert.equal(lucasSteve.collaborators[0]?.slug, "mike-williams");

const lucasSteveSolo = splitArtistsFromSetTitle(
  "Lucas & Steve | Tomorrowland Weekend 2 2026",
);
assert.equal(lucasSteveSolo.primary.slug, "lucas-steve");
assert.equal(lucasSteveSolo.collaborators.length, 0);

const soloLucas = splitArtistsFromSetTitle("Lucas | Club Night 2024");
assert.equal(soloLucas.primary.name, "Lucas");
assert.equal(soloLucas.primary.slug, "lucas");
assert.equal(soloLucas.collaborators.length, 0);

const lucasStevePreferred = artistsForSet(
  "Lucas & Steve B2B Mike Williams | Don't Let Daddy Know, Ziggo Dome 2026",
  { name: "Lucas & Steve", slug: "lucas-steve", accent: "#ffb703" },
);
assert.equal(lucasStevePreferred.primary.slug, "lucas-steve");
assert.deepEqual(
  lucasStevePreferred.collaborators.map((c) => c.slug),
  ["mike-williams"],
);

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
    "Hot Since 82 - Live From A Pirate Ship in Ibiza 2025",
  ),
  "Hot Since 82",
);
assert.equal(
  performingCreditFromTitle("Recovery (Hot Air Balloon Set)"),
  "Hot Since 82",
);
assert.equal(
  performingCreditFromTitle("Hot Since 82 - Recovery (Hot Air Balloon Set)"),
  "Hot Since 82",
);

const balloonPreferred = artistsForSet(
  "Hot Since 82 - Live From A Pirate Ship in Ibiza 2025",
  { name: "Recovery (Hot Air Balloon)", slug: "recovery-hot-air-balloon" },
);
assert.equal(balloonPreferred.primary.slug, "hot-since-82");
assert.equal(balloonPreferred.primary.name, "Hot Since 82");
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
  performingCreditFromTitle("Laidback Luke SELECTS - August, 2026"),
  "Laidback Luke",
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
assert.equal(
  guestFromSeriesByTitle("Keinemusik Radio Show by FIFI 07.08.2026"),
  "FIFI",
);
const kmFifi = artistsForSet(
  "Keinemusik Radio Show by FIFI 07.08.2026",
  { name: "Keinemusik", slug: "keinemusik", accent: "#e8c547" },
);
assert.equal(kmFifi.primary.slug, "fifi");
assert.equal(kmFifi.primary.name, "FIFI");
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
    "4444 OF A KIND Freedom WE1 | Tomorrowland 2026",
  ),
  "4444 OF A KIND",
);
assert.equal(tidyPerformingCredit("4444 OF A KIND Freedom WE1"), "4444 OF A KIND");
const kindFreedom = artistsForSet(
  "4444 OF A KIND Freedom WE1 | Tomorrowland 2026",
  { name: "4444 OF A KIND", slug: "4444-of-a-kind", accent: "#ff006e" },
);
assert.equal(kindFreedom.primary.slug, "4444-of-a-kind");
assert.equal(kindFreedom.primary.name, "4444 OF A KIND");
assert.equal(kindFreedom.collaborators.length, 0);
assert.equal(
  performingCreditFromTitle("Jack Shore WE1 | Tomorrowland 2026"),
  "Jack Shore",
);
assert.equal(
  performingCreditFromTitle("Nicky Romero WE1 | Tomorrowland 2026"),
  "Nicky Romero",
);
const nickyLibSet = artistsForSet(
  "Nicky Romero WE1 | Tomorrowland 2026",
  { name: "Nicky Romero", slug: "nicky-romero", accent: "#00bbf9" },
);
assert.equal(nickyLibSet.primary.slug, "nicky-romero");
assert.equal(nickyLibSet.collaborators.length, 0);
assert.equal(
  performingCreditFromTitle("Maddix live @ ULTRA EUROPE 2026 | Mainstage"),
  "Maddix",
);
const maddixUltraSet = artistsForSet(
  "Maddix live @ ULTRA EUROPE 2026 | Mainstage",
  { name: "Maddix", slug: "maddix", accent: "#ff4d6d" },
);
assert.equal(maddixUltraSet.primary.slug, "maddix");
assert.equal(maddixUltraSet.collaborators.length, 0);
const goIlanBeyondSet = artistsForSet(
  "Giuseppe Ottaviani B2B Ilan Bluestone | Beyond Wonderland 2026",
  { name: "Giuseppe Ottaviani", slug: "giuseppe-ottaviani", accent: "#7b2cbf" },
);
assert.equal(goIlanBeyondSet.primary.slug, "giuseppe-ottaviani");
assert.equal(goIlanBeyondSet.collaborators.length, 1);
assert.equal(goIlanBeyondSet.collaborators[0]?.slug, "ilan-bluestone");
const goDreamstateVanSet = artistsForSet(
  "Giuseppe Ottaviani | Dreamstate Vancouver 2026",
  { name: "Giuseppe Ottaviani", slug: "giuseppe-ottaviani", accent: "#7b2cbf" },
);
assert.equal(goDreamstateVanSet.primary.slug, "giuseppe-ottaviani");
assert.equal(goDreamstateVanSet.collaborators.length, 0);
assert.equal(
  performingCreditFromTitle(
    "Giuseppe Ottaviani @ Dreamstate, Vancouver 2026",
  ),
  "Giuseppe Ottaviani",
);
const goDreamstateSydSet = artistsForSet(
  "Giuseppe Ottaviani | Dreamstate Sydney 2026",
  { name: "Giuseppe Ottaviani", slug: "giuseppe-ottaviani", accent: "#7b2cbf" },
);
assert.equal(goDreamstateSydSet.primary.slug, "giuseppe-ottaviani");
assert.equal(goDreamstateSydSet.collaborators.length, 0);
assert.equal(
  performingCreditFromTitle("Giuseppe Ottaviani @ Dreamstate, Sydney 2026"),
  "Giuseppe Ottaviani",
);
const jackShoreSet = artistsForSet(
  "Jack Shore WE1 | Tomorrowland 2026",
  { name: "Jack Shore", slug: "jack-shore", accent: "#3d5a80" },
);
assert.equal(jackShoreSet.primary.slug, "jack-shore");
assert.equal(jackShoreSet.collaborators.length, 0);
assert.equal(
  performingCreditFromTitle("Push only WE2 | Tomorrowland 2026"),
  "Push",
);
assert.equal(
  performingCreditFromTitle("Push WE2 | Tomorrowland 2026"),
  "Push",
);
assert.equal(performingCreditFromTitle("Bonobo Solo"), "Bonobo");
assert.equal(
  performingCreditFromTitle("Mike Williams Throwback"),
  "Mike Williams",
);
assert.equal(
  performingCreditFromTitle(
    "Mike Williams Throwback Set WE1 | Tomorrowland 2026",
  ),
  "Mike Williams",
);
const mikeThrowbackSet = artistsForSet(
  "Mike Williams Throwback Set WE1 | Tomorrowland 2026",
  { name: "Mike Williams", slug: "mike-williams", accent: "#e9c46a" },
);
assert.equal(mikeThrowbackSet.primary.slug, "mike-williams");
assert.equal(mikeThrowbackSet.collaborators.length, 0);
assert.equal(
  performingCreditFromTitle("Enrico Sangiuliano Lockdown"),
  "Enrico Sangiuliano",
);
assert.equal(
  performingCreditFromTitle("Yotto's Odd World"),
  "Yotto",
);
assert.equal(
  performingCreditFromTitle("Bullet Tooth WE2 | Tomorrowland 2026"),
  "Bullet Tooth",
);
assert.equal(
  performingCreditFromTitle("Bullet Tooth DJ Set Live From DJ Mag HQ"),
  "Bullet Tooth",
);
const bulletMint = artistsForSet(
  "Bullet Tooth DJ Set | The Block x Mint Festival 2026 | @beatport Live",
  { name: "Bullet Tooth", slug: "bullet-tooth", accent: "#ff6b35" },
);
assert.equal(bulletMint.primary.slug, "bullet-tooth");
assert.equal(bulletMint.primary.name, "Bullet Tooth");
assert.equal(bulletMint.collaborators.length, 0);
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

// Two curated sets added from an operator paste. Both titles carry the b2b
// partner, and both put the artists ahead of the first "|" — a show or venue
// name in front of the separator gets read as part of the artist and mints a
// junk DJ, so pin the parse.
const omdatSet = artistsForSet(
  "Omdat Het Kan & Average Rob WE1 | Tomorrowland 2026",
  { name: "Omdat Het Kan", slug: "omdat-het-kan", accent: "#f4a261" },
);
assert.equal(omdatSet.primary.slug, "omdat-het-kan");
assert.deepEqual(
  omdatSet.collaborators.map((c) => c.slug),
  ["average-rob"],
);

const mu540Set = artistsForSet(
  "MU540 B2B Mochakk | DJ Set, sotrackboa São Paulo 2024",
  { name: "MU540", slug: "mu540", accent: "#e76f51" },
);
assert.equal(mu540Set.primary.slug, "mu540");
// Must resolve to the existing roster Mochakk, not a new spelling.
assert.deepEqual(
  mu540Set.collaborators.map((c) => c.slug),
  ["mochakk"],
);

// Official Mochakk SoundCloud title. MUCHAKK is the performance nickname,
// not an artist — the parenthetical credit is MU540 b2b Mochakk.
assert.equal(
  performingCreditFromTitle(
    "MUCHAKK (Mu540 b2b Mochakk) @ STB São Paulo 2024",
  ),
  "Mu540 b2b Mochakk",
);
const muchakkSc = artistsForSet(
  "MUCHAKK (Mu540 b2b Mochakk) @ STB São Paulo 2024",
);
assert.equal(muchakkSc.primary.slug, "mu540");
assert.equal(muchakkSc.primary.name, "Mu540");
assert.deepEqual(
  muchakkSc.collaborators.map((c) => c.slug),
  ["mochakk"],
);
const muchakkPiped = artistsForSet(
  "MU540 b2b Mochakk | MUCHAKK @ STB São Paulo 2024",
);
assert.equal(muchakkPiped.primary.slug, "mu540");
assert.deepEqual(
  muchakkPiped.collaborators.map((c) => c.slug),
  ["mochakk"],
);

// Held Crystal Garden WE1 — artists first so Crystal Garden is not a junk DJ.
const mortenMalaaSet = artistsForSet(
  "MORTEN & Malaa | Crystal Garden Stage, Tomorrowland Weekend 1 2026",
);
assert.equal(mortenMalaaSet.primary.slug, "morten");
assert.deepEqual(
  mortenMalaaSet.collaborators.map((c) => c.slug),
  ["malaa"],
);
assert.equal(
  performingCreditFromTitle("MORTEN B2B Malaa WE1 | Tomorrowland 2026"),
  "MORTEN B2B Malaa",
);

// The raw oEmbed title has a colon before "Live from" ("No Redemption :
// Live from Circuit Grounds…") that would otherwise leave a junk "- No
// Redemption" tail on the credit, so the curated title puts artists first
// and moves the project name after the pipe.
const tchamiMalaaSet = artistsForSet(
  "Tchami b2b Malaa | No Redemption - EDC Las Vegas 2025 (circuitGROUNDS)",
  { name: "Tchami", slug: "tchami", accent: "#f4a261" },
);
assert.equal(tchamiMalaaSet.primary.slug, "tchami");
assert.deepEqual(
  tchamiMalaaSet.collaborators.map((c) => c.slug),
  ["malaa"],
);

console.log("artists.test.ts ok");
