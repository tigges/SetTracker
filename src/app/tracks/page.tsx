import type { Metadata } from "next";
import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { getTracks } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Tracks",
  description: "Most-played identified tracks across the setradar catalog.",
  path: "/tracks",
});

export default async function TracksPage() {
  const tracks = await getTracks(160);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Identified plays</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Tracks</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Most-played identified tracks across the catalog — open a track for
          every set that spun it.
        </p>
      </div>

      <ul className="divide-y divide-linesoft rounded-2xl border border-line bg-panel">
        {tracks.map((t, i) => (
          <li key={t.slug}>
            <Link
              href={`/tracks/${t.slug}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg2"
            >
              <span className="mono w-6 flex-none text-right text-[12px] text-muted2">
                {i + 1}
              </span>
              <EntityThumb
                src={t.imageUrl}
                label={t.title}
                accent={t.labelColor ?? "var(--brand)"}
                size={40}
                radius={8}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-ink">
                  {t.title}
                  {t.mixName ? (
                    <span className="ml-2 text-[12px] font-normal text-muted2">
                      {t.mixName}
                    </span>
                  ) : null}
                </div>
                <div className="mono truncate text-[12px] text-muted2">
                  {t.artistName}
                  {t.labelName ? ` · ${t.labelName}` : ""}
                  {t.genre ? ` · ${t.genre}` : ""}
                  {t.bpm != null ? ` · ${t.bpm} BPM` : ""}
                </div>
              </div>
              <span className="mono flex-none text-[12px] text-muted2">
                {t.playCount}×
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {tracks.length === 0 && (
        <p className="py-16 text-center text-[14px] text-muted2">
          No identified tracks yet — they appear after ingest parses tracklists.
        </p>
      )}
    </div>
  );
}
