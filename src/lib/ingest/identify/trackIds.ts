/**
 * Resolve catalog track IDs from held / captured 1001 rows.
 *
 * Propose-then-verify:
 *   Deezer (ISRC) → MusicBrainz (MBID / ISRC / Beatport url-rels) →
 *   TrackRadar platforms → AudD findLyrics (public, no token).
 * Set79: published sitemap URLs only (set-level hints, never Relive).
 * Beatport: canonical /track/{slug}/{id} from MB / TrackRadar — never scrape.
 * AudioScout / MusicMate / TrackId: paste-only, never fetched.
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
import { normalizeIsrc } from "../../trackMeta";
import { searchAuddLyrics } from "./audd";
import { acceptBeatportTrackUrl } from "./beatport";
import { fingerprintIdProbes } from "./fingerprintWatch";
import { dropPasteOnlyUrls } from "./pasteOnly";
import { findHeldSet79Hints, type Set79Hint } from "./set79";
import {
  analyzeFingerprintOnlyWatches,
  searchTrackRadar,
  trackradarMode,
  type TrackRadarAnalyzeResult,
  type TrackRadarPlatforms,
} from "./trackradar";

export type TrackIdHit = {
  artist: string;
  title: string;
  at?: string;
  isrc?: string;
  mbid?: string;
  beatportUrl?: string;
  deezerTitle?: string;
  platforms?: TrackRadarPlatforms;
  source: "deezer" | "musicbrainz" | "both" | "trackradar" | "audd";
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
  trackradarMode: ReturnType<typeof trackradarMode>;
  trackradarAnalyzes: TrackRadarAnalyzeResult[];
  set79Hints: Set79Hint[];
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

function mergePlatforms(
  ...parts: (TrackRadarPlatforms | undefined)[]
): TrackRadarPlatforms | undefined {
  const merged: TrackRadarPlatforms = {};
  for (const p of parts) {
    if (!p) continue;
    for (const [k, v] of Object.entries(p) as [
      keyof TrackRadarPlatforms,
      string | undefined,
    ][]) {
      if (v && !merged[k]) merged[k] = v;
    }
  }
  const clean = dropPasteOnlyUrls(merged);
  return Object.values(clean).some(Boolean) ? clean : undefined;
}

function pickSource(flags: {
  deezer?: boolean;
  musicbrainz?: boolean;
  trackradar?: boolean;
  audd?: boolean;
}): TrackIdHit["source"] {
  const n = [
    flags.deezer,
    flags.musicbrainz,
    flags.trackradar,
    flags.audd,
  ].filter(Boolean).length;
  if (n > 1) return "both";
  if (flags.musicbrainz) return "musicbrainz";
  if (flags.trackradar) return "trackradar";
  if (flags.audd) return "audd";
  return "deezer";
}

export async function identifySeedRow(
  row: FingerprintSeedRow,
  opts: {
    musicbrainz?: boolean;
    trackradar?: boolean;
    audd?: boolean;
  } = {},
): Promise<TrackIdHit | TrackIdMiss> {
  if (isBareIdRow(row.artist, row.title)) {
    return { artist: row.artist, title: row.title, at: row.at, reason: "bare id" };
  }

  const deezer = await resolveTrackImage(row.title, row.artist);
  let isrc = normalizeIsrc(deezer?.isrc);
  let mbid: string | undefined;
  let beatportUrl: string | undefined;
  let usedMb = false;

  if (opts.musicbrainz) {
    const mb = await resolveTrackMetaMusicBrainz(row.title, row.artist);
    if (mb?.mbid) {
      usedMb = true;
      mbid = mb.mbid;
    }
    beatportUrl = acceptBeatportTrackUrl(mb?.beatportUrl);
    if (!isrc && mb?.isrc) {
      const ev = evaluateIsrc(mb.isrc);
      if (ev.ok) isrc = ev.isrc ?? null;
    }
  }

  let platforms: TrackRadarPlatforms | undefined;
  let usedTr = false;
  if (opts.trackradar) {
    const tr = await searchTrackRadar(row.artist, row.title);
    if (tr) {
      usedTr = true;
      platforms = tr.platforms;
      if (!isrc && tr.isrc) isrc = tr.isrc;
      if (!beatportUrl && tr.beatportUrl) {
        beatportUrl = acceptBeatportTrackUrl(tr.beatportUrl);
      }
    }
  }

  let usedAudd = false;
  if (opts.audd) {
    const audd = await searchAuddLyrics(row.artist, row.title);
    if (audd) {
      usedAudd = true;
      platforms = mergePlatforms(platforms, audd.platforms);
      if (!isrc && audd.isrc) isrc = audd.isrc;
    }
  }

  platforms = mergePlatforms(platforms);
  if (platforms?.beatport && !beatportUrl) {
    beatportUrl = acceptBeatportTrackUrl(platforms.beatport);
  }

  if (!isrc && !mbid && !beatportUrl && !platforms) {
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
    platforms,
    source: pickSource({
      deezer: Boolean(deezer?.isrc || deezer?.matchedTitle),
      musicbrainz: usedMb,
      trackradar: usedTr,
      audd: usedAudd,
    }),
  };
}

export async function identifyHeldSeeds(opts: {
  limit?: number;
  musicbrainz?: boolean;
  trackradar?: boolean;
  audd?: boolean;
  set79?: boolean;
  apply?: boolean;
  prisma?: PrismaClient;
} = {}): Promise<TrackIdReport> {
  const limit = opts.limit ?? Number(process.env.TRACK_ID_LIMIT || 20);
  const musicbrainz =
    opts.musicbrainz ?? process.env.TRACK_ID_MB !== "0";
  const trackradar =
    opts.trackradar ?? process.env.TRACKRADAR !== "0";
  const audd = opts.audd ?? process.env.AUDD !== "0";
  const set79 = opts.set79 ?? process.env.SET79 !== "0";
  const rows = heldIdentifyJobs().flatMap((j) =>
    uniqueIdentifyRows(j.rows).map((r) => ({ ...r, seed: j.seed })),
  );
  const slice = rows.slice(0, Math.max(0, limit));
  const hits: TrackIdHit[] = [];
  const misses: TrackIdMiss[] = [];

  for (const row of slice) {
    const result = await identifySeedRow(row, { musicbrainz, trackradar, audd });
    if ("reason" in result) misses.push(result);
    else hits.push(result);
  }

  const trackradarAnalyzes = await analyzeFingerprintOnlyWatches();
  const set79Hints = set79
    ? await findHeldSet79Hints(heldIdentifyJobs().map((j) => j.seed))
    : [];

  let applied = 0;
  if (opts.apply && opts.prisma) {
    applied = await applyTrackIdHits(opts.prisma, hits);
  }

  const report: TrackIdReport = {
    generatedAt: new Date().toISOString(),
    note: "Verified Deezer / MusicBrainz / TrackRadar / AudD IDs from held 1001 seeds. Beatport only via MB url-rels or TrackRadar canonical /track URLs (never scrape). Set79 is sitemap-only. AudioScout / MusicMate / TrackId stay paste-only. Fan Relives stay unwired.",
    scanned: slice.length,
    hits,
    misses,
    idGaps: fingerprintIdProbes(),
    trackradarMode: trackradarMode(),
    trackradarAnalyzes,
    set79Hints,
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
