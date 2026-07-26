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
assert.equal(inferFestivalEvent("Random Club Night"), null);

console.log("events.test.ts ok");
