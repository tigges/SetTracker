import assert from "node:assert/strict";
import {
  estimateLlmSpend,
  formatLlmSpend,
  formatUsdRange,
  llmSpendConfirmed,
} from "./llmCost";

assert.equal(llmSpendConfirmed({}), false);
assert.equal(llmSpendConfirmed({ LLM_RESEARCH_CONFIRM: "0" }), false);
assert.equal(llmSpendConfirmed({ LLM_RESEARCH_CONFIRM: "1" }), true);
assert.equal(llmSpendConfirmed({ LLM_RESEARCH_CONFIRM: "yes" }), true);
assert.equal(llmSpendConfirmed({ LLM_RESEARCH_CONFIRM: "TRUE" }), true);

const one = estimateLlmSpend({
  jobs: ["handles"],
  limit: 24,
  providers: ["gemini"],
});
assert.equal(one.calls, 24);
assert.equal(one.usdLow, 0.36);
assert.equal(one.usdHigh, 1.08);
assert.match(formatLlmSpend(one), /≈ \$0\.36–\$1\.08/);
assert.match(formatLlmSpend(one), /~24 calls/);

const defaultJob = estimateLlmSpend({
  jobs: ["handles", "events", "quality"],
  limit: 24,
  providers: ["gemini"],
});
assert.equal(defaultJob.calls, 51);
assert.equal(Number(defaultJob.usdLow.toFixed(3)), 0.765);
assert.equal(Number(defaultJob.usdHigh.toFixed(3)), 2.295);

const both = estimateLlmSpend({
  jobs: ["handles"],
  limit: 10,
  providers: ["gemini", "claude"],
});
assert.equal(both.calls, 20);
assert.equal(Number(both.usdLow.toFixed(3)), 0.23);
assert.equal(Number(both.usdHigh.toFixed(3)), 0.7);

assert.equal(formatUsdRange(0.1, 0.1), "≈ $0.10");

console.log("llmCost.test.ts ok");
