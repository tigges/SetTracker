import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertCanonicalWordBudget,
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
    assert.equal(normalizeGenre("dnb"), "Drum & Bass");
    assert.equal(normalizeGenre("hip-hop"), "Hip Hop");
    assert.equal(normalizeGenre("G House"), "G-House");
    assert.equal(normalizeGenre("dance"), "House");
    assert.equal(normalizeGenre("Electronic"), "House");
  });

  it("rejects format tags", () => {
    assert.equal(normalizeGenre("guestmix"), null);
    assert.equal(normalizeGenre("Guest Mix"), null);
    assert.equal(normalizeGenre("livesets"), null);
    assert.equal(normalizeGenre("Live Set"), null);
    assert.equal(normalizeGenre("DJ Set"), null);
    assert.equal(normalizeGenre("Podcast"), null);
    assert.equal(normalizeGenre("radio"), null);
  });

  it("dedupes lists for filter chips", () => {
    assert.deepEqual(
      normalizeGenreList(["tech house", "Tech House", "guestmix", "bass"]),
      ["Bass House", "Tech House"],
    );
  });

  it("keeps canonical genres to 1–2 words", () => {
    assert.doesNotThrow(() => assertCanonicalWordBudget());
  });
});
