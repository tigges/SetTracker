/**
 * Display + ingest gate for artwork URLs.
 * Deezer often stores a generic person silhouette under a unique
 * `/images/artist/{md5}/` hash (and 302s some of those to the empty-file MD5).
 * Those must not count as a hit — otherwise thumbs never falls through to
 * SoundCloud / YouTube, and EntityThumb never shows a monogram.
 */

/** Empty-path Deezer artwork. */
const BAD_IMAGE_MARKERS = [
  "/images/artist//",
  "/images/cover//",
  "/images/label//",
];

/**
 * Known Deezer artist-image hashes that render the generic silhouette.
 * Empty-file MD5 is the redirect target; the others were pinned as if real.
 */
export const DEEZER_PLACEHOLDER_ARTIST_HASHES = new Set([
  "d41d8cd98f00b204e9800998ecf8427e",
  "54da54b7aee3557b310dcee5a735d18d",
  "d8315de10c16736f16b43549fb360448",
]);

export function deezerImageHash(url: string): string | null {
  const m = url.match(/\/images\/(?:artist|cover|label)\/([a-f0-9]{32})\//i);
  return m?.[1]?.toLowerCase() ?? null;
}

export function isPlaceholderArtistImage(
  url: string | null | undefined,
): boolean {
  if (!url) return false;
  for (const marker of BAD_IMAGE_MARKERS) {
    if (url.includes(marker)) return true;
  }
  const hash = deezerImageHash(url);
  return hash != null && DEEZER_PLACEHOLDER_ARTIST_HASHES.has(hash);
}

/**
 * Keep https artwork and curated `/artists/…` paths. Drop placeholders
 * and anything that is not a real image URL.
 */
export function usableImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isPlaceholderArtistImage(trimmed)) return null;
  if (trimmed.startsWith("/")) return trimmed;
  if (!trimmed.startsWith("https://")) return null;
  return trimmed;
}
