import type { Metadata } from "next";
import { getFeed, getGenres } from "@/lib/queries";
import { SetFeed } from "@/components/SetFeed";
import { pageMeta, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Sets",
  description: SITE_DESCRIPTION,
  path: "/sets",
});

export default async function SetsPage() {
  const [feed, genres] = await Promise.all([getFeed(), getGenres()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">DJ Sets</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Best Sets from recent festival and club performances
        </p>
      </div>

      <SetFeed feed={feed} genres={genres} />
    </div>
  );
}
