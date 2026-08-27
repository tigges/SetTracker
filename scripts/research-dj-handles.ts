/**
 * Claude / Gemini research jobs (handles, events, identity, home city, videos, tracks).
 * No-op without a Claude or Gemini key.
 *
 *   npm run research:handles
 *   LLM_RESEARCH_JOBS=identity,homecity,videos npm run research:handles
 *   LLM_RESEARCH_JOBS=cues npm run research:handles
 *   LLM_RESEARCH_JOBS=all npm run research:handles
 *   npm run research:handles -- --plan              # print the plan + cost, send nothing
 *   LLM_RESEARCH_APPLY=0 npm run research:handles   # parser clocks write; LLM extras report-only
 *   LLM_RESEARCH_CONFIRM=1 npm run research:handles # local spend (Actions sets this)
 *   LLM_QUALITY=1 npm run research:handles          # extra model commentary
 *   LLM_RESEARCH_PROVIDER=gemini|claude|both
 *
 * When both keys are present, default is both (Gemini first — Search
 * grounding — then Claude on whoever is still handle-less).
 */
import { appendFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { confirmLlmSpend } from "../src/lib/ingest/discovery/llmConfirm";
import { buildLlmPlan } from "../src/lib/ingest/discovery/llmPlan";
import { formatLlmTrackMessage } from "../src/lib/ingest/discovery/llmTrackRecord";
import type { LlmCostJob } from "../src/lib/ingest/discovery/llmCost";
import type { ResearchStats } from "../src/lib/ingest/discovery/llmResearch";
import {
  parseResearchJobs,
  runLlmHomeCityResearch,
  runLlmIdentityResearch,
  runLlmOfficialVideoResearch,
  runLlmTrackIdResearch,
  runLlmCueResearch,
} from "../src/lib/ingest/discovery/llmJobs";
import {
  claudeApiKey,
  detectLlmProvider,
  geminiApiKey,
  runLlmEventHandleResearch,
  runLlmHandleResearch,
  runLlmQualityCheck,
  type LlmProvider,
} from "../src/lib/ingest/discovery/llmResearch";

const prisma = new PrismaClient();

function providersToRun(): LlmProvider[] {
  const want = (process.env.LLM_RESEARCH_PROVIDER || "auto").toLowerCase();
  const gemini = Boolean(geminiApiKey());
  const claude = Boolean(claudeApiKey());
  if (want === "gemini") return gemini ? ["gemini"] : [];
  if (want === "claude") return claude ? ["claude"] : [];
  if (want === "both" || process.env.LLM_RESEARCH_MULTIPLY === "1") {
    return [...(gemini ? (["gemini"] as const) : []), ...(claude ? (["claude"] as const) : [])];
  }
  if (gemini && claude) return ["gemini", "claude"];
  const one = detectLlmProvider();
  return one ? [one] : [];
}

async function main() {
  const planOnly = process.argv.includes("--plan");
  const jobs = parseResearchJobs(process.env.LLM_RESEARCH_JOBS);
  const providers = providersToRun();
  const limit = Math.max(1, Number(process.env.LLM_RESEARCH_LIMIT || 12));
  const plan = buildLlmPlan({
    jobs,
    limit,
    providers: providers.length ? providers : ["gemini"],
    apply: process.env.LLM_RESEARCH_APPLY !== "0",
  });

  // Disclosure always runs first — it is what unlocks complete().
  const spendOk = await confirmLlmSpend(plan);
  if (!providers.length) {
    console.log(
      "[llm-research] no provider key (GEMINI_API_KEY and/or CLAUDE_AGENT_API / ANTHROPIC_API_KEY) — nothing was sent",
    );
  }
  if (planOnly) {
    console.log("[llm-research] plan only — exiting before any model call");
    await prisma.$disconnect();
    return;
  }
  if (!spendOk || !providers.length) {
    process.env.LLM_RESEARCH_APPLY = "0";
    if (jobs.includes("cues")) {
      console.log("[llm-research] running cue parser only (no model calls)");
      const cues = await runLlmCueResearch(prisma, {
        reportTag: process.env.LLM_RESEARCH_TAG || undefined,
      });
      console.log("Done:", { jobs, cues: { provider: null, research: cues } });
      await prisma.$disconnect();
      return;
    }
    console.log("Done:", {
      jobs,
      skippedModel: true,
      estimate: plan.estimate.summary,
    });
    await prisma.$disconnect();
    return;
  }
  const tag = process.env.LLM_RESEARCH_TAG || undefined;
  const done: Record<string, unknown> = { jobs };

  if (jobs.includes("quality")) {
    const quality = await runLlmQualityCheck(prisma);
    done.quality = quality.notes.length;
  }
  if (jobs.includes("handles")) {
    const rounds = [];
    for (const provider of providers) {
      rounds.push({
        provider,
        research: await runLlmHandleResearch(prisma, { provider, reportTag: tag }),
      });
    }
    done.handles = rounds;
  }
  if (jobs.includes("events") && process.env.LLM_RESEARCH_EVENTS !== "0") {
    const eventRounds = [];
    for (const provider of providers) {
      eventRounds.push({
        provider,
        research: await runLlmEventHandleResearch(prisma, {
          provider,
          reportTag: tag,
        }),
      });
    }
    done.events = eventRounds;
  }
  if (jobs.includes("identity")) {
    const identity = [];
    for (const provider of providers) {
      identity.push({
        provider,
        research: await runLlmIdentityResearch(prisma, { provider, reportTag: tag }),
      });
    }
    done.identity = identity;
  }
  if (jobs.includes("homecity")) {
    const homecity = [];
    for (const provider of providers) {
      homecity.push({
        provider,
        research: await runLlmHomeCityResearch(prisma, { provider, reportTag: tag }),
      });
    }
    done.homecity = homecity;
  }
  if (jobs.includes("tracks")) {
    const tracks = [];
    for (const provider of providers) {
      tracks.push({
        provider,
        research: await runLlmTrackIdResearch(prisma, { provider, reportTag: tag }),
      });
    }
    done.tracks = tracks;
  }
  if (jobs.includes("cues")) {
    // Parser path runs without a key. LLM only keeps clocks already in the text.
    const cues = [];
    if (providers.length) {
      for (const provider of providers) {
        cues.push({
          provider,
          research: await runLlmCueResearch(prisma, { provider, reportTag: tag }),
        });
      }
    } else {
      cues.push({
        provider: null,
        research: await runLlmCueResearch(prisma, { reportTag: tag }),
      });
    }
    done.cues = cues;
  }
  if (jobs.includes("videos")) {
    const videos = [];
    for (const provider of providers) {
      videos.push({
        provider,
        research: await runLlmOfficialVideoResearch({ provider, reportTag: tag }),
      });
    }
    done.videos = videos;
  }

  const summaries: string[] = [];
  const asStats = (value: unknown): ResearchStats | null => {
    if (!value || typeof value !== "object") return null;
    const s = value as { research?: ResearchStats } | ResearchStats;
    if ("research" in s && s.research) return s.research;
    if ("scanned" in s) return s as ResearchStats;
    return null;
  };
  for (const [job, value] of Object.entries(done)) {
    if (job === "jobs") continue;
    const rounds = Array.isArray(value) ? value : [value];
    for (const round of rounds) {
      const stats = asStats(round);
      if (!stats) continue;
      summaries.push(
        formatLlmTrackMessage(job as LlmCostJob, {
          tracked: stats.scanned,
          found: stats.found,
          partial: stats.partial,
          missed: stats.missed,
        }),
      );
    }
  }
  if (summaries.length) {
    console.log("[llm-research] results");
    for (const line of summaries) console.log(`  ${line}`);
    const path = process.env.GITHUB_STEP_SUMMARY;
    if (path) {
      try {
        appendFileSync(
          path,
          ["", "### LLM research results", "", ...summaries.map((l) => `- ${l}`), ""].join(
            "\n",
          ),
        );
      } catch {
        /* summary is optional */
      }
    }
  }
  console.log("Done:", done);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
