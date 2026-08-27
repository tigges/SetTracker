/**
 * Shared LLM research bookkeeping.
 *
 * Every job names the variables it looks for, then tallies exclusive
 * outcomes so a later run can say what was tracked, found, parked as
 * partial, or returned nothing — without retracing the same keys.
 */

import type { LlmCostJob } from "./llmCost";

export const LLM_JOB_VARIABLES: Record<LlmCostJob, readonly string[]> = {
  handles: ["SoundCloud", "YouTube", "Instagram", "X", "website"],
  events: ["SoundCloud", "Instagram", "X", "website"],
  identity: ["class", "confidence", "notes"],
  homecity: ["homeCity", "website"],
  videos: ["watchUrl", "confidence", "notes"],
  tracks: ["ISRC", "Beatport URL"],
  cues: ["at", "artist", "title"],
  quality: ["kind", "slug", "issue", "severity"],
};

export function llmJobVariablesLabel(job: LlmCostJob): string {
  return LLM_JOB_VARIABLES[job].join(", ");
}

export type LlmTallyKind = "found" | "partial" | "missed";

export type LlmTally = {
  found: number;
  partial: number;
  missed: number;
};

export function emptyLlmTally(): LlmTally {
  return { found: 0, partial: 0, missed: 0 };
}

/** Exclusive: a confirmed write beats a parked partial; nothing named is a miss. */
export function classifyLlmOutcome(opts: {
  found: boolean;
  namedPartial: boolean;
}): LlmTallyKind {
  if (opts.found) return "found";
  if (opts.namedPartial) return "partial";
  return "missed";
}

export function addLlmTally(tally: LlmTally, kind: LlmTallyKind): void {
  tally[kind] += 1;
}

export function formatLlmHitRate(found: number, tracked: number): string {
  if (tracked <= 0) return "n/a";
  return `${((found / tracked) * 100).toFixed(1)}%`;
}

/** Console / /stats line: variables, tracked, found, partials, miss. */
export function formatLlmTrackMessage(
  job: LlmCostJob,
  stats: { tracked: number; found: number; partial: number; missed: number },
): string {
  const rate = formatLlmHitRate(stats.found, stats.tracked);
  return (
    `${job} tracking ${llmJobVariablesLabel(job)} — ` +
    `${stats.tracked} tracked, ${stats.found} found (${rate}), ` +
    `${stats.partial} partial parked, ${stats.missed} no-match`
  );
}
