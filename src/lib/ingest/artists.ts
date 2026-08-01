/**
 * Split set titles into primary + collaborator artists (b2b / feat / x).
 *
 * Known duos/groups with "&" in the name (Walker & Royce, …) are shielded via
 * `atomicActs` so they stay one credit — not Walker b2b Royce.
 */

import { shieldAtomicActs } from "./atomicActs";
import { slugify, type RawArtist } from "./types";

const STOP_AFTER =
  /\s+(?:live\s+(?:at|from)|@|\||–|—|-|\/\/)\s+/i;

/** Normalize common collaboration separators to a single token. */
function normalizeCollabSeparators(input: string): string {
  const { text, restore } = shieldAtomicActs(input);
  const normalized = text
    .replace(/\s+b2b\.?\s+/gi, " b2b ")
    .replace(/\s+vs\.?\s+/gi, " b2b ")
    .replace(/\s+x\s+/gi, " b2b ")
    .replace(/\s+[&+]\s+/g, " b2b ")
    .replace(/\s+feat\.?\s+/gi, " feat ")
    .replace(/\s+ft\.?\s+/gi, " feat ")
    .replace(/\s+/g, " ")
    .trim();
  return restore(normalized);
}

/**
 * Drop trailing set/stream descriptors left after venue cuts
 * ("Biscits DJ Set", "Biscits Tech House DJ Set", "BISCITS Live Stream").
 */
