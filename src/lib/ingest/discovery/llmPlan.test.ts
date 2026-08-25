import assert from "node:assert/strict";
import {
  announceLlmPlan,
  announcedLlmPlan,
  buildLlmPlan,
  formatLlmPlan,
  formatLlmPlanMarkdown,
  llmPlanAnnounced,
  LLM_JOB_DISCLOSURE,
  resetLlmPlanForTests,
} from "./llmPlan";
import { RESEARCH_JOBS } from "./llmJobs";

// Every runnable job must disclose what it researches, sends, and writes.
for (const job of RESEARCH_JOBS) {
  const d = LLM_JOB_DISCLOSURE[job];
  assert.ok(d, `missing disclosure for ${job}`);
  assert.ok(d.researches.length > 10, `${job} researches too vague`);
  assert.ok(d.sends.length > 5, `${job} sends too vague`);
  assert.ok(d.writes.length > 5, `${job} writes too vague`);
}

const plan = buildLlmPlan({
  jobs: ["handles", "cues"],
  providers: ["gemini"],
  limit: 24,
  apply: false,
});
assert.equal(plan.estimate.calls, 48);

const text = formatLlmPlan(plan);
assert.match(text, /nothing has been sent yet/);
assert.match(text, /Gemini Flash \+ Google Search/);
assert.match(text, /Information researched:/);
assert.match(text, /handles — Official SoundCloud/);
assert.match(text, /sends:/);
assert.match(text, /writes:/);
assert.match(text, /Estimated cost: ≈ \$0\.72–\$2\.16/);
assert.match(text, /dry-run/);
assert.match(text, /public catalog metadata only/);

const md = formatLlmPlanMarkdown(plan);
assert.match(md, /### LLM research plan \(pre-flight\)/);
assert.match(md, /\| `handles` \|/);
assert.match(md, /\| `cues` \|/);

// The gate: nothing is unlocked until the plan is announced.
resetLlmPlanForTests();
assert.equal(llmPlanAnnounced(), false);
assert.equal(announcedLlmPlan(), null);
const printed: string[] = [];
announceLlmPlan(plan, (m) => printed.push(m));
assert.equal(llmPlanAnnounced(), true);
assert.equal(announcedLlmPlan()?.jobs.length, 2);
assert.equal(printed.length, 1);
assert.match(printed[0]!, /Estimated cost/);

const applied = buildLlmPlan({
  jobs: ["handles"],
  providers: ["gemini", "claude"],
  limit: 10,
  apply: true,
});
assert.equal(applied.estimate.calls, 20);
assert.match(formatLlmPlan(applied), /writes allowed/i);

resetLlmPlanForTests();
console.log("llmPlan.test.ts ok");
