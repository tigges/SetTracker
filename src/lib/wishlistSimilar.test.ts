import assert from "node:assert/strict";
import {
  collaboratorHintsFromSets,
  rankWishlistSimilar,
  similarReasonLine,
} from "./wishlistSimilar";

const catalog = [
  { slug: "fisher", name: "FISHER", genre: "Tech House", isBrowseReady: true },
  {
    slug: "chris-lake",
    name: "Chris Lake",
    genre: "Tech House",
    isBrowseReady: true,
  },
  {
    slug: "chris-lorenzo",
    name: "Chris Lorenzo",
    genre: "Bass House",
    isBrowseReady: true,
  },
  { slug: "dom-dolla", name: "Dom Dolla", genre: "Tech House", isBrowseReady: true },
  { slug: "junk-mix", name: "Junk Mix", genre: "Tech House", isJunk: true },
  { slug: "empty-stub", name: "Empty", genre: "Tech House", setCount: 0 },
];

{
  const rows = rankWishlistSimilar({
    wishlisted: ["fisher"],
    hintsBySlug: {
      fisher: [{ slug: "chris-lake", reason: "Shared a set", weight: 30 }],
    },
    catalog,
  });
  assert.equal(rows[0]?.slug, "chris-lake");
  assert.equal(rows[0]?.reason, "Played with FISHER");
  assert.ok(rows.some((r) => r.slug === "dom-dolla"));
  assert.ok(!rows.some((r) => r.slug === "fisher"));
  assert.ok(!rows.some((r) => r.slug === "junk-mix"));
  assert.ok(!rows.some((r) => r.slug === "empty-stub"));
}

{
  const rows = rankWishlistSimilar({
    wishlisted: ["fisher", "chris-lake"],
    hintsBySlug: {
      fisher: [{ slug: "chris-lake", reason: "Shared a set", weight: 30 }],
      "chris-lake": [{ slug: "fisher", reason: "Shared a set", weight: 30 }],
    },
    catalog,
  });
  assert.ok(!rows.some((r) => r.slug === "chris-lake"));
  assert.ok(!rows.some((r) => r.slug === "fisher"));
}

{
  const rows = rankWishlistSimilar({
    wishlisted: ["fisher", "chris-lorenzo"],
    hintsBySlug: {
      fisher: [{ slug: "dom-dolla", reason: "Shared a set", weight: 25 }],
      "chris-lorenzo": [
        { slug: "dom-dolla", reason: "Shared a set", weight: 25 },
      ],
    },
    catalog,
  });
  assert.equal(rows[0]?.slug, "dom-dolla");
  assert.ok((rows[0]?.score ?? 0) >= 50);
  assert.equal(rows[0]?.reason, "Like FISHER and Chris Lorenzo");
}

{
  const hints = collaboratorHintsFromSets([
    { setId: "s1", slug: "fisher" },
    { setId: "s1", slug: "chris-lake" },
    { setId: "s2", slug: "fisher" },
    { setId: "s2", slug: "chris-lake" },
    { setId: "s2", slug: "dom-dolla" },
  ]);
  const lake = hints.fisher?.find((h) => h.slug === "chris-lake");
  assert.ok(lake);
  assert.equal(lake.weight, 30);
  assert.equal(lake.reason, "Shared a set");
}

assert.equal(
  similarReasonLine({
    viaNames: ["FISHER", "Chris Lake"],
    topReason: "Shared a set",
  }),
  "Like FISHER and Chris Lake",
);

console.log("wishlistSimilar.test.ts ok");
