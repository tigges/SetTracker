/**
 * Offline preview of severity-ranked ACR candidates from density JSON
 * (SC/hearthis first, then YT). Does not call ACRCloud.
 * Usage: npx tsx scripts/preview-acr-queue.ts
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type Row = {
  slug?: string;
  title?: string;
  primaryDj?: string;
  severity?: string;
  playCount?: number;
};

function hostRank(slug: string): number {
  if (slug.startsWith("sc-")) return 0;
  if (slug.startsWith("ht-") || slug.includes("hearthis")) return 1;
  if (slug.startsWith("yt-")) return 3;
  return 2;
}

function main() {
  const cwd = process.cwd();
  const paths = [
    join(cwd, "data/crosscheck/set-density.json"),
    join(cwd, "data/crosscheck/set-density-live.json"),
  ];
  let rows: Row[] = [];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const d = JSON.parse(readFileSync(p, "utf8")) as {
      severeEmpty?: Row[];
      severeSparse?: Row[];
      thin?: Row[];
    };
    rows = [
      ...(d.severeEmpty ?? []),
      ...(d.severeSparse ?? []),
      ...(d.thin ?? []),
    ];
    break;
  }

  const sevRank = (s?: string) =>
    s === "severe" ? 0 : s === "thin" ? 1 : 2;

  const ranked = rows
    .filter((r) => r.slug)
    .sort((a, b) => {
      const hs = hostRank(a.slug!) - hostRank(b.slug!);
      if (hs !== 0) return hs;
      return sevRank(a.severity) - sevRank(b.severity);
    })
    .slice(0, Number(process.env.ACR_QUEUE_PREVIEW_LIMIT || 40));

  const outDir = join(cwd, "data/crosscheck");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "acr-queue-preview.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: "Severity + host-ranked preview for ACRCloud (SC/hearthis first). Live enrich still uses Prisma.",
        limit: ranked.length,
        queue: ranked.map((r, i) => ({
          rank: i + 1,
          slug: r.slug,
          title: r.title,
          primaryDj: r.primaryDj,
          severity: r.severity,
          playCount: r.playCount,
          hostRank: hostRank(r.slug!),
        })),
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`[acr-queue] preview ${ranked.length} → ${outPath}`);
  for (const r of ranked.slice(0, 12)) {
    console.log(`  ${r.slug}  ${r.severity}  ${r.primaryDj ?? ""}`);
  }
}

main();
