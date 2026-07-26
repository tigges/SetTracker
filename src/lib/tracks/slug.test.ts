import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allocateTrackSlug, trackSlugBase } from "./slug";

describe("trackSlugBase", () => {
  it("builds artist-title slugs", () => {
    assert.equal(trackSlugBase("FISHER", "Losing It"), "fisher-losing-it");
  });

  it("strips diacritics", () => {
    assert.equal(
      trackSlugBase("Marten Hörger", "Men Machine"),
      "marten-horger-men-machine",
    );
  });
});

describe("allocateTrackSlug", () => {
  it("returns base when free", async () => {
    const slug = await allocateTrackSlug("A", "B", async () => false);
    assert.equal(slug, "a-b");
  });

  it("suffixes on collision", async () => {
    const taken = new Set(["a-b", "a-b-2"]);
    const slug = await allocateTrackSlug("A", "B", async (c) => taken.has(c));
    assert.equal(slug, "a-b-3");
  });
});
