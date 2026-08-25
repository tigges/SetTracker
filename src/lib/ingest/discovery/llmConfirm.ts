/**
 * Gate model calls. Parser clocks still write without this.
 *
 * Confirm with LLM_RESEARCH_CONFIRM=1, an interactive yes, or the
 * Catalog LLM research workflow checkbox. Deep/enrich skip the model
 * when unconfirmed and print the estimate.
 */

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  formatLlmSpend,
  llmSpendConfirmed,
  type LlmSpendEstimate,
} from "./llmCost";

export async function confirmLlmSpend(
  estimate: LlmSpendEstimate,
  env: Record<string, string | undefined> = process.env,
): Promise<boolean> {
  console.log(`[llm-research] spend estimate: ${formatLlmSpend(estimate)}`);
  if ((env.LLM_RESEARCH || "").trim() === "0") {
    console.log("[llm-research] skipped (LLM_RESEARCH=0)");
    return false;
  }
  if (llmSpendConfirmed(env)) {
    console.log("[llm-research] spend confirmed (LLM_RESEARCH_CONFIRM)");
    return true;
  }
  if (input.isTTY && output.isTTY) {
    const rl = readline.createInterface({ input, output });
    try {
      const answer = (
        await rl.question(
          `Type yes to spend ${formatLlmSpend(estimate).split(" · ")[0]}: `,
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
    console.log("[llm-research] skipped (no confirmation)");
    return false;
  }
  console.log(
    "[llm-research] skipped model calls — set LLM_RESEARCH_CONFIRM=1 or check Accept spend on Catalog LLM research. Parser clocks still write.",
  );
  return false;
}
