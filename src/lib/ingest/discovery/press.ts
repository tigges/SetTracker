import { PRESS_SEEDS, type PressSeed } from "./pressSeeds";

export type PressHit = {
  name: string;
  detail: string;
  weight: number;
  sourceUrl: string;
  cohort: string[];
};

const TIMEOUT_MS = 12_000;

function normalizeArtist(name: string): string {
  return name.replace(/H[øöØÖ]rger/g, "Horger").replace(/\s+/g, " ").trim();
}

async function namesFromArticle(url: string, known: string[]): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; press-scan)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const lower = html
      .toLowerCase()
      .replace(/ø/g, "o")
      .replace(/ö/g, "o");
    const found: string[] = [];
    for (const n of known) {
      const key = normalizeArtist(n).toLowerCase();
      if (lower.includes(key)) found.push(normalizeArtist(n));
    }
    // Title pattern "A and B" / "A & B"
    const title = html.match(/<title>([^<]+)/i)?.[1] ?? "";
    const m = title.match(
      /([A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,3})\s+(?:and|&)\s+([A-Z][\w.øöØÖ]+(?:\s+[A-Z][\w.]+){0,3})/i,
    );
    if (m) {
      found.push(normalizeArtist(m[1]!));
      found.push(normalizeArtist(m[2]!));
    }
    return [...new Set(found)];
  } catch {
    return [];
  }
}

function cohortOf(seed: PressSeed): string[] {
  return [...seed.artists, ...(seed.projects ?? [])].map(normalizeArtist);
}

export async function scanPressSeeds(): Promise<PressHit[]> {
  const hits: PressHit[] = [];
  for (const seed of PRESS_SEEDS) {
    const weight = seed.weight ?? 40;
    const cohort = cohortOf(seed);
    const scraped = seed.skipFetch
      ? []
      : await namesFromArticle(seed.url, cohort);
    const names = [...new Set([...cohort, ...scraped])];
    const tag = seed.kind === "tour" ? "tour" : "press";
    console.log(`[${tag}] ${seed.title}: ${names.join(", ")}`);
    for (const name of names) {
      hits.push({
        name,
        detail: seed.title,
        weight,
        sourceUrl: seed.url,
        cohort: names,
      });
    }
  }
  return hits;
}
