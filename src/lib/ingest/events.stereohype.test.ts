import assert from "node:assert/strict";
import { inferFestivalEvent, KNOWN_EVENTS } from "./events";
import { labelSocials } from "../social";

assert.equal(
  inferFestivalEvent("R3WIRE - House & Tech Live on STEREOHYPE")?.slug,
  "stereohype",
);
assert.ok(
  labelSocials("STEREOHYPE").soundcloud?.includes("stereohypeglobal"),
);
assert.equal(labelSocials("Dim Mak").website, "https://www.dimmak.com/");
assert.equal(
  labelSocials("dim-mak").soundcloud,
  "https://soundcloud.com/dimmakrecords",
);
assert.equal(
  labelSocials("Dim Mak").instagram,
  "https://www.instagram.com/dimmak/",
);
assert.ok(KNOWN_EVENTS.stereohype.instagram?.includes("stereohype"));

console.log("events.stereohype.test.ts ok");
