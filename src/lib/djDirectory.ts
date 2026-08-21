import { groupByLetter, indexLetter } from "@/lib/alphaIndex";
import { displayCity } from "@/lib/displayCity";
import type { DjListItem } from "@/lib/queries";

export { indexLetter };

export type DjLetterGroup = {
  letter: string;
  djs: DjListItem[];
};

/** Directory card subtitle: city when we have one, then set count. No social shorts. */
export function djCardSubtitle(
  homeCity: string | null | undefined,
  setCount: number,
): string {
  const city = displayCity(homeCity);
  const sets = `${setCount} ${setCount === 1 ? "set" : "sets"}`;
  return city ? `${city} · ${sets}` : sets;
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
