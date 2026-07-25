import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ArtistCandidate, CandidateFile } from "./types";

const DEFAULT_PATH = join(process.cwd(), "data", "artist-candidates.json");

export function candidatesPath(): string {
  return process.env.ARTIST_CANDIDATES_PATH || DEFAULT_PATH;
}

export function loadCandidates(path = candidatesPath()): CandidateFile {
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as CandidateFile;
    if (!parsed?.candidates || !Array.isArray(parsed.candidates)) {
      return emptyFile();
    }
    return parsed;
  } catch {
    return emptyFile();
  }
}

export function saveCandidates(file: CandidateFile, path = candidatesPath()): void {
  mkdirSync(dirname(path), { recursive: true });
  const next: CandidateFile = {
    version: 1,
    updatedAt: new Date().toISOString(),
    candidates: file.candidates
      .slice()
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
  };
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

function emptyFile(): CandidateFile {
  return { version: 1, updatedAt: new Date().toISOString(), candidates: [] };
}

export function upsertCandidate(
  file: CandidateFile,
  incoming: Omit<ArtistCandidate, "updatedAt"> & { updatedAt?: string },
): ArtistCandidate {
  const existing = file.candidates.find((c) => c.slug === incoming.slug);
  if (!existing) {
    const created: ArtistCandidate = {
      ...incoming,
      updatedAt: incoming.updatedAt ?? new Date().toISOString(),
    };
    file.candidates.push(created);
    return created;
  }

  // Preserve promoted/rejected; still accumulate evidence + score
  const evidenceKeys = new Set(
    existing.evidence.map((e) => `${e.kind}:${e.detail}:${e.sourceSlug ?? ""}`),
  );
  for (const e of incoming.evidence) {
    const k = `${e.kind}:${e.detail}:${e.sourceSlug ?? ""}`;
    if (evidenceKeys.has(k)) continue;
    existing.evidence.push(e);
    evidenceKeys.add(k);
  }
  existing.score = Math.max(existing.score, incoming.score);
  // Recompute soft score from evidence weights (cap growth)
  const evidenceScore = existing.evidence.reduce((s, e) => s + e.weight, 0);
  existing.score = Math.min(500, Math.max(existing.score, evidenceScore));
  if (incoming.youtubeHandle && !existing.youtubeHandle) {
    existing.youtubeHandle = incoming.youtubeHandle;
  }
  if (incoming.soundcloudPermalink && !existing.soundcloudPermalink) {
    existing.soundcloudPermalink = incoming.soundcloudPermalink;
  }
  if (incoming.bandcampUrl && !existing.bandcampUrl) {
    existing.bandcampUrl = incoming.bandcampUrl;
  }
  if (incoming.genre && !existing.genre) existing.genre = incoming.genre;
  if (incoming.accent && !existing.accent) existing.accent = incoming.accent;
  if (existing.status === "queued" && incoming.status === "promoted") {
    existing.status = "promoted";
    existing.promotedAt = new Date().toISOString();
  }
  existing.updatedAt = new Date().toISOString();
  return existing;
}
