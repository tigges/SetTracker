import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityThumb } from "@/components/EntityThumb";
import { SetEntryLink } from "@/components/SetEntryLink";
import { StatusBar } from "@/components/StatusBits";
import { getAllSeriesSlugs, getSeriesBySlug } from "@/lib/queries";
import { pageMeta } from "@/lib/site";
import { SET_TYPE_META, fmtDate, fmtDuration, fmtRelative } from "@/lib/status";

export async function generateStaticParams() {
  const slugs = await getAllSeriesSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return { title: "Series" };
  return pageMeta({
    title: series.name,
    description: [
      series.host?.name,
      `${series.sets.length} sets`,
    ]
      .filter(Boolean)
      .join(" · "),
    path: `/series/${series.slug}`,
    image: series.host?.imageUrl,
  });
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  const accent = series.host?.accent ?? "var(--brand)";

  return (
    <div>
      <Link
        href={series.host ? `/djs/${series.host.slug}` : "/djs"}
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        ← {series.host ? series.host.name : "DJs"}
      </Link>

      <div className="mt-4 mb-8">
        <p className="eyebrow">Series</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {series.name}
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          {series.host ? (
            <>
              <Link
                href={`/djs/${series.host.slug}`}
                className="transition-colors hover:text-ink"
                style={{ color: accent }}
              >
                {series.host.name}
              </Link>
              {" · "}
            </>
          ) : null}
          <span className="mono">{series.sets.length}</span> sets
        </p>
      </div>

      {series.sets.length === 0 ? (
        <p className="text-[14px] text-muted">No sets in this series yet.</p>
      ) : (
        <ul className="divide-y divide-linesoft rounded-2xl border border-line bg-panel px-4">
          {series.sets.map((s) => {
            const type = SET_TYPE_META[s.type] ?? { label: s.type, glyph: "•" };
            return (
              <li key={s.slug}>
                <SetEntryLink
                  href={`/sets/${s.slug}`}
                  label={series.name}
                  className="flex items-center gap-3 py-3 transition-colors hover:opacity-90"
                >
                  <EntityThumb
                    src={s.imageUrl}
                    label={s.title}
                    accent={accent}
                    size={36}
                    radius={8}
                    monogram={type.glyph}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-ink">
                      {s.title}
                    </span>
                    <span className="mono text-[12px] text-muted2">
                      {type.label}
                      {s.eventName ? ` · ${s.eventName}` : ""} ·{" "}
                      {fmtDate(s.publishedAt)} · {fmtDuration(s.durationSec)} ·{" "}
                      {s.trackCount} tracks
                    </span>
                  </div>
                  <div className="hidden w-28 flex-none sm:block">
                    <StatusBar counts={s.statusCounts} />
                  </div>
                  <span className="mono flex-none text-[12px] text-muted2">
                    {fmtRelative(s.publishedAt)}
                  </span>
                </SetEntryLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
