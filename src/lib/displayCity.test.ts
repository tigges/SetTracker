import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { displayCity } from "./displayCity";

describe("displayCity", () => {
  it("keeps short place names", () => {
    assert.equal(displayCity("Berlin, DE"), "Berlin, DE");
    assert.equal(displayCity("Netherlands"), "Netherlands");
  });

  it("drops bios and unknowns", () => {
    assert.equal(displayCity("Unknown."), null);
    assert.equal(displayCity("“Unknown.”"), null);
    assert.equal(
      displayCity("Germany, living on the shores outside of Amsterdam."),
      null,
    );
  });
});
