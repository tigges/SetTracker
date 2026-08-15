import type { Metadata } from "next";
import Link from "next/link";
import { DjList } from "@/components/DjList";
import { getDjList } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "DJs",
  description: "Artists with a handle, a set, a tracklist, and artwork.",
  path: "/djs",
});

export default async function DjsPage() {
  const djs = await getDjList();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Artists</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">DJs</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          {djs.filter((d) => d.isBrowseReady).length} artists with a handle, a
          set, a tracklist, and artwork.{" "}
          <Link href="/atlas" className="text-brand hover:text-brandstrong">
            Map the Top 100 →
          </Link>
        </p>
      </div>

      <DjList djs={djs} />
    </div>
  );
}
