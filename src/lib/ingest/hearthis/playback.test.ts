import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hostUrlsFromText,
  mixcloudShowUrlFromText,
  preferPlaybackUrl,
  preferredExternalPlaybackFromText,
  soundcloudTrackUrlFromText,
  youtubeWatchUrlFromText,
} from "./playback";

describe("hearthis preferred playback extractors", () => {
  it("extracts track-level SoundCloud URLs and ignores profiles", () => {
    assert.equal(
      soundcloudTrackUrlFromText(
        "Also on https://soundcloud.com/discodice/sputnik-disko-321 thanks",
      ),
      "https://soundcloud.com/discodice/sputnik-disko-321",
    );
    assert.equal(
      soundcloudTrackUrlFromText("Follow soundcloud.com/discodice for more"),
      null,
    );
    assert.equal(
      soundcloudTrackUrlFromText(
        "Playlist https://soundcloud.com/foo/sets/bar-mix",
      ),
      null,
    );
  });

  it("extracts YouTube watch URLs without requiring a scheme", () => {
    assert.equal(
      youtubeWatchUrlFromText("HD-Video:\nyoutube.com/watch?v=QC7PYLSYhCc\n"),
      "https://www.youtube.com/watch?v=QC7PYLSYhCc",
    );
    assert.equal(
      youtubeWatchUrlFromText("or youtu.be/7cf9c4wLtJ4 end"),
      "https://www.youtube.com/watch?v=7cf9c4wLtJ4",
    );
    assert.equal(
      youtubeWatchUrlFromText("Channel youtube.com/@FunkyPeopleOnline/podcasts"),
      null,
    );
  });

  it("extracts Mixcloud show URLs and ignores profiles", () => {
    assert.equal(
      mixcloudShowUrlFromText(
        "Mirror https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-690/",
      ),
      "https://www.mixcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690/",
    );
    assert.equal(
      mixcloudShowUrlFromText("Follow mixcloud.com/DimitriVegasAndLikeMike"),
      null,
    );
    assert.equal(
      mixcloudShowUrlFromText(
        "https://www.mixcloud.com/widget/iframe/?feed=%2Fclaptone%2Fclapcast-576%2F",
      ),
      null,
    );
  });

  it("keeps every official host from the same text", () => {
    const hosts = hostUrlsFromText(`
      SC https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690
      YT https://youtu.be/OcUFACTYqL8
      Mixcloud https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-690/
    `);
    assert.equal(
      hosts.soundcloudUrl,
      "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690",
    );
    assert.equal(
      hosts.youtubeUrl,
      "https://www.youtube.com/watch?v=OcUFACTYqL8",
    );
    assert.equal(
      hosts.mixcloudUrl,
      "https://www.mixcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690/",
    );
  });

  it("prefers SoundCloud over Mixcloud over YouTube when both appear", () => {
    const hit = preferredExternalPlaybackFromText(
      "SC https://soundcloud.com/a/b-mix and YT youtube.com/watch?v=abcDEF12345",
    );
    assert.deepEqual(hit, {
      playbackUrl: "https://soundcloud.com/a/b-mix",
      host: "soundcloud",
    });
    const mixOverYt = preferredExternalPlaybackFromText(
      "YT youtube.com/watch?v=abcDEF12345 Mixcloud https://www.mixcloud.com/claptone/clapcast-576/",
    );
    assert.deepEqual(mixOverYt, {
      playbackUrl: "https://www.mixcloud.com/claptone/clapcast-576/",
      host: "mixcloud",
    });
  });

  it("reads buy_link alongside description", () => {
    const hit = preferredExternalPlaybackFromText(
      "promo only",
      "https://soundcloud.com/artist/sunset-beach-house-mix",
    );
    assert.equal(
      hit?.playbackUrl,
      "https://soundcloud.com/artist/sunset-beach-house-mix",
    );
  });

  it("never downgrades SC/YT playback to hearthis", () => {
    const sc = "https://soundcloud.com/a/b";
    const ht = "https://app.hearthis.at/embed/1/transparent_black/";
    assert.equal(preferPlaybackUrl(ht, sc), sc);
    assert.equal(preferPlaybackUrl(sc, ht), sc);
    assert.equal(preferPlaybackUrl(null, ht), null);
    assert.equal(preferPlaybackUrl(ht, null), null);
    assert.equal(preferPlaybackUrl(sc, null), sc);
  });
});
