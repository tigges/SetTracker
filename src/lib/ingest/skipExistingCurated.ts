/**
 * Pages light ingest: when curated YT/SC seed files change, only fetch
 * slugs that are not already in the restored catalog. Unchanged videos
 * keep their cached rows; 1001 clocks overlay in verify-urls.
 * Catalog-deep does not set INGEST_SKIP_EXISTING_CURATED.
 */

let existing: ReadonlySet<string> | null = null;

export function skipExistingCuratedEnabled(): boolean {
  return process.env.INGEST_SKIP_EXISTING_CURATED === "1";
}

export function setExistingCuratedSlugs(
  slugs: Iterable<string> | null,
): void {
  existing = slugs ? new Set(slugs) : null;
}

export function existingCuratedSlugCount(): number {
  return existing?.size ?? 0;
}

/** False = already in the catalog, do not watch/resolve again. */
export function shouldFetchCuratedSlug(
  slug: string | null | undefined,
): boolean {
  if (!slug) return true;
  if (!skipExistingCuratedEnabled()) return true;
  if (!existing) return true;
  return !existing.has(slug);
}
