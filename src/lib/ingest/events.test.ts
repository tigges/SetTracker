import assert from "node:assert/strict";
import { inferFestivalEvent, resolveEvent } from "./events";

assert.equal(resolveEvent("EDC Las Vegas").slug, "edc-lv");
assert.equal(resolveEvent("EDC").slug, "edc-lv");
assert.equal(resolveEvent("edc-las-vegas").slug, "edc-lv");
assert.equal(resolveEvent("EDC Las Vegas").website, "https://lasvegas.edc.com/");

assert.equal(
  inferFestivalEvent("Chris Lake @ EDC Las Vegas 2024")?.slug,
  "edc-lv",
);
assert.equal(
  inferFestivalEvent("Artist | Insomniac EDC LV kineticFIELD")?.slug,
  "edc-lv",
);
assert.equal(inferFestivalEvent("Boiler Room London")?.slug, "boiler-room");
assert.equal(
  inferFestivalEvent("Behind Cercle Odyssey I Chapter Four: Curtain")?.slug,
  "cercle",
);
assert.equal(resolveEvent("Cercle").website, "https://www.cercle.io/");
assert.equal(resolveEvent("Cercle").kind, "livestream");
assert.equal(
  inferFestivalEvent(
    "Night Owl Radio 470 ft. Nocturnal Wonderland 2024 Mega-Mix",
  )?.slug,
  "nocturnal-wonderland",
);
assert.equal(inferFestivalEvent("Set at Djoon Paris")?.slug, "djoon");
assert.equal(resolveEvent("Djoon").website, "https://djoon.com/");
assert.equal(
  inferFestivalEvent("BLACK COFFEE - Mayan Warrior - Burning Man 2025")?.slug,
  "burning-man",
);
assert.equal(resolveEvent("Burning Man").slug, "burning-man");
assert.equal(resolveEvent("Burning Man").kind, "festival");
assert.equal(resolveEvent("Burning Man").website, "https://burningman.org/");
assert.equal(
  resolveEvent("Tomorrowland").instagram,
  "https://instagram.com/tomorrowland",
);
assert.equal(
  resolveEvent("The Brooklyn Mirage").instagram,
  "https://instagram.com/thebrooklynmirage",
);
assert.equal(
  resolveEvent("Dreamstate").website,
  "https://socal.dreamstateusa.com/",
);
assert.equal(resolveEvent("Dreamstate SoCal").slug, "dreamstate");
assert.equal(inferFestivalEvent("Random Club Night"), null);
assert.equal(resolveEvent("Djoon").kind, "club");
assert.equal(inferFestivalEvent("One World Radio Guest Mix")?.slug, "one-world-radio");
assert.equal(resolveEvent("One World Radio").slug, "one-world-radio");
assert.equal(resolveEvent("One World Radio").kind, "radio");
assert.equal(
  inferFestivalEvent("Artist | Freedom Stage Weekend 2 Belgium")?.slug,
  "tomorrowland",
);
assert.equal(resolveEvent("Tomorrowland Belgium").slug, "tomorrowland");
assert.equal(resolveEvent("Tomorrowland Belgium").kind, "festival");
assert.equal(
  inferFestivalEvent("Mike Williams WE2 | Tomorrowland 2026")?.slug,
  "tomorrowland",
);
assert.equal(
  inferFestivalEvent("Maddix live @ ULTRA EUROPE 2026 | Mainstage")?.slug,
  "ultra-europe",
);
assert.equal(
  inferFestivalEvent(
    "Giuseppe Ottaviani B2B Ilan Bluestone | Beyond Wonderland 2026",
  )?.slug,
  "beyond-wonderland",
);
assert.equal(
  inferFestivalEvent("Giuseppe Ottaviani | Dreamstate Vancouver 2026")
    ?.slug,
  "dreamstate",
);
assert.equal(inferFestivalEvent("Dreamstate")?.slug, "dreamstate");
assert.equal(resolveEvent("Ultra Europe").slug, "ultra-europe");
assert.notEqual(
  inferFestivalEvent("Maddix live @ ULTRA EUROPE 2026 | Mainstage")?.slug,
  "ultra-miami",
);
assert.equal(
  inferFestivalEvent("MARTEN HØRGER @ Mainstage, Parookaville 2026")?.slug,
  "parookaville",
);
assert.equal(resolveEvent("Parookaville").slug, "parookaville");
assert.equal(resolveEvent("Parookaville").website, "https://parookaville.com/");
assert.equal(inferFestivalEvent("Martin Garrix | Untold 2025")?.slug, "untold");
assert.equal(
  inferFestivalEvent("Dom Dolla live at Creamfields Steel Yard")?.slug,
  "creamfields",
);
assert.equal(resolveEvent("Creamfields").website, "https://www.creamfields.com/");
assert.equal(
  inferFestivalEvent("Calvin Harris Creamfields Chile 2026")?.slug,
  "creamfields-chile",
);
assert.equal(
  inferFestivalEvent("Fisher @ Club Hípico, Creamfields 2026")?.slug,
  "creamfields-chile",
);
assert.equal(
  resolveEvent("Creamfields Chile").website,
  "https://www.creamfields.cl/",
);
assert.equal(resolveEvent("Creamfields Chile").kind, "festival");
assert.equal(resolveEvent("Untold Festival").slug, "untold");
assert.equal(inferFestivalEvent("B2B at Awakenings Festival")?.slug, "awakenings");
assert.equal(
  inferFestivalEvent("Kevin de Vries - Zurich Street Parade 2025 - ARTE Concert")
    ?.slug,
  "street-parade",
);
assert.equal(resolveEvent("Street Parade").slug, "street-parade");
assert.equal(resolveEvent("Street Parade").kind, "festival");
assert.equal(
  resolveEvent("Zürich Street Parade").website,
  "https://www.streetparade.com/",
);
assert.equal(
  resolveEvent("Street Parade").instagram,
  "https://www.instagram.com/streetparade/",
);
assert.equal(resolveEvent("Street Parade").soundcloud, undefined);
assert.equal(
  resolveEvent("Street Parade").twitter,
  "https://x.com/streetparadeZH",
);
assert.equal(resolveEvent("streetparade").slug, "street-parade");
assert.equal(
  inferFestivalEvent("Plastik Funk - Nature One 2025 - ARTE Concert")?.slug,
  "nature-one",
);
assert.equal(resolveEvent("Nature One").slug, "nature-one");
assert.equal(
  inferFestivalEvent(
    "Calvin Harris @ Mainstage, Dance Valley, Netherlands 2026-08-08",
  )?.slug,
  "dance-valley",
);
assert.equal(resolveEvent("Dance Valley").slug, "dance-valley");
assert.equal(resolveEvent("dancevalley").slug, "dance-valley");
assert.equal(resolveEvent("Dance Valley").kind, "festival");
assert.equal(
  resolveEvent("Dance Valley").website,
  "https://www.dancevalley.com/",
);
assert.equal(
  resolveEvent("Dance Valley").instagram,
  "https://www.instagram.com/dancevalley/",
);
assert.equal(resolveEvent("808 Festival").website, "https://808festival.net/");
assert.equal(
  resolveEvent("Together Festival").website,
  "https://togetherfestival.net/",
);
assert.equal(
  resolveEvent("White Party Bangkok").instagram,
  "https://www.instagram.com/whitepartybkk/",
);
assert.equal(resolveEvent("Sunset By Neon").website, "https://sunsetbyneon.asia/");
assert.equal(
  resolveEvent("Pitch Music & Arts").soundcloud,
  "https://soundcloud.com/pitchfestival",
);
assert.equal(resolveEvent("GMO Sonic").kind, "festival");
assert.equal(resolveEvent("GMO Sonic").website, "https://sonic.gmo/en/");
assert.equal(
  inferFestivalEvent("The Magic of Tomorrowland Shanghai")?.slug,
  "magic-of-tomorrowland",
);
assert.equal(
  inferFestivalEvent("Martin Garrix | Tomorrowland 2026")?.slug,
  "tomorrowland",
);
assert.equal(
  resolveEvent("VAC Festival").slug,
  "vision-colour-music-festival",
);
assert.equal(
  resolveEvent("Vision & Colour Music Festival").instagram,
  "https://www.instagram.com/vacfestival/",
);
assert.equal(
  inferFestivalEvent("MARNIK presents UNLEGEND @ NAMELESS Festival")?.slug,
  "nameless-festival",
);
assert.equal(
  inferFestivalEvent("Nameless Festival")?.website,
  "https://www.namelessfestival.it/en/",
);
assert.equal(
  inferFestivalEvent("MEDUZA @ Stereo Montréal, Canada 2026-05-16")?.slug,
  "stereo-montreal",
);
assert.equal(inferFestivalEvent("Stereo Montréal")?.kind, "club");
assert.equal(inferFestivalEvent("Stereo"), null);
assert.equal(inferFestivalEvent("stereoBLOOM"), null);
assert.equal(
  inferFestivalEvent("R3WIRE - House & Tech Live on STEREOHYPE")?.slug,
  "stereohype",
);
assert.equal(
  inferFestivalEvent("MEDUZA @ Club Space Miami, United States 2026-03-13")
    ?.slug,
  "club-space",
);
assert.equal(
  inferFestivalEvent("MEDUZA Space Miami March 13")?.website,
  "https://www.clubspace.com/",
);
assert.equal(
  inferFestivalEvent(
    "Vintage Culture Live at EDC Las Vegas, Neon Garden (Club Space)",
  )?.slug,
  "edc-lv",
);
assert.equal(
  inferFestivalEvent(
    "Jamie Jones DJ set - Lost Horizon Festival | Beatport Live",
  )?.slug,
  "lost-horizon-festival",
);
assert.equal(inferFestivalEvent("Lost Horizon Festival")?.kind, "festival");
assert.equal(inferFestivalEvent("Lost Horizon Festival")?.website, undefined);
assert.equal(inferFestivalEvent("Lost Horizon"), null);
assert.equal(
  inferFestivalEvent(
    "Skrillex @ Banco de Chile Stage, Lollapalooza Chile 2026-03-15",
  )?.slug,
  "lollapalooza-chile",
);
assert.equal(inferFestivalEvent("Lollapalooza Chile")?.kind, "festival");
assert.equal(inferFestivalEvent("Lollapalooza Chile")?.website, undefined);
assert.equal(
  inferFestivalEvent("John Summit Bud Light Stage Lollapalooza Chicago")?.slug,
  "lollapalooza",
);
assert.equal(inferFestivalEvent("Lollapalooza")?.website, "https://www.lollapalooza.com/");

assert.equal(
  inferFestivalEvent("Dimitri Vegas at Amnesia Cap d'Agde")?.slug,
  "amnesia-cap-dagde",
);
assert.equal(
  inferFestivalEvent("Theodora | Amnesia Cap d’Agde")?.website,
  "https://amnesia.fr/",
);
assert.equal(resolveEvent("Amnesia Cap d'Agde").slug, "amnesia-cap-dagde");
assert.equal(resolveEvent("Amnesia").slug, "amnesia-ibiza");
assert.notEqual(
  inferFestivalEvent("Deborah De Luca Pyramid Amnesia Ibiza")?.slug,
  "amnesia-cap-dagde",
);

console.log("events.test.ts ok");
