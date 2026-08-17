/**
 * Resolve ISRCs / Beatport IDs from held 1001 seeds (Deezer, optional MusicBrainz).
 *
 *   npm run research:track-ids
 *   TRACK_ID_LIMIT=20 npm run research:track-ids
 *   TRACK_ID_MB=1 npm run research:track-ids
 *   TRACK_ID_APPLY=1 npm run research:track-ids   # fill-null Track.isrc / beatportUrl
 *
 * Fan Relives in FINGERPRINT_ONLY_WATCH stay Identify-only.
 */
import { PrismaClient } from "@prisma/client";
import { identifyHeldSeeds } from "../src/lib/ingest/identify/trackIds";
import { fingerprintIdProbes } from "../src/lib/ingest/identify/fingerprintWatch";

const prisma = new PrismaClient();

async function main() {
  const apply = process.env.TRACK_ID_APPLY === "1";
  const report = await identifyHeldSeeds({
    apply,
    prisma: apply ? prisma : undefined,
  });
  const probes = fingerprintIdProbes();
  console.log(
    JSON.stringify(
      {
        scanned: report.scanned,
        hits: report.hits.length,
        misses: report.misses.length,
        applied: report.applied,
        isrcs: report.hits.filter((h) => h.isrc).length,
        idProbes: probes.map((p) => ({
          seed: p.seed,
          videoId: p.videoId,
          offsetSec: p.offsetSec,
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
