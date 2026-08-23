/**
 * Client-safe playlist export helpers for set tracklists.
 * Static-site friendly: downloads only — no Spotify/Beatport OAuth.
 */

import {
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  spotifyTrackUri,
} from "@/lib/trackMeta";

export type ExportPlay = {
  position: number;
  timestamp: number;
  title: string;
  artistName: string | null;
  bpm: number | null;
  musicalKey: string | null;
  trackDurationSec: number | null;
  beatportUrl: string | null;
  spotifyUrl: string | null;
  isrc: string | null;
  mixName: string | null;
  idStatus: string;
};

export type ExportSetMeta = {
  title: string;
  slug: string;
  /** Optional primary DJ / artist line for file headers. */
  artistLine?: string | null;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** HH:MM:SS or MM:SS for cue columns. */
export function exportTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

export function trackDisplayLine(p: ExportPlay): string {
  const artist = (p.artistName ?? "").trim();
  const title = p.title.trim();
  if (artist && title) return `${artist} - ${title}`;
  return title || artist || "Unknown";
}

/** Identified / community-resolved rows first; fall back to all non-empty titles. */
export function exportablePlays(plays: ExportPlay[]): ExportPlay[] {
  const identified = plays.filter(
    (p) =>
      p.idStatus === "identified" || p.idStatus === "community_resolved",
  );
  if (identified.length > 0) return identified;
  return plays.filter((p) => p.title.trim().length > 0);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** CSV for spreadsheets / Spotify & Rekordbox import tools. */
export function buildTracklistCsv(
  plays: ExportPlay[],
  meta: ExportSetMeta,
): string {
  const rows = exportablePlays(plays);
  const header = [
    "position",
    "cue",
    "artist",
    "title",
    "mix",
    "bpm",
    "key",
    "duration_sec",
    "isrc",
    "beatport_url",
    "spotify_url",
    "spotify_uri",
    "id_status",
    "set_slug",
    "set_title",
  ].join(",");

  const lines = rows.map((p) =>
    [
      String(p.position),
      exportTimestamp(p.timestamp),
      csvEscape(p.artistName ?? ""),
      csvEscape(p.title),
      csvEscape(p.mixName ?? ""),
      p.bpm != null ? String(p.bpm) : "",
      csvEscape(p.musicalKey ?? ""),
      p.trackDurationSec != null ? String(p.trackDurationSec) : "",
      csvEscape(p.isrc ?? ""),
      csvEscape(canonicalBeatportUrl(p.beatportUrl) ?? ""),
      csvEscape(canonicalSpotifyUrl(p.spotifyUrl) ?? ""),
      csvEscape(spotifyTrackUri(p.spotifyUrl) ?? ""),
      csvEscape(p.idStatus),
      csvEscape(meta.slug),
      csvEscape(meta.title),
    ].join(","),
  );

  return [header, ...lines].join("\n") + "\n";
}

/**
 * M3U for Rekordbox / players. Entries are title lines (no local audio paths);
 * Rekordbox matches against the library by artist/title.
 */
export function buildTracklistM3u(
  plays: ExportPlay[],
  meta: ExportSetMeta,
): string {
  const rows = exportablePlays(plays);
  const lines: string[] = [
    "#EXTM3U",
    `#PLAYLIST:${meta.title.replace(/\n/g, " ")}`,
    `# setradar.ai /sets/${meta.slug}`,
  ];
  if (meta.artistLine) {
    lines.push(`# artist:${meta.artistLine.replace(/\n/g, " ")}`);
  }

  for (const p of rows) {
    const display = trackDisplayLine(p);
    const dur =
      p.trackDurationSec != null && p.trackDurationSec > 0
        ? Math.round(p.trackDurationSec)
        : -1;
    const artist = (p.artistName ?? "").trim() || "Unknown";
    lines.push(`#EXTINF:${dur},${artist} - ${p.title.trim()}`);
    lines.push(`# setradar-cue:${exportTimestamp(p.timestamp)}`);
    if (p.mixName) lines.push(`# mix:${p.mixName}`);
    if (p.isrc) lines.push(`# isrc:${p.isrc}`);
    const bp = canonicalBeatportUrl(p.beatportUrl);
    if (bp) lines.push(`# beatport:${bp}`);
    const sp = spotifyTrackUri(p.spotifyUrl);
    if (sp) lines.push(`# ${sp}`);
    lines.push(display);
  }

  return lines.join("\n") + "\n";
}

/** Plain Artist - Title list (Spotify “create playlist from text” tools). */
export function buildTracklistPlain(plays: ExportPlay[]): string {
  return (
    exportablePlays(plays)
      .map((p) => trackDisplayLine(p))
      .join("\n") + "\n"
  );
}

/** Canonical Beatport /track URLs only — the Rekordbox buy list. */
export function buildBeatportUrlList(plays: ExportPlay[]): string {
  const urls = exportablePlays(plays)
    .map((p) => canonicalBeatportUrl(p.beatportUrl))
    .filter((url): url is string => !!url);
  return urls.length ? urls.join("\n") + "\n" : "";
}

/** Canonical Spotify /track URLs only. */
export function buildSpotifyUrlList(plays: ExportPlay[]): string {
  const urls = exportablePlays(plays)
    .map((p) => canonicalSpotifyUrl(p.spotifyUrl))
    .filter((url): url is string => !!url);
  return urls.length ? urls.join("\n") + "\n" : "";
}

/** `spotify:track:{id}` lines only — empty when no stored IDs. */
export function buildSpotifyUriList(plays: ExportPlay[]): string {
  const uris = exportablePlays(plays)
    .map((p) => spotifyTrackUri(p.spotifyUrl))
    .filter((uri): uri is string => !!uri);
  return uris.length ? uris.join("\n") + "\n" : "";
}

export function slugifyFilename(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "set-tracklist";
}
