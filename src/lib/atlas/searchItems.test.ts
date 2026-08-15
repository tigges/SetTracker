import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { atlasSearchItems } from "./searchItems";

describe("atlas search index", () => {
  it("indexes Top 100 venues and DJs as /atlas#slug", () => {
    const items = atlasSearchItems();
    assert.ok(items.length >= 200);
    const tml = items.find((i) => i.href === "/atlas#tomorrowland");
    assert.equal(tml?.kind, "atlas");
    assert.match(tml?.title ?? "", /tomorrowland/i);
    const guetta = items.find((i) => i.href === "/atlas#david-guetta");
    assert.equal(guetta?.kind, "atlas");
    assert.match(guetta?.title ?? "", /guetta/i);
  });
});
