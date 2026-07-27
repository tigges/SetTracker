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
  const out: ScTrack[] = [];
  const seen = new Set<number>();
  let path: string | null =
    `/users/${userId}/tracks?limit=${Math.min(50, Math.max(limit, 1))}&linked_partitioning=1`;
  while (path && out.length < limit) {
    const data: ScCollection<ScTrack> = await scGet<ScCollection<ScTrack>>(path);
    const batch = data.collection ?? [];
    if (!batch.length) break;
    for (const t of batch) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
      if (out.length >= limit) break;
    }
    const next = data.next_href?.trim() || null;
    path = next;
    if (path) await sleep(100);
  }
  return out.slice(0, limit);
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

export type ScPlaylist = {
  id: number;
  kind?: string;
  title?: string;
  permalink_url?: string;
  track_count?: number;
  tracks?: Array<ScTrack | { id: number }>;
};

/** Resolve a playlist URL / numeric id via api-v2. */
export async function resolvePlaylist(
  playlistUrlOrId: string,
): Promise<ScPlaylist> {
  const raw = playlistUrlOrId.trim();
  if (/^\d+$/.test(raw)) {
    return scGet<ScPlaylist>(`/playlists/${raw}?representation=full`);
  }
  const url = raw.startsWith("http")
    ? raw
    : `https://soundcloud.com/${raw.replace(/^\//, "")}`;
  const resolved = await scGet<ScPlaylist>(
    `/resolve?url=${encodeURIComponent(url)}`,
  );
  if (resolved.kind && resolved.kind !== "playlist") {
    throw new Error(`SoundCloud resolve is ${resolved.kind}, not playlist`);
  }
  return resolved;
}

/** Batch-hydrate track stubs (playlist entries often omit title/duration). */
export async function fetchTracksByIds(ids: number[]): Promise<ScTrack[]> {
  const unique = [...new Set(ids.filter((n) => Number.isFinite(n) && n > 0))];
  const out: ScTrack[] = [];
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    if (batch.length === 0) continue;
    const data = await scGet<ScTrack[] | ScCollection<ScTrack>>(
      `/tracks?ids=${batch.join(",")}`,
    );
    const list = Array.isArray(data) ? data : (data.collection ?? []);
    out.push(...list);
    if (i + 50 < unique.length) await sleep(80);
  }
  return out;
}

/**
 * Fetch playlist tracks (hydrated). Caps at `limit` in playlist order.
 */
export async function fetchPlaylistTracks(
  playlistUrlOrId: string,
  limit = 80,
): Promise<ScTrack[]> {
  const pl = await resolvePlaylist(playlistUrlOrId);
  const stubs = pl.tracks ?? [];
  const orderedIds = stubs
    .map((t) => ("id" in t ? t.id : 0))
    .filter((id) => id > 0)
    .slice(0, limit);

  // Prefer already-hydrated rows; fill gaps via /tracks?ids=
  const byId = new Map<number, ScTrack>();
  for (const t of stubs) {
    if ("title" in t && t.title && "id" in t) {
      byId.set(t.id, t as ScTrack);
    }
  }
  const missing = orderedIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    const hydrated = await fetchTracksByIds(missing);
    for (const t of hydrated) byId.set(t.id, t);
  }

  return orderedIds.map((id) => byId.get(id)).filter(Boolean) as ScTrack[];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
