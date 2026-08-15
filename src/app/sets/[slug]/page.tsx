import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSetBySlug, getAllSetSlugs, getRelatedSets } from "@/lib/queries";
import { EntityThumb } from "@/components/EntityThumb";
import { SetExport } from "@/components/SetExport";
import { SetListen } from "@/components/SetListen";
import { SetPlayer } from "@/components/SetPlayer";
import { SetTimeline } from "@/components/SetTimeline";
import { StatusLegend } from "@/components/StatusBits";
import { setHostHeadline } from "@/lib/brandHosts";
import { detectPlaybackHost } from "@/lib/playback";
import { assessSetDensity } from "@/lib/setDensity";
import { pageMeta } from "@/lib/site";
import { SET_TYPE_META, fmtDate, fmtDuration } from "@/lib/status";

export async function generateStaticParams() {
  const slugs = await getAllSetSlugs();
  // Next.js `output: "export"` errors if a dynamic route returns no params.
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const set = await getSetBySlug(slug);
  if (!set) return { title: "Set" };
  const artists = set.artists.map((a) => a.name).join(" b2b ");
  return pageMeta({
    title: set.title,
    description: [artists, set.event?.name, fmtDate(set.publishedAt), `${set.plays.length} tracks`]
      .filter(Boolean)
      .join(" · "),
    path: `/sets/${set.slug}`,
    image: set.imageUrl,
  });
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [set, related] = await Promise.all([
    getSetBySlug(slug),
    getRelatedSets(slug),
  ]);
  if (!set) notFound();

  const type = SET_TYPE_META[set.type] ?? { label: set.type, glyph: "•" };
  const accent = set.primaryDj?.accent ?? "var(--brand)";
  const hostLine = setHostHeadline({
    title: set.title,
    primaryDj: set.primaryDj,
    collaborators: set.artists.filter((a) => !a.isPrimary),
    seriesName: set.series?.name,
    eventName: set.event?.name,
  });
  const density = assessSetDensity({
    durationSec: set.durationSec,
    playCount: set.plays.length,
  });

  return (
    <SetListen>
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
            label={hostLine}
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
            {set.series && (
              <Link
                href={`/search?q=${encodeURIComponent(set.series.name)}`}
                className="eyebrow transition-colors hover:text-ink"
              >
                {set.series.name}
              </Link>
            )}
            {set.event && (
              <Link
                href={`/events/${set.event.slug}`}
                className="eyebrow transition-colors hover:text-ink"
              >
                {set.event.name}
                {set.event.location ? ` · ${set.event.location}` : ""}
              </Link>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
            {set.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
            {set.artists.length > 0 ? (
              set.artists.map((a, i) => (
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
              ))
            ) : (
              <span className="font-semibold text-muted">{hostLine}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted2">
            <span className="mono">{fmtDate(set.publishedAt)}</span>
            <span className="mono">{fmtDuration(set.durationSec)}</span>
            <span className="mono">{set.plays.length} tracks</span>
            {density.severity !== "ok" && (
              <span
                className="mono"
                style={{
                  color:
                    density.severity === "severe"
                      ? "var(--magenta)"
                      : "var(--amber)",
                }}
                title={density.reason ?? undefined}
              >
                {density.severity} tracklist · ~{density.tracksPerHour.toFixed(1)}
                /h (expect ~{density.expectedPlays})
              </span>
            )}
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
            {(() => {
              const host = detectPlaybackHost(set.playbackUrl);
              if (!host) return null;
              const label =
                host === "soundcloud"
                  ? "SoundCloud"
                  : host === "hearthis"
                    ? "hearthis.at"
                    : "YouTube";
              // Only show when playback host differs from discovery source label.
              if (
                set.sourceName &&
                set.sourceName.toLowerCase().includes(label.toLowerCase())
              ) {
                return null;
              }
              return (
                <span>
                  Audio: <span className="text-muted">{label}</span>
                </span>
              );
            })()}
          </div>
          {(set.sourceName === "SoundCloud" ||
            set.sourceName === "hearthis.at" ||
            set.sourceName === "YouTube" ||
            set.sourceName === "Insomniac") && (
            <p className="mt-2 max-w-xl text-[12px] text-muted2">
              Tracklist comes from the source description, timed comments,
              Insomniac Night Owl Radio pages, or YouTube Music song credits —
              often partial / untimed. Suggest an ID on unresolved rows to fill
              gaps.
            </p>
          )}

          <SetPlayer
            playbackUrl={set.playbackUrl}
            sourceUrl={set.sourceUrl}
          />
        </div>
      </div>

      <div className="my-6">
        <StatusLegend counts={set.statusCounts} />
      </div>

      <div className="mb-6">
        <SetExport
          meta={{
            title: set.title,
            slug: set.slug,
            artistLine: set.artists.map((a) => a.name).join(" b2b "),
          }}
          plays={set.plays.map((p) => ({
            position: p.position,
            timestamp: p.timestamp,
            title: p.title,
            artistName: p.artistName,
            bpm: p.bpm,
            musicalKey: p.musicalKey,
            trackDurationSec: p.trackDurationSec,
            beatportUrl: p.beatportUrl,
            idStatus: p.idStatus,
          }))}
        />
      </div>

      <SetTimeline
        plays={set.plays}
        durationSec={set.durationSec}
        accent={accent}
        setSlug={set.slug}
        setGenre={set.genre}
        setSourceUrl={set.sourceUrl}
      />

      {related.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Related sets
            </h2>
            <span className="mono text-[12px] text-muted2">{related.length}</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/sets/${r.slug}`}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-ink">
                      {r.title}
                    </span>
                    <span className="mono text-[11px] text-muted2">
                      {r.reasonLabel}
                      {r.eventName ? ` · ${r.eventName}` : ""}
                      {r.primaryDj ? ` · ${r.primaryDj.name}` : ""}
                    </span>
                  </span>
                  <span className="mono flex-none text-[12px] text-muted2">
                    {fmtDate(r.publishedAt)} · {r.trackCount} tracks
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
    </SetListen>
  );
}
