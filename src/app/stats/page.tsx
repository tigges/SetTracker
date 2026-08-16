import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getCatalogStats } from "@/lib/catalogStats";
import { editionLabel } from "@/lib/ingest/festivalDrops";
import { getFestivalEditionBoard } from "@/lib/queries";
import { pageMeta } from "@/lib/site";
import { STATUS_META, fmtDuration, type IdStatus } from "@/lib/status";
import { StatusLegend } from "@/components/StatusBits";

export const metadata: Metadata = pageMeta({
  title: "Stats",
  description: "Catalog health queues — incomplete sets, missing IDs, DJ gaps.",
  path: "/stats",
});

function pct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="border-b border-line py-3 pr-4">
      <div className="mono text-[11px] uppercase tracking-[0.12em] text-muted2">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint ? (
        <div className="mt-0.5 mono text-[11px] text-muted2">{hint}</div>
      ) : null}
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const width = total > 0 ? Math.max(2, Math.round((count / total) * 100)) : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="truncate text-ink">{label}</span>
        <span className="mono shrink-0 text-[12px] text-muted2">
          {count.toLocaleString()} · {pct(count, total)}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-sm bg-line">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${width}%`,
            background: color ?? "var(--brand)",
          }}
        />
      </div>
    </div>
  );
}

function QueueSection({
  title,
  hint,
  count,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-bold tracking-tight">{title}</h2>
      <p className="mb-3 text-[13px] text-muted2">
        {hint}
        <span className="mono ml-2">{count.toLocaleString()}</span>
      </p>
      {children}
    </section>
  );
}

function SetQueue({
  rows,
}: {
  rows: Array<{
    slug: string;
    title: string;
    meta: string;
  }>;
}) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None in this queue.</p>;
  }
  return (
    <ul className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <li key={row.slug} className="py-2.5">
          <Link
            href={`/sets/${row.slug}`}
            className="font-semibold text-ink hover:underline"
          >
            {row.title}
          </Link>
          <div className="mono mt-0.5 text-[12px] text-muted2">{row.meta}</div>
        </li>
      ))}
    </ul>
  );
}

