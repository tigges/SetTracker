import assert from "node:assert/strict";
import {
  loadLlmResearchStats,
  summarizeHandleReport,
  summarizeIdentityReport,
} from "./llmResearchStats";

const empty = summarizeHandleReport("llm-handle-research.json", {
  stats: { scanned: 0, applied: 0, rejected: 0 },
  rows: [],
});
assert.equal(empty.round, null);
assert.equal(empty.fills.length, 0);

const dj = summarizeHandleReport("llm-handle-research-gemini.json", {
  generatedAt: "2026-08-17T06:00:00.000Z",
  provider: "gemini",
  stats: { scanned: 3, applied: 3, rejected: 1 },
  rows: [
    {
      slug: "meduza",
      name: "MEDUZA",
      accepted: [{ field: "instagram" }, { field: "soundcloud" }],
    },
    {
      slug: "parked",
      name: "Parked",
      accepted: [],
      rejected: [{ field: "website" }],
    },
    { slug: "skip-me", name: "Skip", accepted: [] },
  ],
});
assert.equal(dj.round?.target, "dj");
assert.equal(dj.round?.applied, 3);
assert.equal(dj.round?.found, 1);
assert.equal(dj.round?.partial, 1);
assert.equal(dj.round?.missed, 1);
assert.equal(dj.fills.length, 1);
assert.deepEqual(dj.fills[0]?.fields, ["instagram", "soundcloud"]);

const pinned = summarizeHandleReport("llm-handle-research-claude.json", {
  stats: { scanned: 2, applied: 0, rejected: 0 },
  tally: { tracked: 2, found: 9, partial: 8, missed: 7 },
  rows: [{ slug: "a", name: "A", accepted: [{ field: "instagram" }] }],
});
assert.equal(pinned.round?.found, 9);
assert.equal(pinned.round?.partial, 8);
assert.equal(pinned.round?.missed, 7);

const ev = summarizeHandleReport("llm-event-handle-research-claude.json", {
  provider: "claude",
  stats: { scanned: 1, applied: 2, rejected: 0 },
  rows: [
    {
      slug: "tomorrowland",
      name: "Tomorrowland",
      accepted: [{ field: "instagram" }, { field: "website" }],
    },
  ],
});
assert.equal(ev.round?.target, "event");
assert.equal(ev.fills[0]?.kind, "event");

const id = summarizeIdentityReport({
  rows: [
    { slug: "a-deeper", name: "A DEEPER", cls: "junk", sets: 1 },
    { slug: "bdk", name: "BDK", cls: "touring_dj", sets: 1 },
    { slug: "nope", name: "Nope", cls: null },
  ],
});
assert.equal(id.length, 2);

const live = loadLlmResearchStats();
assert.ok(live.totals.djsScanned >= 200, "expected committed DJ research rounds");
assert.ok(live.totals.djFieldsApplied >= 500);
assert.equal(live.totals.eventsScanned, 88);
assert.equal(live.totals.eventFieldsApplied, 73);
assert.equal(live.totals.djFieldSlots, live.totals.djsScanned * 5);
assert.equal(live.totals.eventFieldSlots, 88 * 4);
assert.ok(live.totals.djFieldsApplied / live.totals.djFieldSlots < 1);
assert.ok(live.totals.djWithWrite <= live.totals.djsScanned);
assert.ok(live.providers.includes("gemini") || live.providers.includes("claude"));
assert.ok(!live.rounds.some((r) => r.file === "llm-event-handle-research.json"));
assert.ok(live.fills.some((f) => f.kind === "dj"));
assert.ok(live.identity.some((r) => r.cls === "junk"));
assert.doesNotMatch(JSON.stringify(live.fills), /1001tracklists\.com/);
const handleRounds = live.rounds.filter(
  (r) => r.target === "dj" || r.target === "event",
);
const liveSent = handleRounds.reduce(
  (n, r) => n + (r.found ?? 0) + (r.partial ?? 0) + (r.missed ?? 0),
  0,
);
assert.ok(liveSent > 0);
assert.ok(
  handleRounds.every(
    (r) =>
      r.scanned === 0 ||
      (r.found ?? 0) + (r.partial ?? 0) + (r.missed ?? 0) > 0,
  ),
);

console.log("llmResearchStats.test.ts ok");
