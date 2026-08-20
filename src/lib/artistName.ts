/**
 * Shared artist-name sanitization / junk detection.
 * Keeps aria-label chrome and form-field text out of the DJ catalog.
 */

import { shieldAtomicActs } from "./ingest/atomicActs";
import { isGenreTagName } from "./genre";
import { isProducerDiscardName } from "./ingest/producerDjReview.data";

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

const MONTH_NAMES =
  "january|february|march|april|may|june|july|august|september|october|november|december";

const MONTH_YEAR_RE = new RegExp(
  `^(${MONTH_NAMES}),?\\s+(19|20)\\d{2}$`,
  "i",
);

const WEEKEND_EDITION_RE = /\s+WE\s*[12]\s*$/i;
const WEEKEND_WORD_RE = /\s+weekend\s*[12]\s*$/i;

const SHOW_WITH_RE = /^(.+?)\s+with\s+(.+)$/i;

/** Radio / party / episode brands that get pasted as the DJ name. */
const SHOW_SERIES_HINT =
  /\b(radio|therapy|sessions?|podcast|residency|presents?|mixes?|invitation|takeover|exclusive|friendship\s+mix|full\s+moon|group\s+therapy|protocol\s+radio|a\s+state\s+of\s+trance|festival|lineup|episode|mixtape|virtual\s+festival|tomorrowland)\b/i;

const UNSHIELDED_COLLAB_SPLIT = /\s+(?:and|b2b|vs\.?)\s+/i;

/** "June, 2026" / "April 2026" — a calendar crumb, never a person. */
export function isMonthYearArtistName(name: string): boolean {
  return MONTH_YEAR_RE.test(name.replace(/\s+/g, " ").trim());
}

/**
 * Drop Tomorrowland-style weekend / stage edition suffixes so
 * "Armin van Buuren WE1" and "Fisher Mainstage WE2" fold to the artist.
 */
export function stripFestivalEditionSuffix(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .trim()
    .replace(WEEKEND_EDITION_RE, "")
    .replace(WEEKEND_WORD_RE, "")
    .replace(/\s+(main\s*stage|mainstage)\s*$/i, "")
    .trim();
}

/** True when the left side of "X with Y" is a show / series, not a person. */
export function looksLikeShowSeriesPrefix(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/\b\d{2,4}\b/.test(n) && /[a-z]/i.test(n)) return true;
  return SHOW_SERIES_HINT.test(n);
}

/**
 * Split a credit on `and` / `b2b` / `vs` after shielding atomic acts
 * so "Above & Beyond and Max Graham" → ["Above & Beyond", "Max Graham"].
 */
export function splitUnshieldedCollabNames(name: string): string[] {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return [];
  const { text, restore } = shieldAtomicActs(n);
  return text
    .split(UNSHIELDED_COLLAB_SPLIT)
    .map((part) => restore(part).replace(/\s+/g, " ").trim())
    .filter((part) => part.length >= 2);
}

export type ShowWithGuestCredit = {
  left: string;
  leftIsShow: boolean;
  guests: string[];
};

/**
 * "Full Moon with Timmy Trumpet" /
 * "Group Therapy 674 with Above & Beyond and Max Graham"
 */
export function parseShowWithGuestCredit(
  name: string,
): ShowWithGuestCredit | null {
  const n = name.replace(/\s+/g, " ").trim();
  const m = n.match(SHOW_WITH_RE);
  if (!m?.[1] || !m[2]) return null;
  const left = m[1].trim();
  const guests = splitUnshieldedCollabNames(m[2].trim());
  if (!left || guests.length === 0) return null;
  return {
    left,
    leftIsShow: looksLikeShowSeriesPrefix(left),
    guests,
  };
}

/** Extra artists after the primary when a Dj.name is a combined credit. */
export function extraArtistsFromCombinedName(name: string): string[] {
  const parsed = parseShowWithGuestCredit(name);
  if (parsed) {
    return parsed.leftIsShow ? parsed.guests.slice(1) : parsed.guests;
  }
  return splitUnshieldedCollabNames(name).slice(1);
}

