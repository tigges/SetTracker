/**
 * Resolve catalog track IDs from held / captured 1001 rows.
 *
 * Propose-then-verify:
 *   Deezer (ISRC) → MusicBrainz (MBID / ISRC / Beatport url-rels) →
 *   TrackRadar platforms → AudD findLyrics (public, no token).
 * Set79: published sitemap URLs only (set-level hints, never official playback).
 * Beatport: canonical /track/{slug}/{id} from MB / TrackRadar — never scrape.
 * AudioScout / MusicMate / TrackId: paste-only, never fetched.
 * Never invents ISRCs, never wires fan playbacks, never overwrites sourceUrl.
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
import { resolveTrackImage, sleep } from "../../thumbs/deezer";
import {
  resolveTrackMetaMusicBrainz,
  resolveTrackMetaMusicBrainzByIsrc,
} from "../../thumbs/musicbrainz";
import { canonicalSpotifyUrl, normalizeIsrc } from "../../trackMeta";
import { resolveSpotifyTrackUrl } from "./spotify";
import {
  parseTracksCsv,
  tracksNeedEnrich,
  type ExportTrackRow,
} from "../../exportTracks";
import { searchAuddLyrics } from "./audd";
import { acceptBeatportTrackUrl } from "./beatport";
import { fingerprintIdProbes } from "./fingerprintWatch";
import { catalogQueryTitle } from "./names";
import { dropPasteOnlyUrls } from "./pasteOnly";
import {
  evaluateTrackIdPin,
  isJunkTrackPin,
  loadTrackIdPins,
  mergeTrackIdPins,
  pinCoversNeed,
  saveTrackIdPins,
} from "./trackIdPins";
import { findHeldSet79Hints, type Set79Hint } from "./set79";
import {
  analyzeFingerprintOnlyWatches,
  searchTrackRadar,
  trackradarMode,
  type TrackRadarAnalyzeResult,
  type TrackRadarPlatforms,
} from "./trackradar";

export type IdentifyQueueRow = FingerprintSeedRow & {
  slug?: string;
  isrc?: string | null;
};

export type IdentifyLookupPlan = {
  knownIsrc?: string;
  needIsrc: boolean;
  useDeezer: boolean;
  useAudd: boolean;
  mbByIsrc: boolean;
};

/** Skip Deezer/AudD when the catalog row already has an ISRC — only Beatport is missing. */
export function identifyLookupPlan(row: IdentifyQueueRow): IdentifyLookupPlan {
  const knownIsrc = normalizeIsrc(row.isrc) || undefined;
  const needIsrc = !knownIsrc;
  return {
    knownIsrc,
    needIsrc,
    useDeezer: needIsrc,
    useAudd: needIsrc,
    mbByIsrc: Boolean(knownIsrc),
  };
}

