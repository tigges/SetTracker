import { getFeed, getGenres } from "@/lib/queries";
import { SetFeed } from "@/components/SetFeed";
import { StatusLegend } from "@/components/StatusBits";

export default async function Home() {
  const [feed, genres] = await Promise.all([getFeed(), getGenres()]);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">setradar.ai · house set database</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Sets</h1>
        <div className="mt-4 lg:hidden">
          <StatusLegend />
        </div>
      </div>

      <SetFeed feed={feed} genres={genres} />
    </div>
  );
}
