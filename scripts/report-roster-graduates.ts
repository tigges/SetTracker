/**
 * Summarize roster graduates + promoted candidates ready to graduate.
 * Usage: npx tsx scripts/report-roster-graduates.ts
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  name: string;
  slug: string;
  score: number;
  status: string;
  youtubeHandle?: string | null;
  soundcloudPermalink?: string | null;
};

function main() {
  const cwd = process.cwd();
  const gradPath = join(cwd, "data/roster-graduates.json");
  const candPath = join(cwd, "data/artist-candidates.json");
  const minScore = Number(process.env.DISCOVERY_GRADUATE_SCORE || 40);

  const graduates = existsSync(gradPath)
    ? (JSON.parse(readFileSync(gradPath, "utf8")) as {
        artists?: { name: string }[];
        updatedAt?: string;
      })
    : { artists: [] };

  const candidatesFile = existsSync(candPath)
    ? (JSON.parse(readFileSync(candPath, "utf8")) as {
        candidates?: Candidate[];
      })
    : { candidates: [] };

  const ready = (candidatesFile.candidates ?? [])
    .filter(
      (c) =>
        c.status === "promoted" &&
        c.score >= minScore &&
        (c.youtubeHandle || c.soundcloudPermalink),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  const report = {
    generatedAt: new Date().toISOString(),
    graduatesCount: graduates.artists?.length ?? 0,
    graduatesUpdatedAt: graduates.updatedAt ?? null,
    readyToGraduate: ready.map((c) => ({
      name: c.name,
      slug: c.slug,
      score: c.score,
      youtube: c.youtubeHandle ?? null,
      soundcloud: c.soundcloudPermalink ?? null,
    })),
    note: "Deep workflow runs npm run graduate-roster into Actions cache. Commit data/roster-graduates.json when graduates should land in git roster.",
  };

  const outDir = join(cwd, "data/crosscheck");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "roster-graduate-report.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

  console.log(
    `[graduate-report] graduates=${report.graduatesCount} ready=${report.readyToGraduate.length} → ${outPath}`,
  );
  for (const r of report.readyToGraduate.slice(0, 10)) {
    console.log(`  ${r.score} ${r.name} yt=${r.youtube ?? "-"} sc=${r.soundcloud ?? "-"}`);
  }
}

main();
