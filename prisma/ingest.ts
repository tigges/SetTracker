import { PrismaClient } from "@prisma/client";
import { runIngest } from "../src/lib/ingest/ingest";
import { applyResolutions } from "../src/lib/ingest/resolutions";

const prisma = new PrismaClient();

async function main() {
  console.log("Crawling sources for new sets & DJs...");
  const stats = await runIngest(prisma);
  console.log("Ingest complete:", JSON.stringify(stats, null, 2));

  console.log("Applying community ID resolutions...");
  const resolutions = await applyResolutions(prisma);
  console.log("Resolutions:", JSON.stringify(resolutions, null, 2));

  const totals = {
    djs: await prisma.dj.count(),
    sets: await prisma.set.count(),
    tracks: await prisma.track.count(),
    plays: await prisma.played.count(),
    communityResolved: await prisma.played.count({
      where: { idStatus: "community_resolved" },
    }),
  };
  console.log("DB totals:", totals);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
