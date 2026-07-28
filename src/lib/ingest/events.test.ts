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
assert.equal(inferFestivalEvent("Random Club Night"), null);
assert.equal(resolveEvent("Djoon").kind, "club");

console.log("events.test.ts ok");
