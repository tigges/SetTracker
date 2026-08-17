import assert from "node:assert/strict";
import { dropPasteOnlyUrls, isPasteOnlyIdentifyUrl } from "./pasteOnly";

assert.equal(isPasteOnlyIdentifyUrl("https://audioscout.io/result/abc"), true);
assert.equal(
  isPasteOnlyIdentifyUrl("https://www.getmusicmate.com/mix/1"),
  true,
);
assert.equal(isPasteOnlyIdentifyUrl("https://trackid.net/x"), true);
assert.equal(isPasteOnlyIdentifyUrl("https://www.audd.io/"), false);
assert.equal(isPasteOnlyIdentifyUrl("https://musicbrainz.org/recording/1"), false);
assert.equal(isPasteOnlyIdentifyUrl("https://set79.com/tracklists/x"), false);
assert.equal(isPasteOnlyIdentifyUrl("not-a-url"), false);

const clean = dropPasteOnlyUrls({
  spotify: "https://open.spotify.com/track/1",
  soundcloud: "https://audioscout.io/r/1",
  youtube: "https://www.getmusicmate.com/x",
});
assert.equal(clean.spotify, "https://open.spotify.com/track/1");
assert.equal(clean.soundcloud, undefined);
assert.equal(clean.youtube, undefined);

console.log("identify/pasteOnly.test.ts ok");
