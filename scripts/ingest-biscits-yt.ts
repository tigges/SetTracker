/**
 * Focused BISCITS + Parookaville curated YT ingest.
 * Usage: npx tsx scripts/ingest-biscits-yt.ts
 *
 * - Curated watches: EDC Vegas 2025 + Marten Horger Parookaville 2026
 * - @Biscits "Live Streams" playlist (long sets only)
 */
import { PrismaClient } from "@prisma/client";
import { runIngest } from "../src/lib/ingest/ingest";
import { createYoutubeAdapter } from "../src/lib/ingest/youtube/adapter";
import { YOUTUBE_PLAYLISTS } from "../src/lib/ingest/youtube/playlists";
import { YOUTUBE_SETS } from "../src/lib/ingest/youtube/videos";

const prisma = new PrismaClient();

const CURATED_IDS = new Set(["EbNRjEFZpDw", "l7Ytbzj7uGo"]);

async function main() {
  const curated = YOUTUBE_SETS.filter((v) =>
    CURATED_IDS.has(
      v.video.replace(/^.*(?:v=|youtu\.be\/)([\w-]{11}).*$/, "$1"),
    ),
  );
  const playlists = YOUTUBE_PLAYLISTS.filter((p) =>
    p.playlist.includes("PLSAUtc6DBR34M6_c_4RlpMSG81OY5lu9p"),
  );

  if (curated.length < 2) {
    throw new Error(
      `expected curated watches EbNRjEFZpDw + l7Ytbzj7uGo, got ${curated.length}`,
    );
  }
  if (!playlists.length) {
    throw new Error("BISCITS Live Streams playlist missing from YOUTUBE_PLAYLISTS");
  }

  console.log(
    `[biscits-yt] curated=${curated.length}`,
    curated.map((v) => v.video),
  );
  console.log(
    `[biscits-yt] playlists=${playlists.length}`,
    playlists.map((p) => p.playlist),
  );

  // Curated-only path, but keep playlists on (Live Streams scan).
  process.env.YOUTUBE_CURATED_ONLY = "1";
  process.env.YOUTUBE_CURATED_PLAYLISTS = "1";

  const adapters = [createYoutubeAdapter(curated, [], [], playlists)];
  const stats = await runIngest(prisma, adapters);
  console.log("ingest", stats);

  const sets = await prisma.set.findMany({
    where: {
      OR: [
        { sourceSlug: { in: ["yt-EbNRjEFZpDw", "yt-l7Ytbzj7uGo"] } },
        { artists: { some: { dj: { slug: "biscits" } } } },
      ],
    },
    include: {
      _count: { select: { plays: true } },
      artists: { include: { dj: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  for (const s of sets) {
    const names = s.artists.map((a) => a.dj.name).join(" + ");
    console.log(
      `${s.sourceSlug} | plays=${s._count.plays} | ${names} | ${s.title.slice(0, 72)}`,
    );
  }
  console.log(`[biscits-yt] matched sets=${sets.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
