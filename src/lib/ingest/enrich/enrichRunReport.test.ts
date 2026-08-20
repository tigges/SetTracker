import assert from "node:assert/strict";
import { enrichOutcome, githubEnrichContext } from "./enrichRunReport";

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

console.log("enrichRunReport.test.ts ok");
