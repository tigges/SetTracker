/**
 * MusicBrainz recording lookup — fills sparse label / releaseDate / duration
 * and canonical Beatport /track URLs from url-rels.
 * Respects MB rate limits via caller sleep; requires a descriptive User-Agent.
 */

import { canonicalBeatportUrl } from "../trackMeta";
import { namesClose, primaryArtist, titleRank } from "../ingest/identify/names";

const UA =
  "SetRadar/0.2.7 (https://setradar.ai; track metadata; contact via github.com/tigges/SetTracker)";

export type MusicBrainzTrackMeta = {
  durationSec?: number | null;
  releaseDate?: string | null; // ISO date yyyy-mm-dd
  labelName?: string | null;
  beatportUrl?: string | null;
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

export async function resolveTrackMetaMusicBrainz(
  title: string,
  artistName: string,
): Promise<MusicBrainzTrackMeta | null> {
  const primary = primaryArtist(artistName);
  const q = encodeURIComponent(
    `recording:"${title.replace(/"/g, "")}" AND artist:"${primary.replace(/"/g, "")}"`,
  );
  const url = `https://musicbrainz.org/ws/2/recording/?query=${q}&fmt=json&limit=8`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { recordings?: MbRecording[] };
    const row = pickBestRecording(title, artistName, json.recordings ?? []);
    if (!row?.id) return null;

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

    const extra = await lookupRecordingIds(row.id);
    const beatportUrl =
      beatportUrlFromMbRelations(row.relations) || extra.beatportUrl;
    const isrc =
      row.isrcs?.find((x) => /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/i.test(x)) ||
      extra.isrc;

    return {
      durationSec,
      releaseDate,
      labelName,
      beatportUrl,
      mbid: row.id,
      isrc: isrc ? isrc.toUpperCase() : null,
    };
  } catch {
    /* ignore */
  }
  return null;
}

async function lookupRecordingIds(mbid: string): Promise<{
  beatportUrl: string | null;
  isrc: string | null;
}> {
  const url = `https://musicbrainz.org/ws/2/recording/${encodeURIComponent(mbid)}?inc=url-rels+isrcs&fmt=json`;
  try {
    await new Promise((r) => setTimeout(r, 1100));
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { beatportUrl: null, isrc: null };
    const json = (await res.json()) as {
      relations?: MbUrlRel[];
      isrcs?: string[];
    };
    const isrc = json.isrcs?.find((x) =>
      /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/i.test(x),
    );
    return {
      beatportUrl: beatportUrlFromMbRelations(json.relations),
      isrc: isrc ? isrc.toUpperCase() : null,
    };
  } catch {
    return { beatportUrl: null, isrc: null };
  }
}
