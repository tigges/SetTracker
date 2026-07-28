/**
 * One-shot / CI: rewrite Set + Track genres through the canonical allowlist
 * and fill any remaining nulls (set←DJ siblings, track←set, else House).
 * Usage: npm run normalize-genres
 */
import { PrismaClient } from "@prisma/client";
import { fillMissingGenres, rewriteStoredGenres } from "../src/lib/genre";

const prisma = new PrismaClient();

async function main() {
  const rewritten = await rewriteStoredGenres(prisma);
  const filled = await fillMissingGenres(prisma);
  console.log(
    `[normalize-genres] rewritten sets=${rewritten.sets} tracks=${rewritten.tracks}; filled sets=${filled.sets} tracks=${filled.tracks}`,
  );

  const setNull = await prisma.set.count({
    where: { OR: [{ genre: null }, { genre: "" }] },
  });
  const trackNull = await prisma.track.count({
    where: { OR: [{ genre: null }, { genre: "" }] },
  });
  if (setNull || trackNull) {
    throw new Error(
      `[normalize-genres] still missing genre: sets=${setNull} tracks=${trackNull}`,
    );
  }
  console.log("[normalize-genres] all sets and tracks have a genre");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
