/**
 * Spotify Client Credentials — fill-null Track.spotifyUrl.
 * Canonical open.spotify.com/track/{22} only. Search URL stays fallback.
 * Same verify-then-write as ISRC: name (or ISRC) must match before write.
 *
 *   SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET
 *   SPOTIFY=0 skips
 */

import {
  canonicalSpotifyUrl,
  normalizeIsrc,
} from "../../trackMeta";
import { namesClose, primaryArtist, titleRank } from "./names";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";

export function spotifyClientId(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const raw = (env.SPOTIFY_CLIENT_ID || env.SPOTIFY_ID || "").trim();
  return raw || undefined;
}

export function spotifyClientSecret(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const raw = (env.SPOTIFY_CLIENT_SECRET || env.SPOTIFY_SECRET || "").trim();
  return raw || undefined;
}

export function spotifyConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.SPOTIFY === "0") return false;
  return Boolean(spotifyClientId(env) && spotifyClientSecret(env));
}

type SpotifyTrack = {
  id?: string;
  name?: string;
  external_ids?: { isrc?: string };
  external_urls?: { spotify?: string };
  artists?: { name?: string }[];
};

type TokenCache = { token: string; exp: number };
let tokenCache: TokenCache | null = null;

export async function spotifyAccessToken(): Promise<string | null> {
  if (!spotifyConfigured()) return null;
  if (tokenCache && tokenCache.exp > Date.now() + 10_000) return tokenCache.token;
  const id = spotifyClientId()!;
  const secret = spotifyClientSecret()!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) return null;
    tokenCache = {
      token: json.access_token,
      exp: Date.now() + Math.max(30, Number(json.expires_in || 3600)) * 1000,
    };
    return tokenCache.token;
  } catch {
    return null;
  }
}

export function evaluateSpotifyHit(
  want: { artist: string; title: string; isrc?: string | null },
  got: { artist?: string; title?: string; isrc?: string | null },
): boolean {
  const wantIsrc = normalizeIsrc(want.isrc);
  const gotIsrc = normalizeIsrc(got.isrc);
  if (wantIsrc && gotIsrc) return wantIsrc === gotIsrc;
  if (!got.artist || !got.title) return false;
  if (titleRank(want.title, got.title) < 1) return false;
  const primary = primaryArtist(want.artist);
  return namesClose(primary, got.artist) || namesClose(want.artist, got.artist);
}

function trackFromSpotify(raw: SpotifyTrack | undefined): {
  url: string;
  artist: string;
  title: string;
  isrc?: string;
} | null {
  if (!raw?.name) return null;
  const url =
    canonicalSpotifyUrl(raw.external_urls?.spotify) ||
    (raw.id ? canonicalSpotifyUrl(`https://open.spotify.com/track/${raw.id}`) : null);
  if (!url) return null;
  const artist = (raw.artists ?? [])
    .map((a) => String(a.name || "").trim())
    .filter(Boolean)
    .join(", ");
  if (!artist) return null;
  return {
    url,
    artist,
    title: raw.name.trim(),
    isrc: normalizeIsrc(raw.external_ids?.isrc) || undefined,
  };
}

async function searchSpotify(
  token: string,
  q: string,
): Promise<SpotifyTrack[]> {
  const url = `${SEARCH_URL}?type=track&limit=5&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { tracks?: { items?: SpotifyTrack[] } };
  return json.tracks?.items ?? [];
}

export type SpotifyTrackHit = {
  url: string;
  isrc?: string;
};

/** Verify-then-return a canonical /track/{22} plus ISRC when Spotify has one. */
export async function resolveSpotifyTrack(want: {
  artist: string;
  title: string;
  isrc?: string | null;
}): Promise<SpotifyTrackHit | null> {
  if (!spotifyConfigured()) return null;
  const token = await spotifyAccessToken();
  if (!token) return null;
  const isrc = normalizeIsrc(want.isrc);
  const queries = [
    ...(isrc ? [`isrc:${isrc}`] : []),
    `track:${want.title} artist:${primaryArtist(want.artist)}`,
  ];
  for (const q of queries) {
    try {
      const items = await searchSpotify(token, q);
      for (const item of items) {
        const parsed = trackFromSpotify(item);
        if (!parsed) continue;
        if (
          evaluateSpotifyHit(want, {
            artist: parsed.artist,
            title: parsed.title,
            isrc: parsed.isrc,
          })
        ) {
          return {
            url: parsed.url,
            ...(parsed.isrc ? { isrc: parsed.isrc } : {}),
          };
        }
      }
    } catch {
      /* next query */
    }
  }
  return null;
}

/** Verify-then-return a canonical /track/{22}. Null when unsure. */
export async function resolveSpotifyTrackUrl(want: {
  artist: string;
  title: string;
  isrc?: string | null;
}): Promise<string | null> {
  const hit = await resolveSpotifyTrack(want);
  return hit?.url ?? null;
}
