import assert from "node:assert/strict";
import {
  durationsCompatible,
  shareablePlayCount,
  shouldCopyTwinTracklist,
  twinSlugGroupsFromCatalog,
} from "./hostTwins";
import { playerUrlsForSet } from "./setHostUrls";

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

console.log("hostTwins.test.ts ok");
