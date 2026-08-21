import { displayCity } from "@/lib/displayCity";
import type { DjListItem } from "@/lib/queries";

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
  const ch = name.trim().charAt(0).toLocaleUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

export function groupDjsByLetter(djs: DjListItem[]): DjLetterGroup[] {
  const map = new Map<string, DjListItem[]>();
  for (const dj of djs) {
    const letter = djIndexLetter(dj.name);
    const list = map.get(letter);
    if (list) list.push(dj);
    else map.set(letter, [dj]);
  }
  const letters = [...map.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  return letters.map((letter) => ({ letter, djs: map.get(letter) ?? [] }));
}
