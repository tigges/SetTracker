import assert from "node:assert/strict";
import {
  enrichOutcome,
  fileScanSpendFromSnapshot,
  githubEnrichContext,
  identifySpendFromSnapshot,
} from "./enrichRunReport";

assert.equal(enrichOutcome({}), "noop");
assert.equal(
  enrichOutcome({
    identify: {
      enabled: false,
      candidates: 0,
      setsProbed: 0,
      probed: 0,
      identified: 0,
      unresolved: 0,
      clipFails: 0,
      youtubeBotWalls: 0,
      youtubeSkipped: 0,
      skipped: "off",
    },
    filescan: {
      enabled: false,
      submitted: 0,
      ready: 0,
      identified: 0,
      skipped: "off",
    },
  }),
  "noop",
);
assert.equal(
  enrichOutcome({
    identify: {
      enabled: true,
      candidates: 10,
      setsProbed: 4,
      probed: 8,
      identified: 2,
      unresolved: 1,
      clipFails: 0,
      youtubeBotWalls: 0,
      youtubeSkipped: 3,
      skipped: "",
    },
  }),
  "ok",
);
assert.equal(
  enrichOutcome({
    identify: {
      enabled: true,
      candidates: 10,
      setsProbed: 0,
      probed: 0,
      identified: 0,
      unresolved: 0,
      clipFails: 12,
      youtubeBotWalls: 1,
      youtubeSkipped: 8,
      skipped: "",
    },
    filescan: {
      enabled: true,
      submitted: 4,
      ready: 4,
      identified: 0,
      skipped: "",
    },
  }),
  "partial",
);

const gh = githubEnrichContext({
  GITHUB_RUN_ID: "32379015638",
  GITHUB_REPOSITORY: "tigges/SetTracker",
  GITHUB_SERVER_URL: "https://github.com",
  GITHUB_WORKFLOW: "Catalog enrich",
  GITHUB_REF_NAME: "main",
  ACRCLOUD_SET_LIMIT: "15",
  ACRCLOUD_MAX_PROBES_PER_SET: "12",
});
assert.ok(gh);
assert.equal(
  gh!.runUrl,
  "https://github.com/tigges/SetTracker/actions/runs/32379015638",
);
assert.equal(githubEnrichContext({}), undefined);

assert.deepEqual(
  identifySpendFromSnapshot({
    enabled: true,
    candidates: 10,
    setsProbed: 4,
    probed: 155,
    identified: 52,
    unresolved: 97,
    partial: 21,
    missed: 76,
    alreadyProbed: 40,
    clipFails: 0,
    youtubeBotWalls: 0,
    youtubeSkipped: 3,
    skipped: "",
  }),
  {
    requests: 155,
    hits: 52,
    partial: 21,
    missed: 76,
    alreadyProbed: 40,
  },
);
assert.deepEqual(
  fileScanSpendFromSnapshot({
    enabled: true,
    submitted: 8,
    reused: 12,
    ready: 20,
    identified: 81,
    partial: 132,
    missed: 3,
    skipped: "",
  }),
  {
    submitted: 8,
    reused: 12,
    hits: 81,
    partial: 132,
    missed: 3,
  },
);

console.log("enrichRunReport.test.ts ok");
