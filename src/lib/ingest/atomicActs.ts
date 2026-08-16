/**
 * Duo / group act names that contain "&" / "and" but must NOT be split into
 * b2b collaborators (e.g. Walker & Royce is one NYC duo, not Walker + Royce).
 *
 * Used by artists.ts before `&` → b2b normalization, and by catalog repair to
 * fold accidental half-name Dj rows onto the canonical act.
 */

export type AtomicAct = {
  /** Canonical display name */
  name: string;
  /** Dj.slug (slugify of name) */
  slug: string;
  /**
   * Accidental solo half-slugs created when `&` was treated as b2b.
   * Never include unrelated artists (e.g. kyle-walker).
   */
  junkSlugs: string[];
};

/** Protect these phrases from collaborator splitting. */
export const ATOMIC_ACTS: AtomicAct[] = [
  {
    name: "Walker & Royce",
    slug: "walker-royce",
    junkSlugs: ["walker", "royce"],
  },
  {
    name: "Chapter & Verse",
    slug: "chapter-verse",
    junkSlugs: ["chapter", "verse"],
  },
  {
    name: "Above & Beyond",
    slug: "above-beyond",
    junkSlugs: ["above", "beyond"],
  },
  {
    name: "Dimitri Vegas & Like Mike",
    slug: "dimitri-vegas-like-mike",
    junkSlugs: ["dimitri-vegas", "like-mike"],
  },
  {
    name: "Lucas & Steve",
    slug: "lucas-steve",
    // Do not junk "steve" — Steve Aoki / Steve Angello are unrelated.
    junkSlugs: [],
  },
];

/** Match "Walker & Royce" / "Walker and Royce" (flexible whitespace). */
export function atomicActPattern(name: string): RegExp {
  // Split on & before escaping so we can accept "and" as well.
  const parts = name
    .trim()
    .split(/\s*&\s*/)
    .map((p) =>
      p
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+"),
    );
  const body = parts.join("(?:\\s*&\\s*|\\s+and\\s+)");
  return new RegExp(body, "gi");
}

/**
 * Replace atomic act phrases with placeholders so `&` / `and` inside them
 * are not turned into b2b separators. Restores canonical names afterward.
 */
export function shieldAtomicActs(input: string): {
  text: string;
  restore: (s: string) => string;
} {
  let text = input;
  const held: string[] = [];
  for (const act of ATOMIC_ACTS) {
    const re = atomicActPattern(act.name);
    text = text.replace(re, () => {
      const token = `__ATOMIC_${held.length}__`;
      held.push(act.name);
      return token;
    });
  }
  return {
    text,
    restore(s: string) {
      let out = s;
      for (let i = 0; i < held.length; i++) {
        out = out.replace(`__ATOMIC_${i}__`, held[i]!);
      }
      return out;
    },
  };
}
