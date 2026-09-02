import assert from "node:assert/strict";
import { slugify } from "./ingest/types";
import {
  EMPTY_WISHLIST_OVERLAY,
  WISHLIST_DEFAULTS,
  effectiveWishlistSlugs,
  isWishlisted,
  normalizeWishlistSlug,
  parseWishlistOverlay,
  toggleWishlistSlug,
  wishlistDefaultSlugSet,
  wishlistDefaultSlugs,
  wishlistIsCustomized,
  wishlistLabel,
} from "./wishlist";

assert.equal(WISHLIST_DEFAULTS.length, 27);
assert.equal(new Set(wishlistDefaultSlugs()).size, 27);
assert.equal(normalizeWishlistSlug("dradeazy"), "bradeazy");
assert.equal(normalizeWishlistSlug("breazly"), "bradeazy");
assert.equal(normalizeWishlistSlug("Marten Hørger"), "marten-horger");
assert.equal(normalizeWishlistSlug("Chapter & Verse"), "chapter-verse");
assert.equal(normalizeWishlistSlug("Mau P"), "mau-p");
assert.equal(normalizeWishlistSlug("Gregg GG"), "greg-99");
assert.equal(normalizeWishlistSlug("Greg GG"), "greg-99");
assert.equal(normalizeWishlistSlug("GREG 99"), "greg-99");
assert.equal(normalizeWishlistSlug("FISHER"), "fisher");
assert.equal(normalizeWishlistSlug("MEDUZA"), "meduza");
assert.ok(!wishlistDefaultSlugs().includes("dradeazy"));
assert.ok(!wishlistDefaultSlugs().includes("gregg-gg"));
assert.ok(!wishlistDefaultSlugs().includes("lao"));
assert.ok(wishlistDefaultSlugs().includes("bradeazy"));
assert.ok(wishlistDefaultSlugs().includes("greg-99"));
assert.ok(wishlistDefaultSlugSet().has("valentino-khan"));
assert.ok(wishlistDefaultSlugSet().has("malaa"));
assert.ok(wishlistDefaultSlugSet().has("jauz"));
assert.ok(wishlistDefaultSlugSet().has("brohug"));
assert.ok(wishlistDefaultSlugSet().has("wenzday"));
assert.ok(wishlistDefaultSlugSet().has("dimitri-vegas-like-mike"));
assert.equal(
  normalizeWishlistSlug("Dimitri Vegas & Mike"),
  "dimitri-vegas-like-mike",
);
assert.equal(
  normalizeWishlistSlug("dimitri-vegas-mike"),
  "dimitri-vegas-like-mike",
);

for (const row of WISHLIST_DEFAULTS) {
  assert.equal(slugify(row.name), row.slug, `${row.name} → ${row.slug}`);
}

const empty = parseWishlistOverlay("");
assert.deepEqual(effectiveWishlistSlugs(empty), wishlistDefaultSlugs());
assert.equal(isWishlisted("chris-lorenzo", empty), true);
assert.equal(isWishlisted("dradeazy", empty), true);
assert.equal(wishlistIsCustomized(empty), false);

const junk = parseWishlistOverlay("{not json");
assert.deepEqual(junk, EMPTY_WISHLIST_OVERLAY);

const dropped = toggleWishlistSlug(empty, "Chris Lorenzo");
assert.equal(isWishlisted("chris-lorenzo", dropped), false);
assert.equal(wishlistIsCustomized(dropped), true);
assert.ok(!effectiveWishlistSlugs(dropped).includes("chris-lorenzo"));
assert.equal(effectiveWishlistSlugs(dropped).length, 26);

const restored = toggleWishlistSlug(dropped, "chris-lorenzo");
assert.equal(isWishlisted("chris-lorenzo", restored), true);
assert.equal(wishlistIsCustomized(restored), false);

const extra = toggleWishlistSlug(empty, "Peggy Gou");
assert.equal(isWishlisted("peggy-gou", extra), true);
assert.equal(wishlistIsCustomized(extra), true);
assert.equal(effectiveWishlistSlugs(extra).at(-1), "peggy-gou");

const extraOff = toggleWishlistSlug(extra, "peggy-gou");
assert.equal(isWishlisted("peggy-gou", extraOff), false);
assert.equal(wishlistIsCustomized(extraOff), false);

assert.equal(wishlistLabel("bradeazy"), "bradeazy");
assert.equal(wishlistLabel("bradeazy", "bradeazy"), "bradeazy");
assert.equal(wishlistLabel("marten-horger", "Marten Horger"), "Marten Horger");

console.log("wishlist.test.ts ok");
