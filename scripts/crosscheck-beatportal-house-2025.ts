/**
 * Cross-check Beatportal House 2025 top artists / labels / tracks
 * against the local catalog (Dj, Label, Track) + curated rosters.
 *
 * Usage: npx tsx scripts/crosscheck-beatportal-house-2025.ts
 * Exit 1 when any chart label or artist is missing from curated maps.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { CURATED_LABEL_SLUGS, curatedLabelSlug, CURATED_LABELS } from "../src/lib/ingest/curatedLabels";
import { ARTIST_ROSTER } from "../src/lib/ingest/roster";
import { slugify } from "../src/lib/ingest/types";

type ChartFile = {
  source: string;
  artists: string[];
  labels: string[];
  tracks: Array<{ rank: number; title: string; artists: string[] }>;
};

const prisma = new PrismaClient();

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantWords(s: string): string[] {
  return fold(s)
    .split(" ")
    .filter((w) => w.length >= 3 && !["the", "and", "feat", "remix"].includes(w));
}

/** Chart title matches a catalog row (title + artist credits). */
function trackMatch(
  row: { title: string; artistName: string },
  chartTitle: string,
  chartArtists: string[],
): boolean {
  const cat = fold(row.title);
  const chart = fold(chartTitle);
  if (cat === chart) return artistOverlap(row.artistName, chartArtists);
  // Allow catalog mix suffixes: "space pump (space jam) (extended mix)"
  if (cat.startsWith(`${chart} `) || cat.startsWith(`${chart}(`)) {
    return artistOverlap(row.artistName, chartArtists);
  }
  const words = significantWords(chartTitle);
  if (words.length < 2) return false;
  const phrase = words.join(" ");
  if (!new RegExp(`(?:^| )${phrase}(?:$| )`).test(cat)) return false;
  return artistOverlap(row.artistName, chartArtists);
}

function artistOverlap(catalogArtist: string, chartArtists: string[]): boolean {
  const hay = fold(catalogArtist);
  return chartArtists.some((a) => {
    const needle = fold(a);
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

async function main() {
  const path = join(process.cwd(), "data/crosscheck/beatportal-house-2025.json");
  const chart = JSON.parse(readFileSync(path, "utf8")) as ChartFile;

  const rosterByFold = new Map(
    ARTIST_ROSTER.map((a) => [fold(a.name), a] as const),
  );
  const curatedByFold = new Map(
    CURATED_LABELS.map((l) => [fold(l.name), curatedLabelSlug(l)] as const),
  );

  const djRows = await prisma.dj.findMany({ select: { slug: true, name: true } });
  const labelRows = await prisma.label.findMany({
    select: { slug: true, name: true },
  });
  const trackRows = await prisma.track.findMany({
    select: { slug: true, title: true, artistName: true },
  });

  console.log(`Source: ${chart.source}`);
  console.log("");

  let missingArtists = 0;
  console.log("## Artists");
  for (const name of chart.artists) {
    const slug = slugify(name);
    const roster = rosterByFold.get(fold(name));
    const db = djRows.find(
      (d) => d.slug === slug || fold(d.name) === fold(name),
    );
    const ok = !!(roster || db);
    if (!ok) missingArtists += 1;
    console.log(
      `${ok ? "✓" : "✗"} ${name}  roster=${roster ? "yes" : "no"}  db=${db?.slug ?? "—"}`,
    );
  }

  let missingLabels = 0;
  console.log("\n## Labels");
  for (const name of chart.labels) {
    const slug = slugify(name);
    const curated =
      curatedByFold.get(fold(name)) ||
      (CURATED_LABEL_SLUGS.has(slug) ? slug : null);
    // Black Book uses curated slug "blackbook"
    const curatedAlt =
      name === "Black Book Records" && CURATED_LABEL_SLUGS.has("blackbook")
        ? "blackbook"
        : curated;
    const db = labelRows.find(
      (l) =>
        l.slug === slug ||
        l.slug === curatedAlt ||
        fold(l.name) === fold(name),
    );
    const ok = !!(curatedAlt || db);
    if (!ok) missingLabels += 1;
    console.log(
      `${ok ? "✓" : "✗"} ${name}  curated=${curatedAlt ?? "no"}  db=${db?.slug ?? "—"}`,
    );
  }

  let missingTracks = 0;
  console.log("\n## Tracks");
  for (const t of chart.tracks) {
    const hit = trackRows.find((row) => trackMatch(row, t.title, t.artists));
    const ok = !!hit;
    if (!ok) missingTracks += 1;
    console.log(
      `${ok ? "✓" : "✗"} #${t.rank} ${t.title} — ${t.artists.join(", ")}` +
        (hit ? `  db=${hit.slug}` : ""),
    );
  }

  console.log("\n## Summary");
  console.log(
    `artists missing=${missingArtists}/${chart.artists.length}; ` +
      `labels missing=${missingLabels}/${chart.labels.length}; ` +
      `tracks missing=${missingTracks}/${chart.tracks.length}`,
  );

  // Fail only on curated coverage (artists/labels) — tracks arrive via ingest.
  if (missingArtists > 0 || missingLabels > 0) {
    process.exitCode = 1;
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
