/**
 * Map accidental slugify variants onto curated Dj.slug values.
 * Example: slugify("Gentlemen's Groove") → gentlemen-s-groove, but hearthis
 * seeds use gentlemens-groove (no apostrophe fold).
 *
 * Also folds common set-title slug accidents onto the real artist so re-ingest
 * does not recreate junk profiles (mergeSetTitleDjs cleans existing rows).
 */

export const DJ_SLUG_ALIASES: Record<string, string> = {
  "gentlemen-s-groove": "gentlemens-groove",
  // Dom Dolla set-title accidents
  "dom-dolla-dancefloor-currency": "dom-dolla",
  "dom-dolla-warm-up": "dom-dolla",
  "dom-dolla-you-tour-mix": "dom-dolla",
  "everything-always-dom-dolla": "dom-dolla",
  "the-sydney-social-podcast-3-dom-dolla-download-now": "dom-dolla",
  // Odd Mob set-title accidents
  "odd-mob-at-seismic-dance-event-8-0": "odd-mob",
  "odd-mob-live": "odd-mob",
  "odd-mob-palladium-2024": "odd-mob",
  "odd-mob-live-set-at-tivoli-brisbane": "odd-mob",
  "james-hype-live": "james-hype",
  "sara-landry-live": "sara-landry",
};

export function canonicalDjSlug(slug: string): string {
  return DJ_SLUG_ALIASES[slug] ?? slug;
}
