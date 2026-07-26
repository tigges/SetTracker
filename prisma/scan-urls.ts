import { PrismaClient } from "@prisma/client";
import { scanEntityUrls } from "../src/lib/ingest/scanEntityUrls";

const prisma = new PrismaClient();

scanEntityUrls(prisma)
  .then(async (stats) => {
    console.log("Done:", stats);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
