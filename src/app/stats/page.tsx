import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Capture1001Client } from "@/components/Capture1001Client";
import { OpenFoldWhenQuery } from "@/components/OpenFoldWhenQuery";
import {
  LeftoverHostQueue,
  WeakSiteQueue,
} from "@/components/StatsPlaybook";
import { StatsEnrichCard } from "@/components/StatsEnrichCard";
import { StatsLlmCard } from "@/components/StatsLlmCard";
import { StatsNotesLink } from "@/components/StatsNotesLink";
import { StatsHealthCard, StatsMeter } from "@/components/StatsHealthCard";
import { StatsNewSetsCard } from "@/components/StatsNewSetsCard";
import { loadActionsStatusFile } from "@/lib/actionsStatus";
import { capture1001StatsHref } from "@/lib/captureHref";
import { loadOperatorCaptureQueue } from "@/lib/captureQueue";
import { buildCapturePreflightIndex } from "@/lib/ingest/capturePreflight";
import { loadKnown1001ArchiveRows } from "@/lib/ingest/known1001Archive";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "@/lib/ingest/tracklists1001/festival2026";
import { CAPTURE_QUEUE_LIMIT } from "@/lib/ingest/captureQueueLimits";
import { getCatalogStats } from "@/lib/catalogStats";
import { getStatsNewSets } from "@/lib/statsNewSets";
import { prisma } from "@/lib/db";
import { loadDjMagTop100RankBySlug } from "@/lib/djmagTop100";
import {
  loadEnrichRunReport,
  loadEnrichSpendLedger,
} from "@/lib/ingest/enrich/enrichRunReport";
import { loadLlmResearchStats } from "@/lib/llmResearchStats";
import { pageMeta } from "@/lib/site";
import { clockSourceSlices } from "@/lib/statsHealth";
import { getStatsHealth } from "@/lib/statsHealthData";
import { estimateLlmSpend, formatLlmSpend } from "@/lib/ingest/discovery/llmCost";
import {
  mergeDjCompleteQueue,
  mergePlaceGapQueue,
  queueFollowUpHint,
  queueFollowUpLabel,
  type QueueFollowUp,
} from "@/lib/statsQueues";

const LLM_QUEUE_ESTIMATE = estimateLlmSpend({
  jobs: ["handles", "events", "quality"],
  limit: 24,
  providers: ["gemini"],
});

const FOLLOW_UP_PILL: Record<QueueFollowUp, string> = {
  auto: "border-teal/40 bg-teal/10 text-teal",
  operator: "border-amber/40 bg-amber/10 text-amber",
  both: "border-line bg-bg2 text-muted",
};

const FOLLOW_UP_FOLD: Record<QueueFollowUp, string> = {
  auto: "border-l-teal",
  operator: "border-l-amber",
  both: "border-l-muted2",
};

export const metadata: Metadata = pageMeta({
  title: "Stats",
  description:
    "Catalog health dashboard — DJs, festivals, clubs, sets, and the work left.",
  path: "/stats",
  robots: { index: false, follow: false },
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
  followUp,
  children,
}: {
  title: string;
  count: number;
  hint: string;
  open?: boolean;
  followUp: QueueFollowUp;
  children: ReactNode;
}) {
  return (
    <details
      open={open}
      className={`mb-2 rounded-lg border border-line border-l-[3px] bg-panel px-2.5 py-1.5 ${FOLLOW_UP_FOLD[followUp]}`}
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <h2 className="text-[14px] font-bold tracking-tight">{title}</h2>
            <span
              className={`inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${FOLLOW_UP_PILL[followUp]}`}
              title={queueFollowUpHint(followUp)}
            >
              {queueFollowUpLabel(followUp)}
            </span>
          </div>
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

function NeedPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`mono flex-none rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] ${className}`}
    >
      {label}
    </span>
  );
}

