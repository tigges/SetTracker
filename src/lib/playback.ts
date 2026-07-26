/**
 * On-site playback helpers.
 * Rule: embed the original audio host — never prefer a mirror brand.
 */

export type PlaybackHost = "soundcloud" | "hearthis" | "youtube";

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
    if (host === "soundcloud.com" || host === "w.soundcloud.com") {
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
  } catch {
    return null;
  }
  return null;
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

function hearthisEmbedId(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // /embed/{id}/… or app.hearthis.at/embed/{id}
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1] && /^\d+$/.test(parts[embedIdx + 1]!)) {
      return parts[embedIdx + 1]!;
    }
  } catch {
    return null;
  }
  return null;
}

const HOST_LABEL: Record<PlaybackHost, string> = {
  soundcloud: "SoundCloud",
  hearthis: "hearthis.at",
  youtube: "YouTube",
};

/**
 * Build an embed target from a playback URL (original audio host).
 * Returns null when the URL is missing or not embeddable.
 */
export function resolvePlaybackTarget(
  playbackUrl: string | null | undefined,
  opts: { sourceUrl?: string | null } = {},
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
    const embedSrc =
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(page)}` +
      `&color=%2300ff9c&auto_play=false&hide_related=true&show_comments=false` +
      `&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc,
      openUrl: page,
      embedHeight: 166,
    };
  }

  if (host === "hearthis") {
    const id = hearthisEmbedId(url);
    if (!id) return null; // page URL without id — not embeddable yet
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc: hearthisEmbedUrl(id),
      openUrl: opts.sourceUrl || url,
      embedHeight: 150,
    };
  }

  if (host === "youtube") {
    const id = youtubeId(url);
    if (!id) return null;
    return {
      host,
      label: HOST_LABEL[host],
      embedSrc: `https://www.youtube.com/embed/${id}?rel=0`,
      openUrl: opts.sourceUrl || `https://www.youtube.com/watch?v=${id}`,
      embedHeight: 360,
    };
  }

  return null;
}

/**
 * When adapters omit playbackUrl, derive from source if source *is* the audio host.
 * hearthis page URLs are not sufficient (need numeric embed id).
 */
export function playbackUrlFromSource(
  sourceName: string | null | undefined,
  sourceUrl: string | null | undefined,
): string | null {
  if (!sourceUrl) return null;
  const host = detectPlaybackHost(sourceUrl);
  if (host === "soundcloud" || host === "youtube") return sourceUrl;
  if (host === "hearthis" && hearthisEmbedId(sourceUrl)) return sourceUrl;
  // Native hearthis page — need ingest-time embed URL with track id.
  if (sourceName === "SoundCloud" || sourceName === "YouTube") return sourceUrl;
  return null;
}
