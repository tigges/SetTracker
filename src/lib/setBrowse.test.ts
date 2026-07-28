import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBrowseReadySet, setDisplayThumb } from "./setBrowse";

describe("setBrowse", () => {
  it("prefers set cover over DJ portrait", () => {
    assert.equal(
      setDisplayThumb({
        imageUrl: "https://example.com/set.jpg",
        primaryDjImageUrl: "https://example.com/dj.jpg",
      }),
      "https://example.com/set.jpg",
    );
  });

  it("falls back to DJ portrait", () => {
    assert.equal(
      setDisplayThumb({
        imageUrl: null,
        primaryDjImageUrl: "https://example.com/dj.jpg",
      }),
      "https://example.com/dj.jpg",
    );
  });

  it("hides monogram-only sets", () => {
    assert.equal(isBrowseReadySet({ imageUrl: null, primaryDjImageUrl: null }), false);
    assert.equal(isBrowseReadySet({ imageUrl: "  ", primaryDjImageUrl: "" }), false);
    assert.equal(
      isBrowseReadySet({
        imageUrl: "https://example.com/set.jpg",
        primaryDjImageUrl: null,
      }),
      true,
    );
  });

  it("hides sets whose primary is a mix-title junk name", () => {
    assert.equal(
      isBrowseReadySet({
        imageUrl: "https://example.com/set.jpg",
        primaryDjName: "Afro House Late Evening MIX",
      }),
      false,
    );
    assert.equal(
      isBrowseReadySet({
        imageUrl: "https://example.com/set.jpg",
        primaryDjName: "Black Coffee",
      }),
      true,
    );
  });
});
