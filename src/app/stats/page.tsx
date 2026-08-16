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
  description: "Catalog health queues — capture gaps, missing IDs, DJ gaps.",
  path: "/stats",
});

const PREVIEW = 10;

function MoreFold({
  restCount,
  children,
}: {
  restCount: number;
  children: ReactNode;
}) {
  if (restCount <= 0) return null;
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-[12px] text-muted hover:text-ink">
        {restCount} more
      </summary>
      <div className="mt-1">{children}</div>
    </details>
  );
}

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
    <div className="border-b border-line py-2 pr-3">
      <div className="mono text-[10px] uppercase tracking-[0.12em] text-muted2">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-extrabold tracking-tight tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint ? (
        <div className="mono text-[10px] text-muted2">{hint}</div>
      ) : null}
    </div>
  );
}

function QueueFold({
  title,
  count,
  hint,
  open = false,
  children,
}: {
  title: string;
  count: number;
  hint: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={open}
      className="mb-3 rounded-lg border border-line bg-panel px-3 py-2"
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
          <span className="mono text-[12px] text-muted2">
            {count.toLocaleString()}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-muted2">{hint}</p>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function GapQueue({
  rows,
}: {
  rows: Array<{
    slug: string;
    title: string;
    meta: string;
    hasSetPage: boolean;
    captureQuery: string;
    sourceUrl: string | null;
  }>;
}) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None in this queue.</p>;
  }
  const head = rows.slice(0, PREVIEW);
  const rest = rows.slice(PREVIEW);
  const list = (items: typeof rows) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((row) => (
        <li key={row.slug} className="py-1.5">
          {row.hasSetPage ? (
            <Link
              href={`/sets/${row.slug}`}
              className="text-[13px] font-semibold text-ink hover:underline"
            >
              {row.title}
            </Link>
          ) : (
            <span className="text-[13px] font-semibold text-ink">
              {row.title}
            </span>
          )}
          <div className="mono truncate text-[11px] text-muted2">{row.meta}</div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px]">
            <Link
              href={`/capture-1001?q=${encodeURIComponent(row.captureQuery)}`}
              className="text-brand hover:underline"
            >
              capture 1001
            </Link>
            {row.sourceUrl ? (
              <a
                href={row.sourceUrl}
                className="text-muted hover:underline"
                rel="noreferrer"
              >
                source
              </a>
            ) : null}
            {row.hasSetPage ? null : (
              <span className="text-muted2">no set page (empty timeline)</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {list(head)}
      <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
    </>
  );
}

function SetQueue({
  rows,
}: {
  rows: Array<{ slug: string; title: string; meta: string }>;
}) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None in this queue.</p>;
  }
  const head = rows.slice(0, PREVIEW);
  const rest = rows.slice(PREVIEW);
  const list = (items: typeof rows) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((row) => (
        <li key={row.slug} className="py-1.5">
          <Link
            href={`/sets/${row.slug}`}
            className="text-[13px] font-semibold text-ink hover:underline"
          >
            {row.title}
          </Link>
          <div className="mono truncate text-[11px] text-muted2">
            {row.meta}
          </div>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {list(head)}
      <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
    </>
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
    return <p className="text-[13px] text-muted2">None.</p>;
  }
  const head = rows.slice(0, PREVIEW);
  const rest = rows.slice(PREVIEW);
  const list = (items: typeof rows) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((d) => (
        <li
          key={d.slug}
          className="flex items-baseline justify-between gap-2 py-1"
        >
          <Link
            href={`/djs/${d.slug}`}
            className="truncate text-[13px] font-semibold text-ink hover:underline"
          >
            {d.name}
          </Link>
          <span className="mono shrink-0 text-[11px] text-muted2">
            {d.setCount}s · {d.playCount}p
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {list(head)}
      <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
    </>
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
  const djQueueCount =
    s.djs.missingHandleWithSets.length +
    s.djs.junkNames.length +
    s.djs.emptySetProfiles.length +
    s.djs.noThumbWithSets.length;

  return (
    <div>
      <div className="mb-5">
        <p className="eyebrow">Operator</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          Catalog health
        </h1>
        <p className="mono mt-1 text-[11px] text-muted2">
          This export
          {process.env.NEXT_PUBLIC_APP_VERSION
            ? ` · v${process.env.NEXT_PUBLIC_APP_VERSION}`
            : ""}
          {process.env.NEXT_PUBLIC_GIT_SHA
            ? ` · ${process.env.NEXT_PUBLIC_GIT_SHA.slice(0, 7)}`
            : ""}
        </p>
      </div>

      <section className="mb-5">
        <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4 lg:grid-cols-8">
          <Stat label="Sets" value={s.totals.sets} />
          <Stat
            label="DJs"
            value={s.djs.browseReady}
            hint={`${s.totals.djs.toLocaleString()} stored`}
          />
          <Stat
            label="Identified"
            value={pct(identified, playTotal)}
            hint={`${identified.toLocaleString()} plays`}
          />
          <Stat
            label="Incomplete"
            value={s.sets.incomplete}
            hint={`${s.density.thin} thin · ${s.density.severe} severe`}
          />
          <Stat
            label="Needs IDs"
            value={s.sets.needsIds}
            hint={`${s.sets.empty} empty`}
          />
          <Stat
            label="Playback"
            value={s.sets.withPlayback}
            hint={pct(s.sets.withPlayback, s.totals.sets)}
          />
          <Stat
            label="Fingerprint"
            value={s.fingerprint.identified}
            hint={`${s.fingerprint.uniqueTracks} tracks`}
          />
          <Stat label="Events" value={s.totals.venues} />
        </div>
      </section>

      <section className="mb-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            Play status
          </h2>
          <StatusLegend />
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-line">
          {s.plays.byStatus.map((row) => {
            const width =
              playTotal > 0 ? Math.round((row.count / playTotal) * 100) : 0;
            if (!width) return null;
            return (
              <div
                key={row.key}
                title={`${row.label}: ${row.count.toLocaleString()}`}
                style={{
                  width: `${width}%`,
                  background: STATUS_META[row.key as IdStatus]?.color,
                }}
              />
            );
          })}
        </div>
      </section>

      <QueueFold
        title="Tracklist capture"
        count={s.tracklistGaps.length}
        hint={`${s.sets.incomplete.toLocaleString()} thin/severe stored — only this-year chart or festival Relives are a capture job. Find a 1001 page already on the source (do not invent URLs). Weekly radio stubs are not this queue. Empty shells have no set page.`}
        open
      >
        <GapQueue
          rows={s.tracklistGaps.map((row) => ({
            slug: row.slug,
            title: row.title,
            meta: [row.primaryDj, row.reason, fmtDuration(row.durationSec)]
              .filter(Boolean)
              .join(" · "),
            hasSetPage: row.hasSetPage,
            captureQuery: row.captureQuery,
            sourceUrl: row.sourceUrl,
          }))}
        />
      </QueueFold>

      <QueueFold
        title="Needs IDs"
        count={s.sets.needsIds}
        hint="Lowest identified share first. Performance year, not ingest date."
        open
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
            ]
              .filter(Boolean)
              .join(" · "),
          }))}
        />
        {s.topUnresolvedIds.length > 0 ? (
          <div className="mt-4">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Hottest unresolved labels
            </h3>
            {(() => {
              const head = s.topUnresolvedIds.slice(0, PREVIEW);
              const rest = s.topUnresolvedIds.slice(PREVIEW);
              const list = (items: typeof s.topUnresolvedIds) => (
                <ul className="divide-y divide-line border-y border-line">
                  {items.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-baseline justify-between gap-3 py-1"
                    >
                      <span className="min-w-0 truncate text-[13px] text-ink">
                        {row.label}
                        {row.setSlug ? (
                          <>
                            {" "}
                            <Link
                              href={`/sets/${row.setSlug}`}
                              className="text-muted hover:underline"
                            >
                              {row.setTitle}
                            </Link>
                          </>
                        ) : null}
                      </span>
                      <span className="mono shrink-0 text-[11px] text-muted2">
                        {row.playCount}×
                      </span>
                    </li>
                  ))}
                </ul>
              );
              return (
                <>
                  {list(head)}
                  <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
                </>
              );
            })()}
          </div>
        ) : null}
      </QueueFold>

      <QueueFold
        title="DJ queues"
        count={djQueueCount}
        hint="Catalog DJs only — hearthis hobbyist leaks are dropped."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              No handle · has sets
            </h3>
            <DjQueue rows={s.djs.missingHandleWithSets} />
          </div>
          <div>
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Empty set profiles
            </h3>
            <DjQueue rows={s.djs.emptySetProfiles} />
          </div>
          <div>
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              No artwork
            </h3>
            <DjQueue rows={s.djs.noThumbWithSets} />
          </div>
          <div>
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Junk names
            </h3>
            <DjQueue rows={s.djs.junkNames} />
          </div>
        </div>
      </QueueFold>

      {board.gaps.length > 0 ? (
        <QueueFold
          title="Festival capture gaps"
          count={board.gaps.length}
          hint="Curated editions still missing a dense Relive."
        >
          {(() => {
            const head = board.gaps.slice(0, PREVIEW);
            const rest = board.gaps.slice(PREVIEW);
            const list = (items: typeof board.gaps) => (
              <ul className="divide-y divide-line border-y border-line">
                {items.map((g) => {
                  const name = board.names.get(g.edition.eventSlug);
                  const label = name
                    ? `${name} · ${g.edition.year}${g.edition.label ? ` ${g.edition.label}` : ""}`
                    : editionLabel(g.edition);
                  return (
                    <li
                      key={g.edition.slug}
                      className="flex items-baseline justify-between gap-3 py-1.5"
                    >
                      <Link
                        href={`/events/${g.edition.eventSlug}`}
                        className="truncate text-[13px] font-semibold text-ink hover:underline"
                      >
                        {label}
                      </Link>
                      <Link
                        href={`/capture-1001?q=${encodeURIComponent(name ?? editionLabel(g.edition))}`}
                        className="mono shrink-0 text-[11px] text-brand hover:underline"
                      >
                        capture
                      </Link>
                    </li>
                  );
                })}
              </ul>
            );
            return (
              <>
                {list(head)}
                <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
              </>
            );
          })()}
        </QueueFold>
      ) : null}
    </div>
  );
}
