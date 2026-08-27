import assert from "node:assert/strict";
import {
  LLM_JOB_VARIABLES,
  addLlmTally,
  classifyLlmOutcome,
  emptyLlmTally,
  formatLlmHitRate,
  formatLlmTrackMessage,
  llmJobVariablesLabel,
} from "./llmTrackRecord";
import { RESEARCH_JOBS } from "./llmJobs";

for (const job of RESEARCH_JOBS) {
  assert.ok(LLM_JOB_VARIABLES[job]?.length, `${job} must name variables`);
}

assert.equal(
  llmJobVariablesLabel("handles"),
  "SoundCloud, YouTube, Instagram, X, website",
);

assert.equal(classifyLlmOutcome({ found: true, namedPartial: true }), "found");
assert.equal(
  classifyLlmOutcome({ found: false, namedPartial: true }),
  "partial",
);
assert.equal(
  classifyLlmOutcome({ found: false, namedPartial: false }),
  "missed",
);

const tally = emptyLlmTally();
addLlmTally(tally, "found");
addLlmTally(tally, "found");
addLlmTally(tally, "partial");
addLlmTally(tally, "missed");
assert.deepEqual(tally, { found: 2, partial: 1, missed: 1 });

assert.equal(formatLlmHitRate(6, 24), "25.0%");
assert.equal(formatLlmHitRate(0, 0), "n/a");

assert.equal(
  formatLlmTrackMessage("handles", {
    tracked: 24,
    found: 6,
    partial: 11,
    missed: 7,
  }),
  "handles tracking SoundCloud, YouTube, Instagram, X, website — 24 tracked, 6 found (25.0%), 11 partial parked, 7 no-match",
);

console.log("llmTrackRecord.test.ts ok");
