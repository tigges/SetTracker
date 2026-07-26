/**
 * Stable public slugs for Track pages.
 * Identity remains (title, artistName); slug is derived for URLs.
 */

import { slugify } from "@/lib/ingest/types";

export function trackSlugBase(artistName: string, title: string): string {
  const base = slugify(`${artistName}-${title}`);
  return base || "track";
}

/** Allocate a unique slug, appending -2, -3… when the base is taken. */
export async function allocateTrackSlug(
  artistName: string,
  title: string,
  exists: (slug: string) => Promise<boolean>,
  preferred?: string | null,
): Promise<string> {
  if (preferred && !(await exists(preferred))) return preferred;
  const base = trackSlugBase(artistName, title);
  if (!(await exists(base))) return base;
  for (let i = 2; i < 200; i++) {
    const candidate = `${base}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
