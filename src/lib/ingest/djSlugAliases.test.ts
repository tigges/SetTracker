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

  it("folds producer-reviewed set-title slugs onto the artist", () => {
    assert.equal(canonicalDjSlug("mau-p-sunrise"), "mau-p");
    assert.equal(
      canonicalDjSlug("layton-giordani-space-miami-1-10-25"),
      "layton-giordani",
    );
    assert.equal(canonicalDjSlug("mandy-mondays"), "mandy");
  });

  it("folds Recovery balloon film slugs onto Hot Since 82", () => {
    assert.equal(
      canonicalDjSlug("recovery-hot-air-balloon"),
      "hot-since-82",
    );
    assert.equal(
      canonicalDjSlug("recovery-hot-air-balloon-set"),
      "hot-since-82",
    );
    assert.equal(canonicalDjSlug("hot-since-82"), "hot-since-82");
  });

  it("folds Artist SELECTS show slugs onto the artist", () => {
    assert.equal(canonicalDjSlug("laidback-luke-selects"), "laidback-luke");
    assert.equal(canonicalDjSlug("laidback-luke"), "laidback-luke");
  });
});
