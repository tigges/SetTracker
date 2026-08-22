import assert from "node:assert/strict";
import {
  evaluateHomeCity,
  evaluateIdentityClass,
  evaluateConfirmedTrackIds,
  evaluateOfficialWatchUrl,
  parseResearchJobs,
  RESEARCH_JOBS,
} from "./llmJobs";

assert.deepEqual(parseResearchJobs(undefined), [
  "handles",
  "events",
  "quality",
]);
assert.deepEqual(parseResearchJobs("all"), [...RESEARCH_JOBS]);
assert.deepEqual(parseResearchJobs("identity,homecity,videos,tracks"), [
  "identity",
  "homecity",
  "videos",
  "tracks",
]);
assert.deepEqual(parseResearchJobs("handles,nope,events"), [
  "handles",
  "events",
]);
assert.deepEqual(parseResearchJobs("cue"), ["cues"]);
assert.deepEqual(parseResearchJobs("cues"), ["cues"]);

assert.equal(evaluateIdentityClass("Adam Beyer", "touring_dj").ok, true);
assert.equal(
  evaluateIdentityClass("Adam Beyer", "track_credit").value,
  "track_credit",
);
assert.equal(evaluateIdentityClass("Click here", "touring_dj").ok, false);
assert.equal(evaluateIdentityClass("Adam Beyer", "real-dj").ok, false);

assert.equal(evaluateHomeCity("ILLENIUM", "St. Louis, US").ok, true);
assert.equal(evaluateHomeCity("MEDUZA", "Italy").ok, true);
assert.equal(evaluateHomeCity("MEDUZA", "https://meduzamusic.net").ok, false);
assert.equal(evaluateHomeCity("MEDUZA", "unknown").ok, false);
assert.equal(evaluateHomeCity("MEDUZA", "MEDUZA").ok, false);

assert.equal(
  evaluateOfficialWatchUrl("https://www.youtube.com/watch?v=dQw4w9wgGcQ").ok,
  true,
);
assert.equal(
  evaluateOfficialWatchUrl("https://youtu.be/dQw4w9wgGcQ").url,
  "https://www.youtube.com/watch?v=dQw4w9wgGcQ",
);
assert.equal(
  evaluateOfficialWatchUrl("https://www.youtube.com/@Tomorrowland").ok,
  false,
);
assert.equal(
  evaluateOfficialWatchUrl("https://www.1001tracklists.com/tracklist/foo").ok,
  false,
);
assert.match(
  evaluateOfficialWatchUrl("https://1001.tl/abc").reason,
  /1001/,
);
assert.equal(
  evaluateOfficialWatchUrl("https://youtu.be/6DC3xoQF4Zs").ok,
  false,
);
assert.match(
  evaluateOfficialWatchUrl("https://www.youtube.com/watch?v=6DC3xoQF4Zs")
    .reason,
  /fingerprint-only/,
);

assert.equal(
  evaluateConfirmedTrackIds(
    { isrc: "USUM71502634" },
    { isrc: "USUM71502634" },
  ).ok,
  true,
);
assert.equal(
  evaluateConfirmedTrackIds(
    { isrc: "USUM71502634" },
    { isrc: "GBAAA0000000" },
  ).ok,
  false,
);
assert.equal(
  evaluateConfirmedTrackIds({ isrc: "USUM71502634" }, null).ok,
  false,
);

console.log("llmJobs.test.ts ok");
