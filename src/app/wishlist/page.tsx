import type { Metadata } from "next";
import Link from "next/link";
import { WishlistClient } from "@/components/WishlistClient";
import { getDjList, getWishlistSimilarHints } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Wishlist",
  description:
    "Personal DJ wishlist — house and bass house names to keep watching. Stored in this browser.",
  path: "/wishlist",
});

export default async function WishlistPage() {
  const [djs, similarHints] = await Promise.all([
    getDjList(),
    getWishlistSimilarHints(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Personal</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Wishlist</h1>
        <p className="mt-3 text-[13px]">
          <Link
            href="/djs"
            className="text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            All DJs
          </Link>
        </p>
      </div>
      <WishlistClient djs={djs} similarHints={similarHints} />
    </div>
  );
}
