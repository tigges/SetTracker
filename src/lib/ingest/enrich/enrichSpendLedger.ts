/**
 * Operator-facing ACR spend ledger — what the invoice does not list.
 *
 * ACR's monthly bill names SKUs and a dollar total. It does not say which
 * fields we asked for, how many Identify clips or File Scan POSTs we sent,
 * how many came back as hits / partials / no-match, or whether the same
 * YouTube URL or the same offset was billed twice.
 *
 * Client-safe (no fs) so /stats can render the same numbers.
 */

export const ACR_INVOICE_SKU = {
  identify:
    "Audio & Video Recognition — Valid Requests — ACRCloud Music — 3rd Party ID Integration",
  filescan:
    "File Scanning — Valid Requests — ACRCloud Music — 3rd Party ID Integration",
  filescanAi: "File Scanning for AI Detection — Valid Hours",
} as const;

export const ACR_SPEND_VARIABLES = [
  "artist",
  "title",
  "ISRC",
  "score",
  "offset",
] as const;

export const ACR_SPEND_VARIABLES_LABEL = ACR_SPEND_VARIABLES.join(", ");

/** Keep a billing-month of enrich runs in the catalog DB cache. */
export const ENRICH_SPEND_LEDGER_MAX_RUNS = 40;

export type IdentifySpendSlice = {
  /** Billable Identify clips sent this run. */
  requests: number;
  hits: number;
  partial: number;
  missed: number;
  /** Parked acr-miss offsets on probed sets — not billed again. */
  alreadyProbed: number;
};

export type FileScanSpendSlice = {
  /** New YouTube URL POSTs (the billable File Scan request). */
  submitted: number;
  /** Same video already in the container — GET reuse, no re-POST. */
  reused: number;
  hits: number;
  partial: number;
  missed: number;
};

export type EnrichSpendRun = {
  at: string;
  runId?: string;
  runUrl?: string;
  identify: IdentifySpendSlice;
  filescan: FileScanSpendSlice;
};

export type EnrichSpendTotals = IdentifySpendSlice & {
  filescanSubmitted: number;
  filescanReused: number;
  filescanHits: number;
  filescanPartial: number;
  filescanMissed: number;
};

export type EnrichSpendLedger = {
  version: 1;
  updatedAt: string;
  runs: EnrichSpendRun[];
};

export function emptyIdentifySpend(): IdentifySpendSlice {
  return {
    requests: 0,
    hits: 0,
    partial: 0,
    missed: 0,
    alreadyProbed: 0,
  };
}

export function emptyFileScanSpend(): FileScanSpendSlice {
  return {
    submitted: 0,
    reused: 0,
    hits: 0,
    partial: 0,
    missed: 0,
  };
}

export function emptySpendLedger(): EnrichSpendLedger {
  return { version: 1, updatedAt: "", runs: [] };
}

export function sumIdentifySpend(runs: EnrichSpendRun[]): IdentifySpendSlice {
  return runs.reduce((acc, r) => {
    acc.requests += r.identify.requests;
    acc.hits += r.identify.hits;
    acc.partial += r.identify.partial;
    acc.missed += r.identify.missed;
    acc.alreadyProbed += r.identify.alreadyProbed;
    return acc;
  }, emptyIdentifySpend());
}

export function sumFileScanSpend(runs: EnrichSpendRun[]): FileScanSpendSlice {
  return runs.reduce((acc, r) => {
    acc.submitted += r.filescan.submitted;
    acc.reused += r.filescan.reused;
    acc.hits += r.filescan.hits;
    acc.partial += r.filescan.partial;
    acc.missed += r.filescan.missed;
    return acc;
  }, emptyFileScanSpend());
}

export function sumSpendLedger(runs: EnrichSpendRun[]): EnrichSpendTotals {
  const id = sumIdentifySpend(runs);
  const fs = sumFileScanSpend(runs);
  return {
    ...id,
    filescanSubmitted: fs.submitted,
    filescanReused: fs.reused,
    filescanHits: fs.hits,
    filescanPartial: fs.partial,
    filescanMissed: fs.missed,
  };
}

function mergeIdentify(
  prev: IdentifySpendSlice,
  next?: IdentifySpendSlice,
): IdentifySpendSlice {
  if (!next) return prev;
  return { ...prev, ...next };
}

function mergeFileScan(
  prev: FileScanSpendSlice,
  next?: FileScanSpendSlice,
): FileScanSpendSlice {
  if (!next) return prev;
  return { ...prev, ...next };
}

/**
 * Identify and File Scan write in the same GitHub run. Fold them into one
 * row keyed by run id so the ledger is one line per invoice-able job.
 */
export function mergeSpendRunIntoLedger(
  prev: EnrichSpendLedger | null | undefined,
  patch: {
    at: string;
    runId?: string;
    runUrl?: string;
    identify?: IdentifySpendSlice;
    filescan?: FileScanSpendSlice;
  },
): EnrichSpendLedger {
  const base = prev?.version === 1 ? prev : emptySpendLedger();
  const runs = [...base.runs];
  const key = (patch.runId || "").trim();
  const idx = key
    ? runs.findIndex((r) => (r.runId || "").trim() === key)
    : -1;
  if (idx >= 0) {
    const cur = runs[idx]!;
    runs[idx] = {
      at: patch.at || cur.at,
      runId: cur.runId || patch.runId,
      runUrl: patch.runUrl || cur.runUrl,
      identify: mergeIdentify(cur.identify, patch.identify),
      filescan: mergeFileScan(cur.filescan, patch.filescan),
    };
  } else {
    runs.unshift({
      at: patch.at,
      runId: patch.runId,
      runUrl: patch.runUrl,
      identify: mergeIdentify(emptyIdentifySpend(), patch.identify),
      filescan: mergeFileScan(emptyFileScanSpend(), patch.filescan),
    });
  }
  return {
    version: 1,
    updatedAt: patch.at,
    runs: runs.slice(0, ENRICH_SPEND_LEDGER_MAX_RUNS),
  };
}

export function formatIdentifySpendLine(s: IdentifySpendSlice): string {
  return (
    `${s.requests} clip requests · ${s.hits} hits · ${s.partial} partial · ` +
    `${s.missed} no-match · ${s.alreadyProbed} offsets already parked (not billed)`
  );
}

export function formatFileScanSpendLine(s: FileScanSpendSlice): string {
  return (
    `${s.submitted} new submits (billed) · ${s.reused} reused same YouTube ` +
    `(no re-POST) · ${s.hits} hits · ${s.partial} partial · ${s.missed} no-match`
  );
}
