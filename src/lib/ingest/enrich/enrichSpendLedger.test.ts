import assert from "node:assert/strict";
import {
  ACR_INVOICE_SKU,
  ACR_SPEND_VARIABLES_LABEL,
  ENRICH_SPEND_LEDGER_MAX_RUNS,
  emptyIdentifySpend,
  formatFileScanSpendLine,
  formatIdentifySpendLine,
  mergeSpendRunIntoLedger,
  sumSpendLedger,
} from "./enrichSpendLedger";

assert.equal(
  ACR_SPEND_VARIABLES_LABEL,
  "artist, title, ISRC, score, offset",
);
assert.match(ACR_INVOICE_SKU.identify, /Audio & Video Recognition/);
assert.match(ACR_INVOICE_SKU.filescan, /File Scanning/);
assert.match(ACR_INVOICE_SKU.filescanAi, /AI Detection/);

const first = mergeSpendRunIntoLedger(null, {
  at: "2026-08-28T12:00:00.000Z",
  runId: "100",
  runUrl: "https://github.com/tigges/SetTracker/actions/runs/100",
  identify: {
    requests: 155,
    hits: 52,
    partial: 21,
    missed: 76,
    alreadyProbed: 40,
  },
});
assert.equal(first.runs.length, 1);
assert.equal(first.runs[0]!.filescan.submitted, 0);

const sameRun = mergeSpendRunIntoLedger(first, {
  at: "2026-08-28T12:10:00.000Z",
  runId: "100",
  filescan: {
    submitted: 8,
    reused: 12,
    hits: 81,
    partial: 132,
    missed: 3,
  },
});
assert.equal(sameRun.runs.length, 1);
assert.equal(sameRun.runs[0]!.identify.requests, 155);
assert.equal(sameRun.runs[0]!.filescan.reused, 12);

const nextDay = mergeSpendRunIntoLedger(sameRun, {
  at: "2026-08-29T06:00:00.000Z",
  runId: "101",
  identify: {
    requests: 20,
    hits: 4,
    partial: 2,
    missed: 14,
    alreadyProbed: 8,
  },
  filescan: {
    submitted: 2,
    reused: 5,
    hits: 10,
    partial: 6,
    missed: 0,
  },
});
assert.equal(nextDay.runs[0]!.runId, "101");
assert.equal(nextDay.runs.length, 2);

const totals = sumSpendLedger(nextDay.runs);
assert.equal(totals.requests, 175);
assert.equal(totals.hits, 56);
assert.equal(totals.filescanSubmitted, 10);
assert.equal(totals.filescanReused, 17);
assert.equal(totals.alreadyProbed, 48);

assert.equal(
  formatIdentifySpendLine(emptyIdentifySpend()),
  "0 clip requests · 0 hits · 0 partial · 0 no-match · 0 offsets already parked (not billed)",
);
assert.match(
  formatIdentifySpendLine(nextDay.runs[0]!.identify),
  /20 clip requests/,
);
assert.match(
  formatFileScanSpendLine(sameRun.runs[0]!.filescan),
  /8 new submits \(billed\) · 12 reused same YouTube/,
);

let rolled = nextDay;
for (let i = 0; i < ENRICH_SPEND_LEDGER_MAX_RUNS + 5; i++) {
  rolled = mergeSpendRunIntoLedger(rolled, {
    at: `2026-09-01T00:00:00.${String(i).padStart(3, "0")}Z`,
    runId: `extra-${i}`,
    identify: {
      requests: 1,
      hits: 0,
      partial: 0,
      missed: 1,
      alreadyProbed: 0,
    },
  });
}
assert.equal(rolled.runs.length, ENRICH_SPEND_LEDGER_MAX_RUNS);

console.log("enrichSpendLedger.test.ts ok");
