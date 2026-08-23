import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Capture1001Client } from "@/components/Capture1001Client";
import { SetEntryLink } from "@/components/SetEntryLink";
import {
  LeftoverHostQueue,
  WeakSiteQueue,
} from "@/components/StatsPlaybook";
import { StatsEnrichCard } from "@/components/StatsEnrichCard";
import { StatsHealthCard, StatsMeter } from "@/components/StatsHealthCard";
import { loadActionsStatusFile } from "@/lib/actionsStatus";
import { capture1001StatsHref } from "@/lib/captureHref";
import { loadOperatorCaptureQueue } from "@/lib/captureQueue";
import { getCatalogStats } from "@/lib/catalogStats";
import { prisma } from "@/lib/db";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import { loadEnrichRunReport } from "@/lib/ingest/enrich/enrichRunReport";
import { pageMeta } from "@/lib/site";
import { getStatsHealth } from "@/lib/statsHealthData";

export const metadata: Metadata = pageMeta({
  title: "Stats",
  description:
    "Catalog health dashboard — DJs, festivals, clubs, sets, and the work left.",
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
    <details className="mt-1">
      <summary className="cursor-pointer text-[12px] text-muted hover:text-ink">
        {restCount} more
      </summary>
      <div className="mt-0.5">{children}</div>
    </details>
  );
}

