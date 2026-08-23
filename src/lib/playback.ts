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
    // Do not put `#t=` on the widget `url=` — SoundCloud ignores a hash
    // inside that query param. Cue jumps use the Widget API (`seekTo`).
    const page =
      url.includes("w.soundcloud.com") && opts.sourceUrl
        ? opts.sourceUrl
        : url;
    const embedSrc =
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(page)}` +
      `&color=%2300ff9c&auto_play=${opts.autoplay ? "true" : "false"}` +
      `&hide_related=true&show_comments=false` +
      `&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc,
      openUrl: soundcloudSeekUrl(page, opts.startSec),
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
    const watch =
      opts.sourceUrl || `https://www.youtube.com/watch?v=${id}`;
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc: `https://www.youtube.com/embed/${id}?rel=0${start}${autoplay}`,
      openUrl: youtubeSeekUrl(watch, opts.startSec),
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

/** Canonical `watch?v=` URL from a YouTube link. Never a search page. */
export function youtubeWatchUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const id = youtubeId(url.trim());
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Public SoundCloud permalink (never the widget / API host). */
export function soundcloudPageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  if (detectPlaybackHost(url) !== "soundcloud") return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "w.soundcloud.com" || host === "api.soundcloud.com") {
      return null;
    }
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function firstMatch<T>(
  urls: Array<string | null | undefined>,
  pick: (url: string) => T | null,
): T | null {
  for (const raw of urls) {
    const hit = pick(raw ?? "");
    if (hit) return hit;
  }
  return null;
}

/** YouTube watch URL from playback or source, if either is a real video. */
export function setYoutubeWatchUrl(
  playbackUrl?: string | null,
  sourceUrl?: string | null,
): string | null {
  return firstMatch([playbackUrl, sourceUrl], youtubeWatchUrl);
}

/** SoundCloud permalink from playback or source. */
export function setSoundcloudPageUrl(
  playbackUrl?: string | null,
  sourceUrl?: string | null,
): string | null {
  return firstMatch([playbackUrl, sourceUrl], soundcloudPageUrl);
}

/** Canonical Mixcloud show URL (never widget / discover). */
export function mixcloudPageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  if (detectPlaybackHost(url) !== "mixcloud") return null;
  try {
    const u = new URL(url.trim());
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const user = parts[0]!.toLowerCase();
    const show = parts[1]!;
    if (user === "widget" || user === "discover" || user === "search") {
      return null;
    }
    return `https://www.mixcloud.com/${user}/${show}/`;
  } catch {
    return null;
  }
}

/** Mixcloud show URL from playback or source. */
export function setMixcloudPageUrl(
  playbackUrl?: string | null,
  sourceUrl?: string | null,
): string | null {
  return firstMatch([playbackUrl, sourceUrl], mixcloudPageUrl);
}

export type SetHostUrls = {
  soundcloudUrl?: string | null;
  youtubeUrl?: string | null;
  mixcloudUrl?: string | null;
};

/** Pick official SC / YT / Mixcloud links from known URLs. Never invents. */
export function hostUrlsFromKnown(
  ...urls: Array<string | null | undefined>
): SetHostUrls {
  return {
    soundcloudUrl: firstMatch(urls, soundcloudPageUrl),
    youtubeUrl: firstMatch(urls, youtubeWatchUrl),
    mixcloudUrl: firstMatch(urls, mixcloudPageUrl),
  };
}

/** Fill-null merge. Existing values win. */
export function mergeHostUrlFields(...parts: SetHostUrls[]): SetHostUrls {
  const out: SetHostUrls = {};
  for (const part of parts) {
    if (!out.soundcloudUrl && part.soundcloudUrl) {
      out.soundcloudUrl = part.soundcloudUrl;
    }
    if (!out.youtubeUrl && part.youtubeUrl) {
      out.youtubeUrl = part.youtubeUrl;
    }
    if (!out.mixcloudUrl && part.mixcloudUrl) {
      out.mixcloudUrl = part.mixcloudUrl;
    }
  }
  return out;
}

/** Only the host columns that are currently empty and have a known fill. */
export function hostUrlFillNull(
  existing: SetHostUrls,
  ...incoming: SetHostUrls[]
): SetHostUrls {
  const merged = mergeHostUrlFields(existing, ...incoming);
  const patch: SetHostUrls = {};
  if (!existing.soundcloudUrl && merged.soundcloudUrl) {
    patch.soundcloudUrl = merged.soundcloudUrl;
  }
  if (!existing.youtubeUrl && merged.youtubeUrl) {
    patch.youtubeUrl = merged.youtubeUrl;
  }
  if (!existing.mixcloudUrl && merged.mixcloudUrl) {
    patch.mixcloudUrl = merged.mixcloudUrl;
  }
  return patch;
}

/** SoundCloud permalink with an optional `#t=` cue (seconds). */
export function soundcloudSeekUrl(
  page: string,
  startSec?: number | null,
): string {
  const base = page.replace(/#.*$/, "");
  if (startSec == null || startSec <= 0) return base;
  return `${base}#t=${Math.floor(startSec)}`;
}

/** YouTube watch URL with an optional `t=` cue. */
export function youtubeSeekUrl(
  watchUrl: string,
  startSec?: number | null,
): string {
  try {
    const u = new URL(watchUrl);
    if (startSec != null && startSec > 0) {
      u.searchParams.set("t", `${Math.floor(startSec)}s`);
    } else {
      u.searchParams.delete("t");
    }
    return u.toString();
  } catch {
    return watchUrl;
  }
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