function hasUnshieldedCollab(name: string): boolean {
  const { text } = shieldAtomicActs(name.replace(/\s+/g, " ").trim());
  return SHOW_WITH_RE.test(text) || UNSHIELDED_COLLAB_SPLIT.test(text);
}

/**
 * Destination-film leftovers mistaken for a person.
 * Hot Since 82's Pirate Ship / Recovery balloon films are Sets (and
 * sometimes a Series cluster) — never a Dj row.
 */
export function isDestinationFilmHostName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/\bhot\s*air\s*balloon\b/i.test(n)) return true;
  if (/\brecovery\s*\(\s*hot\s*air/i.test(n)) return true;
  if (
    /^\s*recovery(\s+[-(].+)?\s*$/i.test(n) &&
    /\b(set|balloon|live)\b/i.test(n)
  ) {
    return true;
  }
  if (/\bpirate\s*ship\b/i.test(n) && !/\bhot\s*since\s*82\b/i.test(n)) {
    return true;
  }
  return false;
}

/** True when the string is UI chrome / form copy, not an artist. */
export function isJunkArtistName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return true;
  if (isProducerDiscardName(n)) return true;
  if (isDestinationFilmHostName(n)) return true;
  if (isMonthYearArtistName(n)) return true;
  if (hasUnshieldedCollab(n)) return true;
  if (WEEKEND_EDITION_RE.test(n) || WEEKEND_WORD_RE.test(n)) return true;
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
  // Festivals / virtual festivals / lineups are never people
  if (/\bfestival\b/i.test(n) || /\blineup\b/i.test(n)) return true;
  // Stage / radio / session / TV series brands mistaken for DJs
  if (/\b(radio\s*)?shorts?\s*$/i.test(n)) return true;
  if (/\bradio\b/i.test(n)) return true;
  if (/\bsessions?\b/i.test(n)) return true;
  if (/\btv\s*$/i.test(n)) return true;
  if (/\bepisode\b/i.test(n) || /\bmixtape\b/i.test(n)) return true;
  if (/\bpresents\b/i.test(n) || /\bpresents?\s*$/i.test(n)) return true;
  if (/\bselects\s*$/i.test(n)) return true;
  if (/\)+$/.test(n) && !n.includes("(")) return true;
  if (/\bfrom scratch\b/i.test(n)) return true;
  if (/\bmakes a\b/i.test(n) && /\btrack\b/i.test(n)) return true;
  if (/\b(tutorial|how\s+to\s+(make|produce|build)|training\s+session)\b/i.test(n)) {
    return true;
  }
  if (/\bchannel\s+by\b/i.test(n)) return true;
  // "Artist at Venue / Festival …" should never be a Dj.name
  if (/\s+at\s+.+/i.test(n) && n.length > 24) return true;
  // Series chrome ("Dom Dolla // Dancefloor Currency", decorative bullets)
  if (/\s+\/\/\s+/.test(n) || /⠶/.test(n)) return true;
  if (/\bwarm\s*up\b/i.test(n)) return true;
  // UI scrape crumbs
  if (/\b(volume\s+control|main\s+navigation)\b/i.test(n)) return true;
  // Hearthis / SC channel titles mistaken for people ("Afro House Late Evening MIX")
  if (/\bmixes?\s*$/i.test(n)) return true;
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
  // Tiny event / publisher accounts mistaken for DJs (not a catalog Event).
  if (/soweto\s*punk/i.test(n)) return true;
  // Set / film leftovers mistaken for DJs ("Behind Cercle…", "Live in …")
  if (isLeftoverHostName(n)) return true;
  // Festival stages mistaken for artists ("Freedom Stage", "Mainstage")
  if (/\bstages?\s*$/i.test(n) || /^main\s*stage$/i.test(n)) return true;
  // Set-title crumbs: "OMNOM EDC Las Vegas 2024", "Artist Tomorrowland 2026"
  if (
    /\b(19|20)\d{2}\s*$/.test(n) &&
    /\b(edc|tomorrowland|ultra|coachella|lollapalooza|parookaville|burning\s*man|hard\s*summer|dreamstate|awakenings|nocturnal|escape|countdown|creamfields|untold|mysteryland|defqon|parklife|time\s*warp)\b/i.test(
      n,
    )
  ) {
    return true;
  }
  if (/\bedc\s+(las\s*vegas|mexico|orlando|china|korea)\b/i.test(n)) {
    return true;
  }
  // Genre tags are not people ("Afro House", "House, Tech", "Minimal")
  if (isGenreTagName(n)) return true;
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
  // "Armin van Buuren WE1" → "Armin van Buuren" before junk reject
  n = stripFestivalEditionSuffix(n);
  // "Goodboys Present" → "Goodboys"
  n = n.replace(/\s+presents?\s*$/i, "").trim();
  // "Laidback Luke SELECTS" → "Laidback Luke" (show brand, not a second DJ)
  n = n.replace(/\s+selects\s*$/i, "").trim();
  // "Chris Lake Full" / "James Hype Official" leftover from set titles
  n = n.replace(/\s+(?:official\s+)?full(?:\s+sets?)?(?:\s+hd)?\s*$/i, "").trim();
  n = n.replace(/\s+(?:official|hd)\s*$/i, "").trim();
  // Scrape leftover: "Ginger)"
  if (/\)+$/.test(n) && !n.includes("(")) n = n.replace(/\)+$/g, "").trim();
  if (/^\(+/.test(n) && !n.includes(")")) n = n.replace(/^\(+/g, "").trim();

  const withCredit = parseShowWithGuestCredit(n);
  if (withCredit) {
    n = withCredit.leftIsShow
      ? (withCredit.guests[0] ?? "")
      : withCredit.left;
  } else {
    const parts = splitUnshieldedCollabNames(n);
    if (parts[0]) n = parts[0];
  }

  if (n.length < 2 || n.length > 60) return null;
  if (!/[a-zA-Z]/.test(n)) return null;
  if (/https?:|www\.|@|^\d+$/.test(n)) return null;
  if (isJunkArtistName(n)) return null;
  return n;
}

/**
 * Set / film / event leftovers still sitting on the DJ handle queue
 * ("Behind Cercle Odyssey…", "Live in Buenos Aires", "Rave Ukraine").
 */
export function isLeftoverHostName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/^behind\b/i.test(n)) return true;
  if (/^live\s+in\b/i.test(n)) return true;
  if (/^rave\s+ukraine\b/i.test(n)) return true;
  if (/\bcontinuous\s+mix\b/i.test(n)) return true;
  if (/knee\s+deep\s+in\s+ibiza/i.test(n)) return true;
  if (/\bof\s+ezra\s+collective\b/i.test(n)) return true;
  if (/^le\s+grand\s+brand$/i.test(n)) return true;
  // "Chris Lake Full" / "James Hype Official" — title chrome, not a second DJ
  if (/\s+(?:official|full|hd)\s*$/i.test(n)) return true;
  return false;
}

/** Festival stage mistaken for a person ("Freedom Stage", "Mainstage"). */
export function isStageArtistName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/\b(radio\s*)?shorts?\s*$/i.test(n)) return false;
  return /\bstages?\s*$/i.test(n) || /^main\s*stage$/i.test(n);
}

/** Radio / session / TV host mistaken for a person. */
export function isRadioArtistName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/\b(radio\s*)?shorts?\s*$/i.test(n)) return false;
  if (isStageArtistName(n)) return false;
  return (
    /\bradio\b/i.test(n) ||
    /\bsessions?\b/i.test(n) ||
    /\btv\s*$/i.test(n) ||
    /\bchannel\s+by\b/i.test(n)
  );
}

/** Tutorial / Shorts / "makes a track" — not a DJ set and not an artist. */
export function isNonSetCredit(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/\b(radio\s*)?shorts?\s*$/i.test(n)) return true;
  if (/\bfrom scratch\b/i.test(n)) return true;
  if (/\bmakes a\b/i.test(n) && /\btrack\b/i.test(n)) return true;
  if (/\b(tutorial|how\s+to\s+(make|produce|build)|training\s+session)\b/i.test(n)) {
    return true;
  }
  return false;
}
