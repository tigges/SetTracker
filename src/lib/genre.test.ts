import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertCanonicalWordBudget,
  DEFAULT_GENRE,
  ensureGenre,
  expandGenres,
  isGenreTagName,
  normalizeGenre,
  normalizeGenreList,
} from "./genre";

describe("normalizeGenre", () => {
  it("canonicalizes synonyms and case", () => {
    assert.equal(normalizeGenre("techhouse"), "Tech House");
    assert.equal(normalizeGenre("TECH HOUSE"), "Tech House");
    assert.equal(normalizeGenre("tech"), "Tech House");
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
    assert.equal(normalizeGenre("gqom"), "Gqom");
    assert.equal(normalizeGenre("Gqom"), "Gqom");
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

describe("isGenreTagName", () => {
  it("flags single genres and comma lists, not people", () => {
    assert.equal(isGenreTagName("House"), true);
    assert.equal(isGenreTagName("Afro House"), true);
    assert.equal(isGenreTagName("House, Tech"), true);
    assert.equal(isGenreTagName("House / Tech"), true);
    assert.equal(isGenreTagName("House, Tech & Minimal"), true);
    assert.equal(isGenreTagName("House, Tech & Minimal: 12.03.22"), true);
    assert.equal(isGenreTagName("Melodic House & Techno"), true);
    assert.equal(isGenreTagName("Minimal"), true);
    assert.equal(isGenreTagName("Minimal: 12.03.22"), true);
    assert.equal(isGenreTagName("House of Yes"), false);
    assert.equal(isGenreTagName("Fisher House"), false);
    assert.equal(isGenreTagName("Kaskade"), false);
    assert.equal(isGenreTagName("Soweto Punk"), false);
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
