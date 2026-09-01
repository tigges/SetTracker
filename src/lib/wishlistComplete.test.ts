import assert from "node:assert/strict";
import {
  sortWishlistByNeeds,
  wishlistCompleteness,
  WISHLIST_GAP_LABEL,
  type WishlistCompleteDj,
} from "./wishlistComplete";

function dj(partial: Partial<WishlistCompleteDj> = {}): WishlistCompleteDj {
  return {
    slug: "fisher",
    name: "FISHER",
    imageUrl: "https://example.com/f.jpg",
    soundcloud: "https://soundcloud.com/fish-tales",
    youtube: "https://www.youtube.com/@fisher",
    instagram: null,
    twitter: null,
    website: null,
    beatport: null,
    setCount: 4,
    playCount: 40,
    identifiedPlayCount: 12,
    hasHandle: true,
    ...partial,
  };
}

assert.deepEqual(wishlistCompleteness(undefined), {
  gaps: ["no-page"],
  needsWork: true,
});
assert.equal(WISHLIST_GAP_LABEL["no-page"], "No catalog page");

{
  const ok = wishlistCompleteness(dj());
  assert.deepEqual(ok.gaps, []);
  assert.equal(ok.needsWork, false);
}

{
  const thin = wishlistCompleteness(
    dj({
      imageUrl: "  ",
      hasHandle: false,
      setCount: 0,
      playCount: 0,
      identifiedPlayCount: 0,
    }),
  );
  assert.deepEqual(thin.gaps, ["no-set", "no-thumb", "no-handle"]);
  assert.equal(thin.needsWork, true);
}

{
  const emptyList = wishlistCompleteness(
    dj({ setCount: 2, playCount: 18, identifiedPlayCount: 0 }),
  );
  assert.deepEqual(emptyList.gaps, ["no-ids"]);
}

{
  const noSets = wishlistCompleteness(
    dj({ setCount: 0, playCount: 0, identifiedPlayCount: 0 }),
  );
  assert.ok(!noSets.gaps.includes("no-ids"));
}

{
  const ranked = sortWishlistByNeeds(
    ["fisher", "wenzday", "tujamo", "anti-up"],
    (slug) => {
      if (slug === "fisher") return dj();
      if (slug === "wenzday") return dj({ slug, setCount: 0, identifiedPlayCount: 0 });
      if (slug === "anti-up") {
        return dj({
          slug,
          setCount: 1,
          identifiedPlayCount: 0,
          imageUrl: null,
          hasHandle: false,
        });
      }
      return undefined;
    },
  );
  assert.deepEqual(ranked, ["anti-up", "wenzday", "tujamo", "fisher"]);
}

console.log("wishlistComplete.test.ts ok");
