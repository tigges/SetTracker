/**
 * Resolve ISRCs / Beatport IDs from held 1001 seeds, then high-play
 * catalog tracks missing ISRC.
 *
 *   npm run research:track-ids
 *   TRACK_ID_LIMIT=20 npm run research:track-ids
 *   TRACK_ID_HELD_LIMIT=8 npm run research:track-ids   # held rows before catalog
 *   TRACK_ID_CATALOG=0 npm run research:track-ids      # held seeds only
 *   TRACK_ID_MB=0 npm run research:track-ids      # skip MusicBrainz (on by default)
 *   AUDD=0 npm run research:track-ids             # skip AudD findLyrics
 *   SET79=0 npm run research:track-ids            # skip Set79 sitemap hints
 *   TRACK_ID_APPLY=1 npm run research:track-ids   # fill-null Track.isrc / beatportUrl
 *   TRACKRADAR=0 npm run research:track-ids       # skip TrackRadar
 *   TRACKRADAR_ANALYZE=1 npm run research:track-ids  # analyze fan YT (quota; never Relive)
 *   AUDD_ANALYZE=1                                # AudD recognize (needs AUDD_API_TOKEN)
 *
 * Fan Relives in FINGERPRINT_ONLY_WATCH stay Identify-only.
 * AudioScout / MusicMate / TrackId are never fetched.
 */
import { PrismaClient } from "@prisma/client";
import { identifyHeldSeeds } from "../src/lib/ingest/identify/trackIds";
import { fingerprintIdProbes } from "../src/lib/ingest/identify/fingerprintWatch";

const prisma = new PrismaClient();

async function main() {
  const apply = process.env.TRACK_ID_APPLY === "1";
  const report = await identifyHeldSeeds({
    apply,
    prisma,
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
        trackradarMode: report.trackradarMode,
        trackradar: report.hits.filter((h) => h.platforms).length,
        musicbrainz: report.hits.filter((h) => h.mbid).length,
        audd: report.hits.filter((h) => h.source === "audd" || h.source === "both").length,
        beatport: report.hits.filter((h) => h.beatportUrl).length,
        set79Hints: report.set79Hints.map((h) => ({
          seed: h.seed,
          urls: h.urls.length,
        })),
        trackradarAnalyzes: report.trackradarAnalyzes.map((a) => ({
          sourceUrl: a.sourceUrl,
          tracks: a.tracks.length,
          via: a.via,
        })),
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
