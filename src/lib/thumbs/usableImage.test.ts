import assert from "node:assert/strict";
import {
  isPlaceholderArtistImage,
  usableImageUrl,
} from "./usableImage";

const emptyHash =
  "https://cdn-images.dzcdn.net/images/artist/d41d8cd98f00b204e9800998ecf8427e/250x250-000000-80-0-0.jpg";
const fasterHorses =
  "https://cdn-images.dzcdn.net/images/artist/d8315de10c16736f16b43549fb360448/250x250-000000-80-0-0.jpg";
const bexxieSilhouette =
  "https://cdn-images.dzcdn.net/images/artist/54da54b7aee3557b310dcee5a735d18d/250x250-000000-80-0-0.jpg";
const realPortrait =
  "https://cdn-images.dzcdn.net/images/artist/0c64035250f07917051541996c641c42/250x250-000000-80-0-0.jpg";

assert.equal(isPlaceholderArtistImage(emptyHash), true);
assert.equal(isPlaceholderArtistImage(fasterHorses), true);
assert.equal(isPlaceholderArtistImage(bexxieSilhouette), true);
assert.equal(isPlaceholderArtistImage(realPortrait), false);

assert.equal(usableImageUrl(emptyHash), null);
assert.equal(usableImageUrl(fasterHorses), null);
assert.equal(usableImageUrl(bexxieSilhouette), null);
assert.equal(usableImageUrl(realPortrait), realPortrait);
assert.equal(usableImageUrl("/artists/bexxie.jpg"), "/artists/bexxie.jpg");
assert.equal(usableImageUrl("  "), null);
assert.equal(usableImageUrl("http://example.com/a.jpg"), null);

console.log("usableImage.test.ts ok");
