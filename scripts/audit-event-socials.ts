/**
 * Report Event SC/X/IG that look like artist profiles.
 * Usage: npx tsx scripts/audit-event-socials.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  eventMayClaimSocialUrl,
  loadArtistSocialKeys,
} from "../src/lib/ingest/eventSocials";
import { KNOWN_EVENTS } from "../src/lib/ingest/events";

async function main() {
  const prisma = new PrismaClient();
  const artistKeys = await loadArtistSocialKeys(prisma);
  const events = await prisma.event.findMany({
    select: {
      slug: true,
      name: true,
      soundcloud: true,
      instagram: true,
      twitter: true,
      website: true,
    },
    orderBy: { name: "asc" },
  });
  const dirty: Array<{ slug: string; field: string; url: string }> = [];
  for (const e of events) {
    for (const field of ["soundcloud", "instagram", "twitter"] as const) {
      const url = e[field];
      if (!url) continue;
      const curated = KNOWN_EVENTS[e.slug]?.[field];
      if (curated && curated === url) continue;
      if (!eventMayClaimSocialUrl(e.name, url, artistKeys)) {
        dirty.push({ slug: e.slug, field, url });
      }
    }
  }
  console.log(
    JSON.stringify(
      { checked: events.length, dirty: dirty.length, rows: dirty },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
  if (dirty.length) process.exitCode = 1;
}

main();
