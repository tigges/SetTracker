/**
 * Focused Gentlemen's Groove ingest (hearthis artist mixes).
 * Usage: npx tsx scripts/ingest-gentlemens-groove.ts
 */
import { PrismaClient } from "@prisma/client";
import { applyDjSocialPins } from "../src/lib/ingest/djSocialPins";
import { createHearthisAdapter } from "../src/lib/ingest/hearthis/adapter";
import { HEARTHIS_ARTISTS } from "../src/lib/ingest/hearthis/artists";
import { runIngest } from "../src/lib/ingest/ingest";
import { applyCuratedDjImages } from "../src/lib/thumbs/djImages";

const prisma = new PrismaClient();

async function main() {
  const artist = HEARTHIS_ARTISTS.find(
    (a) => a.permalink === "gentlemensgroove-oz",
  );
  if (!artist) throw new Error("Gentlemen's Groove hearthis artist missing");

  await applyDjSocialPins(prisma);

  // Skip category browse — only the curated brand account.
  process.env.INGEST_SKIP_VERIFY = "1";
  const stats = await runIngest(prisma, [
    createHearthisAdapter([], [artist]),
  ]);
  console.log("ingest", stats);

  const curated = await applyCuratedDjImages(prisma);
  console.log("curated images", curated);

  const sets = await prisma.set.findMany({
    where: {
      artists: { some: { dj: { slug: "gentlemens-groove" } } },
    },
    include: {
      _count: { select: { plays: true } },
      artists: { include: { dj: true } },
    },
    orderBy: { publishedAt: "desc" },
  });
  for (const s of sets) {
    const names = s.artists
      .map((a) => (a.isPrimary ? `*${a.dj.name}` : a.dj.name))
      .join(" + ");
    console.log(
      `${s.slug} | plays=${s._count.plays} | ${names} | ${s.title}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
