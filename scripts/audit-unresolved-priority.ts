/**
 * List unresolved (pink) IDs prioritized for recent festivals + Top 20 DJs.
 *
 * Usage: npm run audit:unresolved-priority
 * Writes: data/crosscheck/unresolved-priority.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  homepageEnrichBoost,
  isUnresolvedDetectPriority,
  loadDjMagTop100RankBySlug,
  TOP_DJ_UNRESOLVED_PRIORITY,
} from "../src/lib/ingest/enrich/acrcloud";
import { isFestivalSeasonSet } from "../src/lib/ingest/festivalDrops";
import { assessSetDensity } from "../src/lib/setDensity";

const prisma = new PrismaClient();

type PriorityRow = {
  boost: number;
  unresolvedCount: number;
  top100Rank: number | null;
  isFestival: boolean;
  festivalSeason: boolean;
  host: string;
  artist: string;
  title: string;
  slug: string;
  labels: string[];
};

async function main() {
  const top100 = loadDjMagTop100RankBySlug();
  const nowMs = Date.now();

  const sets = await prisma.set.findMany({
    where: {
      plays: { some: { idStatus: "unresolved_id" } },
      durationSec: { gte: 10 * 60 },
    },
    orderBy: { publishedAt: "desc" },
    take: 800,
    select: {
      slug: true,
      title: true,
      type: true,
      genre: true,
      publishedAt: true,
      durationSec: true,
      playbackUrl: true,
      plays: {
        where: { idStatus: "unresolved_id" },
        select: {
          rawText: true,
          idTrack: { select: { label: true, suspectedArtist: true } },
        },
        take: 24,
      },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { slug: true, name: true } } },
      },
      event: { select: { slug: true, kind: true } },
      edition: { select: { endsAt: true } },
      _count: { select: { plays: true } },
    },
  });

  const rows: PriorityRow[] = [];
  for (const s of sets) {
    const unresolvedCount = s.plays.length;
    if (unresolvedCount < 1) continue;
    const dj = s.artists[0]?.dj;
    const top100Rank = dj?.slug ? (top100.get(dj.slug) ?? null) : null;
    const isFestival =
      s.type === "festival" || s.event?.kind === "festival";
    const festivalSeason = isFestivalSeasonSet(
      {
        eventSlug: s.event?.slug,
        editionEndsAt: s.edition?.endsAt ?? null,
        publishedAt: s.publishedAt,
        type: s.type,
      },
      45,
      nowMs,
    );
    if (
      !isUnresolvedDetectPriority({
        unresolvedCount,
        top100Rank,
        isFestival,
        festivalSeason,
      })
    ) {
      continue;
    }

    const density = assessSetDensity({
      durationSec: s.durationSec,
      playCount: s._count.plays,
      type: s.type,
      genre: s.genre,
    });
    const boost = homepageEnrichBoost({
      publishedAt: s.publishedAt,
      primaryDjSlug: dj?.slug,
      genre: s.genre,
      densitySeverity: density.severity,
      top100,
      nowMs,
      unresolvedCount,
      isFestival,
      festivalSeason,
    });

    const host = s.playbackUrl?.includes("soundcloud")
      ? "sc"
      : s.playbackUrl?.includes("youtu")
        ? "yt"
        : s.playbackUrl?.includes("hearthis")
          ? "ht"
          : "?";

    const labels = [
      ...new Set(
        s.plays.map(
          (p) =>
            p.idTrack?.label?.trim() ||
            p.rawText?.trim() ||
            "ID",
        ),
      ),
    ].slice(0, 12);

    rows.push({
      boost,
      unresolvedCount,
      top100Rank,
      isFestival,
      festivalSeason,
      host,
      artist: dj?.name ?? "?",
      title: s.title.slice(0, 72),
      slug: s.slug,
      labels,
    });
  }

  rows.sort(
    (a, b) =>
      b.boost - a.boost ||
      (a.top100Rank ?? 999) - (b.top100Rank ?? 999) ||
      b.unresolvedCount - a.unresolvedCount,
  );

  const outDir = join(process.cwd(), "data", "crosscheck");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, "unresolved-priority.json");
  await writeFile(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        topDjPriorityMax: TOP_DJ_UNRESOLVED_PRIORITY,
        count: rows.length,
        sets: rows,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `Priority unresolved sets (festival / Top ${TOP_DJ_UNRESOLVED_PRIORITY}): ${rows.length}`,
  );
  for (const r of rows.slice(0, 40)) {
    const chart = r.top100Rank != null ? `#${r.top100Rank}` : "fest";
    console.log(
      [
        `b${r.boost}`,
        `${r.unresolvedCount}pink`.padStart(7),
        r.host,
        chart.padEnd(5),
        r.artist.slice(0, 18).padEnd(18),
        r.title,
        r.slug,
      ].join(" | "),
    );
    if (r.labels.length) {
      console.log(`         IDs: ${r.labels.slice(0, 6).join(" · ")}`);
    }
  }
  console.log(`Wrote ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
