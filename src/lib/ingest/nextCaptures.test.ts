import assert from "node:assert/strict";
import {
  CAPTURE_QUEUE_LIMIT,
  PRIORITY_CAPTURES,
  buildHeldReliveWatch,
  buildNextCaptures,
  extrasFromCaptureSnapshot,
  search1001,
  searchMixesdbByPlayerUrl,
} from "./nextCaptures";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";

assert.equal(CAPTURE_QUEUE_LIMIT, 40);
assert.ok(PRIORITY_CAPTURES.length <= 12);
assert.ok(search1001("fisher").includes("1001tracklists.com/search"));
assert.ok(!search1001("fisher").includes("google.com"));
assert.ok(
  searchMixesdbByPlayerUrl("https://www.youtube.com/watch?v=ViNSjYircPs")
    ?.includes("mixesdb.com"),
);
assert.equal(searchMixesdbByPlayerUrl("Korolova"), null);

const presets = buildNextCaptures({ limit: 10 });
assert.ok(presets.length <= 10);

// Already-wired Dom Dolla / Prydz / Zamna must not appear.
assert.ok(!presets.some((p) => p.slug === "yt-4Lqyh7cWRxQ"));
assert.ok(!presets.some((p) => p.slug === "yt-hU-z3iV0LOg"));
assert.ok(!presets.some((p) => p.slug === "yt-1Mp9Pl6YgDM"));
for (const slug of [
  "yt-QcvGuOhSVlc",
  "yt-KAZd25mCHp8",
  "sc-rose-ringed-rose-ringed-freedomstage-we1",
  "yt-0Fq24R47sDY",
  "yt-G-DciaWb5KY",
  "yt-5V5qDFSw8Hs",
  "yt-czU0VhOB_Lg",
  "yt-VuwLOFniScA",
]) {
  assert.ok(
    TRACKLIST_1001_BY_SOURCE_SLUG[slug]?.length,
    `missing 1001 overlay for ${slug}`,
  );
  assert.ok(
    !presets.some((p) => p.slug === slug),
    `wired slug leaked into Capture 1001 queue: ${slug}`,
  );
}

for (const p of PRIORITY_CAPTURES) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(TRACKLIST_1001_BY_SOURCE_SLUG, p.slug),
    false,
    `wired slug still in PRIORITY_CAPTURES: ${p.slug}`,
  );
}

for (const p of presets) {
  assert.ok(p.slug.startsWith("yt-"), p.slug);
  assert.ok(p.name.startsWith("TL_"), p.name);
  assert.ok(p.searchUrl.includes("1001tracklists.com/search"), p.searchUrl);
  assert.ok(!p.searchUrl.includes("google.com"), p.searchUrl);
  assert.equal(
    Object.prototype.hasOwnProperty.call(TRACKLIST_1001_BY_SOURCE_SLUG, p.slug),
    false,
    `mapped slug leaked into queue: ${p.slug}`,
  );
}

const held = buildHeldReliveWatch();
assert.ok(held.held.length >= 5);
assert.ok(held.held.every((h) => h.status === "waiting"));
assert.ok(
  held.held.every((h) => h.searchUrl.includes("1001tracklists.com/search")),
);
assert.ok(held.held.every((h) => !h.searchUrl.includes("google.com")));

const extras = extrasFromCaptureSnapshot({
  presets: [
    {
      label: "Marlon Hoffstadt WE1",
      slug: "yt-rG1DvjvXCls",
      name: "TL_MARLON_HOFFSTADT_TML_WE1_2026",
      searchUrl:
        "https://www.google.com/search?q=marlon%20hoffstadt%20site%3A1001tracklists.com",
      reason: "relive:official-unwired",
    },
    {
      label: "Someone still unwired",
      slug: "yt-unwired-relive",
      name: "TL_SOMEONE_STILL_UNWIRED",
      searchUrl:
        "https://www.google.com/search?q=someone%20tomorrowland%20site%3A1001tracklists.com",
      reason: "relive:official-unwired",
    },
    {
      label: "Density leftover",
      slug: "yt-density",
      name: "TL_DENSITY",
      searchUrl: search1001("density leftover"),
      reason: "density:severe",
    },
  ],
});
assert.ok(!extras.some((p) => p.slug === "yt-rG1DvjvXCls"));
assert.ok(
  !extrasFromCaptureSnapshot({
    presets: [
      {
        label: "Timmy Trumpet Freedom WE2",
        slug: "yt-QcvGuOhSVlc",
        name: "TL_TIMMY_TRUMPET_TML_WE2_FREEDOM_2026",
        searchUrl: search1001("timmy trumpet tomorrowland"),
        reason: "relive:official-unwired",
      },
      {
        label: "John Newman Mainstage WE1",
        slug: "yt-czU0VhOB_Lg",
        name: "TL_JOHN_NEWMAN_TML_WE1_MAINSTAGE_2026",
        searchUrl: search1001("john newman tomorrowland"),
        reason: "relive:official-unwired",
      },
    ],
  }).length,
);
assert.equal(extras.length, 1);
assert.equal(extras[0]?.slug, "yt-unwired-relive");
assert.ok(extras[0]?.searchUrl.includes("1001tracklists.com/search"));
assert.ok(!extras[0]?.searchUrl.includes("google.com"));

console.log("nextCaptures.test.ts ok");