function QueueFold({
  title,
  count,
  hint,
  open,
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
      className="mb-2 rounded-lg border border-line bg-panel px-2.5 py-1.5"
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[14px] font-bold tracking-tight">{title}</h2>
          <span className="mono text-[11px] text-muted2">
            {count.toLocaleString()}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted2">{hint}</p>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

function DjQueue({
  rows,
}: {
  rows: Array<{ slug: string; name: string; setCount: number; playCount: number }>;
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
          className="flex items-baseline justify-between gap-2 py-1"
        >
          <Link
            href={`/events/${row.slug}`}
            className="truncate text-[13px] font-semibold text-ink hover:underline"
          >
            {row.onChart ? "★ " : ""}
            {row.name}
          </Link>
          <Link
            href={capture1001StatsHref(row.name)}
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

export default async function StatsPage() {
  const [s, health, enrichReport, captureQueue] = await Promise.all([
    getCatalogStats(),
    getStatsHealth(),
    loadEnrichRunReport(prisma),
    loadOperatorCaptureQueue(20),
  ]);
  const actionsStatus = loadActionsStatusFile();
  const top100 = loadDjMagTop100RankBySlug();
  const starFirst = (slug: string) => (top100.has(slug) ? 0 : 1);
  const cueTotal = health.sets.identified.reduce((n, row) => n + row.count, 0);
  const playbackTotal = health.sets.playback.reduce(
    (n, row) => n + row.count,
    0,
  );
  const noPlayback = health.sets.playback.find((row) => row.key === "no_playback");

  return (
    <div>
      <div className="mb-3">
        <p className="eyebrow">Operator</p>
        <h1 className="mt-0.5 text-xl font-extrabold tracking-tight">
          Catalog health
        </h1>
        <p className="mono mt-0.5 text-[11px] text-amber">{health.chartNote}</p>
        <p className="mono text-[11px] text-muted2">
          This export
          {process.env.NEXT_PUBLIC_APP_VERSION
            ? ` · v${process.env.NEXT_PUBLIC_APP_VERSION}`
            : ""}
          {" · last ship, not a live crawl"}
        </p>
      </div>

      <StatsEnrichCard report={enrichReport} actions={actionsStatus} />

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
        actions={[
          ...health.sets.actions,
          ...(captureQueue.presets.length
            ? [
                {
                  href: "#capture-1001",
                  label: "Capture 1001",
                  count: captureQueue.presets.length,
                },
              ]
            : []),
        ]}
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
        <p className="mt-2 text-[11px] text-muted2">
          No playback has no button — wait for an official full-set upload.
        </p>
      </StatsHealthCard>
      <StatsHealthCard
        id="tracks"
        noun="Tracks"
        total={health.tracks.total}
        hint="Songs, not sets · chips stay visible; search shrinks as /track URLs fill"
        slices={health.tracks.slices}
        actions={health.tracks.actions}
      >
        <StatsMeter
          label="Spotify"
          slices={health.tracks.spotify}
          total={health.tracks.total}
        />
      </StatsHealthCard>

      <p className="mb-2 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
        Queues
      </p>

      <div id="leftover-hosts">
        <QueueFold
          title="Leftover hosts"
          count={health.playbook.leftoverHosts.length}
          hint="Set / film / event titles stored as DJs. Relink the sets, then drop the row. Not LLM handle work."
        >
          <LeftoverHostQueue rows={health.playbook.leftoverHosts} />
        </QueueFold>
      </div>
      <div id="weak-sites">
        <QueueFold
          title="Weak chart websites"
          count={health.playbook.weakSites.length}
          hint="Official www only. DJ Mag, 6am, Wikipedia, RA, Techno Music World, DICE, and Shotgun are not the homepage. RA / TMW are tour or bio seeds — do not pin them as www."
        >
          <WeakSiteQueue rows={health.playbook.weakSites} />
        </QueueFold>
      </div>
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
      <div id="lists">
        <QueueFold
          title="Fill thin lists"
          count={s.tracklistGaps.length}
          hint="This-year / last-year chart sets with a thin list. Do not invent 1001 URLs."
        >
          <ul className="divide-y divide-line border-y border-line">
            {s.tracklistGaps.slice(0, PREVIEW).map((row) => (
              <li key={row.slug} className="py-1">
                {row.hasSetPage ? (
                  <SetEntryLink
                    href={`/sets/${row.slug}`}
                    label="Stats"
                    className="text-[13px] font-semibold text-ink hover:underline"
                  >
                    {row.title}
                  </SetEntryLink>
                ) : (
                  <span className="text-[13px] font-semibold text-ink">
                    {row.title}
                  </span>
                )}
                <div className="mono truncate text-[11px] text-muted2">
                  {[row.primaryDj, row.reason].filter(Boolean).join(" · ")}
                </div>
              </li>
            ))}
          </ul>
          <MoreFold restCount={Math.max(0, s.tracklistGaps.length - PREVIEW)}>
            <ul className="divide-y divide-line border-y border-line">
              {s.tracklistGaps.slice(PREVIEW).map((row) => (
                <li key={row.slug} className="py-1">
                  <span className="text-[13px] font-semibold text-ink">
                    {row.title}
                  </span>
                </li>
              ))}
            </ul>
          </MoreFold>
        </QueueFold>
      </div>
      <div id="cues">
        <QueueFold
          title="ID cues"
          count={s.sets.needsIds}
          hint="Lowest identified share first."
        >
          <ul className="divide-y divide-line border-y border-line">
            {s.needsIdsSets.slice(0, PREVIEW).map((row) => (
              <li key={row.slug} className="py-1">
                <SetEntryLink
                  href={`/sets/${row.slug}`}
                  label="Stats"
                  className="text-[13px] font-semibold text-ink hover:underline"
                >
                  {row.title}
                </SetEntryLink>
                <div className="mono truncate text-[11px] text-muted2">
                  {[
                    row.primaryDj,
                    `${Math.round(row.identifiedRatio * 100)}% ID`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </li>
            ))}
          </ul>
        </QueueFold>
      </div>
      <div id="capture-1001" className="scroll-mt-20">
        <QueueFold
          title="Capture 1001"
          count={captureQueue.presets.length}
          hint="Overlay clocks onto existing YT/SC sets. Bookmarklet + ranked queue. Do not invent 1001 URLs."
          open
        >
          <Suspense fallback={null}>
            <Capture1001Client
              presets={captureQueue.presets}
              generatedAt={captureQueue.generatedAt}
            />
          </Suspense>
        </QueueFold>
      </div>
    </div>
  );
}
