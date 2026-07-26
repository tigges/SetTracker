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
assert.ok(KNOWN_EVENTS.stereohype.instagram?.includes("stereohype"));

console.log("events.stereohype.test.ts ok");
