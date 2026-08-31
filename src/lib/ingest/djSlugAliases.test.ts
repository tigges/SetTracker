import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalDjSlug, DJ_SLUG_ALIASES } from "./djSlugAliases";
import { slugify } from "./types";

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

  it("folds MUCHAKK performance leftover onto MU540", () => {
    assert.equal(canonicalDjSlug("muchakk-mu540"), "mu540");
    assert.equal(canonicalDjSlug("mu540"), "mu540");
    assert.equal(canonicalDjSlug("mochakk"), "mochakk");
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

  it("folds Full Set title slugs onto the artist", () => {
    assert.equal(canonicalDjSlug("chris-lake-full"), "chris-lake");
    assert.equal(canonicalDjSlug("chris-lake-full-set"), "chris-lake");
    assert.equal(canonicalDjSlug("james-hype-official-full-set"), "james-hype");
    assert.equal(canonicalDjSlug("chris-lake"), "chris-lake");
  });

  it("folds Artist SELECTS show slugs onto the artist", () => {
    assert.equal(canonicalDjSlug("laidback-luke-selects"), "laidback-luke");
    assert.equal(canonicalDjSlug("laidback-luke"), "laidback-luke");
  });

  it("folds HALŌ onto DubVision", () => {
    assert.equal(slugify("HALŌ"), "halo");
    assert.equal(canonicalDjSlug("halo"), "dubvision");
    assert.equal(canonicalDjSlug(slugify("HALŌ")), "dubvision");
    assert.equal(canonicalDjSlug("dubvision"), "dubvision");
  });

  it("does not alias leftover lucas onto the duo (solo profile may remain)", () => {
    assert.equal(canonicalDjSlug("lucas"), "lucas");
    assert.equal(canonicalDjSlug("lucas-steve"), "lucas-steve");
    assert.equal(canonicalDjSlug("steve-aoki"), "steve-aoki");
  });
});
