/**
 * Minimal Bandcamp page client — reads public `data-tralbum` JSON from
 * track/album HTML. No API key.
 */

const UA = "SetRadar/0.1 (+https://setradar.ai; bandcamp ingest)";

export type BcTrack = {
  title: string;
  durationSec: number;
  trackNum: number | null;
};

export type BcRelease = {
  url: string;
  itemType: "track" | "album" | string;
  artist: string;
  title: string;
  about: string;
  publishedAt: Date | null;
  tracks: BcTrack[];
  bandSlug: string;
  itemSlug: string;
};

function decodeAttr(attr: string): unknown {
  const unescaped = attr
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return JSON.parse(unescaped);
}

function parseDate(raw: unknown): Date | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function slugsFromUrl(url: string): { bandSlug: string; itemSlug: string } {
  const u = new URL(url);
  const host = u.hostname.replace(/\.bandcamp\.com$/i, "");
  const parts = u.pathname.split("/").filter(Boolean);
  const itemSlug = parts[1] || parts[0] || "release";
  return { bandSlug: host || "bandcamp", itemSlug };
}

export async function fetchBandcampRelease(url: string): Promise<BcRelease> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Bandcamp HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const m = html.match(/data-tralbum="([^"]+)"/);
  if (!m) throw new Error(`Bandcamp tralbum missing for ${url}`);

  const t = decodeAttr(m[1]) as {
    artist?: string;
    item_type?: string;
    current?: {
      title?: string;
      about?: string;
      release_date?: string;
      publish_date?: string;
    };
    trackinfo?: Array<{
      title?: string;
      duration?: number;
      track_num?: number | null;
    }>;
  };

  const current = t.current ?? {};
  const tracks = (t.trackinfo ?? [])
    .filter((x) => (x.title || "").trim())
    .map((x, i) => ({
      title: String(x.title).trim(),
      durationSec: Math.max(0, Math.round(Number(x.duration) || 0)),
      trackNum: x.track_num ?? i + 1,
    }));

  if (tracks.length === 0) {
    throw new Error(`Bandcamp release has no tracks: ${url}`);
  }

  const { bandSlug, itemSlug } = slugsFromUrl(url);
  return {
    url: url.split("?")[0],
    itemType: t.item_type || "track",
    artist: (t.artist || "").trim() || bandSlug,
    title: (current.title || tracks[0].title).trim(),
    about: String(current.about || ""),
    publishedAt: parseDate(current.release_date || current.publish_date),
    tracks,
    bandSlug,
    itemSlug,
  };
}
