import assert from "node:assert/strict";
import {
  fieldFillSlices,
  fileScanOutcomeFromReport,
  identifyOutcomeFromReport,
  llmFieldView,
  llmHasOutcomeTally,
  llmRoundOutcome,
  outcomeSlices,
} from "./statsRunHealth";
import type { LlmResearchStats } from "./llmResearchStats";

const bar = outcomeSlices({ hit: 18, partial: 4, miss: 218 });
assert.deepEqual(
  bar.map((s) => [s.key, s.count, s.color]),
  [
    ["hit", 18, "var(--brand)"],
    ["partial", 4, "var(--amber)"],
    ["miss", 218, "var(--grey)"],
  ],
);

const fill = fieldFillSlices(29, 140);
assert.deepEqual(
  fill.map((s) => [s.key, s.count]),
  [
    ["written", 29],
    ["open", 111],
  ],
);
assert.equal(fieldFillSlices(200, 100)[0]?.count, 100);
assert.equal(fieldFillSlices(200, 100)[1]?.count, 0);
assert.equal(fieldFillSlices(5, 0)[0]?.count, 5);

assert.deepEqual(
  identifyOutcomeFromReport({
    enabled: true,
    candidates: 10,
    setsProbed: 4,
    probed: 8,
    identified: 2,
    unresolved: 3,
    partial: 1,
    clipFails: 0,
    youtubeBotWalls: 0,
    youtubeSkipped: 0,
    skipped: "",
  }),
  { hit: 2, partial: 1, miss: 2, probed: 8 },
);
assert.deepEqual(
  fileScanOutcomeFromReport({
    enabled: true,
    submitted: 3,
    reused: 1,
    ready: 4,
    identified: 2,
    partial: 1,
    missed: 1,
    skipped: "",
  }),
  { hit: 2, partial: 1, miss: 1, videos: 4 },
);

const rounds = [
  {
    file: "llm-handle-research-gemini.json",
    provider: "gemini",
    target: "dj" as const,
    scanned: 24,
    applied: 10,
    rejected: 4,
    found: 8,
    partial: 3,
    missed: 13,
    generatedAt: "2026-08-17T06:00:00.000Z",
  },
];
assert.deepEqual(llmRoundOutcome(rounds), { found: 8, partial: 3, missed: 13 });
assert.equal(llmHasOutcomeTally(rounds), true);
assert.equal(
  llmHasOutcomeTally([{ ...rounds[0]!, found: 0, partial: 0, missed: 0 }]),
  false,
);

const stats: LlmResearchStats = {
  generatedAt: "2026-08-17T06:00:00.000Z",
  note: "",
  totals: {
    djsScanned: 28,
    djFieldsApplied: 29,
    djFieldSlots: 140,
    djWithWrite: 12,
    eventsScanned: 8,
    eventFieldsApplied: 10,
    eventFieldSlots: 32,
    eventWithWrite: 4,
    identityClassified: 0,
    touringDj: 0,
    junkOrHost: 0,
  },
  providers: ["gemini"],
  firstParty: null,
  rounds,
  fills: [],
  identity: [],
};
const view = llmFieldView(stats);
assert.equal(view.dj.find((s) => s.key === "written")?.count, 29);
assert.equal(view.dj.find((s) => s.key === "open")?.count, 111);
assert.equal(view.event.find((s) => s.key === "written")?.count, 10);
assert.ok(view.outcome);
assert.equal(view.outcome.find((s) => s.key === "hit")?.count, 8);

console.log("statsRunHealth.test.ts ok");
