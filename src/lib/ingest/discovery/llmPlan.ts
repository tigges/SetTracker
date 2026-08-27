/**
 * Mandatory pre-flight disclosure for every model call.
 *
 * No prompt reaches Claude or Gemini until this plan has been printed in
 * the current process. `complete()` throws otherwise, so a new call site
 * cannot quietly skip the explanation. Pure module (no fs / no readline)
 * so /stats can render the same wording the CLI prints.
 */

import {
  estimateLlmSpend,
  formatLlmSpend,
  formatUsdRange,
  type LlmCostJob,
  type LlmCostProvider,
  type LlmSpendEstimate,
} from "./llmCost";
import { llmJobVariablesLabel } from "./llmTrackRecord";

export type LlmJobDisclosure = {
  /** What question the model is asked. */
  researches: string;
  /** Catalog data placed in the prompt. */
  sends: string;
  /** What may be written back, and under which check. */
  writes: string;
};

/** Plain-language disclosure per job. Keep in sync with the job runners. */
export const LLM_JOB_DISCLOSURE: Record<LlmCostJob, LlmJobDisclosure> = {
  handles: {
    researches:
      "Official SoundCloud / YouTube / Instagram / X / website for catalog DJs that have sets but no handle",
    sends: "DJ name + catalog context (their set titles)",
    writes:
      "Fill-null social fields, only after the URL is live, is a profile, matches the DJ name, and is unowned",
  },
  events: {
    researches: "Official socials / website for catalog festivals and clubs",
    sends: "Event name, kind (festival / club), location",
    writes:
      "Fill-null Event socials, same verify-then-write check as DJ handles",
  },
  identity: {
    researches:
      "Whether a stored name is a touring DJ, a track credit, a venue host, or junk",
    sends: "DJ name + how many catalog sets it has",
    writes: "Nothing — report only",
  },
  homecity: {
    researches: "Home city for catalog DJs that have sets but no city",
    sends: "DJ name + already-known official socials",
    writes: "Fill-null Dj.homeCity",
  },
  videos: {
    researches: "Official full-set video for sets held without playback",
    sends: "Set title + primary artist",
    writes: "Nothing — report only, never a sourceUrl overwrite",
  },
  tracks: {
    researches: "ISRC / canonical Beatport / Spotify URL for catalog tracks",
    sends: "Track artist + title (no audio)",
    writes:
      "Fill-null track IDs only when Deezer or MusicBrainz confirms the proposal",
  },
  cues: {
    researches:
      "Timed cues that already appear verbatim in a first-party YouTube / SoundCloud / hearthis description",
    sends: "Set title + up to 8k characters of that public description",
    writes:
      "Extra clocks only when the timestamp is in that text; never interpolated, never over 1001tl / fingerprint / community rows",
  },
  quality: {
    researches: "Free-text reviewer notes on catalog health",
    sends: "Aggregate catalog counts",
    writes: "Nothing — report only",
  },
};

export type LlmPlan = {
  jobs: LlmCostJob[];
  providers: LlmCostProvider[];
  limit: number;
  /** False when LLM extras stay report-only. */
  apply: boolean;
  estimate: LlmSpendEstimate;
};

export function buildLlmPlan(input: {
  jobs: LlmCostJob[];
  providers: LlmCostProvider[];
  limit: number;
  apply: boolean;
}): LlmPlan {
  return {
    jobs: input.jobs,
    providers: input.providers,
    limit: input.limit,
    apply: input.apply,
    estimate: estimateLlmSpend({
      jobs: input.jobs,
      limit: input.limit,
      providers: input.providers.length ? input.providers : ["gemini"],
    }),
  };
}

export function providerLabel(p: LlmCostProvider): string {
  return p === "gemini" ? "Gemini Flash + Google Search" : "Claude Sonnet";
}

/** Operator-facing disclosure. Printed before any model call. */
export function formatLlmPlan(plan: LlmPlan): string {
  const lines: string[] = [];
  lines.push("=== LLM research plan — nothing has been sent yet ===");
  lines.push(
    `Providers: ${plan.providers.map(providerLabel).join(" + ") || "none"}`,
  );
  lines.push(`Row cap per job: ${plan.limit}`);
  lines.push(
    `Writes: ${
      plan.apply
        ? "verified fill-null writes allowed"
        : "dry-run (report only, no LLM extras written)"
    }`,
  );
  lines.push("");
  lines.push("Information researched:");
  for (const job of plan.jobs) {
    const d = LLM_JOB_DISCLOSURE[job];
    if (!d) continue;
    lines.push(`  • ${job} — ${d.researches}`);
    lines.push(`      tracks: ${llmJobVariablesLabel(job)}`);
    lines.push(`      sends:  ${d.sends}`);
    lines.push(`      writes: ${d.writes}`);
  }
  lines.push("");
  lines.push(
    "Prompts carry public catalog metadata only (names, titles, public URLs and descriptions). No secrets, no listener data.",
  );
  lines.push("");
  lines.push(
    `Estimated cost: ${formatUsdRange(
      plan.estimate.usdLow,
      plan.estimate.usdHigh,
    )} for up to ~${plan.estimate.calls} calls.`,
  );
  lines.push(`Detail: ${formatLlmSpend(plan.estimate)}`);
  lines.push(
    "Estimate only — an approximate range at our usual prompt size, not a billing quote.",
  );
  lines.push("=====================================================");
  return lines.join("\n");
}

/** GitHub job-summary flavour of the same disclosure. */
export function formatLlmPlanMarkdown(plan: LlmPlan): string {
  const lines: string[] = [];
  lines.push("### LLM research plan (pre-flight)");
  lines.push("");
  lines.push(
    `**Estimated cost:** ${formatUsdRange(
      plan.estimate.usdLow,
      plan.estimate.usdHigh,
    )} · up to ~${plan.estimate.calls} calls · ${
      plan.providers.map(providerLabel).join(" + ") || "no provider"
    } · row cap ${plan.limit} · ${
      plan.apply ? "writes allowed" : "dry-run"
    }`,
  );
  lines.push("");
  lines.push("| Job | Tracks | Information researched | Sent to the model | Written back |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const job of plan.jobs) {
    const d = LLM_JOB_DISCLOSURE[job];
    if (!d) continue;
    lines.push(
      `| \`${job}\` | ${llmJobVariablesLabel(job)} | ${d.researches} | ${d.sends} | ${d.writes} |`,
    );
  }
  lines.push("");
  lines.push(
    "Prompts carry public catalog metadata only. Estimate is an approximate range, not a billing quote.",
  );
  return lines.join("\n");
}

let announced: LlmPlan | null = null;

/** Print the disclosure and unlock `complete()` for this process. */
export function announceLlmPlan(
  plan: LlmPlan,
  log: (msg: string) => void = console.log,
): void {
  log(formatLlmPlan(plan));
  announced = plan;
}

export function llmPlanAnnounced(): boolean {
  return announced !== null;
}

export function announcedLlmPlan(): LlmPlan | null {
  return announced;
}

/** Test helper — do not use from ingest. */
export function resetLlmPlanForTests(): void {
  announced = null;
}
