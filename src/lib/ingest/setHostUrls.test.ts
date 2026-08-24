import assert from "node:assert/strict";
import { preferPlaybackUrl } from "./hearthis/playback";
import {
  extraHostUrlsBySlug,
  harvestSetHostUrls,
  SET_HOST_PINS,
  soundcloudSlugFromUrl,
  youtubeUrlFromSlug,
} from "./setHostUrls";
import { mixcloudPageUrl } from "../playback";

assert.equal(
  soundcloudSlugFromUrl(
    "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
  ),
  "sc-johnsummit-john-summit-live-lollapalooza",
);
assert.equal(
  youtubeUrlFromSlug("yt-9TKqqBCmDHA"),
  "https://www.youtube.com/watch?v=9TKqqBCmDHA",
);
assert.equal(youtubeUrlFromSlug("sc-johnsummit-john-summit-live-lollapalooza"), null);

const extras = extraHostUrlsBySlug();

const summitYt = extras["yt-9TKqqBCmDHA"];
assert.ok(summitYt);
assert.equal(
  summitYt.soundcloudUrl,
  "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
);
assert.equal(
  summitYt.youtubeUrl,
  "https://www.youtube.com/watch?v=9TKqqBCmDHA",
);

const summitSc = extras["sc-johnsummit-john-summit-live-lollapalooza"];
assert.equal(
  summitSc?.youtubeUrl,
  "https://www.youtube.com/watch?v=9TKqqBCmDHA",
);
assert.equal(
  summitSc?.soundcloudUrl,
  "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
);

const korolovaYt = extras["yt-RLOghpXjuJI"];
assert.equal(
  korolovaYt?.soundcloudUrl,
  "https://soundcloud.com/korolovadj/korolova-live-tomorrowland-1",
);

const maddixYt = extras["yt-1Fu89dxrXI0"];
assert.equal(
  maddixYt?.soundcloudUrl,
  "https://soundcloud.com/maddixmusic/maddix-live-tomorrowland-2026",
);
assert.equal(
  maddixYt?.youtubeUrl,
  "https://www.youtube.com/watch?v=1Fu89dxrXI0",
);
assert.equal(
  extras["sc-maddixmusic-maddix-live-tomorrowland-2026"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=1Fu89dxrXI0",
);

const dyenMaddixYt = extras["yt-VABm0tIRn2U"];
assert.equal(
  dyenMaddixYt?.soundcloudUrl,
  "https://soundcloud.com/maddixmusic/dyen-b2b-maddix-live",
);
assert.equal(
  extras["sc-maddixmusic-dyen-b2b-maddix-live"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=VABm0tIRn2U",
);
assert.notEqual(
  dyenMaddixYt?.soundcloudUrl,
  maddixYt?.soundcloudUrl,
);

const dinoCoreYt = extras["yt-90ExlZnu_Xg"];
assert.equal(
  dinoCoreYt?.soundcloudUrl,
  "https://soundcloud.com/tomorrowland/core-i-dino-lenny-0190",
);
assert.equal(
  extras["sc-tomorrowland-core-i-dino-lenny-0190"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=90ExlZnu_Xg",
);
assert.ok(!extras["yt-KCeluZt3H9o"]?.soundcloudUrl);
assert.ok(!extras["yt-QcvGuOhSVlc"]?.soundcloudUrl);
assert.equal(
  extras["yt-KAZd25mCHp8"]?.soundcloudUrl,
  "https://soundcloud.com/rose-ringed/rose-ringed-freedomstage-we1",
);
assert.equal(
  extras["sc-rose-ringed-rose-ringed-freedomstage-we1"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=KAZd25mCHp8",
);
assert.ok(!extras["yt-0Fq24R47sDY"]?.soundcloudUrl);
assert.ok(!extras["yt-G-DciaWb5KY"]?.soundcloudUrl);
assert.ok(!extras["yt-5V5qDFSw8Hs"]?.soundcloudUrl);
assert.ok(!extras["yt-VuwLOFniScA"]?.soundcloudUrl);
assert.ok(!extras["yt-czU0VhOB_Lg"]?.soundcloudUrl);
assert.ok(
  !extras[
    "sc-tomorrowland-tomorrowland-friendship-mix-with-sara-landry-july-2026"
  ]?.youtubeUrl,
);

const clapcast = extras["sc-claptone-clapcast-576"];
assert.equal(
  clapcast?.mixcloudUrl,
  "https://www.mixcloud.com/claptone/clapcast-576/",
);

const smash = extras["yt-eVjC42MNgkI"];
assert.equal(
  smash?.soundcloudUrl,
  "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-687",
);
assert.equal(
  smash?.mixcloudUrl,
  "https://www.mixcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-687/",
);

const smash690 = extras["yt-OcUFACTYqL8"];
assert.equal(
  smash690?.soundcloudUrl,
  "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690",
);
assert.equal(
  smash690?.youtubeUrl,
  "https://www.youtube.com/watch?v=OcUFACTYqL8",
);
assert.ok(!smash690?.mixcloudUrl);
assert.equal(
  extras["sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=OcUFACTYqL8",
);
assert.equal(
  extras["sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690"]?.soundcloudUrl,
  "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690",
);
assert.ok(
  !extras["sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690"]?.mixcloudUrl,
);

const harvested690 = harvestSetHostUrls({
  slug: "yt-OcUFACTYqL8",
  playbackUrl: "https://www.youtube.com/watch?v=OcUFACTYqL8",
  text: "Also on https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-690/",
});
assert.equal(
  harvested690.youtubeUrl,
  "https://www.youtube.com/watch?v=OcUFACTYqL8",
);
assert.equal(
  harvested690.soundcloudUrl,
  "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690",
);
assert.equal(
  harvested690.mixcloudUrl,
  "https://www.mixcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-690/",
);
assert.equal(
  harvestSetHostUrls({
    playbackUrl: "https://www.youtube.com/watch?v=OcUFACTYqL8",
    text: "no official mirrors listed",
  }).soundcloudUrl,
  undefined,
);

const voorn = extras["yt-FQj71mhobYw"];
assert.equal(
  voorn?.soundcloudUrl,
  "https://soundcloud.com/korolovadj/joris-voorn-b2b-korolova-live",
);
assert.equal(
  voorn?.mixcloudUrl,
  "https://www.mixcloud.com/umfradio/umf-radio-883-joris-voorn-b2b-korolova/",
);
assert.equal(
  voorn?.youtubeUrl,
  "https://www.youtube.com/watch?v=FQj71mhobYw",
);

// Rank is unchanged: extra Mixcloud/YT links do not beat SoundCloud playback.
assert.equal(
  preferPlaybackUrl(
    "https://www.youtube.com/watch?v=9TKqqBCmDHA",
    "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
  ),
  "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
);
assert.equal(
  preferPlaybackUrl(
    "https://www.mixcloud.com/claptone/clapcast-576/",
    "https://soundcloud.com/claptone/clapcast-576",
  ),
  "https://soundcloud.com/claptone/clapcast-576",
);

for (const [slug, pin] of Object.entries(SET_HOST_PINS)) {
  if (pin.mixcloudUrl) {
    assert.ok(
      mixcloudPageUrl(pin.mixcloudUrl),
      `bad Mixcloud pin ${slug}`,
    );
  }
  assert.ok(!/google\.com|1001tracklists\.com\/search/i.test(JSON.stringify(pin)));
}

console.log("setHostUrls.test.ts ok", Object.keys(extras).length);
