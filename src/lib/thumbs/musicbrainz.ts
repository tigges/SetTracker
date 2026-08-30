/**
 * MusicBrainz recording lookup — fills sparse label / releaseDate / duration
 * and canonical Beatport /track URLs from url-rels.
 * Respects MB rate limits via caller sleep; requires a descriptive User-Agent.
 */

import {
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  normalizeIsrc,
} from "../trackMeta";
import { namesClose, primaryArtist, titleRank } from "../ingest/identify/names";
import { sleep } from "./deezer";

const UA =
  "SetRadar/0.2.7 (https://setradar.ai; track metadata; contact via github.com/tigges/SetTracker)";

export type MusicBrainzTrackMeta = {
  durationSec?: number | null;
  releaseDate?: string | null; // ISO date yyyy-mm-dd
  labelName?: string | null;
  beatportUrl?: string | null;
  spotifyUrl?: string | null;
  mbid?: string | null;
  isrc?: string | null;
};

type MbUrlRel = {
  type?: string;
  url?: { resource?: string };
};

type MbRecording = {
  id?: string;
  title?: string;
  length?: number; // ms
  isrcs?: string[];
  releases?: {
    id?: string;
    date?: string;
    title?: string;
    "label-info"?: { label?: { name?: string } }[];
  }[];
  "artist-credit"?: { name?: string; artist?: { name?: string } }[];
  relations?: MbUrlRel[];
};

/** Prefer exact studio titles over remix/bootleg recordings. */
export function pickBestRecording(
  title: string,
  artistName: string,
  recordings: MbRecording[],
): MbRecording | null {
  const primary = primaryArtist(artistName);
  const ranked = recordings
    .map((row) => {
      const credit =
        row["artist-credit"]?.[0]?.name ??
        row["artist-credit"]?.[0]?.artist?.name ??
        "";
      const artistOk =
        !credit ||
        namesClose(credit, primary) ||
        namesClose(credit, artistName);
      const rank = row.title && artistOk ? titleRank(title, row.title) : 0;
      return { row, rank };
    })
    .filter((x) => x.rank > 0)
    .sort((a, b) => b.rank - a.rank);
  return ranked[0]?.row ?? null;
}

/** Pull the first canonical Beatport track URL from MusicBrainz url-rels. */
export function beatportUrlFromMbRelations(
  relations: MbUrlRel[] | null | undefined,
): string | null {
  for (const rel of relations ?? []) {
    const url = canonicalBeatportUrl(rel.url?.resource);
    if (url) return url;
  }
  return null;
}

/** Canonical open.spotify.com/track/{22} from MusicBrainz url-rels. */
export function spotifyUrlFromMbRelations(
  relations: MbUrlRel[] | null | undefined,
): string | null {
  for (const rel of relations ?? []) {
    const url = canonicalSpotifyUrl(rel.url?.resource);
    if (url) return url;
  }
  return null;
}

let lastMbAt = 0;

