/**
 * Split set titles into primary + collaborator artists (b2b / feat / x).
 */

import { slugify, type RawArtist } from "./types";

const STOP_AFTER =
  /\s+(?:live\s+(?:at|from)|@|\||–|—|-)\s+/i;

/** Normalize common collaboration separators to a single token. */
function normalizeCollabSeparators(input: string): string {
  return input
    .replace(/\s+b2b\.?\s+/gi, " b2b ")
    .replace(/\s+vs\.?\s+/gi, " b2b ")
    .replace(/\s+x\s+/gi, " b2b ")
    .replace(/\s+[&+]\s+/g, " b2b ")
    .replace(/\s+feat\.?\s+/gi, " feat ")
    .replace(/\s+ft\.?\s+/gi, " feat ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract the performing-artist portion of a set title before venue/event noise.
 */
export function performingCreditFromTitle(title: string): string {
  const cleaned = title.replace(/\s+/g, " ").trim();
  let m = cleaned.match(/^(.+?)\s+live\s+(?:at|from|@)\s+/i);
  if (m) return m[1].trim();
  m = cleaned.match(/^(.+?)\s+@\s+/);
  if (m) return m[1].trim();
  m = cleaned.match(/^(.+?)\s+[|]\s+/);
  if (m) return m[1].trim();
  m = cleaned.match(/^(.+?)\s+[–—]\s+/);
  if (m) return m[1].trim();
  // "Artist B2B Artist Cafe Mambo …" — keep full string; splitter handles b2b
  return cleaned;
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
    .map((n) => n.replace(/\s*,\s*$/, "").trim())
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
  return /\b(b2b|vs\.?|feat\.?|ft\.?|mixed\s+by)\b|\sx\s|[&+]/i.test(credit);
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

  const prefSlug = preferredPrimary.slug || slugify(preferredPrimary.name);
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
