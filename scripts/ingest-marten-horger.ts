/**
 * Focused Marten Horger ingest: his SC show + curated YT live sets.
 * Usage: npx tsx scripts/ingest-marten-horger.ts
 */
import { PrismaClient } from "@prisma/client";
import { runIngest } from "../src/lib/ingest/ingest";
import { createSoundCloudAdapter } from "../src/lib/ingest/soundcloud/adapter";
import { SOUNDCLOUD_SHOWS } from "../src/lib/ingest/soundcloud/shows";
import { createYoutubeAdapter } from "../src/lib/ingest/youtube/adapter";
import { YOUTUBE_SETS } from "../src/lib/ingest/youtube/videos";

const prisma = new PrismaClient();

async function main() {
  const horgerShow = SOUNDCLOUD_SHOWS.find((s) => s.permalink === "marten-horger");
  if (!horgerShow) throw new Error("marten-horger show missing");

  const horgerVideos = YOUTUBE_SETS.filter((v) =>
    /marten|h[oø]rger/i.test(v.primaryArtist.name + (v.title || "")),
  );
  console.log(
    `[horger] SC show ok; curated YT sets=${horgerVideos.length}`,
    horgerVideos.map((v) => v.video),
  );

  process.env.SOUNDCLOUD_CURATED_PLAYLISTS = "0";
  process.env.SOUNDCLOUD_PROMOTE_SHOWS = "0";
  process.env.YOUTUBE_CURATED_ONLY = "1";

  const adapters = [
    createSoundCloudAdapter([horgerShow], []),
    createYoutubeAdapter(horgerVideos, [], [], []),
  ];

  const stats = await runIngest(prisma, adapters);
  console.log("ingest", stats);

  const sets = await prisma.set.findMany({
    where: { artists: { some: { dj: { slug: "marten-horger" } } } },
    include: {
      _count: { select: { plays: true } },
      artists: { include: { dj: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  for (const s of sets) {
    const names = s.artists.map((a) => a.dj.name).join(" + ");
    console.log(
      `${s.slug} | plays=${s._count.plays} | ${names} | ${s.title.slice(0, 60)}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
