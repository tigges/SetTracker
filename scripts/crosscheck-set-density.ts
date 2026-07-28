/**
 * Audit every set for tracklist density (duration vs logged plays).
 *
 *   npm run crosscheck:set-density
 *
 * Writes data/crosscheck/set-density.json and prints the worst offenders.
 * Exit 0 always (informational) unless CROSSCHECK_DENSITY_STRICT=1 and
 * severe count exceeds CROSSCHECK_DENSITY_MAX_SEVERE (default 0).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  assessSetDensity,
  DENSITY_MIN_DURATION_SEC,
  type DensitySeverity,
} from "../src/lib/setDensity";

const prisma = new PrismaClient();

type Row = {
  slug: string;
  title: string;
  sourceName: string | null;
  type: string;
  durationSec: number;
  playCount: number;
  avgSecPerPlay: number;
  tracksPerHour: number;
  expectedPlays: number;
  coverage: number;
  severity: DensitySeverity;
  reason: string | null;
  primaryDj: string | null;
};

async function main() {
  const sets = await prisma.set.findMany({
    where: { durationSec: { gte: DENSITY_MIN_DURATION_SEC } },
    select: {
      slug: true,
      title: true,
      sourceName: true,
      type: true,
      durationSec: true,
      _count: { select: { plays: true } },
      artists: {
        where: { isPrimary: true },
        take: 1,
        select: { dj: { select: { name: true, slug: true } } },
      },
    },
  });

  const rows: Row[] = sets.map((s) => {
    const playCount = s._count.plays;
    const d = assessSetDensity({
      durationSec: s.durationSec,
      playCount,
    });
    return {
      slug: s.slug,
      title: s.title,
      sourceName: s.sourceName,
      type: s.type,
      durationSec: s.durationSec,
      playCount,
      avgSecPerPlay: Number.isFinite(d.avgSecPerPlay)
        ? Math.round(d.avgSecPerPlay)
        : -1,
      tracksPerHour: Math.round(d.tracksPerHour * 10) / 10,
      expectedPlays: d.expectedPlays,
      coverage: Math.round(d.coverage * 100) / 100,
      severity: d.severity,
      reason: d.reason,
      primaryDj: s.artists[0]?.dj.name ?? null,
    };
  });

  const severe = rows
    .filter((r) => r.severity === "severe")
    .sort((a, b) => b.avgSecPerPlay - a.avgSecPerPlay);
  const thin = rows
    .filter((r) => r.severity === "thin")
    .sort((a, b) => b.avgSecPerPlay - a.avgSecPerPlay);

  const outDir = join(process.cwd(), "data", "crosscheck");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "set-density.json");
  const payload = {
    source: "catalog Set.durationSec vs Played count",
    note: "House/tech-house DJ sets typically log ~8–15 tracks/hour. Avg ≥8m/play or <7/h → thin; ≥10m or <5/h → severe. Not Songkick/Songstats.",
    generatedAt: new Date().toISOString(),
    totals: {
      scanned: rows.length,
      ok: rows.filter((r) => r.severity === "ok").length,
      thin: thin.length,
      severe: severe.length,
    },
    severe: severe.slice(0, 200),
    thin: thin.slice(0, 200),
  };
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `[set-density] scanned=${rows.length} ok=${payload.totals.ok} thin=${thin.length} severe=${severe.length}`,
  );
  console.log(`[set-density] wrote ${outPath}`);
  console.log("\nWorst severe:");
  for (const r of severe.slice(0, 25)) {
    console.log(
      `  ${r.playCount}tr ${(r.durationSec / 60).toFixed(0)}m avg=${(
        r.avgSecPerPlay / 60
      ).toFixed(1)}m ${r.tracksPerHour}/h | ${r.primaryDj ?? "?"} | ${r.title.slice(0, 60)}`,
    );
  }

  if (process.env.CROSSCHECK_DENSITY_STRICT === "1") {
    const max = Number(process.env.CROSSCHECK_DENSITY_MAX_SEVERE ?? 0);
    if (severe.length > max) {
      console.error(
        `[set-density] STRICT fail: severe=${severe.length} > max=${max}`,
      );
      process.exit(1);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
