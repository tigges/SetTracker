import assert from "node:assert/strict";
import { preferPlaybackUrl } from "./hearthis/playback";
import {
  extraHostUrlsBySlug,
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
