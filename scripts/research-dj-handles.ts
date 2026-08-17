/**
 * Claude / Gemini handle research + quality notes.
 * No-op without a Claude or Gemini key.
 *
 *   npm run research:handles
 *   LLM_RESEARCH_APPLY=0 npm run research:handles   # report only
 *   LLM_QUALITY=1 npm run research:handles          # extra model commentary
 *   LLM_RESEARCH_PROVIDER=gemini|claude|both
 *
 * When both keys are present, default is both (Gemini first — Search
 * grounding — then Claude on whoever is still handle-less).
 */
import { PrismaClient } from "@prisma/client";
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
  const quality = await runLlmQualityCheck(prisma);
  const providers = providersToRun();
  if (!providers.length) {
    console.log(
      "[llm-research] skipped (set GEMINI_API_KEY and/or CLAUDE_API_KEY / CLAUDE_AGENT_API / ANTHROPIC_API_KEY)",
    );
  }
  const tag = process.env.LLM_RESEARCH_TAG || undefined;
  const rounds = [];
  for (const provider of providers) {
    const research = await runLlmHandleResearch(prisma, {
      provider,
      reportTag: tag,
    });
    rounds.push({ provider, research });
  }
  const eventRounds = [];
  if (process.env.LLM_RESEARCH_EVENTS !== "0") {
    for (const provider of providers) {
      const research = await runLlmEventHandleResearch(prisma, {
        provider,
        reportTag: tag,
      });
      eventRounds.push({ provider, research });
    }
  }
  console.log("Done:", {
    quality: quality.notes.length,
    rounds,
    eventRounds,
  });
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
