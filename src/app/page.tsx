import { getFeed, getGenres } from "@/lib/queries";
import { SetFeed } from "@/components/SetFeed";
import { StatusLegend } from "@/components/StatusBits";

export default async function Home() {
  const [feed, genres] = await Promise.all([getFeed(), getGenres()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">House Sets</h1>
        <div className="mt-3 lg:hidden">
          <StatusLegend />
        </div>
      </div>

      <SetFeed feed={feed} genres={genres} />
    </div>
  );
}
