import { PRODUCER_DJ_ALIASES } from "./producerDjReview.data";

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
  "defected-virtual-festival-4-0": "dom-dolla",
  "the-sydney-social-podcast-3": "dom-dolla",
  "laidback-luke-selects": "laidback-luke",
  // "Chris Lake Full Set …" title crumb
  "chris-lake-full": "chris-lake",
  "chris-lake-full-set": "chris-lake",
  // DubVision trance/melodic alias (2026 tour: "performing as HALŌ")
  halo: "dubvision",
  // Hot Since 82 destination films mistaken for a DJ
  "recovery-hot-air-balloon": "hot-since-82",
  "recovery-hot-air-balloon-set": "hot-since-82",
  // MUCHAKK is a Mu540 b2b Mochakk performance nickname, not a DJ
  "muchakk-mu540": "mu540",
  ...PRODUCER_DJ_ALIASES,
};

/** "armin-van-buuren-we1" / "odd-mob-we-2" → real artist slug. */
export function foldWeekendEditionSlug(slug: string): string {
  return slug.replace(/-we-?[12]$/i, "").replace(/-weekend-?[12]$/i, "");
}

/** "laidback-luke-selects" → laidback-luke (show brand, not a second DJ). */
export function foldSelectsSlug(slug: string): string {
  return slug.replace(/-selects$/i, "");
}

/** "chris-lake-full" / "james-hype-full-set" → real artist slug. */
export function foldSetChromeSlug(slug: string): string {
  return slug
    .replace(/-(?:official-)?full(?:-set)?(?:-hd)?$/i, "")
    .replace(/-dj-set$/i, "")
    .replace(/-live-set$/i, "");
}

export function canonicalDjSlug(slug: string): string {
  const folded = foldSetChromeSlug(
    foldSelectsSlug(foldWeekendEditionSlug(slug)),
  );
  return DJ_SLUG_ALIASES[slug] ?? DJ_SLUG_ALIASES[folded] ?? folded;
}
