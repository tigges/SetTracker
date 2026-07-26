import { DjList } from "@/components/DjList";
import { getDjList } from "@/lib/queries";

export default async function DjsPage() {
  const djs = await getDjList();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Artists</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">DJs</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          {djs.length} bass house artists tracked across radio, festival and
          SoundCloud sets. QA filters below surface empty profiles and missing
          handles while discovery is still noisy.
        </p>
      </div>

      <DjList djs={djs} />
    </div>
  );
}
