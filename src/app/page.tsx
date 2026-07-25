import { getFeed, type FeedItem } from "@/lib/queries";
import { SetCard } from "@/components/SetCard";
import { StatusLegend } from "@/components/StatusBits";

export const dynamic = "force-dynamic";

function within7Days(d: Date): boolean {
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function Section({ title, sets }: { title: string; sets: FeedItem[] }) {
  if (sets.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        <span className="mono text-[12px] text-muted2">{sets.length}</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((s) => (
          <SetCard key={s.id} set={s} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const feed = await getFeed();
  const thisWeek = feed.filter((s) => within7Days(s.publishedAt));
  const earlier = feed.filter((s) => !within7Days(s.publishedAt));

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

      <Section title="This week" sets={thisWeek} />
      <Section title="Earlier" sets={earlier} />
    </div>
  );
}
