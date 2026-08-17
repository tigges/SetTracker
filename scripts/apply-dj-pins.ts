import { PrismaClient } from "@prisma/client";
import { applyDjSocialPins } from "../src/lib/ingest/djSocialPins";

const prisma = new PrismaClient();
applyDjSocialPins(prisma)
  .then((n) => {
    console.log(JSON.stringify({ pinned: n }));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
