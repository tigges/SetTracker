/**
 * Graduate high-scoring promoted discovery candidates into the persistent
 * roster file so the next deep run polls them with full artist budgets.
 *
 * Does not edit curated ARTIST_ROSTER entries — appends to data/roster-graduates.json.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ARTIST_ROSTER_CURATED, type ArtistRosterEntry } from "../roster";
import { slugify } from "../types";
import { loadCandidates } from "./store";

export type GraduatesFile = {
  version: 1;
  updatedAt: string | null;
  artists: ArtistRosterEntry[];
};

const DEFAULT_PATH = join(process.cwd(), "data", "roster-graduates.json");

export function graduatesPath(): string {
  return process.env.ROSTER_GRADUATES_PATH || DEFAULT_PATH;
}

export function loadGraduates(path = graduatesPath()): GraduatesFile {
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as GraduatesFile;
    if (!parsed?.artists || !Array.isArray(parsed.artists)) return emptyFile();
    return parsed;
  } catch {
    return emptyFile();
  }
}

function emptyFile(): GraduatesFile {
  return { version: 1, updatedAt: null, artists: [] };
}

const ACCENTS = ["#ff3d6e", "#3d8bfd", "#00c2ff", "#e8c547", "#00f0a0", "#c77dff"];

function accentFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 17) % ACCENTS.length;
  return ACCENTS[h];
}

/**
 * Promote queued discovery artists with resolvable handles into the graduate
 * roster. Returns counts for logging.
 */
export function graduateRoster(opts?: {
  minScore?: number;
  cap?: number;
  path?: string;
}): { kept: number; added: number; total: number } {
  const minScore = opts?.minScore ?? Number(process.env.DISCOVERY_GRADUATE_SCORE || 40);
  const cap = opts?.cap ?? Number(process.env.DISCOVERY_GRADUATE_CAP || 20);
  const path = opts?.path ?? graduatesPath();

  const curatedSlugs = new Set(
    ARTIST_ROSTER_CURATED.map((a) => slugify(a.name)),
  );
  const file = loadGraduates(path);
  const existingSlugs = new Set(
    file.artists.map((a) => slugify(a.name)).filter(Boolean),
  );

  const candidates = loadCandidates()
    .candidates.filter(
      (c) =>
        c.status === "promoted" &&
        c.score >= minScore &&
        (c.youtubeHandle || c.soundcloudPermalink) &&
        !curatedSlugs.has(c.slug) &&
        !existingSlugs.has(c.slug),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, cap);

  let added = 0;
  for (const c of candidates) {
    const entry: ArtistRosterEntry = {
      name: c.name,
      genre: c.genre || "House",
      accent: c.accent || accentFor(c.slug),
      priority: "normal",
    };
    if (c.youtubeHandle) {
      entry.youtube = {
        handle: c.youtubeHandle.startsWith("@")
          ? c.youtubeHandle
          : `@${c.youtubeHandle.replace(/^@/, "")}`,
        status: "ok",
        note: `graduated score=${c.score}`,
      };
    }
    // SoundCloud roster polling needs a numeric userId — skip until resolved.
    // Promoted SC permalinks are still polled via discovery/run each deep.
    file.artists.push(entry);
    existingSlugs.add(c.slug);
    added += 1;
  }

  file.updatedAt = new Date().toISOString();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`, "utf8");

  return {
    kept: file.artists.length - added,
    added,
    total: file.artists.length,
  };
}

/** CLI entry: tsx prisma/graduate-roster.ts */
export function mainGraduate(): void {
  const result = graduateRoster();
  console.log(
    `[graduate] kept=${result.kept} added=${result.added} total=${result.total}`,
  );
}
