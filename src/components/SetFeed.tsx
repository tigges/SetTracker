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
  isRadarCandidate,
  pickRadarPicks,
} from "@/lib/feedPriority";
import {
  collapseHostTwins,
  groupByDeepWeek,
  identifiedRatio,
} from "@/lib/feedQuality";
import { setMatchesGenreFilter } from "@/lib/genreFamilies";
import {
  festivalSeasonSets,
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

type FeedPrefs = {
  genre: string;
};

const DEFAULT_PREFS: FeedPrefs = {
  genre: "all",
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
      genre: typeof parsed.genre === "string" ? parsed.genre : "all",
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

/**
 * Homepage feed:
 * New this week → Festival season → Popular sets → In-demand DJs / Top events →
 * Radar picks → Deep catalog.
 * Quality queues live on /stats, not as consumer filters.
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
          .map((s) => ({ ...s, primaryDjSlug: s.primaryDj?.slug ?? null })),
      ),
    );
  }, [feed, prefs.genre]);

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
    const pool = rest.filter(isRadarCandidate).map((s) => ({
      ...s,
      primaryDjSlug: s.primaryDj?.slug ?? null,
      identifiedRatio: identifiedRatio(s.statusCounts),
    }));
    const radarPicks = pickRadarPicks(pool, CLUSTER);
    for (const s of radarPicks) used.add(s.id);

    const deepSorted = filtered
      .filter((s) => !used.has(s.id))
      .sort(compareFeedPriority);
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
  }, [filtered, visible]);

  const deepGroups = useMemo(() => groupByDeepWeek(deepShown), [deepShown]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="mono text-[12px] text-muted2">
          {filtered.length} sets
        </span>
        <GenreFilter
          genres={genres}
          value={prefs.genre}
          onChange={(genre) => patchPrefs({ genre })}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted2">
          No sets match this genre.
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
