/**
 * Browse clusters for the homepage genre control.
 * Family match includes every child; a child chip narrows to that tag only.
 */

import type { CanonicalGenre } from "./genre";

export const GENRE_FAMILY_IDS = [
  "house",
  "techno",
  "bass",
  "trance",
  "other",
] as const;

export type GenreFamilyId = (typeof GENRE_FAMILY_IDS)[number];

export type GenreFamily = {
  id: GenreFamilyId;
  label: string;
  members: readonly CanonicalGenre[];
};

export const GENRE_FAMILIES: readonly GenreFamily[] = [
  {
    id: "house",
    label: "House",
    members: [
      "House",
      "Tech House",
      "Bass House",
      "Deep House",
      "Afro House",
      "Melodic House",
      "Progressive House",
      "Organic House",
      "Future House",
      "Electro House",
      "Tropical House",
      "Hard House",
      "G-House",
      "Ghetto House",
    ],
  },
  {
    id: "techno",
    label: "Techno",
    members: ["Techno", "Melodic Techno"],
  },
  {
    id: "bass",
    label: "Bass / UK",
    members: [
      "Drum & Bass",
      "UK Garage",
      "Bassline",
      "Dubstep",
      "Trap",
      "Riddim",
      "Midtempo",
      "Future Bass",
      "Melodic Bass",
      "Melodic Dubstep",
    ],
  },
  {
    id: "trance",
    label: "Trance",
    members: ["Trance"],
  },
  {
    id: "other",
    label: "Other",
    members: ["Hip Hop", "Nu-Disco", "Big Room"],
  },
] as const;

const FAMILY_PREFIX = "family:";

const MEMBER_TO_FAMILY: ReadonlyMap<string, GenreFamilyId> = new Map(
  GENRE_FAMILIES.flatMap((f) => f.members.map((m) => [m, f.id] as const)),
);

export function familyIdForGenre(genre: string | null | undefined): GenreFamilyId {
  if (!genre) return "other";
  return MEMBER_TO_FAMILY.get(genre) ?? "other";
}

export function familyFilterValue(id: GenreFamilyId): string {
  return `${FAMILY_PREFIX}${id}`;
}

export function parseFamilyFilter(value: string): GenreFamilyId | null {
  if (!value.startsWith(FAMILY_PREFIX)) return null;
  const id = value.slice(FAMILY_PREFIX.length);
  return GENRE_FAMILY_IDS.includes(id as GenreFamilyId)
    ? (id as GenreFamilyId)
    : null;
}

export function genreFilterLabel(value: string): string {
  if (value === "all") return "All";
  const familyId = parseFamilyFilter(value);
  if (familyId) {
    return GENRE_FAMILIES.find((f) => f.id === familyId)?.label ?? "All";
  }
  return value;
}

/** Catalog genres that belong to a family (unmapped tags land in Other). */
export function catalogGenresInFamily(
  familyId: GenreFamilyId,
  catalog: string[],
): string[] {
  return catalog.filter((g) => familyIdForGenre(g) === familyId);
}

export function familiesPresentInCatalog(catalog: string[]): GenreFamily[] {
  return GENRE_FAMILIES.filter(
    (f) => catalogGenresInFamily(f.id, catalog).length > 0,
  );
}

/**
 * True when a set matches the active genre control.
 * `all` = no filter; `family:house` = any house-family tag; else exact tag.
 */
export function setMatchesGenreFilter(
  set: { genre?: string | null; genres?: string[] | null },
  filter: string,
): boolean {
  if (!filter || filter === "all") return true;
  const tags = (set.genres?.length ? set.genres : [set.genre]).filter(
    (g): g is string => !!g,
  );
  if (tags.length === 0) return false;
  const familyId = parseFamilyFilter(filter);
  if (familyId) return tags.some((g) => familyIdForGenre(g) === familyId);
  return tags.includes(filter);
}
