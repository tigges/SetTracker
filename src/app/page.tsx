import type { Metadata } from "next";
import { getFeed, getGenres } from "@/lib/queries";
import { SetFeed } from "@/components/SetFeed";
import { StatusLegend } from "@/components/StatusBits";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sets",
  description: SITE_DESCRIPTION,
};

export default async function Home() {
  const [feed, genres] = await Promise.all([getFeed(), getGenres()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">DJ Sets</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Festival, radio, and mix tracklists with ID status and provenance.
        </p>
        <div className="mt-3 lg:hidden">
          <StatusLegend />
        </div>
      </div>

      <SetFeed feed={feed} genres={genres} />
    </div>
  );
}
