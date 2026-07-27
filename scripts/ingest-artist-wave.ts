/**
 * Focused ingest for Black Coffee / Chapter & Verse / Walker & Royce /
 * Vintage Culture / Bleu Clair curated YT sets + SC roster shows.
 *
 * Usage: npx tsx scripts/ingest-artist-wave.ts
 */
import { PrismaClient } from "@prisma/client";
import { applyDjSocialPins } from "../src/lib/ingest/djSocialPins";
import { runIngest } from "../src/lib/ingest/ingest";
import { createSoundCloudAdapter } from "../src/lib/ingest/soundcloud/adapter";
import { rosterSoundcloudShows } from "../src/lib/ingest/soundcloud/shows";
import { createYoutubeAdapter } from "../src/lib/ingest/youtube/adapter";
import { YOUTUBE_SETS } from "../src/lib/ingest/youtube/videos";

const prisma = new PrismaClient();

const ARTIST_RE =
  /black\s*coffee|chapter\s*&\s*verse|walker\s*&\s*royce|vintage\s*culture|bleu\s*clair/i;

const SC_PERMALINKS = new Set([
  "realblackcoffee",
  "chapterandverseofficial",
  "walker-and-royce",
  "vintageculturemusic",
  "bleuclair",
]);

const DJ_SLUGS = [
  "black-coffee",
  "chapter-verse",
  "walker-royce",
  "vintage-culture",
  "bleu-clair",
];

async function main() {
  const videos = YOUTUBE_SETS.filter((v) =>
    ARTIST_RE.test(v.primaryArtist.name + " " + (v.title || "")),
  );
  const shows = rosterSoundcloudShows().filter((s) =>
    SC_PERMALINKS.has(s.permalink.toLowerCase()),
  );

  console.log(
    `[artist-wave] curated YT=${videos.length}`,
    videos.map((v) => v.video),
  );
  console.log(
    `[artist-wave] SC shows=${shows.length}`,
    shows.map((s) => s.permalink),
  );

  process.env.SOUNDCLOUD_CURATED_PLAYLISTS = "0";
  process.env.SOUNDCLOUD_PROMOTE_SHOWS = "0";
  process.env.YOUTUBE_CURATED_ONLY = "1";
  process.env.YOUTUBE_CURATED_PLAYLISTS = "0";

  const adapters = [
    createSoundCloudAdapter(shows, []),
    createYoutubeAdapter(videos, [], [], []),
  ];
  const stats = await runIngest(prisma, adapters);
  console.log("ingest", stats);

  const pinned = await applyDjSocialPins(prisma);
  console.log(`[artist-wave] social pins applied=${pinned}`);

  const sets = await prisma.set.findMany({
    where: { artists: { some: { dj: { slug: { in: DJ_SLUGS } } } } },
    include: {
      _count: { select: { plays: true } },
      artists: { include: { dj: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  for (const s of sets) {
    const names = s.artists.map((a) => a.dj.name).join(" + ");
    console.log(
      `${s.slug} | plays=${s._count.plays} | ${names} | ${s.title.slice(0, 72)}`,
    );
  }
  console.log(`[artist-wave] matched sets=${sets.length}`);

  for (const slug of DJ_SLUGS) {
    const dj = await prisma.dj.findUnique({ where: { slug } });
    console.log(
      `dj ${slug}: ig=${dj?.instagram ?? "—"} x=${dj?.twitter ?? "—"} web=${dj?.website ?? "—"}`,
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
