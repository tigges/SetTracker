/**
 * Canonical music genres for setradar.
 * - 1–2 word labels (plus a few hyphen/ampersand forms)
 * - Dedupes case/spacing/synonyms
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

const CANONICAL_BY_KEY = new Map<string, CanonicalGenre>(
  CANONICAL_GENRES.map((g) => [genreKey(g), g]),
);

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
  "liveset",
  "live set",
  "live-set",
  "livesets",
  "live sets",
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
  // Hyphenated tokens count as one word (G-House, Nu-Disco).
  return display
    .replace(/&/g, "")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean).length;
}

/**
 * Map a freeform source tag to a canonical 1–2 word genre, or null.
 */
export function normalizeGenre(
  raw: string | null | undefined,
): CanonicalGenre | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  const key = genreKey(trimmed);
  if (!key) return null;
  if (REJECT_EXACT.has(key)) return null;
  for (const frag of REJECT_CONTAINS) {
    if (key.includes(frag)) return null;
  }

  const fromSynonym = SYNONYMS[key];
  if (fromSynonym) return fromSynonym;

  const fromCanonical = CANONICAL_BY_KEY.get(key);
  if (fromCanonical) return fromCanonical;

  // Title-case attempt for already-short unknown tags — only if 1–2 words
  // and every token looks like a word (no slash soup).
  const words = key.split(" ");
  if (words.length >= 1 && words.length <= 2 && !/[\/,]/.test(trimmed)) {
    // Reject obvious non-genre leftovers
    if (words.some((w) => REJECT_EXACT.has(w))) return null;
  }

  return null;
}

/** Normalize a list for filter chips (deduped, stable order). */
export function normalizeGenreList(genres: string[]): CanonicalGenre[] {
  const seen = new Set<CanonicalGenre>();
  const out: CanonicalGenre[] = [];
  for (const g of genres) {
    const n = normalizeGenre(g);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
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
