/**
 * /stats Last enrich + Last LLM research — exclusive slices for the
 * same stacked bars the DJ / set / track cards use. Client-safe.
 */
import type { HealthSlice } from "./statsHealth";
import type { LlmResearchRound, LlmResearchStats } from "./llmResearchStats";
import type { EnrichRunReport } from "./ingest/enrich/enrichRunReport";
import type {
  FileScanSpendSlice,
  IdentifySpendSlice,
} from "./ingest/enrich/enrichSpendLedger";

const HIT = "var(--brand)";
const PARTIAL = "var(--amber)";
const MISS = "var(--grey)";
const WRITTEN = "var(--brand)";
const OPEN = "var(--grey)";

function slice(
  key: string,
  label: string,
  count: number,
  color: string,
): HealthSlice {
  return { key, label, count: Math.max(0, count), color, star: 0 };
}

/** Hit / partial / miss — skip empty slices so the bar stays readable. */
export function outcomeSlices(opts: {
  hit: number;
  partial: number;
  miss: number;
}): HealthSlice[] {
  return [
    slice("hit", "hit", opts.hit, HIT),
    slice("partial", "partial", opts.partial, PARTIAL),
    slice("miss", "miss", opts.miss, MISS),
  ];
}

/** Fields written vs remaining slots. Written never inflates past slots. */
export function fieldFillSlices(written: number, slots: number): HealthSlice[] {
  const w = Math.max(0, written);
  const s = Math.max(0, slots);
  const filled = s > 0 ? Math.min(w, s) : w;
  const open = Math.max(0, s - filled);
  return [
    slice("written", "written", filled, WRITTEN),
    slice("open", "open", open, OPEN),
  ];
}

export function identifyOutcomeFromReport(
  id: EnrichRunReport["identify"] | null | undefined,
): { hit: number; partial: number; miss: number; probed: number } {
  const probed = id?.probed ?? 0;
  const hit = id?.identified ?? 0;
  const partial = id?.partial ?? 0;
  const miss =
    id?.missed ?? Math.max(0, (id?.unresolved ?? 0) - partial);
  return { hit, partial, miss, probed };
}

export function fileScanOutcomeFromReport(
  fs: EnrichRunReport["filescan"] | null | undefined,
): { hit: number; partial: number; miss: number; videos: number } {
  const hit = fs?.identified ?? 0;
  const partial = fs?.partial ?? 0;
  const miss = fs?.missed ?? 0;
  const videos = (fs?.submitted ?? 0) + (fs?.reused ?? 0);
  return { hit, partial, miss, videos };
}

export function identifySlicesFromSpend(s: IdentifySpendSlice): HealthSlice[] {
  return outcomeSlices({ hit: s.hits, partial: s.partial, miss: s.missed });
}

export function fileScanSlicesFromSpend(s: FileScanSpendSlice): HealthSlice[] {
  return outcomeSlices({ hit: s.hits, partial: s.partial, miss: s.missed });
}

export function llmRoundOutcome(rounds: LlmResearchRound[]): {
  found: number;
  partial: number;
  missed: number;
} {
  let found = 0;
  let partial = 0;
  let missed = 0;
  for (const r of rounds) {
    found += r.found ?? 0;
    partial += r.partial ?? 0;
    missed += r.missed ?? 0;
  }
  return { found, partial, missed };
}

export function llmHasOutcomeTally(rounds: LlmResearchRound[]): boolean {
  const t = llmRoundOutcome(rounds);
  return t.found + t.partial + t.missed > 0;
}

export function llmFieldView(stats: LlmResearchStats): {
  dj: HealthSlice[];
  event: HealthSlice[];
  djSlots: number;
  eventSlots: number;
  outcome: HealthSlice[] | null;
} {
  const djRounds = stats.rounds.filter((r) => r.target === "dj");
  const tally = llmRoundOutcome(djRounds);
  return {
    dj: fieldFillSlices(stats.totals.djFieldsApplied, stats.totals.djFieldSlots),
    event: fieldFillSlices(
      stats.totals.eventFieldsApplied,
      stats.totals.eventFieldSlots,
    ),
    djSlots: stats.totals.djFieldSlots,
    eventSlots: stats.totals.eventFieldSlots,
    outcome: llmHasOutcomeTally(djRounds)
      ? outcomeSlices({
          hit: tally.found,
          partial: tally.partial,
          miss: tally.missed,
        })
      : null,
  };
}

function requestSent(
  rounds: LlmResearchRound[],
  scannedFallback: number,
): { found: number; partial: number; missed: number; sent: number } {
  const tally = llmRoundOutcome(rounds);
  const fromTally = tally.found + tally.partial + tally.missed;
  if (rounds.length === 0) return { ...tally, sent: 0 };
  return {
    ...tally,
    sent: fromTally > 0 ? fromTally : scannedFallback,
  };
}

/** Requests sent → exclusive hit / partial / miss. Field fill is a footnote. */
export function llmRequestView(stats: LlmResearchStats): {
  sent: number;
  found: number;
  partial: number;
  missed: number;
  slices: HealthSlice[];
  event: { sent: number; slices: HealthSlice[] } | null;
  fields: {
    djWritten: number;
    djSlots: number;
    eventWritten: number;
    eventSlots: number;
  };
} {
  const handleRounds = stats.rounds.filter(
    (r) => r.target === "dj" || r.target === "event",
  );
  const eventRounds = handleRounds.filter((r) => r.target === "event");
  const all = requestSent(
    handleRounds,
    stats.totals.djsScanned + stats.totals.eventsScanned,
  );
  const event = requestSent(eventRounds, stats.totals.eventsScanned);
  return {
    sent: all.sent,
    found: all.found,
    partial: all.partial,
    missed: all.missed,
    slices: outcomeSlices({
      hit: all.found,
      partial: all.partial,
      miss: all.missed,
    }),
    event:
      event.sent > 0
        ? {
            sent: event.sent,
            slices: outcomeSlices({
              hit: event.found,
              partial: event.partial,
              miss: event.missed,
            }),
          }
        : null,
    fields: {
      djWritten: stats.totals.djFieldsApplied,
      djSlots: stats.totals.djFieldSlots,
      eventWritten: stats.totals.eventFieldsApplied,
      eventSlots: stats.totals.eventFieldSlots,
    },
  };
}
