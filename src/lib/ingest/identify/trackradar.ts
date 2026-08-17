/**
 * TrackRadar (https://trackradar.ai) — identify tracks / platform IDs.
 *
 * Public archive: GET /api/tracklists (no key).
 * Named lookup: MCP search_track (free, needs TRACKRADAR_API_KEY).
 * Mix analysis: POST /api/v2/analyze/url or MCP analyze_social_post
 *   (quota; long mixes take minutes). Never wires the URL as Relive.
 */

import { canonicalBeatportUrl, normalizeIsrc } from "../../trackMeta";
import { FINGERPRINT_ONLY_WATCH } from "./fingerprintWatch";

export const TRACKRADAR_ORIGIN = "https://trackradar.ai";
export const TRACKRADAR_MCP = `${TRACKRADAR_ORIGIN}/api/mcp`;

export type TrackRadarPlatforms = {
  spotify?: string;
  appleMusic?: string;
  bandcamp?: string;
  discogs?: string;
  beatport?: string;
  soundcloud?: string;
  youtube?: string;
};

export type TrackRadarTrack = {
  artist: string;
  title: string;
  isrc?: string;
  beatportUrl?: string;
  platforms: TrackRadarPlatforms;
  confidence?: string;
};

export type TrackRadarPublishedSet = {
  slug: string;
  setTitle: string;
  artistName: string;
  sourceUrl?: string;
  trackCount?: number;
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function namesClose(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function trackradarApiKey(): string | undefined {
  const raw = (
    process.env.TRACKRADAR_API_KEY ||
    process.env.TRACKRADAR_KEY ||
    ""
  ).trim();
  return raw || undefined;
}

export function evaluateTrackRadarHit(
  wantArtist: string,
  wantTitle: string,
  got: { artist?: string | null; title?: string | null },
): { ok: boolean; reason: string } {
  if (!got.artist || !got.title) return { ok: false, reason: "missing name" };
  if (!namesClose(wantTitle, got.title)) {
    return { ok: false, reason: "title mismatch" };
  }
  const primary = wantArtist.split(/[,&]| b2b | x | ft\.? | feat\.?/i)[0]!.trim();
  if (!namesClose(primary, got.artist) && !namesClose(wantArtist, got.artist)) {
    return { ok: false, reason: "artist mismatch" };
  }
  return { ok: true, reason: "name match" };
}

export function platformsFromUnknown(raw: unknown): TrackRadarPlatforms {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const pick = (k: string): string | undefined => {
    const v = o[k];
    return typeof v === "string" && /^https?:\/\//i.test(v) ? v : undefined;
  };
  return {
    spotify: pick("spotify"),
    appleMusic: pick("appleMusic") || pick("apple_music") || pick("apple"),
    bandcamp: pick("bandcamp"),
    discogs: pick("discogs"),
    beatport: pick("beatport"),
    soundcloud: pick("soundcloud"),
    youtube: pick("youtube"),
  };
}

export function parseTrackRadarTrack(raw: unknown): TrackRadarTrack | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const artist = String(o.artist ?? o.artistName ?? "").trim();
  const title = String(o.title ?? o.trackTitle ?? o.name ?? "").trim();
  if (!artist || !title) return null;
  const platforms = platformsFromUnknown(o.platforms ?? o.links ?? o);
  const beatportUrl =
    canonicalBeatportUrl(platforms.beatport) ||
    canonicalBeatportUrl(typeof o.beatportUrl === "string" ? o.beatportUrl : null) ||
    undefined;
  const isrc = normalizeIsrc(typeof o.isrc === "string" ? o.isrc : null) || undefined;
  return {
    artist,
    title,
    isrc,
    beatportUrl,
    platforms,
    confidence: typeof o.confidence === "string" ? o.confidence : undefined,
  };
}

function parseMcpToolText(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const o = payload as Record<string, unknown>;
  if (o.structuredContent) return o.structuredContent;
  const content = o.content;
  if (Array.isArray(content)) {
    const text = content
      .map((c) =>
        c && typeof c === "object" && "text" in c
          ? String((c as { text?: string }).text || "")
          : "",
      )
      .join("\n")
      .trim();
    if (!text) return o;
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }
  return o.result ?? o;
}

async function mcpCall(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown | null> {
  const key = trackradarApiKey();
  if (!key) return null;
  try {
    const res = await fetch(TRACKRADAR_MCP, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name, arguments: args },
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: unknown;
      error?: { message?: string };
    };
    if (json.error) return null;
    return parseMcpToolText(json.result);
  } catch {
    return null;
  }
}

export function matchPublishedTrack(
  artist: string,
  title: string,
  tracks: TrackRadarTrack[],
): TrackRadarTrack | null {
  for (const t of tracks) {
    if (evaluateTrackRadarHit(artist, title, t).ok) return t;
  }
  return null;
}

let publishedIndex: TrackRadarTrack[] | null = null;

/** Public archive tracks (no key). Cached per process. */
export async function loadPublishedTrackIndex(): Promise<TrackRadarTrack[]> {
  if (publishedIndex) return publishedIndex;
  const lists = await listPublishedTracklists();
  const cap = Number(process.env.TRACKRADAR_ARCHIVE_LIMIT || lists.length);
  const slice = lists.slice(0, Math.max(0, cap));
  const tracks: TrackRadarTrack[] = [];
  const concurrency = 8;
  for (let i = 0; i < slice.length; i += concurrency) {
    const batch = await Promise.all(
      slice.slice(i, i + concurrency).map((s) => getPublishedTracklist(s.slug)),
    );
    for (const d of batch) {
      if (d) tracks.push(...d.tracks);
    }
  }
  publishedIndex = tracks;
  return tracks;
}

export function trackradarMode(): "mcp" | "public-archive" | "off" {
  if (process.env.TRACKRADAR === "0") return "off";
  if (trackradarApiKey()) return "mcp";
  return "public-archive";
}

/** MCP search_track when keyed; otherwise name-match the public archive. */
export async function searchTrackRadar(
  artist: string,
  title: string,
): Promise<TrackRadarTrack | null> {
  const raw = await mcpCall("search_track", { artist, title });
  if (raw) {
    const row = Array.isArray(raw)
      ? raw[0]
      : raw && typeof raw === "object" && "tracks" in raw
        ? (raw as { tracks?: unknown[] }).tracks?.[0]
        : raw && typeof raw === "object" && "track" in raw
          ? (raw as { track?: unknown }).track
          : raw;
    const parsed = parseTrackRadarTrack(row);
    if (parsed && evaluateTrackRadarHit(artist, title, parsed).ok) return parsed;
  }
  if (process.env.TRACKRADAR === "0") return null;
  const index = await loadPublishedTrackIndex();
  return matchPublishedTrack(artist, title, index);
}

export async function listPublishedTracklists(): Promise<TrackRadarPublishedSet[]> {
  const out: TrackRadarPublishedSet[] = [];
  let offset = 0;
  for (let i = 0; i < 10; i++) {
    const url = `${TRACKRADAR_ORIGIN}/api/tracklists?limit=100&offset=${offset}`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) break;
      const json = (await res.json()) as {
        total?: number;
        tracklists?: TrackRadarPublishedSet[];
      };
      const rows = json.tracklists ?? [];
      out.push(...rows);
      offset += rows.length;
      if (!rows.length || offset >= (json.total ?? offset)) break;
    } catch {
      break;
    }
  }
  return out;
}

