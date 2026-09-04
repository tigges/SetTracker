import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSetBySlug, getAllSetSlugs, getRelatedSets } from "@/lib/queries";
import { BrowseBackLink } from "@/components/BrowseBackLink";
import { EntityThumb } from "@/components/EntityThumb";
import { SetExport } from "@/components/SetExport";
import { SetListen } from "@/components/SetListen";
import { SetPlayer } from "@/components/SetPlayer";
import { SetTimeline } from "@/components/SetTimeline";
import { setHostHeadline } from "@/lib/brandHosts";
import { detectPlaybackHost, unusedOfficialHostLinks } from "@/lib/playback";
import { pageMeta } from "@/lib/site";
import {
  hasPrecisePerformanceDate,
  setPerformanceTime,
  setPerformanceYearLabel,
} from "@/lib/feedPriority";
import { SET_TYPE_META, fmtDate, fmtDuration } from "@/lib/status";
import { isTalkPlay } from "@/lib/publishPlays";
import { beatportCoverage } from "@/lib/trackMeta";

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
  const when = setPerformanceTime(set);
  const whenLabel = hasPrecisePerformanceDate(set)
    ? fmtDate(new Date(when))
    : setPerformanceYearLabel(set);
  return pageMeta({
    title: set.title,
    description: [artists, set.event?.name, whenLabel, `${set.trackCount} tracks`]
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
  const coverage = beatportCoverage(set.plays.filter((p) => !isTalkPlay(p)));
  return (
    <SetListen>
    <div>
      <BrowseBackLink />

      {/* header */}
      <div className="mt-3 flex flex-col gap-3 border-b border-line pb-4 sm:mt-4 sm:flex-row sm:items-start sm:gap-5 sm:pb-6">
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
            {set.series &&
              set.series.name.toLowerCase() !==
                (set.event?.name ?? "").toLowerCase() && (
              <Link
                href={`/series/${set.series.slug}`}
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

          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">
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

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted2">
            <span className="mono">
              {hasPrecisePerformanceDate(set)
                ? fmtDate(new Date(setPerformanceTime(set)))
                : setPerformanceYearLabel(set)}
            </span>
            <span className="mono">{fmtDuration(set.durationSec)}</span>
            <span className="mono">{set.trackCount} tracks</span>
            {(() => {
              const host = detectPlaybackHost(set.playbackUrl ?? set.sourceUrl);
              const href = set.playbackUrl ?? set.sourceUrl;
              if (!href || host === "hearthis") return null;
              const label =
                host === "soundcloud"
                  ? "SoundCloud"
                  : host === "mixcloud"
                    ? "Mixcloud"
                    : host === "youtube"
                      ? "YouTube"
                      : "Official playback";
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
                >
                  Official playback ↗ {label}
                </a>
              );
            })()}
          </div>
          <SetPlayer
            playbackUrl={set.playbackUrl}
            sourceUrl={set.sourceUrl}
          />
          {(() => {
            const alsoOn = unusedOfficialHostLinks({
              playbackUrl: set.playbackUrl,
              soundcloudUrl: set.soundcloudUrl,
              youtubeUrl: set.youtubeUrl,
              mixcloudUrl: set.mixcloudUrl,
            });
            if (!alsoOn.length) return null;
            return (
              <p className="mt-2 text-[12px] text-muted2">
                Also on{" "}
                {alsoOn.map((link, i) => (
                  <span key={link.host}>
                    {i > 0 ? " · " : null}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </span>
                ))}
              </p>
            );
          })()}
        </div>
      </div>

      <SetTimeline
        plays={set.plays}
        durationSec={set.durationSec}
        accent={accent}
        setSlug={set.slug}
        setGenre={set.genre}
        setType={set.type}
        setSourceUrl={set.sourceUrl}
        setPlaybackUrl={set.playbackUrl}
        storedPlayCount={set.storedPlayCount}
        parkedIdCount={set.parkedIdCount}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="min-w-0 text-[12px] text-muted2">
            <span className="mono">{set.statusCounts.identified ?? 0}</span>{" "}
            identified
            {coverage.identified > 0 ? (
              <>
                {" · "}
                <span className="mono">{coverage.buyable}</span> Beatport
                {" · "}
                <span className="mono">{coverage.spotifyDirect}</span> Spotify
              </>
            ) : null}
          </p>
          <SetExport
            meta={{
              title: set.title,
              slug: set.slug,
              artistLine: set.artists.map((a) => a.name).join(" b2b "),
            }}
            plays={set.plays.filter((p) => !isTalkPlay(p)).map((p) => ({
              position: p.position,
              timestamp: p.timestamp,
              title: p.title,
              artistName: p.artistName,
              bpm: p.bpm,
              musicalKey: p.musicalKey,
              trackDurationSec: p.trackDurationSec,
              beatportUrl: p.beatportUrl,
              spotifyUrl: p.spotifyUrl,
              isrc: p.isrc,
              mixName: p.mixName,
              idStatus: p.idStatus,
            }))}
          />
        </div>
      </SetTimeline>

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
