/**
 * Repair Insomniac mix rows that ingested with:
 * - site-chrome YouTube trailers as playbackUrl
 * - publishedAt = crawl time (falsely "new this week")
 *
 * Re-reads the Insomniac music page and applies Mixcloud/SC + real dates.
 */

import type { PrismaClient } from "@prisma/client";
import { hostUrlFillNull } from "../../playback";
import {
  fetchInsomniacHtml,
  mixcloudUrlFromHtml,
  publishedAtFromInsomniacHtml,
  soundcloudTrackUrlFromHtml,
  youtubeWatchFromHtml,
} from "./client";

/** Known Insomniac promo trailer mistaken for mix audio. */
const CHROME_TRAILER_IDS = new Set(["Y-9zm3QnW3I"]);

export type RepairMixPlaybackStats = {
  scanned: number;
  playbackFixed: number;
  dateFixed: number;
  skipped: number;
};

function isChromeTrailerPlayback(url: string | null | undefined): boolean {
  if (!url) return false;
  for (const id of CHROME_TRAILER_IDS) {
    if (url.includes(id)) return true;
  }
  // Any YouTube on an insm-mix row is suspect if Mixcloud/SC exists on page —
  // caller re-extracts; here flag classic watch/embed URLs for recheck.
  return /youtu\.be\/|youtube\.com\//i.test(url);
}

function yearFromTitle(title: string): number | null {
  const y = title.match(/\b(20\d{2})\b/)?.[1];
  if (!y) return null;
  const n = Number(y);
  return n >= 2005 && n <= new Date().getUTCFullYear() + 1 ? n : null;
}

function needsDateRepair(publishedAt: Date, title: string, createdAt: Date): boolean {
  const titleYear = yearFromTitle(title);
  if (titleYear != null && publishedAt.getUTCFullYear() - titleYear >= 2) {
    return true;
  }
  // publishedAt ≈ createdAt within 10 minutes → likely ingest-time fallback.
  return Math.abs(publishedAt.getTime() - createdAt.getTime()) < 10 * 60 * 1000;
}

function pickPlayback(html: string): string | null {
  return (
    mixcloudUrlFromHtml(html) ||
    soundcloudTrackUrlFromHtml(html) ||
    youtubeWatchFromHtml(html)
  );
}

export async function repairInsomniacMixPlayback(
  prisma: PrismaClient,
): Promise<RepairMixPlaybackStats> {
  const rows = await prisma.set.findMany({
    where: {
      sourceName: "Insomniac",
      sourceUrl: { contains: "insomniac.com/music/" },
      OR: [
        { slug: { startsWith: "insm-mix-" } },
        { playbackUrl: { contains: "Y-9zm3QnW3I" } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      sourceUrl: true,
      playbackUrl: true,
      soundcloudUrl: true,
      youtubeUrl: true,
      mixcloudUrl: true,
      publishedAt: true,
      createdAt: true,
      type: true,
    },
    take: 80,
  });

  let scanned = 0;
  let playbackFixed = 0;
  let dateFixed = 0;
  let skipped = 0;

  for (const row of rows) {
    const fixPlayback = isChromeTrailerPlayback(row.playbackUrl);
    const fixDate = needsDateRepair(row.publishedAt, row.title, row.createdAt);
    if (!fixPlayback && !fixDate) {
      skipped += 1;
      continue;
    }
    if (!row.sourceUrl) {
      skipped += 1;
      continue;
    }

    scanned += 1;
    const html = await fetchInsomniacHtml(row.sourceUrl);
    if (!html) {
      skipped += 1;
      continue;
    }

    const patch: {
      playbackUrl?: string;
      publishedAt?: Date;
      type?: string;
      soundcloudUrl?: string | null;
      youtubeUrl?: string | null;
      mixcloudUrl?: string | null;
    } = {};

    Object.assign(
      patch,
      hostUrlFillNull(
        {
          soundcloudUrl: row.soundcloudUrl,
          youtubeUrl: row.youtubeUrl,
          mixcloudUrl: row.mixcloudUrl,
        },
        {
          mixcloudUrl: mixcloudUrlFromHtml(html),
          soundcloudUrl: soundcloudTrackUrlFromHtml(html),
          youtubeUrl: youtubeWatchFromHtml(html),
        },
      ),
    );

    if (fixPlayback) {
      const next = pickPlayback(html);
      if (next && next !== row.playbackUrl) {
        patch.playbackUrl = next;
        if (/mixcloud\.com/i.test(next)) patch.type = "mix";
        else if (/soundcloud\.com/i.test(next)) patch.type = "soundcloud";
      }
    }

    if (fixDate) {
      const fromPage = publishedAtFromInsomniacHtml(html);
      if (fromPage) patch.publishedAt = fromPage;
      else {
        const y = yearFromTitle(row.title);
        if (y) patch.publishedAt = new Date(Date.UTC(y, 0, 15, 12));
      }
    }

    if (Object.keys(patch).length === 0) {
      skipped += 1;
      continue;
    }

    await prisma.set.update({ where: { id: row.id }, data: patch });
    if (patch.playbackUrl) playbackFixed += 1;
    if (patch.publishedAt) dateFixed += 1;
    console.log(
      `[repair-insomniac-mix] ${row.slug}` +
        (patch.playbackUrl ? ` playback→${patch.playbackUrl}` : "") +
        (patch.publishedAt
          ? ` date→${patch.publishedAt.toISOString().slice(0, 10)}`
          : ""),
    );
  }

  return { scanned, playbackFixed, dateFixed, skipped };
}
