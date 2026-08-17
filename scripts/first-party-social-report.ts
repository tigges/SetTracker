/**
 * Snapshot first-party social coverage after YT/SC/Wikidata/site scans.
 *
 *   npx tsx scripts/first-party-social-report.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { DJ_SOCIAL_PINS } from "../src/lib/ingest/djSocialPins.data";
import { hintForName } from "../src/lib/ingest/discovery/knownHandles";
import { djMayClaimSocialUrl } from "../src/lib/ingest/eventSocials";

const prisma = new PrismaClient();

function anySocial(d: {
  instagram: string | null;
  soundcloud: string | null;
  youtube: string | null;
  twitter: string | null;
  website: string | null;
}): boolean {
  return Boolean(
    d.instagram || d.soundcloud || d.youtube || d.twitter || d.website,
  );
}

async function main() {
  const djs = await prisma.dj.findMany({
    select: {
      slug: true,
      name: true,
      instagram: true,
      soundcloud: true,
      youtube: true,
      twitter: true,
      website: true,
      _count: { select: { sets: true } },
    },
  });
  const events = await prisma.event.findMany({
    select: {
      slug: true,
      name: true,
      instagram: true,
      website: true,
      soundcloud: true,
      twitter: true,
    },
  });
  const withSets = djs.filter((d) => d._count.sets > 0);
  const pinned = new Set(DJ_SOCIAL_PINS.map((p) => p.slug));

  const mismatches: Array<{
    slug: string;
    name: string;
    field: string;
    url: string;
  }> = [];
  const persistable: Array<{
    slug: string;
    name: string;
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    website?: string;
  }> = [];

  for (const d of djs) {
    const fields = [
      ["instagram", d.instagram],
      ["soundcloud", d.soundcloud],
      ["youtube", d.youtube],
      ["twitter", d.twitter],
    ] as const;
    let claimedOk = false;
    for (const [field, url] of fields) {
      if (!url) continue;
      if (!djMayClaimSocialUrl(d.name, url)) {
        if (!pinned.has(d.slug)) {
          mismatches.push({ slug: d.slug, name: d.name, field, url });
        }
      } else {
        claimedOk = true;
      }
    }
    const hint = hintForName(d.name);
    if (claimedOk && !hint && !pinned.has(d.slug)) {
      persistable.push({
        slug: d.slug,
        name: d.name,
        instagram: d.instagram ?? undefined,
        soundcloud: d.soundcloud ?? undefined,
        youtube: d.youtube ?? undefined,
        website: d.website ?? undefined,
      });
    }
  }

  const stats = {
    generatedAt: new Date().toISOString(),
    djs: djs.length,
    anySocial: djs.filter(anySocial).length,
    djsIg: djs.filter((d) => d.instagram).length,
    djsSc: djs.filter((d) => d.soundcloud).length,
    djsYt: djs.filter((d) => d.youtube).length,
    djsWeb: djs.filter((d) => d.website).length,
    noSocialWithSets: withSets.filter((d) => !anySocial(d)).length,
    ytNoIg: djs.filter((d) => d.youtube && !d.instagram).length,
    scNoIg: djs.filter((d) => d.soundcloud && !d.instagram).length,
    webNoIg: djs.filter((d) => d.website && !d.instagram).length,
    ytNoSc: djs.filter((d) => d.youtube && !d.soundcloud).length,
    events: events.length,
    eventsIg: events.filter((e) => e.instagram).length,
    eventsMissingIg: events.filter((e) => !e.instagram).length,
    nameMismatchesUnpinned: mismatches.length,
    persistableNameMatched: persistable.length,
  };

  const report = {
    ...stats,
    note: "First-party scrape (YT About, SC bios, official sites, Wikidata). Models not used. Official-site fills now require a name-matched handle (AFRO cannot claim Afrojack). 31 catalog acts persisted to knownHandles. Pins overwrite collisions. Remaining IG fills live in the local DB until the next catalog-deep scan-urls.",
    sampleMismatches: mismatches.slice(0, 40),
    samplePersistable: persistable.slice(0, 40),
  };

  const dir = join(process.cwd(), "data/crosscheck");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "first-party-socials.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
