import type { PrismaClient } from "@prisma/client";
import { ARTIST_ROSTER } from "../roster";
import { SOUNDCLOUD_SHOWS } from "../soundcloud/shows";
import { slugify } from "../types";
import { YOUTUBE_ARTIST_CHANNELS } from "../youtube/artists";
import { YOUTUBE_SETS } from "../youtube/videos";
import { rankCoplayArtists } from "./coplay";
import { ensureClubListVenues } from "./clubLists";
import { ensureDjMagVenues } from "./djmagClubs";
import { ensureDiscoveredDjs } from "./ensureDjs";
import { hintForName } from "./knownHandles";
import { scanFestivalLineups } from "./lineup";
import { scanPressSeeds } from "./press";
import {
  linkCohort,
  linkVenueArtists,
  loadRelations,
  saveRelations,
} from "./relations";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";
import type { ArtistCandidate, CandidateEvidence } from "./types";

export type DiscoveryInput = {
  /** Collaborators observed on sets ingested this run */
  collaboratorMentions?: Array<{
    name: string;
    sourceSlug: string;
    weight?: number;
  }>;
  /** When true, also scan curated lineup pages + press seeds. */
  scanExternal?: boolean;
};

export type DiscoveryStats = {
  candidatesTotal: number;
  newlyQueued: number;
  promoted: number;
  coplayHits: number;
  lineupHits: number;
  pressHits: number;
  djsEnsured: number;
  venuesEnsured: number;
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
  for (const a of ARTIST_ROSTER) {
    s.add(slugify(a.name));
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

function queueMention(
  file: ReturnType<typeof loadCandidates>,
  beforeSlugs: Set<string>,
  exclude: Set<string>,
  name: string,
  evidence: CandidateEvidence[],
  score: number,
): boolean {
  const clean = name.replace(/H[øöØÖ]rger/g, "Horger").trim();
  const slug = slugify(clean);
  if (!slug || exclude.has(slug)) return false;
  const hint = hintForName(clean);
  const before = file.candidates.find((c) => c.slug === slug);
  upsertCandidate(file, {
    name: clean,
    slug,
    score,
    status: "queued",
    evidence,
    youtubeHandle: hint?.youtubeHandle,
    soundcloudPermalink: hint?.soundcloudPermalink,
    bandcampUrl: hint?.bandcampUrl,
    genre: hint?.genre,
    accent: hint?.accent,
  });
  return !before && !beforeSlugs.has(slug);
}

/**
 * Rank co-plays + collaborators + lineup/press into the candidate queue,
 * attach known handles, auto-promote, ensure Dj rows, and persist relations.
 */
export async function runDiscovery(
  prisma: PrismaClient,
  input: DiscoveryInput = {},
): Promise<DiscoveryStats> {
  const file = loadCandidates();
  const beforeSlugs = new Set(file.candidates.map((c) => c.slug));
  const exclude = seedSlugs();
  for (const slug of existingDjSlugsFromFile(file)) exclude.add(slug);

  let newlyQueued = 0;
  let promoted = 0;
  let lineupHits = 0;
  let pressHits = 0;
  let venuesEnsured = 0;

  const relations = loadRelations();

  for (const mention of input.collaboratorMentions ?? []) {
    const ok = queueMention(
      file,
      beforeSlugs,
      exclude,
      mention.name,
      [
        {
          kind: "set_collaborator",
          detail: `Billed on ${mention.sourceSlug}`,
          sourceSlug: mention.sourceSlug,
          weight: mention.weight ?? 25,
        },
      ],
      mention.weight ?? 25,
    );
    if (ok) newlyQueued += 1;
  }

  if (input.scanExternal !== false) {
    try {
      const clubs = await ensureDjMagVenues(prisma);
      venuesEnsured = clubs.created + clubs.updated;
    } catch (err) {
      console.warn(
        "[discovery] djmag clubs failed:",
        err instanceof Error ? err.message : err,
      );
    }

    try {
      const lists = await ensureClubListVenues(prisma);
      venuesEnsured += lists.created + lists.updated;
      if (lists.newVenues.length) {
        console.log(
          `[discovery] auto-identified ${lists.newVenues.length} new venues from club lists`,
        );
      }
    } catch (err) {
      console.warn(
        "[discovery] club lists failed:",
        err instanceof Error ? err.message : err,
      );
    }

    try {
      const lineup = await scanFestivalLineups();
      lineupHits = lineup.length;
      const byVenue = new Map<string, string[]>();
      for (const hit of lineup) {
        const ok = queueMention(
          file,
          beforeSlugs,
          // Lineup names should still become poll targets even if rostered —
          // only skip exact promoted duplicates for queue counting.
          new Set(),
          hit.name,
          [
            {
              kind: "lineup",
              detail: hit.detail,
              sourceSlug: hit.eventSlug,
              weight: hit.weight,
            },
          ],
          hit.weight,
        );
        if (ok) newlyQueued += 1;
        const list = byVenue.get(hit.eventSlug) ?? [];
        list.push(hit.name);
        byVenue.set(hit.eventSlug, list);
      }
      for (const [venue, names] of byVenue) {
        linkVenueArtists(relations, venue, names);
        linkCohort(
          relations,
          names.slice(0, 40),
          `${venue} lineup`,
          20,
          venue,
        );
      }
    } catch (err) {
      console.warn(
        "[discovery] lineup scan failed:",
        err instanceof Error ? err.message : err,
      );
    }

    try {
      const press = await scanPressSeeds();
      pressHits = press.length;
      const seenCohorts = new Set<string>();
      for (const hit of press) {
        const ok = queueMention(
          file,
          beforeSlugs,
          new Set(),
          hit.name,
          [
            {
              kind: "press",
              detail: hit.detail,
              sourceSlug: hit.sourceUrl,
              weight: hit.weight,
            },
          ],
          hit.weight,
        );
        if (ok) newlyQueued += 1;
        const key = hit.cohort.slice().sort().join("|");
        if (!seenCohorts.has(key)) {
          seenCohorts.add(key);
          linkCohort(relations, hit.cohort, hit.detail, hit.weight, hit.sourceUrl);
        }
      }
    } catch (err) {
      console.warn(
        "[discovery] press scan failed:",
        err instanceof Error ? err.message : err,
      );
    }
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
  const promoteScore = Number(process.env.DISCOVERY_PROMOTE_SCORE || 28);
  const promoteCap = Number(process.env.DISCOVERY_PROMOTE_CAP || 24);
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
  saveRelations(relations);

  const ensured = await ensureDiscoveredDjs(prisma);

  console.log(
    `[discovery] candidates=${file.candidates.length} new=${newlyQueued} ` +
      `promoted=${promoted} coplay=${coplay.length} lineup=${lineupHits} ` +
      `press=${pressHits} djs+${ensured.created} venues+${venuesEnsured}`,
  );

  return {
    candidatesTotal: file.candidates.length,
    newlyQueued,
    promoted,
    coplayHits: coplay.length,
    lineupHits,
    pressHits,
    djsEnsured: ensured.created,
    venuesEnsured,
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

/**
 * Queue channels discovered from YouTube "Fans also like" / similar shelves.
 * Called from the YouTube adapter during deep polls.
 */
export function queueYoutubeSimilarChannels(
  channels: Array<{ handle: string; name: string; shelf?: string }>,
  opts?: { sourceChannel?: string; genre?: string; accent?: string },
): number {
  if (channels.length === 0) return 0;
  const file = loadCandidates();
  const exclude = seedSlugs();
  for (const slug of existingDjSlugsFromFile(file)) exclude.add(slug);
  let added = 0;

  for (const ch of channels) {
    const handle = ch.handle.startsWith("@") || ch.handle.startsWith("UC")
      ? ch.handle
      : `@${ch.handle.replace(/^@/, "")}`;
    const name = ch.name.trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug || exclude.has(slug)) continue;

    const before = file.candidates.find((c) => c.slug === slug);
    const evidence: CandidateEvidence[] = [
      {
        kind: "youtube_similar",
        detail: ch.shelf
          ? `${ch.shelf} ← ${opts?.sourceChannel || "yt"}`
          : `similar ← ${opts?.sourceChannel || "yt"}`,
        weight: 18,
      },
    ];
    upsertCandidate(file, {
      name,
      slug,
      score: 18,
      status: "queued",
      evidence,
      youtubeHandle: handle,
      genre: opts?.genre,
      accent: opts?.accent,
    });
    if (!before) added += 1;
  }

  if (added > 0 || channels.length > 0) saveCandidates(file);
  return added;
}