export function tidyPerformingCredit(name: string): string {
  return name
    .replace(/[⠶✦★☆●◆]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    // Series / mixtape after "//" ("Dom Dolla // Dancefloor Currency")
    .replace(/\s+\/\/\s+.+$/i, "")
    .replace(
      /\s+(?:tech\s+house\s+|bass\s+house\s+|house\s+)?(?:dj\s*)?sets?\b.*$/i,
      "",
    )
    .replace(/\s+for\s+.+$/i, "")
    // Venue / festival after bare "at" (also after a prior `|` cut)
    .replace(/\s+at\s+.+$/i, "")
    .replace(/\s*(?:[-–—:|]\s*)+(?:live\s*)?streams?\b.*$/i, "")
    .replace(/\s+(?:live\s*)?streams?\b.*$/i, "")
    // "Dom Dolla Warm Up", "Odd Mob Live", "YOU TOUR MIX"
    .replace(/\s+warm\s*ups?\b.*$/i, "")
    .replace(/\s+\(?\s*live\b.*$/i, "")
    .replace(/\s+tour\s*mix\b.*$/i, "")
    // Tomorrowland weekend markers leaked into credits
    // ("Nico Moreno WE2", "Odd Mob WE1") — never part of the artist name.
    .replace(/\s+WE[12]\b.*$/i, "")
    .replace(/\s+W[12]\b(?:\s|$)/i, " ")
    .replace(/\s*[|–—:-]+\s*$/g, "")
    .trim();
}

/**
 * True when a credit looks like an event / stage / radio series — not a person.
 * Used to flip "Festival 4.0 - Dom Dolla" → Dom Dolla.
 */
export function looksLikeEventOrSeriesCredit(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return true;
  return (
    /\bfestival\b/i.test(n) ||
    /\blineup\b/i.test(n) ||
    /\bstages?\b/i.test(n) ||
    /^main\s*stage\b/i.test(n) ||
    /\bradio\b/i.test(n) ||
    /\b(radio\s*)?shorts?\b/i.test(n) ||
    /\bsessions?\b/i.test(n) ||
    /\btv\b/i.test(n) ||
    /\bpodcast\b/i.test(n) ||
    /\bepisode\b/i.test(n) ||
    /\bmixtape\b/i.test(n) ||
    /\bpresents\b/i.test(n) ||
    /\bvirtual\s+festival\b/i.test(n) ||
    /\btomorrowland\b/i.test(n) ||
    /\blive\s*$/i.test(n)
  );
}

function artistFromPresentedBy(tail: string): string | null {
  const m = tail.match(/\bpresented by\s+(.+?)$/i);
  if (!m?.[1]) return null;
  return tidyPerformingCredit(
    m[1]
      .split(/[|,]/)[0]!
      .replace(/\s+and\s+.+$/i, "")
      .trim(),
  );
}

function artistFromBySuffix(text: string): string | null {
  const m = text.match(/\bby\s+(.+?)$/i);
  if (!m?.[1]) return null;
  const bit = m[1]
    .replace(/\s*[\[(#].*$/, "")
    .replace(/\s*[–—|-].*$/, "")
    .trim();
  if (!bit || looksLikeEventOrSeriesCredit(bit)) return null;
  return tidyPerformingCredit(bit);
}

/**
 * Extract the performing-artist portion of a set title before venue/event noise.
 */
export function performingCreditFromTitle(title: string): string {
  const cleaned = title
    .replace(/[⠶✦★☆●◆]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Tomorrowland Friendship Mix with Sara Landry - July, 2026
  let m = cleaned.match(
    /\bfriendship\s+mix\s+with\s+(.+?)(?:\s*[-–—|,]|\s+july|\s+june|\s+may|\s+april|\s+august|\s*$)/i,
  );
  if (m?.[1]) return tidyPerformingCredit(m[1]!);
  // Hardwell presents Euphoria - July, 2026
  m = cleaned.match(/^(.+?)\s+presents\b/i);
  if (m?.[1] && !looksLikeEventOrSeriesCredit(m[1]!)) {
    return tidyPerformingCredit(m[1]!);
  }
  // Academy Student Mix: David Herrlich / JBL Academy Mix: …
  m = cleaned.match(/\b(?:student\s+)?mix:\s*(.+?)(?:\s*[-–—]|\s*$)/i);
  if (m?.[1] && !looksLikeEventOrSeriesCredit(m[1]!)) {
    const head = m[1]!.split(/\s*(?:,|\sand\s+)\s*/)[0]!;
    return tidyPerformingCredit(head);
  }
  m = cleaned.match(/^(.+?)\s+live\s+(?:at|from|@)\s+/i);
  if (m) return tidyPerformingCredit(m[1]!);
  m = cleaned.match(/^(.+?)\s+@\s+/);
  if (m) return tidyPerformingCredit(m[1]!);
  m = cleaned.match(/^(.+?)\s+[|]\s+/);
  if (m) {
    const left = m[1]!.trim();
    // "Series | Episode 156 - Deep House" — left is often the show, not the DJ
    if (looksLikeEventOrSeriesCredit(left)) {
      const by = artistFromBySuffix(cleaned);
      if (by) return by;
    }
    return tidyPerformingCredit(left);
  }
  // "Defected Virtual Festival 4.0 - Dom Dolla" → Dom Dolla (event on left)
  m = cleaned.match(/^(.+?)\s+[–—-]\s+(.+)$/);
  if (m) {
    const left = m[1]!.trim();
    const right = m[2]!.trim();
    if (looksLikeEventOrSeriesCredit(left)) {
      const presented = artistFromPresentedBy(right);
      if (presented) return presented;
      const rightHead = right.split(/\s+[|]\s+/)[0]!.trim();
      if (
        rightHead &&
        !looksLikeEventOrSeriesCredit(rightHead) &&
        !/^\d{4}\b/.test(rightHead)
      ) {
        return tidyPerformingCredit(rightHead);
      }
    }
    return tidyPerformingCredit(left);
  }
  // Series titles: "Dom Dolla // Dancefloor Currency"
  m = cleaned.match(/^(.+?)\s+\/\/\s+/);
  if (m) return tidyPerformingCredit(m[1]!);
  // "A b2b B at Venue" — keep credits, drop venue tail
  m = cleaned.match(/^(.+?\s+b2b\s+.+?)\s+at\s+/i);
  if (m) return tidyPerformingCredit(m[1]!);
  // Bare venue cut: "Odd Mob at Seismic…", "Charlotte de Witte at AMF…"
  m = cleaned.match(/^(.+?)\s+at\s+/i);
  if (m) return tidyPerformingCredit(m[1]!);
  // "Sunk Afinity Sessions by Japhet Be"
  const by = artistFromBySuffix(cleaned);
  if (by && looksLikeEventOrSeriesCredit(cleaned.replace(/\bby\s+.+$/i, ""))) {
    return by;
  }
  // "Artist B2B Artist Cafe Mambo …" — keep full string; splitter handles b2b
  return tidyPerformingCredit(cleaned);
}

export type SplitArtists = {
  primary: RawArtist;
  collaborators: RawArtist[];
};

/**
 * Split a credit string into primary + collaborators.
 * Prefers explicit `b2b` / `feat` tokens after normalization.
 */
export function splitArtistCredit(
  credit: string,
  extras: Partial<RawArtist> = {},
): SplitArtists {
  const head = normalizeCollabSeparators(credit);
  // Drop trailing event crumbs if still present
  const cut = head.split(STOP_AFTER)[0]?.trim() || head;

  const featParts = cut.split(/\s+feat\s+/i);
  const main = featParts[0] ?? cut;
  const featured = featParts.slice(1).flatMap((p) =>
    p.split(/\s+b2b\s+/i).map((x) => x.trim()).filter(Boolean),
  );

  const b2b = main
    .split(/\s+b2b\s+/i)
    .map((x) => x.trim())
    .filter(Boolean);

  const names = [...b2b, ...featured]
    .map((n) =>
      n
        .replace(/\s*:.*$/, "") // "Max Mylo: In The Loop at Academy…"
        .replace(/\s*,\s*$/, "")
        .trim(),
    )
    .filter((n) => n.length >= 2 && n.length <= 80);

  // Dedupe case-insensitively, preserve order
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const n of names) {
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(n);
  }

  if (unique.length === 0) {
    const name = cut || credit.trim() || "Unknown";
    return {
      primary: { name, slug: slugify(name), ...extras },
      collaborators: [],
    };
  }

  const [first, ...rest] = unique;
  return {
    primary: { name: first, slug: slugify(first), ...extras },
    collaborators: rest.map((name) => ({
      name,
      slug: slugify(name),
      accent: extras.accent,
    })),
  };
}

/** Convenience: title → primary + collaborators. */
export function splitArtistsFromSetTitle(
  title: string,
  extras: Partial<RawArtist> = {},
): SplitArtists {
  return splitArtistCredit(performingCreditFromTitle(title), extras);
}

function hasCollabToken(credit: string): boolean {
  // Ignore `&` inside shielded duo names (Walker & Royce, …).
  const { text } = shieldAtomicActs(credit);
  return /\b(b2b|vs\.?|feat\.?|ft\.?|mixed\s+by)\b|\sx\s|[&+]/i.test(text);
}

/** "Brand Mixed By A & B [#001]" → guest mixer names. */
export function guestsFromMixedBy(title: string): string[] {
  const m = title.match(
    /\bmixed\s+by\s+(.+?)(?:\s*[\[(#]|\s*$)/i,
  );
  if (!m?.[1]) return [];
  return m[1]
    .split(/\s*[&+,]\s*|\s+and\s+/i)
    .map((n) => n.replace(/\s+/g, " ").trim())
    .filter((n) => n.length >= 2 && n.length <= 60);
}

/**
 * Resolve set artists: keep a preferred primary (show/curated DJ) when present,
 * and only attach collaborators when the title carries an explicit collab token.
 */
export function artistsForSet(
  title: string,
  preferredPrimary?: RawArtist,
  extras: Partial<RawArtist> = {},
): SplitArtists {
  const credit = performingCreditFromTitle(title);
  const split = splitArtistCredit(credit, extras);

  if (!preferredPrimary) return split;

  // Festival brand accounts must not stick as the performing DJ.
  const prefSlug = preferredPrimary.slug || slugify(preferredPrimary.name);
  if (
    looksLikeEventOrSeriesCredit(preferredPrimary.name) ||
    /\b(tomorrowland|insomniac|boiler\s*room|ultra)\b/i.test(
      preferredPrimary.name,
    )
  ) {
    return split;
  }
  const primary: RawArtist = {
    ...preferredPrimary,
    slug: prefSlug,
    accent: preferredPrimary.accent ?? extras.accent,
  };

  const mixedBy = guestsFromMixedBy(title);
  if (mixedBy.length) {
    return {
      primary,
      collaborators: mixedBy
        .filter(
          (n) =>
            slugify(n) !== prefSlug &&
            n.toLowerCase() !== preferredPrimary.name.toLowerCase(),
        )
        .map((name) => ({
          name,
          slug: slugify(name),
          accent: extras.accent ?? preferredPrimary.accent,
        })),
    };
  }

  if (!hasCollabToken(credit)) {
    return { primary, collaborators: [] };
  }

  const all = [split.primary, ...split.collaborators];
  const collaborators = all.filter(
    (a) =>
      a.slug !== prefSlug &&
      a.name.toLowerCase() !== preferredPrimary.name.toLowerCase(),
  );
  return { primary, collaborators };
}
