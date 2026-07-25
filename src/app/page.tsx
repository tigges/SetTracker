import { getFeed, getGenres } from "@/lib/queries";
import { SetFeed } from "@/components/SetFeed";
import { StatusLegend } from "@/components/StatusBits";

export default async function Home() {
  const [feed, genres] = await Promise.all([getFeed(), getGenres()]);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Bass house set database</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Sets</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Radio episodes, festival sets and SoundCloud mixes — every track row
          carries its status and provenance, so you can see what&apos;s
          identified and what&apos;s still an ID.
        </p>
        <div className="mt-4 lg:hidden">
          <StatusLegend />
        </div>
      </div>

      <SetFeed feed={feed} genres={genres} />
    </div>
  );
}
