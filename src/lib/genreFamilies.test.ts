import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANONICAL_GENRES } from "./genre";
import {
  catalogGenresInFamily,
  familiesPresentInCatalog,
  familyFilterValue,
  familyIdForGenre,
  genreFilterLabel,
  GENRE_FAMILIES,
  setMatchesGenreFilter,
} from "./genreFamilies";

describe("genre families", () => {
  it("maps every canonical genre to a family", () => {
    const mapped = new Set(GENRE_FAMILIES.flatMap((f) => [...f.members]));
    for (const g of CANONICAL_GENRES) {
      assert.ok(mapped.has(g), `${g} missing from a family`);
    }
  });

  it("clusters house children under the House family", () => {
    assert.equal(familyIdForGenre("Tech House"), "house");
    assert.equal(familyIdForGenre("Bass House"), "house");
    assert.equal(familyIdForGenre("Melodic Techno"), "techno");
    assert.equal(familyIdForGenre("UK Garage"), "bass");
    assert.equal(familyIdForGenre("Hip Hop"), "other");
    assert.equal(familyIdForGenre("Unknown Style"), "other");
  });

  it("family filter matches any child; exact filter does not", () => {
    const tech = { genre: "Tech House", genres: ["Tech House"] };
    const afro = { genre: "Afro House", genres: ["Afro House"] };
    const techno = { genre: "Techno", genres: ["Techno"] };
    const houseFamily = familyFilterValue("house");

    assert.equal(setMatchesGenreFilter(tech, "all"), true);
    assert.equal(setMatchesGenreFilter(tech, houseFamily), true);
    assert.equal(setMatchesGenreFilter(afro, houseFamily), true);
    assert.equal(setMatchesGenreFilter(techno, houseFamily), false);
    assert.equal(setMatchesGenreFilter(tech, "Tech House"), true);
    assert.equal(setMatchesGenreFilter(afro, "Tech House"), false);
  });

  it("hides empty families and lists catalog children", () => {
    const catalog = ["Tech House", "Techno", "Trance"];
    const present = familiesPresentInCatalog(catalog).map((f) => f.id);
    assert.deepEqual(present, ["house", "techno", "trance"]);
    assert.deepEqual(catalogGenresInFamily("house", catalog), ["Tech House"]);
    assert.equal(genreFilterLabel("all"), "All");
    assert.equal(genreFilterLabel(familyFilterValue("house")), "House");
    assert.equal(genreFilterLabel("Tech House"), "Tech House");
  });
});
