import assert from "node:assert/strict";
import { preferPlaybackUrl } from "./hearthis/playback";
import {
  extraHostUrlsBySlug,
  harvestSetHostUrls,
  SET_HOST_PINS,
  soundcloudSlugFromUrl,
  youtubeUrlFromSlug,
} from "./setHostUrls";
import { mixcloudPageUrl, unusedOfficialHostLinks } from "../playback";

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
assert.ok(!extras["yt-t5KwF_VsM50"]?.soundcloudUrl);
assert.ok(!extras["yt-193z2Yyb-4g"]?.soundcloudUrl);
assert.ok(!extras["yt-VEA6D7c758s"]?.soundcloudUrl);
assert.equal(
  extras["yt-xv6hpdqKlxg"]?.soundcloudUrl,
  "https://soundcloud.com/eric-prydz/epic-radio-025",
);
assert.equal(
  extras["yt-xv6hpdqKlxg"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=xv6hpdqKlxg",
);
assert.ok(!extras["yt-xv6hpdqKlxg"]?.mixcloudUrl);
assert.equal(
  extras["sc-eric-prydz-epic-radio-025"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=xv6hpdqKlxg",
);
assert.equal(
  extras["sc-eric-prydz-epic-radio-025"]?.soundcloudUrl,
  "https://soundcloud.com/eric-prydz/epic-radio-025",
);
assert.ok(!extras["sc-eric-prydz-epic-radio-025"]?.mixcloudUrl);
assert.notEqual(
  extras["yt-xv6hpdqKlxg"]?.soundcloudUrl,
  extras["yt-JLIYTueL4TI"]?.soundcloudUrl,
);
assert.ok(!extras["yt-7jUXS12-7f0"]?.soundcloudUrl);
assert.ok(!extras["yt-_4P9Y5KN9n4"]?.soundcloudUrl);
assert.ok(!extras["yt-5V5qDFSw8Hs"]?.soundcloudUrl);
assert.ok(!extras["yt-VuwLOFniScA"]?.soundcloudUrl);
assert.ok(!extras["yt-czU0VhOB_Lg"]?.soundcloudUrl);
assert.equal(
  extras["yt-vy-k0FopsmY"]?.soundcloudUrl,
  "https://soundcloud.com/platform/carl-cox-45-min-boiler-room",
);
assert.equal(
  extras["yt-vy-k0FopsmY"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=vy-k0FopsmY",
);
assert.equal(
  extras["sc-platform-carl-cox-45-min-boiler-room"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=vy-k0FopsmY",
);
assert.equal(
  extras["sc-platform-carl-cox-45-min-boiler-room"]?.soundcloudUrl,
  "https://soundcloud.com/platform/carl-cox-45-min-boiler-room",
);
assert.equal(
  extras["yt-_hdM8uJV1LM"]?.soundcloudUrl,
  "https://soundcloud.com/bleuclair/bleuprintvol5",
);
assert.equal(
  extras["yt-_hdM8uJV1LM"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=_hdM8uJV1LM",
);
assert.equal(
  extras["sc-bleuclair-bleuprintvol5"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=_hdM8uJV1LM",
);
assert.equal(
  extras["sc-bleuclair-bleuprintvol5"]?.soundcloudUrl,
  "https://soundcloud.com/bleuclair/bleuprintvol5",
);
assert.notEqual(
  extras["yt-_hdM8uJV1LM"]?.soundcloudUrl,
  extras["yt-c_sx3zum8Z0"]?.soundcloudUrl,
);
assert.equal(
  extras["yt-d-EOE2u7HT4"]?.soundcloudUrl,
  "https://soundcloud.com/loveland-legacy/bart-skils-loveland-festival",
);
assert.equal(
  extras["yt-d-EOE2u7HT4"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=d-EOE2u7HT4",
);
assert.equal(
  extras["sc-loveland-legacy-bart-skils-loveland-festival"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=d-EOE2u7HT4",
);
assert.equal(
  extras["sc-loveland-legacy-bart-skils-loveland-festival"]?.soundcloudUrl,
  "https://soundcloud.com/loveland-legacy/bart-skils-loveland-festival",
);
assert.equal(
  extras["sc-bart-skils-bart-skils-loveland-festival"]?.youtubeUrl,
  "https://www.youtube.com/watch?v=d-EOE2u7HT4",
);
assert.equal(
  extras["sc-bart-skils-bart-skils-loveland-festival"]?.soundcloudUrl,
  "https://soundcloud.com/loveland-legacy/bart-skils-loveland-festival",
);
assert.equal(
  extras["yt-d-EOE2u7HT4"]?.soundcloudUrl,
  extras["sc-bart-skils-bart-skils-loveland-festival"]?.soundcloudUrl,
);
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

// AFROJACK & R3HAB TML WE2: three slugs, one performance. R3HAB's SoundCloud
// permalink is not a SOUNDCLOUD_TRACK_SEEDS entry, so it only reaches the
// YouTube rows through SET_HOST_PINS. Without it those rows list no other
// official host.
for (const slug of [
  "yt-AjQeohYmg3A",
  "yt-lEIGnx7qLl0",
  "sc-r3hab-r3hab-b2b-afrojack",
]) {
  assert.equal(
    extras[slug]?.soundcloudUrl,
    "https://soundcloud.com/r3hab/r3hab-b2b-afrojack",
    `missing R3HAB SoundCloud host on ${slug}`,
  );
  assert.equal(
    extras[slug]?.youtubeUrl,
    "https://www.youtube.com/watch?v=AjQeohYmg3A",
    `missing shared YouTube host on ${slug}`,
  );
}
assert.deepEqual(
  unusedOfficialHostLinks({
    playbackUrl: "https://www.youtube.com/watch?v=AjQeohYmg3A",
    ...harvestSetHostUrls({
      slug: "yt-AjQeohYmg3A",
      playbackUrl: "https://www.youtube.com/watch?v=AjQeohYmg3A",
    }),
  }).map((l) => l.host),
  ["soundcloud"],
);
// SoundCloud still wins playback over the YouTube twin.
assert.equal(
  preferPlaybackUrl(
    "https://www.youtube.com/watch?v=AjQeohYmg3A",
    "https://soundcloud.com/r3hab/r3hab-b2b-afrojack",
  ),
  "https://soundcloud.com/r3hab/r3hab-b2b-afrojack",
);

// Spectrum Radio 484: three official hosts on one performance. joris-voorn is
// not a curated SoundCloud account, so both mirrors come from pins rather than
// a track seed, and both slugs in the twin group must carry all three.
for (const slug of ["yt-d5JZLJSJc6w", "sc-joris-voorn-spectrum-radio-484"]) {
  assert.equal(
    extras[slug]?.soundcloudUrl,
    "https://soundcloud.com/joris-voorn/spectrum-radio-484",
    `missing SoundCloud mirror on ${slug}`,
  );
  assert.equal(
    extras[slug]?.mixcloudUrl,
    "https://www.mixcloud.com/jorisvoorn/joris-voorn-presents-spectrum-radio-484/",
    `missing Mixcloud mirror on ${slug}`,
  );
  assert.equal(
    extras[slug]?.youtubeUrl,
    "https://www.youtube.com/watch?v=d5JZLJSJc6w",
    `missing YouTube host on ${slug}`,
  );
}

// Spectrum Radio 485: YT already carried the set; SC + Mixcloud pinned 2026-08-27.
for (const slug of ["yt-yTRvLrtsM9I", "sc-joris-voorn-spectrum-radio-485"]) {
  assert.equal(
    extras[slug]?.soundcloudUrl,
    "https://soundcloud.com/joris-voorn/spectrum-radio-485",
    `missing SoundCloud mirror on ${slug}`,
  );
  assert.equal(
    extras[slug]?.mixcloudUrl,
    "https://www.mixcloud.com/jorisvoorn/joris-voorn-presents-spectrum-radio-485/",
    `missing Mixcloud mirror on ${slug}`,
  );
  assert.equal(
    extras[slug]?.youtubeUrl,
    "https://www.youtube.com/watch?v=yTRvLrtsM9I",
    `missing YouTube host on ${slug}`,
  );
}

// Spectrum Radio 486: three official hosts, same pin reason as 484.
for (const slug of ["yt-wlePVzVaMOY", "sc-joris-voorn-spectrum-radio-486"]) {
  assert.equal(
    extras[slug]?.soundcloudUrl,
    "https://soundcloud.com/joris-voorn/spectrum-radio-486",
    `missing SoundCloud mirror on ${slug}`,
  );
  assert.equal(
    extras[slug]?.mixcloudUrl,
    "https://www.mixcloud.com/jorisvoorn/joris-voorn-presents-spectrum-radio-486/",
    `missing Mixcloud mirror on ${slug}`,
  );
  assert.equal(
    extras[slug]?.youtubeUrl,
    "https://www.youtube.com/watch?v=wlePVzVaMOY",
    `missing YouTube host on ${slug}`,
  );
}
assert.deepEqual(
  unusedOfficialHostLinks({
    playbackUrl: "https://www.youtube.com/watch?v=d5JZLJSJc6w",
    ...harvestSetHostUrls({
      slug: "yt-d5JZLJSJc6w",
      playbackUrl: "https://www.youtube.com/watch?v=d5JZLJSJc6w",
    }),
  }).map((l) => l.host),
  ["soundcloud", "mixcloud"],
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
