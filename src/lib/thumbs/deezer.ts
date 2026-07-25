/**
 * Deezer Search API helpers (no key required).
 * Used at build/ingest time to resolve artwork URLs for DJs, labels, tracks, sets.
 */

const UA = "SETGRAPH/0.1 (+https://github.com/tigges/SetTracker; artwork resolver)";

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
      // Node 18+ / CI
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type DeezerList<T> = { data?: T[]; total?: number };

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nameClose(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export async function resolveArtistImage(name: string): Promise<string | null> {
  const q = encodeURIComponent(name);
  const json = await deezerGet<
    DeezerList<{ name: string; picture_medium?: string; nb_fan?: number }>
  >(`/search/artist?q=${q}&limit=8`);
  const rows = json?.data ?? [];
  // Prefer exact-ish name with the most fans (filters stub / empty artists).
  const ranked = [...rows].sort((a, b) => (b.nb_fan ?? 0) - (a.nb_fan ?? 0));
  for (const row of ranked) {
    if (!nameClose(row.name, name)) continue;
    const img = usableImageUrl(row.picture_medium);
    if (img) return preferMedium(img);
  }
  for (const row of ranked) {
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
    DeezerList<{ title?: string; cover_medium?: string; artist?: { name?: string } }>
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

export async function resolveTrackImage(
  title: string,
  artistName: string,
): Promise<string | null> {
  // Collab strings like "Chris Lake, Aatig" → try primary artist first.
  const primaryArtist = artistName.split(/[,&]| b2b | x /i)[0]?.trim() || artistName;
  const queries = [`${title} ${primaryArtist}`, `${title} ${artistName}`];
  for (const term of queries) {
    const q = encodeURIComponent(term);
    const json = await deezerGet<
      DeezerList<{
        title: string;
        artist?: { name?: string };
        album?: { cover_medium?: string };
      }>
    >(`/search/track?q=${q}&limit=8`);
    const rows = json?.data ?? [];
    for (const row of rows) {
      if (!nameClose(row.title, title)) continue;
      const rowArtist = row.artist?.name ?? "";
      if (
        rowArtist &&
        !nameClose(rowArtist, primaryArtist) &&
        !nameClose(rowArtist, artistName)
      ) {
        continue;
      }
      const img = usableImageUrl(row.album?.cover_medium);
      if (img) return preferMedium(img);
    }
  }
  // Synthetic / unreleased rows often miss on Deezer — use the artist portrait.
  return resolveArtistImage(primaryArtist);
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
    if (img) return preferMedium(img);
  }
  if (primaryArtistName) return resolveArtistImage(primaryArtistName);
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
