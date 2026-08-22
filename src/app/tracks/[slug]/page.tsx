import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityThumb } from "@/components/EntityThumb";
import { SetEntryLink } from "@/components/SetEntryLink";
import { getAllTrackSlugs, getTrackBySlug } from "@/lib/queries";
import { pageMeta } from "@/lib/site";
import {
  bandcampSearchUrl,
  beatportTrackHref,
  canonicalBeatportUrl,
  discogsSearchUrl,
  spotifySearchUrl,
} from "@/lib/trackMeta";
import {
  SET_TYPE_META,
  fmtDate,
  fmtDuration,
  fmtRelative,
  fmtTimestamp,
} from "@/lib/status";

export async function generateStaticParams() {
  const slugs = await getAllTrackSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrackBySlug(slug);
  if (!track) return { title: "Track" };
  return pageMeta({
    title: `${track.artistName} – ${track.title}`,
    description: `Played in ${track.setCount} sets (${track.playCount} plays).`,
    path: `/tracks/${track.slug}`,
    image: track.imageUrl,
  });
}

function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        {meta && <span className="mono text-[12px] text-muted2">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = await getTrackBySlug(slug);
  if (!track) notFound();

  const accent = track.label?.color ?? "var(--brand)";
  const bpCanonical = canonicalBeatportUrl(track.beatportUrl);
  const bpHref = beatportTrackHref(
    track.title,
    track.artistName,
    track.beatportUrl,
  );
  const spHref = spotifySearchUrl(track.title, track.artistName);
  const dcHref = discogsSearchUrl(track.title, track.artistName);
  const bcHref = bandcampSearchUrl(track.title, track.artistName);

  return (
    <div>
      <Link
        href="/tracks"
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        ← Tracks
      </Link>

      <div
        className="mt-4 overflow-hidden rounded-2xl border border-line p-6"
        style={{
          background: `radial-gradient(600px 200px at 0% 0%, ${accent}22, transparent 60%), linear-gradient(180deg, var(--panel2), var(--panel))`,
        }}
      >
        <div className="flex items-center gap-5">
          <EntityThumb
            src={track.imageUrl}
            label={track.title}
            accent={accent}
            size={72}
            radius={14}
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow" style={{ color: accent }}>
              Track
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {track.title}
            </h1>
            <p className="mt-1 text-[15px] text-muted">{track.artistName}</p>
            <p className="mt-2 mono text-[12px] text-muted2">
              <span>{track.playCount} plays</span>
              <span> · {track.setCount} sets</span>
              {track.mixName ? <span> · {track.mixName}</span> : null}
              {track.bpm != null ? <span> · {track.bpm} BPM</span> : null}
              {track.musicalKey ? <span> · {track.musicalKey}</span> : null}
              {track.durationSec != null && track.durationSec > 0 ? (
                <span> · {fmtTimestamp(track.durationSec)}</span>
              ) : null}
              {track.genre ? <span> · {track.genre}</span> : null}
              {track.isrc ? <span> · ISRC {track.isrc}</span> : null}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {track.label && (
                <Link
                  href={`/labels/${track.label.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg2 py-0.5 pl-0.5 pr-2.5 text-[12px] text-muted transition-colors hover:border-brand hover:text-brand"
                >
                  <EntityThumb
                    src={track.label.imageUrl}
                    label={track.label.name}
                    accent={track.label.color ?? accent}
                    size={18}
                    radius={999}
                    monogram={track.label.name.slice(0, 1)}
                  />
                  {track.label.name}
                </Link>
              )}
              <a
                href={spHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-2.5 py-1 text-[12px] text-muted2 transition-colors hover:border-brand hover:text-brand"
              >
                Search Spotify
              </a>
              <a
                href={bpHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-2.5 py-1 text-[12px] text-muted2 transition-colors hover:border-brand hover:text-brand"
              >
                {bpCanonical ? "Buy on Beatport" : "Search Beatport"}
              </a>
              <a
                href={dcHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-2.5 py-1 text-[12px] text-muted2 transition-colors hover:border-brand hover:text-brand"
              >
                Search Discogs
              </a>
              <a
                href={bcHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-2.5 py-1 text-[12px] text-muted2 transition-colors hover:border-brand hover:text-brand"
              >
                Search Bandcamp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Played in sets" meta={`${track.sets.length}`}>
            {track.sets.length === 0 ? (
              <p className="text-[13px] text-muted2">No sets yet.</p>
            ) : (
              <ul className="divide-y divide-linesoft">
                {track.sets.map((s) => {
                  const type = SET_TYPE_META[s.type] ?? {
                    label: s.type,
                    glyph: "•",
                  };
                  return (
                    <li key={s.slug}>
                      <SetEntryLink
                        href={`/sets/${s.slug}`}
                        label={track.title}
                        className="flex items-center gap-3 py-3 hover:opacity-90"
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
                          <div className="truncate text-[14px] text-ink">
                            {s.primaryDjName ?? s.title}
                          </div>
                          <div className="mono text-[12px] text-muted2">
                            {s.title}
                            {s.eventName ? ` · ${s.eventName}` : ""}
                            {s.genre ? ` · ${s.genre}` : ""} ·{" "}
                            {fmtDuration(s.durationSec)}
                          </div>
                        </div>
                        <span
                          className="mono flex-none text-[12px] text-muted2"
                          title={fmtDate(s.publishedAt)}
                        >
                          {fmtRelative(s.publishedAt)}
                        </span>
                      </SetEntryLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="DJs who played it" meta={`${track.djs.length}`}>
            {track.djs.length === 0 ? (
              <p className="text-[13px] text-muted2">None yet.</p>
            ) : (
              <ul className="space-y-2">
                {track.djs.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/djs/${d.slug}`}
                      className="flex items-center gap-2.5 rounded-lg border border-transparent px-1 py-1.5 transition-colors hover:border-line hover:bg-bg2"
                    >
                      <EntityThumb
                        src={d.imageUrl}
                        label={d.name}
                        accent={d.accent}
                        size={28}
                        radius={999}
                        monogram={d.name.slice(0, 1)}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                        {d.name}
                      </span>
                      <span className="mono text-[12px] text-muted2">
                        {d.count}×
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {(track.releaseDate || track.remixerName) && (
            <Panel title="Release">
              <dl className="space-y-2 text-[13px]">
                {track.remixerName && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted2">Remixer</dt>
                    <dd className="text-ink">{track.remixerName}</dd>
                  </div>
                )}
                {track.releaseDate && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted2">Released</dt>
                    <dd className="mono text-ink">
                      {fmtDate(track.releaseDate)}
                    </dd>
                  </div>
                )}
              </dl>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
