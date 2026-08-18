import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { StatsHealthCard, StatsMeter } from "@/components/StatsHealthCard";
import { getCatalogStats } from "@/lib/catalogStats";
import { editionLabel } from "@/lib/ingest/festivalDrops";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import { loadLlmResearchStats } from "@/lib/llmResearchStats";
import { getFestivalEditionBoard } from "@/lib/queries";
import { pageMeta } from "@/lib/site";
import { getStatsHealth } from "@/lib/statsHealthData";
import { fmtDuration } from "@/lib/status";

export const metadata: Metadata = pageMeta({
  title: "Stats",
  description:
    "Catalog health — sets, DJs, clubs, festivals, and the work left.",
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

function PlaceGapQueue({
  rows,
}: {
  rows: Array<{ slug: string; name: string; onChart: boolean }>;
}) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None in this queue.</p>;
  }
  const head = rows.slice(0, PREVIEW);
  const rest = rows.slice(PREVIEW);
  const list = (items: typeof rows) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((row) => (
        <li
          key={row.slug}
          className="flex items-baseline justify-between gap-2 py-1.5"
        >
          <Link
            href={`/events/${row.slug}`}
            className="truncate text-[13px] font-semibold text-ink hover:underline"
          >
            {row.onChart ? "★ " : ""}
            {row.name}
          </Link>
          <Link
            href={`/capture-1001?q=${encodeURIComponent(row.name)}`}
            className="mono shrink-0 text-[11px] text-brand hover:underline"
          >
            capture
          </Link>
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

function fieldShort(field: string): string {
  if (field === "instagram") return "IG";
  if (field === "soundcloud") return "SC";
  if (field === "youtube") return "YT";
  if (field === "twitter") return "X";
  if (field === "website") return "WWW";
  return field;
}

function identityLabel(cls: string): string {
  if (cls === "touring_dj") return "touring DJ";
  if (cls === "track_credit") return "track credit";
  if (cls === "venue_host") return "venue / label";
  return cls.replace(/_/g, " ");
}

export default async function StatsPage() {
  const [s, board, llm, health] = await Promise.all([
    getCatalogStats(),
    getFestivalEditionBoard(),
    Promise.resolve(loadLlmResearchStats()),
    getStatsHealth(),
  ]);
  const top100 = loadDjMagTop100RankBySlug();
  const starFirst = (slug: string) => (top100.has(slug) ? 0 : 1);
  const cueTotal = health.sets.identified.reduce((n, row) => n + row.count, 0);
  const playbackTotal = health.sets.playback.reduce((n, row) => n + row.count, 0);
  const noPlayback = health.sets.playback.find((row) => row.key === "no_playback");

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Operator</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          Catalog health
        </h1>
        <p className="mono mt-1 text-[12px] text-amber">{health.chartNote}</p>
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

      <StatsHealthCard
        id="djs"
        noun="DJs"
        total={health.djs.total}
        hint={`${health.djs.stored.toLocaleString()} stored · junk hidden · with a set`}
        slices={health.djs.slices}
        onChart={health.djs.onChart}
        actions={health.djs.actions}
      />
      <StatsHealthCard
        id="festivals-card"
        noun="Festivals"
        total={health.festivals.total}
        hint="Catalog + current Top 100 list"
        slices={health.festivals.slices}
        onChart={health.festivals.onChart}
        actions={health.festivals.actions}
      />
      <StatsHealthCard
        id="clubs-card"
        noun="Clubs"
        total={health.clubs.total}
        hint="Catalog + current Top 100 list"
        slices={health.clubs.slices}
        onChart={health.clubs.onChart}
        actions={health.clubs.actions}
      />
      <StatsHealthCard
        id="sets"
        noun="Sets"
        total={health.sets.total}
        hint="A set is the list of tracks · playback is the official recording"
        slices={health.sets.slices}
        onChart={health.sets.onChart}
        actions={health.sets.actions}
      >
        <StatsMeter
          label="Identified"
          slices={health.sets.identified}
          total={cueTotal}
          starNote={
            health.sets.identifiedStarGap > 0
              ? `★ ${health.sets.identifiedStarGap.toLocaleString()} of the gap sit on chart sets`
              : undefined
          }
        />
        <StatsMeter
          label="Playback"
          slices={health.sets.playback}
          total={playbackTotal}
          starNote={
            noPlayback && noPlayback.star > 0
              ? `★ ${noPlayback.star.toLocaleString()} of no-playback are chart sets`
              : undefined
          }
        />
        <p className="mt-3 text-[12px] text-muted2">
          No playback has no button — wait for an official full-set upload.
        </p>
      </StatsHealthCard>
      <StatsHealthCard
        id="tracks"
        noun="Tracks"
        total={health.tracks.total}
        hint="Songs, not sets"
        slices={health.tracks.slices}
        actions={health.tracks.actions}
      />

      <p className="mb-4 mt-8 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
        Queues
      </p>

      <QueueFold
        title="LLM research"
        count={llm.totals.djFieldsApplied + llm.totals.eventFieldsApplied}
        hint={`${llm.note}${llm.generatedAt ? ` Latest report ${llm.generatedAt.slice(0, 10)}.` : ""}`}
      >
        <div className="mb-3 grid grid-cols-2 gap-x-4 sm:grid-cols-4">
          <Stat
            label="DJ fields"
            value={llm.totals.djFieldsApplied}
            hint={`${llm.totals.djsScanned} scanned`}
          />
          <Stat
            label="Event fields"
            value={llm.totals.eventFieldsApplied}
            hint={`${llm.totals.eventsScanned} scanned`}
          />
          <Stat
            label="Identity"
            value={llm.totals.identityClassified}
            hint={`${llm.totals.touringDj} touring · ${llm.totals.junkOrHost} junk/host`}
          />
          <Stat
            label="First-party IG"
            value={llm.firstParty?.djsIg ?? "—"}
            hint={
              llm.firstParty
                ? `${llm.firstParty.noSocialWithSets} sets, no social`
                : "no scrape report"
            }
          />
        </div>
        {llm.rounds.length > 0 ? (
          <div className="mb-3 overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="mono text-[10px] uppercase tracking-[0.12em] text-muted2">
                <tr>
                  <th className="py-1 pr-3 font-normal">Round</th>
                  <th className="py-1 pr-3 font-normal">Target</th>
                  <th className="py-1 pr-3 font-normal">Scanned</th>
                  <th className="py-1 pr-3 font-normal">Applied</th>
                  <th className="py-1 font-normal">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {llm.rounds.map((r) => (
                  <tr key={r.file}>
                    <td className="py-1 pr-3">{r.provider}</td>
                    <td className="py-1 pr-3">{r.target}</td>
                    <td className="mono py-1 pr-3">{r.scanned}</td>
                    <td className="mono py-1 pr-3">{r.applied}</td>
                    <td className="mono py-1">{r.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Verified fills
        </h3>
        {llm.fills.length === 0 ? (
          <p className="text-[13px] text-muted2">No committed fills yet.</p>
        ) : (
          (() => {
            const head = llm.fills.slice(0, PREVIEW);
            const rest = llm.fills.slice(PREVIEW);
            const list = (items: typeof llm.fills) => (
              <ul className="divide-y divide-line border-y border-line">
                {items.map((row) => (
                  <li
                    key={`${row.kind}:${row.slug}`}
                    className="flex items-baseline justify-between gap-2 py-1"
                  >
                    <Link
                      href={
                        row.kind === "event"
                          ? `/events/${row.slug}`
                          : `/djs/${row.slug}`
                      }
                      className="truncate text-[13px] font-semibold text-ink hover:underline"
                    >
                      {row.name}
                    </Link>
                    <span className="mono shrink-0 text-[11px] text-muted2">
                      {row.fields.map(fieldShort).join(" · ")}
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
          })()
        )}
        {llm.identity.length > 0 ? (
          <div className="mt-3">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Identity QA
            </h3>
            {(() => {
              const head = llm.identity.slice(0, PREVIEW);
              const rest = llm.identity.slice(PREVIEW);
              const list = (items: typeof llm.identity) => (
                <ul className="divide-y divide-line border-y border-line">
                  {items.map((row) => (
                    <li
                      key={row.slug}
                      className="flex items-baseline justify-between gap-2 py-1"
                    >
                      <Link
                        href={`/djs/${row.slug}`}
                        className="truncate text-[13px] font-semibold text-ink hover:underline"
                      >
                        {row.name}
                      </Link>
                      <span className="mono shrink-0 text-[11px] text-muted2">
                        {identityLabel(row.cls)}
                        {row.sets ? ` · ${row.sets}s` : ""}
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

      <div id="lists">
      <QueueFold
        title="Fill thin lists"
        count={s.tracklistGaps.length}
        hint={`${s.sets.incomplete.toLocaleString()} thin/severe stored — only this-year or last-year chart/festival sets are a capture job (title year, not YouTube reupload date). Find a 1001 page already on the source (do not invent URLs). Wired 1001 seeds and weekly radio episodes are not this queue. Empty shells have no set page.`}
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
      </div>

      <div id="cues">
      <QueueFold
        title="ID cues"
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
      </QueueFold>
      </div>

      {s.topUnresolvedIds.length > 0 ? (
        <QueueFold
          title="Hottest unresolved labels"
          count={s.topUnresolvedIds.length}
          hint="Same ID work — labels that show up most often."
        >
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
        </QueueFold>
      ) : null}

      <div id="dj-handles">
        <QueueFold
          title="Pin handles"
          count={s.djs.missingHandleWithSets.length}
          hint="DJs with a set and no social/web handle. ★ current Top 100 first. Junk omitted."
        >
          <DjQueue
            rows={[...s.djs.missingHandleWithSets].sort(
              (a, b) => starFirst(a.slug) - starFirst(b.slug),
            )}
          />
        </QueueFold>
      </div>
      <div id="dj-art">
        <QueueFold
          title="Fill artwork"
          count={s.djs.noThumbWithSets.length}
          hint="DJs with a set and no image. ★ current Top 100 first."
        >
          <DjQueue
            rows={[...s.djs.noThumbWithSets].sort(
              (a, b) => starFirst(a.slug) - starFirst(b.slug),
            )}
          />
        </QueueFold>
      </div>

      <div id="festivals">
        <QueueFold
          title="Festivals without a set"
          count={health.festivals.gaps.length}
          hint="Link an official set. ★ current Top 100 first."
        >
          <PlaceGapQueue rows={health.festivals.gaps} />
        </QueueFold>
      </div>
      <div id="clubs">
        <QueueFold
          title="Clubs without a set"
          count={health.clubs.gaps.length}
          hint="Link an official set. ★ current Top 100 first."
        >
          <PlaceGapQueue rows={health.clubs.gaps} />
        </QueueFold>
      </div>

      {board.gaps.length > 0 ? (
        <QueueFold
          title="Festival edition gaps"
          count={board.gaps.length}
          hint="Curated editions still missing a dense set."
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
