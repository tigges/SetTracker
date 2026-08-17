/**
 * Resolve catalog track IDs from held / captured 1001 rows.
 *
 * Propose-then-verify: Deezer (ISRC) and optional MusicBrainz (MBID / Beatport).
 * Never invents ISRCs, never wires fan Relives, never overwrites sourceUrl.
 */

import type { PrismaClient } from "@prisma/client";
import { writeReport } from "../discovery/llmResearch";
import { isBareIdRow } from "../tracklists1001/toSeed";
import type { FingerprintSeedRow } from "../fingerprint/seeds";
import { HELD_RELIVE_WATCH } from "../nextCaptures";
import {
  TL_COLE_TERRAZAS_HARD_SUMMER_2026,
  TL_KNOCK2_ZEDD_HARD_SUMMER_2026,
} from "../tracklists1001/seeds";
import { resolveTrackImage } from "../../thumbs/deezer";
import { resolveTrackMetaMusicBrainz } from "../../thumbs/musicbrainz";
import {
  canonicalBeatportUrl,
  normalizeIsrc,
} from "../../trackMeta";
import { fingerprintIdProbes } from "./fingerprintWatch";

export type TrackIdHit = {
  artist: string;
  title: string;
  at?: string;
  isrc?: string;
  mbid?: string;
  beatportUrl?: string;
  deezerTitle?: string;
  source: "deezer" | "musicbrainz" | "both";
};

export type TrackIdMiss = {
  artist: string;
  title: string;
  at?: string;
  reason: string;
};

export type TrackIdReport = {
  generatedAt: string;
  note: string;
  scanned: number;
  hits: TrackIdHit[];
  misses: TrackIdMiss[];
  idGaps: ReturnType<typeof fingerprintIdProbes>;
  applied: number;
};

const HELD_SEED_ROWS: Record<string, FingerprintSeedRow[]> = {
  TL_KNOCK2_ZEDD_HARD_SUMMER_2026,
  TL_COLE_TERRAZAS_HARD_SUMMER_2026,
};

export function evaluateIsrc(raw: string | null | undefined): {
  ok: boolean;
  isrc?: string;
  reason: string;
} {
  const isrc = normalizeIsrc(raw);
  if (!isrc) return { ok: false, reason: "not an ISRC" };
  return { ok: true, isrc, reason: "isrc" };
}

export function uniqueIdentifyRows(
  rows: FingerprintSeedRow[],
): FingerprintSeedRow[] {
  const seen = new Set<string>();
  const out: FingerprintSeedRow[] = [];
  for (const r of rows) {
    if (isBareIdRow(r.artist, r.title)) continue;
    const key = `${r.artist.trim().toLowerCase()}::${r.title.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function heldIdentifyJobs(): {
  name: string;
  seed: string;
  rows: FingerprintSeedRow[];
}[] {
  return HELD_RELIVE_WATCH.filter((h) => HELD_SEED_ROWS[h.seed]).map((h) => ({
    name: h.name,
    seed: h.seed,
    rows: HELD_SEED_ROWS[h.seed]!,
  }));
}

export async function identifySeedRow(
  row: FingerprintSeedRow,
  opts: { musicbrainz?: boolean } = {},
): Promise<TrackIdHit | TrackIdMiss> {
  if (isBareIdRow(row.artist, row.title)) {
    return { artist: row.artist, title: row.title, at: row.at, reason: "bare id" };
  }

  const deezer = await resolveTrackImage(row.title, row.artist);
  const isrc = normalizeIsrc(deezer?.isrc);
  let mbid: string | undefined;
  let beatportUrl: string | undefined;

  if (opts.musicbrainz) {
    const mb = await resolveTrackMetaMusicBrainz(row.title, row.artist);
    mbid = mb?.mbid || undefined;
    beatportUrl = canonicalBeatportUrl(mb?.beatportUrl) || undefined;
    if (!isrc && mb?.isrc) {
      const ev = evaluateIsrc(mb.isrc);
      if (ev.ok) {
        return {
          artist: row.artist,
          title: row.title,
          at: row.at,
          isrc: ev.isrc,
          mbid,
          beatportUrl,
          source: "musicbrainz",
        };
      }
    }
  }

  if (!isrc && !mbid && !beatportUrl) {
    return {
      artist: row.artist,
      title: row.title,
      at: row.at,
      reason: "no verified id",
    };
  }

  return {
    artist: row.artist,
    title: row.title,
    at: row.at,
    isrc: isrc || undefined,
    mbid,
    beatportUrl,
    deezerTitle: deezer?.matchedTitle || undefined,
    source: mbid || beatportUrl ? (isrc ? "both" : "musicbrainz") : "deezer",
  };
}

export async function identifyHeldSeeds(opts: {
  limit?: number;
  musicbrainz?: boolean;
  apply?: boolean;
  prisma?: PrismaClient;
} = {}): Promise<TrackIdReport> {
  const limit = opts.limit ?? Number(process.env.TRACK_ID_LIMIT || 20);
  const musicbrainz =
    opts.musicbrainz ?? process.env.TRACK_ID_MB === "1";
  const rows = heldIdentifyJobs().flatMap((j) =>
    uniqueIdentifyRows(j.rows).map((r) => ({ ...r, seed: j.seed })),
  );
  const slice = rows.slice(0, Math.max(0, limit));
  const hits: TrackIdHit[] = [];
  const misses: TrackIdMiss[] = [];

  for (const row of slice) {
    const result = await identifySeedRow(row, { musicbrainz });
    if ("reason" in result) misses.push(result);
    else hits.push(result);
  }

  let applied = 0;
  if (opts.apply && opts.prisma) {
    applied = await applyTrackIdHits(opts.prisma, hits);
  }

  const report: TrackIdReport = {
    generatedAt: new Date().toISOString(),
    note: "Verified Deezer/MusicBrainz IDs from held 1001 seeds. Fan Relives stay unwired.",
    scanned: slice.length,
    hits,
    misses,
    idGaps: fingerprintIdProbes(),
    applied,
  };
  writeReport("track-id-research.json", report);
  return report;
}

export async function applyTrackIdHits(
  prisma: PrismaClient,
  hits: TrackIdHit[],
): Promise<number> {
  let n = 0;
  for (const hit of hits) {
    if (!hit.isrc && !hit.beatportUrl) continue;
    const tracks = await prisma.track.findMany({
      where: {
        artistName: hit.artist,
        title: hit.title,
      },
      select: { id: true, isrc: true, beatportUrl: true },
    });
    for (const t of tracks) {
      const data: { isrc?: string; beatportUrl?: string } = {};
      if (hit.isrc && !t.isrc) data.isrc = hit.isrc;
      if (hit.beatportUrl && !t.beatportUrl) data.beatportUrl = hit.beatportUrl;
      if (!Object.keys(data).length) continue;
      await prisma.track.update({ where: { id: t.id }, data });
      n += 1;
    }
  }
  return n;
}
