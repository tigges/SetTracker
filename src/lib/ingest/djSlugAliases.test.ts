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

  it("folds Dom Dolla / Odd Mob set-title slug accidents", () => {
    assert.equal(
      canonicalDjSlug("dom-dolla-dancefloor-currency"),
      "dom-dolla",
    );
    assert.equal(
      canonicalDjSlug("odd-mob-at-seismic-dance-event-8-0"),
      "odd-mob",
    );
  });

  it("folds festival weekend edition slugs onto the artist", () => {
    assert.equal(canonicalDjSlug("armin-van-buuren-we1"), "armin-van-buuren");
    assert.equal(canonicalDjSlug("odd-mob-we2"), "odd-mob");
    assert.equal(canonicalDjSlug("david-guetta-we-2"), "david-guetta");
    assert.equal(canonicalDjSlug("armin-van-buuren"), "armin-van-buuren");
  });

  it("folds Artist SELECTS show slugs onto the artist", () => {
    assert.equal(canonicalDjSlug("laidback-luke-selects"), "laidback-luke");
    assert.equal(canonicalDjSlug("laidback-luke"), "laidback-luke");
  });
});
