import type { PrismaClient } from "@prisma/client";
import { SOUNDCLOUD_SHOWS } from "../soundcloud/shows";
import { slugify } from "../types";
import { YOUTUBE_ARTIST_CHANNELS } from "../youtube/artists";
import { YOUTUBE_SETS } from "../youtube/videos";
import { rankCoplayArtists } from "./coplay";
import { hintForName } from "./knownHandles";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";
import type { ArtistCandidate, CandidateEvidence } from "./types";

export type DiscoveryInput = {
  /** Collaborators observed on sets ingested this run */
  collaboratorMentions?: Array<{
    name: string;
    sourceSlug: string;
    weight?: number;
  }>;
};

export type DiscoveryStats = {
  candidatesTotal: number;
  newlyQueued: number;
  promoted: number;
  coplayHits: number;
};

function seedSlugs(): Set<string> {
  const s = new Set<string>();
  for (const show of SOUNDCLOUD_SHOWS) {
    s.add(show.primaryArtist.slug || slugify(show.primaryArtist.name));
  }
  for (const v of YOUTUBE_SETS) {
    s.add(v.primaryArtist.slug || slugify(v.primaryArtist.name));
  }
  for (const ch of YOUTUBE_ARTIST_CHANNELS) {
    s.add(slugify(ch.primaryName));
  }
  return s;
}

function existingDjSlugsFromFile(
  file: { candidates: ArtistCandidate[] },
): Set<string> {
  const s = new Set<string>();
  for (const c of file.candidates) {
    if (c.status === "promoted") s.add(c.slug);
  }
  return s;
}

/**
 * After ingest: rank co-plays + set collaborators into the candidate queue,
 * attach known handles, and auto-promote high-signal names into the queue
 * as `promoted` (runtime poll lists read promoted YT/SC handles).
 */
export async function runDiscovery(
  prisma: PrismaClient,
  input: DiscoveryInput = {},
): Promise<DiscoveryStats> {
  const file = loadCandidates();
  const beforeSlugs = new Set(file.candidates.map((c) => c.slug));
  // Exclude artists already wired as primary seeds / already promoted — not
  // every DJ row (collaborators should still become poll targets).
  const exclude = seedSlugs();
  for (const slug of existingDjSlugsFromFile(file)) exclude.add(slug);

  let newlyQueued = 0;
  let promoted = 0;

  for (const mention of input.collaboratorMentions ?? []) {
    const slug = slugify(mention.name);
    if (!slug || exclude.has(slug)) continue;
    const hint = hintForName(mention.name);
    const evidence: CandidateEvidence[] = [
      {
        kind: "set_collaborator",
        detail: `Billed on ${mention.sourceSlug}`,
        sourceSlug: mention.sourceSlug,
        weight: mention.weight ?? 25,
      },
    ];
    const before = file.candidates.find((c) => c.slug === slug);
    upsertCandidate(file, {
      name: mention.name,
      slug,
      score: mention.weight ?? 25,
      status: "queued",
      evidence,
      youtubeHandle: hint?.youtubeHandle,
      soundcloudPermalink: hint?.soundcloudPermalink,
      bandcampUrl: hint?.bandcampUrl,
      genre: hint?.genre,
      accent: hint?.accent,
    });
    if (!before && !beforeSlugs.has(slug)) newlyQueued += 1;
  }

  const coplay = await rankCoplayArtists(prisma, {
    excludeSlugs: exclude,
    minPlays: 2,
    limit: 50,
  });

  for (const hit of coplay) {
    if (exclude.has(hit.slug)) continue;
    const hint = hintForName(hit.name);
    const before = file.candidates.find((c) => c.slug === hit.slug);
    upsertCandidate(file, {
      name: hit.name,
      slug: hit.slug,
      score: hit.score,
      status: "queued",
      evidence: hit.evidence,
      youtubeHandle: hint?.youtubeHandle,
      soundcloudPermalink: hint?.soundcloudPermalink,
      bandcampUrl: hint?.bandcampUrl,
      genre: hint?.genre,
      accent: hint?.accent,
    });
    if (!before && !beforeSlugs.has(hit.slug)) newlyQueued += 1;
  }

  // Auto-promote: high score + resolvable YouTube or SoundCloud handle
  const promoteScore = Number(process.env.DISCOVERY_PROMOTE_SCORE || 30);
  const promoteCap = Number(process.env.DISCOVERY_PROMOTE_CAP || 12);
  const promotable = file.candidates
    .filter(
      (c) =>
        c.status === "queued" &&
        c.score >= promoteScore &&
        (c.youtubeHandle || c.soundcloudPermalink),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, promoteCap);

  for (const c of promotable) {
    c.status = "promoted";
    c.promotedAt = new Date().toISOString();
    promoted += 1;
  }

  saveCandidates(file);

  console.log(
    `[discovery] candidates=${file.candidates.length} new=${newlyQueued} ` +
      `promoted=${promoted} coplay=${coplay.length}`,
  );

  return {
    candidatesTotal: file.candidates.length,
    newlyQueued,
    promoted,
    coplayHits: coplay.length,
  };
}

/** Promoted YouTube handles for runtime channel polling. */
export function promotedYoutubeChannels(): Array<{
  channel: string;
  primaryName: string;
  genre: string;
  accent: string;
  limit: number;
  minDurationSec: number;
}> {
  const file = loadCandidates();
  return file.candidates
    .filter((c) => c.status === "promoted" && c.youtubeHandle)
    .map((c) => ({
      channel: c.youtubeHandle!,
      primaryName: c.name,
      genre: c.genre || "Electronic",
      accent: c.accent || "#ff7a45",
      limit: 4,
      minDurationSec: 20 * 60,
    }));
}

/** Promoted SoundCloud permalinks → soft show stubs (resolved at poll time). */
export function promotedSoundcloudPermalinks(): Array<{
  permalink: string;
  name: string;
  genre: string;
  accent: string;
}> {
  const file = loadCandidates();
  return file.candidates
    .filter((c) => c.status === "promoted" && c.soundcloudPermalink)
    .map((c) => ({
      permalink: c.soundcloudPermalink!,
      name: c.name,
      genre: c.genre || "Electronic",
      accent: c.accent || "#ff7a45",
    }));
}
