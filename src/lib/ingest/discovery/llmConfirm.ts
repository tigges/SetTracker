/**
 * Disclose, then ask. Model calls stay blocked until both happen.
 *
 * The plan (what is researched, what is sent, what is written, cost range)
 * is always printed first — on a laptop and in Actions. Catalog LLM
 * research sets LLM_RESEARCH_CONFIRM=1 on a standing budget. Local CLI
 * still needs the env flag or an interactive yes. Unconfirmed local runs
 * print the plan and stop. Parser-only cue clocks never need this.
 */

import { appendFileSync } from "node:fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { formatUsdRange, llmSpendConfirmed } from "./llmCost";
import {
  announceLlmPlan,
  formatLlmPlanMarkdown,
  type LlmPlan,
} from "./llmPlan";

/** Mirror the disclosure onto the GitHub run summary. */
function writeJobSummary(plan: LlmPlan, env: NodeJS.ProcessEnv): void {
  const path = env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  try {
    appendFileSync(path, `${formatLlmPlanMarkdown(plan)}\n\n`, "utf8");
  } catch {
    // Summary is a convenience — never fail a run over it.
  }
}

/**
 * Print the plan, then decide whether the model may be called.
 * Always call this before running jobs; it is what unlocks `complete()`.
 */
export async function confirmLlmSpend(
  plan: LlmPlan,
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  announceLlmPlan(plan);
  writeJobSummary(plan, env);

  if ((env.LLM_RESEARCH || "").trim() === "0") {
    console.log("[llm-research] no model calls (LLM_RESEARCH=0)");
    return false;
  }
  if (llmSpendConfirmed(env)) {
    console.log(
      "[llm-research] spend confirmed (LLM_RESEARCH_CONFIRM) — proceeding with the plan above",
    );
    return true;
  }
  if (input.isTTY && output.isTTY) {
    const rl = readline.createInterface({ input, output });
    try {
      const answer = (
        await rl.question(
          `Send the ${plan.jobs.join(", ")} prompts above for ${formatUsdRange(
            plan.estimate.usdLow,
            plan.estimate.usdHigh,
          )}? Type yes: `,
        )
      )
        .trim()
        .toLowerCase();
      if (answer === "yes" || answer === "y") {
        process.env.LLM_RESEARCH_CONFIRM = "1";
        return true;
      }
    } finally {
      rl.close();
    }
    console.log("[llm-research] no model calls (not confirmed)");
    return false;
  }
  console.log(
    "[llm-research] no model calls — this run only printed the plan. Catalog LLM research spends automatically. Locally set LLM_RESEARCH_CONFIRM=1.",
  );
  return false;
}