export async function getPublishedTracklist(slug: string): Promise<{
  sourceUrl?: string;
  tracks: TrackRadarTrack[];
} | null> {
  try {
    const res = await fetch(
      `${TRACKRADAR_ORIGIN}/api/tracklists/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      sourceUrl?: string;
      tracks?: unknown[];
    };
    return {
      sourceUrl: json.sourceUrl,
      tracks: (json.tracks ?? [])
        .map(parseTrackRadarTrack)
        .filter((t): t is TrackRadarTrack => Boolean(t)),
    };
  } catch {
    return null;
  }
}

/** Match a YouTube video id against the public TrackRadar archive. */
export async function findPublishedByYoutubeId(
  videoId: string,
): Promise<TrackRadarPublishedSet | null> {
  const lists = await listPublishedTracklists();
  const needle = videoId.toLowerCase();
  for (const row of lists) {
    const hay = `${row.slug} ${row.setTitle} ${row.sourceUrl ?? ""}`.toLowerCase();
    if (hay.includes(needle)) return row;
  }
  return null;
}

export type TrackRadarAnalyzeResult = {
  sourceUrl: string;
  tracks: TrackRadarTrack[];
  via: "mcp" | "http";
};

/**
 * Analyze a mix URL (quota). Gated by TRACKRADAR_ANALYZE=1.
 * Fingerprint-only fan clips stay Identify-only — never Relive.
 */
export async function analyzeTrackRadarUrl(
  url: string,
): Promise<TrackRadarAnalyzeResult | null> {
  if (process.env.TRACKRADAR_ANALYZE !== "1") return null;

  const mcp = await mcpCall("analyze_social_post", { url });
  if (mcp) {
    const tracks = extractTracks(mcp);
    if (tracks.length) return { sourceUrl: url, tracks, via: "mcp" };
  }

  try {
    const res = await fetch(`${TRACKRADAR_ORIGIN}/api/v2/analyze/url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(trackradarApiKey()
          ? { Authorization: `Bearer ${trackradarApiKey()}` }
          : {}),
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(300_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    const tracks = extractTracks(json);
    if (!tracks.length) return null;
    return { sourceUrl: url, tracks, via: "http" };
  } catch {
    return null;
  }
}

function extractTracks(raw: unknown): TrackRadarTrack[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(parseTrackRadarTrack).filter((t): t is TrackRadarTrack => Boolean(t));
  }
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const rows = o.tracks ?? o.tracklist ?? o.results;
    if (Array.isArray(rows)) {
      return rows
        .map(parseTrackRadarTrack)
        .filter((t): t is TrackRadarTrack => Boolean(t));
    }
    const one = parseTrackRadarTrack(raw);
    return one ? [one] : [];
  }
  return [];
}

/** Analyze fingerprint-only watches when TRACKRADAR_ANALYZE=1. */
export async function analyzeFingerprintOnlyWatches(): Promise<
  TrackRadarAnalyzeResult[]
> {
  const out: TrackRadarAnalyzeResult[] = [];
  for (const w of FINGERPRINT_ONLY_WATCH) {
    const hit = await analyzeTrackRadarUrl(w.youtubeUrl);
    if (hit) out.push(hit);
  }
  return out;
}
