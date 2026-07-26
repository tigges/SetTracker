/**
 * Deezer Search API helpers (no key required).
 * Used at build/ingest time to resolve artwork URLs for DJs, labels, tracks, sets.
 */

const UA = "SetRadar/0.1 (+https://setradar.ai; artwork resolver)";

/** Empty / missing Deezer artwork patterns to reject. */
const BAD_IMAGE_MARKERS = [
  "/images/artist//",
  "/images/cover//",
  "/images/label//",
  // empty-file MD5 that Deezer sometimes returns
  "d41d8cd98f00b204e9800998ecf8427e",
];

export function usableImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.startsWith("https://")) return null;
  for (const m of BAD_IMAGE_MARKERS) {
    if (url.includes(m)) return null;
  }
  return url;
}

export function isCoverArtUrl(url: string | null | undefined): boolean {
  return !!url && url.includes("/images/cover/");
}

export function isArtistArtUrl(url: string | null | undefined): boolean {
  return !!url && url.includes("/images/artist/");
}

/** Prefer a slightly larger square when Deezer gives size variants. */
export function preferMedium(url: string): string {
  return url
    .replace("/56x56-", "/250x250-")
    .replace("/120x120-", "/250x250-")
    .replace("/500x500-", "/250x250-")
    .replace("/1000x1000-", "/250x250-");
}

