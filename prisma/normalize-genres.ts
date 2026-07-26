/**
 * One-shot / CI: rewrite Set + Track genres through the canonical allowlist.
 * Usage: npm run normalize-genres
 */
import { PrismaClient } from "@prisma/client";
import { rewriteStoredGenres } from "../src/lib/genre";

const prisma = new PrismaClient();

async function main() {
  const result = await rewriteStoredGenres(prisma);
  console.log(
    `[normalize-genres] updated sets=${result.sets} tracks=${result.tracks}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
