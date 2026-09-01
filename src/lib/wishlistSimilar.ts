/**
 * Wishlist recommendations. One board under the list — not a "DJs like X"
 * chip on every row (that fights the flat grid and repeats the same names).
 *
 * Rank from (1) shared-set / press relations already on file, then (2) the
 * same canonical genre as anyone on the list. Client-side so a browser-only
 * add/remove updates the strip without a rebuild.
 */

export type SimilarHint = {
  slug: string;
  reason: string;
  weight: number;
};

export type SimilarCatalogRow = {
  slug: string;
  name: string;
  genre?: string | null;
  isJunk?: boolean;
  isLowSignal?: boolean;
  isBrowseReady?: boolean;
  setCount?: number;
};

export type WishlistSimilarRow = {
  slug: string;
  score: number;
  reason: string;
  via: string[];
};

export const WISHLIST_SIMILAR_LIMIT = 9;

function canRecommend(row: SimilarCatalogRow): boolean {
  if (row.isJunk || row.isLowSignal) return false;
  if (row.isBrowseReady) return true;
  return (row.setCount ?? 0) >= 1;
}

export function similarReasonLine(opts: {
  viaNames: string[];
  topReason: string;
}): string {
  const [a, b] = opts.viaNames;
  if (a && b) return `Like ${a} and ${b}`;
  if (a && /shared a set/i.test(opts.topReason)) return `Played with ${a}`;
  if (a && opts.topReason) return opts.topReason;
  if (a) return `Like ${a}`;
  return opts.topReason || "Same lane";
}

export function rankWishlistSimilar(opts: {
  wishlisted: string[];
  hintsBySlug: Record<string, SimilarHint[]>;
  catalog: SimilarCatalogRow[];
  limit?: number;
}): WishlistSimilarRow[] {
  const wish = new Set(opts.wishlisted.filter(Boolean));
  const bySlug = new Map(opts.catalog.map((d) => [d.slug, d]));
  const scores = new Map<
    string,
    { score: number; via: Set<string>; topReason: string; topWeight: number }
  >();

  const bump = (
    slug: string,
    viaSlug: string,
    weight: number,
    reason: string,
  ) => {
    if (!slug || wish.has(slug) || slug === viaSlug) return;
    const row = bySlug.get(slug);
    if (!row || !canRecommend(row)) return;
    const cur = scores.get(slug) ?? {
      score: 0,
      via: new Set<string>(),
      topReason: reason,
      topWeight: 0,
    };
    cur.score += weight;
    cur.via.add(viaSlug);
    if (weight > cur.topWeight) {
      cur.topWeight = weight;
      cur.topReason = reason;
    }
    scores.set(slug, cur);
  };

  for (const from of wish) {
    for (const hint of opts.hintsBySlug[from] ?? []) {
      bump(hint.slug, from, hint.weight, hint.reason);
    }
  }

  const wishGenres = new Set(
    [...wish]
      .map((slug) => bySlug.get(slug)?.genre?.trim())
      .filter((g): g is string => Boolean(g)),
  );
  if (wishGenres.size > 0) {
    for (const row of opts.catalog) {
      const genre = row.genre?.trim();
      if (!genre || !wishGenres.has(genre)) continue;
      const via =
        [...wish].find((slug) => bySlug.get(slug)?.genre?.trim() === genre) ??
        "";
      bump(row.slug, via, 4, genre);
    }
  }

  const limit = opts.limit ?? WISHLIST_SIMILAR_LIMIT;
  return [...scores.entries()]
    .map(([slug, row]) => {
      const viaNames = [...row.via]
        .map((s) => bySlug.get(s)?.name ?? s)
        .filter(Boolean);
      return {
        slug,
        score: row.score,
        via: [...row.via],
        reason: similarReasonLine({
          viaNames,
          topReason: row.topReason,
        }),
      };
    })
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}

export function mergeSimilarHints(
  ...maps: Array<Record<string, SimilarHint[]>>
): Record<string, SimilarHint[]> {
  const out: Record<string, SimilarHint[]> = {};
  for (const map of maps) {
    for (const [from, hints] of Object.entries(map)) {
      const list = out[from] ?? [];
      for (const hint of hints) {
        const prev = list.find((h) => h.slug === hint.slug);
        if (prev) {
          prev.weight = Math.max(prev.weight, hint.weight);
          if (hint.weight >= prev.weight) prev.reason = hint.reason;
        } else {
          list.push({ ...hint });
        }
      }
      out[from] = list;
    }
  }
  return out;
}

export function collaboratorHintsFromSets(
  links: Array<{ setId: string; slug: string }>,
): Record<string, SimilarHint[]> {
  const bySet = new Map<string, Set<string>>();
  for (const row of links) {
    if (!row.setId || !row.slug) continue;
    const set = bySet.get(row.setId) ?? new Set<string>();
    set.add(row.slug);
    bySet.set(row.setId, set);
  }
  const pairCount = new Map<string, { a: string; b: string; n: number }>();
  for (const slugs of bySet.values()) {
    if (slugs.size < 2) continue;
    const list = [...slugs];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const key = a < b ? `${a}::${b}` : `${b}::${a}`;
        const prev = pairCount.get(key);
        if (prev) prev.n += 1;
        else pairCount.set(key, { a, b, n: 1 });
      }
    }
  }
  const out: Record<string, SimilarHint[]> = {};
  for (const { a, b, n } of pairCount.values()) {
    const weight = 20 + Math.min(n, 8) * 5;
    const hint = { reason: "Shared a set", weight };
    (out[a] ??= []).push({ slug: b, ...hint });
    (out[b] ??= []).push({ slug: a, ...hint });
  }
  return out;
}
