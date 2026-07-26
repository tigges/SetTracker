import { PrismaClient } from "@prisma/client";
import { verifyStoredSocialUrls } from "../src/lib/ingest/verifyUrls";

const prisma = new PrismaClient();

verifyStoredSocialUrls(prisma)
  .then(async (stats) => {
    console.log("Done:", stats);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
