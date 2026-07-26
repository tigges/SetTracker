/**
 * Canonical music genres for setradar.
 * - 1–2 word labels (plus a few hyphen/ampersand forms)
 * - Dedupes case/spacing/synonyms
 * - Splits compound tags ("Melodic House & Techno" → Melodic House + Techno)
 * - Drops format tags (guestmix, liveset, …)
 */

/** Display forms shown in UI / stored in DB after normalize. */
export const CANONICAL_GENRES = [
  "House",
  "Tech House",
  "Bass House",
  "Deep House",
  "Afro House",
  "Melodic House",
  "Future House",
  "Progressive House",
  "Organic House",
  "Electro House",
  "Tropical House",
  "Hard House",
  "G-House",
  "Ghetto House",
  "Techno",
  "Trance",
  "UK Garage",
  "Drum & Bass",
  "Hip Hop",
  "Trap",
  "Dubstep",
  "Future Bass",
  "Bassline",
  "Riddim",
  "Midtempo",
  "Nu-Disco",
  "Melodic Bass",
  "Melodic Dubstep",
] as const;

export type CanonicalGenre = (typeof CANONICAL_GENRES)[number];

/** Synonym / shorthand → canonical display. */
const SYNONYMS: Record<string, CanonicalGenre> = {
  house: "House",
  "tech house": "Tech House",
  techhouse: "Tech House",
  "tech-house": "Tech House",
  "bass house": "Bass House",
  basshouse: "Bass House",
  "bass-house": "Bass House",
  bass: "Bass House",
  "uk bass": "Bass House",
  ukbass: "Bass House",
  "deep house": "Deep House",
  deephouse: "Deep House",
  "deep-house": "Deep House",
  "afro house": "Afro House",
  afrohouse: "Afro House",
  "afro-house": "Afro House",
  afro: "Afro House",
  "melodic house": "Melodic House",
  melodichouse: "Melodic House",
  melodic: "Melodic House",
  "future house": "Future House",
  futurehouse: "Future House",
  "progressive house": "Progressive House",
  progressivehouse: "Progressive House",
  progressive: "Progressive House",
  "organic house": "Organic House",
  organichouse: "Organic House",
  "electro house": "Electro House",
  electrohouse: "Electro House",
  electro: "Electro House",
  "tropical house": "Tropical House",
  "hard house": "Hard House",
  hardhouse: "Hard House",
  "g house": "G-House",
  ghouse: "G-House",
  "g-house": "G-House",
  "ghetto house": "Ghetto House",
  ghettohouse: "Ghetto House",
  techno: "Techno",
  trance: "Trance",
  psytrance: "Trance",
  "psy trance": "Trance",
  "uk garage": "UK Garage",
  ukgarage: "UK Garage",
  ukg: "UK Garage",
  garage: "UK Garage",
  "drum bass": "Drum & Bass",
  "drum and bass": "Drum & Bass",
  "drum n bass": "Drum & Bass",
  dnb: "Drum & Bass",
  "d n b": "Drum & Bass",
  "d&b": "Drum & Bass",
  "hip hop": "Hip Hop",
  hiphop: "Hip Hop",
  "hip-hop": "Hip Hop",
  rap: "Hip Hop",
  trap: "Trap",
  dubstep: "Dubstep",
  "future bass": "Future Bass",
  futurebass: "Future Bass",
  bassline: "Bassline",
  "bass line": "Bassline",
  riddim: "Riddim",
  midtempo: "Midtempo",
  "mid tempo": "Midtempo",
  "nu disco": "Nu-Disco",
  nudisco: "Nu-Disco",
  "nu-disco": "Nu-Disco",
  "melodic bass": "Melodic Bass",
  "melodic dubstep": "Melodic Dubstep",
  // Vague / marketing → nearest music genre
  dance: "House",
  edm: "House",
  club: "House",
  electronic: "House",
  electronica: "House",
};

