/**
 * Minimal hearthis.at api-v2 client (public reads, no auth).
 * Docs: https://hearthis.at/api-v2/
 */

const UA = "SetRadar/0.1 (+https://setradar.ai; hearthis ingest)";
const API = "https://api-v2.hearthis.at";

export type HtUser = {
  id?: string | number;
  username?: string;
  permalink?: string;
  permalink_url?: string;
  avatar_url?: string;
  avatar_url_retina?: string;
  thumb_url?: string;
};

export type HtTrack = {
  id: string | number;
  title?: string;
  description?: string | null;
  duration?: string | number; // seconds
  genre?: string | null;
  permalink?: string;
  permalink_url?: string;
  created_at?: string;
  release_date?: string;
  thumb?: string | null;
  artwork_url?: string | null;
  artwork_url_retina?: string | null;
  playback_count?: string | number;
  favoritings_count?: string | number;
  comment_count?: string | number;
  user?: HtUser;
};

export type HtComment = {
  id?: string | number;
  comment?: string;
  /** Offset into the mix in seconds (hearthis field). */
  comment_position?: string | number | null;
  timestamp?: string | null;
  user?: HtUser;
};

async function htGet<T>(pathAndQuery: string): Promise<T> {
  const url = pathAndQuery.startsWith("http")
    ? pathAndQuery
    : `${API}${pathAndQuery}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`hearthis ${url} HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchCategoryTracks(
  categoryId: string,
  page = 1,
  count = 20,
): Promise<HtTrack[]> {
  const data = await htGet<HtTrack[] | { data?: HtTrack[] }>(
    `/categories/${encodeURIComponent(categoryId)}/?page=${page}&count=${count}`,
  );
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function fetchUser(userPermalink: string): Promise<HtUser> {
  return htGet<HtUser>(`/${encodeURIComponent(userPermalink)}/`);
}

export async function fetchTrackDetail(
  userPermalink: string,
  trackPermalink: string,
): Promise<HtTrack> {
  return htGet<HtTrack>(
    `/${encodeURIComponent(userPermalink)}/${encodeURIComponent(trackPermalink)}/`,
  );
}

/** Prefer retina → standard → thumb. */
export function pickHearthisImage(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const c of candidates) {
    const url = c?.trim();
    if (url && /^https?:\/\//i.test(url)) return url;
  }
  return null;
}

/** Parse `https://hearthis.at/{user}/{track}/` → permalinks. */
export function parseHearthisUrl(
  url: string,
): { user: string; track?: string } | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)hearthis\.at$/i.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (!parts[0] || parts[0] === "embed" || parts[0] === "api-v2") return null;
    return { user: parts[0], track: parts[1] };
  } catch {
    return null;
  }
}

export async function fetchTrackComments(
  userPermalink: string,
  trackPermalink: string,
  page = 1,
  count = 50,
): Promise<HtComment[]> {
  const data = await htGet<HtComment[] | { data?: HtComment[] }>(
    `/${encodeURIComponent(userPermalink)}/${encodeURIComponent(trackPermalink)}/comments/?page=${page}&count=${count}`,
  );
  return Array.isArray(data) ? data : (data.data ?? []);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function asInt(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}
