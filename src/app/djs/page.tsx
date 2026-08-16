import type { Metadata } from "next";
import { DjList } from "@/components/DjList";
import { VisualTeaser } from "@/components/VisualTeaser";
import { getAtlasTeaserFaces, getDjList } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "DJs",
  description: "Artists with a handle, a set, a tracklist, and artwork.",
  path: "/djs",
});

export default async function DjsPage() {
  const [djs, atlasFaces] = await Promise.all([
    getDjList(),
    getAtlasTeaserFaces(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Artists</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">DJs</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          {djs.filter((d) => d.isBrowseReady).length} artists with a handle, a
          set, a tracklist, and artwork.
        </p>
        <div className="mt-5 max-w-xl">
          <VisualTeaser
            href="/atlas"
            eyebrow="DJ Mag charts"
            title="Map the Top 100"
            blurb="Clubs, festivals, and DJs on one map."
            cta="Atlas →"
            variant="atlas"
            faces={atlasFaces.map((f) => ({
              src: f.imageUrl,
              label: f.name,
              accent: f.accent,
            }))}
          />
        </div>
      </div>

      <DjList djs={djs} />
    </div>
  );
}
