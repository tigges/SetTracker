/**
 * List browse-ready "This week" sets with thin/empty tracklists.
 * Usage: npx tsx scripts/audit-homepage-sparse.ts
 */
import { PrismaClient } from "@prisma/client";
import { loadDjMagTop100RankBySlug } from "../src/lib/ingest/enrich/acrcloud";
import { normalizeGenre } from "../src/lib/genre";
import { isBrowseReadySet } from "../src/lib/setBrowse";
import { assessSetDensity } from "../src/lib/setDensity";

const prisma = new PrismaClient();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function main() {
  const since = new Date(Date.now() - WEEK_MS);
  const top100 = loadDjMagTop100RankBySlug();
  const sets = await prisma.set.findMany({
    where: { publishedAt: { gte: since } },
    orderBy: { publishedAt: "desc" },
    include: {
      artists: {
        where: { isPrimary: true },
        take: 1,
        include: { dj: true },
      },
      _count: { select: { plays: true } },
    },
  });

  const rows = [];
  for (const s of sets) {
    const dj = s.artists[0]?.dj;
    if (
      !isBrowseReadySet({
        imageUrl: s.imageUrl,
        primaryDjImageUrl: dj?.imageUrl,
        primaryDjName: dj?.name,
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
    if (density.severity === "ok") continue;
    const slug = dj?.slug ?? "";
    rows.push({
      severity: density.severity,
      plays: s._count.plays,
      host: s.playbackUrl?.includes("soundcloud")
        ? "sc"
        : s.playbackUrl?.includes("youtu")
          ? "yt"
          : s.playbackUrl?.includes("hearthis")
            ? "ht"
            : "?",
      chart: top100.has(slug) ? `#${top100.get(slug)}` : "",
      bass: normalizeGenre(s.genre) === "Bass House" ? "bass" : "",
      artist: dj?.name ?? "?",
      title: s.title.slice(0, 56),
      slug: s.slug,
    });
  }

  rows.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === "severe" ? -1 : 1;
    }
    return a.plays - b.plays;
  });

  console.log(`This-week browse-ready sparse sets: ${rows.length}`);
  for (const r of rows) {
    console.log(
      [
        r.severity.padEnd(6),
        `${r.plays}tr`.padStart(4),
        r.host,
        (r.chart || r.bass || "-").padEnd(5),
        r.artist.slice(0, 18).padEnd(18),
        r.title,
        r.slug,
      ].join(" | "),
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
