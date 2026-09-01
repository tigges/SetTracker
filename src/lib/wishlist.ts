/**
 * Personal DJ wishlist. Defaults ship in the repo; add/remove lives in
 * this browser only (static Pages has no accounts).
 *
 * Not the /stats ★ — that mark is current DJ Mag Top 100.
 */

import { slugify } from "./ingest/types";

export const WISHLIST_STORAGE_KEY = "setradar.wishlist.v1";
export const WISHLIST_EVENT = "setradar:wishlist";

export type WishlistEntry = {
  slug: string;
  name: string;
};

/**
 * Producer house / bass-house set. Paste "dradeazy" is bradeazy
 * (roster aka breazly). Names keep the catalog spelling when a Dj row exists.
 */
export const WISHLIST_DEFAULTS: WishlistEntry[] = [
  { slug: "chris-lorenzo", name: "Chris Lorenzo" },
  { slug: "marten-horger", name: "Marten Hørger" },
  { slug: "dillon-francis", name: "Dillon Francis" },
  { slug: "dom-dolla", name: "Dom Dolla" },
  { slug: "robin-schulz", name: "Robin Schulz" },
  { slug: "fisher", name: "FISHER" },
  { slug: "bradeazy", name: "bradeazy" },
  { slug: "bijou", name: "BIJOU" },
  { slug: "sidepiece", name: "SIDEPIECE" },
  { slug: "tujamo", name: "Tujamo" },
  { slug: "meduza", name: "MEDUZA" },
  { slug: "valentino-khan", name: "Valentino Khan" },
  { slug: "mau-p", name: "Mau P" },
  { slug: "cid", name: "CID" },
  { slug: "greg-99", name: "GREG 99" },
  { slug: "lao", name: "Lao" },
  { slug: "anti-up", name: "Anti Up" },
  { slug: "chapter-verse", name: "Chapter & Verse" },
  { slug: "ac-slater", name: "AC Slater" },
  { slug: "chris-lake", name: "Chris Lake" },
  { slug: "malaa", name: "Malaa" },
  { slug: "tchami", name: "Tchami" },
  { slug: "wax-motif", name: "Wax Motif" },
  { slug: "bleu-clair", name: "Bleu Clair" },
  { slug: "jauz", name: "Jauz" },
  { slug: "brohug", name: "Brohug" },
];

/** Typed / pasted leftovers → catalog slug. */
export const WISHLIST_SLUG_ALIASES: Record<string, string> = {
  dradeazy: "bradeazy",
  breazly: "bradeazy",
  "gregg-gg": "greg-99",
  "greg-gg": "greg-99",
};

export type WishlistOverlay = {
  added: string[];
  removed: string[];
};

export const EMPTY_WISHLIST_OVERLAY: WishlistOverlay = {
  added: [],
  removed: [],
};

export function wishlistDefaultSlugs(): string[] {
  return WISHLIST_DEFAULTS.map((d) => d.slug);
}

export function normalizeWishlistSlug(input: string): string {
  const slug = slugify(input.trim());
  return WISHLIST_SLUG_ALIASES[slug] ?? slug;
}

export function parseWishlistOverlay(raw: string): WishlistOverlay {
  if (!raw.trim()) return { ...EMPTY_WISHLIST_OVERLAY };
  try {
    const parsed = JSON.parse(raw) as Partial<WishlistOverlay>;
    const added = Array.isArray(parsed.added)
      ? uniqueSlugs(parsed.added)
      : [];
    const removed = Array.isArray(parsed.removed)
      ? uniqueSlugs(parsed.removed)
      : [];
    return { added, removed };
  } catch {
    return { ...EMPTY_WISHLIST_OVERLAY };
  }
}

function uniqueSlugs(values: unknown[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const slug = normalizeWishlistSlug(value);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export function effectiveWishlistSlugs(
  overlay: WishlistOverlay = EMPTY_WISHLIST_OVERLAY,
  defaults: readonly WishlistEntry[] = WISHLIST_DEFAULTS,
): string[] {
  const removed = new Set(overlay.removed.map(normalizeWishlistSlug));
  const defaultSlugs = defaults.map((d) => d.slug);
  const defaultSet = new Set(defaultSlugs);
  const kept = defaultSlugs.filter((slug) => !removed.has(slug));
  const extras = overlay.added
    .map(normalizeWishlistSlug)
    .filter((slug) => slug && !defaultSet.has(slug) && !removed.has(slug));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of [...kept, ...extras]) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export function isWishlisted(
  slug: string,
  overlay: WishlistOverlay = EMPTY_WISHLIST_OVERLAY,
  defaults: readonly WishlistEntry[] = WISHLIST_DEFAULTS,
): boolean {
  const key = normalizeWishlistSlug(slug);
  if (!key) return false;
  return effectiveWishlistSlugs(overlay, defaults).includes(key);
}

export function wishlistIsCustomized(
  overlay: WishlistOverlay,
  defaults: readonly WishlistEntry[] = WISHLIST_DEFAULTS,
): boolean {
  const defaultSet = new Set(defaults.map((d) => d.slug));
  if (overlay.removed.some((slug) => defaultSet.has(normalizeWishlistSlug(slug)))) {
    return true;
  }
  return overlay.added.some((slug) => {
    const key = normalizeWishlistSlug(slug);
    return key && !defaultSet.has(key);
  });
}

export function toggleWishlistSlug(
  overlay: WishlistOverlay,
  slug: string,
  defaults: readonly WishlistEntry[] = WISHLIST_DEFAULTS,
): WishlistOverlay {
  const key = normalizeWishlistSlug(slug);
  if (!key) return overlay;
  const defaultSet = new Set(defaults.map((d) => d.slug));
  const on = isWishlisted(key, overlay, defaults);
  if (defaultSet.has(key)) {
    const removed = new Set(overlay.removed.map(normalizeWishlistSlug));
    if (on) removed.add(key);
    else removed.delete(key);
    return {
      added: overlay.added.map(normalizeWishlistSlug).filter((s) => s !== key),
      removed: [...removed],
    };
  }
  const added = overlay.added.map(normalizeWishlistSlug).filter((s) => s !== key);
  const removed = overlay.removed
    .map(normalizeWishlistSlug)
    .filter((s) => s !== key);
  if (!on) added.push(key);
  return { added, removed };
}

export function wishlistLabel(
  slug: string,
  catalogName?: string | null,
  defaults: readonly WishlistEntry[] = WISHLIST_DEFAULTS,
): string {
  const key = normalizeWishlistSlug(slug);
  if (catalogName?.trim()) return catalogName.trim();
  return defaults.find((d) => d.slug === key)?.name ?? key;
}
