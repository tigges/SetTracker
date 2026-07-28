import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertCanonicalWordBudget,
  DEFAULT_GENRE,
  ensureGenre,
  expandGenres,
  normalizeGenre,
  normalizeGenreList,
} from "./genre";

describe("normalizeGenre", () => {
  it("canonicalizes synonyms and case", () => {
    assert.equal(normalizeGenre("techhouse"), "Tech House");
    assert.equal(normalizeGenre("TECH HOUSE"), "Tech House");
    assert.equal(normalizeGenre("bass"), "Bass House");
    assert.equal(normalizeGenre("uk bass"), "Bass House");
    assert.equal(normalizeGenre("ukg"), "UK Garage");
    assert.equal(normalizeGenre("UKG"), "UK Garage");
    assert.equal(normalizeGenre("dnb"), "Drum & Bass");
    assert.equal(normalizeGenre("hip-hop"), "Hip Hop");
    assert.equal(normalizeGenre("G House"), "G-House");
    assert.equal(normalizeGenre("dance"), "House");
    assert.equal(normalizeGenre("Electronic"), "House");
    assert.equal(normalizeGenre("trance"), "Trance");
    assert.equal(normalizeGenre("Big Room"), "Big Room");
    assert.equal(normalizeGenre("bigroom"), "Big Room");
    assert.equal(normalizeGenre("Melodic Techno"), "Melodic Techno");
  });

  it("ensureGenre never returns null", () => {
    assert.equal(ensureGenre("techhouse"), "Tech House");
    assert.equal(ensureGenre("guestmix"), DEFAULT_GENRE);
    assert.equal(ensureGenre(null, "Bass House"), "Bass House");
    assert.equal(ensureGenre("liveset", null, undefined), DEFAULT_GENRE);
  });

  it("rejects format tags / non-genres", () => {
    assert.equal(normalizeGenre("guestmix"), null);
    assert.equal(normalizeGenre("GUESTMIX"), null);
    assert.equal(normalizeGenre("Guest Mix"), null);
    assert.equal(normalizeGenre("livesets"), null);
    assert.equal(normalizeGenre("Live Set"), null);
    assert.equal(normalizeGenre("DJ Set"), null);
    assert.equal(normalizeGenre("Podcast"), null);
    assert.equal(normalizeGenre("radio"), null);
    assert.equal(normalizeGenre("IIX"), null);
  });

  it("keeps canonical genres to 1–2 words", () => {
    assert.doesNotThrow(() => assertCanonicalWordBudget());
  });
});

describe("expandGenres", () => {
  it("splits Melodic House & Techno", () => {
    assert.deepEqual(expandGenres("Melodic House & Techno"), [
      "Melodic House",
      "Techno",
    ]);
  });

  it("splits Trance Techno Hard house", () => {
    assert.deepEqual(expandGenres("Trance Techno Hard house"), [
      "Trance",
      "Techno",
      "Hard House",
    ]);
  });

  it("returns empty for guestmix / live set", () => {
    assert.deepEqual(expandGenres("GUESTMIX"), []);
    assert.deepEqual(expandGenres("Live Set"), []);
  });
});

describe("normalizeGenreList", () => {
  it("dedupes and expands compounds for chips", () => {
    assert.deepEqual(
      normalizeGenreList([
        "tech house",
        "Tech House",
        "guestmix",
        "Live Set",
        "bass",
        "Melodic House & Techno",
        "Trance Techno Hard house",
        "ukg",
      ]),
      [
        "Bass House",
        "Hard House",
        "Melodic House",
        "Tech House",
        "Techno",
        "Trance",
        "UK Garage",
      ],
    );
  });
});
