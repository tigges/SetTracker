/**
 * Duo / group act names that contain "&" / "and" but must NOT be split into
 * b2b collaborators (e.g. Walker & Royce is one NYC duo, not Walker + Royce).
 *
 * Used by artists.ts before `&` → b2b normalization, and by catalog repair to
 * fold accidental half-name Dj rows onto the canonical act.
 *
 * Default performer is the team. Solo member sets / profiles may still exist
 * under a distinct slug (or a leftover half-slug that still has solo sets).
 */

export type AtomicAct = {
  /** Canonical display name */
  name: string;
  /** Dj.slug (slugify of name) */
  slug: string;
  /**
   * Accidental solo half-slugs created when `&` was treated as b2b.
   * Never include unrelated artists (e.g. kyle-walker, steve-aoki).
   */
  junkSlugs: string[];
  website?: string;
  homeCity?: string;
  bio?: string;
  genre?: string;
  accent?: string;
};

export const LUCAS_STEVE_BIO =
  "Lucas & Steve are a Dutch house music duo formed by DJs and record producers Lucas de Wert and Steven Jansen from Maastricht. The duo was formed in 2010 and joined Spinnin' Records in December 2014. They released many singles on the sub-label Spinnin' Deep.";

/** Protect these phrases from collaborator splitting. */
export const ATOMIC_ACTS: AtomicAct[] = [
  {
    name: "Walker & Royce",
    slug: "walker-royce",
    junkSlugs: ["walker", "royce"],
    website: "https://www.walkerandroyce.com/",
    homeCity: "New York, US",
    bio: "Tech House. NYC duo (Sam Walker & Gavin Royce).",
    accent: "#9ef01a",
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
    // Fold leftover "lucas" (LLM / completeness half). Do not junk "steve" —
    // Steve Aoki / Steve Angello are unrelated.
    junkSlugs: ["lucas"],
    website: "https://www.lucasandsteve.com/",
    homeCity: "Maastricht, Netherlands",
    bio: LUCAS_STEVE_BIO,
    genre: "House",
    accent: "#ffb703",
  },
];

export function atomicActBySlug(slug: string): AtomicAct | undefined {
  const key = slug.trim().toLowerCase();
  return ATOMIC_ACTS.find((a) => a.slug === key);
}

/** Accidental duo-half slug ("lucas") → the team act. */
export function atomicActByJunkSlug(slug: string): AtomicAct | undefined {
  const key = slug.trim().toLowerCase();
  return ATOMIC_ACTS.find((a) => a.junkSlugs.includes(key));
}

export function isAtomicActJunkSlug(slug: string): boolean {
  return Boolean(atomicActByJunkSlug(slug));
}

/** Map leftover half-slugs onto the canonical duo. */
export function remapAtomicActHalfSlug(slug: string): string | undefined {
  return atomicActByJunkSlug(slug)?.slug;
}

/**
 * Completeness / browse: a half-name row ("Lucas") that belongs to a duo
 * becomes the team. Unrelated names on the same slug stay put.
 */
export function remapAtomicActPin(
  slug: string,
  name: string,
): { slug: string; name: string } | null {
  const act = atomicActByJunkSlug(slug) ?? atomicActBySlug(slug);
  if (!act) return null;
  const n = name.replace(/\s+/g, " ").trim().toLowerCase();
  if (!n) return { slug: act.slug, name: act.name };
  if (n === act.name.toLowerCase()) return { slug: act.slug, name: act.name };
  const halves = act.name
    .split(/\s*&\s*/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (halves.includes(n)) return { slug: act.slug, name: act.name };
  if (atomicActByJunkSlug(slug) && !atomicActBySlug(slug)) {
    return { slug: act.slug, name: act.name };
  }
  return act.slug === slug ? { slug: act.slug, name: act.name } : null;
}

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