export type TrackIdHit = {
  artist: string;
  title: string;
  at?: string;
  slug?: string;
  isrc?: string;
  mbid?: string;
  beatportUrl?: string;
  spotifyUrl?: string;
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
  pinned: number;
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

export function uniqueIdentifyRows<T extends FingerprintSeedRow>(
  rows: T[],
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
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

function rowKey(row: Pick<FingerprintSeedRow, "artist" | "title">): string {
  return `${row.artist.trim().toLowerCase()}::${row.title.trim().toLowerCase()}`;
}

/**
 * Held 1001 rows first (capped), then high-play catalog tracks missing ISRC.
 * Default held cap leaves room in TRACK_ID_LIMIT for catalog research.
 */
export function mergeIdentifyQueue(
  held: IdentifyQueueRow[],
  catalog: IdentifyQueueRow[],
  opts: { limit: number; heldCap?: number },
): IdentifyQueueRow[] {
  const heldCap = opts.heldCap ?? Number(process.env.TRACK_ID_HELD_LIMIT || 8);
  const heldSlice = uniqueIdentifyRows(held).slice(0, Math.max(0, heldCap));
  const seen = new Set(heldSlice.map(rowKey));
  const catalogSlice = uniqueIdentifyRows(catalog).filter((r) => {
    const key = rowKey(r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...heldSlice, ...catalogSlice].slice(0, Math.max(0, opts.limit));
}

/** High-play catalog tracks missing ISRC and/or a canonical Beatport URL. */
export async function catalogNeedIdRows(
  prisma: PrismaClient,
  limit: number,
): Promise<IdentifyQueueRow[]> {
  if (limit <= 0) return [];
  const pins = loadTrackIdPins();
  const pinBySlug = new Map(pins.map((p) => [p.slug, p]));
  const tracks = await prisma.track.findMany({
    where: {
      AND: [
        { artistName: { not: "" } },
        { title: { not: "" } },
        { OR: [{ isrc: null }, { beatportUrl: null }] },
      ],
    },
    orderBy: { plays: { _count: "desc" } },
    take: Math.max(limit * 8, limit),
    select: { slug: true, artistName: true, title: true, isrc: true, beatportUrl: true },
  });
  const candidates = tracks.filter((t) => {
    if (isJunkTrackPin({ slug: t.slug, artist: t.artistName, title: t.title })) {
      return false;
    }
    return !pinCoversNeed(pinBySlug.get(t.slug), {
      wantIsrc: !normalizeIsrc(t.isrc),
      wantBeatport: !t.beatportUrl,
    });
  });
  const picked = splitEnrichPriorities(
    candidates.map((t) => ({
      slug: t.slug,
      artist: t.artistName,
      title: t.title,
      mix: null,
      remixer: null,
      genre: null,
      plays: 0,
      isrc: t.isrc,
      beatportUrl: t.beatportUrl,
      spotifyUrl: null,
    })),
    limit,
  );
  return uniqueIdentifyRows(
    picked.map((t) => ({
      at: "0:00",
      artist: t.artist,
      title: t.title,
      slug: t.slug,
      isrc: t.isrc,
    })),
  ).slice(0, limit);
}

export function splitEnrichPriorities(
  rows: ExportTrackRow[],
  limit: number,
): ExportTrackRow[] {
  const noIsrc = rows.filter((r) => !normalizeIsrc(r.isrc));
  const noBeatport = rows.filter(
    (r) => Boolean(normalizeIsrc(r.isrc)) && !r.beatportUrl?.trim(),
  );
  const isrcBudget = Math.max(1, Math.ceil(limit * 0.6));
  return [
    ...noIsrc.slice(0, isrcBudget),
    ...noBeatport.slice(0, Math.max(0, limit - Math.min(noIsrc.length, isrcBudget))),
  ].slice(0, Math.max(0, limit));
}

const LIVE_TRACKS_CSV = "https://www.setradar.ai/exports/tracks.csv";

export function exportRowsToIdentifyQueue(
  rows: ExportTrackRow[],
  limit: number,
): IdentifyQueueRow[] {
  const pins = loadTrackIdPins();
  const pinBySlug = new Map(pins.map((p) => [p.slug, p]));
  const filtered = tracksNeedEnrich(rows).filter((r) => {
    if (isJunkTrackPin({ slug: r.slug, artist: r.artist, title: r.title })) {
      return false;
    }
    return !pinCoversNeed(pinBySlug.get(r.slug), {
      wantIsrc: !r.isrc?.trim(),
      wantBeatport: !r.beatportUrl?.trim(),
    });
  });
  return uniqueIdentifyRows(
    splitEnrichPriorities(filtered, limit).map((r) => ({
      at: "0:00",
      artist: r.artist,
      title: r.title,
      slug: r.slug,
      isrc: r.isrc,
    })),
  ).slice(0, Math.max(0, limit));
}

export async function loadNeedEnrichExportRows(
  limit: number,
): Promise<IdentifyQueueRow[]> {
  if (limit <= 0) return [];
  const fromEnv = process.env.TRACK_ID_EXPORT_PATH?.trim();
  const localPath = fromEnv || "data/track-id-export/tracks.csv";
  let text = "";
  try {
    const { readFileSync } = await import("node:fs");
    text = readFileSync(localPath, "utf8");
  } catch {
    try {
      const res = await fetch(LIVE_TRACKS_CSV, {
        headers: { Accept: "text/csv", "User-Agent": "SetRadar/0.2.213 (+https://setradar.ai; track-id enrich)" },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.ok) text = await res.text();
    } catch {
      text = "";
    }
  }
  if (!text) return [];
  return exportRowsToIdentifyQueue(parseTracksCsv(text), limit);
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
  row: IdentifyQueueRow,
  opts: {
    musicbrainz?: boolean;
    trackradar?: boolean;
    audd?: boolean;
  } = {},
): Promise<TrackIdHit | TrackIdMiss> {
  if (isBareIdRow(row.artist, row.title)) {
    return { artist: row.artist, title: row.title, at: row.at, reason: "bare id" };
  }

  const plan = identifyLookupPlan(row);
  const queryTitle = catalogQueryTitle(row.title);
  let isrc = plan.knownIsrc ?? null;
  let mbid: string | undefined;
  let beatportUrl: string | undefined;
  let spotifyUrl: string | undefined;
  let usedMb = false;
  let usedTr = false;
  let usedAudd = false;
  let platforms: TrackRadarPlatforms | undefined;
  let deezer: Awaited<ReturnType<typeof resolveTrackImage>> = null;

  const runDeezer = plan.useDeezer;
  const runAudd = Boolean(opts.audd) && plan.useAudd;
  // Have-ISRC rows only hit TrackRadar when MCP is keyed — the public
  // archive download does not yield Beatport /track url-rels.
  const runTr =
    Boolean(opts.trackradar) &&
    (plan.needIsrc || Boolean(process.env.TRACKRADAR_API_KEY || process.env.TRACKRADAR_KEY));

  const [deezerHit, trHit, auddHit] = await Promise.all([
    runDeezer
      ? resolveTrackImage(queryTitle, row.artist, { metaOnly: true })
      : Promise.resolve(null),
    runTr ? searchTrackRadar(row.artist, queryTitle) : Promise.resolve(null),
    runAudd ? searchAuddLyrics(row.artist, queryTitle) : Promise.resolve(null),
  ]);
  deezer = deezerHit;
  if (deezer?.isrc && !isrc) isrc = normalizeIsrc(deezer.isrc);
  if (trHit) {
    usedTr = true;
    platforms = trHit.platforms;
    if (!isrc && trHit.isrc) isrc = trHit.isrc;
    beatportUrl = acceptBeatportTrackUrl(trHit.beatportUrl);
  }
  if (auddHit) {
    usedAudd = true;
    platforms = mergePlatforms(platforms, auddHit.platforms);
    if (!isrc && auddHit.isrc) isrc = auddHit.isrc;
  }

  if (opts.musicbrainz) {
    const mb = isrc
      ? await resolveTrackMetaMusicBrainzByIsrc(isrc, queryTitle, row.artist)
      : await resolveTrackMetaMusicBrainz(queryTitle, row.artist);
    if (mb?.mbid) {
      usedMb = true;
      mbid = mb.mbid;
    }
    if (!beatportUrl) beatportUrl = acceptBeatportTrackUrl(mb?.beatportUrl);
    if (!spotifyUrl) spotifyUrl = canonicalSpotifyUrl(mb?.spotifyUrl) ?? undefined;
    if (!isrc && mb?.isrc) {
      const ev = evaluateIsrc(mb.isrc);
      if (ev.ok) isrc = ev.isrc ?? null;
    }
  }

  platforms = mergePlatforms(platforms);
  if (platforms?.beatport && !beatportUrl) {
    beatportUrl = acceptBeatportTrackUrl(platforms.beatport);
  }
  if (!spotifyUrl) {
    spotifyUrl = canonicalSpotifyUrl(platforms?.spotify) ?? undefined;
  }
  if (!spotifyUrl) {
    spotifyUrl =
      (await resolveSpotifyTrackUrl({
        artist: row.artist,
        title: queryTitle,
        isrc,
      })) ?? undefined;
  }

  if (!isrc && !mbid && !beatportUrl && !platforms && !spotifyUrl) {
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
    slug: row.slug,
    isrc: isrc || undefined,
    mbid,
    beatportUrl,
    spotifyUrl,
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
  const useCatalog =
    Boolean(opts.prisma) && process.env.TRACK_ID_CATALOG !== "0";
  const held = heldIdentifyJobs().flatMap((j) => j.rows);
  let catalog: IdentifyQueueRow[] = [];
  if (useCatalog) {
    try {
      catalog = await catalogNeedIdRows(opts.prisma!, Math.max(0, limit));
    } catch {
      catalog = [];
    }
  }
  if (catalog.length === 0 && process.env.TRACK_ID_EXPORT !== "0") {
    catalog = await loadNeedEnrichExportRows(Math.max(0, limit));
  }
  const slice = mergeIdentifyQueue(held, catalog, { limit });
  const hits: TrackIdHit[] = [];
  const misses: TrackIdMiss[] = [];
  const delayMs = Number(process.env.TRACK_ID_DELAY_MS || 0);

  for (const row of slice) {
    const result = await identifySeedRow(row, { musicbrainz, trackradar, audd });
    if ("reason" in result) misses.push(result);
    else hits.push({ ...result, slug: result.slug ?? row.slug });
    if (delayMs > 0) await sleep(delayMs);
  }

  const trackradarAnalyzes = await analyzeFingerprintOnlyWatches();
  const set79Hints = set79
    ? await findHeldSet79Hints(heldIdentifyJobs().map((j) => j.seed))
    : [];

  let applied = 0;
  if (opts.apply && opts.prisma) {
    applied = await applyTrackIdHits(opts.prisma, hits);
  }
  const pinned = upsertPinsFromHits(hits);

  const report: TrackIdReport = {
    generatedAt: new Date().toISOString(),
    note: "Verified Deezer / MusicBrainz / TrackRadar / AudD IDs from held 1001 seeds, then high-play catalog tracks missing ISRC or Beatport. Beatport only via MB url-rels or TrackRadar canonical /track URLs (never scrape). Set79 is sitemap-only. AudioScout / MusicMate / TrackId stay paste-only. Fan playbacks stay unwired.",
    scanned: slice.length,
    hits,
    misses,
    idGaps: fingerprintIdProbes(),
    trackradarMode: trackradarMode(),
    trackradarAnalyzes,
    set79Hints,
    applied,
    pinned,
  };
  writeReport("track-id-research.json", report);
  return report;
}

export function upsertPinsFromHits(hits: TrackIdHit[]): number {
  const incoming = [];
  for (const hit of hits) {
    if (!hit.slug || (!hit.isrc && !hit.beatportUrl && !hit.spotifyUrl)) continue;
    const ev = evaluateTrackIdPin(
      {
        slug: hit.slug,
        artist: hit.artist,
        title: hit.title,
        isrc: hit.isrc,
        beatportUrl: hit.beatportUrl,
        spotifyUrl: hit.spotifyUrl,
        source: hit.source,
      },
      {
        artist: hit.artist,
        title: hit.title,
        isrc: hit.isrc ?? null,
      },
    );
    if (ev.ok && ev.pin) incoming.push(ev.pin);
  }
  if (!incoming.length) return 0;
  const merged = mergeTrackIdPins(loadTrackIdPins(), incoming);
  saveTrackIdPins(merged);
  return incoming.length;
}

export async function applyTrackIdHits(
  prisma: PrismaClient,
  hits: TrackIdHit[],
): Promise<number> {
  let n = 0;
  for (const hit of hits) {
    if (!hit.isrc && !hit.beatportUrl && !hit.spotifyUrl) continue;
    const tracks = await prisma.track.findMany({
      where: {
        artistName: hit.artist,
        title: hit.title,
      },
      select: { id: true, isrc: true, beatportUrl: true, spotifyUrl: true },
    });
    for (const t of tracks) {
      const data: { isrc?: string; beatportUrl?: string; spotifyUrl?: string } = {};
      if (hit.isrc && !t.isrc) data.isrc = hit.isrc;
      if (hit.beatportUrl && !t.beatportUrl) data.beatportUrl = hit.beatportUrl;
      if (hit.spotifyUrl && !t.spotifyUrl) data.spotifyUrl = hit.spotifyUrl;
      if (!Object.keys(data).length) continue;
      await prisma.track.update({ where: { id: t.id }, data });
      n += 1;
    }
  }
  return n;
}
