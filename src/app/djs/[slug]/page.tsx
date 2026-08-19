import type { Metadata } from "next";
import Link from "next/link";
import { SetEntryLink } from "@/components/SetEntryLink";
import { notFound, redirect } from "next/navigation";
import { getDjBySlug, getAllDjSlugs } from "@/lib/queries";
import { EntityThumb } from "@/components/EntityThumb";
import { StatusBar } from "@/components/StatusBits";
import { SocialLinks } from "@/components/SocialLinks";
import { DjBio } from "@/components/DjBio";
import { displayDjBio } from "@/lib/djBio";
import { ATLAS_DJ_YEAR, lookupAtlasDj } from "@/lib/atlas/seed";
import { chartKicker } from "@/lib/atlas/mapMath";
import { displayCity } from "@/lib/displayCity";
import { pageMeta } from "@/lib/site";
import { SET_TYPE_META, fmtDate, fmtDuration, fmtRelative } from "@/lib/status";

export async function generateStaticParams() {
  const slugs = await getAllDjSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dj = await getDjBySlug(slug);
  if (!dj) return { title: "DJ" };
  const city = displayCity(dj.homeCity);
  return pageMeta({
    title: dj.name,
    description: [city, `${dj.totals.sets} sets`, `${dj.totals.tracks} tracks logged`]
      .filter(Boolean)
      .join(" · "),
    path: `/djs/${dj.slug}`,
    image: dj.imageUrl,
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

export default async function DjPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dj = await getDjBySlug(slug);
  if (!dj) notFound();
  if (slug !== dj.slug) redirect(`/djs/${dj.slug}`);

  const accent = dj.accent;
  const city = displayCity(dj.homeCity);
  const chart = lookupAtlasDj(dj.slug);
  const maxPlays = dj.mostPlayed[0]?.count ?? 1;
  const bio = displayDjBio(dj.bio, { genre: dj.genre, homeCity: dj.homeCity });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/djs"
          className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
        >
          ← DJs
        </Link>
        {chart ? (
          <Link
            href={`/atlas#${chart.slug}`}
            className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
          >
            Atlas
          </Link>
        ) : null}
      </div>

      {/* hero */}
      <div
        className="mt-4 overflow-hidden rounded-2xl border border-line p-6"
        style={{
          background: `radial-gradient(600px 200px at 0% 0%, ${accent}22, transparent 60%), linear-gradient(180deg, var(--panel2), var(--panel))`,
        }}
      >
        <div className="flex items-center gap-5">
          <EntityThumb
            src={dj.imageUrl}
            label={dj.name}
            accent={accent}
            size={64}
            radius={16}
          />
          <div className="min-w-0">
            <p className="eyebrow" style={{ color: accent }}>
              DJ profile
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">{dj.name}</h1>
            {chart ? (
              <p className="mt-1 text-[13px] text-muted">
                DJ Mag Top 100 {chartKicker("dj", chart.rank, ATLAS_DJ_YEAR)}
              </p>
            ) : null}
            <p className="mt-1 text-[13px] text-muted">
              {city}
              {city && dj.totals ? " · " : ""}
              <span className="mono">{dj.totals.sets}</span> sets ·{" "}
              <span className="mono">{dj.totals.tracks}</span> tracks logged
            </p>
            {dj.genre ? (
              <span className="mt-2 inline-block rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                {dj.genre}
              </span>
            ) : null}
          </div>
        </div>
        {bio ? <DjBio text={bio} /> : null}
        <div className="mt-4">
          <SocialLinks links={dj.socials} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* left column: recent sets */}
        <div className="lg:col-span-2 space-y-5">
          <Panel title="Recent sets" meta={`${dj.recentSets.length}`}>
            <ul className="divide-y divide-linesoft">
              {dj.recentSets.map((s) => {
                const type = SET_TYPE_META[s.type] ?? { label: s.type, glyph: "•" };
                return (
                  <li key={s.slug}>
                    <SetEntryLink
                      href={`/sets/${s.slug}`}
                      label={dj.name}
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
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] text-ink">
                            {s.title}
                          </span>
                          {!s.isPrimary && (
                            <span className="flex-none rounded-full bg-panel px-1.5 py-0.5 text-[10px] text-muted2">
                              b2b
                            </span>
                          )}
                        </div>
                        <div className="mono text-[12px] text-muted2">
                          {type.label} · {fmtDate(s.publishedAt)} ·{" "}
                          {fmtDuration(s.durationSec)} · {s.trackCount} tracks
                        </div>
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
          </Panel>

          <Panel title="Most-played tracks" meta="top 8">
            {dj.mostPlayed.length === 0 ? (
              <p className="text-[13px] text-muted2">No identified tracks yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {dj.mostPlayed.map((t, i) => (
                  <li key={t.slug} className="flex items-center gap-3">
                    <span className="mono w-4 flex-none text-[12px] text-muted2">
                      {i + 1}
                    </span>
                    <EntityThumb
                      src={t.imageUrl}
                      label={t.title}
                      accent={accent}
                      size={32}
                      radius={6}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link
                          href={`/tracks/${t.slug}`}
                          className="truncate text-[13px] text-ink transition-colors hover:text-brand"
                        >
                          {t.title}
                          <span className="text-muted"> — {t.artistName}</span>
                        </Link>
                        <span className="mono flex-none text-[12px] text-muted2">
                          {t.count}×
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-linesoft">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(t.count / maxPlays) * 100}%`,
                            background: accent,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* right column: series, collaborators */}
        <div className="space-y-5">
          {dj.upcomingNights.length > 0 && (
            <Panel title="On the bill" meta={`${dj.upcomingNights.length}`}>
              <ul className="space-y-3">
                {dj.upcomingNights.map((n) => (
                  <li
                    key={n.slug}
                    className="rounded-xl border border-line bg-panel2 p-3"
                  >
                    <Link
                      href={`/events/${n.eventSlug}`}
                      className="block text-[14px] font-semibold text-ink transition-colors hover:text-brand"
                    >
                      {n.eventName}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-muted">{n.title}</p>
                    <p className="mono mt-1 text-[12px] text-muted2">
                      {n.startsAt}
                    </p>
                    <a
                      href={n.ticketsUrl || n.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mono mt-2 inline-block text-[11px] text-brand hover:text-brandstrong"
                    >
                      Official →
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {dj.series.length > 0 && (
            <Panel title="Series" meta={`${dj.series.length}`}>
              <div className="flex flex-wrap gap-2">
                {dj.series.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/series/${s.slug}`}
                    className="rounded-full border border-line bg-panel px-3 py-1 text-[12px] transition-colors hover:border-[color:var(--muted2)] hover:text-ink"
                  >
                    {s.name}
                    <span className="mono ml-1.5 text-muted2">{s.setCount}</span>
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Collaborators" meta={`${dj.collaborators.length}`}>
            {dj.collaborators.length === 0 ? (
              <p className="text-[13px] text-muted2">No b2b sets logged.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dj.collaborators.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/djs/${c.slug}`}
                    className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[12px] transition-colors hover:border-[color:var(--muted2)]"
                  >
                    <span
                      className="dot"
                      style={{ background: c.accent, width: 7, height: 7 }}
                    />
                    {c.name}
                    <span className="mono text-muted2">{c.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          {dj.related.length > 0 && (
            <Panel title="Related" meta={`${dj.related.length}`}>
              <div className="flex flex-wrap gap-2">
                {dj.related.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/djs/${c.slug}`}
                    title={c.reason}
                    className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[12px] transition-colors hover:border-[color:var(--muted2)]"
                  >
                    <span
                      className="dot"
                      style={{ background: c.accent, width: 7, height: 7 }}
                    />
                    {c.name}
                  </Link>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
