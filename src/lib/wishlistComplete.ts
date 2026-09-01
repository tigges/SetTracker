/**
 * Catalog gaps for a wishlist row. Client-safe — no Node, no Prisma.
 *
 * Does not change Capture 1001 or Identify ranking. /wishlist only
 * surfaces what is missing so we can wire a concrete set, pin, or ID.
 */

export type WishlistCompleteDj = {
  slug: string;
  name: string;
  imageUrl: string | null;
  soundcloud: string | null;
  youtube: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  beatport: string | null;
  setCount: number;
  playCount: number;
  identifiedPlayCount: number;
  hasHandle: boolean;
};

export type WishlistGap =
  | "no-page"
  | "no-set"
  | "no-thumb"
  | "no-handle"
  | "no-ids";

export const WISHLIST_GAP_LABEL: Record<WishlistGap, string> = {
  "no-page": "No catalog page",
  "no-set": "No set",
  "no-thumb": "No thumb",
  "no-handle": "No handle",
  "no-ids": "No IDs",
};

export type WishlistCompleteness = {
  gaps: WishlistGap[];
  needsWork: boolean;
};

export function wishlistCompleteness(
  dj: WishlistCompleteDj | undefined,
): WishlistCompleteness {
  if (!dj) return { gaps: ["no-page"], needsWork: true };
  const gaps: WishlistGap[] = [];
  if (dj.setCount < 1) gaps.push("no-set");
  if (!dj.imageUrl?.trim()) gaps.push("no-thumb");
  if (!dj.hasHandle) gaps.push("no-handle");
  if (dj.setCount > 0 && dj.identifiedPlayCount < 1) gaps.push("no-ids");
  return { gaps, needsWork: gaps.length > 0 };
}

/** Needs-work first, then the incoming wishlist order. */
export function sortWishlistByNeeds(
  slugs: readonly string[],
  lookup: (slug: string) => WishlistCompleteDj | undefined,
): string[] {
  const order = new Map(slugs.map((slug, i) => [slug, i]));
  return [...slugs].sort((a, b) => {
    const ga = wishlistCompleteness(lookup(a)).gaps.length;
    const gb = wishlistCompleteness(lookup(b)).gaps.length;
    if (gb !== ga) return gb - ga;
    return (order.get(a) ?? 0) - (order.get(b) ?? 0);
  });
}
