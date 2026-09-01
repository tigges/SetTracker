import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCatalogWorkDj,
  isHearthisOnlyLeak,
} from "./djCatalog";

describe("djCatalog", () => {
  it("flags hearthis-only hobbyist leaks", () => {
    const sets = [
      { sourceName: "hearthis.at", type: "mix" },
      { sourceName: "hearthis.at", sourceUrl: "https://hearthis.at/x/y/", type: "radio" },
    ];
    assert.equal(isHearthisOnlyLeak(sets), true);
    assert.equal(
      isCatalogWorkDj({ slug: "harlemoverdrive", sets }),
      false,
    );
  });

  it("keeps DJs with SoundCloud / YouTube or a festival", () => {
    assert.equal(
      isHearthisOnlyLeak([{ sourceName: "SoundCloud", type: "mix" }]),
      false,
    );
    assert.equal(
      isHearthisOnlyLeak([
        { sourceName: "hearthis.at", type: "festival", eventKind: "festival" },
      ]),
      false,
    );
    assert.equal(
      isCatalogWorkDj({
        slug: "lucas",
        sets: [{ sourceName: "SoundCloud", type: "radio" }],
      }),
      true,
    );
  });

  it("keeps curated hearthis seeds (Gentlemen's Groove)", () => {
    assert.equal(
      isCatalogWorkDj({
        slug: "gentlemens-groove",
        sets: [{ sourceName: "hearthis.at", type: "mix" }],
      }),
      true,
    );
  });

  it("keeps wishlist defaults before their first set", () => {
    assert.equal(
      isCatalogWorkDj({ slug: "valentino-khan", sets: [] }),
      true,
    );
    assert.equal(isCatalogWorkDj({ slug: "greg-99", sets: [] }), true);
    assert.equal(isCatalogWorkDj({ slug: "malaa", sets: [] }), true);
    assert.equal(isCatalogWorkDj({ slug: "wenzday", sets: [] }), true);
  });
});
