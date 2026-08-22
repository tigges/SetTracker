/**
 * AudD (https://www.audd.io) — official API only.
 *
 * findLyrics is public (no token) and returns artist/title + media links.
 * Audio recognize / enterprise mix analyze needs AUDD_API_TOKEN and is
 * gated by AUDD_ANALYZE=1. Never wires the URL as official playback.
 */

import { normalizeIsrc } from "../../trackMeta";
import { namesClose, primaryArtist, titleRank } from "./names";
import type { TrackRadarPlatforms, TrackRadarTrack } from "./trackradar";

const AUDD = "https://api.audd.io";

export function auddApiToken(): string | undefined {
  const raw = (process.env.AUDD_API_TOKEN || process.env.AUDD_API_KEY || "").trim();
  return raw || undefined;
}

type AuddLyricRow = {
  artist?: string;
  title?: string;
  full_title?: string;
  media?: string;
  song_id?: string;
};

function platformsFromAuddMedia(raw: string | undefined): TrackRadarPlatforms {
  if (!raw) return {};
  try {
    const rows = JSON.parse(raw) as { provider?: string; url?: string }[];
    const out: TrackRadarPlatforms = {};
    for (const r of rows) {
      const url = r.url;
      if (!url || !/^https?:\/\//i.test(url)) continue;
      const p = (r.provider || "").toLowerCase();
      if (p === "spotify") out.spotify = url.replace("http://", "https://");
      if (p === "youtube") out.youtube = url.replace("http://", "https://");
      if (p === "apple" || p === "apple_music") out.appleMusic = url;
      if (p === "deezer") continue;
    }
    return out;
  } catch {
    return {};
  }
}

export function parseAuddLyricRow(raw: AuddLyricRow): TrackRadarTrack | null {
  const artist = String(raw.artist || "").trim();
  const title = String(raw.title || "").trim();
  if (!artist || !title) return null;
  return {
    artist,
    title,
    platforms: platformsFromAuddMedia(raw.media),
  };
}

export function evaluateAuddHit(
  wantArtist: string,
  wantTitle: string,
  got: { artist?: string; title?: string },
): boolean {
  if (!got.artist || !got.title) return false;
  if (titleRank(wantTitle, got.title) < 1) return false;
  const primary = primaryArtist(wantArtist);
  return namesClose(primary, got.artist) || namesClose(wantArtist, got.artist);
}

/** Public lyrics search — no token. Name-match before keeping links. */
export async function searchAuddLyrics(
  artist: string,
  title: string,
): Promise<TrackRadarTrack | null> {
  if (process.env.AUDD === "0") return null;
  const q = encodeURIComponent(`${artist} ${title}`.trim());
  try {
    const res = await fetch(`${AUDD}/findLyrics/?q=${q}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: AuddLyricRow[] };
    for (const row of json.result ?? []) {
      const parsed = parseAuddLyricRow(row);
      if (parsed && evaluateAuddHit(artist, title, parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function trackFromAuddRecognize(r: {
  artist?: string;
  title?: string;
  isrc?: string;
  spotify?: {
    external_urls?: { spotify?: string };
    external_ids?: { isrc?: string };
  };
  apple_music?: { url?: string; isrc?: string };
} | null | undefined): TrackRadarTrack | null {
  if (!r?.artist || !r.title) return null;
  const isrc =
    normalizeIsrc(r.isrc) ||
    normalizeIsrc(r.apple_music?.isrc) ||
    normalizeIsrc(r.spotify?.external_ids?.isrc);
  return {
    artist: r.artist,
    title: r.title,
    isrc: isrc || undefined,
    platforms: {
      spotify: r.spotify?.external_urls?.spotify,
      appleMusic: r.apple_music?.url,
    },
  };
}

/** Audio recognize from a clip buffer — no-op without AUDD_API_TOKEN. */
export async function recognizeAuddClip(
  clip: Buffer,
): Promise<TrackRadarTrack | null> {
  const token = auddApiToken();
  if (!token || process.env.AUDD_ANALYZE !== "1") return null;
  try {
    const form = new FormData();
    form.append("api_token", token);
    form.append(
      "file",
      new Blob([new Uint8Array(clip)], { type: "audio/mpeg" }),
      "clip.mp3",
    );
    form.append("return", "apple_music,spotify,deezer,musicbrainz");
    const res = await fetch(`${AUDD}/`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: Parameters<typeof trackFromAuddRecognize>[0];
    };
    return trackFromAuddRecognize(json.result);
  } catch {
    return null;
  }
}

/** Audio recognize — no-op without AUDD_API_TOKEN. */
export async function recognizeAuddUrl(
  url: string,
): Promise<TrackRadarTrack | null> {
  const token = auddApiToken();
  if (!token || process.env.AUDD_ANALYZE !== "1") return null;
  try {
    const body = new URLSearchParams({
      api_token: token,
      url,
      return: "apple_music,spotify,deezer,musicbrainz",
    });
    const res = await fetch(`${AUDD}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: Parameters<typeof trackFromAuddRecognize>[0];
    };
    return trackFromAuddRecognize(json.result);
  } catch {
    return null;
  }
}
