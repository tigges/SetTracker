/**
 * Hearthis-only ingest. Optionally force one permalink via HEARTHIS_FORCE=user/track.
 * Usage:
 *   HEARTHIS_MAX_SETS=25 npx tsx scripts/ingest-hearthis-only.ts
 *   HEARTHIS_FORCE=sunday-moods/smmcz260726 npx tsx scripts/ingest-hearthis-only.ts
 */
import { PrismaClient } from "@prisma/client";
import { runIngest } from "../src/lib/ingest/ingest";
import {
  hearthisAdapter,
  trackToRawSet,
} from "../src/lib/ingest/hearthis/adapter";
import { HEARTHIS_HOUSE_CATEGORIES } from "../src/lib/ingest/hearthis/categories";
import { fetchTrackDetail } from "../src/lib/ingest/hearthis/client";
import { slugify, type SourceAdapter } from "../src/lib/ingest/types";

const prisma = new PrismaClient();

async function forceAdapter(user: string, track: string): Promise<SourceAdapter> {
  return {
    id: "hearthis-force",
    label: `hearthis.at (${user}/${track})`,
    async fetchRecent() {
      const detail = await fetchTrackDetail(user, track);
      const category =
        HEARTHIS_HOUSE_CATEGORIES.find((c) =>
          (detail.genre || "")
            .toLowerCase()
            .includes(c.genre.toLowerCase().split(" ")[0]!),
        ) ?? HEARTHIS_HOUSE_CATEGORIES[0]!;
      const raw = await trackToRawSet(detail, category);
      return raw ? [raw] : [];
    },
  };
}

async function main() {
  const force = process.env.HEARTHIS_FORCE?.trim();
  let adapters = [hearthisAdapter];
  if (force) {
    const [user, track] = force.split("/").map((s) => s.trim());
    if (!user || !track) {
      throw new Error("HEARTHIS_FORCE must be user/track");
    }
    adapters = [await forceAdapter(user, track)];
  }

  const stats = await runIngest(prisma, adapters);
  console.log("hearthis ingest", stats);

  const slug = force
    ? `ht-${force.split("/")[0]}-${slugify(force.split("/")[1] || "")}`.slice(
        0,
        120,
      )
    : "ht-sunday-moods-smmcz260726";

  const set = await prisma.set.findUnique({
    where: { slug },
    include: {
      plays: {
        orderBy: { timestamp: "asc" },
        include: { track: true, idTrack: true },
      },
    },
  });

  if (!set) {
    console.warn(`${slug} not found after ingest`);
    return;
  }

  console.log({
    slug: set.slug,
    title: set.title,
    plays: set.plays.length,
    first: set.plays[0]
      ? `${set.plays[0].timestamp}s ${set.plays[0].track?.artistName} - ${set.plays[0].track?.title}`
      : null,
    sample: set.plays.slice(0, 8).map((p) => ({
      t: p.timestamp,
      prov: p.provenance,
      label: p.track
        ? `${p.track.artistName} - ${p.track.title}`
        : (p.idTrack?.label ?? p.rawText),
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