async function deezerGet<T>(pathAndQuery: string): Promise<T | null> {
  const url = pathAndQuery.startsWith("http")
    ? pathAndQuery
    : `https://api.deezer.com${pathAndQuery}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type DeezerList<T> = { data?: T[]; total?: number };

/** Latinize so umlaut/ø variants of Horger collapse to the same key. */
export function norm(s: string): string {
  const mapped = s
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/ð/g, "d")
    .replace(/ß/g, "ss")
    .replace(/ł/g, "l")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  return mapped.replace(/[^a-z0-9]+/g, " ").trim();
}

function nameClose(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Score how well a Deezer artist name matches our target.
 * Exact (after latinize) wins; collab strings that merely contain the name lose.
 */
function artistMatchScore(candidate: string, target: string): number {
  const nc = norm(candidate);
  const nt = norm(target);
  if (!nc || !nt) return 0;
  if (nc === nt) return 100;
  // "marten horger and neon steve" / feat. lines
  if (/\b(and|&|feat|ft|versus|vs|x)\b/.test(nc) || nc.includes(",")) {
    if (nc.includes(nt)) return 15;
    return 0;
  }
  if (nc.startsWith(nt) || nt.startsWith(nc)) return 70;
  if (nc.includes(nt) || nt.includes(nc)) return 40;
  return 0;
}

export async function resolveArtistImage(name: string): Promise<string | null> {
  const q = encodeURIComponent(name);
  const json = await deezerGet<
    DeezerList<{ name: string; picture_medium?: string; nb_fan?: number }>
  >(`/search/artist?q=${q}&limit=12`);
  const rows = json?.data ?? [];
  if (rows.length === 0) return null;

  const ranked = [...rows]
    .map((row) => ({
      row,
      score: artistMatchScore(row.name, name),
      fans: row.nb_fan ?? 0,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.fans - a.fans);

  for (const { row } of ranked) {
    const img = usableImageUrl(row.picture_medium);
    if (img) return preferMedium(img);
  }
  return null;
}

export async function resolveLabelImage(name: string): Promise<string | null> {
  // Deezer has no /search/label — use albums tagged with this label.
  const q = encodeURIComponent(`label:"${name}"`);
  const json = await deezerGet<
    DeezerList<{ title?: string; cover_medium?: string }>
  >(`/search/album?q=${q}&limit=5`);
  for (const row of json?.data ?? []) {
    const img = usableImageUrl(row.cover_medium);
    if (img) return preferMedium(img);
  }
  // Fallback: album titled like the label (compilations).
  const q2 = encodeURIComponent(name);
  const json2 = await deezerGet<
    DeezerList<{ title?: string; cover_medium?: string }>
  >(`/search/album?q=${q2}&limit=5`);
  for (const row of json2?.data ?? []) {
    if (row.title && nameClose(row.title, name)) {
      const img = usableImageUrl(row.cover_medium);
      if (img) return preferMedium(img);
    }
  }
  for (const row of json2?.data ?? []) {
    const img = usableImageUrl(row.cover_medium);
    if (img) return preferMedium(img);
  }
  return null;
}

export type TrackImageResult = {
  /** Artwork URL when found; omit/null when only meta was matched. */
  url?: string | null;
  /** cover = release artwork; artist = portrait fallback */
  kind?: "cover" | "artist" | null;
  /** Provider track duration in seconds when matched. */
  durationSec?: number | null;
  /** Matched provider title (useful for mix/remix parsing). */
  matchedTitle?: string | null;
};

function trackRowMatches(
  row: { title: string; artist?: { name?: string } },
  title: string,
  primaryArtist: string,
  artistVariants: string[],
): boolean {
  if (!nameClose(row.title, title)) return false;
  const rowArtist = row.artist?.name ?? "";
  return (
    !rowArtist ||
    artistVariants.some((v) => nameClose(rowArtist, v)) ||
    artistMatchScore(rowArtist, primaryArtist) >= 70
  );
}

/**
 * Resolve track artwork. Prefers Deezer release cover art; only falls back to
 * the artist portrait when no matching track/release is found.
 * Also returns duration + matched title when a track hit is found.
 */
export async function resolveTrackImage(
  title: string,
  artistName: string,
): Promise<TrackImageResult | null> {
  const primaryArtist =
    artistName.split(/[,&]| b2b | x /i)[0]?.trim() || artistName;
  const artistVariants = [...new Set([primaryArtist, artistName, norm(primaryArtist)])];

  const queries = [
    `artist:"${primaryArtist}" track:"${title}"`,
    `${title} ${primaryArtist}`,
    `${title} ${artistName}`,
  ];

  let metaOnly: TrackImageResult | null = null;

  for (const term of queries) {
    const q = encodeURIComponent(term);
    const json = await deezerGet<
      DeezerList<{
        title: string;
        duration?: number;
        artist?: { name?: string };
        album?: { cover_medium?: string };
      }>
    >(`/search/track?q=${q}&limit=10`);
    const rows = json?.data ?? [];

    for (const row of rows) {
      if (!trackRowMatches(row, title, primaryArtist, artistVariants)) continue;
      const durationSec =
        typeof row.duration === "number" && row.duration > 0 ? row.duration : null;
      const img = usableImageUrl(row.album?.cover_medium);
      if (img && isCoverArtUrl(img)) {
        return {
          url: preferMedium(img),
          kind: "cover",
          durationSec,
          matchedTitle: row.title,
        };
      }
      if (!metaOnly && (durationSec || row.title)) {
        metaOnly = { durationSec, matchedTitle: row.title };
      }
    }
  }

  // Pass 2: iTunes song artwork (often has covers Deezer misses).
  const itunes = await resolveTrackImageItunes(title, primaryArtist);
  if (itunes) {
    return {
      ...itunes,
      durationSec: itunes.durationSec ?? metaOnly?.durationSec ?? null,
      matchedTitle: itunes.matchedTitle ?? metaOnly?.matchedTitle ?? null,
    };
  }

  // Pass 3: artist portrait only as last resort.
  const artistImg = await resolveArtistImage(primaryArtist);
  if (artistImg) {
    return {
      url: artistImg,
      kind: "artist",
      durationSec: metaOnly?.durationSec ?? null,
      matchedTitle: metaOnly?.matchedTitle ?? null,
    };
  }

  return metaOnly;
}

async function resolveTrackImageItunes(
  title: string,
  artistName: string,
): Promise<TrackImageResult | null> {
  const term = encodeURIComponent(`${title} ${artistName}`);
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=8`,
      {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: AbortSignal.timeout(12_000),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      results?: {
        trackName?: string;
        artistName?: string;
        artworkUrl100?: string;
        trackTimeMillis?: number;
      }[];
    };
    for (const row of json.results ?? []) {
      if (!row.trackName || !nameClose(row.trackName, title)) continue;
      if (row.artistName && artistMatchScore(row.artistName, artistName) < 40) {
        continue;
      }
      const art = row.artworkUrl100?.replace("100x100bb", "300x300bb");
      const durationSec =
        typeof row.trackTimeMillis === "number"
          ? Math.round(row.trackTimeMillis / 1000)
          : null;
      if (art?.startsWith("https://")) {
        return {
          url: art,
          kind: "cover",
          durationSec,
          matchedTitle: row.trackName,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function resolveSetImage(
  title: string,
  primaryArtistName?: string | null,
): Promise<string | null> {
  // Mixes rarely exist as Deezer albums — try title, then fall back to artist.
  const q = encodeURIComponent(
    primaryArtistName ? `${primaryArtistName} ${title}` : title,
  );
  const json = await deezerGet<
    DeezerList<{ title?: string; cover_medium?: string }>
  >(`/search/album?q=${q}&limit=5`);
  for (const row of json?.data ?? []) {
    const img = usableImageUrl(row.cover_medium);
    if (img && isCoverArtUrl(img)) return preferMedium(img);
  }
  if (primaryArtistName) return resolveArtistImage(primaryArtistName);
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