/** Format / medium tags that are not music genres. */
const REJECT_EXACT = new Set([
  "guestmix",
  "guest mix",
  "guest-mix",
  "guest mixs",
  "guest mixes",
  "liveset",
  "live set",
  "live-set",
  "livesets",
  "live sets",
  "live",
  "dj set",
  "djset",
  "dj sets",
  "dj mix",
  "mix",
  "mixes",
  "set",
  "sets",
  "b2b",
  "radio",
  "podcast",
  "podcasts",
  "premiere",
  "bootleg",
  "edit",
  "remix",
  "free download",
  "download",
  "promo",
  "music",
  "other",
  "various",
  "undefined",
  "null",
  "n a",
  "na",
  "id",
  "unknown",
  "iix",
  "misc",
  "miscellaneous",
  "top 40",
  "top40",
  "pop",
  "rock",
  "metal",
  "jazz",
  "classical",
  "ambient",
  "soundtrack",
]);

const REJECT_CONTAINS = [
  "guestmix",
  "guest mix",
  "liveset",
  "live set",
  "dj set",
  "podcast",
  "free download",
];

/** Collapse to a comparison key. */
export function genreKey(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(display: string): number {
  return display
    .replace(/&/g, "")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean).length;
}

function lookupKey(key: string): CanonicalGenre | null {
  if (!key) return null;
  if (REJECT_EXACT.has(key)) return null;
  for (const frag of REJECT_CONTAINS) {
    if (key === frag || key.startsWith(`${frag} `) || key.endsWith(` ${frag}`)) {
      return null;
    }
  }
  return SYNONYMS[key] ?? CANONICAL_BY_KEY.get(key) ?? null;
}

const CANONICAL_BY_KEY = new Map<string, CanonicalGenre>(
  CANONICAL_GENRES.map((g) => [genreKey(g), g]),
);

/** Longest-first matchers for greedy multi-genre blobs. */
const MATCHERS: Array<{ words: string[]; genre: CanonicalGenre }> = (() => {
  const keys = new Set<string>([
    ...Object.keys(SYNONYMS),
    ...CANONICAL_GENRES.map((g) => genreKey(g)),
  ]);
  return [...keys]
    .map((key) => ({
      words: key.split(" ").filter(Boolean),
      genre: lookupKey(key)!,
    }))
    .filter((m) => m.genre && m.words.length > 0)
    .sort(
      (a, b) =>
        b.words.length - a.words.length ||
        a.words.join(" ").localeCompare(b.words.join(" ")),
    );
})();

function uniqueGenres(list: CanonicalGenre[]): CanonicalGenre[] {
  const seen = new Set<CanonicalGenre>();
  const out: CanonicalGenre[] = [];
  for (const g of list) {
    if (seen.has(g)) continue;
    seen.add(g);
    out.push(g);
  }
  return out;
}