async function mbGet<T>(url: string): Promise<T | null> {
  const wait = 1100 - (Date.now() - lastMbAt);
  if (wait > 0) await sleep(wait);
  lastMbAt = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function metaFromRecording(
  row: MbRecording,
  extra: { beatportUrl: string | null; isrc: string | null; spotifyUrl?: string | null },
): MusicBrainzTrackMeta {
  const release = row.releases?.[0];
  const labelName =
    release?.["label-info"]?.find((li) => li.label?.name)?.label?.name ??
    null;
  const durationSec =
    typeof row.length === "number" && row.length > 0
      ? Math.round(row.length / 1000)
      : null;
  const releaseDate = release?.date && /^\d{4}/.test(release.date)
    ? release.date.length === 4
      ? `${release.date}-01-01`
      : release.date.length === 7
        ? `${release.date}-01`
        : release.date
    : null;
  const beatportUrl =
    beatportUrlFromMbRelations(row.relations) || extra.beatportUrl;
  const spotifyUrl =
    spotifyUrlFromMbRelations(row.relations) || extra.spotifyUrl || null;
  const isrc =
    row.isrcs?.find((x) => /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/i.test(x)) ||
    extra.isrc;
  return {
    durationSec,
    releaseDate,
    labelName,
    beatportUrl,
    spotifyUrl,
    mbid: row.id ?? null,
    isrc: isrc ? isrc.toUpperCase() : null,
  };
}

/** Best recording first, then remaining same-ISRC siblings (deduped). */
export function mbRecordingLookupOrder(
  recordings: MbRecording[],
  title?: string,
  artistName?: string,
): MbRecording[] {
  const seen = new Set<string>();
  const out: MbRecording[] = [];
  const best =
    title && artistName
      ? pickBestRecording(title, artistName, recordings)
      : null;
  for (const row of [best, ...recordings]) {
    if (!row?.id || seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

const MB_ISRC_RECORDING_LOOKUPS = 2; // best + one sibling
const MB_RELEASE_LOOKUPS = 2; // first release often has no /track rel

/** First canonical Beatport / Spotify already on these recordings' url-rels. */
export function storeLinksFromMbRecordings(
  recordings: Array<{ relations?: MbUrlRel[] }>,
): { beatportUrl: string | null; spotifyUrl: string | null } {
  let beatportUrl: string | null = null;
  let spotifyUrl: string | null = null;
  for (const row of recordings) {
    beatportUrl ||= beatportUrlFromMbRelations(row.relations);
    spotifyUrl ||= spotifyUrlFromMbRelations(row.relations);
    if (beatportUrl && spotifyUrl) break;
  }
  return { beatportUrl, spotifyUrl };
}

function mergeReleaseIds(into: string[], extra: string[]): string[] {
  const seen = new Set(into);
  for (const id of extra) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    into.push(id);
  }
  return into;
}

async function fillReleaseStoreLinks(
  extra: { beatportUrl: string | null; spotifyUrl: string | null },
  releaseIds: string[],
): Promise<void> {
  if (extra.beatportUrl) return;
  for (const id of releaseIds.slice(0, MB_RELEASE_LOOKUPS)) {
    const rel = await lookupReleaseStoreLinks(id);
    extra.beatportUrl ||= rel.beatportUrl;
    extra.spotifyUrl ||= rel.spotifyUrl;
    if (extra.beatportUrl) return;
  }
}

/** Exact ISRC → recording(s) → Beatport /track url-rel (never scrape). */
export async function resolveTrackMetaMusicBrainzByIsrc(
  isrc: string,
  title?: string,
  artistName?: string,
): Promise<MusicBrainzTrackMeta | null> {
  const code = normalizeIsrc(isrc);
  if (!code) return null;
  const json = await mbGet<{ recordings?: MbRecording[] }>(
    `https://musicbrainz.org/ws/2/isrc/${encodeURIComponent(code)}?inc=url-rels+releases&fmt=json`,
  );
  const order = mbRecordingLookupOrder(json?.recordings ?? [], title, artistName);
  const primary = order[0];
  if (!primary?.id) return null;
  const fromIsrc = storeLinksFromMbRecordings(order);
  const extra = {
    beatportUrl: fromIsrc.beatportUrl,
    isrc: code,
    spotifyUrl: fromIsrc.spotifyUrl,
  };
  let releaseIds: string[] = [];
  for (const rec of order) {
    releaseIds = mergeReleaseIds(
      releaseIds,
      (rec.releases ?? []).map((r) => r.id ?? "").filter(Boolean),
    );
  }
  if (extra.beatportUrl && extra.spotifyUrl) {
    return metaFromRecording(primary, extra);
  }
  for (const rec of order.slice(0, MB_ISRC_RECORDING_LOOKUPS)) {
    if (!rec.id) continue;
    const ids = await lookupRecordingIds(rec.id);
    extra.beatportUrl ||= ids.beatportUrl;
    extra.spotifyUrl ||= ids.spotifyUrl;
    extra.isrc ||= ids.isrc;
    releaseIds = mergeReleaseIds(releaseIds, ids.releaseIds);
    if (extra.beatportUrl && extra.spotifyUrl) {
      return metaFromRecording(primary, extra);
    }
  }
  await fillReleaseStoreLinks(extra, releaseIds);
  return metaFromRecording(primary, extra);
}

/** Prefer ISRC url-rels when the catalog already has a code (free; no scrape). */
export async function resolveTrackMetaMusicBrainzPreferred(
  title: string,
  artistName: string,
  isrc?: string | null,
): Promise<MusicBrainzTrackMeta | null> {
  const code = normalizeIsrc(isrc);
  if (code) return resolveTrackMetaMusicBrainzByIsrc(code, title, artistName);
  return resolveTrackMetaMusicBrainz(title, artistName);
}

export async function resolveTrackMetaMusicBrainz(
  title: string,
  artistName: string,
): Promise<MusicBrainzTrackMeta | null> {
  const primary = primaryArtist(artistName);
  const q = encodeURIComponent(
    `recording:"${title.replace(/"/g, "")}" AND artist:"${primary.replace(/"/g, "")}"`,
  );
  const url = `https://musicbrainz.org/ws/2/recording/?query=${q}&fmt=json&limit=8`;
  const json = await mbGet<{ recordings?: MbRecording[] }>(url);
  const row = pickBestRecording(title, artistName, json?.recordings ?? []);
  if (!row?.id) return null;
  const extra = await lookupRecordingIds(row.id);
  await fillReleaseStoreLinks(extra, extra.releaseIds);
  return metaFromRecording(row, extra);
}

async function lookupReleaseStoreLinks(releaseId: string): Promise<{
  beatportUrl: string | null;
  spotifyUrl: string | null;
}> {
  const url = `https://musicbrainz.org/ws/2/release/${encodeURIComponent(releaseId)}?inc=url-rels&fmt=json`;
  const json = await mbGet<{ relations?: MbUrlRel[] }>(url);
  if (!json) return { beatportUrl: null, spotifyUrl: null };
  return {
    // canonicalBeatportUrl already drops /release/… pages.
    beatportUrl: beatportUrlFromMbRelations(json.relations),
    spotifyUrl: spotifyUrlFromMbRelations(json.relations),
  };
}

async function lookupRecordingIds(mbid: string): Promise<{
  beatportUrl: string | null;
  isrc: string | null;
  spotifyUrl: string | null;
  releaseIds: string[];
}> {
  const url = `https://musicbrainz.org/ws/2/recording/${encodeURIComponent(mbid)}?inc=url-rels+isrcs+releases&fmt=json`;
  const json = await mbGet<{
    relations?: MbUrlRel[];
    isrcs?: string[];
    releases?: { id?: string }[];
  }>(url);
  if (!json) {
    return { beatportUrl: null, isrc: null, spotifyUrl: null, releaseIds: [] };
  }
  const isrc = json.isrcs?.find((x) =>
    /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/i.test(x),
  );
  return {
    beatportUrl: beatportUrlFromMbRelations(json.relations),
    isrc: isrc ? isrc.toUpperCase() : null,
    spotifyUrl: spotifyUrlFromMbRelations(json.relations),
    releaseIds: (json.releases ?? [])
      .map((r) => r.id)
      .filter((id): id is string => Boolean(id)),
  };
}
