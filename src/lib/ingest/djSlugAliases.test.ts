import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalDjSlug, DJ_SLUG_ALIASES } from "./djSlugAliases";

describe("djSlugAliases", () => {
  it("folds Gentlemen's Groove slugify variant", () => {
    assert.equal(DJ_SLUG_ALIASES["gentlemen-s-groove"], "gentlemens-groove");
    assert.equal(canonicalDjSlug("gentlemen-s-groove"), "gentlemens-groove");
    assert.equal(canonicalDjSlug("gentlemens-groove"), "gentlemens-groove");
    assert.equal(canonicalDjSlug("chris-lorenzo"), "chris-lorenzo");
  });
});
