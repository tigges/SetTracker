import assert from "node:assert/strict";
import {
  detectPlaybackHost,
  hearthisEmbedUrl,
  playbackUrlFromSource,
  resolvePlaybackTarget,
} from "./playback";

assert.equal(detectPlaybackHost("https://soundcloud.com/a/b"), "soundcloud");
assert.equal(detectPlaybackHost("https://hearthis.at/a/b/"), "hearthis");
assert.equal(detectPlaybackHost("https://www.youtube.com/watch?v=abc"), "youtube");
assert.equal(detectPlaybackHost("https://youtu.be/abc"), "youtube");
assert.equal(detectPlaybackHost("https://example.com"), null);

assert.equal(
  hearthisEmbedUrl(11283178),
  "https://app.hearthis.at/embed/11283178/transparent_black/?autoplay=0&cover=0&waveform=0",
);

const sc = resolvePlaybackTarget("https://soundcloud.com/cloonee/edc-orlando");
assert.ok(sc);
assert.equal(sc!.host, "soundcloud");
assert.ok(sc!.embedSrc.includes("w.soundcloud.com/player"));

const ht = resolvePlaybackTarget(
  "https://app.hearthis.at/embed/11283178/transparent_black/",
  { sourceUrl: "https://hearthis.at/shaun-mbetse/busted-deep-birthday-mix-2024/" },
);
assert.ok(ht);
assert.equal(ht!.host, "hearthis");
assert.equal(
  ht!.openUrl,
  "https://hearthis.at/shaun-mbetse/busted-deep-birthday-mix-2024/",
);

assert.equal(
  resolvePlaybackTarget("https://hearthis.at/shaun-mbetse/mix/"),
  null,
);

const yt = resolvePlaybackTarget("https://youtu.be/dQw4w9WgXcQ");
assert.ok(yt);
assert.ok(yt!.embedSrc.includes("/embed/dQw4w9WgXcQ"));

assert.equal(
  playbackUrlFromSource("SoundCloud", "https://soundcloud.com/a/b"),
  "https://soundcloud.com/a/b",
);
assert.equal(
  playbackUrlFromSource("hearthis.at", "https://hearthis.at/a/b/"),
  null,
);

console.log("playback.test.ts ok");
