import assert from "node:assert/strict";
import {
  buildCapturePreflightIndex,
  formatCapturePreflight,
  formatCaptureRowPreflight,
  resolveCaptureSlug,
  tracklistId,
} from "./capturePreflight";

assert.equal(resolveCaptureSlug("yt-3mOMDdX6miw").slug, "yt-3mOMDdX6miw");
assert.equal(
  resolveCaptureSlug(
    "https://soundcloud.com/maxstyler/lollaafters26?utm_source=clipboard",
  ).slug,
  "sc-maxstyler-lollaafters26",
);
assert.equal(
  tracklistId(
    "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-later-title.html",
  ),
  "1sh3nkvk",
);

const seed = [{ at: "0:00" }, { at: "1:00" }];
const index = buildCapturePreflightIndex(
  { "yt-loD-whuR5zc": seed, "yt-other": [{ at: "0:00" }] },
  [
    {
      slug: "yt-loD-whuR5zc",
      tracklistUrl:
        "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-banco.html",
    },
  ],
);

const wired = formatCapturePreflight(
  "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-banco.html",
  index,
);
assert.equal(wired.kind, "wired");
assert.equal(wired.slug, "yt-loD-whuR5zc");
assert.equal(wired.cues, 2);

const fresh = formatCapturePreflight("yt-ZZZnotwiredZ", index);
assert.equal(fresh.kind, "new");

const rowOk = formatCaptureRowPreflight("yt-gap-row", {}, index);
assert.equal(rowOk, null);

const rowWired = formatCaptureRowPreflight("yt-loD-whuR5zc", {}, index);
assert.equal(rowWired?.kind, "wired");

const mismatch = formatCaptureRowPreflight(
  "yt-oGS0A_R9tag",
  {
    tracklistUrl:
      "https://www.1001tracklists.com/tracklist/1sh3nkvk/skrillex-banco.html",
  },
  index,
);
assert.equal(mismatch?.kind, "mismatch");
assert.equal(mismatch?.slug, "yt-loD-whuR5zc");

console.log("ingest/capturePreflight.test.ts ok");
