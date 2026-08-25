/**
 * complete() must refuse to call a model unless the plan was disclosed
 * AND spend was confirmed. Neither gate hits the network when it trips.
 */
import assert from "node:assert/strict";
import { complete } from "./llmResearch";
import { buildLlmPlan, announceLlmPlan, resetLlmPlanForTests } from "./llmPlan";

const plan = buildLlmPlan({
  jobs: ["handles"],
  providers: ["gemini"],
  limit: 2,
  apply: false,
});

async function expectBlocked(match: RegExp, label: string): Promise<void> {
  let message = "";
  try {
    await complete("gemini", "hello");
  } catch (err) {
    message = err instanceof Error ? err.message : String(err);
  }
  assert.match(message, match, label);
}

async function main() {
  resetLlmPlanForTests();
  delete process.env.LLM_RESEARCH_CONFIRM;

  // No plan, no confirm → blocked on disclosure first.
  await expectBlocked(/announceLlmPlan/, "must demand disclosure");

  // Confirmed spend is still not enough without disclosure.
  process.env.LLM_RESEARCH_CONFIRM = "1";
  await expectBlocked(/announceLlmPlan/, "confirm alone must not unlock");

  // Disclosed but unconfirmed → blocked on spend.
  resetLlmPlanForTests();
  delete process.env.LLM_RESEARCH_CONFIRM;
  announceLlmPlan(plan, () => {});
  await expectBlocked(/confirm spend/, "must demand confirmation");

  resetLlmPlanForTests();
  console.log("llmGate.test.ts ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
