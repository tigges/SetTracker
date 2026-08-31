/**
 * Browser overlay for the personal wishlist. Server code must not import
 * this file from a client-unsafe path — it only touches window.
 */

import {
  EMPTY_WISHLIST_OVERLAY,
  WISHLIST_EVENT,
  WISHLIST_STORAGE_KEY,
  parseWishlistOverlay,
  toggleWishlistSlug,
  type WishlistOverlay,
} from "./wishlist";

export function wishlistSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function subscribeWishlist(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(WISHLIST_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(WISHLIST_EVENT, onChange);
  };
}

export function readWishlistOverlay(): WishlistOverlay {
  return parseWishlistOverlay(wishlistSnapshot());
}

export function writeWishlistOverlay(next: WishlistOverlay): void {
  if (typeof window === "undefined") return;
  try {
    const empty =
      next.added.length === 0 && next.removed.length === 0;
    if (empty) window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
    else window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function toggleStoredWishlist(slug: string): WishlistOverlay {
  const next = toggleWishlistSlug(readWishlistOverlay(), slug);
  writeWishlistOverlay(next);
  return next;
}

export function resetStoredWishlist(): void {
  writeWishlistOverlay({ ...EMPTY_WISHLIST_OVERLAY });
}
