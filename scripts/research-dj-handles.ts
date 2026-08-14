/**
 * Claude / Gemini handle research + quality notes.
 * No-op without CLAUDE_AGENT_API / ANTHROPIC_API_KEY / GEMINI_API_KEY.
 *
 *   npm run research:handles
 *   LLM_RESEARCH_APPLY=0 npm run research:handles   # report only
 *   LLM_QUALITY=1 npm run research:handles          # extra model commentary
 */
import { PrismaClient } from "@prisma/client";
import {
  runLlmHandleResearch,
  runLlmQualityCheck,
} from "../src/lib/ingest/discovery/llmResearch";

const prisma = new PrismaClient();

async function main() {
  const quality = await runLlmQualityCheck(prisma);
  const research = await runLlmHandleResearch(prisma);
  console.log("Done:", { quality: quality.notes.length, research });
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
