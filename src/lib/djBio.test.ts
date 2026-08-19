import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { displayDjBio } from "./djBio";
import { DJ_SOCIAL_PINS } from "./ingest/djSocialPins.data";

function pinBio(slug: string): string {
  const pin = DJ_SOCIAL_PINS.find((p) => p.slug === slug);
  assert.ok(pin, slug);
  return pin.bio;
}

describe("displayDjBio", () => {
  it("hides AC Slater handle dump after stripping genre", () => {
    assert.equal(
      displayDjBio(pinBio("ac-slater"), { genre: "Bass House" }),
      null,
    );
  });

  it("hides Guetta handle dump", () => {
    assert.equal(displayDjBio(pinBio("david-guetta"), { genre: "House" }), null);
  });

  it("keeps Solomun prose after stripping handles", () => {
    const out = displayDjBio(pinBio("solomun"), { genre: "Melodic House" });
    assert.ok(out);
    assert.match(out, /Diynamic/);
    assert.match(out, /Nobody is not loved/);
    assert.doesNotMatch(out, /@solomun/i);
    assert.doesNotMatch(out, /Beatport/i);
    assert.doesNotMatch(out, /solomun\.org/i);
  });

  it("keeps BISCITS booking and management", () => {
    const out = displayDjBio(pinBio("biscits"), { genre: "Tech House" });
    assert.ok(out);
    assert.match(out, /palmartists\.com/);
    assert.match(out, /teamwass\.com/);
    assert.doesNotMatch(out, /Tech House/);
  });

  it("keeps Honey Dijon disambiguation", () => {
    const out = displayDjBio(pinBio("honey-dijon"), { genre: "House" });
    assert.ok(out);
    assert.match(out, /Not the Paris club Djoon/);
    assert.doesNotMatch(out, /@honeydijon/);
  });

  it("hides Liu operator note plus dump", () => {
    assert.equal(
      displayDjBio(pinBio("liu"), { genre: "Brazilian Bass", homeCity: "Brazil" }),
      null,
    );
  });

  it("keeps NEGITIV booking and drops the 1001 note", () => {
    const out = displayDjBio(pinBio("negitiv"), {
      genre: "Hard Techno",
      homeCity: "Cologne",
    });
    assert.ok(out);
    assert.match(out, /BCB Family/);
    assert.doesNotMatch(out, /1001/);
  });

  it("hides 1788-L dump including no-SC note", () => {
    assert.equal(
      displayDjBio(pinBio("1788-l"), { genre: "Riddim", homeCity: "United States" }),
      null,
    );
  });

  it("returns null for empty", () => {
    assert.equal(displayDjBio(null), null);
    assert.equal(displayDjBio("   "), null);
  });
});