function DjCompleteQueue({
  rows,
}: {
  rows: ReturnType<typeof mergeDjCompleteQueue>;
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
          <div className="flex min-w-0 items-baseline gap-1.5">
            {d.needsHandle ? (
              <NeedPill label="handle" className={FOLLOW_UP_PILL.auto} />
            ) : null}
            {d.needsArt ? (
              <NeedPill label="art" className={FOLLOW_UP_PILL.auto} />
            ) : null}
            <Link
              href={`/djs/${d.slug}`}
              className="truncate text-[13px] font-semibold text-ink hover:underline"
            >
              {d.name}
            </Link>
          </div>
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
  rows: ReturnType<typeof mergePlaceGapQueue>;
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
          key={`${row.kind}-${row.slug}`}
          className="flex items-baseline justify-between gap-2 py-1"
        >
          <div className="flex min-w-0 items-baseline gap-1.5">
            <NeedPill
              label={row.kind === "festival" ? "fest" : "club"}
              className={FOLLOW_UP_PILL.operator}
            />
            <Link
              href={`/events/${row.slug}`}
              className="truncate text-[13px] font-semibold text-ink hover:underline"
            >
              {row.onChart ? "★ " : ""}
              {row.name}
            </Link>
          </div>
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
  const [s, health, enrichReport, enrichLedger, captureQueue, newSets] =
    await Promise.all([
      getCatalogStats(),
      getStatsHealth(),
      loadEnrichRunReport(prisma),
      loadEnrichSpendLedger(prisma),
      loadOperatorCaptureQueue(),
      getStatsNewSets(),
    ]);
  const capturePreflight = buildCapturePreflightIndex(
    TRACKLIST_1001_BY_SOURCE_SLUG,
    loadKnown1001ArchiveRows(),
  );
  // The queue carries a reserve past the display limit so a parked row promotes
  // its replacement in the browser; the fold counts what an operator can see.
  const captureQueueOpen = Math.min(
    captureQueue.presets.length,
    CAPTURE_QUEUE_LIMIT,
  );
  const actionsStatus = loadActionsStatusFile();
  const llmStats = loadLlmResearchStats();
  const top100 = loadDjMagTop100RankBySlug();
  const starFirst = (slug: string) => (top100.has(slug) ? 0 : 1);
  const cueTotal = health.sets.identified.reduce((n, row) => n + row.count, 0);
  const playbackTotal = health.sets.playback.reduce(
    (n, row) => n + row.count,
    0,
  );
  const noPlayback = health.sets.playback.find((row) => row.key === "no_playback");
  const clockSources = clockSourceSlices(s.plays.byProvenance);
  const clockTotal = clockSources.reduce((n, row) => n + row.count, 0);
  const djComplete = mergeDjCompleteQueue(
    s.djs.missingHandleWithSets,
    s.djs.noThumbWithSets,
    starFirst,
  );
  const handleCount = djComplete.filter((d) => d.needsHandle).length;
  const artCount = djComplete.filter((d) => d.needsArt).length;
  const placeGaps = mergePlaceGapQueue(
    health.festivals.gaps,
    health.clubs.gaps,
  );

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

      <div className="mb-3 rounded-lg border border-line bg-panel px-2.5 py-2">
        <p className="text-[12px] font-semibold text-ink">Detection funnel</p>
        <p className="mono mt-1 text-[11px] text-muted2">
          {s.detection.ingested.toLocaleString()} ingested ·{" "}
          {s.detection.withPlayback.toLocaleString()} playback ·{" "}
          {s.detection.withList.toLocaleString()} with a list ·{" "}
          {s.detection.empty.toLocaleString()} empty
        </p>
        <p className="mono mt-0.5 text-[11px] text-muted2">
          {s.detection.festival} festival · {s.detection.club} club ·{" "}
          {s.detection.livestream} livestream · {s.detection.weeklyRadio} radio
          · {s.detection.communityResolved} community IDs
        </p>
      </div>

      <StatsNewSetsCard days={newSets} />

      <StatsEnrichCard
        report={enrichReport}
        ledger={enrichLedger}
        actions={actionsStatus}
      />
      <StatsLlmCard stats={llmStats} />

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
        actions={
          captureQueueOpen
            ? [
                {
                  href: "#capture-1001",
                  label: "Capture 1001",
                  count: captureQueueOpen,
                },
              ]
            : []
        }
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
        {clockTotal > 0 ? (
          <StatsMeter
            label="Clock source"
            slices={clockSources}
            total={clockTotal}
          />
        ) : null}
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

      <div className="mb-2 mt-5 flex items-baseline gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          Queues
        </p>
        <StatsNotesLink hash="queues" />
      </div>

      <div id="capture-1001" className="scroll-mt-20">
        <span id="workbench" />
        <span id="lists" />
        <span id="cues" />
        <QueueFold
          title="Capture 1001"
          count={captureQueueOpen}
          hint="Official playback · no 1001 list. This year only · ★ Top 100 nights first."
          followUp="operator"
        >
          <Suspense fallback={null}>
            <OpenFoldWhenQuery />
          </Suspense>
          <Suspense fallback={null}>
            <Capture1001Client
              presets={captureQueue.presets}
              generatedAt={captureQueue.generatedAt}
              preflight={capturePreflight}
            />
          </Suspense>
        </QueueFold>
      </div>
      <div id="dj-complete" className="scroll-mt-20">
        <span id="dj-handles" />
        <span id="dj-art" />
        <QueueFold
          title="DJ complete"
          count={djComplete.length}
          hint={`${handleCount} handle · ${artCount} art. ★ current Top 100 first. Junk omitted. LLM handles: ${formatLlmSpend(LLM_QUEUE_ESTIMATE)}.`}
          followUp="auto"
        >
          <DjCompleteQueue rows={djComplete} />
        </QueueFold>
      </div>
      <div id="places" className="scroll-mt-20">
        <span id="festivals" />
        <span id="clubs" />
        <QueueFold
          title="Places without a set"
          count={placeGaps.length}
          hint={`${health.festivals.gaps.length} festivals · ${health.clubs.gaps.length} clubs. Link an official set. ★ current Top 100 first.`}
          followUp="operator"
        >
          <PlaceGapQueue rows={placeGaps} />
        </QueueFold>
      </div>
      <div id="leftover-hosts">
        <QueueFold
          title="Leftover hosts"
          count={health.playbook.leftoverHosts.length}
          hint="Set / film / event titles stored as DJs. Relink the sets, then drop the row. Not LLM handle work."
          followUp="operator"
        >
          <LeftoverHostQueue rows={health.playbook.leftoverHosts} />
        </QueueFold>
      </div>
      <div id="weak-sites">
        <QueueFold
          title="Weak chart websites"
          count={health.playbook.weakSites.length}
          hint="Official www only. DJ Mag, 6am, Wikipedia, RA, Techno Music World, DICE, and Shotgun are not the homepage. RA / TMW are tour or bio seeds — do not pin them as www."
          followUp="both"
        >
          <WeakSiteQueue rows={health.playbook.weakSites} />
        </QueueFold>
      </div>
    </div>
  );
}
