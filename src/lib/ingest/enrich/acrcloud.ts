/**
 * ACRCloud fingerprint enrich — SKETCH (not wired into ingest yet).
 *
 * Goal
 * ----
 * For sets with sparse / empty tracklists but a resolvable `playbackUrl`
 * (SoundCloud / YouTube / hearthis), sample audio and identify segments via
 * ACRCloud Identify API. Write Played rows with:
 *   idStatus: "identified" | "unresolved_id"
 *   provenance: "fingerprint"
 *
 * Policy
 * ------
 * - Call ACRCloud / AudD **directly** (user trial / own keys).
 * - Do **not** scrape AudioScout, 1001Tracklists, TrackId, or MusicMate.
 * - Keep source ≠ playback: never overwrite `sourceUrl` / `sourceName` with
 *   the fingerprint vendor; only enrich Played + Track rows.
 *
 * Env (planned)
 * -------------
 *   ACRCLOUD_HOST           e.g. identify-eu-west-1.acrcloud.com
 *   ACRCLOUD_ACCESS_KEY
 *   ACRCLOUD_ACCESS_SECRET
 *   ACRCLOUD_ENABLED=1      hard gate — no network without this
 *   ACRCLOUD_SET_LIMIT      max sets per enrich run (default 5)
 *   ACRCLOUD_SAMPLE_SEC     clip length per probe (default 12)
 *   ACRCLOUD_STEP_SEC       spacing between probes (default 90)
 *
 * Suggested hook points
 * ---------------------
 * 1) `.github/workflows/catalog-enrich.yml` — after thumbs / MusicBrainz,
 *    run `npm run enrich:fingerprint` (script TBD).
 * 2) Skip sets that already have ≥ N identified Played rows from
 *    soundcloud / youtube / hearthis / insomniac.
 * 3) Prefer long-form SC/hearthis playback (stable progressive MP3) over YT
 *    (bot walls / ToS friction) when both exist.
 *
 * Pipeline sketch
 * ---------------
 *   selectSparseSets()
 *     → for each set: resolvePlaybackStream(playbackUrl)
 *     → sampleClips(stream, { sampleSec, stepSec })
 *     → acrIdentify(clipBuffer)  // HMAC-signed multipart POST
 *     → mapAcrHit → { artist, title, isrc?, score }
 *     → upsert Track + Played(position from clip offset, provenance fingerprint)
 *     → never delete stronger source-derived Played rows; fill gaps only
 *
 * Confidence
 * ----------
 * Only accept hits above a score threshold; below → unresolved_id with
 * rawText like "ID @ 12:30 (fingerprint weak)".
 *
 * This module exports no-op stubs until keys + stream extraction land.
 */

import type { PrismaClient } from "@prisma/client";

export type AcrEnrichStats = {
  enabled: boolean;
  candidates: number;
  probed: number;
  identified: number;
  skipped: string;
};

export type AcrEnrichOptions = {
  setLimit?: number;
  /** Minimum identified plays already present to skip the set */
  minIdentifiedToSkip?: number;
};

function envEnabled(): boolean {
  return process.env.ACRCLOUD_ENABLED === "1";
}

function hasCredentials(): boolean {
  return Boolean(
    process.env.ACRCLOUD_HOST &&
      process.env.ACRCLOUD_ACCESS_KEY &&
      process.env.ACRCLOUD_ACCESS_SECRET,
  );
}

/**
 * Sets that are good fingerprint candidates: have playback, thin tracklist.
 * Stub query — wire when implementing.
 */
export async function selectSparseSetsForFingerprint(
  _prisma: PrismaClient,
  _opts: AcrEnrichOptions = {},
): Promise<Array<{ id: string; slug: string; playbackUrl: string }>> {
  // TODO: prisma.set.findMany({ where: { playbackUrl: { not: null }, ... } })
  // with Played count filter. Left empty so the sketch cannot mutate prod DB.
  return [];
}

/**
 * One enrich pass. No-op unless ACRCLOUD_ENABLED=1 and credentials exist.
 */
export async function enrichSparseSetsWithAcrCloud(
  prisma: PrismaClient,
  opts: AcrEnrichOptions = {},
): Promise<AcrEnrichStats> {
  if (!envEnabled()) {
    return {
      enabled: false,
      candidates: 0,
      probed: 0,
      identified: 0,
      skipped: "ACRCLOUD_ENABLED!=1",
    };
  }
  if (!hasCredentials()) {
    return {
      enabled: false,
      candidates: 0,
      probed: 0,
      identified: 0,
      skipped: "missing ACRCLOUD_* credentials",
    };
  }

  const candidates = await selectSparseSetsForFingerprint(prisma, opts);
  // TODO: stream extract → identify → upsert Played(provenance: "fingerprint")
  console.log(
    `[acrcloud] sketch: ${candidates.length} candidates (identify not implemented)`,
  );
  return {
    enabled: true,
    candidates: candidates.length,
    probed: 0,
    identified: 0,
    skipped: "identify path not implemented",
  };
}
