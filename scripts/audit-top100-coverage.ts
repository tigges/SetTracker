/**
 * Audit DJ Mag Top 100 coverage: sets, identified tracks, SC/YT handles.
 * Usage: npx tsx scripts/audit-top100-coverage.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const ALIASES: Record<string, string> = {
  "dimitri-vegas-mike": "dimitri-vegas-like-mike",
  "martinez-brothers": "the-martinez-brothers",
  chainsmokers: "the-chainsmokers",
  ww: "w-w",
};

type SeedDj = { rank: number; slug: string; name: string };

function ytOk(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (/youtube\.com\/@https\b/i.test(url)) return false;
  return true;
}

async function main() {
  const seedPath = join(
    process.cwd(),
    "data",
    "artist-seeds",
    "djmag-top100-djs-2025.json",
  );
  const seed = JSON.parse(readFileSync(seedPath, "utf8")) as {
    djs: SeedDj[];
  };
  const prisma = new PrismaClient();
  const rows = [];

  for (const d of seed.djs) {
    const slug = ALIASES[d.slug] ?? d.slug;
    const dj = await prisma.dj.findUnique({
      where: { slug },
      select: {
        id: true,
        soundcloud: true,
        youtube: true,
        _count: { select: { sets: true } },
      },
    });
    let sets = 0;
    let tracks = 0;
    if (dj) {
      sets = await prisma.setArtist.count({ where: { djId: dj.id } });
      const plays = await prisma.played.findMany({
        where: {
          set: { artists: { some: { djId: dj.id } } },
          trackId: { not: null },
          idStatus: { in: ["identified", "community_resolved"] },
        },
        select: { trackId: true },
        distinct: ["trackId"],
      });
      tracks = plays.length;
    }
    const sc = dj?.soundcloud ?? null;
    const yt = dj?.youtube ?? null;
    rows.push({
      rank: d.rank,
      name: d.name,
      slug,
      sets,
      tracks,
      soundcloud: sc,
      youtube: yt,
      missingSc: !sc,
      missingYt: !ytOk(yt),
      missingSet: sets < 1,
      missingTracks: tracks < 1,
    });
  }

  await prisma.$disconnect();

  const withSet = rows.filter((r) => !r.missingSet).length;
  const withTracks = rows.filter((r) => !r.missingTracks).length;
  const top20Gaps = rows
    .filter((r) => r.rank <= 20 && (r.missingSc || r.missingYt))
    .map((r) => ({
      rank: r.rank,
      name: r.name,
      missing: [
        ...(r.missingSc ? ["SoundCloud"] : []),
        ...(r.missingYt ? ["YouTube"] : []),
      ],
      soundcloud: r.soundcloud,
      youtube: r.youtube,
    }));

  const missingSets = rows
    .filter((r) => r.missingSet)
    .map((r) => `#${r.rank} ${r.name}`);

  const out = {
    updatedAt: new Date().toISOString(),
    summary: {
      total: rows.length,
      withSet,
      withTracks,
      missingSet: rows.length - withSet,
      missingTracks: rows.length - withTracks,
    },
    top20MissingHandles: top20Gaps,
    missingSets,
    rows,
  };

  const outPath = join(
    process.cwd(),
    "data",
    "crosscheck",
    "top100-coverage.json",
  );
  writeFileSync(outPath, JSON.stringify(out, null, 2));

  console.log("Top 100 coverage");
  console.log(JSON.stringify(out.summary, null, 2));
  console.log("\nTop 20 missing SC/YT:");
  for (const g of top20Gaps) {
    console.log(`#${g.rank} ${g.name}: ${g.missing.join(", ")}`);
  }
  console.log(`\nMissing sets (${missingSets.length}):`);
  console.log(missingSets.slice(0, 30).join("\n"));
  if (missingSets.length > 30) console.log(`… +${missingSets.length - 30} more`);
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
