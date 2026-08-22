import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBrowseReadySet,
  isEmptyOrPreviewSet,
  isNonCatalogSet,
  isSearchableSet,
  setDisplayThumb,
} from "./setBrowse";

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
    assert.equal(
      isSearchableSet({
        imageUrl: null,
        title: "Dom Dolla | Creamfields 2025",
        trackCount: 20,
        durationSec: 3600,
      }),
      true,
    );
    assert.equal(
      isSearchableSet({
        imageUrl: null,
        title: "ASOT Mix 2 [Preview]",
        trackCount: 0,
      }),
      false,
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

  it("hides empty and [Preview] sets when counts are known", () => {
    assert.equal(isEmptyOrPreviewSet({ trackCount: 0, title: "ASOT Mix 2" }), true);
    assert.equal(
      isEmptyOrPreviewSet({
        title: "A State of Trance 2026 - Mix 2 [Preview]",
        trackCount: 3,
        durationSec: 600,
      }),
      true,
    );
    assert.equal(
      isEmptyOrPreviewSet({ title: "Tomorrowland 2026", trackCount: 20 }),
      false,
    );
    assert.equal(
      isBrowseReadySet({
        imageUrl: "https://example.com/set.jpg",
        title: "ASOT Mix 2 [Preview]",
        trackCount: 0,
      }),
      false,
    );
  });

  it("rejects Shorts and produce-a-track tutorials", () => {
    assert.equal(
      isNonCatalogSet({ title: "House, Tech & Minimal: 12.03.22" }),
      true,
    );
    assert.equal(isNonCatalogSet({ title: "Minimal" }), true);
    assert.equal(isNonCatalogSet({ title: "One World Radio Shorts" }), true);
    assert.equal(
      isNonCatalogSet({
        title: "Pegassi Makes A Trance Track From Scratch",
      }),
      true,
    );
    assert.equal(
      isNonCatalogSet({ title: "Dom Dolla | Creamfields 2025" }),
      false,
    );
  });
});
