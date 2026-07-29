/**
 * Force-ingest one hearthis.at set by user/track permalink.
 * Usage: npx tsx scripts/force-hearthis-set.ts house-ape/plug-uglies-nov-9-2024
 */
import { PrismaClient } from "@prisma/client";
import { artistsForSet } from "../src/lib/ingest/artists";
import { hashRawSetContent } from "../src/lib/ingest/hash";
import { runIngest } from "../src/lib/ingest/ingest";
import {
  asInt,
  fetchTrackDetail,
} from "../src/lib/ingest/hearthis/client";
import { parseDescriptionTracklist } from "../src/lib/ingest/soundcloud/parseTracklist";
import { slugify, type RawSet, type SourceAdapter } from "../src/lib/ingest/types";
import { hearthisEmbedUrl } from "../src/lib/playback";
import {
  preferredExternalPlaybackFromText,
  resolveSoundCloudTrackUrl,
} from "../src/lib/ingest/hearthis/playback";

const prisma = new PrismaClient();

async function buildRaw(user: string, track: string): Promise<RawSet> {
  const detail = await fetchTrackDetail(user, track);
  const durationSec = Math.max(0, asInt(detail.duration));
  const title = (detail.title || "").trim() || track;
  const plays = parseDescriptionTracklist(
    detail.description,
    durationSec,
    "hearthis",
  );
  const artistName = detail.user?.username?.trim() || user;
  const { primary, collaborators } = artistsForSet(title, {
    name: artistName,
    slug: slugify(artistName),
    accent: "#ff7a45",
  });
  const sourceSlug = `ht-${user}-${slugify(track)}`.slice(0, 120);
  const sourceUrl =
    detail.permalink_url || `https://hearthis.at/${user}/${track}/`;
  const htPlay =
    detail.id != null ? hearthisEmbedUrl(detail.id) : undefined;
  const external = preferredExternalPlaybackFromText(
    detail.description,
    detail.buy_link,
  );
  let playbackUrl = htPlay;
  let type: RawSet["type"] = "mix";
  if (external?.host === "soundcloud") {
    playbackUrl =
      (await resolveSoundCloudTrackUrl(external.playbackUrl)) ?? htPlay;
    if (playbackUrl && /soundcloud\.com\//i.test(playbackUrl)) {
      type = "soundcloud";
    }
  } else if (external?.host === "youtube") {
    playbackUrl = external.playbackUrl;
  }
  const raw: RawSet = {
    sourceSlug,
    title,
    type,
    genre: (detail.genre || "House").trim(),
    primaryArtist: primary,
    collaborators,
    publishedAt: new Date(
      (detail.release_date || detail.created_at || "").replace(" ", "T") + "Z",
    ),
    durationSec,
    sourceName: "hearthis.at",
    sourceUrl,
    playbackUrl,
    cover: "#ff7a45",
    plays,
  };
  if (Number.isNaN(raw.publishedAt.getTime())) raw.publishedAt = new Date();
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

async function main() {
  const arg = process.argv[2] || process.env.HEARTHIS_FORCE;
  if (!arg || !arg.includes("/")) {
    throw new Error("Usage: npx tsx scripts/force-hearthis-set.ts user/track");
  }
  const [user, track] = arg.split("/").map((s) => s.trim());
  if (!user || !track) throw new Error("Need user/track");

  const raw = await buildRaw(user, track);
  console.log(`[force] ${raw.sourceSlug} plays=${raw.plays.length}`);

  const adapter: SourceAdapter = {
    id: "hearthis-force",
    label: `hearthis.at (${user}/${track})`,
    async fetchRecent() {
      return [raw];
    },
  };

  const stats = await runIngest(prisma, [adapter]);
  console.log("ingest", stats);

  const set = await prisma.set.findUnique({
    where: { slug: raw.sourceSlug },
    include: {
      plays: {
        orderBy: { position: "asc" },
        include: { track: true },
      },
    },
  });
  console.log({
    slug: set?.slug,
    plays: set?.plays.length,
    first: set?.plays[0]
      ? `${set.plays[0].timestamp}s ${set.plays[0].track?.artistName} - ${set.plays[0].track?.title}`
      : null,
    mid: set?.plays[7]
      ? `${set.plays[7].timestamp}s ${set.plays[7].track?.artistName} - ${set.plays[7].track?.title}`
      : null,
    last: set?.plays.length
      ? `${set.plays[set.plays.length - 1]!.timestamp}s ${set.plays[set.plays.length - 1]!.track?.artistName} - ${set.plays[set.plays.length - 1]!.track?.title}`
      : null,
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
