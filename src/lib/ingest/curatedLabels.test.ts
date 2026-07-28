import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CURATED_LABELS,
  CURATED_LABEL_SLUGS,
  curatedLabelSlug,
} from "./curatedLabels";
import { slugify } from "./types";

describe("curatedLabels", () => {
  it("has unique slugs", () => {
    const slugs = CURATED_LABELS.map(curatedLabelSlug);
    assert.equal(slugs.length, new Set(slugs).size);
    assert.equal(CURATED_LABEL_SLUGS.size, slugs.length);
  });

  it("includes seed staples and Beatstats imprints", () => {
    assert.ok(CURATED_LABEL_SLUGS.has("nightbass"));
    assert.ok(CURATED_LABEL_SLUGS.has("defected"));
    assert.ok(CURATED_LABEL_SLUGS.has("toolroom"));
    assert.ok(CURATED_LABEL_SLUGS.has("disorder"));
    assert.ok(CURATED_LABEL_SLUGS.has("experts-only"));
    assert.ok(CURATED_LABEL_SLUGS.has("anjunadeep"));
    assert.ok(CURATED_LABEL_SLUGS.has("crosstown-rebels"));
    assert.ok(CURATED_LABEL_SLUGS.has("moblack-records"));
    assert.ok(CURATED_LABEL_SLUGS.has("steel-city-dance-discs"));
    assert.ok(CURATED_LABEL_SLUGS.has("soulfuric-trax"));
    assert.ok(CURATED_LABEL_SLUGS.has("you-me-records"));
    assert.equal(slugify("You&Me Records"), "you-me-records");
  });

  it("skips major-label noise from the chart dump", () => {
    const names = new Set(CURATED_LABELS.map((l) => l.name.toLowerCase()));
    assert.equal(names.has("warner records"), false);
    assert.equal(names.has("atlantic records uk"), false);
    assert.equal(names.has("kettama"), false);
  });
});
