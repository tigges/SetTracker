"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { GenreFilter } from "@/components/GenreFilter";
import { PopularRails } from "@/components/PopularRails";
import { SetCard } from "@/components/SetCard";
import {
  compareFeedPriority,
  dedupeNearDuplicates,
  diversifyByArtist,
  diversifyBySeries,
  pickRadarPicks,
} from "@/lib/feedPriority";
import {
  collapseHostTwins,
  compareNeedsIds,
  groupByDeepWeek,
  identifiedRatio,
  setMatchesTypeFilter,
  type FeedTypeFilter,
} from "@/lib/feedQuality";
import { setMatchesGenreFilter } from "@/lib/genreFamilies";
import {
  festivalSeasonSets,
  isCompleteTracklist,
  MIN_RAIL_SHOW,
  newThisWeekSets,
  popularDjsThisWeek,
  popularSetsThisWeek,
  popularVenuesThisWeek,
} from "@/lib/popularity";
import type { FeedItem } from "@/lib/queries";

/** Homepage clusters — 3×3 on desktop. */
const CLUSTER = 9;
/** Deep-catalog page size after the spotlight clusters. */
const PAGE_SIZE = 18;

const PREFS_KEY = "setradar.feedPrefs";

type FeedSort = "default" | "needs-ids";

type FeedPrefs = {
  completeOnly: boolean;
  type: FeedTypeFilter;
  genre: string;
  sort: FeedSort;
};

const DEFAULT_PREFS: FeedPrefs = {
  completeOnly: true,
  type: "all",
  genre: "all",
  sort: "default",
};

const prefsListeners = new Set<() => void>();

function subscribePrefs(onChange: () => void) {
  prefsListeners.add(onChange);
  return () => {
    prefsListeners.delete(onChange);
  };
}

function getPrefsRaw(): string {
  try {
    return localStorage.getItem(PREFS_KEY) ?? "";
  } catch {
    return "";
  }
}

