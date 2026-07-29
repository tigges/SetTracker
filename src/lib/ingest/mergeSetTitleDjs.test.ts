import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveCanonicalFromSetTitleDj } from "./mergeSetTitleDjs";

describe("resolveCanonicalFromSetTitleDj", () => {
  it("folds Dom Dolla set-title accidents onto dom-dolla", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Dom Dolla // Dancefloor Currency",
        "dom-dolla-dancefloor-currency",
      ),
      { slug: "dom-dolla", name: "Dom Dolla" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj("Dom Dolla Warm Up", "dom-dolla-warm-up"),
      { slug: "dom-dolla", name: "Dom Dolla" },
    );
  });

  it("folds Odd Mob venue titles onto odd-mob", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Odd Mob at Seismic Dance Event 8.0",
        "odd-mob-at-seismic-dance-event-8-0",
      ),
      { slug: "odd-mob", name: "Odd Mob" },
    );
  });

  it("leaves festival mega-mix Night Owl crumbs as series-only (no Dj)", () => {
    assert.equal(
      resolveCanonicalFromSetTitleDj(
        "Day Trip Festival 2024 Mega-Mix",
        "day-trip-festival-2024-mega-mix",
      ),
      null,
    );
  });

  it("folds Defected Virtual Festival onto Dom Dolla via set title", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Defected Virtual Festival 4.0",
        "defected-virtual-festival-4-0",
        ["Defected Virtual Festival 4.0 - Dom Dolla"],
      ),
      { slug: "dom-dolla", name: "Dom Dolla" },
    );
  });
});
