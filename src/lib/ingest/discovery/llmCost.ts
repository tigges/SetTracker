/**
 * Approximate LLM spend for catalog research.
 * Operator-facing only — not a billing quote.
 *
 * Gemini Flash + Search grounding dominates. Claude Sonnet is the
 * unaided fallback. Numbers are rounded USD ranges for one generate call
 * at our usual prompt size (~800 in / ~300 out).
 */

export type LlmCostProvider = "claude" | "gemini";
export type LlmCostJob =
  | "handles"
  | "events"
  | "identity"
  | "homecity"
  | "videos"
  | "tracks"
  | "cues"
  | "quality";

export const LLM_USD_PER_CALL: Record<
  LlmCostProvider,
  { low: number; high: number }
> = {
  gemini: { low: 0.015, high: 0.045 },
  claude: { low: 0.008, high: 0.025 },
};

/** Jobs that hit the model once per researched row. */
const ROW_JOBS = new Set<LlmCostJob>([
  "handles",
  "events",
  "identity",
  "homecity",
  "videos",
  "tracks",
  "cues",
]);

export type LlmSpendEstimate = {
  providers: LlmCostProvider[];
  jobs: LlmCostJob[];
  limit: number;
  calls: number;
  usdLow: number;
  usdHigh: number;
  summary: string;
};

export function llmSpendConfirmed(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const v = (env.LLM_RESEARCH_CONFIRM || "").trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true";
}

export function estimateLlmSpend(input: {
  jobs: LlmCostJob[];
  limit?: number;
  providers?: LlmCostProvider[];
}): LlmSpendEstimate {
  const limit = Math.max(1, input.limit ?? 24);
  const providers = input.providers?.length
    ? input.providers
    : (["gemini"] as LlmCostProvider[]);
  const rowJobs = input.jobs.filter((j) => ROW_JOBS.has(j)).length;
  const qualityCalls = input.jobs.includes("quality") ? 3 : 0;
  const callsPerProvider = rowJobs * limit + qualityCalls;
  const calls = providers.length * callsPerProvider;
  const usdLow = providers.reduce(
    (sum, p) => sum + LLM_USD_PER_CALL[p].low * callsPerProvider,
    0,
  );
  const usdHigh = providers.reduce(
    (sum, p) => sum + LLM_USD_PER_CALL[p].high * callsPerProvider,
    0,
  );
  const summary = formatLlmSpend({
    providers,
    jobs: input.jobs,
    limit,
    calls,
    usdLow,
    usdHigh,
    summary: "",
  });
  return {
    providers,
    jobs: input.jobs,
    limit,
    calls,
    usdLow,
    usdHigh,
    summary,
  };
}

export function formatUsdRange(low: number, high: number): string {
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  if (Math.abs(high - low) < 0.005) return `≈ ${fmt(low)}`;
  return `≈ ${fmt(low)}–${fmt(high)}`;
}

export function formatLlmSpend(est: LlmSpendEstimate): string {
  const who = est.providers
    .map((p) => (p === "gemini" ? "Gemini Flash + Search" : "Claude Sonnet"))
    .join(" + ");
  const jobs = est.jobs.join(", ") || "handles";
  return `${formatUsdRange(est.usdLow, est.usdHigh)} · ~${est.calls} calls · ${who} · ${jobs} (cap ${est.limit})`;
}
