import assert from "node:assert/strict";
import {
  AUTO_ID_LANE_QUOTA,
  buildAutoIdQueue,
  buildTracklistWorkbench,
  compareWorkbenchRows,
  looksLikeFirstPartyStub,
  watchUrlForAutoId,
  workbenchLaneRank,
} from "./statsWorkbench";

assert.equal(workbenchLaneRank("first_party"), 0);
assert.equal(workbenchLaneRank("fingerprint"), 1);
assert.equal(workbenchLaneRank("track_id"), 2);
assert.equal(workbenchLaneRank("capture_1001"), 3);
assert.ok(
  compareWorkbenchRows(
    { lane: "first_party", slug: "a", title: "A", detail: "", href: null, score: 1 },
    { lane: "capture_1001", slug: "b", title: "B", detail: "", href: null, score: 99 },
  ) < 0,
);
assert.equal(looksLikeFirstPartyStub([]), true);
assert.equal(looksLikeFirstPartyStub([{ provenance: "1001tl" }]), false);

const rows = buildTracklistWorkbench({
  emptySets: [
    {
      slug: "yt-emptyOfficial",
      title: "Empty official YT",
      sourceName: "YouTube",
    },
  ],
  sparseSets: [
    {
      id: "1",
      slug: "sc-sparse",
      title: "Sparse SC",
      sourceName: "SoundCloud",
      durationSec: 3600,
      playCount: 2,
      playbackHost: "soundcloud",
    },
    {
      id: "1b",
      slug: "sc-acr",
      title: "ACR sparse",
      sourceName: "SoundCloud",
      durationSec: 3600,
      playCount: 8,
      playbackHost: "soundcloud",
    },
  ],
  needsIdsSets: [
    {
      id: "2",
      slug: "yt-needs-id",
      title: "Needs IDs",
      sourceName: "YouTube",
      durationSec: 3600,
      playCount: 20,
      identifiedCount: 4,
      unresolvedCount: 16,
      identifiedRatio: 0.2,
      primaryDj: "Someone",
    },
  ],
  capturePresets: [
    {
      label: "Capture me",
      slug: "yt-capture",
      name: "TL_CAPTURE",
      searchUrl: "https://www.1001tracklists.com/search/",
      reason: "density gap",
    },
  ],
  limit: 10,
});

assert.equal(rows[0]?.lane, "first_party");
assert.ok(rows.some((r) => r.lane === "fingerprint"));
assert.ok(rows.some((r) => r.lane === "track_id"));
assert.equal(rows.at(-1)?.lane, "capture_1001");
assert.equal(new Set(rows.map((r) => r.slug)).size, rows.length);

const emptyOnlyInCapture = buildTracklistWorkbench({
  capturePresets: [
    {
      label: "Only 1001",
      slug: "yt-only-1001",
      name: "TL",
      searchUrl: "https://www.1001tracklists.com/search/",
    },
  ],
});
assert.equal(emptyOnlyInCapture[0]?.lane, "capture_1001");

assert.equal(
  watchUrlForAutoId("yt-ViNSjYircPs"),
  "https://www.youtube.com/watch?v=ViNSjYircPs",
);
assert.equal(
  watchUrlForAutoId("sc-mix", "https://soundcloud.com/artist/set"),
  "https://soundcloud.com/artist/set",
);
assert.equal(
  watchUrlForAutoId(
    "sc-mix",
    null,
    "https://www.1001tracklists.com/tracklist/abc/index.html",
  ),
  null,
);

const auto = buildAutoIdQueue({
  emptySets: [
    {
      slug: "yt-ViNSjYircPs",
      title: "Empty official YT",
      sourceName: "YouTube",
    },
  ],
  sparseSets: [
    {
      id: "1b",
      slug: "sc-acr",
      title: "ACR sparse",
      sourceName: "SoundCloud",
      durationSec: 3600,
      playCount: 8,
      playbackHost: "soundcloud",
      playbackUrl: "https://soundcloud.com/artist/set",
    },
  ],
  needsIdsSets: [
    {
      id: "2",
      slug: "yt-needs-id",
      title: "Needs IDs",
      sourceName: "YouTube",
      durationSec: 3600,
      playCount: 20,
      identifiedCount: 4,
      unresolvedCount: 16,
      identifiedRatio: 0.2,
      primaryDj: "Someone",
    },
  ],
  capturePresets: [
    {
      label: "Capture me",
      slug: "yt-capture",
      name: "TL_CAPTURE",
      searchUrl: "https://www.1001tracklists.com/search/",
    },
  ],
});
assert.equal(
  auto.some((r) => r.lane === "capture_1001"),
  false,
  "Auto ID never lists a 1001 paste row",
);
assert.ok(auto.some((r) => r.lane === "first_party" && r.mixesdbUrl));
assert.ok(auto.some((r) => r.lane === "fingerprint" && r.hostLabel === "SC"));
assert.ok(auto.some((r) => r.lane === "track_id"));

const flooded = buildAutoIdQueue({
  emptySets: Array.from({ length: 30 }, (_, i) => ({
    slug: `yt-empty${String(i).padStart(2, "0")}`,
    title: `Empty ${i}`,
    sourceName: "YouTube",
  })),
  sparseSets: [
    {
      id: "acr",
      slug: "sc-acr-quota",
      title: "ACR kept",
      sourceName: "SoundCloud",
      durationSec: 3600,
      playCount: 8,
      playbackHost: "soundcloud",
    },
  ],
  needsIdsSets: [
    {
      id: "ids",
      slug: "yt-ids-quota",
      title: "IDs kept",
      sourceName: "YouTube",
      durationSec: 3600,
      playCount: 20,
      identifiedCount: 2,
      unresolvedCount: 18,
      identifiedRatio: 0.1,
      primaryDj: null,
    },
  ],
  laneQuota: AUTO_ID_LANE_QUOTA,
});
assert.equal(
  flooded.filter((r) => r.lane === "first_party").length,
  AUTO_ID_LANE_QUOTA,
);
assert.ok(flooded.some((r) => r.lane === "fingerprint"));
assert.ok(flooded.some((r) => r.lane === "track_id"));

console.log("statsWorkbench.test.ts ok", rows.length, auto.length);
