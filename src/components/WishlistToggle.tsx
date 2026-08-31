"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  isWishlisted,
  parseWishlistOverlay,
} from "@/lib/wishlist";
import {
  subscribeWishlist,
  toggleStoredWishlist,
  wishlistSnapshot,
} from "@/lib/wishlistStore";

export function WishlistToggle({ slug }: { slug: string }) {
  const raw = useSyncExternalStore(
    subscribeWishlist,
    wishlistSnapshot,
    () => "",
  );
  const overlay = useMemo(() => parseWishlistOverlay(raw), [raw]);
  const on = isWishlisted(slug, overlay);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => toggleStoredWishlist(slug)}
        aria-pressed={on}
        className={`rounded-md border px-2.5 py-1 text-[12px] font-bold transition-colors ${
          on
            ? "border-brand bg-brand/10 text-brand"
            : "border-line bg-transparent text-ink hover:border-brand hover:text-brand"
        }`}
      >
        {on ? "On wishlist" : "Add to wishlist"}
      </button>
      <Link
        href="/wishlist"
        className="text-[12px] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
      >
        Wishlist
      </Link>
    </div>
  );
}
