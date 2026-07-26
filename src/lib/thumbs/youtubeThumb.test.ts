import assert from "node:assert/strict";
import {
  pickYoutubeThumbnail,
  youtubeThumbUrl,
  youtubeVideoId,
} from "./youtubeThumb";

assert.equal(youtubeVideoId("0psLTNmJM38"), "0psLTNmJM38");
assert.equal(
  youtubeVideoId("https://www.youtube.com/watch?v=0psLTNmJM38&list=PLBg"),
  "0psLTNmJM38",
);
assert.equal(
  youtubeThumbUrl("0psLTNmJM38", "hq"),
  "https://i.ytimg.com/vi/0psLTNmJM38/hqdefault.jpg",
);
assert.equal(
  pickYoutubeThumbnail("0psLTNmJM38", [
    { url: "https://i.ytimg.com/vi/0psLTNmJM38/default.jpg", width: 120 },
    { url: "https://i.ytimg.com/vi/0psLTNmJM38/hqdefault.jpg", width: 480 },
  ]),
  "https://i.ytimg.com/vi/0psLTNmJM38/hqdefault.jpg",
);

console.log("youtubeThumb.test.ts ok");
