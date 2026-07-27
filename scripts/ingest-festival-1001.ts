/**
 * Focused ingest for July 2026 festival sets with curated 1001TL seeds.
 * Usage: npx tsx scripts/ingest-festival-1001.ts
 */
import { PrismaClient } from "@prisma/client";
import { artistsForSet } from "../src/lib/ingest/artists";
import { inferFestivalEvent } from "../src/lib/ingest/events";
import { hashRawSetContent } from "../src/lib/ingest/hash";
import { runIngest } from "../src/lib/ingest/ingest";
import {
  fetchTrackComments,
  scGet,
  type ScTrack,
} from "../src/lib/ingest/soundcloud/client";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
  parseTimedComments,
} from "../src/lib/ingest/soundcloud/parseTracklist";
import { applyTracklist1001Seed } from "../src/lib/ingest/tracklists1001/seeds";
import {
  slugify,
  type RawSet,
  type SourceAdapter,
} from "../src/lib/ingest/types";
import { createYoutubeAdapter } from "../src/lib/ingest/youtube/adapter";
import { YOUTUBE_SETS } from "../src/lib/ingest/youtube/videos";

const prisma = new PrismaClient();

const SC_URLS = [
  "https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-at",
  "https://soundcloud.com/cloonee/clooneeb2bprospa",
];

const YT_IDS = new Set(["EbNRjEFZpDw", "UE6wjxvMRz0"]);

function durationSecOf(track: ScTrack): number {
  const ms = track.full_duration ?? track.duration ?? 0;
  return Math.max(0, Math.round(ms / 1000));
}

async function resolveTrack(url: string): Promise<ScTrack> {
  const track = await scGet<ScTrack>(`/resolve?url=${encodeURIComponent(url)}`);
  if (!track?.id) throw new Error(`SC resolve failed: ${url}`);
  return track;
}

async function scUrlToRaw(url: string): Promise<RawSet> {
  const track = await resolveTrack(url);
  const durationSec = durationSecOf(track);
  const title = (track.title || "").trim() || url;
  const user = track.user?.permalink || "unknown";
  const permalink = track.permalink || String(track.id);
  const sourceSlug = `sc-${user}-${slugify(permalink)}`.slice(0, 120);
  const sourceUrl = track.permalink_url || url;

  const fromDescription = parseDescriptionTracklist(
    track.description,
    durationSec,
  );
  let fromComments = parseTimedComments([], durationSec);
  if ((track.comment_count ?? 0) > 0 && durationSec >= 15 * 60) {
    try {
      const comments = await fetchTrackComments(track.id, 200);
      fromComments = parseTimedComments(comments, durationSec);
    } catch {
      /* optional */
    }
  }
  const plays = applyTracklist1001Seed(
    sourceSlug,
    mergeTracklistSignals(fromDescription, fromComments),
  );
  const artistName = track.user?.username?.trim() || user;
  const { primary, collaborators } = artistsForSet(title, {
    name: artistName,
    slug: slugify(artistName),
  });
  const festival = inferFestivalEvent(title);
  const raw: RawSet = {
    sourceSlug,
    title,
    type: "festival",
    genre: track.genre?.trim() || "Electronic",
    primaryArtist: primary,
    collaborators,
    eventName: festival?.name,
    eventKind: festival?.kind,
    eventLocation: festival?.location,
    publishedAt: new Date(track.display_date || track.created_at || Date.now()),
    durationSec,
    sourceName: "SoundCloud",
    sourceUrl,
    playbackUrl: sourceUrl,
    cover: "#00f0a0",
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

async function main() {
  const yt = YOUTUBE_SETS.filter((v) => {
    const m = v.video.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const id = m?.[1] ?? v.video.slice(0, 11);
    return YT_IDS.has(id);
  });
  console.log(
    `[festival-1001] YT=${yt.map((v) => v.video).join(", ")} SC=${SC_URLS.length}`,
  );

  const scRaws: RawSet[] = [];
  for (const url of SC_URLS) {
    const raw = await scUrlToRaw(url);
    console.log(
      `[festival-1001] SC ${raw.sourceSlug} plays=${raw.plays.length} 1001tl=${raw.plays.filter((p) => p.provenance === "1001tl").length}`,
    );
    scRaws.push(raw);
  }

  const scAdapter: SourceAdapter = {
    id: "soundcloud-festival-1001",
    label: "SoundCloud (festival 1001)",
    async fetchRecent() {
      return scRaws;
    },
  };

  process.env.YOUTUBE_CURATED_ONLY = "1";
  process.env.SOUNDCLOUD_PROMOTE_SHOWS = "0";
  process.env.SOUNDCLOUD_CURATED_PLAYLISTS = "0";

  const stats = await runIngest(prisma, [
    createYoutubeAdapter(yt, [], [], []),
    scAdapter,
  ]);
  console.log("ingest", stats);

  for (const slug of [
    "yt-EbNRjEFZpDw",
    "yt-UE6wjxvMRz0",
    "sc-charlottedewittemusic-charlotte-de-witte-at",
    "sc-cloonee-clooneeb2bprospa",
  ]) {
    const row = await prisma.set.findUnique({
      where: { slug },
      include: { _count: { select: { plays: true } } },
    });
    console.log(
      row
        ? `${row.slug} | plays=${row._count.plays} | ${row.title}`
        : `${slug} | missing`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
