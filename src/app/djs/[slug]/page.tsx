import Link from "next/link";
import { notFound } from "next/navigation";
import { getDjBySlug, getAllDjSlugs } from "@/lib/queries";
import { EntityThumb } from "@/components/EntityThumb";
import { StatusBar, StatusLegend } from "@/components/StatusBits";
import { SocialLinks } from "@/components/SocialLinks";
import {
  PROVENANCE_META,
  SET_TYPE_META,
  fmtDate,
  fmtDuration,
  fmtRelative,
  type Provenance,
} from "@/lib/status";

export async function generateStaticParams() {
  return (await getAllDjSlugs()).map((slug) => ({ slug }));
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

  const accent = dj.accent;
  const provTotal =
    Object.values(dj.provenance).reduce((a, b) => a + b, 0) || 1;
  const maxPlays = dj.mostPlayed[0]?.count ?? 1;

  return (
    <div>
      <Link
        href="/djs"
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        ← DJs
      </Link>

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
            <p className="mt-1 text-[13px] text-muted">
              {dj.homeCity}
              {dj.homeCity && dj.totals ? " · " : ""}
              <span className="mono">{dj.totals.sets}</span> sets ·{" "}
              <span className="mono">{dj.totals.tracks}</span> tracks logged
            </p>
          </div>
        </div>
        {dj.bio && <p className="mt-4 max-w-2xl text-[14px] text-muted">{dj.bio}</p>}
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
                    <Link
                      href={`/sets/${s.slug}`}
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
                    </Link>
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
                  <li key={i} className="flex items-center gap-3">
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
                        <span className="truncate text-[13px] text-ink">
                          {t.title}
                          <span className="text-muted"> — {t.artistName}</span>
                        </span>
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

        {/* right column: series, source health, collaborators */}
        <div className="space-y-5">
          {dj.series.length > 0 && (
            <Panel title="Series" meta={`${dj.series.length}`}>
              <div className="flex flex-wrap gap-2">
                {dj.series.map((s) => (
                  <span
                    key={s.slug}
                    className="rounded-full border border-line bg-panel px-3 py-1 text-[12px]"
                  >
                    {s.name}
                    <span className="mono ml-1.5 text-muted2">{s.setCount}</span>
                  </span>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Source health">
            <StatusBar counts={dj.health} height={10} />
            <div className="mt-3">
              <StatusLegend counts={dj.health} />
            </div>
            <div className="mt-5 space-y-2.5">
              <p className="eyebrow">Provenance</p>
              {Object.entries(dj.provenance)
                .sort((a, b) => b[1] - a[1])
                .map(([p, count]) => (
                  <div key={p} className="flex items-center gap-3">
                    <span className="w-24 flex-none text-[12px] text-muted">
                      {PROVENANCE_META[p as Provenance]?.short ?? p}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-linesoft">
                      <div
                        className="h-full rounded-full bg-muted"
                        style={{ width: `${(count / provTotal) * 100}%` }}
                      />
                    </div>
                    <span className="mono w-6 flex-none text-right text-[12px] text-muted2">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </Panel>

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
        </div>
      </div>
    </div>
  );
}