function parsePrefs(raw: string): FeedPrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const parsed = JSON.parse(raw) as Partial<FeedPrefs>;
    return {
      completeOnly: parsed.completeOnly ?? true,
      type:
        parsed.type === "festival" || parsed.type === "radio" || parsed.type === "mix"
          ? parsed.type
          : "all",
      genre: typeof parsed.genre === "string" ? parsed.genre : "all",
      sort: parsed.sort === "needs-ids" ? "needs-ids" : "default",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(next: FeedPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  prefsListeners.forEach((l) => l());
}

/** Chart / complete / festival-linked sets for the Radar pool. */
function isRadarCandidate(s: FeedItem): boolean {
  if (!isCompleteTracklist(s)) return false;
  return (
    s.top100Rank != null ||
    s.festivalRank != null ||
    s.clubRank != null ||
    s.densitySeverity === "ok"
  );
}

/**
 * Homepage feed:
 * New this week → Popular sets → In-demand DJs (Top 100) / Top events →
 * Radar picks → Deep catalog.
 */
export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const prefsRaw = useSyncExternalStore(
    subscribePrefs,
    getPrefsRaw,
    () => "",
  );
  const prefs = useMemo(() => parsePrefs(prefsRaw), [prefsRaw]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  function patchPrefs(next: Partial<FeedPrefs>) {
    writePrefs({ ...prefs, ...next });
    setVisible(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    return collapseHostTwins(
      dedupeNearDuplicates(
        feed
          .filter((s) => setMatchesGenreFilter(s, prefs.genre))
          .filter((s) => setMatchesTypeFilter(s, prefs.type))
          .filter((s) => !prefs.completeOnly || isCompleteTracklist(s))
          .map((s) => ({ ...s, primaryDjSlug: s.primaryDj?.slug ?? null })),
      ),
    );
  }, [feed, prefs.genre, prefs.type, prefs.completeOnly]);

  const {
    newWeek,
    festivalSeason,
    popularWeek,
    popularDjs,
    popularVenues,
    radarPicks,
    deepShown,
    deepRemaining,
  } = useMemo(() => {
    const weekAll = diversifyByArtist(
      newThisWeekSets(filtered, CLUSTER).sort(compareFeedPriority),
      2,
    );
    const newWeek = weekAll.slice(0, CLUSTER);
    const used = new Set(newWeek.map((s) => s.id));

    let festivalSeason = festivalSeasonSets(filtered, CLUSTER).filter(
      (s) => !used.has(s.id),
    );
    if (festivalSeason.length < MIN_RAIL_SHOW) festivalSeason = [];
    for (const s of festivalSeason) used.add(s.id);

    let popularWeek = popularSetsThisWeek(filtered, CLUSTER).filter(
      (s) => !used.has(s.id),
    );
    if (popularWeek.length < MIN_RAIL_SHOW) popularWeek = [];
    for (const s of popularWeek) used.add(s.id);

    const popularDjs = popularDjsThisWeek(filtered, CLUSTER);
    const popularVenues = popularVenuesThisWeek(filtered, CLUSTER);

    const rest = filtered.filter((s) => !used.has(s.id));
    const preferred = rest.filter(isRadarCandidate);
    const filler = rest.filter((s) => !isRadarCandidate(s));
    const pool = [...preferred, ...filler].map((s) => ({
      ...s,
      primaryDjSlug: s.primaryDj?.slug ?? null,
      identifiedRatio: identifiedRatio(s.statusCounts),
    }));
    const radarPicks = pickRadarPicks(pool, CLUSTER);
    for (const s of radarPicks) used.add(s.id);

    const deepSorted = filtered
      .filter((s) => !used.has(s.id))
      .sort(
        prefs.sort === "needs-ids" ? compareNeedsIds : compareFeedPriority,
      );
    const deepAll = diversifyBySeries(diversifyByArtist(deepSorted, 1), 1);
    const deepShown = deepAll.slice(0, visible);
    return {
      newWeek,
      festivalSeason,
      popularWeek,
      popularDjs,
      popularVenues,
      radarPicks,
      deepShown,
      deepRemaining: deepAll.length - deepShown.length,
    };
  }, [filtered, visible, prefs.sort]);

  const deepGroups = useMemo(() => groupByDeepWeek(deepShown), [deepShown]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="mono text-[12px] text-muted2">
          {filtered.length} sets
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <TypeChips
            value={prefs.type}
            onChange={(type) => patchPrefs({ type })}
          />
          <button
            type="button"
            aria-pressed={prefs.completeOnly}
            onClick={() => patchPrefs({ completeOnly: !prefs.completeOnly })}
            className={`rounded-full border px-3 py-1 text-[12px] ${
              prefs.completeOnly
                ? "border-brand text-brand"
                : "border-line text-muted hover:border-[color:var(--muted2)]"
            }`}
          >
            Complete only
          </button>
          <button
            type="button"
            aria-pressed={prefs.sort === "needs-ids"}
            onClick={() =>
              patchPrefs({
                sort: prefs.sort === "needs-ids" ? "default" : "needs-ids",
              })
            }
            className={`rounded-full border px-3 py-1 text-[12px] ${
              prefs.sort === "needs-ids"
                ? "border-brand text-brand"
                : "border-line text-muted hover:border-[color:var(--muted2)]"
            }`}
          >
            Needs IDs
          </button>
          <GenreFilter
            genres={genres}
            value={prefs.genre}
            onChange={(genre) => patchPrefs({ genre })}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted2">
          No sets match this filter.
        </p>
      ) : (
        <>
          {newWeek.length > 0 && (
            <Section title="New this week" sets={newWeek} />
          )}
          {festivalSeason.length > 0 && (
            <Section title="Festival season" sets={festivalSeason} />
          )}
          {popularWeek.length > 0 && (
            <Section title="Popular sets" sets={popularWeek} />
          )}
          <PopularRails
            djs={popularDjs.length >= MIN_RAIL_SHOW ? popularDjs : []}
            venues={
              popularVenues.length >= MIN_RAIL_SHOW ? popularVenues : []
            }
          />
          {radarPicks.length > 0 && (
            <Section title="Radar picks" sets={radarPicks} />
          )}
          {deepGroups.map((group) => (
            <Section
              key={group.label}
              title={
                deepGroups.length === 1
                  ? "Deep catalog"
                  : `Deep catalog · ${group.label}`
              }
              sets={group.items}
            />
          ))}
          {deepRemaining > 0 && (
            <div className="flex justify-center pb-4">
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="rounded-full border border-line px-5 py-2 text-[13px] text-muted transition-colors hover:border-brand hover:text-brand"
              >
                Load more · {Math.min(PAGE_SIZE, deepRemaining)} of{" "}
                {deepRemaining} left
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TypeChips({
  value,
  onChange,
}: {
  value: FeedTypeFilter;
  onChange: (type: FeedTypeFilter) => void;
}) {
  return (
    <div
      className="flex overflow-hidden rounded-full border border-line"
      role="group"
      aria-label="Set type"
    >
      {(
        [
          ["all", "All"],
          ["festival", "Festival"],
          ["radio", "Radio"],
          ["mix", "Mix"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`px-2.5 py-1 text-[12px] ${
            value === id ? "bg-panel2 text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, sets }: { title: string; sets: FeedItem[] }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        <span className="mono text-[12px] text-muted2">{sets.length}</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((s) => (
          <SetCard key={s.id} set={s} />
        ))}
      </div>
    </section>
  );
}
