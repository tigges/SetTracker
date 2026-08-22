/**
 * Claude / Gemini research jobs (handles, events, identity, home city,
 * videos, tracks, cues). Handle / ID jobs no-op without a Claude or
 * Gemini key. Job `cues` still re-parses first-party text without a key.
 *
 *   npm run research:handles
 *   LLM_RESEARCH_JOBS=cues npm run research:handles
 *   LLM_RESEARCH_JOBS=identity,homecity,videos npm run research:handles
 *   LLM_RESEARCH_JOBS=all npm run research:handles
 *   LLM_RESEARCH_APPLY=0 npm run research:handles   # report only
 *   LLM_QUALITY=1 npm run research:handles          # extra model commentary
 *   LLM_RESEARCH_PROVIDER=gemini|claude|both
 *
 * When both keys are present, default is both (Gemini first — Search
 * grounding — then Claude on whoever is still handle-less).
 */
import { PrismaClient } from "@prisma/client";
import {
  parseResearchJobs,
  runLlmHomeCityResearch,
  runLlmIdentityResearch,
  runLlmOfficialVideoResearch,
  runLlmTrackIdResearch,
} from "../src/lib/ingest/discovery/llmJobs";
import { runLlmCueResearch } from "../src/lib/ingest/discovery/llmCues";
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
  const jobs = parseResearchJobs(process.env.LLM_RESEARCH_JOBS);
  const providers = providersToRun();
  if (!providers.length) {
    console.log(
      "[llm-research] skipped (set GEMINI_API_KEY and/or CLAUDE_API_KEY / CLAUDE_AGENT_API / ANTHROPIC_API_KEY)",
    );
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
    done.cues = await runLlmCueResearch(prisma, {
      provider: providers[0],
      reportTag: tag,
    });
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

  console.log("Done:", done);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
