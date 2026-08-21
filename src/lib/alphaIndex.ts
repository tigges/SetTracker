/** A–Z jump index shared by DJ and label directories. */

export type LetterGroup<T> = {
  letter: string;
  items: T[];
};

export function indexLetter(name: string): string {
  const ch = name.trim().charAt(0).toLocaleUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

export function groupByLetter<T>(
  items: T[],
  nameOf: (item: T) => string,
): LetterGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const letter = indexLetter(nameOf(item));
    const list = map.get(letter);
    if (list) list.push(item);
    else map.set(letter, [item]);
  }
  const letters = [...map.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  return letters.map((letter) => ({
    letter,
    items: (map.get(letter) ?? []).slice().sort((a, b) =>
      nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: "base" }),
    ),
  }));
}
