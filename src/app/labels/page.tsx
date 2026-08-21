import type { Metadata } from "next";
import { LabelDirectory } from "@/components/LabelDirectory";
import { getLabels } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Labels",
  description: "Dance imprints that appear on identified setradar tracklists.",
  path: "/labels",
});

export default async function LabelsPage() {
  const labels = await getLabels();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Imprints</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Labels</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Curated dance imprints plus labels from tracklists. Jump a letter or
          search (⌘K).
        </p>
      </div>

      <LabelDirectory labels={labels} />
    </div>
  );
}
