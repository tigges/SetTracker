import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLabelSlugs, getLabelBySlug } from "@/lib/queries";
import { SocialLinks } from "@/components/SocialLinks";
import { SET_TYPE_META, fmtDate, fmtDuration, fmtRelative } from "@/lib/status";

export async function generateStaticParams() {
  return (await getAllLabelSlugs()).map((slug) => ({ slug }));
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

export default async function LabelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = await getLabelBySlug(slug);
  if (!label) notFound();

  const color = label.color ?? "#00f0a0";
  const maxPlays = Math.max(1, ...label.topTracks.map((t) => t.count));

  return (
    <div>
      <Link
        href="/labels"
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        ← Labels
      </Link>

      <div
        className="mt-4 overflow-hidden rounded-2xl border border-line p-6"
        style={{
          background: `radial-gradient(600px 200px at 0% 0%, ${color}22, transparent 60%), linear-gradient(180deg, var(--panel2), var(--panel))`,
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="grid h-16 w-16 flex-none place-items-center rounded-2xl text-lg font-black"
            style={{ background: `${color}26`, color, border: `1px solid ${color}55` }}
          >
            {label.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="eyebrow" style={{ color }}>
              Label
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">{label.name}</h1>
            <p className="mt-1 text-[13px] text-muted">
              <span className="mono">{label.trackCount}</span> tracks ·{" "}
              <span className="mono">{label.setCount}</span> sets ·{" "}
              <span className="mono">{label.artists.length}</span> artists
            </p>
            <div className="mt-3">
              <SocialLinks links={label.socials} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Panel title="Sets featuring this label" meta={`${label.sets.length}`}>
            {label.sets.length === 0 ? (
              <p className="text-[13px] text-muted2">No sets yet.</p>
            ) : (
              <ul className="divide-y divide-linesoft">
                {label.sets.map((s) => {
                  const type = SET_TYPE_META[s.type] ?? { label: s.type, glyph: "•" };
                  return (
                    <li key={s.slug}>
                      <Link href={`/sets/${s.slug}`} className="flex items-center gap-3 py-3 hover:opacity-90">
                        <span
                          className="grid h-9 w-9 flex-none place-items-center rounded-lg text-sm"
                          style={{ background: `${color}1a`, color, border: `1px solid ${color}33` }}
                        >
                          {type.glyph}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] text-ink">
                            {s.primaryDjName}
                          </div>
                          <div className="mono text-[12px] text-muted2">
                            {s.title} · {type.label}
                            {s.genre ? ` · ${s.genre}` : ""} · {fmtDuration(s.durationSec)}
                          </div>
                        </div>
                        <span className="mono flex-none text-[12px] text-muted2" title={fmtDate(s.publishedAt)}>
                          {fmtRelative(s.publishedAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Top tracks" meta={`${label.topTracks.length}`}>
            <ul className="space-y-2.5">
              {label.topTracks.slice(0, 10).map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="mono w-4 flex-none text-[12px] text-muted2">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] text-ink">
                        {t.title}
                        <span className="text-muted"> — {t.artistName}</span>
                      </span>
                      <span className="mono flex-none text-[12px] text-muted2">{t.count}×</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-linesoft">
                      <div className="h-full rounded-full" style={{ width: `${(t.count / maxPlays) * 100}%`, background: color }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Artists" meta={`${label.artists.length}`}>
            {label.artists.length === 0 ? (
              <p className="text-[13px] text-muted2">No artists yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {label.artists.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/djs/${a.slug}`}
                    className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[12px] transition-colors hover:border-[color:var(--muted2)]"
                  >
                    <span className="dot" style={{ background: a.accent, width: 7, height: 7 }} />
                    {a.name}
                    <span className="mono text-muted2">{a.count}</span>
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
