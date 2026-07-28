/**
 * Map accidental slugify variants onto curated Dj.slug values.
 * Example: slugify("Gentlemen's Groove") → gentlemen-s-groove, but hearthis
 * seeds use gentlemens-groove (no apostrophe fold).
 */

export const DJ_SLUG_ALIASES: Record<string, string> = {
  "gentlemen-s-groove": "gentlemens-groove",
};

export function canonicalDjSlug(slug: string): string {
  return DJ_SLUG_ALIASES[slug] ?? slug;
}
