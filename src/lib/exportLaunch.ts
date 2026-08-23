/**
 * One-click export launch plans for a set tracklist.
 *
 * Spotify / Beatport can open in a new tab (and Spotify’s desktop URI).
 * Rekordbox and Serato have no browser URL scheme that creates a playlist —
 * we download an M3U8 that Rekordbox File → Import → Import Playlist and
 * Serato (drop on Crates) already accept. No OAuth.
 */

import { spotifySearchUrl } from "@/lib/trackMeta";
import {
  buildBeatportUrlList,
  buildSpotifyUriList,
  buildTracklistM3u,
  buildTracklistPlain,
  exportablePlays,
  slugifyFilename,
  trackDisplayLine,
  type ExportPlay,
  type ExportSetMeta,
} from "@/lib/playlistExport";

export type ExportLaunchId = "rekordbox" | "spotify" | "beatport";

export type ExportLaunchPlan = {
  id: ExportLaunchId;
  label: string;
  actionLabel: string;
  hint: string;
  disabled: boolean;
  disabledReason?: string;
  /** https URL to open in a new tab. */
  openHref: string | null;
  /** Native app URI (e.g. spotify:track:…). */
  protocolHref: string | null;
  clipboard: string;
  download?: { filename: string; body: string; mime: string };
};

function firstExportable(plays: ExportPlay[]): ExportPlay | undefined {
  return exportablePlays(plays)[0];
}

function firstLine(text: string): string | null {
  const line = text
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.length > 0);
  return line ?? null;
}

export function planRekordboxLaunch(
  plays: ExportPlay[],
  meta: ExportSetMeta,
): ExportLaunchPlan {
  const rows = exportablePlays(plays);
  const base = slugifyFilename(meta.title || meta.slug);
  const body = buildTracklistM3u(plays, meta);
  const disabled = rows.length === 0;
  return {
    id: "rekordbox",
    label: "Rekordbox / Serato",
    actionLabel: "Save playlist",
    hint: disabled
      ? "No identified rows to export"
      : "Downloads M3U8 · Rekordbox: File → Import → Import Playlist · Serato: drop on Crates",
    disabled,
    disabledReason: disabled ? "No identified rows to export" : undefined,
    openHref: null,
    protocolHref: null,
    clipboard: body,
    download: disabled
      ? undefined
      : {
          filename: `${base}.m3u8`,
          body,
          mime: "application/vnd.apple.mpegurl;charset=utf-8",
        },
  };
}

export function planSpotifyLaunch(
  plays: ExportPlay[],
  meta: ExportSetMeta,
): ExportLaunchPlan {
  const rows = exportablePlays(plays);
  const uriList = buildSpotifyUriList(plays);
  const firstUri = firstLine(uriList);
  const first = firstExportable(plays);
  const searchHref = first
    ? spotifySearchUrl(first.title, first.artistName)
    : spotifySearchUrl(meta.title, meta.artistLine);
  const idCount = uriList
    ? uriList.split("\n").filter((l) => l.startsWith("spotify:track:")).length
    : 0;

  if (rows.length === 0) {
    return {
      id: "spotify",
      label: "Spotify",
      actionLabel: "Open Spotify",
      hint: "No identified rows to export",
      disabled: true,
      disabledReason: "No identified rows to export",
      openHref: null,
      protocolHref: null,
      clipboard: "",
    };
  }

  if (firstUri) {
    const trackId = firstUri.slice("spotify:track:".length);
    return {
      id: "spotify",
      label: "Spotify",
      actionLabel: "Open Spotify",
      hint:
        idCount === 1
          ? "Opens Spotify · URI copied — New playlist → paste"
          : `Opens Spotify · ${idCount} URIs copied — New playlist → paste`,
      disabled: false,
      openHref: `https://open.spotify.com/track/${trackId}`,
      protocolHref: firstUri,
      clipboard: uriList,
    };
  }

  return {
    id: "spotify",
    label: "Spotify",
    actionLabel: "Open Spotify",
    hint: "Opens Spotify search · tracklist copied (no stored /track IDs yet)",
    disabled: false,
    openHref: searchHref,
    protocolHref: null,
    clipboard: buildTracklistPlain(plays),
  };
}

export function planBeatportLaunch(plays: ExportPlay[]): ExportLaunchPlan {
  const rows = exportablePlays(plays);
  const urlList = buildBeatportUrlList(plays);
  const firstUrl = firstLine(urlList);
  const urlCount = urlList
    ? urlList.split("\n").filter((l) => l.length > 0).length
    : 0;

  if (rows.length === 0) {
    return {
      id: "beatport",
      label: "Beatport",
      actionLabel: "Open Beatport",
      hint: "No identified rows to export",
      disabled: true,
      disabledReason: "No identified rows to export",
      openHref: null,
      protocolHref: null,
      clipboard: "",
    };
  }

  if (!firstUrl) {
    return {
      id: "beatport",
      label: "Beatport",
      actionLabel: "Open Beatport",
      hint: "No canonical /track pages on this set",
      disabled: true,
      disabledReason: "No canonical Beatport /track pages on this set",
      openHref: null,
      protocolHref: null,
      clipboard: "",
    };
  }

  return {
    id: "beatport",
    label: "Beatport",
    actionLabel: "Open Beatport",
    hint:
      urlCount === 1
        ? "Opens Beatport · /track link copied"
        : `Opens Beatport · ${urlCount} /track links copied`,
    disabled: false,
    openHref: firstUrl,
    protocolHref: null,
    clipboard: urlList,
  };
}

/** First identified display line — used in tests / search fallbacks. */
export function firstExportDisplayLine(plays: ExportPlay[]): string | null {
  const row = firstExportable(plays);
  return row ? trackDisplayLine(row) : null;
}
