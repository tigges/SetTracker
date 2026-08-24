import assert from "node:assert/strict";
import {
  durationsCompatible,
  hostTwinFoldCandidatesFromSeeds,
  shareablePlayCount,
  shouldCopyTwinTracklist,
  survivorSlugForSecondary,
  twinSlugGroupsFromCatalog,
} from "./hostTwins";
import { playerUrlsForSet } from "./setHostUrls";
import { isSecondaryPlaybackSlug } from "./tracklists1001/seeds";

assert.equal(durationsCompatible(90 * 60, 91 * 60), true);
assert.equal(durationsCompatible(60 * 60, 90 * 60), false);
assert.equal(durationsCompatible(10 * 60, 10 * 60), false);

assert.equal(
  shareablePlayCount([
    { provenance: "1001tl" },
    { provenance: "fingerprint" },
    { provenance: "mixesdb" },
  ]),
  2,
);

assert.equal(
  shouldCopyTwinTracklist(
    { durationSec: 90 * 60, shareable: 22 },
    { durationSec: 90 * 60, shareable: 2 },
  ),
  true,
);
assert.equal(
  shouldCopyTwinTracklist(
    { durationSec: 60 * 60, shareable: 22 },
    { durationSec: 90 * 60, shareable: 2 },
  ),
  false,
);
assert.equal(
  shouldCopyTwinTracklist(
    { durationSec: 90 * 60, shareable: 8 },
    { durationSec: 90 * 60, shareable: 2 },
  ),
  false,
);

const summitUrls = playerUrlsForSet({ slug: "yt-9TKqqBCmDHA" });
assert.ok(
  summitUrls.includes(
    "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
  ),
);
assert.ok(
  summitUrls.includes("https://www.youtube.com/watch?v=9TKqqBCmDHA"),
);

const smashUrls = playerUrlsForSet({ slug: "yt-eVjC42MNgkI" });
assert.ok(
  smashUrls.some((u) => u.includes("mixcloud.com") && u.includes("smash-the-house")),
);
assert.ok(smashUrls.some((u) => u.includes("soundcloud.com")));

const groups = twinSlugGroupsFromCatalog([
  {
    slug: "yt-9TKqqBCmDHA",
    youtubeUrl: "https://www.youtube.com/watch?v=9TKqqBCmDHA",
    soundcloudUrl:
      "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
  },
  {
    slug: "sc-johnsummit-john-summit-live-lollapalooza",
    youtubeUrl: "https://www.youtube.com/watch?v=9TKqqBCmDHA",
    soundcloudUrl:
      "https://soundcloud.com/johnsummit/john-summit-live-lollapalooza",
  },
]);
const summitGroup = groups.find((g) => g.includes("yt-9TKqqBCmDHA"));
assert.ok(summitGroup);
assert.ok(summitGroup.includes("sc-johnsummit-john-summit-live-lollapalooza"));

const folds = hostTwinFoldCandidatesFromSeeds();
const summitFold = folds.find(
  (c) => c.fromSlug === "sc-johnsummit-john-summit-live-lollapalooza",
);
assert.equal(summitFold?.toSlug, "yt-9TKqqBCmDHA");
assert.ok(summitFold?.hosts.youtubeUrl);
assert.ok(summitFold?.hosts.soundcloudUrl);
assert.equal(
  survivorSlugForSecondary("sc-johnsummit-john-summit-live-lollapalooza"),
  "yt-9TKqqBCmDHA",
);
assert.equal(survivorSlugForSecondary("yt-9TKqqBCmDHA"), null);

const smash690Fold = folds.find(
  (c) =>
    c.fromSlug === "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690",
);
assert.equal(smash690Fold?.toSlug, "yt-OcUFACTYqL8");
assert.equal(
  survivorSlugForSecondary(
    "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690",
  ),
  "yt-OcUFACTYqL8",
);

assert.equal(
  folds.some(
    (c) =>
      c.fromSlug === "yt-czU0VhOB_Lg" ||
      c.toSlug === "yt-czU0VhOB_Lg" ||
      c.fromSlug === "yt-5V5qDFSw8Hs" ||
      c.toSlug === "yt-5V5qDFSw8Hs",
  ),
  false,
  "John Newman WE1 vs WE2 are distinct performances — do not fold",
);
assert.equal(
  folds.some(
    (c) =>
      c.fromSlug === "yt-KCeluZt3H9o" ||
      c.toSlug === "yt-KCeluZt3H9o" ||
      c.fromSlug === "yt-QcvGuOhSVlc" ||
      c.toSlug === "yt-QcvGuOhSVlc",
  ),
  false,
  "YT-only Timmy / Bebe seeds have no official SC twin to fold",
);
assert.equal(
  isSecondaryPlaybackSlug("sc-johnsummit-john-summit-live-lollapalooza"),
  true,
);
assert.equal(
  isSecondaryPlaybackSlug(
    "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-690",
  ),
  true,
);

console.log("hostTwins.test.ts ok");