function expandWordBlob(key: string): CanonicalGenre[] {
  const words = key.split(" ").filter(Boolean);
  if (words.length === 0) return [];
  // Skip pure reject blobs
  if (REJECT_EXACT.has(key)) return [];
  for (const frag of REJECT_CONTAINS) {
    if (key.includes(frag)) return [];
  }

  const out: CanonicalGenre[] = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (const m of MATCHERS) {
      if (i + m.words.length > words.length) continue;
      let ok = true;
      for (let j = 0; j < m.words.length; j++) {
        if (words[i + j] !== m.words[j]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      out.push(m.genre);
      i += m.words.length;
      matched = true;
      break;
    }
    if (!matched) i += 1; // drop unknown token (e.g. junk)
  }
  return uniqueGenres(out);
}

/**
 * Expand a freeform tag into one or more canonical genres.
 * "Melodic House & Techno" → [Melodic House, Techno]
 * "Trance Techno Hard house" → [Trance, Techno, Hard House]
 * "GUESTMIX" / "Live Set" → []
 */
export function expandGenres(
  raw: string | null | undefined,
): CanonicalGenre[] {
  if (raw == null) return [];
  const trimmed = String(raw).trim();
  if (!trimmed) return [];

  const wholeKey = genreKey(trimmed);
  if (!wholeKey) return [];
  if (REJECT_EXACT.has(wholeKey)) return [];
  for (const frag of REJECT_CONTAINS) {
    // Whole-tag format noise (not "Hard House" etc.)
    if (wholeKey === frag) return [];
    if (
      wholeKey === `guest ${frag}` ||
      /^(guest ?mix|live ?sets?|dj ?sets?)$/i.test(wholeKey)
    ) {
      return [];
    }
  }
  // Exact guestmix / liveset variants often arrive as the entire tag.
  if (
    /guest\s*mix/.test(wholeKey) ||
    /live\s*sets?/.test(wholeKey) ||
    /^livesets?$/.test(wholeKey)
  ) {
    return [];
  }

  const direct = lookupKey(wholeKey);
  if (direct) return [direct];

  // Split compound labels on & / , ; and "and" between genre-sized parts.
  const parts = trimmed
    .split(/\s*(?:[/|,;]+|\band\b|&)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    const fromParts: CanonicalGenre[] = [];
    for (const part of parts) {
      const key = genreKey(part);
      const hit = lookupKey(key);
      if (hit) fromParts.push(hit);
      else fromParts.push(...expandWordBlob(key));
    }
    const uniq = uniqueGenres(fromParts);
    if (uniq.length) return uniq;
  }

  return expandWordBlob(wholeKey);
}

/**
 * Primary genre for storage / card display (first expanded match).
 */
export function normalizeGenre(
  raw: string | null | undefined,
): CanonicalGenre | null {
  return expandGenres(raw)[0] ?? null;
}

/** Normalize a list for filter chips (deduped, stable order). */
export function normalizeGenreList(genres: string[]): CanonicalGenre[] {
  const seen = new Set<CanonicalGenre>();
  const out: CanonicalGenre[] = [];
  for (const g of genres) {
    for (const n of expandGenres(g)) {
      if (seen.has(n)) continue;
      seen.add(n);
      out.push(n);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

/** For tests / docs — ensure every canonical form round-trips. */
export function assertCanonicalWordBudget(): void {
  for (const g of CANONICAL_GENRES) {
    const n = wordCount(g);
    if (n < 1 || n > 2) {
      throw new Error(`Canonical genre "${g}" has ${n} words (want 1–2)`);
    }
  }
}

type GenreRowClient = {
  set: {
    findMany: (args: {
      select: { id: true; genre: true };
      where: { genre: { not: null } };
    }) => Promise<{ id: string; genre: string | null }[]>;
    update: (args: {
      where: { id: string };
      data: { genre: string | null };
    }) => Promise<unknown>;
  };
  track: {
    findMany: (args: {
      select: { id: true; genre: true };
      where: { genre: { not: null } };
    }) => Promise<{ id: string; genre: string | null }[]>;
    update: (args: {
      where: { id: string };
      data: { genre: string | null };
    }) => Promise<unknown>;
  };
};

/** Rewrite Set/Track genre columns to canonical forms (or null). */
export async function rewriteStoredGenres(
  prisma: GenreRowClient,
): Promise<{ sets: number; tracks: number }> {
  let sets = 0;
  let tracks = 0;

  const setRows = await prisma.set.findMany({
    where: { genre: { not: null } },
    select: { id: true, genre: true },
  });
  for (const row of setRows) {
    const next = normalizeGenre(row.genre);
    if ((row.genre ?? null) === (next ?? null)) continue;
    await prisma.set.update({ where: { id: row.id }, data: { genre: next } });
    sets += 1;
  }

  const trackRows = await prisma.track.findMany({
    where: { genre: { not: null } },
    select: { id: true, genre: true },
  });
  for (const row of trackRows) {
    const next = normalizeGenre(row.genre);
    if ((row.genre ?? null) === (next ?? null)) continue;
    await prisma.track.update({
      where: { id: row.id },
      data: { genre: next },
    });
    tracks += 1;
  }

  return { sets, tracks };
}
