import assert from "node:assert/strict";
import {
  durationsCompatible,
  firstPartyPlayCount,
  foldCopyPlayCount,
  hostTwinFoldCandidatesFromSeeds,
  mergeFoldCopyPlays,
  shareablePlayCount,
  shouldCopyFoldTracklist,
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
assert.equal(
  shouldCopyTwinTracklist(
    { durationSec: 90 * 60, shareable: 0, firstParty: 18 },
    { durationSec: 90 * 60, shareable: 0, firstParty: 2 },
  ),
  true,
);

assert.equal(
  foldCopyPlayCount([
    { provenance: "soundcloud" },
    { provenance: "1001tl" },
    { provenance: "fingerprint" },
  ]),
  2,
);
assert.equal(
  firstPartyPlayCount([
    { provenance: "soundcloud" },
    { provenance: "1001tl" },
    { provenance: "fingerprint" },
  ]),
  1,
);

assert.equal(
  shouldCopyFoldTracklist(
    { durationSec: 90 * 60, foldCopy: 22, firstParty: 0 },
    { durationSec: 90 * 60, foldCopy: 2 },
  ),
  true,
);
assert.equal(
  shouldCopyFoldTracklist(
    { durationSec: 90 * 60, foldCopy: 8, firstParty: 8 },
    { durationSec: 90 * 60, foldCopy: 0 },
  ),
  true,
  "thin survivor keeps SC comment clocks under the 12-cue overlay floor",
);
assert.equal(
  shouldCopyFoldTracklist(
    { durationSec: 90 * 60, foldCopy: 8, firstParty: 8 },
    { durationSec: 90 * 60, foldCopy: 21 },
  ),
  false,
  "no-op when survivor is already denser",
);
assert.equal(
  shouldCopyFoldTracklist(
    { durationSec: 90 * 60, foldCopy: 0, firstParty: 0 },
    { durationSec: 90 * 60, foldCopy: 0 },
  ),
  false,
  "fingerprint-only donor is not copy-eligible",
);
assert.equal(
  shouldCopyFoldTracklist(
    { durationSec: 60 * 60, foldCopy: 22, firstParty: 0 },
    { durationSec: 90 * 60, foldCopy: 0 },
  ),
  false,
  "duration-incompatible twins stay unshared",
);

const foldMerged = mergeFoldCopyPlays(
  [
    { provenance: "fingerprint", timestamp: 600, position: 1 },
    { provenance: "fingerprint", timestamp: 400, position: 2 },
  ],
  [
    { provenance: "soundcloud", timestamp: 90, position: 1 },
    { provenance: "soundcloud", timestamp: 380, position: 2 },
    { provenance: "fingerprint", timestamp: 900, position: 3 },
  ],
);
assert.deepEqual(
  foldMerged.map((p) => ({ provenance: p.provenance, timestamp: p.timestamp })),
  [
    { provenance: "soundcloud", timestamp: 90 },
    { provenance: "soundcloud", timestamp: 380 },
    { provenance: "fingerprint", timestamp: 600 },
  ],
);
assert.equal(
  foldMerged.some((p) => p.timestamp === 900),
  false,
  "donor ACR offsets stay on the file they came from",
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

const bleuBlueprintFold = folds.find(
  (c) => c.fromSlug === "sc-bleuclair-bleuprintvol5",
);
assert.equal(bleuBlueprintFold?.toSlug, "yt-_hdM8uJV1LM");
assert.equal(
  survivorSlugForSecondary("sc-bleuclair-bleuprintvol5"),
  "yt-_hdM8uJV1LM",
);
assert.equal(survivorSlugForSecondary("yt-_hdM8uJV1LM"), null);
assert.equal(
  folds.some(
    (c) =>
      c.fromSlug === "sc-bleuclair-edclv2023" &&
      c.toSlug === "yt-_hdM8uJV1LM",
  ),
  false,
  "BLEUPRINT VOL. 5 is not the EDC LV 2023 seed — do not fold",
);

const bartLovelandFold = folds.find(
  (c) => c.fromSlug === "sc-loveland-legacy-bart-skils-loveland-festival",
);
assert.equal(bartLovelandFold?.toSlug, "yt-d-EOE2u7HT4");
assert.equal(
  survivorSlugForSecondary("sc-loveland-legacy-bart-skils-loveland-festival"),
  "yt-d-EOE2u7HT4",
);
assert.equal(survivorSlugForSecondary("yt-d-EOE2u7HT4"), null);

console.log("hostTwins.test.ts ok");
