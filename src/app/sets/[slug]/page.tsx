import Link from "next/link";
import { notFound } from "next/navigation";
import { getSetBySlug, getAllSetSlugs } from "@/lib/queries";
import { EntityThumb } from "@/components/EntityThumb";
import { SetTimeline } from "@/components/SetTimeline";
import { StatusLegend } from "@/components/StatusBits";
import { SET_TYPE_META, fmtDate, fmtDuration } from "@/lib/status";

export async function generateStaticParams() {
  return (await getAllSetSlugs()).map((slug) => ({ slug }));
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = await getSetBySlug(slug);
  if (!set) notFound();

  const type = SET_TYPE_META[set.type] ?? { label: set.type, glyph: "•" };
  const accent = set.primaryDj?.accent ?? "var(--brand)";

  return (
    <div>
      <Link
        href="/"
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        ← Sets
      </Link>

      {/* header */}
      <div className="mt-4 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start">
        <div className="relative flex-none">
          <EntityThumb
            src={set.imageUrl}
            label={set.primaryDj?.name ?? set.title}
            accent={accent}
            size={80}
            radius={16}
          />
          <span
            className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-lg border border-line bg-bg text-sm text-muted"
            title={type.label}
          >
            {type.glyph}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: accent, background: `${accent}1f` }}
            >
              {type.label}
            </span>
            {set.genre && (
              <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                {set.genre}
              </span>
            )}
            {set.series && <span className="eyebrow">{set.series.name}</span>}
            {set.event && (
              <span className="eyebrow">
                {set.event.name}
                {set.event.location ? ` · ${set.event.location}` : ""}
              </span>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
            {set.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
            {set.artists.map((a, i) => (
              <span key={a.slug} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted2">b2b</span>}
                <Link
                  href={`/djs/${a.slug}`}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: a.accent }}
                >
                  {a.name}
                </Link>
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted2">
            <span className="mono">{fmtDate(set.publishedAt)}</span>
            <span className="mono">{fmtDuration(set.durationSec)}</span>
            <span className="mono">{set.plays.length} tracks</span>
            {set.sourceName && (
              <span>
                Source:{" "}
                {set.sourceUrl ? (
                  <a
                    href={set.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
                  >
                    {set.sourceName}
                  </a>
                ) : (
                  <span className="text-muted">{set.sourceName}</span>
                )}
              </span>
            )}
          </div>
          {(set.sourceName === "SoundCloud" ||
            set.sourceName === "hearthis.at" ||
            set.sourceName === "YouTube") && (
            <p className="mt-2 max-w-xl text-[12px] text-muted2">
              Tracklist comes from the source description, timed comments, or
              YouTube Music song credits — often partial / untimed. Suggest an
              ID on unresolved rows to fill gaps.
            </p>
          )}
        </div>
      </div>

      <div className="my-6">
        <StatusLegend counts={set.statusCounts} />
      </div>

      <SetTimeline
        plays={set.plays}
        durationSec={set.durationSec}
        accent={accent}
        setSlug={set.slug}
      />
    </div>
  );
}
