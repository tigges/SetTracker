/**
 * Prefer SoundCloud / YouTube audio when a hearthis upload links to them.
 * Tracklists stay on hearthis (sourceName / sourceUrl); playback may differ.
 *
 * Never invent mirrors — only track-level SC permalinks and watch URLs.
 */

import { scGet, type ScTrack } from "../soundcloud/client";
import { sleep } from "./client";

const SC_TRACK_RE =
  /(?:https?:\/\/)?(?:(?:www|m|w)\.)?soundcloud\.com\/([a-z0-9_-]+\/[a-z0-9_-]+)(?:[/?#"'\s]|$)/gi;
const YT_WATCH_RE =
  /(?:https?:\/\/)?(?:(?:www|m|music)\.)?youtube\.com\/watch\?([^\s"'<>]+)/gi;
const YT_BE_RE =
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{6,})(?:[/?#"'\s]|$)/gi;
const YT_EMBED_RE =
  /(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})(?:[/?#"'\s]|$)/gi;

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "\n");
}

/** Track-level SoundCloud URL from free text (profile-only links ignored). */
export function soundcloudTrackUrlFromText(text: string): string | null {
  if (!text?.trim()) return null;
  const hay = stripHtml(text);
  for (const m of hay.matchAll(SC_TRACK_RE)) {
    const path = (m[1] || "").toLowerCase();
    if (!path || path.includes("/sets/") || path.endsWith("/sets")) continue;
    const [user, track] = path.split("/");
    if (!user || !track) continue;
    if (user === "you" || user === "discover" || user === "search") continue;
    return `https://soundcloud.com/${user}/${track}`;
  }
  return null;
}

/** YouTube watch URL from free text (channels / @handles ignored). */
export function youtubeWatchUrlFromText(text: string): string | null {
  if (!text?.trim()) return null;
  const hay = stripHtml(text);

  for (const m of hay.matchAll(YT_WATCH_RE)) {
    const qs = m[1] || "";
    const id = new URLSearchParams(qs).get("v");
    if (id && /^[a-zA-Z0-9_-]{6,}$/.test(id)) {
      return `https://www.youtube.com/watch?v=${id}`;
    }
  }
  for (const m of hay.matchAll(YT_BE_RE)) {
    const id = m[1];
    if (id) return `https://www.youtube.com/watch?v=${id}`;
  }
  for (const m of hay.matchAll(YT_EMBED_RE)) {
    const id = m[1];
    if (id && !id.includes("{")) {
      return `https://www.youtube.com/watch?v=${id}`;
    }
  }
  return null;
}

export function preferredExternalPlaybackFromText(
  ...parts: Array<string | null | undefined>
): { playbackUrl: string; host: "soundcloud" | "youtube" } | null {
  const hay = parts.filter(Boolean).join("\n");
  const sc = soundcloudTrackUrlFromText(hay);
  if (sc) return { playbackUrl: sc, host: "soundcloud" };
  const yt = youtubeWatchUrlFromText(hay);
  if (yt) return { playbackUrl: yt, host: "youtube" };
  return null;
}

/** Resolve SC permalink via api-v2 when possible; fall back to the parsed URL. */
export async function resolveSoundCloudTrackUrl(
  url: string,
): Promise<string | null> {
  try {
    const track = await scGet<ScTrack>(
      `/resolve?url=${encodeURIComponent(url)}`,
    );
    await sleep(80);
    if (track?.permalink_url && /soundcloud\.com\/[^/]+\/[^/]+/i.test(track.permalink_url)) {
      return track.permalink_url.replace(/\/$/, "");
    }
  } catch {
    /* keep candidate */
  }
  return /soundcloud\.com\/[^/]+\/[^/]+/i.test(url) ? url.replace(/\/$/, "") : null;
}

/**
 * Rank audio hosts for upgrades: never replace SC/YT with hearthis.
 * Higher is better.
 */
export function playbackHostRank(url: string | null | undefined): number {
  if (!url) return 0;
  if (/soundcloud\.com\//i.test(url)) return 4;
  // Mixcloud show embeds beat site-chrome YouTube trailers.
  if (/mixcloud\.com\//i.test(url)) return 3;
  if (/youtu\.be\/|youtube\.com\//i.test(url)) return 2;
  if (/hearthis\.at\//i.test(url)) return 1;
  return 0;
}

export function preferPlaybackUrl(
  incoming: string | null | undefined,
  existing: string | null | undefined,
): string | null {
  const a = incoming?.trim() || null;
  const b = existing?.trim() || null;
  if (!a) return b;
  if (!b) return a;
  return playbackHostRank(a) >= playbackHostRank(b) ? a : b;
}
