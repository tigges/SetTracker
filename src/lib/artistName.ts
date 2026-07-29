/**
 * Shared artist-name sanitization / junk detection.
 * Keeps aria-label chrome and form-field text out of the DJ catalog.
 */

import { expandGenres, genreKey } from "./genre";

/** True when the whole string is exactly one canonical genre (e.g. "Afro House"). */
function isGenreOnlyName(name: string): boolean {
  const genres = expandGenres(name);
  if (genres.length !== 1) return false;
  return genreKey(genres[0]!) === genreKey(name);
}

const A11Y_PREFIXES = [
  /^view artist details for\s+/i,
  /^view details for\s+/i,
  /^go to artist(?:\s+page)?(?:\s+for)?\s+/i,
  /^open artist(?:\s+page)?(?:\s+for)?\s+/i,
  /^see artist(?:\s+details)?(?:\s+for)?\s+/i,
  /^artist details for\s+/i,
];

const JUNK_NAME =
  /^(enter your (email|name|password|phone)|click here|learn more|read more|sign up|log ?in|subscribe|cookie|privacy|terms|navigation menu|menu|search|home|close|submit|loading|untitled|unknown|null|undefined|n\/?a)$/i;

/** True when the string is UI chrome / form copy, not an artist. */
export function isJunkArtistName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return true;
  if (A11Y_PREFIXES.some((re) => re.test(n))) return true;
  if (JUNK_NAME.test(n)) return true;
  if (/navigation menu$/i.test(n)) return true;
  if (/^view artist details\b/i.test(n)) return true;
  if (/^enter your email/i.test(n)) return true;
  // Slug form of the Insomniac aria-label flood
  if (/^view-artist-details-for-/.test(n.toLowerCase())) return true;
  // Set-title leftovers used as artist names ("AC Slater DJ Mix")
  if (/\b(dj\s*(mix|set)|live\s*set|radio\s*show)\s*$/i.test(n)) return true;
  // Festival mega-mix / Night Owl episode crumbs as fake DJs
  if (/\bmega[-\s]?mix\b/i.test(n)) return true;
  if (/\bpodcast\b/i.test(n) || /\bdownload\s+now\b/i.test(n)) return true;
  // "Artist at Venue / Festival …" should never be a Dj.name
  if (/\s+at\s+.+/i.test(n) && n.length > 24) return true;
  // Series chrome ("Dom Dolla // Dancefloor Currency", decorative bullets)
  if (/\s+\/\/\s+/.test(n) || /⠶/.test(n)) return true;
  if (/\bwarm\s*up\b/i.test(n)) return true;
  // Hearthis / SC channel titles mistaken for people ("Afro House Late Evening MIX")
  if (/\bmix\s*$/i.test(n)) return true;
  if (/\b(special\s+edition|hors\s+s[ée]rie)\b/i.test(n)) return true;
  if (/\b(late|early)\s+(evening|morning|night|afternoon)\b/i.test(n)) {
    return true;
  }
  if (
    /\b(afro|tech|deep|bass|melodic|organic|progressive|electro|tropical|hard)\s*house\b/i.test(
      n,
    ) &&
    /\b(mix|set|vibes|session|edition)\b/i.test(n)
  ) {
    return true;
  }
  // Date / "(DJ) 18.04.2025" scrape crumbs
  if (/^\(?\s*dj\s*\)?\s*\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}\s*$/i.test(n)) {
    return true;
  }
  if (/^\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}$/.test(n)) return true;
  // Clubs / venues that must never become Dj rows (see KNOWN_EVENTS.djoon).
  if (/^dj[øöo]{1,2}n$/i.test(n.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""))) {
    return true;
  }
  // Festival stages mistaken for artists ("Freedom Stage", "Mainstage")
  if (/\bstages?\s*$/i.test(n) || /^main\s*stage$/i.test(n)) return true;
  // Genre tags are not people ("Afro House", "Tech House")
  if (isGenreOnlyName(n)) return true;
  return false;
}

/**
 * Strip a11y prefixes and reject leftover junk.
 * Returns null when the name should not become a Dj row.
 */
export function sanitizeArtistName(raw: string): string | null {
  let n = raw
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .replace(/H[øöØÖ]rger/g, "Horger")
    .trim();

  for (const re of A11Y_PREFIXES) {
    n = n.replace(re, "").trim();
  }

  // Trailing live/dj-set crumbs from lineup cards
  n = n.replace(/\s+[–—|-]\s+(live|dj set|b2b).*$/i, "").trim();

  if (n.length < 2 || n.length > 60) return null;
  if (!/[a-zA-Z]/.test(n)) return null;
  if (/https?:|www\.|@|^\d+$/.test(n)) return null;
  if (isJunkArtistName(n)) return null;
  return n;
}
