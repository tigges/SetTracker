/**
 * YouTube thumbnail helpers (no API key).
 */

export function youtubeVideoId(videoOrUrl: string): string | null {
  const s = videoOrUrl.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").slice(0, 11);
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
  } catch {
    /* bare id failed */
  }
  const m = s.match(/(?:v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

/** Prefer maxres, then sd, then hq. */
export function youtubeThumbUrl(videoId: string, quality: "max" | "sd" | "hq" = "max"): string {
  const file =
    quality === "hq"
      ? "hqdefault.jpg"
      : quality === "sd"
        ? "sddefault.jpg"
        : "maxresdefault.jpg";
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}

/** Best-effort thumb from watch meta / videoDetails.thumbnails. */
export function pickYoutubeThumbnail(
  videoId: string,
  thumbnails?: Array<{ url?: string; width?: number }> | null,
): string {
  if (thumbnails?.length) {
    const ranked = [...thumbnails]
      .filter((t) => t.url?.startsWith("http"))
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
    if (ranked[0]?.url) return ranked[0].url;
  }
  return youtubeThumbUrl(videoId, "hq");
}
