import { groupByLetter, indexLetter } from "@/lib/alphaIndex";
import { displayCity } from "@/lib/displayCity";
import type { DjListItem } from "@/lib/queries";

export { indexLetter };

export type DjLetterGroup = {
  letter: string;
  djs: DjListItem[];
};

/** Directory card subtitle: #rank · city · N sets. No social shorts. */
export function djCardSubtitle(
  homeCity: string | null | undefined,
  setCount: number,
  rank?: number | null,
): string {
  const city = displayCity(homeCity);
  const sets = `${setCount} ${setCount === 1 ? "set" : "sets"}`;
  const place = city ? `${city} · ${sets}` : sets;
  return rank != null ? `#${rank} · ${place}` : place;
}

export function djIndexLetter(name: string): string {
  return indexLetter(name);
}

export function groupDjsByLetter(djs: DjListItem[]): DjLetterGroup[] {
  return groupByLetter(djs, (dj) => dj.name).map((g) => ({
    letter: g.letter,
    djs: g.items,
  }));
}