function DjQueue({
  rows,
}: {
  rows: Array<{
    slug: string;
    name: string;
    setCount: number;
    playCount: number;
  }>;
}) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None in this queue.</p>;
  }
  return (
    <ul className="divide-y divide-line border-y border-line">
      {rows.slice(0, 40).map((d) => (
        <li
          key={d.slug}
          className="flex items-baseline justify-between gap-3 py-2"
        >
          <Link
            href={`/djs/${d.slug}`}
            className="truncate font-semibold text-ink hover:underline"
          >
            {d.name}
          </Link>
          <span className="mono shrink-0 text-[12px] text-muted2">
            {d.setCount} sets · {d.playCount} plays
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function StatsPage() {
  const [s, board] = await Promise.all([
    getCatalogStats(),
    getFestivalEditionBoard(),
  ]);
  const playTotal = s.totals.plays;
  const identified =
    s.plays.byStatus.find((row) => row.key === "identified")?.count ?? 0;

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Operator</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Catalog health
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Incomplete tracklists, missing IDs, and DJ gaps. Browse stays on Sets
          and DJs — this page is the QA queue.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold tracking-tight">Totals</h2>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Sets" value={s.totals.sets} />
          <Stat
            label="DJs"
            value={s.djs.browseReady}
            hint={`${s.totals.djs.toLocaleString()} stored`}
          />
          <Stat label="Tracks" value={s.totals.tracks} />
          <Stat label="Plays" value={s.totals.plays} />
          <Stat label="Events" value={s.totals.venues} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold tracking-tight">Coverage</h2>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">
          <Stat
            label="Identified plays"
            value={pct(identified, playTotal)}
            hint={`${identified.toLocaleString()} of ${playTotal.toLocaleString()}`}
          />
          <Stat
            label="Sets with plays"
            value={s.sets.withPlays}
            hint={`${s.sets.empty} empty`}
          />
          <Stat
            label="Incomplete"
            value={s.sets.incomplete}
            hint={`${s.density.thin} thin · ${s.density.severe} severe`}
          />
          <Stat
            label="Needs IDs"
            value={s.sets.needsIds}
            hint="sets with unresolved cues"
          />
          <Stat
            label="Playback"
            value={s.sets.withPlayback}
            hint={pct(s.sets.withPlayback, s.totals.sets)}
          />
          <Stat
            label="Fingerprint IDs"
            value={s.fingerprint.identified}
            hint={`${s.fingerprint.uniqueTracks} tracks`}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-bold tracking-tight">Play status</h2>
        <p className="mb-3 text-[13px] text-muted2">
          Identification health across all timeline rows.
        </p>
        <div className="mb-4">
          <StatusLegend />
        </div>
        <div className="max-w-xl">
          {s.plays.byStatus.map((row) => (
            <BarRow
              key={row.key}
              label={row.label}
              count={row.count}
              total={playTotal}
              color={STATUS_META[row.key as IdStatus]?.color}
            />
          ))}
        </div>
      </section>

      <QueueSection
        title="Incomplete tracklists"
        hint="Empty shells and thin/severe density — capture or re-parse."
        count={s.sets.empty + s.sets.incomplete}
      >
        {s.emptySets.length > 0 ? (
          <div className="mb-6">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Empty
            </h3>
            <SetQueue
              rows={s.emptySets.map((row) => ({
                slug: row.slug,
                title: row.title,
                meta: [row.sourceName, row.type].filter(Boolean).join(" · "),
              }))}
            />
          </div>
        ) : null}
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          Thin / severe
        </h3>
        <SetQueue
          rows={s.density.worst.map((row) => ({
            slug: row.slug,
            title: row.title,
            meta: [
              row.primaryDj,
              row.severity,
              `${row.playCount} plays`,
              fmtDuration(row.durationSec),
              row.reason,
            ]
              .filter(Boolean)
              .join(" · "),
          }))}
        />
      </QueueSection>

      <QueueSection
        title="Needs IDs"
        hint="Sets with unresolved cues, lowest identified share first."
        count={s.sets.needsIds}
      >
        <SetQueue
          rows={s.needsIdsSets.map((row) => ({
            slug: row.slug,
            title: row.title,
            meta: [
              row.primaryDj,
              `${Math.round(row.identifiedRatio * 100)}% ID`,
              `${row.unresolvedCount} unresolved`,
              `${row.playCount} plays`,
              fmtDuration(row.durationSec),
            ]
              .filter(Boolean)
              .join(" · "),
          }))}
        />
        {s.topUnresolvedIds.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Hottest unresolved labels
            </h3>
            <ul className="divide-y divide-line border-y border-line">
              {s.topUnresolvedIds.map((row) => (
                <li
                  key={row.id}
                  className="flex items-baseline justify-between gap-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="text-ink">{row.label}</span>
                    {row.setSlug ? (
                      <>
                        {" "}
                        <Link
                          href={`/sets/${row.setSlug}`}
                          className="text-[13px] text-muted hover:underline"
                        >
                          {row.setTitle}
                        </Link>
                      </>
                    ) : null}
                  </span>
                  <span className="mono shrink-0 text-[12px] text-muted2">
                    {row.playCount}×
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </QueueSection>

      <QueueSection
        title="DJ queues"
        hint="Handle, artwork, and junk rows that used to live on the DJs page."
        count={
          s.djs.missingHandleWithSets.length +
          s.djs.junkNames.length +
          s.djs.emptySetProfiles.length +
          s.djs.noThumbWithSets.length
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              No handle · has sets
            </h3>
            <DjQueue rows={s.djs.missingHandleWithSets} />
          </div>
          <div>
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Empty set profiles
            </h3>
            <DjQueue rows={s.djs.emptySetProfiles} />
          </div>
          <div>
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              No artwork
            </h3>
            <DjQueue rows={s.djs.noThumbWithSets} />
          </div>
          <div>
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Junk names
            </h3>
            <DjQueue rows={s.djs.junkNames} />
          </div>
        </div>
      </QueueSection>

      {board.gaps.length > 0 ? (
        <QueueSection
          title="Festival capture gaps"
          hint="Curated editions still missing a dense Relive."
          count={board.gaps.length}
        >
          <ul className="divide-y divide-line border-y border-line">
            {board.gaps.map((g) => {
              const name = board.names.get(g.edition.eventSlug);
              const label = name
                ? `${name} · ${g.edition.year}${g.edition.label ? ` ${g.edition.label}` : ""}`
                : editionLabel(g.edition);
              return (
                <li
                  key={g.edition.slug}
                  className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <Link
                    href={`/events/${g.edition.eventSlug}`}
                    className="font-semibold text-ink hover:underline"
                  >
                    {label}
                  </Link>
                  <Link
                    href={`/capture-1001?q=${encodeURIComponent(name ?? editionLabel(g.edition))}`}
                    className="mono text-[12px] text-brand hover:underline"
                  >
                    capture 1001
                  </Link>
                </li>
              );
            })}
          </ul>
        </QueueSection>
      ) : null}
    </div>
  );
}
