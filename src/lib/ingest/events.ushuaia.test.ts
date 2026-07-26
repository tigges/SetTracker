import assert from "node:assert/strict";
import {
  inferFestivalEvent,
  resolveEvent,
  KNOWN_EVENTS,
} from "./events";

assert.equal(
  inferFestivalEvent(
    "Gorgon City | 2024 Defected #Livestream at Ushuaïa Ibiza",
  )?.slug,
  "ushuaia-ibiza",
);
assert.equal(
  KNOWN_EVENTS["ushuaia-ibiza"]!.instagram,
  "https://www.instagram.com/ushuaiaibiza/",
);
assert.equal(resolveEvent("Ushuaia").slug, "ushuaia-ibiza");
assert.match(
  KNOWN_EVENTS["ushuaia-ibiza"]!.website!,
  /theushuaiaexperience/,
);

console.log("events.ushuaia.test.ts ok");
