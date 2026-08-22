/**
 * Dump catalog tracks for Claude / operator ID work.
 *
 *   npm run export:tracks
 *   npm run export:tracks -- --public   # also write public/exports/ (Pages)
 *
 * Missing catalog → warn and exit 0 (same as write-search-index).
 * Never invents ISRCs — read-only dump.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  CLAUDE_TRACK_ID_PROMPT,
  tracksNeedId,
  tracksToClaudeJsonl,
  tracksToCsv,
  type ExportTrackRow,
} from "../src/lib/exportTracks";

const prisma = new PrismaClient();
const writePublic = process.argv.includes("--public");

async function loadRows(): Promise<ExportTrackRow[]> {
  const tracks = await prisma.track.findMany({
    select: {
      slug: true,
      title: true,
      artistName: true,
      mixName: true,
      remixerName: true,
      genre: true,
      isrc: true,
      beatportUrl: true,
      spotifyUrl: true,
      _count: { select: { plays: true } },
    },
  });
  return tracks.map((t) => ({
    slug: t.slug,
    artist: t.artistName,
    title: t.title,
    mix: t.mixName,
    remixer: t.remixerName,
    genre: t.genre,
    plays: t._count.plays,
    isrc: t.isrc,
    beatportUrl: t.beatportUrl,
    spotifyUrl: t.spotifyUrl,
  }));
}

async function writeDir(dir: string, rows: ExportTrackRow[]): Promise<void> {
  const needId = tracksNeedId(rows);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "tracks.csv"), tracksToCsv(rows));
  await writeFile(path.join(dir, "tracks-need-id.csv"), tracksToCsv(needId));
  await writeFile(
    path.join(dir, "tracks-need-id.jsonl"),
    tracksToClaudeJsonl(rows),
  );
  await writeFile(path.join(dir, "claude-track-id-prompt.md"), CLAUDE_TRACK_ID_PROMPT);
  console.log(
    `export:tracks ${rows.length} tracks · ${needId.length} need ISRC → ${dir}`,
  );
}

async function main() {
  let rows: ExportTrackRow[] = [];
  try {
    rows = await loadRows();
  } catch (err) {
    console.warn(
      "export:tracks: catalog unavailable —",
      err instanceof Error ? err.message : err,
    );
    return;
  }
  await writeDir(path.join(process.cwd(), "data/track-id-export"), rows);
  if (writePublic) {
    await writeDir(path.join(process.cwd(), "public/exports"), rows);
  }
}

main()
  .catch((err) => {
    console.warn("export:tracks failed:", err);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
