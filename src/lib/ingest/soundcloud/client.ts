/**
 * Minimal SoundCloud api-v2 client.
 *
 * Auth: anonymous `client_id` discovered from SoundCloud's public page hydration
 * (`__sc_hydration` → `apiClient.id`), or `SOUNDCLOUD_CLIENT_ID` env override.
 * No user OAuth required for public track/comment reads.
 */

const UA = "SetRadar/0.1 (+https://setradar.ai; soundcloud ingest)";
const API = "https://api-v2.soundcloud.com";

let cachedClientId: string | null = null;

export async function getSoundCloudClientId(): Promise<string> {
  if (process.env.SOUNDCLOUD_CLIENT_ID) return process.env.SOUNDCLOUD_CLIENT_ID;
  if (cachedClientId) return cachedClientId;

  const res = await fetch("https://soundcloud.com", {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`SoundCloud home HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/__sc_hydration\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error("SoundCloud hydration blob not found");
  const hydration = JSON.parse(m[1]) as { hydratable?: string; data?: { id?: string } }[];
  const apiClient = hydration.find((h) => h.hydratable === "apiClient");
  const id = apiClient?.data?.id;
  if (!id) throw new Error("SoundCloud apiClient.id missing from hydration");
  cachedClientId = id;
  return id;
}

export async function scGet<T>(
  pathAndQuery: string,
  init?: RequestInit,
): Promise<T> {
  const clientId = await getSoundCloudClientId();
  const url = new URL(
    pathAndQuery.startsWith("http") ? pathAndQuery : `${API}${pathAndQuery}`,
  );
  if (!url.searchParams.has("client_id")) {
    url.searchParams.set("client_id", clientId);
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    signal: init?.signal ?? AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`SoundCloud ${url.pathname} HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export type ScUser = {
  id: number;
  username?: string;
  permalink?: string;
  avatar_url?: string;
};

export type ScTrack = {
  id: number;
  title: string;
  description?: string | null;
  duration?: number; // ms
  full_duration?: number; // ms
  created_at?: string;
  display_date?: string;
  permalink?: string;
  permalink_url?: string;
  genre?: string | null;
  artwork_url?: string | null;
  user?: ScUser;
  comment_count?: number;
};

export type ScComment = {
  id?: number;
  body?: string;
  timestamp?: number | null; // ms from start
  created_at?: string;
};

export type ScCollection<T> = {
  collection?: T[];
  next_href?: string | null;
};

export async function resolveUser(permalinkOrUrl: string): Promise<ScUser> {
  const url = permalinkOrUrl.startsWith("http")
    ? permalinkOrUrl
    : `https://soundcloud.com/${permalinkOrUrl.replace(/^\//, "")}`;
  return scGet<ScUser>(`/resolve?url=${encodeURIComponent(url)}`);
}

export async function fetchUserTracks(
  userId: number,
  limit = 20,
): Promise<ScTrack[]> {
  const data = await scGet<ScCollection<ScTrack>>(
    `/users/${userId}/tracks?limit=${limit}&linked_partitioning=1`,
  );
  return data.collection ?? [];
}

export async function fetchTrackComments(
  trackId: number,
  limit = 100,
): Promise<ScComment[]> {
  const data = await scGet<ScCollection<ScComment>>(
    `/tracks/${trackId}/comments?threaded=0&limit=${limit}&linked_partitioning=1`,
  );
  return data.collection ?? [];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
