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
  inferFestivalEvent(
    "Night Owl Radio 470 ft. Nocturnal Wonderland 2024 Mega-Mix",
  )?.slug,
  "nocturnal-wonderland",
);
assert.equal(inferFestivalEvent("Set at Djoon Paris")?.slug, "djoon");
assert.equal(
  inferFestivalEvent("BLACK COFFEE - Mayan Warrior - Burning Man 2025")?.slug,
  "burning-man",
);
assert.equal(resolveEvent("Burning Man").slug, "burning-man");
assert.equal(resolveEvent("Burning Man").kind, "festival");
assert.equal(resolveEvent("Burning Man").website, "https://burningman.org/");
assert.equal(
  resolveEvent("Dreamstate").website,
  "https://socal.dreamstateusa.com/",
);
assert.equal(resolveEvent("Dreamstate SoCal").slug, "dreamstate");
assert.equal(inferFestivalEvent("Random Club Night"), null);
assert.equal(resolveEvent("Djoon").kind, "club");
assert.equal(resolveEvent("Tomorrowland Belgium").slug, "tomorrowland");
assert.equal(resolveEvent("Tomorrowland Belgium").kind, "festival");
assert.equal(
  inferFestivalEvent("Mike Williams WE2 | Tomorrowland 2026")?.slug,
  "tomorrowland",
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

console.log("events.test.ts ok");
