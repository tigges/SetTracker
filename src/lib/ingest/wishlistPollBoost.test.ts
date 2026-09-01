import assert from "node:assert/strict";
import {
  boostedSoundcloudArtistLimit,
  boostedYoutubeArtistLimit,
  isWishlistRosterName,
  wishlistPollBoostOn,
} from "./wishlistPollBoost";

assert.equal(wishlistPollBoostOn({}), false);
assert.equal(wishlistPollBoostOn({ WISHLIST_POLL_BOOST: "0" }), false);
assert.equal(wishlistPollBoostOn({ WISHLIST_POLL_BOOST: "1" }), true);

assert.equal(isWishlistRosterName("Dillon Francis"), true);
assert.equal(isWishlistRosterName("Marten Horger"), true);
assert.equal(isWishlistRosterName("Chapter & Verse"), true);
assert.equal(isWishlistRosterName("GREG 99"), true);
assert.equal(isWishlistRosterName("James Hype"), false);

assert.equal(
  boostedYoutubeArtistLimit({
    priority: "normal",
    name: "Wenzday",
    defaultLimit: 50,
    highLimit: 80,
  }),
  50,
);
assert.equal(
  boostedYoutubeArtistLimit({
    priority: "normal",
    name: "Wenzday",
    defaultLimit: 50,
    highLimit: 80,
    env: { WISHLIST_POLL_BOOST: "1" },
  }),
  80,
);
assert.equal(
  boostedYoutubeArtistLimit({
    priority: "high",
    name: "James Hype",
    defaultLimit: 50,
    highLimit: 80,
  }),
  80,
);
assert.equal(
  boostedYoutubeArtistLimit({
    priority: "normal",
    name: "James Hype",
    defaultLimit: 50,
    highLimit: 80,
    env: { WISHLIST_POLL_BOOST: "1" },
  }),
  50,
);

assert.equal(
  boostedSoundcloudArtistLimit({
    priority: "normal",
    name: "Wenzday",
    deepLimit: 50,
  }),
  40,
);
assert.equal(
  boostedSoundcloudArtistLimit({
    priority: "normal",
    name: "Wenzday",
    deepLimit: 50,
    env: { WISHLIST_POLL_BOOST: "1" },
  }),
  50,
);
assert.equal(
  boostedSoundcloudArtistLimit({
    priority: "high",
    name: "FISHER",
    deepLimit: 50,
  }),
  50,
);

console.log("wishlistPollBoost.test.ts ok");
