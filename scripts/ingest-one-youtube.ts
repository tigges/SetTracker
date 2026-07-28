/**
 * Ingest a single curated YOUTUBE_SETS entry by video id (rate-limit friendly).
 * Usage: npx tsx scripts/ingest-one-youtube.ts IG19Jo7NxnQ
 */
import { PrismaClient } from "@prisma/client";
import { runIngest } from "../src/lib/ingest/ingest";
import { createYoutubeAdapter } from "../src/lib/ingest/youtube/adapter";
import { YOUTUBE_SETS } from "../src/lib/ingest/youtube/videos";

async function main() {
  const video = process.argv[2];
  if (!video) {
    console.error("Usage: npx tsx scripts/ingest-one-youtube.ts <videoId>");
    process.exit(1);
  }
  const needle = video.replace(/^.*v=/, "").replace(/&.*/, "");
  const sources = YOUTUBE_SETS.filter((s) => s.video.includes(needle));
  if (!sources.length) {
    console.error(`No YOUTUBE_SETS entry matching ${needle}`);
    process.exit(1);
  }
  process.env.YOUTUBE_CURATED_ONLY = "1";
  process.env.INGEST_SKIP_VERIFY = "1";
  const prisma = new PrismaClient();
  try {
    const adapter = createYoutubeAdapter(sources, [], [], []);
    const result = await runIngest(prisma, [adapter]);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
