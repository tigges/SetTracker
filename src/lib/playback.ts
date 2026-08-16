/**
 * On-site playback helpers.
 * Embed SoundCloud / YouTube / Mixcloud only. hearthis.at is tracklist
 * provenance — its app embed crashes mobile Safari and is not a player.
 */

export type PlaybackHost = "soundcloud" | "hearthis" | "youtube" | "mixcloud";

export type PlaybackTarget = {
  host: PlaybackHost;
  label: string;
  /** iframe src */
  embedSrc: string;
  /** Human "open on host" URL (prefer page over raw embed URL). */
  openUrl: string;
  embedHeight: number;
};

export function hearthisEmbedUrl(trackId: string | number): string {
  return `https://app.hearthis.at/embed/${trackId}/transparent_black/?autoplay=0&cover=0&waveform=0`;
}

export function detectPlaybackHost(
  url: string | null | undefined,
): PlaybackHost | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (
      host === "soundcloud.com" ||
      host === "w.soundcloud.com" ||
      host === "api.soundcloud.com"
    ) {
      return "soundcloud";
    }
    if (
      host === "hearthis.at" ||
      host === "app.hearthis.at" ||
      host.endsWith(".hearthis.at")
    ) {
      return "hearthis";
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtu.be"
    ) {
      return "youtube";
    }
    if (host === "mixcloud.com") {
      return "mixcloud";
    }
  } catch {
    return null;
  }
  return null;
}

/** Canonical Mixcloud show URL → widget iframe src. */
export function mixcloudEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, "").toLowerCase() !== "mixcloud.com") {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2 || parts[0] === "widget") return null;
    const feed = `/${parts[0]}/${parts[1]}/`;
    return (
      `https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=1&feed=` +
      encodeURIComponent(feed)
    );
  } catch {
    return null;
  }
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      return u.pathname.split("/").filter(Boolean)[0] || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) =>
      ["embed", "shorts", "live", "v"].includes(p),
    );
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1]!;
  } catch {
    return null;
  }
  return null;
}

const HOST_LABEL: Record<PlaybackHost, string> = {
  soundcloud: "SoundCloud",
  hearthis: "hearthis.at",
  youtube: "YouTube",
  mixcloud: "Mixcloud",
};

/**
 * Build an embed target from a playback URL (original audio host).
 * Returns null when the URL is missing or not embeddable.
 */
export function resolvePlaybackTarget(
  playbackUrl: string | null | undefined,
  opts: {
    sourceUrl?: string | null;
    startSec?: number | null;
    autoplay?: boolean;
  } = {},
): PlaybackTarget | null {
  const url = playbackUrl?.trim();
  if (!url) return null;
  const host = detectPlaybackHost(url);
  if (!host) return null;

  if (host === "soundcloud") {
    // Widget accepts the public track/set permalink.
    const page =
      url.includes("w.soundcloud.com") && opts.sourceUrl
        ? opts.sourceUrl
        : url;
    const start = opts.startSec != null && opts.startSec > 0
      ? `#t=${Math.floor(opts.startSec)}`
      : "";
    const embedSrc =
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(page + start)}` +
      `&color=%2300ff9c&auto_play=${opts.autoplay ? "true" : "false"}` +
      `&hide_related=true&show_comments=false` +
      `&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc,
      openUrl: page,
      embedHeight: 166,
    };
  }

  // hearthis.at: discovery / cues only. Never iframe app.hearthis.at.
  // Cue clicks use hearthisPublicUrl + hearthisSeekUrl instead.
  if (host === "hearthis") return null;

  if (host === "youtube") {
    const id = youtubeId(url);
    if (!id) return null;
    const start =
      opts.startSec != null && opts.startSec > 0
        ? `&start=${Math.floor(opts.startSec)}`
        : "";
    const autoplay = opts.autoplay ? "&autoplay=1" : "";
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc: `https://www.youtube.com/embed/${id}?rel=0${start}${autoplay}`,
      openUrl: opts.sourceUrl || `https://www.youtube.com/watch?v=${id}`,
      embedHeight: 360,
    };
  }

  if (host === "mixcloud") {
    const embedSrc = mixcloudEmbedSrc(url);
    if (!embedSrc) return null;
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc,
      openUrl: url.replace(/\?.*$/, "").replace(/\/?$/, "/"),
      embedHeight: 120,
    };
  }

  return null;
}

/** True when the URL can be embedded (never hearthis.at). */
export function isPlayablePlaybackUrl(
  url: string | null | undefined,
): boolean {
  const host = detectPlaybackHost(url);
  return host === "soundcloud" || host === "youtube" || host === "mixcloud";
}

/**
 * Public player URL: stored playback, else source, if either is embeddable.
 * hearthis source links stay on the set as provenance, not as audio.
 */
export function playablePlaybackUrl(
  playbackUrl?: string | null,
  sourceUrl?: string | null,
): string | null {
  if (isPlayablePlaybackUrl(playbackUrl)) return playbackUrl!.trim();
  if (isPlayablePlaybackUrl(sourceUrl)) return sourceUrl!.trim();
  return null;
}

/** Public hearthis.at page (never the app embed). */
export function hearthisPublicUrl(
  playbackUrl?: string | null,
  sourceUrl?: string | null,
): string | null {
  for (const raw of [sourceUrl, playbackUrl]) {
    if (!raw?.trim()) continue;
    if (detectPlaybackHost(raw) !== "hearthis") continue;
    try {
      const u = new URL(raw.trim());
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "app.hearthis.at") continue;
      u.hash = "";
      u.search = "";
      let href = u.toString();
      if (!href.endsWith("/")) href += "/";
      return href;
    } catch {
      continue;
    }
  }
  return null;
}

/** hearthis public page with an optional `#t=` cue (seconds). */
export function hearthisSeekUrl(
  publicUrl: string,
  startSec?: number | null,
): string {
  const base = publicUrl.replace(/#.*$/, "");
  if (startSec == null || startSec <= 0) return base;
  return `${base}#t=${Math.floor(startSec)}`;
}

/**
 * When adapters omit playbackUrl, derive from source if source *is* the audio host.
 * hearthis page / embed URLs are never playback.
 */
export function playbackUrlFromSource(
  sourceName: string | null | undefined,
  sourceUrl: string | null | undefined,
): string | null {
  if (!sourceUrl) return null;
  if (isPlayablePlaybackUrl(sourceUrl)) return sourceUrl;
  return null;
}
