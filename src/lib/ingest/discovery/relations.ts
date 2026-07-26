import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { slugify } from "../types";
import type { ArtistRelation, RelationFile } from "./types";

const DEFAULT_PATH = join(process.cwd(), "data", "artist-relations.json");

export function loadRelations(path = DEFAULT_PATH): RelationFile {
  if (!existsSync(path)) {
    return { version: 1, updatedAt: new Date().toISOString(), relations: [], venueArtists: {} };
  }
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as RelationFile;
    return {
      version: 1,
      updatedAt: raw.updatedAt || new Date().toISOString(),
      relations: Array.isArray(raw.relations) ? raw.relations : [],
      venueArtists: raw.venueArtists && typeof raw.venueArtists === "object" ? raw.venueArtists : {},
    };
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), relations: [], venueArtists: {} };
  }
}

export function saveRelations(file: RelationFile, path = DEFAULT_PATH): void {
  file.updatedAt = new Date().toISOString();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(file, null, 2) + "\n");
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

/** Link every pair among a co-mentioned artist name list. */
export function linkCohort(
  file: RelationFile,
  names: string[],
  reason: string,
  weight: number,
  source?: string,
): number {
  const slugs = [...new Set(names.map((n) => slugify(n)).filter(Boolean))];
  if (slugs.length < 2) return 0;
  const existing = new Map(file.relations.map((r) => [pairKey(r.a, r.b), r]));
  let added = 0;
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const a = slugs[i]!;
      const b = slugs[j]!;
      const key = pairKey(a, b);
      const prev = existing.get(key);
      if (prev) {
        prev.weight = Math.max(prev.weight, weight);
        if (reason && !prev.reason.includes(reason)) {
          prev.reason = `${prev.reason}; ${reason}`.slice(0, 200);
        }
        continue;
      }
      const rel: ArtistRelation = { a, b, reason, weight, source };
      file.relations.push(rel);
      existing.set(key, rel);
      added += 1;
    }
  }
  return added;
}

export function linkVenueArtists(
  file: RelationFile,
  venueSlug: string,
  artistNames: string[],
): void {
  const slugs = [...new Set(artistNames.map((n) => slugify(n)).filter(Boolean))];
  const prev = new Set(file.venueArtists[venueSlug] ?? []);
  for (const s of slugs) prev.add(s);
  file.venueArtists[venueSlug] = [...prev].sort();
}

export function relatedSlugsFor(slug: string, limit = 12): Array<{
  slug: string;
  reason: string;
  weight: number;
}> {
  const file = loadRelations();
  const out: Array<{ slug: string; reason: string; weight: number }> = [];
  for (const r of file.relations) {
    if (r.a === slug) out.push({ slug: r.b, reason: r.reason, weight: r.weight });
    else if (r.b === slug) out.push({ slug: r.a, reason: r.reason, weight: r.weight });
  }
  return out.sort((a, b) => b.weight - a.weight).slice(0, limit);
}

export function venueArtistSlugs(venueSlug: string): string[] {
  return loadRelations().venueArtists[venueSlug] ?? [];
}
