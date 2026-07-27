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
          {djs.filter((d) => d.isBrowseReady).length} artists ready to browse
          ({djs.length} stored). Ingest keeps every discovery; Browse hides
          profiles without a handle, empty tracklists, thin title-parse dupes,
          and missing artwork unless the catalog is already deep.
        </p>
      </div>

      <DjList djs={djs} />
    </div>
  );
}
